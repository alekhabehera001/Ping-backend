import Joi from 'joi';

export const createQuestionSchema = Joi.object({
  text: Joi.string().min(10).max(500).required(),
  category: Joi.string()
    .valid('emotional', 'romantic', 'funny', 'future_goals', 'stress', 'appreciation')
    .required(),
  scheduledFor: Joi.date().iso().required(),
});

export const listQuestionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  category: Joi.string().valid('emotional', 'romantic', 'funny', 'future_goals', 'stress', 'appreciation'),
});
