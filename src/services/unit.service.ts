import { UnitRepository } from 'src/repositories/unit.repository';
import { UserService } from './user.service';
import { sequelize } from '../database/sequelize';
import slugify from 'slugify';
import { AppError } from 'src/errors/AppError';
import { ErrorMessages } from 'src/errors/ErrorMessages';

interface CreateUnitDTO {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  cpf: string;
  maxRooms: string;
}

export class UnitService {
  private unitRepository = new UnitRepository();
  private userService = new UserService();

  async createUnit(data: CreateUnitDTO) {
    const transaction = await sequelize.transaction();

    try {
      const slug = slugify(data.name, {
        lower: true,
        strict: true,
        locale: 'pt',
      });

      const existingUnit = await this.unitRepository.findBySlug(slug);
      if (existingUnit) {
        throw new AppError(ErrorMessages.UNIT_ALREADY_EXISTS);
      }

      const user = await this.userService.createUserWithVerificationToken({
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        roleName: 'unit',
        cpf: data.cpf,
      });

      const unit = await this.unitRepository.create(
        {
          name: data.name,
          slug,
          userId: user.id,
          maxRooms: data.maxRooms,
        },
        transaction,
      );

      await transaction.commit();

      return {
        status: 'CREATED',
        data: {
          unitId: unit.id,
          userId: user.id,
          token: user.token,
        },
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
