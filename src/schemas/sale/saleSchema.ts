// src/schemas/sale/saleSchema.ts
import Joi from 'joi';

export const createSaleSchema = Joi.object({
  parentId: Joi.string().uuid().required(),
  planId: Joi.string().uuid().required(),
  unitId: Joi.string().uuid().required(),
  startMonth: Joi.date().required(),
  dueDate: Joi.date().required(),
});
