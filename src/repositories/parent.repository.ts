// src/repositories/parent.repository.ts
import models from '../models';

export class ParentRepository {
  async create(data: any, transaction?: any) {
    return models.Parent.create(data, { transaction });
  }

  async findByUserId(userId: string) {
    return models.Parent.findOne({
      where: { userId },
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: {
            exclude: ['id', 'roleId', 'password', 'createdAt', 'updatedAt'],
          },
          include: [
            // Aqui incluímos o endereço do usuário
            {
              model: models.Address,
              as: 'addresses',
              attributes: [
                'id',
                'street',
                'number',
                'complement',
                'neighborhood',
                'zip',
                'city',
                'acronym',
                'country',
              ],
            },
          ],
        },
        {
          model: models.Student,
          as: 'students', // Relacionamento definido em Parent.hasMany(models.Student)
          attributes: [
            'id',
            'firstName',
            'lastName',
            'school',
            'grade',
            'cycle',
          ], // Escolher os atributos que deseja trazer
        },
      ],
    });
  }

  async findByPk(id: string) {
    return models.Parent.findByPk(id);
  }

  async findAll() {
    return models.Parent.findAll();
  }

  async update(userId: string, data: any) {
    return models.Parent.update(data, {
      where: { userId },
    });
  }
}
