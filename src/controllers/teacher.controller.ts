// src/controllers/teacher.controller.ts
import { Request, Response } from 'express';
import { TeacherService } from '../services/teacher.service';

export class TeacherController {
  private teacherService = new TeacherService();

  async create(req: Request, res: Response) {
    const result = await this.teacherService.createTeacher(req.body);
    return res.status(201).json(result);
  }

  async findAll(req: Request, res: Response) {
    const { role } = req.user as { role: string };
    const { search } = req.query;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Acesso não autorizado.' });
    }

    const result = await this.teacherService.findAll(search as string);
    return res.status(200).json({ teachers: result });
  }

  async findByUserId(req: Request, res: Response) {
    const { userId } = req.params;
    const { email } = req.user as { email: string };

    const teacher = await this.teacherService.findByUserId(userId, email);
    return res.status(200).json(teacher);
  }

  async findById(req: Request, res: Response) {
    const { role } = req.user as { role: string };
    const { id } = req.params;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Acesso não autorizado.' });
    }

    const teacher = await this.teacherService.findById(id);
    return res.status(200).json(teacher);
  }

  async update(req: Request, res: Response) {
    const { userId } = req.params;
    const { firstName, lastName } = req.body;
    const { email, role } = req.user as { email: string; role: string };

    const result = await this.teacherService.updateTeacher({
      userId,
      firstName,
      lastName,
      email,
      role,
    });

    return res.status(200).json(result);
  }
}
