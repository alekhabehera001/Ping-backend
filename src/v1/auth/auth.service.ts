import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { generateSecureOTP } from '../../common/utils/codeGenerator';
import { EmailService } from '../../services/email.service';
import { TokenService } from '../../services/token.service';
import { User, UserDocument } from '../../schemas/user.schema';
import {
  AuthResponse,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyOtpInput,
} from './interfaces/auth.interface';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const OTP_EXPIRY_MINUTES = 5;
const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {}

  async register(input: RegisterInput): Promise<{ userId: string }> {
    const existing = await this.userModel.findOne({ email: input.email, isDeleted: false }).lean();
    if (existing) {
      if (!existing.isEmailVerified) {
        await this.sendOtp(existing._id as Types.ObjectId, 'email_verification');
        return { userId: (existing._id as Types.ObjectId).toString() };
      }
      throw new ConflictException('Email is already registered');
    }

    const hashed = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await this.userModel.create({
      email: input.email,
      password: hashed,
      name: input.name,
    });

    await this.sendOtp(user._id as Types.ObjectId, 'email_verification');
    return { userId: (user._id as Types.ObjectId).toString() };
  }

  async verifyOtp(input: VerifyOtpInput): Promise<AuthResponse> {
    const user = await this.userModel
      .findOne({ _id: input.userId, isDeleted: false })
      .select('+otp.code')
      .exec();

    if (!user) throw new NotFoundException('User not found');

    this.validateOtp(user, 'email_verification', input.otp);

    user.isEmailVerified = true;
    user.otp = undefined as any;
    await user.save();

    return this.issueTokens(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.userModel
      .findOne({ email: input.email, isDeleted: false })
      .select('+password +otp.code')
      .exec();

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isEmailVerified) {
      await this.sendOtp(user._id as Types.ObjectId, 'email_verification');
      throw new UnauthorizedException('Email not verified. OTP resent.');
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const remaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account locked. Try again in ${remaining} minutes.`);
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.loginAttempts = 0;
      }
      await user.save();
      throw new UnauthorizedException('Invalid credentials');
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined as any;
    await user.save();

    return this.issueTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    const { payload, raw } = this.tokenService.parseVerifiedRefreshToken(refreshToken);
    const user = await this.userModel
      .findOne({ _id: payload.userId, isDeleted: false, 'sessions.jti': payload.jti })
      .exec();

    if (!user) throw new UnauthorizedException('Session not found');

    const session = user.sessions.find((s) => s.jti === payload.jti);
    if (!session) throw new UnauthorizedException('Session expired');

    const storedHash = this.tokenService.hashRefreshTokenForStorage(raw);
    if (!this.tokenService.refreshTokenHashesEqual(storedHash, session.refreshTokenHash || '')) {
      throw new UnauthorizedException('Token reuse detected');
    }

    user.sessions = user.sessions.filter((s) => s.jti !== payload.jti) as any;
    await user.save();

    return this.issueTokens(user);
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await this.userModel.findOne({ email: input.email, isDeleted: false }).lean();
    if (!user) return;
    await this.sendOtp(user._id as Types.ObjectId, 'password_reset');
  }

  async verifyPasswordResetOtp(userId: string, otp: string): Promise<string> {
    const user = await this.userModel
      .findOne({ _id: userId, isDeleted: false })
      .select('+otp.code')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    this.validateOtp(user, 'password_reset', otp);
    user.otp!.isUsed = true;
    await user.save();
    return this.tokenService.generateVerificationToken(userId, 'password_reset', Date.now());
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const payload = this.tokenService.verifyVerificationToken(input.verificationToken);
    const user = await this.userModel.findOne({ _id: payload.userId, isDeleted: false }).exec();
    if (!user) throw new NotFoundException('User not found');
    user.password = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
    user.sessions = [] as any;
    await user.save();
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const { payload } = this.tokenService.parseRefreshTokenForLogout(refreshToken);
    await this.userModel.updateOne(
      { _id: userId },
      { $pull: { sessions: { jti: payload.jti } } },
    );
  }

  async resendOtp(userId: string): Promise<void> {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).exec();
    if (!user) throw new NotFoundException('User not found');
    const otpType = user.isEmailVerified ? 'password_reset' : 'email_verification';
    await this.sendOtp(user._id as Types.ObjectId, otpType);
  }

  async deleteAccount(userId: string, otp: string): Promise<void> {
    const user = await this.userModel
      .findOne({ _id: userId, isDeleted: false })
      .select('+otp.code')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    this.validateOtp(user, 'account_deletion', otp);
    user.isDeleted = true;
    user.sessions = [] as any;
    await user.save();
  }

  async requestAccountDeletion(userId: string): Promise<void> {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).exec();
    if (!user) throw new NotFoundException('User not found');
    await this.sendOtp(user._id as Types.ObjectId, 'account_deletion');
  }

  private async sendOtp(userId: Types.ObjectId, type: string): Promise<void> {
    const isDev = process.env.NODE_ENV === 'development';
    const otp = isDev ? '123456' : generateSecureOTP(6);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const hashed = await bcrypt.hash(otp, 8);
    await this.userModel.updateOne(
      { _id: userId },
      {
        otp: {
          code: hashed,
          type,
          expiresAt,
          attempts: 0,
          isUsed: false,
          lastSentAt: new Date(),
        },
      },
    );

    const user = await this.userModel.findById(userId).lean();
    if (user) await this.emailService.sendOtpEmail(user.email, otp);
  }

  private validateOtp(user: UserDocument, expectedType: string, otp: string): void {
    // In development, static OTP bypasses all checks
    if (process.env.NODE_ENV === 'development' && otp === '123456') {
      if (user.otp) user.otp.isUsed = true;
      return;
    }

    if (!user.otp || user.otp.type !== expectedType) {
      throw new BadRequestException('Invalid OTP request');
    }
    if (user.otp.isUsed) throw new BadRequestException('OTP already used');
    if (user.otp.expiresAt < new Date()) throw new BadRequestException('OTP has expired');
    if ((user.otp.attempts || 0) >= 5) throw new BadRequestException('Too many OTP attempts');

    const codeRaw = (user.otp as any).code;
    if (!codeRaw) throw new BadRequestException('OTP not found');

    user.otp.attempts = (user.otp.attempts || 0) + 1;

    const valid = bcrypt.compareSync(otp, codeRaw);
    if (!valid) throw new BadRequestException('Invalid OTP');

    user.otp.isUsed = true;
  }

  private async issueTokens(user: UserDocument): Promise<AuthResponse> {
    const { accessToken, refreshToken, jti } = this.tokenService.generateTokenPair(
      (user._id as Types.ObjectId).toString(),
      user.email,
    );

    const hash = this.tokenService.hashRefreshTokenForStorage(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.sessions.push({
      jti,
      refreshTokenHash: hash,
      deviceInfo: 'mobile',
      createdAt: new Date(),
      expiresAt,
    } as any);

    if (user.sessions.length > 5) {
      user.sessions = user.sessions.slice(-5) as any;
    }

    await user.save();

    return {
      user: {
        _id: (user._id as Types.ObjectId).toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        coupleId: user.coupleId?.toString(),
      },
      tokens: { accessToken, refreshToken },
    };
  }
}
