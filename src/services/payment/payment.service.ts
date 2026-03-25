import { PaymentRepository } from 'src/repositories/payment.repository';
import { PaymentProviderService } from './paymentProvider.service';
import { InvoiceRepository } from 'src/repositories/invoice.repository';
import { sequelize } from 'src/database/sequelize';
import { Transaction } from 'sequelize';

import { CreatePaymentDTO } from 'src/types/payment/dto/createPayment.dto';
import { PaymentStatus } from 'src/types/payment/paymentStatus.type';

import { AppError } from 'src/errors/AppError';
import { ErrorMessages } from 'src/errors/ErrorMessages';

export class PaymentService {
  private paymentRepository = new PaymentRepository();
  private paymentProviderService = new PaymentProviderService();
  private invoiceRepository = new InvoiceRepository();

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

      const providerResponse =
        await this.paymentProviderService.createPayment(createPaymentDTO);

      if (!providerResponse.success || !providerResponse.externalId) {
        await this.paymentRepository.updateStatus(payment.id, 'failed', trx);

        if (!externalTransaction) await trx.commit();

        return payment;
      }

      await this.paymentRepository.updateExternalData(
        payment.id,
        {
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

      await this.paymentRepository.updateStatus(
        payment.id,
        status,
        transaction,
      );

      if (status === 'paid') {
        await this.invoiceRepository.updateStatus(
          payment.invoiceId,
          'paid',
          transaction,
        );
      }

      await transaction.commit();

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
