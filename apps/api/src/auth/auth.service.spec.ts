import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { BadRequestException, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { AuditEvent } from '@prisma/client';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { PrismaService } from '../prisma/prisma.service';
import type { LocalJwtProvider } from './providers/local-jwt.provider';
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

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    provider = makeProviderMock();

    // Callback-style $transaction delegates to a fresh mock that mirrors the outer mock
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

    authService = new AuthService(prisma as unknown as PrismaService, provider as unknown as LocalJwtProvider);
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
    // No token in the response
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

  // ── 5. Login success ──────────────────────────────────────────────────────
  it('login returns accessToken on valid credentials', async () => {
    const user = {
      id: 'uid-1',
      email: 'fan@pslone.co.za',
      role: 'FAN',
      passwordHash: '$2b$12$mockedhash',
      isActive: true,
    };
    (prisma.user.findUnique as Mock).mockResolvedValue(user);
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

    const result = await authService.login({ email: 'fan@pslone.co.za', password: 'Password1!' });

    expect(result).toMatchObject({ accessToken: 'mock-access-token' });
  });

  // ── 6. Failed login is audited ────────────────────────────────────────────
  it('login writes a failed audit log entry on wrong password', async () => {
    const user = {
      id: 'uid-1',
      email: 'fan@pslone.co.za',
      passwordHash: '$2b$12$mockedhash',
      isActive: true,
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

  // ── 8. Password reset request does not enumerate ──────────────────────────
  it('requestPasswordReset resolves without error for unknown email', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue(null);

    await expect(
      authService.requestPasswordReset('ghost@nowhere.co.za'),
    ).resolves.toBeUndefined();

    // Audit log written with null userId to track the attempt
    expect(prisma.authAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: null, event: AuditEvent.PASSWORD_RESET_REQUEST, success: false }),
      }),
    );
  });

  // ── 9. Password reset confirm works ──────────────────────────────────────
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
});

// ── 7. /auth/me requires auth ─────────────────────────────────────────────
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
});
