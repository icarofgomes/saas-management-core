import { PaymentRepository } from 'src/repositories/payment.repository';
import { PaymentProviderService } from './paymentProvider.service';
import { InvoiceRepository } from 'src/repositories/invoice.repository';
import { sequelize } from 'src/database/sequelize';
import { Transaction } from 'sequelize';

import { CreatePaymentDTO } from 'src/types/payment/dto/createPayment.dto';
import { PaymentStatus } from 'src/types/payment/paymentStatus.type';

import { AppError } from 'src/errors/AppError';
import { ErrorMessages } from 'src/errors/ErrorMessages';
import { logger } from 'src/utils/logger';
import { EventPublisher } from 'src/types/events/interfaces/eventPublisher.interface';
import { InMemoryPublisher } from 'src/events/inMemoryPublisher';

export class PaymentService {
  private paymentRepository = new PaymentRepository();
  private paymentProviderService = new PaymentProviderService();
  private invoiceRepository = new InvoiceRepository();
  private eventPublisher: EventPublisher;

  constructor(eventPublisher?: EventPublisher) {
    // Se não passar nada, usa dummy
    this.eventPublisher = eventPublisher || new InMemoryPublisher();
  }

  async requestPayment(invoiceId: string, transaction?: Transaction) {
    const externalTransaction = !!transaction;
    const trx = transaction || (await sequelize.transaction());

    try {
      const invoice = await this.invoiceRepository.findById(invoiceId, trx);

      if (!invoice) {
        throw new AppError(ErrorMessages.INVOICE_NOT_FOUND);
      }

      const createPaymentDTO: CreatePaymentDTO = {
        invoiceId: invoice.id,
        amount: Number(invoice.amount),
        dueDate: invoice.dueDate,
        customer: {
          name: 'Parent',
        },
      };

      const payment = await this.paymentRepository.create(
        {
          invoiceId: invoice.id,
          provider: 'pending',
          status: 'processing',
          amount: Number(invoice.amount),
        },
        trx,
      );

      const { provider, response: providerResponse } =
        await this.paymentProviderService.createPayment(createPaymentDTO);

      if (!providerResponse.success || !providerResponse.externalId) {
        await this.paymentRepository.updateStatus(payment.id, 'failed', trx);

        if (!externalTransaction) await trx.commit();

        return payment;
      }

      await this.paymentRepository.updateExternalData(
        payment.id,
        {
          provider,
          externalId: providerResponse.externalId,
          paymentUrl: providerResponse.paymentUrl,
          rawResponse: providerResponse.raw,
        },
        trx,
      );

      await this.paymentRepository.updateStatus(payment.id, 'pending', trx);

      if (!externalTransaction) await trx.commit();

      return payment;
    } catch (error) {
      if (!externalTransaction) await trx.rollback();
      throw error;
    }
  }

  async handleCallback(externalId: string, status: PaymentStatus) {
    const transaction = await sequelize.transaction();

    try {
      const payment = await this.paymentRepository.findByExternalId(externalId);

      if (!payment) {
        throw new AppError(ErrorMessages.PAYMENT_NOT_FOUND);
      }

      // Se já está pago, ignora qualquer coisa
      if (payment.status === 'paid') {
        await transaction.commit();

        logger.warn({
          type: 'PAYMENT_CALLBACK_IGNORED',
          reason: 'already_paid',
          externalId,
        });

        return { status: 'IGNORED_ALREADY_PAID' };
      }

      // Se for duplicado do mesmo status
      if (payment.status === status) {
        await transaction.commit();

        logger.warn({
          type: 'PAYMENT_CALLBACK_DUPLICATED',
          reason: 'same_status',
          externalId,
        });

        return { status: 'IGNORED_DUPLICATED' };
      }

      await this.paymentRepository.updateStatus(
        payment.id,
        status,
        transaction,
      );

      if (status === 'paid') {
        await this.invoiceRepository.markAsPaid(
          payment.invoiceId,
          new Date(),
          transaction,
        );
      }

      await transaction.commit();

      logger.info({
        type: 'PAYMENT_CALLBACK',
        externalId,
        previousStatus: payment.status,
        newStatus: status,
      });

      // 🚀 Publish event
      await this.eventPublisher.publish('payment_updated', {
        paymentId: payment.id,
        invoiceId: payment.invoiceId,
        status,
      });

      return { status: 'SUCCESS' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async resendPayment(invoiceId: string, provider?: string) {
    const transaction = await sequelize.transaction();

    try {
      const invoice = await this.invoiceRepository.findById(invoiceId);

      if (!invoice) {
        throw new AppError(ErrorMessages.INVOICE_NOT_FOUND);
      }

      await this.paymentRepository.cancelByInvoiceId(invoiceId, transaction);

      await transaction.commit();

      return this.requestPayment(invoiceId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findByInvoiceId(invoiceId: string) {
    const payments = await this.paymentRepository.findByInvoiceId(invoiceId);

    return {
      status: 'SUCCESS',
      data: payments || [],
    };
  }
}
