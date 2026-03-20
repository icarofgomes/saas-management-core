import Joi from 'joi';

export const createUnitSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().required(),
  cpf: Joi.string().required(),
  maxRooms: Joi.number().integer().min(1).required(),
});
