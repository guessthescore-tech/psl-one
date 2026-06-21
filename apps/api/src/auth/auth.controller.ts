import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthThrottleGuard } from './guards/auth-throttle.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { TokenPayload } from './providers/auth.provider.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(AuthThrottleGuard)
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Headers('user-agent') ua: string,
  ) {
    const result = await this.authService.register(dto, ua);
    if (!result.enumerable) {
      return { message: 'Registration processed. Please check your inbox to confirm your account.' };
    }
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('login')
  @UseGuards(AuthThrottleGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Headers('user-agent') ua: string) {
    return this.authService.login(dto, ua);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: TokenPayload,
    @Headers('authorization') auth: string,
    @Headers('user-agent') ua: string,
  ) {
    const token = (auth ?? '').replace('Bearer ', '');
    await this.authService.logout(user.sub, token, ua);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: TokenPayload) {
    return this.authService.me(user.sub);
  }

  @Post('password-reset/request')
  @UseGuards(AuthThrottleGuard)
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() dto: PasswordResetRequestDto,
    @Headers('user-agent') ua: string,
  ) {
    await this.authService.requestPasswordReset(dto.email, ua);
    return { message: 'If this email is registered, a password reset link has been sent.' };
  }

  @Post('password-reset/confirm')
  @UseGuards(AuthThrottleGuard)
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(
    @Body() dto: PasswordResetConfirmDto,
    @Headers('user-agent') ua: string,
  ) {
    await this.authService.confirmPasswordReset(dto, ua);
    return { message: 'Password reset successfully.' };
  }

  @Post('password/change')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: TokenPayload,
    @Body() dto: ChangePasswordDto,
    @Headers('user-agent') ua: string,
  ) {
    await this.authService.changePassword(user.sub, dto, ua);
    return { message: 'Password changed successfully.' };
  }
}
