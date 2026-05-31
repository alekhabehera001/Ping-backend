"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccountSchema = exports.logoutSchema = exports.refreshTokenSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.resendOtpSchema = exports.verifyOtpSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().max(255).lowercase().required(),
    password: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/[A-Z]/, 'uppercase')
        .pattern(/[a-z]/, 'lowercase')
        .pattern(/\d/, 'digit')
        .required()
        .messages({
        'string.pattern.name': 'Password must contain at least one {#name} letter',
    }),
    name: joi_1.default.string().min(2).max(100).trim().required(),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().max(255).lowercase().required(),
    password: joi_1.default.string().max(128).required(),
});
exports.verifyOtpSchema = joi_1.default.object({
    userId: joi_1.default.string().hex().length(24).required(),
    otp: joi_1.default.string()
        .length(6)
        .pattern(/^\d{6}$/)
        .required(),
});
exports.resendOtpSchema = joi_1.default.object({
    userId: joi_1.default.string().hex().length(24).required(),
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().max(255).lowercase().required(),
});
exports.resetPasswordSchema = joi_1.default.object({
    verificationToken: joi_1.default.string().required(),
    newPassword: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/[A-Z]/, 'uppercase')
        .pattern(/[a-z]/, 'lowercase')
        .pattern(/\d/, 'digit')
        .required(),
    confirmPassword: joi_1.default.any()
        .valid(joi_1.default.ref('newPassword'))
        .required()
        .messages({ 'any.only': 'Passwords do not match' }),
});
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().max(2048).required(),
});
exports.logoutSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().max(2048).required(),
});
exports.deleteAccountSchema = joi_1.default.object({
    otp: joi_1.default.string()
        .length(6)
        .pattern(/^\d{6}$/)
        .required(),
});
//# sourceMappingURL=auth.validation.js.map