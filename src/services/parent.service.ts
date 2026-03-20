// src/services/parent.service.ts
import { ParentRepository } from '../repositories/parent.repository';
import { UserService } from './user.service';
import { sequelize } from '../database/sequelize';
import { AppError } from 'src/errors/AppError';
import { ErrorMessages } from 'src/errors/ErrorMessages';
import { AddressService } from './address.service';

interface CreateParentDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  cpf?: string;
  street: string;
  number: number;
  complement?: string;
  neighborhood: string;
  zip: string;
  city: string;
  acronym: string;
  unitId: string;
}

interface UpdateParentDTO {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export class ParentService {
  private parentRepository = new ParentRepository();
  private userService = new UserService();
  private addressService = new AddressService();

  private async ensureCanModify(
    userId: string,
    authenticatedEmail: string,
    role: string,
  ) {
    if (role === 'admin') return;

    await this.userService.validateUser({
      userId,
      userEmail: authenticatedEmail,
    });
  }

  async createParent(data: CreateParentDTO) {
    const transaction = await sequelize.transaction();

    try {
      const user = await this.userService.createUserWithVerificationToken({
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        cpf: data.cpf,
        roleName: 'parent',
      });

      await this.addressService.create(
        {
          userId: user.id,
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          zip: data.zip,
          city: data.city,
          acronym: data.acronym,
        },
        transaction,
      );

      await this.parentRepository.create(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          balance: 0,
          userId: user.id,
          unitId: data.unitId,
        },
        transaction,
      );

      await transaction.commit();

      return {
        status: 'CREATED',
        data: { token: user.token, userId: user.id },
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findByUserId(userId: string, authenticatedEmail: string) {
    await this.userService.validateUser({
      userId,
      userEmail: authenticatedEmail,
    });

    const parent = await this.parentRepository.findByUserId(userId);
    if (!parent) {
      throw new AppError(ErrorMessages.PARENT_NOT_FOUND);
    }

    return parent;
  }

  async updateParent({
    userId,
    firstName,
    lastName,
    email: authenticatedEmail,
    role,
  }: UpdateParentDTO) {
    await this.ensureCanModify(userId, authenticatedEmail, role);

    const parent = await this.parentRepository.update(userId, {
      firstName,
      lastName,
    });

    if (!parent) throw new AppError(ErrorMessages.PARENT_NOT_FOUND);

    return {
      status: 'SUCCESSFUL',
      data: { userId, firstName, lastName },
    };
  }
}
