import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { wrapAsync } from '../utils/wrapAsync';

const router = Router();
const invoiceController = new InvoiceController();

// Rota para buscar todas as invoices de um parentId
router.get(
  '/invoices/parent/:parentId',
  wrapAsync(invoiceController.getAllByParentId.bind(invoiceController)),
);

export default router;
