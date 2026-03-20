import Joi from 'joi';

export const createTeacherSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().optional(),
  cpf: Joi.string().optional(),
  street: Joi.string().required(),
  number: Joi.number().integer().required(),
  complement: Joi.string().allow('', null),
  neighborhood: Joi.string().required(),
  zip: Joi.string().required(),
  city: Joi.string().required(),
  acronym: Joi.string().required(),
  unitId: Joi.string().guid({ version: 'uuidv4' }).required(),
  subjectIds: Joi.array()
    .items(Joi.number().integer().positive().required())
    .min(1)
    .required()
    .messages({
      'array.min': 'Pelo menos uma matéria deve ser fornecida.',
      'array.base': 'subjectIds deve ser um array de números.',
    }),
});

export const updateTeacherSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
});
