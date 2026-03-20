// src/routes/sale.routes.ts
import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import validateSchema from '../middlewares/validateSchema';
import { wrapAsync } from '../utils/wrapAsync';
import { createSaleSchema } from 'src/schemas/sale/saleSchema';

const router = Router();
const saleController = new SaleController();

router.post(
  '/sales',
  validateSchema(createSaleSchema),
  wrapAsync(saleController.create.bind(saleController)),
);

export default router;
