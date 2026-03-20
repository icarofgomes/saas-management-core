// src/services/role.service.ts
import { RoleRepository } from '../repositories/role.repository';

export class RoleService {
  private roleRepository = new RoleRepository();

  async createRole(data: { role: string }) {
    // Aqui poderiam ser feitas validações ou manipulações antes de chamar o repositório
    return this.roleRepository.create(data);
  }

  async getRoleById(id: number) {
    return this.roleRepository.findById(id);
  }

  async getAllRoles() {
    return this.roleRepository.findAll();
  }
}
