"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jsonwebtoken_1 = require("jsonwebtoken");
const node_crypto_1 = require("node:crypto");
const BEARER_PREFIX_PATTERN = /^Bearer\s+/i;
let TokenService = TokenService_1 = class TokenService {
    constructor(configService) {
        this.configService = configService;
        this.accessPrivateKey = Buffer.from(this.configService.getOrThrow('JWT_SECRET'), 'base64').toString('utf-8');
        this.refreshPrivateKey = Buffer.from(this.configService.getOrThrow('JWT_SECRET'), 'base64').toString('utf-8');
        this.refreshPublicKey = Buffer.from(this.configService.getOrThrow('JWT_SECRET'), 'base64').toString('utf-8');
        this.accessExpiresIn = this.configService.getOrThrow('JWT_EXPIRE_SECONDS');
        this.refreshExpiresIn = this.configService.getOrThrow('JWT_REFRESH_EXPIRE_SECONDS');
        this.jwtSecret = this.configService.getOrThrow('JWT_SECRET');
    }
    getRefreshSessionExpiresAt() {
        return new Date(Date.now() + this.parseExpiresInToMs(this.refreshExpiresIn));
    }
    parseExpiresInToMs(expiresIn) {
        const s = expiresIn.trim();
        if (/^\d+$/.test(s)) {
            return Number.parseInt(s, 10) * 1000;
        }
        const m = /^(\d+)(ms|s|m|h|d|w)$/i.exec(s);
        if (!m) {
            throw new Error(`Invalid JWT expiry string: ${expiresIn}`);
        }
        const n = Number.parseInt(m[1], 10);
        const u = m[2].toLowerCase();
        let factor;
        switch (u) {
            case 'ms':
                factor = 1;
                break;
            case 's':
                factor = 1000;
                break;
            case 'm':
                factor = 60_000;
                break;
            case 'h':
                factor = 3_600_000;
                break;
            case 'd':
                factor = 86_400_000;
                break;
            case 'w':
                factor = 604_800_000;
                break;
            default:
                throw new Error(`Invalid JWT expiry unit: ${u}`);
        }
        return n * factor;
    }
    normalizeRefreshTokenInput(token) {
        let s = typeof token === 'string' ? token.trim() : '';
        if (!s)
            return s;
        const bearerPrefix = BEARER_PREFIX_PATTERN.exec(s);
        if (bearerPrefix) {
            s = s.slice(bearerPrefix[0].length).trim();
        }
        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
            s = s.slice(1, -1).trim();
        }
        return s;
    }
    hashRefreshTokenForStorage(canonicalRefreshJwt) {
        return (0, node_crypto_1.createHash)('sha256').update(canonicalRefreshJwt, 'utf8').digest('hex');
    }
    refreshTokenHashesEqual(a, b) {
        const ba = Buffer.from(a, 'hex');
        const bb = Buffer.from(b, 'hex');
        if (ba.length !== bb.length) {
            return false;
        }
        return (0, node_crypto_1.timingSafeEqual)(ba, bb);
    }
    parseVerifiedRefreshToken(token) {
        const raw = this.normalizeRefreshTokenInput(token);
        const jwtParts = raw.split('.');
        if (jwtParts.length !== 3) {
            throw new common_1.UnauthorizedException('Invalid refresh token. Please login again.');
        }
        try {
            const decoded = (0, jsonwebtoken_1.verify)(raw, this.refreshPublicKey, {
                algorithms: ['RS256'],
                clockTolerance: 120,
            });
            return { payload: decoded, raw };
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.TokenExpiredError) {
                throw new common_1.UnauthorizedException('Session expired. Please login again');
            }
            if (err instanceof jsonwebtoken_1.NotBeforeError) {
                throw new common_1.UnauthorizedException('Session expired. Please login again');
            }
            if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
                throw new common_1.UnauthorizedException('Invalid refresh token. Please login again.');
            }
            throw new common_1.UnauthorizedException('Session expired. Please login again');
        }
    }
    toSignExpiresIn(value) {
        const trimmed = value.trim();
        return /^\d+$/.test(trimmed) ? Number.parseInt(trimmed, 10) : trimmed;
    }
    generateTokenPair(userId, email) {
        const jti = (0, node_crypto_1.randomUUID)();
        const accessToken = (0, jsonwebtoken_1.sign)({ userId, email, jti }, this.accessPrivateKey, {
            algorithm: 'RS256',
            expiresIn: this.toSignExpiresIn(this.accessExpiresIn),
        });
        const refreshToken = (0, jsonwebtoken_1.sign)({ userId, email, jti }, this.refreshPrivateKey, {
            algorithm: 'RS256',
            expiresIn: this.toSignExpiresIn(this.refreshExpiresIn),
        });
        return { accessToken, refreshToken, jti };
    }
    verifyRefreshToken(token) {
        return this.parseVerifiedRefreshToken(token).payload;
    }
    generateVerificationToken(userId, otpType, verifiedAt) {
        return (0, jsonwebtoken_1.sign)({ userId, otpType, verifiedAt, purpose: 'otp_verified' }, this.jwtSecret, { algorithm: 'HS256', expiresIn: TokenService_1.VERIFICATION_TOKEN_TTL_SECONDS });
    }
    verifyVerificationToken(token) {
        const errorStatus = TokenService_1.VERIFICATION_TOKEN_ERROR_STATUS;
        try {
            const payload = (0, jsonwebtoken_1.verify)(token, this.jwtSecret, {
                algorithms: ['HS256'],
            });
            if (payload.purpose !== 'otp_verified') {
                throw new common_1.BadRequestException('Invalid verification token');
            }
            return payload;
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException)
                throw err;
            if (err instanceof jsonwebtoken_1.TokenExpiredError) {
                throw new common_1.HttpException({ status: false, message: 'Verification token has expired. Please request a new OTP.' }, errorStatus);
            }
            throw new common_1.HttpException({ status: false, message: 'Invalid verification token' }, errorStatus);
        }
    }
    parseRefreshTokenForLogout(token) {
        const raw = this.normalizeRefreshTokenInput(token);
        if (raw.split('.').length !== 3) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        try {
            const decoded = (0, jsonwebtoken_1.verify)(raw, this.refreshPublicKey, {
                algorithms: ['RS256'],
                ignoreExpiration: true,
            });
            return { payload: decoded, raw };
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
};
exports.TokenService = TokenService;
TokenService.VERIFICATION_TOKEN_TTL_SECONDS = 5 * 60;
TokenService.VERIFICATION_TOKEN_ERROR_STATUS = 419;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TokenService);
//# sourceMappingURL=token.service.js.map