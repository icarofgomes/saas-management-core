// src/validations/room.validation.ts (ou onde você organiza seus schemas)
import Joi from 'joi';

export const createRoomSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  unitId: Joi.string().uuid().required(),
  capacity: Joi.number().integer().min(1).max(10).default(3),
});
