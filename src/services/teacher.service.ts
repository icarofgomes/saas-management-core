// src/services/teacher.service.ts
import { UserService } from './user.service';
import { AddressService } from './address.service';
import { sequelize } from '../database/sequelize';
import { AppError } from '../errors/AppError';
import { ErrorMessages } from '../errors/ErrorMessages';
import { TeacherRepository } from 'src/repositories/teacher.repository';
import { Subject } from 'src/models/subject.model';

interface CreateTeacherDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  cpf?: string;
  street: string;
  number: number;
  complement?: string;
  neighborhood: string;
  zip: string;
  city: string;
  acronym: string;
  unitId: string;
  subjectIds: number[];
}

interface UpdateTeacherDTO {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export class TeacherService {
  private teacherRepository = new TeacherRepository();
  private userService = new UserService();
  private addressService = new AddressService();

  private async ensureCanModify(userId: string, email: string, role: string) {
    if (role === 'admin') return;

    await this.userService.validateUser({
      userId,
      userEmail: email,
    });
  }

  async createTeacher(data: CreateTeacherDTO) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Criar usuário
      const user = await this.userService.createUserWithVerificationToken({
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        cpf: data.cpf,
        roleName: 'teacher',
      });

      // 2. Criar endereço
      await this.addressService.create(
        {
          userId: user.id,
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          zip: data.zip,
          city: data.city,
          acronym: data.acronym,
        },
        transaction,
      );

      // 3. Criar teacher
      const teacher = await this.teacherRepository.create(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          balance: 0,
          userId: user.id,
          unitId: data.unitId,
        },
        transaction,
      );

      // 4. Valida as matérias recebidas
      if (
        !data.subjectIds ||
        !Array.isArray(data.subjectIds) ||
        data.subjectIds.length === 0
      ) {
        throw new AppError(ErrorMessages.SUBJECTS_REQUIRED);
      }

      const validSubjects = await Subject.findAll({
        where: { id: data.subjectIds },
        transaction,
      });

      if (validSubjects.length !== data.subjectIds.length) {
        throw new AppError(ErrorMessages.INVALID_SUBJECT_IDS);
      }

      // 5. Associa as matérias ao professor
      await this.teacherRepository.setSubjects(
        teacher.id,
        data.subjectIds,
        transaction,
      );

      await transaction.commit();

      return {
        status: 'CREATED',
        data: { token: user.token, userId: user.id },
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findByUserId(userId: string, email: string) {
    await this.userService.validateUser({ userId, userEmail: email });

    const teacher = await this.teacherRepository.findByUserId(userId);
    if (!teacher) throw new AppError(ErrorMessages.TEACHER_NOT_FOUND);

    return teacher;
  }

  async findById(id: string) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) throw new AppError(ErrorMessages.TEACHER_NOT_FOUND);
    return teacher;
  }

  async findAll(searchTerm = '') {
    const teachers = await this.teacherRepository.findAll(searchTerm);
    return teachers;
  }

  async updateTeacher({
    userId,
    firstName,
    lastName,
    email,
    role,
  }: UpdateTeacherDTO) {
    await this.ensureCanModify(userId, email, role);

    const updated = await this.teacherRepository.update(userId, {
      firstName,
      lastName,
    });

    if (!updated) throw new AppError(ErrorMessages.TEACHER_NOT_FOUND);

    return {
      status: 'SUCCESSFUL',
      data: { userId, firstName, lastName },
    };
  }
}
