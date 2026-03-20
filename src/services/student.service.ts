import { StudentRepository } from '../repositories/student.repository';
import { UserService } from './user.service';
import { sequelize } from '../database/sequelize';
import { AppError } from '../errors/AppError';
import { ErrorMessages } from '../errors/ErrorMessages';
import { convertToSequelize } from 'src/utils/convertDate';
import { ParentService } from './parent.service';

interface CreateStudentDTO {
  firstName: string;
  lastName: string;
  school?: string;
  grade?: number;
  cycle?: string;
  birthdate: string;
  parentId: string;
  unitId: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
}

interface UpdateStudentDTO {
  id: string;
  firstName?: string;
  lastName?: string;
  school?: string;
  grade?: number;
  cycle?: string;
  userId: string;
  role: string;
  email: string;
}

export class StudentService {
  private studentRepository = new StudentRepository();
  private userService = new UserService();
  private parentService = new ParentService();

  async findAll(searchTerm = '') {
    const students = await this.studentRepository.findAll(searchTerm);

    return {
      status: 'SUCCESSFUL',
      data: students,
    };
  }

  async findByIdWithAccessCheck(
    studentId: string,
    requesterId: string,
    requesterRole: string,
    requesterEmail: string,
  ) {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new AppError(ErrorMessages.STUDENT_NOT_FOUND);
    }

    const isAdmin = requesterRole === 'admin';
    const isSelf = student.userId === requesterId;

    let isParent = false;
    if (student.parentId && requesterRole === 'parent') {
      const parent = await this.parentService.findByUserId(
        requesterId,
        requesterEmail,
      );
      isParent = parent?.id === student.parentId;
    }

    if (!isAdmin && !isSelf && !isParent) {
      throw new AppError(ErrorMessages.FORBIDDEN_ACTION);
    }

    return {
      status: 'SUCCESSFUL',
      data: student,
    };
  }

  async findByUserIdWithAccessCheck(
    userId: string,
    requesterId: string,
    requesterRole: string,
    requesterEmail: string,
  ) {
    const student = await this.studentRepository.findByUserId(userId);

    if (!student) {
      throw new AppError(ErrorMessages.STUDENT_NOT_FOUND);
    }

    const isAdmin = requesterRole === 'admin';
    const isSelf = userId === requesterId;

    let isParent = false;
    if (student.parentId && requesterRole === 'parent') {
      const parent = await this.parentService.findByUserId(
        requesterId,
        requesterEmail,
      );
      isParent = parent?.id === student.parentId;
    }

    if (!isAdmin && !isSelf && !isParent) {
      throw new AppError(ErrorMessages.FORBIDDEN_ACTION);
    }

    return {
      status: 'SUCCESSFUL',
      data: student,
    };
  }

  async createStudent(data: CreateStudentDTO) {
    const t = await sequelize.transaction();

    try {
      let userId: string | null = null;
      if (data.email && data.password) {
        const user = await this.userService.createUser({
          email: data.email,
          password: data.password,
          phoneNumber: data.phoneNumber,
          roleName: 'student',
        });
        userId = user.id;
      }

      const birthdateFormatted = convertToSequelize(data.birthdate);

      const student = await this.studentRepository.create(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          school: data.school,
          grade: data.grade,
          cycle: data.cycle,
          birthdate: birthdateFormatted,
          userId,
          parentId: data.parentId,
          unitId: data.unitId,
        },
        t,
      );

      await t.commit();
      return {
        status: 'CREATED',
        data: { id: student.id },
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateStudent({
    id,
    firstName,
    lastName,
    school,
    grade,
    cycle,
    userId,
    role,
    email,
  }: UpdateStudentDTO) {
    const result = await this.findByIdWithAccessCheck(id, userId, role, email);
    if (!result.data) throw new AppError(ErrorMessages.STUDENT_NOT_FOUND);

    await this.studentRepository.updateById(id, {
      firstName,
      lastName,
      school,
      grade,
      cycle,
    });

    return {
      status: 'SUCCESSFUL',
      data: {
        studentId: id,
        firstName,
        lastName,
        school,
        grade,
        cycle,
      },
    };
  }
}
