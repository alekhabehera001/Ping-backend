import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  sign,
  verify,
  TokenExpiredError,
  JsonWebTokenError,
  NotBeforeError,
  type SignOptions,
} from 'jsonwebtoken';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';

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

const BEARER_PREFIX_PATTERN = /^Bearer\s+/i;

@Injectable()
export class TokenService {
  private readonly accessPrivateKey: string;
  private readonly refreshPrivateKey: string;
  private readonly refreshPublicKey: string;
  /** Same format as jsonwebtoken `expiresIn` (e.g. 15m, 7d, or seconds as digits). */
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;
  private readonly jwtSecret: string;

  private static readonly VERIFICATION_TOKEN_TTL_SECONDS = 5 * 60; // 5 minutes
  /** Non-standard HTTP status used to signal a flow-restart required (expired/invalid verification token). */
  static readonly VERIFICATION_TOKEN_ERROR_STATUS = 419;

  constructor(private readonly configService: ConfigService) {
    this.accessPrivateKey = Buffer.from(
      this.configService.getOrThrow<string>('JWT_SECRET'),
      'base64',
    ).toString('utf-8');

    this.refreshPrivateKey = Buffer.from(
      this.configService.getOrThrow<string>('JWT_SECRET'),
      'base64',
    ).toString('utf-8');

    this.refreshPublicKey = Buffer.from(
      this.configService.getOrThrow<string>('JWT_SECRET'),
      'base64',
    ).toString('utf-8');

    this.accessExpiresIn = this.configService.getOrThrow<string>('JWT_EXPIRE_SECONDS');
    this.refreshExpiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRE_SECONDS');
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
  }

  /**
   * `sessions[].expiresAt` should match refresh JWT lifetime (from JWT_REFRESH_EXPIRE_SECONDS).
   */
  getRefreshSessionExpiresAt(): Date {
    return new Date(Date.now() + this.parseExpiresInToMs(this.refreshExpiresIn));
  }

  private parseExpiresInToMs(expiresIn: string): number {
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
    let factor: number;
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

  private normalizeRefreshTokenInput(token: string): string {
    let s = typeof token === 'string' ? token.trim() : '';
    if (!s) return s;
    const bearerPrefix = BEARER_PREFIX_PATTERN.exec(s);
    if (bearerPrefix) {
      s = s.slice(bearerPrefix[0].length).trim();
    }
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = s.slice(1, -1).trim();
    }
    return s;
  }

  /** SHA-256 hex of the exact refresh JWT string (after normalization). */
  hashRefreshTokenForStorage(canonicalRefreshJwt: string): string {
    return createHash('sha256').update(canonicalRefreshJwt, 'utf8').digest('hex');
  }

  refreshTokenHashesEqual(a: string, b: string): boolean {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length) {
      return false;
    }
    return timingSafeEqual(ba, bb);
  }

  /**
   * Verifies the refresh JWT and returns payload plus the canonical string used for verify/hash.
   */
  parseVerifiedRefreshToken(token: string): {
    payload: TokenPayload;
    raw: string;
  } {
    const raw = this.normalizeRefreshTokenInput(token);
    const jwtParts = raw.split('.');
    if (jwtParts.length !== 3) {
      throw new UnauthorizedException('Invalid refresh token. Please login again.');
    }

    try {
      const decoded = verify(raw, this.refreshPublicKey, {
        algorithms: ['RS256'],
        clockTolerance: 120,
      }) as TokenPayload;
      return { payload: decoded, raw };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Session expired. Please login again');
      }
      if (err instanceof NotBeforeError) {
        throw new UnauthorizedException('Session expired. Please login again');
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid refresh token. Please login again.');
      }
      throw new UnauthorizedException('Session expired. Please login again');
    }
  }

  /**
   * Converts a raw `expiresIn` string from env to the correct type for `jsonwebtoken.sign()`.
   * jsonwebtoken uses the `ms()` library for string values — `ms('900')` = 900 milliseconds,
   * NOT 900 seconds. Pure digit strings (e.g. `JWT_EXPIRE_SECONDS=900`) must be converted
   * to a number so jsonwebtoken treats them as seconds.
   */
  private toSignExpiresIn(value: string): string | number {
    const trimmed = value.trim();
    return /^\d+$/.test(trimmed) ? Number.parseInt(trimmed, 10) : trimmed;
  }

  generateTokenPair(userId: string, email: string): TokenPair {
    const jti = randomUUID();

    const accessToken = sign({ userId, email, jti }, this.accessPrivateKey, {
      algorithm: 'RS256',
      expiresIn: this.toSignExpiresIn(this.accessExpiresIn),
    } as SignOptions);

    const refreshToken = sign({ userId, email, jti }, this.refreshPrivateKey, {
      algorithm: 'RS256',
      expiresIn: this.toSignExpiresIn(this.refreshExpiresIn),
    } as SignOptions);

    return { accessToken, refreshToken, jti };
  }

  verifyRefreshToken(token: string): TokenPayload {
    return this.parseVerifiedRefreshToken(token).payload;
  }

  /**
   * Issues a short-lived (5 min) HS256 token that proves a specific OTP was verified.
   * Signed with JWT_SECRET — a different algorithm (HS256) and key from RS256 access tokens,
   * so it cannot be confused with or accepted as a Bearer access token.
   * The verifiedAt timestamp is embedded to enable single-use enforcement in /set-password.
   */
  generateVerificationToken(userId: string, otpType: string, verifiedAt: number): string {
    return sign(
      { userId, otpType, verifiedAt, purpose: 'otp_verified' } satisfies Omit<
        VerificationTokenPayload,
        never
      >,
      this.jwtSecret,
      { algorithm: 'HS256', expiresIn: TokenService.VERIFICATION_TOKEN_TTL_SECONDS },
    );
  }

  /**
   * Verifies the HS256 signature, checks expiry, and asserts the purpose field.
   * Throws HTTP 419 for expired or invalid tokens so the frontend can navigate
   * the user back to the start of the OTP flow.
   * Throws BadRequestException (400) only for a purpose-field mismatch (wrong token type).
   */
  verifyVerificationToken(token: string): VerificationTokenPayload {
    const errorStatus = TokenService.VERIFICATION_TOKEN_ERROR_STATUS;
    try {
      const payload = verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
      }) as VerificationTokenPayload;

      if (payload.purpose !== 'otp_verified') {
        throw new BadRequestException('Invalid verification token');
      }
      return payload;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      if (err instanceof TokenExpiredError) {
        throw new HttpException(
          { status: false, message: 'Verification token has expired. Please request a new OTP.' },
          errorStatus,
        );
      }
      throw new HttpException(
        { status: false, message: 'Invalid verification token' },
        errorStatus,
      );
    }
  }

  /**
   * Parses a refresh token for logout purposes.
   * Verifies the RS256 signature but intentionally ignores expiry so that clients
   * can always logout cleanly — even if the refresh token has already expired.
   * An invalid/forged signature is still rejected to prevent session-hijack via logout.
   */
  parseRefreshTokenForLogout(token: string): {
    payload: TokenPayload;
    raw: string;
  } {
    const raw = this.normalizeRefreshTokenInput(token);
    if (raw.split('.').length !== 3) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    try {
      const decoded = verify(raw, this.refreshPublicKey, {
        algorithms: ['RS256'],
        ignoreExpiration: true,
      }) as TokenPayload;
      return { payload: decoded, raw };
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
