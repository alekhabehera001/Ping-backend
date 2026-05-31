import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  avatar: Joi.string().uri().max(512),
  fcmToken: Joi.string().max(512),
});
