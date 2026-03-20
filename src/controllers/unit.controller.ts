import { Request, Response } from 'express';
import { UnitService } from '../services/unit.service';

export class UnitController {
  private unitService = new UnitService();

  async create(req: Request, res: Response) {
    const result = await this.unitService.createUnit(req.body);

    return res.status(201).json(result);
  }
}
