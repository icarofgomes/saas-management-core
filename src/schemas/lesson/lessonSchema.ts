import Joi from 'joi';

export const createLessonSchema = Joi.object({
  subjectId: Joi.number().integer().required(),
  teacherId: Joi.string().uuid().optional().allow(null),
  unitId: Joi.string().uuid().required(),
  startDateTime: Joi.date().required(),
});

export const addTeacherSchema = Joi.object({
  teacherId: Joi.string().uuid().required(),
});

export const addStudentSchema = Joi.object({
  studentId: Joi.string().uuid().required(),
});
