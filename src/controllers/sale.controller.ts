// src/controllers/sale.controller.ts
import { Request, Response } from 'express';
import { SaleService } from '../services/sale.service';

export class SaleController {
  private saleService = new SaleService();

  async create(req: Request, res: Response) {
    const result = await this.saleService.createSale(req.body);
    return res.status(201).json(result);
  }
}
