import Joi from 'joi';

export const createSubjectSchema = Joi.object({
  subjectName: Joi.string().trim().min(1).required(),
});
