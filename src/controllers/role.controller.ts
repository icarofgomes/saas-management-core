// src/controllers/role.controller.ts
import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';

const roleService = new RoleService();

export class RoleController {
  // Criar uma nova Role
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { role: userRole } = req.user!;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      const role = await roleService.createRole(req.body);
      res.status(201).json(role);
    } catch (error) {
      next(error);
    }
  }

  // Buscar uma Role pelo ID
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.getRoleById(Number(req.params.id)); // Garantir que o id seja um número
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      res.json(role);
    } catch (error) {
      next(error);
    }
  }

  // Buscar todas as Roles
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleService.getAllRoles();
      res.json(roles);
    } catch (error) {
      next(error);
    }
  }
}
