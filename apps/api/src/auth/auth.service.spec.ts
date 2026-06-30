import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { BadRequestException, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { AuditEvent } from '@prisma/client';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { PrismaService } from '../prisma/prisma.service';
import type { LocalJwtProvider } from './providers/local-jwt.provider';
import type { PasswordResetNotifier } from './providers/password-reset-notifier';
import type { EmailProvider } from './providers/email-provider';
import type { RegisterDto } from './dto/register.dto';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('$2b$12$mockedhash'),
  compare: vi.fn().mockResolvedValue(true),
}));

import * as bcrypt from 'bcrypt';

const makePrismaMock = () => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
  },
  consentRecord: {
    createMany: vi.fn().mockResolvedValue({}),
  },
  authAuditLog: {
    create: vi.fn().mockResolvedValue({}),
  },
  passwordResetToken: {
    create: vi.fn().mockResolvedValue({}),
    findFirst: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
  },
  emailVerificationToken: {
    create: vi.fn().mockResolvedValue({}),
    findFirst: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({}),
  },
  $transaction: vi.fn().mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: unknown) => Promise<unknown>)(makePrismaMock());
    }
    return Promise.all(arg as Promise<unknown>[]);
  }),
});

const makeProviderMock = () => ({
  signToken: vi.fn().mockResolvedValue('mock-access-token'),
  verifyToken: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
});

const makeNotifierMock = () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
});

const makeEmailProviderMock = () => ({
  sendEmailVerification: vi.fn().mockResolvedValue(undefined),
  sendPasswordReset: vi.fn().mockResolvedValue(undefined),
});

const makeConfigMock = () => ({
  get: vi.fn().mockReturnValue(undefined),
  getOrThrow: vi.fn().mockReturnValue('http://localhost:3001'),
});

