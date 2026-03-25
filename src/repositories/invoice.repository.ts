import models from '../models';
import { Transaction } from 'sequelize';

export class InvoiceRepository {
  async create(
    data: {
      saleId: string;
      parentId: string;
      month: Date | string;
      amount: number;
      status?: 'pending' | 'paid' | 'overdue';
      dueDate: Date | string;
      paidDate?: Date | string | null;
    },
    transaction?: Transaction,
  ) {
    return models.Invoice.create(data, { transaction });
  }

  async findById(id: string, transaction?: Transaction) {
    return models.Invoice.findByPk(id, { transaction });
  }

  async findAllByParentId(parentId: string) {
    return models.Invoice.findAll({
      where: { parentId },
      attributes: ['id', 'month', 'amount', 'status', 'dueDate', 'paidDate'], // somente o necessário
      include: [
        {
          model: models.Sale,
          as: 'sale',
          attributes: ['id'], // Não inclui dados de 'sale'
          include: [
            {
              model: models.Plan,
              as: 'plan',
              attributes: ['name'], // Inclui somente o nome do plano
            },
          ],
        },
      ],
    });
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'paid' | 'overdue',
    transaction?: Transaction,
  ) {
    return models.Invoice.update(
      { status },
      {
        where: { id },
        transaction,
      },
    );
  }

  async markAsPaid(
    id: string,
    paidDate: Date | string = new Date(),
    transaction?: Transaction,
  ) {
    return models.Invoice.update(
      {
        status: 'paid',
        paidDate,
      },
      {
        where: { id },
        transaction,
      },
    );
  }
}
