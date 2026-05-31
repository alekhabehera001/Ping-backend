export interface RegisterInput {
    email: string;
    password: string;
    name: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface VerifyOtpInput {
    userId: string;
    otp: string;
}
export interface ForgotPasswordInput {
    email: string;
}
export interface ResetPasswordInput {
    verificationToken: string;
    newPassword: string;
    confirmPassword: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface AuthResponse {
    user: {
        _id: string;
        email: string;
        name: string;
        avatar?: string;
        isEmailVerified: boolean;
        coupleId?: string;
    };
    tokens: TokenPair;
}