const VALID_REGISTER_DTO: RegisterDto = {
  email: 'fan@pslone.co.za',
  password: 'Password1!',
  dateOfBirth: '2000-01-01',
  consentCoreService: true,
};

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let provider: ReturnType<typeof makeProviderMock>;
  let notifier: ReturnType<typeof makeNotifierMock>;
  let emailProvider: ReturnType<typeof makeEmailProviderMock>;
  let configService: ReturnType<typeof makeConfigMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    provider = makeProviderMock();
    notifier = makeNotifierMock();
    emailProvider = makeEmailProviderMock();
    configService = makeConfigMock();

    prisma.$transaction = vi.fn().mockImplementation(async (arg: unknown) => {
      if (typeof arg === 'function') {
        const tx = {
          user: { create: prisma.user.create },
          consentRecord: { createMany: prisma.consentRecord.createMany },
        };
        return (arg as (tx: unknown) => Promise<unknown>)(tx);
      }
      return Promise.all(arg as Promise<unknown>[]);
    });

    authService = new AuthService(
      prisma as unknown as PrismaService,
      provider as unknown as LocalJwtProvider,
      notifier as unknown as PasswordResetNotifier,
      emailProvider as unknown as EmailProvider,
      configService as never,
    );
  });

  // ── 1. Register success ───────────────────────────────────────────────────
  it('register returns accessToken and FAN user on success', async () => {
    const newUser = { id: 'uid-1', email: 'fan@pslone.co.za', role: 'FAN' as const };
    (prisma.user.findUnique as Mock).mockResolvedValue(null);
    (prisma.user.create as Mock).mockResolvedValue(newUser);

    const result = await authService.register(VALID_REGISTER_DTO);

    expect(result).toMatchObject({
      enumerable: true,
      accessToken: 'mock-access-token',
      user: { email: 'fan@pslone.co.za', role: 'FAN' },
    });
  });

  // ── 2. Duplicate email does not enumerate ─────────────────────────────────
  it('register returns non-enumerating result when email already exists', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'existing-uid' });

    const result = await authService.register(VALID_REGISTER_DTO);

    expect(result).toEqual({ enumerable: false });
    expect((result as { accessToken?: string }).accessToken).toBeUndefined();
  });

  // ── 3. Underage registration blocked ──────────────────────────────────────
  it('register throws when user is under 13', async () => {
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

    const dto: RegisterDto = {
      ...VALID_REGISTER_DTO,
      dateOfBirth: tenYearsAgo.toISOString().split('T')[0]!,
    };

    await expect(authService.register(dto)).rejects.toThrow(BadRequestException);
  });

  // ── 4. Missing core-service consent blocked ───────────────────────────────
  it('register throws when consentCoreService is false', async () => {
    const dto: RegisterDto = { ...VALID_REGISTER_DTO, consentCoreService: false };

    await expect(authService.register(dto)).rejects.toThrow(BadRequestException);
  });

  // ── 5. Register creates unverified user and triggers verification ─────────
  it('register creates unverified user and triggers email verification', async () => {
    const newUser = { id: 'uid-1', email: 'fan@pslone.co.za', role: 'FAN' as const };
    (prisma.user.findUnique as Mock).mockResolvedValue(null);
    (prisma.user.create as Mock).mockResolvedValue(newUser);

    const result = await authService.register(VALID_REGISTER_DTO);

    expect(result).toMatchObject({ enumerable: true });
    if (result.enumerable) {
      expect(result.user.emailVerified).toBe(false);
    }
    expect(emailProvider.sendEmailVerification).toHaveBeenCalledWith(
      'fan@pslone.co.za',
      expect.stringContaining('/verify-email?token='),
    );
  });

  // ── 6. Login success ──────────────────────────────────────────────────────
  it('login returns accessToken on valid credentials', async () => {
    const user = {
      id: 'uid-1',
      email: 'fan@pslone.co.za',
      role: 'FAN',
      passwordHash: '$2b$12$mockedhash',
      isActive: true,
      isVerified: false,
    };
    (prisma.user.findUnique as Mock).mockResolvedValue(user);
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

    const result = await authService.login({ email: 'fan@pslone.co.za', password: 'Password1!' });

    expect(result).toMatchObject({ accessToken: 'mock-access-token' });
  });

  // ── 7. Login includes emailVerified field ─────────────────────────────────
  it('login includes emailVerified field reflecting isVerified from DB', async () => {
    const verifiedUser = {
      id: 'uid-2',
      email: 'verified@pslone.co.za',
      role: 'FAN',
      passwordHash: '$2b$12$mockedhash',
      isActive: true,
      isVerified: true,
    };
    (prisma.user.findUnique as Mock).mockResolvedValue(verifiedUser);
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

    const result = await authService.login({
      email: 'verified@pslone.co.za',
      password: 'Password1!',
    });

    expect(result.user.emailVerified).toBe(true);
  });

  // ── 8. Failed login is audited ────────────────────────────────────────────
  it('login writes a failed audit log entry on wrong password', async () => {
    const user = {
      id: 'uid-1',
      email: 'fan@pslone.co.za',
      passwordHash: '$2b$12$mockedhash',
      isActive: true,
      isVerified: false,
    };
    (prisma.user.findUnique as Mock).mockResolvedValue(user);
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

    await expect(
      authService.login({ email: 'fan@pslone.co.za', password: 'WrongPass!' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(prisma.authAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ event: AuditEvent.LOGIN, success: false }),
      }),
    );
  });

  // ── 9. Password reset: reset URL delivered via emailProvider, token never logged ────
  it('requestPasswordReset delivers reset URL via emailProvider, never logs the raw token', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'uid-1', isActive: true });

    await authService.requestPasswordReset('fan@pslone.co.za');

    // emailProvider was called with the email and a URL containing the token
    expect(emailProvider.sendPasswordReset).toHaveBeenCalledWith(
      'fan@pslone.co.za',
      expect.stringContaining('/reset-password?token='),
    );

    // The raw token must not appear in any console.log call
    const resetUrl = (emailProvider.sendPasswordReset as Mock).mock.calls[0]?.[1] as string;
    const rawToken = new URL(resetUrl).searchParams.get('token') as string;
    expect(rawToken.length).toBeGreaterThan(0);
    const logCalls = consoleSpy.mock.calls.flat().join(' ');
    expect(logCalls).not.toContain(rawToken);

    consoleSpy.mockRestore();
  });

  // ── 10. Password reset: only the hash is stored in DB, not the raw token ──
  it('requestPasswordReset stores tokenHash in DB, not raw token', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'uid-1', isActive: true });

    await authService.requestPasswordReset('fan@pslone.co.za');

    const createCall = (prisma.passwordResetToken.create as Mock).mock.calls[0]?.[0] as {
      data: { tokenHash: string };
    };
    const storedHash = createCall.data.tokenHash;

    // Extract raw token from the reset URL passed to emailProvider
    const resetUrl = (emailProvider.sendPasswordReset as Mock).mock.calls[0]?.[1] as string;
    const rawToken = new URL(resetUrl).searchParams.get('token') as string;

    // The value stored is the SHA-256 hash of the raw token, not the token itself
    expect(storedHash).toBe(createHash('sha256').update(rawToken).digest('hex'));
    expect(storedHash).not.toBe(rawToken);
  });

  // ── 11. Password reset request does not enumerate ─────────────────────────
  it('requestPasswordReset resolves without error for unknown email', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue(null);

    await expect(
      authService.requestPasswordReset('ghost@nowhere.co.za'),
    ).resolves.toBeUndefined();

    expect(emailProvider.sendPasswordReset).not.toHaveBeenCalled();

    expect(prisma.authAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: null, event: AuditEvent.PASSWORD_RESET_REQUEST, success: false }),
      }),
    );
  });

  // ── 12. Password reset confirm works ─────────────────────────────────────
  it('confirmPasswordReset updates password when token is valid', async () => {
    const rawToken = 'valid-raw-token-abc123';
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const mockToken = {
      id: 'token-id',
      userId: 'uid-1',
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    };

    (prisma.passwordResetToken.findFirst as Mock).mockResolvedValue(mockToken);
    prisma.$transaction = vi.fn().mockResolvedValue([{}, {}]);

    await expect(
      authService.confirmPasswordReset({ token: rawToken, newPassword: 'NewPassword1!' }),
    ).resolves.toBeUndefined();
  });

  // ── 13. requestEmailVerification creates hashed token, not raw ────────────
  it('requestEmailVerification creates hashed token in DB, not raw token', async () => {
    await authService.requestEmailVerification('uid-1', 'fan@pslone.co.za');

    const createCall = (prisma.emailVerificationToken.create as Mock).mock.calls[0]?.[0] as {
      data: { tokenHash: string; userId: string };
    };
    const storedHash = createCall.data.tokenHash;

    // The URL passed to the provider contains the raw token
    const verifyUrl = (emailProvider.sendEmailVerification as Mock).mock.calls[0]?.[1] as string;
    const rawToken = new URL(verifyUrl).searchParams.get('token') as string;

    expect(storedHash).toBe(createHash('sha256').update(rawToken).digest('hex'));
    expect(storedHash).not.toBe(rawToken);
    expect(createCall.data.userId).toBe('uid-1');
  });

  // ── 14. requestEmailVerification audits the event ────────────────────────
  it('requestEmailVerification writes EMAIL_VERIFICATION_REQUEST audit log', async () => {
    await authService.requestEmailVerification('uid-1', 'fan@pslone.co.za');

    expect(prisma.authAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'uid-1',
          event: AuditEvent.EMAIL_VERIFICATION_REQUEST,
          success: true,
        }),
      }),
    );
  });

  // ── 15. confirmEmailVerification with valid token sets isVerified=true ────
  it('confirmEmailVerification with valid token sets isVerified=true', async () => {
    const rawToken = 'valid-verify-token-xyz';
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const mockToken = {
      id: 'ev-token-id',
      userId: 'uid-1',
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    };

    (prisma.emailVerificationToken.findFirst as Mock).mockResolvedValue(mockToken);
    prisma.$transaction = vi.fn().mockResolvedValue([{}, {}]);

    const result = await authService.confirmEmailVerification(rawToken);

    expect(result).toEqual({ emailVerified: true });
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  // ── 16. confirmEmailVerification with expired token throws ────────────────
  it('confirmEmailVerification with expired token throws BadRequestException', async () => {
    (prisma.emailVerificationToken.findFirst as Mock).mockResolvedValue(null);

    await expect(
      authService.confirmEmailVerification('expired-token'),
    ).rejects.toThrow(BadRequestException);
  });

  // ── 17. confirmEmailVerification with invalid token throws ────────────────
  it('confirmEmailVerification with invalid token throws BadRequestException', async () => {
    (prisma.emailVerificationToken.findFirst as Mock).mockResolvedValue(null);

    await expect(
      authService.confirmEmailVerification('completely-invalid-token'),
    ).rejects.toThrow('Verification link is invalid or has expired');
  });

  // ── 18. confirmEmailVerification with already-used token throws ───────────
  it('confirmEmailVerification with already-used token throws BadRequestException', async () => {
    // findFirst with usedAt: null will return null when token is used
    (prisma.emailVerificationToken.findFirst as Mock).mockResolvedValue(null);

    await expect(
      authService.confirmEmailVerification('already-used-token'),
    ).rejects.toThrow(BadRequestException);
  });

  // ── 19. confirmEmailVerification audits the event ─────────────────────────
  it('confirmEmailVerification writes EMAIL_VERIFICATION_CONFIRM audit log', async () => {
    const rawToken = 'audit-test-token';
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const mockToken = {
      id: 'ev-token-id',
      userId: 'uid-audit',
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    };

    (prisma.emailVerificationToken.findFirst as Mock).mockResolvedValue(mockToken);
    prisma.$transaction = vi.fn().mockResolvedValue([{}, {}]);

    await authService.confirmEmailVerification(rawToken);

    expect(prisma.authAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'uid-audit',
          event: AuditEvent.EMAIL_VERIFICATION_CONFIRM,
          success: true,
        }),
      }),
    );
  });

  // ── 20. Email provider never receives raw token directly (only URL) ────────
  it('email provider receives verifyUrl containing token param, not a raw 32-byte hex string as a direct arg', async () => {
    await authService.requestEmailVerification('uid-1', 'fan@pslone.co.za');

    const callArgs = (emailProvider.sendEmailVerification as Mock).mock.calls[0] as [
      string,
      string,
    ];
    const [toArg, urlArg] = callArgs;

    // First arg is the email address (no raw token)
    expect(toArg).toBe('fan@pslone.co.za');
    // Second arg is a URL string containing the token as a query parameter
    expect(urlArg).toMatch(/\/verify-email\?token=[0-9a-f]{64}/);
  });
});

