import Joi from 'joi';

export const presignedUrlSchema = Joi.object({
  contentType: Joi.string()
    .valid('image/jpeg', 'image/png', 'image/webp', 'audio/m4a', 'audio/x-m4a')
    .required(),
  fileName: Joi.string().max(200).required(),
});

export const createMemorySchema = Joi.object({
  type: Joi.string().valid('photo', 'voice', 'note').required(),
  s3Key: Joi.string().max(512).when('type', {
    is: Joi.string().valid('photo', 'voice'),
    then: Joi.required(),
  }),
  caption: Joi.string().max(500).allow(''),
  noteText: Joi.string().max(2000).when('type', {
    is: 'note',
    then: Joi.required(),
  }),
});

export const memoriesListSchema = Joi.object({
  cursor: Joi.string().isoDate(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});
