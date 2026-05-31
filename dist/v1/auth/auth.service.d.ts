import { Model } from 'mongoose';
import { EmailService } from '../../services/email.service';
import { TokenService } from '../../services/token.service';
import { UserDocument } from '../../schemas/user.schema';
import { AuthResponse, ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput, VerifyOtpInput } from './interfaces/auth.interface';
export declare class AuthService {
    private readonly userModel;
    private readonly tokenService;
    private readonly emailService;
    constructor(userModel: Model<UserDocument>, tokenService: TokenService, emailService: EmailService);
    register(input: RegisterInput): Promise<{
        userId: string;
    }>;
    verifyOtp(input: VerifyOtpInput): Promise<AuthResponse>;
    login(input: LoginInput): Promise<AuthResponse>;
    refreshTokens(refreshToken: string): Promise<AuthResponse>;
    forgotPassword(input: ForgotPasswordInput): Promise<void>;
    verifyPasswordResetOtp(userId: string, otp: string): Promise<string>;
    resetPassword(input: ResetPasswordInput): Promise<void>;
    logout(userId: string, refreshToken: string): Promise<void>;
    resendOtp(userId: string): Promise<void>;
    deleteAccount(userId: string, otp: string): Promise<void>;
    requestAccountDeletion(userId: string): Promise<void>;
    private sendOtp;
    private validateOtp;
    private issueTokens;
}
