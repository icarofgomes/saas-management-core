import models from '../models';
import { Transaction } from 'sequelize';

export class PlanRepository {
  async create(
    data: {
      name: string;
      description?: string;
      price: number;
      durationMonths: number;
    },
    transaction?: Transaction,
  ) {
    return models.Plan.create(data, { transaction });
  }

  async findById(id: string) {
    return models.Plan.findByPk(id);
  }
}
