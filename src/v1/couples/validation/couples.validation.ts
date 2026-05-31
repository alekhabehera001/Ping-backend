import Joi from 'joi';

export const joinCoupleSchema = Joi.object({
  inviteCode: Joi.string().min(4).max(10).uppercase().required(),
});

export const anniversarySchema = Joi.object({
  anniversary: Joi.date().iso().max('now').required(),
});
