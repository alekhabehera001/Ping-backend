import { ConfigService } from '@nestjs/config';
export interface TokenPayload {
    userId: string;
    email: string;
    jti: string;
}
export interface VerificationTokenPayload {
    userId: string;
    otpType: string;
    verifiedAt: number;
    purpose: 'otp_verified';
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    jti: string;
}
export declare class TokenService {
    private readonly configService;
    private readonly accessPrivateKey;
    private readonly refreshPrivateKey;
    private readonly refreshPublicKey;
    private readonly accessExpiresIn;
    private readonly refreshExpiresIn;
    private readonly jwtSecret;
    private static readonly VERIFICATION_TOKEN_TTL_SECONDS;
    static readonly VERIFICATION_TOKEN_ERROR_STATUS = 419;
    constructor(configService: ConfigService);
    getRefreshSessionExpiresAt(): Date;
    private parseExpiresInToMs;
    private normalizeRefreshTokenInput;
    hashRefreshTokenForStorage(canonicalRefreshJwt: string): string;
    refreshTokenHashesEqual(a: string, b: string): boolean;
    parseVerifiedRefreshToken(token: string): {
        payload: TokenPayload;
        raw: string;
    };
    private toSignExpiresIn;
    generateTokenPair(userId: string, email: string): TokenPair;
    verifyRefreshToken(token: string): TokenPayload;
    generateVerificationToken(userId: string, otpType: string, verifiedAt: number): string;
    verifyVerificationToken(token: string): VerificationTokenPayload;
    parseRefreshTokenForLogout(token: string): {
        payload: TokenPayload;
        raw: string;
    };
}
