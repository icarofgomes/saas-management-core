import JoiBase from 'joi';
import JoiDate from '@joi/date';

const Joi = JoiBase.extend(JoiDate);

export const createStudentSchema = Joi.object({
  firstName: Joi.string().min(3).max(10).required(),
  lastName: Joi.string().min(3).max(20).required(),
  school: Joi.string().min(3).max(50).optional(),
  grade: Joi.number().integer().min(1).max(9).optional(),
  cycle: Joi.string().min(5).max(30).optional(),
  birthdate: Joi.date().format('DD/MM/YYYY').required(),
  unitId: Joi.string().guid({ version: 'uuidv4' }).required(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  phoneNumber: Joi.string().optional(),
});

export const updateStudentSchema = Joi.object({
  firstName: Joi.string().min(3).max(10).required(),
  lastName: Joi.string().min(3).max(20).required(),
  school: Joi.string().min(3).max(50).optional(),
  grade: Joi.number().integer().min(1).max(9).optional(),
  cycle: Joi.string().min(5).max(30).optional(),
});
