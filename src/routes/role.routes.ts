// src/routes/role.routes.ts
import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { wrapAsync } from '../utils/wrapAsync';
import { authenticateToken } from 'src/middlewares/authenticateToken';

const router = Router();
const roleController = new RoleController();

// Rota para criar uma nova Role
router.post(
  '/roles',
  authenticateToken,
  wrapAsync(roleController.create.bind(roleController)),
);

// Rota para buscar uma Role pelo ID
router.get(
  '/roles/:id',
  wrapAsync(roleController.getById.bind(roleController)),
);

// Rota para listar todas as Roles
router.get('/roles', wrapAsync(roleController.getAll.bind(roleController)));

export default router;
