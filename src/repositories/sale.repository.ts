import models from '../models';
import { Transaction } from 'sequelize';

export class SaleRepository {
  async create(
    data: {
      parentId: string;
      planId: string;
      unitId: string;
      startMonth: Date;
      endMonth: Date;
      totalAmount: number;
    },
    transaction?: Transaction,
  ) {
    return models.Sale.create(data, { transaction });
  }

  async findById(id: string) {
    return models.Sale.findByPk(id);
  }
}
