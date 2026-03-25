import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { wrapAsync } from '../utils/wrapAsync';

const router = Router();
const paymentController = new PaymentController();

router.post(
  '/webhooks/payment',
  wrapAsync(paymentController.callback.bind(paymentController)),
);

router.post(
  '/payments/resend/:invoiceId',
  wrapAsync(paymentController.resendPayment.bind(paymentController)),
);

router.get(
  '/payments/invoice/:invoiceId',
  wrapAsync(paymentController.getByInvoiceId.bind(paymentController)),
);

export default router;
