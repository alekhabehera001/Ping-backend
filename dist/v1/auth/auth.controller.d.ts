import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
        message: string;
        data: {
            userId: string;
        };
    }>;
    verifyOtp(body: any): Promise<{
        message: string;
        data: import("./interfaces/auth.interface").AuthResponse;
    }>;
    resendOtp(body: any): Promise<{
        message: string;
    }>;
    login(body: any): Promise<{
        message: string;
        data: import("./interfaces/auth.interface").AuthResponse;
    }>;
    refresh(body: any): Promise<{
        message: string;
        data: import("./interfaces/auth.interface").AuthResponse;
    }>;
    forgotPassword(body: any): Promise<{
        message: string;
    }>;
    verifyResetOtp(body: any): Promise<{
        message: string;
        data: {
            verificationToken: string;
        };
    }>;
    resetPassword(body: any): Promise<{
        message: string;
    }>;
    logout(req: any, body: any): Promise<{
        message: string;
    }>;
    requestDelete(req: any): Promise<{
        message: string;
    }>;
    deleteAccount(req: any, body: any): Promise<{
        message: string;
    }>;
}
