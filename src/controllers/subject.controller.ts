// src/controllers/subject.controller.ts
import { Request, Response, NextFunction } from 'express';
import { SubjectService } from '../services/subject.service';

const subjectService = new SubjectService();

export class SubjectController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.user!;

      if (role !== 'admin') {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      const { subjectName } = req.body;
      const { email } = req.user as { email: string };

      const result = await subjectService.createSubject({ subjectName, email });
      res.status(201).json({ subject: result.data });
    } catch (error) {
      next(error);
    }
  }

  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await subjectService.findAll();
      res.status(200).json({ subjects: result.data });
    } catch (error) {
      next(error);
    }
  }

  async findTeachersBySubject(req: Request, res: Response, next: NextFunction) {
    try {
      const subjectId = Number(req.params.id);

      const result = await subjectService.findTeachersBySubject(subjectId);
      res.status(200).json({ teachers: result.data });
    } catch (error) {
      next(error);
    }
  }
}
