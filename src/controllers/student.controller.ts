import { Request, Response } from 'express';
import { StudentService } from '../services/student.service';

export class StudentController {
  private studentService = new StudentService();

  async findAll(req: Request, res: Response) {
    const { role } = req.user!;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    const { search } = req.query;
    const result = await this.studentService.findAll(search as string);

    return res.status(200).json(result.data);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const { userId, role, email } = req.user!;

    const result = await this.studentService.findByIdWithAccessCheck(
      id,
      userId,
      role,
      email,
    );
    return res.status(200).json(result.data);
  }

  async findByUserId(req: Request, res: Response) {
    const { userId } = req.params;
    const { userId: requesterId, role, email } = req.user!;

    const student = await this.studentService.findByUserIdWithAccessCheck(
      userId,
      requesterId,
      role,
      email,
    );

    return res.status(200).json(student.data);
  }

  async create(req: Request, res: Response) {
    const {
      firstName,
      lastName,
      password,
      email,
      phoneNumber,
      school,
      grade,
      cycle,
      birthdate,
      unitId,
    } = req.body;
    const { id } = req.params;

    const result = await this.studentService.createStudent({
      firstName,
      lastName,
      password,
      email,
      phoneNumber,
      school,
      grade,
      cycle,
      birthdate,
      parentId: id,
      unitId,
    });

    return res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { firstName, lastName, school, grade, cycle } = req.body;
    const { userId, role, email } = req.user!;

    const updated = await this.studentService.updateStudent({
      id,
      firstName,
      lastName,
      school,
      grade,
      cycle,
      userId,
      role,
      email,
    });

    return res.status(200).json(updated);
  }
}
