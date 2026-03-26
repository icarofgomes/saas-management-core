import { PaymentStatus } from 'src/types/payment/paymentStatus.type';
import models from '../models';
import { Transaction } from 'sequelize';

export class PaymentRepository {
  async create(
    data: {
      invoiceId: string;
      provider: string | null;
      externalId?: string | null;
      status?: PaymentStatus;
      amount: number;
      paymentUrl?: string | null;
      rawResponse?: any;
    },
    transaction?: Transaction,
  ) {
    return models.Payment.create(data, { transaction });
  }

  async findById(id: string) {
    return models.Payment.findByPk(id);
  }

  async findByExternalId(externalId: string) {
    return models.Payment.findOne({
      where: { externalId },
    });
  }

  async findByInvoiceId(invoiceId: string) {
    return models.Payment.findAll({
      where: { invoiceId },
      order: [['createdAt', 'DESC']],
    });
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled',
    transaction?: Transaction,
  ) {
    return models.Payment.update(
      { status },
      {
        where: { id },
        transaction,
      },
    );
  }

  async updateExternalData(
    id: string,
    data: {
      provider: string;
      externalId?: string;
      paymentUrl?: string;
      rawResponse?: any;
    },
    transaction?: Transaction,
  ) {
    return models.Payment.update(data, {
      where: { id },
      transaction,
    });
  }

  async cancelByInvoiceId(invoiceId: string, transaction?: Transaction) {
    return models.Payment.update(
      { status: 'cancelled' },
      {
        where: {
          invoiceId,
          status: ['pending', 'processing'],
        },
        transaction,
      },
    );
  }
}
