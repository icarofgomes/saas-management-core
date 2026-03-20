import models from '../models';

export class UnitRepository {
  async create(data: any, transaction?: any) {
    return models.Unit.create(data, { transaction });
  }

  async findByUserId(userId: string) {
    return models.Unit.findOne({
      where: { userId },
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: {
            exclude: ['password', 'roleId', 'createdAt', 'updatedAt'],
          },
        },
      ],
    });
  }

  async findById(id: string) {
    return models.Unit.findByPk(id);
  }

  async findAll() {
    return models.Unit.findAll();
  }

  async update(userId: string, data: any) {
    return models.Unit.update(data, {
      where: { userId },
    });
  }

  async findBySlug(slug: string) {
    return models.Unit.findOne({ where: { slug } });
  }
}
