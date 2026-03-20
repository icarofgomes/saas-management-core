import { Router } from 'express';
import { ParentController } from '../controllers/parent.controller';
import validateSchema from '../middlewares/validateSchema';
import {
  createParentSchema,
  updateParentSchema,
} from '../schemas/parent/parentSchema';
import { wrapAsync } from '../utils/wrapAsync';
import { authenticateToken } from 'src/middlewares/authenticateToken';

const router = Router();
const parentController = new ParentController();

router.post(
  '/parents',
  validateSchema(createParentSchema),
  wrapAsync(parentController.create.bind(parentController)),
);

router.get(
  '/parents/user/:userId',
  authenticateToken,
  wrapAsync(parentController.findByUserId.bind(parentController)),
);

router.put(
  '/parents/:userId',
  authenticateToken,
  validateSchema(updateParentSchema),
  wrapAsync(parentController.update.bind(parentController)),
);

export default router;
