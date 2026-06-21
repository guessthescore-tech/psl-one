import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuditEvent } from '@prisma/client';
import { AuthService } from './auth.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { LocalJwtProvider } from './providers/local-jwt.provider';
import type { PasswordResetNotifier } from './providers/password-reset-notifier';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('$2b$12$newhash'),
  compare: vi.fn(),
}));
import * as bcrypt from 'bcrypt';

const makePrismaMock = () => ({
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn().mockResolvedValue({}) },
  consentRecord: { createMany: vi.fn().mockResolvedValue({}) },
  authAuditLog: { create: vi.fn().mockResolvedValue({}) },
  passwordResetToken: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  $transaction: vi.fn().mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') return (arg as (tx: unknown) => Promise<unknown>)(makePrismaMock());
    return Promise.all(arg as Promise<unknown>[]);
  }),
});

describe('AuthService.changePassword', () => {
  let authService: AuthService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    authService = new AuthService(
      prisma as unknown as PrismaService,
      {} as LocalJwtProvider,
      {} as PasswordResetNotifier,
    );
  });

  it('changes password when current password is correct', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({
      id: 'uid-1', passwordHash: '$2b$12$oldhash', isActive: true,
    });
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

    await authService.changePassword('uid-1', {
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'uid-1' },
      data: { passwordHash: '$2b$12$newhash' },
    });
  });

  it('throws BadRequestException when current password is wrong', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({
      id: 'uid-1', passwordHash: '$2b$12$oldhash', isActive: true,
    });
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

    await expect(authService.changePassword('uid-1', {
      currentPassword: 'WrongPass!',
      newPassword: 'NewPass1!',
    })).rejects.toThrow(BadRequestException);
  });

  it('throws UnauthorizedException for inactive user', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'uid-1', isActive: false, passwordHash: 'x' });
    await expect(authService.changePassword('uid-1', {
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
    })).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for unknown user', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue(null);
    await expect(authService.changePassword('uid-1', {
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
    })).rejects.toThrow(UnauthorizedException);
  });

  it('records PASSWORD_CHANGED audit event on success', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({
      id: 'uid-1', passwordHash: '$2b$12$oldhash', isActive: true,
    });
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

    await authService.changePassword('uid-1', {
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
    });

    expect(prisma.authAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ event: AuditEvent.PASSWORD_CHANGED, success: true }),
      }),
    );
  });

  it('records PASSWORD_CHANGE_FAILED audit event on wrong password', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({
      id: 'uid-1', passwordHash: '$2b$12$oldhash', isActive: true,
    });
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

    await authService.changePassword('uid-1', {
      currentPassword: 'WrongPass!',
      newPassword: 'NewPass1!',
    }).catch(() => null);

    expect(prisma.authAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ event: AuditEvent.PASSWORD_CHANGE_FAILED, success: false }),
      }),
    );
  });

  it('audit event does not contain the password value', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({
      id: 'uid-1', passwordHash: '$2b$12$oldhash', isActive: true,
    });
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

    await authService.changePassword('uid-1', {
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
    });

    const call = (prisma.authAuditLog.create as Mock).mock.calls[0]?.[0] as { data: Record<string, unknown> };
    expect(JSON.stringify(call.data)).not.toContain('OldPass1!');
    expect(JSON.stringify(call.data)).not.toContain('NewPass1!');
  });

  it('new password hash is stored not the plaintext', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({
      id: 'uid-1', passwordHash: '$2b$12$oldhash', isActive: true,
    });
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

    await authService.changePassword('uid-1', {
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
    });

    const call = (prisma.user.update as Mock).mock.calls[0]?.[0] as { data: { passwordHash?: string } };
    expect(call.data.passwordHash).not.toBe('NewPass1!');
    expect(call.data.passwordHash).toMatch(/^\$2b\$/);
  });
});
