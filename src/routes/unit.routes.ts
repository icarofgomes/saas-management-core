import { Router } from 'express';
import { UnitController } from '../controllers/unit.controller';
import validateSchema from '../middlewares/validateSchema';
import { wrapAsync } from '../utils/wrapAsync';
import { createUnitSchema } from 'src/schemas/unit/unitSchema';

const router = Router();
const unitController = new UnitController();

// Rota para criar a unidade
router.post(
  '/units',
  validateSchema(createUnitSchema),
  wrapAsync(unitController.create.bind(unitController)),
);

export default router;
