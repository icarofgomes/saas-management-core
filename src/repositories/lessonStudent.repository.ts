import { LessonStudent } from 'src/models/lessonStudent.model';
import { WhereOptions } from 'sequelize';

export class LessonStudentRepository {
  async findOne(where: WhereOptions<any>) {
    return LessonStudent.findOne({ where });
  }

  async count(where: WhereOptions<any>) {
    return LessonStudent.count({ where });
  }

  async create(data: { lessonId: string; studentId: string }) {
    return LessonStudent.create(data);
  }
}
