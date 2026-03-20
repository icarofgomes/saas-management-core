import { Request, Response } from 'express';
import { PlanService } from '../services/plan.service';

export class PlanController {
  private planService = new PlanService();

  async create(req: Request, res: Response) {
    const result = await this.planService.createPlan(req.body);
    return res.status(201).json(result);
  }
}
