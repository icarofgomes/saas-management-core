import { UserAttributes } from 'src/types/User';
import db from '../models';

const { User } = db;

export class UserRepository {
  async create(data: any) {
    return User.create(data);
  }

  async findById(id: string) {
    return User.findByPk(id);
  }

  async findAll() {
    return User.findAll();
  }

  async markEmailAsVerified(userId: string) {
    const user = await this.findById(userId);
    if (!user) return null;

    user.emailVerified = true;
    await user.save();
    return user;
  }

  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  async findByCpf(cpf: string) {
    return User.findOne({ where: { cpf } });
  }

  async findByPhoneNumber(phoneNumber: string) {
    return User.findOne({ where: { phoneNumber } });
  }

  async updateById(
    id: string,
    updates: Partial<UserAttributes>,
  ): Promise<void> {
    await User.update(updates, {
      where: { id },
    });
  }
}
