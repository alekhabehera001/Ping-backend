import Joi from 'joi';

export const submitAnswerSchema = Joi.object({
  questionId: Joi.string().hex().length(24).required(),
  text: Joi.string().min(1).max(1000).required(),
});

export const historySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});
