import Joi from 'joi';

export const createAddressSchema = Joi.object({
  street: Joi.string().required(),
  number: Joi.number().integer().required(),
  complement: Joi.string().allow('', null),
  neighborhood: Joi.string().required(),
  city: Joi.string().required(),
  zip: Joi.string().required(),
  acronym: Joi.string().length(2).required(),
  country: Joi.string().default('Brasil'),
});

export const updateAddressSchema = Joi.object({
  street: Joi.string(),
  number: Joi.number().integer(),
  complement: Joi.string().allow('', null),
  neighborhood: Joi.string(),
  city: Joi.string(),
  zip: Joi.string(),
  acronym: Joi.string().length(2),
}).min(1);
