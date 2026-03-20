import { Teacher } from '../models/teacher.model';
import { User } from '../models/user.model';
import { Address } from '../models/address.model';
import { Op, Transaction } from 'sequelize';
import { AppError } from 'src/errors/AppError';
import { ErrorMessages } from 'src/errors/ErrorMessages';
import { Subject } from 'src/models/subject.model';

interface UpdateTeacherData {
  firstName: string;
  lastName: string;
}

export class TeacherRepository {
  async create(data: any, transaction?: Transaction) {
    return Teacher.create(data, { transaction });
  }
  async findByUserId(userId: string) {
    return Teacher.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: {
            exclude: ['id', 'roleId', 'password', 'createdAt', 'updatedAt'],
          },
          include: [
            {
              model: Address,
              as: 'addresses',
              attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
            },
          ],
        },
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] }, // remove os dados da tabela pivô
          attributes: ['id', 'subject'],
        },
      ],
    });
  }

  async findById(id: string) {
    return Teacher.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: {
            exclude: ['id', 'roleId', 'password', 'createdAt', 'updatedAt'],
          },
          include: [
            {
              model: Address,
              as: 'addresses',
              attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
            },
          ],
        },
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] },
          attributes: ['id', 'subject'],
        },
      ],
    });
  }

  async findAll(searchTerm = '') {
    const whereClause = searchTerm
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${searchTerm}%` } },
            { lastName: { [Op.like]: `%${searchTerm}%` } },
            // Sequelize.literal para CONCAT
            Teacher.sequelize!.literal(
              `CONCAT(firstName, ' ', lastName) LIKE '%${searchTerm}%'`,
            ),
          ],
        }
      : {};

    return Teacher.findAll({
      attributes: ['id', 'firstName', 'lastName'],
      where: whereClause,
    });
  }

  async update(userId: string, data: UpdateTeacherData) {
    const teacher = await Teacher.findOne({ where: { userId } });
    if (!teacher) return null;

    await teacher.update(data);
    return teacher;
  }

  async setSubjects(
    teacherId: string,
    subjectIds: number[],
    transaction?: Transaction,
  ) {
    const teacher = await Teacher.findByPk(teacherId, { transaction });

    if (!teacher) {
      throw new AppError(ErrorMessages.TEACHER_NOT_FOUND);
    }

    await teacher.setSubjects(subjectIds, { transaction });
  }
}
