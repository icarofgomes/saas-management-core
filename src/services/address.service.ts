import { sequelize } from '../database/sequelize';
import { AddressRepository } from '../repositories/address.repository';
import { AppError } from '../errors/AppError';
import { ErrorMessages } from '../errors/ErrorMessages';
import { Transaction } from 'sequelize';

export interface CreateAddressDTO {
  userId: string | null;
  street: string;
  number: number;
  complement?: string | null;
  neighborhood: string;
  city: string;
  zip: string;
  acronym: string;
  country?: string;
}

export type UpdateAddressDTO = Partial<Omit<CreateAddressDTO, 'userId'>>;

export class AddressService {
  constructor(private readonly repo = new AddressRepository()) {}

  async create(dto: CreateAddressDTO, t?: Transaction) {
    const data = { country: 'Brasil', ...dto };

    try {
      const result = await sequelize.transaction(async (t) => {
        const address = await this.repo.create(data, t);
        return { id: address.id };
      });
      return { status: 'CREATED', data: result.id };
    } catch (err) {
      throw new AppError({
        ...ErrorMessages.ADDRESS_CREATE_FAILED,
        details: err instanceof Error ? err.message : undefined,
      });
    }
  }

  async update(id: string, dto: UpdateAddressDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError(ErrorMessages.ADDRESS_NOT_FOUND);
    }

    try {
      await sequelize.transaction(async (t) => {
        await this.repo.update(id, dto, t);
      });

      return { status: 'SUCCESSFUL', data: { addressId: id, ...dto } };
    } catch (err) {
      throw new AppError({
        ...ErrorMessages.ADDRESS_UPDATE_FAILED,
        details: err instanceof Error ? err.message : undefined,
      });
    }
  }
}
