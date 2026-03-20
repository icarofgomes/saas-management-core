import { Request, Response } from 'express';
import { ParentService } from '../services/parent.service';

export class ParentController {
  private parentService = new ParentService();

  async create(req: Request, res: Response) {
    const result = await this.parentService.createParent(req.body);
    return res.status(201).json(result);
  }

  async findByUserId(req: Request, res: Response) {
    const { userId } = req.params;
    const { email } = req.user as { email: string };

    const parent = await this.parentService.findByUserId(userId, email);

    return res.status(200).json(parent);
  }

  async update(req: Request, res: Response) {
    const { userId } = req.params;
    const { firstName, lastName } = req.body;
    const { email, role } = req.user!;

    const result = await this.parentService.updateParent({
      userId,
      firstName,
      lastName,
      email,
      role,
    });

    return res.status(200).json(result);
  }
}
