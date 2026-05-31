import Joi from 'joi';

export const createMoodSchema = Joi.object({
  mood: Joi.string()
    .valid('happy', 'sad', 'stressed', 'angry', 'excited', 'loved', 'tired')
    .required(),
  note: Joi.string().max(200).allow(''),
});

export const moodHistorySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});
