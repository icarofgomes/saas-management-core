import { Request, Response } from 'express';
import { LessonService } from '../services/lesson.service';

export class LessonController {
  private lessonService = new LessonService();

  async create(req: Request, res: Response) {
    const result = await this.lessonService.createLesson(req.body);
    return res.status(201).json(result);
  }

  async addTeacher(req: Request, res: Response) {
    const { lessonId } = req.params;
    const { teacherId } = req.body;

    const result = await this.lessonService.addTeacherToLesson(
      lessonId,
      teacherId,
    );

    return res.status(200).json(result);
  }

  async addStudent(req: Request, res: Response) {
    const { lessonId } = req.params;
    const { studentId } = req.body;

    const result = await this.lessonService.addStudentToLesson(
      lessonId,
      studentId,
    );

    return res.status(200).json(result);
  }

  async findByParentUserId(req: Request, res: Response) {
    const { userId } = req.params;
    const { email } = req.user as { email: string };

    const parent = await this.lessonService.findByParentUserId(userId, email);

    return res.status(200).json(parent);
  }

  async findByStudentUserId(req: Request, res: Response) {
    const { userId } = req.params;
    const { email } = req.user as { email: string };

    const parent = await this.lessonService.findByStudentUserId(userId, email);

    return res.status(200).json(parent);
  }

  async findByTeacherUserId(req: Request, res: Response) {
    const { userId } = req.params;
    const { email } = req.user as { email: string };

    const parent = await this.lessonService.findByTeacherUserId(userId, email);

    return res.status(200).json(parent);
  }

  async findByUnitUserId(req: Request, res: Response) {
    const { userId } = req.params;

    const result = await this.lessonService.findByUnitUserId(userId);

    return res.status(200).json(result);
  }
}
