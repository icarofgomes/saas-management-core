import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { authenticateToken } from '../middlewares/authenticateToken';
import validateSchema from '../middlewares/validateSchema';
import { wrapAsync } from '../utils/wrapAsync';
import { updateAddressSchema } from 'src/schemas/address/addressSchema';

const router = Router();
const controller = new AddressController();

router.put(
  '/addresses/:id',
  authenticateToken,
  validateSchema(updateAddressSchema),
  wrapAsync(controller.update.bind(controller)),
);

export default router;
