import { LessonRepository } from 'src/repositories/lesson.repository';
import { RoomRepository } from 'src/repositories/room.repository';
import { ScheduleRepository } from 'src/repositories/schedule.repository';
import { sequelize } from 'src/database/sequelize';
import { AppError } from 'src/errors/AppError';
import { ErrorMessages } from 'src/errors/ErrorMessages';
import { TeacherRepository } from 'src/repositories/teacher.repository';
import { StudentRepository } from 'src/repositories/student.repository';
import { LessonStudentRepository } from 'src/repositories/lessonStudent.repository';
import { UserService } from './user.service';
import { UnitRepository } from 'src/repositories/unit.repository';

interface CreateLessonDTO {
  subjectId: number;
  teacherId?: string;
  unitId: string;
  startDateTime: Date;
}

export class LessonService {
  private lessonRepository = new LessonRepository();
  private roomRepository = new RoomRepository();
  private scheduleRepository = new ScheduleRepository();
  private teacherRepository = new TeacherRepository();
  private lessonStudentRepository = new LessonStudentRepository();
  private studentRepository = new StudentRepository();
  private userService = new UserService();
  private unitRepository = new UnitRepository();

  async createLesson(data: CreateLessonDTO) {
    const transaction = await sequelize.transaction();

    try {
      this.validateLessonTime(data.startDateTime);

      const { startDateTime, endDateTime } = this.getLessonTimeRange(
        data.startDateTime,
      );

      const freeRoom = await this.findAvailableRoom(
        data.unitId,
        startDateTime,
        endDateTime,
      );

      const schedule = await this.createSchedule(
        data.unitId,
        freeRoom.id,
        startDateTime,
        endDateTime,
        transaction,
      );

      const lesson = await this.lessonRepository.create(
        {
          subjectId: data.subjectId,
          teacherId: data.teacherId,
          scheduleId: schedule.id,
        },
        transaction,
      );

      await transaction.commit();

      return { status: 'CREATED', data: lesson };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findByParentUserId(userId: string, authenticatedEmail: string) {
    await this.userService.validateUser({
      userId,
      userEmail: authenticatedEmail,
    });

    const lessons =
      await this.lessonRepository.findLessonsByParentUserId(userId);

    return { status: 'SUCCESS', data: lessons };
  }

  async findByStudentUserId(userId: string, authenticatedEmail: string) {
    await this.userService.validateUser({
      userId,
      userEmail: authenticatedEmail,
    });

    const lessons =
      await this.lessonRepository.findLessonsByStudentUserId(userId);

    return { status: 'SUCCESS', data: lessons };
  }

  async findByTeacherUserId(userId: string, authenticatedEmail: string) {
    await this.userService.validateUser({
      userId,
      userEmail: authenticatedEmail,
    });

    const lessons =
      await this.lessonRepository.findLessonsByTeacherUserId(userId);

    return { status: 'SUCCESS', data: lessons };
  }

  async addTeacherToLesson(lessonId: string, teacherId: string) {
    const lesson = await this.lessonRepository.findById(lessonId, {
      includeSchedule: true,
    });
    if (!lesson) {
      throw new AppError(ErrorMessages.LESSON_NOT_FOUND);
    }

    await this.validateTeacherSubject(teacherId, lesson.subjectId);

    const schedule = lesson.schedule;
    if (!schedule) {
      throw new AppError(ErrorMessages.SCHEDULE_NOT_FOUND);
    }

    const overlappingLesson =
      await this.lessonRepository.hasOverlappingLessonForTeacher(
        teacherId,
        schedule.startDateTime,
        schedule.endDateTime,
        lessonId,
      );

    if (overlappingLesson) {
      throw new AppError(ErrorMessages.TEACHER_ALREADY_ASSIGNED_TO_THIS_TIME);
    }

    await this.lessonRepository.assignTeacher(lessonId, teacherId);

    return { status: 'SUCCESS', data: { lessonId, teacherId } };
  }

  async addStudentToLesson(lessonId: string, studentId: string) {
    // 1. Busca a aula com schedule e sala (via lessonRepository)
    const lesson = await this.lessonRepository.findById(lessonId, {
      includeSchedule: true,
    });
    if (!lesson) {
      throw new AppError(ErrorMessages.LESSON_NOT_FOUND);
    }

    // 2. Verifica se o aluno existe
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new AppError(ErrorMessages.STUDENT_NOT_FOUND);
    }

    // 3. Verifica se o aluno já está na aula
    const alreadyEnrolled = await this.lessonStudentRepository.findOne({
      lessonId,
      studentId,
    });
    if (alreadyEnrolled) {
      throw new AppError(ErrorMessages.STUDENT_ALREADY_ENROLLED);
    }

    // 4. Verifica se a aula está cheia (conta alunos e compara com capacidade da sala)
    const schedule = lesson.schedule;
    if (!schedule) {
      throw new AppError(ErrorMessages.SCHEDULE_NOT_FOUND);
    }

    const room = await this.roomRepository.findById(schedule.roomId);
    if (!room) {
      throw new AppError(ErrorMessages.LESSON_ROOM_NOT_FOUND);
    }

    const enrolledCount = await this.lessonStudentRepository.count({
      lessonId,
    });

    if (enrolledCount >= room.capacity) {
      throw new AppError(ErrorMessages.LESSON_FULL);
    }

    // 5. Insere a relação aluno-aula
    await this.lessonStudentRepository.create({ lessonId, studentId });

    return { status: 'SUCCESS', data: { lessonId, studentId } };
  }

  private validateLessonTime(startDateTimeInput: Date | string) {
    const startDateTime = new Date(startDateTimeInput);

    const hour = startDateTime.getHours();
    const minutes = startDateTime.getMinutes();

    if (hour < 8 || hour > 19 || (hour === 19 && minutes > 0)) {
      throw new AppError(ErrorMessages.INVALID_LESSON_TIME);
    }

    if (![0, 30].includes(minutes)) {
      throw new AppError(ErrorMessages.INVALID_LESSON_MINUTES);
    }
  }

  private getLessonTimeRange(start: Date) {
    const startDateTime = new Date(start);
    startDateTime.setSeconds(0, 0);

    const endDateTime = new Date(startDateTime.getTime() + 75 * 60 * 1000);
    endDateTime.setSeconds(0, 0);

    return { startDateTime, endDateTime };
  }

  private async findAvailableRoom(unitId: string, start: Date, end: Date) {
    const freeRoom = await this.roomRepository.findFreeRoom(unitId, start, end);
    if (!freeRoom) {
      throw new AppError(ErrorMessages.NO_AVAILABLE_ROOM);
    }
    return freeRoom;
  }

  private async createSchedule(
    unitId: string,
    roomId: string,
    start: Date,
    end: Date,
    transaction: any,
  ) {
    return this.scheduleRepository.create(
      { unitId, roomId, startDateTime: start, endDateTime: end },
      transaction,
    );
  }

  private async validateTeacherSubject(teacherId: string, subjectId: number) {
    const teacher = await this.teacherRepository.findById(teacherId);
    if (!teacher) {
      throw new AppError(ErrorMessages.TEACHER_NOT_FOUND);
    }

    if (!teacher.subjects) {
      throw new AppError(ErrorMessages.TEACHER_DOES_NOT_TEACH_SUBJECT);
    }

    const teachesSubject = teacher.subjects.some(
      (subject) => subject.id === subjectId,
    );

    if (!teachesSubject) {
      throw new AppError(ErrorMessages.TEACHER_DOES_NOT_TEACH_SUBJECT);
    }
  }

  async findByUnitUserId(userId: string) {
    const unit = await this.unitRepository.findByUserId(userId);

    if (!unit) {
      throw new AppError(ErrorMessages.UNIT_NOT_FOUND);
    }

    const lessons = await this.lessonRepository.findLessonsByUnitId(unit.id);

    return { status: 'SUCCESS', data: lessons };
  }
}
