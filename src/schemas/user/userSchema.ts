// src/schemas/userSchema.ts
import Joi from 'joi';

export const createUserSchema = Joi.object({
  password: Joi.string().min(6).max(12).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .pattern(/^[1-9]{2}[9]{0,1}[1-9]{1}[0-9]{3}[0-9]{4}$/)
    .message('Número de telefone inválido'),
  cpf: Joi.string()
    .length(11)
    .pattern(/^\d+$/)
    .message('CPF deve conter apenas números'),
  roleName: Joi.string().min(3).required(),
});

export const requestResetSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .message('Código deve ter 6 dígitos numéricos')
    .required(),
  newPassword: Joi.string().min(6).max(12).required(),
});
