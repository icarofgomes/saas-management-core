import { Teacher } from 'src/models/teacher.model';
import { Subject } from '../models/subject.model';
import { User } from 'src/models/user.model';

export class SubjectRepository {
  async create(data: { subject: string }) {
    return Subject.create(data);
  }

  async findByName(subjectName: string) {
    return Subject.findOne({
      where: { subject: subjectName },
    });
  }

  async findAll(options?: { excludeTimestamps?: boolean }) {
    const attributes = options?.excludeTimestamps
      ? { exclude: ['createdAt', 'updatedAt'] }
      : undefined;

    return Subject.findAll({ attributes });
  }

  async findById(id: number) {
    return Subject.findByPk(id);
  }

  async deleteById(id: number) {
    return Subject.destroy({ where: { id } });
  }

  async findTeachersBySubjectId(subjectId: number) {
    const subject = await Subject.findByPk(subjectId, {
      include: [
        {
          model: Teacher,
          as: 'teachers',
          include: [
            {
              model: User,
              as: 'user',
              attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
            },
          ],
        },
      ],
    });

    return subject?.teachers || [];
  }
}
