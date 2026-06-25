import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalJwtProvider } from './providers/local-jwt.provider';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import {
  PasswordResetNotifier,
  ConsolePasswordResetNotifier,
  NullPasswordResetNotifier,
} from './providers/password-reset-notifier';
import {
  EmailProvider,
  ConsoleEmailProvider,
  NullEmailProvider,
} from './providers/email-provider';
import { AuthThrottleGuard } from './guards/auth-throttle.guard';

export function passwordResetNotifierFactory(config: ConfigService): PasswordResetNotifier {
  const env = config.get<string>('NODE_ENV') ?? 'development';
  // ConsolePasswordResetNotifier only in isolated local development.
  // test / staging / production all use NullPasswordResetNotifier so raw
  // tokens are never written to shared or structured logs.
  if (env === 'development') {
    return new ConsolePasswordResetNotifier();
  }
  return new NullPasswordResetNotifier(config);
}

export function emailProviderFactory(config: ConfigService): EmailProvider {
  const env = config.get<string>('NODE_ENV') ?? 'development';
  // ConsoleEmailProvider only in isolated local development.
  // test / staging / production all use NullEmailProvider so raw
  // tokens are never written to shared or structured logs.
  if (env === 'development') {
    return new ConsoleEmailProvider();
  }
  return new NullEmailProvider(config);
}

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalJwtProvider,
    JwtAuthGuard,
    RolesGuard,
    AuthThrottleGuard,
    {
      provide: PasswordResetNotifier,
      inject: [ConfigService],
      useFactory: passwordResetNotifierFactory,
    },
    {
      provide: EmailProvider,
      inject: [ConfigService],
      useFactory: emailProviderFactory,
    },
  ],
  exports: [JwtAuthGuard, LocalJwtProvider, RolesGuard],
})
export class AuthModule {}
