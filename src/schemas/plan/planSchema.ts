import JoiBase from 'joi';
import JoiDate from '@joi/date';

const Joi = JoiBase.extend(JoiDate);

export const createPlanSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(255).optional(),
  price: Joi.number().precision(2).positive().required(),
  durationMonths: Joi.number().integer().min(1).required(),
});
