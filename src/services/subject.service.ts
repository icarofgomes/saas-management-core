import { SubjectRepository } from '../repositories/subject.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../errors/AppError';
import { ErrorMessages } from '../errors/ErrorMessages';

interface CreateSubjectDTO {
  subjectName: string;
  email: string;
}

export class SubjectService {
  private subjectRepository = new SubjectRepository();

  async createSubject({ subjectName, email }: CreateSubjectDTO) {
    const existing = await this.subjectRepository.findByName(subjectName);
    if (existing) {
      throw new AppError(ErrorMessages.SUBJECT_ALREADY_EXISTS);
    }

    const subject = await this.subjectRepository.create({
      subject: subjectName,
    });

    return {
      status: 'CREATED',
      data: {
        id: subject.id,
        subjectName,
      },
    };
  }

  async findAll() {
    const subjects = await this.subjectRepository.findAll({
      excludeTimestamps: true,
    });

    return {
      status: 'SUCCESSFUL',
      data: subjects,
    };
  }

  async findTeachersBySubject(subjectId: number) {
    const teachers =
      await this.subjectRepository.findTeachersBySubjectId(subjectId);

    return {
      status: 'SUCCESSFUL',
      data: teachers,
    };
  }
}
