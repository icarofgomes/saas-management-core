import { Request, Response } from 'express';
import { PaymentService } from '../services/payment/payment.service';

export class PaymentController {
  private paymentService = new PaymentService();

  async callback(req: Request, res: Response) {
    const { externalId, status } = req.body;

    const result = await this.paymentService.handleCallback(externalId, status);

    return res.status(200).json(result);
  }

  async resendPayment(req: Request, res: Response) {
    const { invoiceId } = req.params;

    const result = await this.paymentService.resendPayment(invoiceId);

    return res.status(200).json(result);
  }

  async getByInvoiceId(req: Request, res: Response) {
    const { invoiceId } = req.params;

    const result = await this.paymentService.findByInvoiceId(invoiceId);

    return res.status(200).json(result);
  }
}
