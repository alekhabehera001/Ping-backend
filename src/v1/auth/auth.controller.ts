import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';
import { Public } from '../../decorators/public.decorator';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { AuthService } from './auth.service';
import {
  deleteAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from './validation/auth.validation';

@ApiTags('Auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body(new JoiValidationPipe(registerSchema)) body: any) {
    const result = await this.authService.register(body);
    return { message: 'OTP sent to your email', data: result };
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and get tokens' })
  async verifyOtp(@Body(new JoiValidationPipe(verifyOtpSchema)) body: any) {
    const result = await this.authService.verifyOtp(body);
    return { message: 'Email verified successfully', data: result };
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP' })
  async resendOtp(@Body(new JoiValidationPipe(resendOtpSchema)) body: any) {
    await this.authService.resendOtp(body.userId);
    return { message: 'OTP resent successfully' };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  async login(@Body(new JoiValidationPipe(loginSchema)) body: any) {
    const result = await this.authService.login(body);
    return { message: 'Login successful', data: result };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body(new JoiValidationPipe(refreshTokenSchema)) body: any) {
    const result = await this.authService.refreshTokens(body.refreshToken);
    return { message: 'Tokens refreshed', data: result };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset OTP' })
  async forgotPassword(@Body(new JoiValidationPipe(forgotPasswordSchema)) body: any) {
    await this.authService.forgotPassword(body);
    return { message: 'If that email exists, a reset OTP has been sent' };
  }

  @Public()
  @Post('verify-reset-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify password reset OTP' })
  async verifyResetOtp(@Body(new JoiValidationPipe(verifyOtpSchema)) body: any) {
    const verificationToken = await this.authService.verifyPasswordResetOtp(body.userId, body.otp);
    return { message: 'OTP verified', data: { verificationToken } };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with verification token' })
  async resetPassword(@Body(new JoiValidationPipe(resetPasswordSchema)) body: any) {
    await this.authService.resetPassword(body);
    return { message: 'Password reset successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout (invalidate session)' })
  async logout(
    @Request() req: any,
    @Body(new JoiValidationPipe(logoutSchema)) body: any,
  ) {
    await this.authService.logout(req.user._id.toString(), body.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('request-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request account deletion OTP' })
  async requestDelete(@Request() req: any) {
    await this.authService.requestAccountDeletion(req.user._id.toString());
    return { message: 'OTP sent for account deletion' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete account' })
  async deleteAccount(
    @Request() req: any,
    @Body(new JoiValidationPipe(deleteAccountSchema)) body: any,
  ) {
    await this.authService.deleteAccount(req.user._id.toString(), body.otp);
    return { message: 'Account deleted successfully' };
  }
}
