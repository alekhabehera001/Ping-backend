"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt = __importStar(require("bcrypt"));
const mongoose_2 = require("mongoose");
const codeGenerator_1 = require("../../common/utils/codeGenerator");
const email_service_1 = require("../../services/email.service");
const token_service_1 = require("../../services/token.service");
const user_schema_1 = require("../../schemas/user.schema");
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const OTP_EXPIRY_MINUTES = 5;
const BCRYPT_ROUNDS = 10;
let AuthService = class AuthService {
    constructor(userModel, tokenService, emailService) {
        this.userModel = userModel;
        this.tokenService = tokenService;
        this.emailService = emailService;
    }
    async register(input) {
        const existing = await this.userModel.findOne({ email: input.email, isDeleted: false }).lean();
        if (existing) {
            if (!existing.isEmailVerified) {
                await this.sendOtp(existing._id, 'email_verification');
                return { userId: existing._id.toString() };
            }
            throw new common_1.ConflictException('Email is already registered');
        }
        const hashed = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
        const user = await this.userModel.create({
            email: input.email,
            password: hashed,
            name: input.name,
        });
        await this.sendOtp(user._id, 'email_verification');
        return { userId: user._id.toString() };
    }
    async verifyOtp(input) {
        const user = await this.userModel
            .findOne({ _id: input.userId, isDeleted: false })
            .select('+otp.code')
            .exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        this.validateOtp(user, 'email_verification', input.otp);
        user.isEmailVerified = true;
        user.otp = undefined;
        await user.save();
        return this.issueTokens(user);
    }
    async login(input) {
        const user = await this.userModel
            .findOne({ email: input.email, isDeleted: false })
            .select('+password +otp.code')
            .exec();
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.isEmailVerified) {
            await this.sendOtp(user._id, 'email_verification');
            throw new common_1.UnauthorizedException('Email not verified. OTP resent.');
        }
        if (user.lockUntil && user.lockUntil > new Date()) {
            const remaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
            throw new common_1.UnauthorizedException(`Account locked. Try again in ${remaining} minutes.`);
        }
        const valid = await bcrypt.compare(input.password, user.password);
        if (!valid) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
                user.loginAttempts = 0;
            }
            await user.save();
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
        return this.issueTokens(user);
    }
    async refreshTokens(refreshToken) {
        const { payload, raw } = this.tokenService.parseVerifiedRefreshToken(refreshToken);
        const user = await this.userModel
            .findOne({ _id: payload.userId, isDeleted: false, 'sessions.jti': payload.jti })
            .exec();
        if (!user)
            throw new common_1.UnauthorizedException('Session not found');
        const session = user.sessions.find((s) => s.jti === payload.jti);
        if (!session)
            throw new common_1.UnauthorizedException('Session expired');
        const storedHash = this.tokenService.hashRefreshTokenForStorage(raw);
        if (!this.tokenService.refreshTokenHashesEqual(storedHash, session.refreshTokenHash || '')) {
            throw new common_1.UnauthorizedException('Token reuse detected');
        }
        user.sessions = user.sessions.filter((s) => s.jti !== payload.jti);
        await user.save();
        return this.issueTokens(user);
    }
    async forgotPassword(input) {
        const user = await this.userModel.findOne({ email: input.email, isDeleted: false }).lean();
        if (!user)
            return;
        await this.sendOtp(user._id, 'password_reset');
    }
    async verifyPasswordResetOtp(userId, otp) {
        const user = await this.userModel
            .findOne({ _id: userId, isDeleted: false })
            .select('+otp.code')
            .exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        this.validateOtp(user, 'password_reset', otp);
        user.otp.isUsed = true;
        await user.save();
        return this.tokenService.generateVerificationToken(userId, 'password_reset', Date.now());
    }
    async resetPassword(input) {
        const payload = this.tokenService.verifyVerificationToken(input.verificationToken);
        const user = await this.userModel.findOne({ _id: payload.userId, isDeleted: false }).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.password = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
        user.sessions = [];
        await user.save();
    }
    async logout(userId, refreshToken) {
        const { payload } = this.tokenService.parseRefreshTokenForLogout(refreshToken);
        await this.userModel.updateOne({ _id: userId }, { $pull: { sessions: { jti: payload.jti } } });
    }
    async resendOtp(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const otpType = user.isEmailVerified ? 'password_reset' : 'email_verification';
        await this.sendOtp(user._id, otpType);
    }
    async deleteAccount(userId, otp) {
        const user = await this.userModel
            .findOne({ _id: userId, isDeleted: false })
            .select('+otp.code')
            .exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        this.validateOtp(user, 'account_deletion', otp);
        user.isDeleted = true;
        user.sessions = [];
        await user.save();
    }
    async requestAccountDeletion(userId) {
        const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.sendOtp(user._id, 'account_deletion');
    }
    async sendOtp(userId, type) {
        const isDev = process.env.NODE_ENV === 'development';
        const otp = isDev ? '123456' : (0, codeGenerator_1.generateSecureOTP)(6);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        const hashed = await bcrypt.hash(otp, 8);
        await this.userModel.updateOne({ _id: userId }, {
            otp: {
                code: hashed,
                type,
                expiresAt,
                attempts: 0,
                isUsed: false,
                lastSentAt: new Date(),
            },
        });
        const user = await this.userModel.findById(userId).lean();
        if (user)
            await this.emailService.sendOtpEmail(user.email, otp);
    }
    validateOtp(user, expectedType, otp) {
        if (process.env.NODE_ENV === 'development' && otp === '123456') {
            if (user.otp)
                user.otp.isUsed = true;
            return;
        }
        if (!user.otp || user.otp.type !== expectedType) {
            throw new common_1.BadRequestException('Invalid OTP request');
        }
        if (user.otp.isUsed)
            throw new common_1.BadRequestException('OTP already used');
        if (user.otp.expiresAt < new Date())
            throw new common_1.BadRequestException('OTP has expired');
        if ((user.otp.attempts || 0) >= 5)
            throw new common_1.BadRequestException('Too many OTP attempts');
        const codeRaw = user.otp.code;
        if (!codeRaw)
            throw new common_1.BadRequestException('OTP not found');
        user.otp.attempts = (user.otp.attempts || 0) + 1;
        const valid = bcrypt.compareSync(otp, codeRaw);
        if (!valid)
            throw new common_1.BadRequestException('Invalid OTP');
        user.otp.isUsed = true;
    }
    async issueTokens(user) {
        const { accessToken, refreshToken, jti } = this.tokenService.generateTokenPair(user._id.toString(), user.email);
        const hash = this.tokenService.hashRefreshTokenForStorage(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        user.sessions.push({
            jti,
            refreshTokenHash: hash,
            deviceInfo: 'mobile',
            createdAt: new Date(),
            expiresAt,
        });
        if (user.sessions.length > 5) {
            user.sessions = user.sessions.slice(-5);
        }
        await user.save();
        return {
            user: {
                _id: user._id.toString(),
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                isEmailVerified: user.isEmailVerified,
                coupleId: user.coupleId?.toString(),
            },
            tokens: { accessToken, refreshToken },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        token_service_1.TokenService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map