import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { AuditEvent, ConsentPurpose, UserRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LocalJwtProvider } from './providers/local-jwt.provider';
import { PasswordResetNotifier } from './providers/password-reset-notifier';
import { EmailProvider } from './providers/email-provider';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const BCRYPT_ROUNDS = 12;
const CONSENT_VERSION = '1.0';
const CONSENT_LEGAL_BASIS = 'consent';
const MIN_AGE_YEARS = 13;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

type SafeUser = { id: string; email: string; role: UserRole };

type EmailDeliveryStatus = 'SENT' | 'FAILED' | 'SKIPPED';

type RegisterResult =
  | { enumerable: true; accessToken: string; user: SafeUser & { emailVerified: boolean }; emailDeliveryStatus: EmailDeliveryStatus }
  | { enumerable: false };

type LoginResult = { accessToken: string; user: SafeUser & { emailVerified: boolean } };

export type UserProfile = {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  dateOfBirth: Date;
  isVerified: boolean;
  createdAt: Date;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private authProvider: LocalJwtProvider,
    private passwordResetNotifier: PasswordResetNotifier,
    private emailProvider: EmailProvider,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto, userAgent?: string): Promise<RegisterResult> {
    if (!dto.consentCoreService) {
      throw new BadRequestException('Consent to core service terms is required');
    }

    const age = this.calculateAge(new Date(dto.dateOfBirth));
    if (age < MIN_AGE_YEARS) {
      throw new BadRequestException('Age requirement not met');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });

    if (existing) {
      await this.writeAuditLog(null, AuditEvent.REGISTER, false, userAgent);
      return { enumerable: false };
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const saIdHash = dto.saId ? await bcrypt.hash(dto.saId, BCRYPT_ROUNDS) : null;

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          phone: dto.phone ?? null,
          saIdHash,
          passwordHash,
          role: UserRole.FAN,
          dateOfBirth: new Date(dto.dateOfBirth),
        },
      });

      const consents: Array<{
        userId: string;
        purpose: ConsentPurpose;
        version: string;
        legalBasis: string;
      }> = [
        {
          userId: newUser.id,
          purpose: ConsentPurpose.CORE_SERVICE,
          version: CONSENT_VERSION,
          legalBasis: CONSENT_LEGAL_BASIS,
        },
      ];

      if (dto.consentMarketing) {
        consents.push({
          userId: newUser.id,
          purpose: ConsentPurpose.MARKETING,
          version: CONSENT_VERSION,
          legalBasis: CONSENT_LEGAL_BASIS,
        });
      }

      if (dto.consentAnalytics) {
        consents.push({
          userId: newUser.id,
          purpose: ConsentPurpose.ANALYTICS,
          version: CONSENT_VERSION,
          legalBasis: CONSENT_LEGAL_BASIS,
        });
      }

      await tx.consentRecord.createMany({ data: consents });
      return newUser;
    });

    await this.writeAuditLog(user.id, AuditEvent.REGISTER, true, userAgent);

    // Trigger email verification — failure must not block registration
    let emailDeliveryStatus: EmailDeliveryStatus = 'SKIPPED';
    try {
      await this.requestEmailVerification(user.id, user.email, userAgent);
      emailDeliveryStatus = 'SENT';
    } catch (err: unknown) {
      emailDeliveryStatus = 'FAILED';
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn({ action: 'auth.register.email_verification_failed', userId: user.id, error: msg });
    }

    const accessToken = await this.authProvider.signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      enumerable: true,
      accessToken,
      user: { id: user.id, email: user.email, role: user.role, emailVerified: false },
      emailDeliveryStatus,
    };
  }

  async login(dto: LoginDto, userAgent?: string): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    const valid =
      user && user.isActive ? await bcrypt.compare(dto.password, user.passwordHash) : false;

    if (!user || !valid) {
      await this.writeAuditLog(user?.id ?? null, AuditEvent.LOGIN, false, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.writeAuditLog(user.id, AuditEvent.LOGIN, true, userAgent);

    const accessToken = await this.authProvider.signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.isVerified,
      },
    };
  }

  async logout(userId: string, token: string, userAgent?: string): Promise<void> {
    await this.authProvider.logout(userId, token);
    await this.writeAuditLog(userId, AuditEvent.LOGOUT, true, userAgent);
  }

  async me(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        dateOfBirth: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) throw new UnauthorizedException();

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      dateOfBirth: user.dateOfBirth,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }

  async requestPasswordReset(email: string, userAgent?: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, isActive: true },
    });

    if (user && user.isActive) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      await this.writeAuditLog(user.id, AuditEvent.PASSWORD_RESET_REQUEST, true, userAgent);

      await this.passwordResetNotifier.sendPasswordResetEmail(email, rawToken);
    } else {
      await this.writeAuditLog(null, AuditEvent.PASSWORD_RESET_REQUEST, false, userAgent);
    }
  }

  async confirmPasswordReset(dto: PasswordResetConfirmDto, userAgent?: string): Promise<void> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!resetToken) {
      throw new BadRequestException('Reset link is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.writeAuditLog(resetToken.userId, AuditEvent.PASSWORD_RESET_CONFIRM, true, userAgent);
  }

  async requestEmailVerification(userId: string, email: string, userAgent?: string): Promise<void> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    // Invalidate any existing unused tokens for this user before creating a new one
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId, usedAt: null },
    });

    await this.prisma.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    const baseUrl = this.config.get<string>('APP_BASE_URL') ?? 'http://localhost:3001';
    const verifyUrl = `${baseUrl}/verify-email?token=${rawToken}`;

    await this.emailProvider.sendEmailVerification(email, verifyUrl);

    await this.writeAuditLog(userId, AuditEvent.EMAIL_VERIFICATION_REQUEST, true, userAgent);
  }

  async confirmEmailVerification(
    rawToken: string,
    userAgent?: string,
  ): Promise<{ emailVerified: boolean }> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const token = await this.prisma.emailVerificationToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!token) {
      throw new BadRequestException('Verification link is invalid or has expired');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { isVerified: true },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.writeAuditLog(token.userId, AuditEvent.EMAIL_VERIFICATION_CONFIRM, true, userAgent);

    return { emailVerified: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto, userAgent?: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true, isActive: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedException();

    const currentValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!currentValid) {
      await this.writeAuditLog(userId, AuditEvent.PASSWORD_CHANGE_FAILED, false, userAgent);
      throw new BadRequestException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    await this.writeAuditLog(userId, AuditEvent.PASSWORD_CHANGED, true, userAgent);
  }

  private calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  // Audit log is append-only. This method only creates, never updates or deletes.
  private async writeAuditLog(
    userId: string | null,
    event: AuditEvent,
    success: boolean,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.prisma.authAuditLog.create({
        data: { userId, event, success, userAgent: userAgent ?? null },
      });
    } catch {
      // Audit failure must not break the primary flow. Errors are silent here
      // but would be caught by an observability layer in production.
    }
  }
}
