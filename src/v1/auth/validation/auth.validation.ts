import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().max(255).lowercase().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[A-Z]/, 'uppercase')
    .pattern(/[a-z]/, 'lowercase')
    .pattern(/\d/, 'digit')
    .required()
    .messages({
      'string.pattern.name': 'Password must contain at least one {#name} letter',
    }),
  name: Joi.string().min(2).max(100).trim().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().max(255).lowercase().required(),
  password: Joi.string().max(128).required(),
});

export const verifyOtpSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required(),
});

export const resendOtpSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().max(255).lowercase().required(),
});

export const resetPasswordSchema = Joi.object({
  verificationToken: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[A-Z]/, 'uppercase')
    .pattern(/[a-z]/, 'lowercase')
    .pattern(/\d/, 'digit')
    .required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().max(2048).required(),
});

export const logoutSchema = Joi.object({
  refreshToken: Joi.string().max(2048).required(),
});

export const deleteAccountSchema = Joi.object({
  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required(),
});
