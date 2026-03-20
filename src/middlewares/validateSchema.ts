// src/middlewares/validateSchema.ts
import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

class ValidationError extends Error {
  statusCode: number;
  details: string[];

  constructor(message: string, details: string[]) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.details = details;
  }
}

const validateSchema = (schema: ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return next(new ValidationError('Erro de validação', messages));
    }

    next();
  };
};

export default validateSchema;
