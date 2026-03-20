// src/models/index.ts
import { sequelize } from '../database/sequelize'; // sua instância já configurada
import { User } from './user.model';
import { Role } from './role.model';
import { UserToken } from './userToken.model';
import { Parent } from './parent.model';
import { Address } from './address.model';
import { Student } from './student.model';
import { Teacher } from './teacher.model';
import { Subject } from './subject.model';
import { TeacherSubject } from './teacherSubject.model';
import { Unit } from './unit.model';
import { Room } from './room.model';
import { Schedule } from './schedule.model';
import { Lesson } from './lesson.model';
import { LessonStudent } from './lessonStudent.model';
import { Invoice } from './invoice.model';
import { Plan } from './plan.model';
import { Sale } from './sale.model';

// Inicialização dos modelos
const models = {
  User: User.initModel(sequelize),
  Role: Role.initModel(sequelize),
  UserToken: UserToken.initModel(sequelize),
  Parent: Parent.initModel(sequelize),
  Address: Address.initModel(sequelize),
  Student: Student.initModel(sequelize),
  Teacher: Teacher.initModel(sequelize),
  Subject: Subject.initModel(sequelize),
  TeacherSubject: TeacherSubject.initModel(sequelize),
  Unit: Unit.initModel(sequelize),
  Room: Room.initModel(sequelize),
  Schedule: Schedule.initModel(sequelize),
  Lesson: Lesson.initModel(sequelize),
  LessonStudent: LessonStudent.initModel(sequelize),
  Plan: Plan.initModel(sequelize),
  Sale: Sale.initModel(sequelize),
  Invoice: Invoice.initModel(sequelize),
};

// Associações (depois que todos os modelos foram inicializados)
Object.values(models).forEach((model: any) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

export { sequelize };
export default models;
