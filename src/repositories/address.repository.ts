import {
  AddressCreationAttributes,
  AddressUpdateAttributes,
} from '../types/Address';
import { Address } from '../models/address.model';
import { Transaction } from 'sequelize';

export class AddressRepository {
  create(data: AddressCreationAttributes, t?: Transaction) {
    return Address.create(data, { transaction: t });
  }

  update(id: string, data: AddressUpdateAttributes, t?: Transaction) {
    return Address.update(data, { where: { id }, transaction: t });
  }

  findById(id: string) {
    return Address.findByPk(id);
  }
}
