import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoice.service';

export class InvoiceController {
  private invoiceService = new InvoiceService();

  // Método para buscar todas as invoices de um parentId
  async getAllByParentId(req: Request, res: Response) {
    const { parentId } = req.params;
    const result = await this.invoiceService.getAllByParentId(parentId);

    return res.status(200).json(result);
  }
}
