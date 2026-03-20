import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller';
import validateSchema from '../middlewares/validateSchema';
import { wrapAsync } from '../utils/wrapAsync';
import { createPlanSchema } from 'src/schemas/plan/planSchema';

const router = Router();
const planController = new PlanController();

router.post(
  '/plans',
  validateSchema(createPlanSchema),
  wrapAsync(planController.create.bind(planController)),
);

export default router;