// ── JwtAuthGuard requires Authorization header ────────────────────────────
describe('JwtAuthGuard', () => {
  it('throws UnauthorizedException when no Authorization header is present', async () => {
    const mockProvider = { verifyToken: vi.fn() } as unknown as LocalJwtProvider;
    const guard = new JwtAuthGuard(mockProvider);

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when Bearer token is invalid', async () => {
    const mockProvider = {
      verifyToken: vi.fn().mockRejectedValue(new Error('invalid')),
    } as unknown as LocalJwtProvider;
    const guard = new JwtAuthGuard(mockProvider);

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer bad-token' } }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});

describe('AuthService — emailDeliveryStatus', () => {
  let authService: AuthService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let emailProvider: ReturnType<typeof makeEmailProviderMock>;

  const VALID_DTO = {
    email: 'fan@pslone.co.za',
    password: 'Password123!',
    dateOfBirth: '2000-01-01',
    consentCoreService: true as const,
  };

  function setup(emailSendResult: 'success' | 'failure') {
    prisma = makePrismaMock();
    emailProvider = makeEmailProviderMock();
    const provider = makeProviderMock();
    const notifier = makeNotifierMock();
    const configService = makeConfigMock();

    prisma.$transaction = vi.fn().mockImplementation(async (arg: unknown) => {
      if (typeof arg === 'function') {
        const tx = {
          user: { create: prisma.user.create },
          consentRecord: { createMany: prisma.consentRecord.createMany },
        };
        return (arg as (tx: unknown) => Promise<unknown>)(tx);
      }
      return Promise.all(arg as Promise<unknown>[]);
    });

    if (emailSendResult === 'failure') {
      (emailProvider.sendEmailVerification as Mock).mockRejectedValue(new Error('SMTP connection refused'));
    }

    return new AuthService(
      prisma as unknown as PrismaService,
      provider as unknown as LocalJwtProvider,
      notifier as unknown as PasswordResetNotifier,
      emailProvider as unknown as EmailProvider,
      configService as never,
    );
  }

  it('returns emailDeliveryStatus SENT when email send succeeds', async () => {
    authService = setup('success');
    const newUser = { id: 'uid-1', email: 'fan@pslone.co.za', role: 'FAN' as const };
    (prisma.user.findUnique as Mock).mockResolvedValue(null);
    (prisma.user.create as Mock).mockResolvedValue(newUser);

    const result = await authService.register(VALID_DTO);

    expect(result.enumerable).toBe(true);
    if (result.enumerable) {
      expect(result.emailDeliveryStatus).toBe('SENT');
    }
  });

  it('returns emailDeliveryStatus FAILED when SMTP throws — user is still created', async () => {
    authService = setup('failure');
    const newUser = { id: 'uid-1', email: 'fan@pslone.co.za', role: 'FAN' as const };
    (prisma.user.findUnique as Mock).mockResolvedValue(null);
    (prisma.user.create as Mock).mockResolvedValue(newUser);

    const result = await authService.register(VALID_DTO);

    // Registration succeeds — user was created
    expect(result.enumerable).toBe(true);
    if (result.enumerable) {
      // Email delivery failed but is reported honestly
      expect(result.emailDeliveryStatus).toBe('FAILED');
      // Access token still returned — user can still log in
      expect(result.accessToken).toBe('mock-access-token');
    }
  });

  it('does not throw when email send fails', async () => {
    authService = setup('failure');
    const newUser = { id: 'uid-2', email: 'fan2@pslone.co.za', role: 'FAN' as const };
    (prisma.user.findUnique as Mock).mockResolvedValue(null);
    (prisma.user.create as Mock).mockResolvedValue(newUser);

    await expect(authService.register(VALID_DTO)).resolves.toBeDefined();
  });

  it('register result includes emailDeliveryStatus field on success', async () => {
    authService = setup('success');
    const newUser = { id: 'uid-1', email: 'fan@pslone.co.za', role: 'FAN' as const };
    (prisma.user.findUnique as Mock).mockResolvedValue(null);
    (prisma.user.create as Mock).mockResolvedValue(newUser);

    const result = await authService.register(VALID_DTO);
    expect(result).toHaveProperty('emailDeliveryStatus');
  });
});
