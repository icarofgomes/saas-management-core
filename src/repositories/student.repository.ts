import { Student } from '../models/student.model';
import { User } from '../models/user.model';
import { Op, Sequelize } from 'sequelize';

export class StudentRepository {
  async findAll(searchTerm: string = '') {
    const whereClause = searchTerm
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${searchTerm}%` } },
            { lastName: { [Op.like]: `%${searchTerm}%` } },
            Sequelize.literal(
              `CONCAT(firstName, ' ', lastName) LIKE '%${searchTerm}%'`,
            ),
          ],
        }
      : {};

    return Student.findAll({
      attributes: ['id', 'firstName', 'lastName'],
      where: whereClause,
    });
  }

  async findById(id: string) {
    return Student.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: {
            exclude: ['password', 'roleId', 'createdAt', 'updatedAt', 'id'],
          },
        },
      ],
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
  }

  async findByUserId(userId: string) {
    return Student.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: {
            exclude: ['password', 'roleId', 'createdAt', 'updatedAt', 'id'],
          },
        },
      ],
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
  }

  async create(studentData: any, transaction: any) {
    return Student.create(studentData, { transaction });
  }

  async updateById(id: string, updates: any) {
    return Student.update(updates, { where: { id } });
  }
}
