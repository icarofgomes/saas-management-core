import db from '../models';

const { Role } = db;

export class RoleRepository {
  async create(data: { role: string }) {
    return Role.create(data);
  }

  async findById(id: number) {
    return Role.findByPk(id);
  }

  async findAll() {
    return Role.findAll();
  }

  async findByName(roleName: string) {
    return Role.findOne({ where: { role: roleName } });
  }
}
