// src/schemas/parent/parentSchema.ts
import Joi from 'joi';

export const createParentSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().optional(),
  cpf: Joi.string().optional(),
  street: Joi.string().required(),
  number: Joi.number().integer().required(),
  complement: Joi.string().optional(),
  neighborhood: Joi.string().required(),
  zip: Joi.string().required(),
  city: Joi.string().required(),
  acronym: Joi.string().required(),
  unitId: Joi.string().guid({ version: 'uuidv4' }).required(),
});

export const updateParentSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
});
