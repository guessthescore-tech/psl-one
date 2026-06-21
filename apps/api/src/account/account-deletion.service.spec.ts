import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DeletionRequestStatus, AuditEvent } from '@prisma/client';
import { AccountDeletionService } from './account-deletion.service';
import type { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = () => ({
  user: { findUnique: vi.fn() },
  accountDeletionRequest: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  authAuditLog: { create: vi.fn().mockResolvedValue({}) },
});

const ACTIVE_USER = { id: 'uid-1', isActive: true };
const PENDING_REQUEST = {
  id: 'req-1',
  status: DeletionRequestStatus.PENDING,
  requestedAt: new Date('2026-06-21'),
  reason: null,
};

describe('AccountDeletionService', () => {
  let service: AccountDeletionService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new AccountDeletionService(prisma as unknown as PrismaService);
  });

  describe('requestDeletion', () => {
    it('creates a new deletion request', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(ACTIVE_USER);
      (prisma.accountDeletionRequest.findFirst as Mock).mockResolvedValue(null);
      (prisma.accountDeletionRequest.create as Mock).mockResolvedValue(PENDING_REQUEST);

      const result = await service.requestDeletion('uid-1', {});
      expect(result.status).toBe(DeletionRequestStatus.PENDING);
      expect(prisma.accountDeletionRequest.create).toHaveBeenCalledWith({
        data: { userId: 'uid-1', reason: null },
      });
    });

    it('returns existing pending request idempotently', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(ACTIVE_USER);
      (prisma.accountDeletionRequest.findFirst as Mock).mockResolvedValue(PENDING_REQUEST);

      const result = await service.requestDeletion('uid-1', {});
      expect(result.id).toBe('req-1');
      expect(prisma.accountDeletionRequest.create).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException for inactive user', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'uid-1', isActive: false });
      await expect(service.requestDeletion('uid-1', {})).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for unknown user', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(null);
      await expect(service.requestDeletion('uid-1', {})).rejects.toThrow(UnauthorizedException);
    });

    it('records ACCOUNT_DELETION_REQUESTED audit event on success', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(ACTIVE_USER);
      (prisma.accountDeletionRequest.findFirst as Mock).mockResolvedValue(null);
      (prisma.accountDeletionRequest.create as Mock).mockResolvedValue(PENDING_REQUEST);

      await service.requestDeletion('uid-1', {});
      expect(prisma.authAuditLog.create).toHaveBeenCalledWith({
        data: { userId: 'uid-1', event: AuditEvent.ACCOUNT_DELETION_REQUESTED, success: true },
      });
    });

    it('audit event payload does not contain passwords or secrets', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(ACTIVE_USER);
      (prisma.accountDeletionRequest.findFirst as Mock).mockResolvedValue(null);
      (prisma.accountDeletionRequest.create as Mock).mockResolvedValue(PENDING_REQUEST);

      await service.requestDeletion('uid-1', {});
      const call = (prisma.authAuditLog.create as Mock).mock.calls[0]?.[0] as { data: Record<string, unknown> };
      const data = call.data;
      expect(JSON.stringify(data)).not.toMatch(/password|token|secret/i);
    });
  });

  describe('getStatus', () => {
    it('returns hasPendingRequest false when no request exists', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(ACTIVE_USER);
      (prisma.accountDeletionRequest.findFirst as Mock).mockResolvedValue(null);

      const result = await service.getStatus('uid-1');
      expect(result.hasPendingRequest).toBe(false);
      expect(result.request).toBeNull();
    });

    it('returns pending request when one exists', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(ACTIVE_USER);
      (prisma.accountDeletionRequest.findFirst as Mock).mockResolvedValue(PENDING_REQUEST);

      const result = await service.getStatus('uid-1');
      expect(result.hasPendingRequest).toBe(true);
      expect(result.request?.id).toBe('req-1');
    });

    it('throws UnauthorizedException for unauthenticated user', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(null);
      await expect(service.getStatus('uid-1')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('cancelRequest', () => {
    it('cancels a pending deletion request', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(ACTIVE_USER);
      (prisma.accountDeletionRequest.findFirst as Mock).mockResolvedValue(PENDING_REQUEST);
      (prisma.accountDeletionRequest.update as Mock).mockResolvedValue({});

      const result = await service.cancelRequest('uid-1');
      expect(result.message).toContain('cancelled');
      expect(prisma.accountDeletionRequest.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: expect.objectContaining({ status: DeletionRequestStatus.CANCELLED }),
      });
    });

    it('throws NotFoundException when no pending request exists', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(ACTIVE_USER);
      (prisma.accountDeletionRequest.findFirst as Mock).mockResolvedValue(null);

      await expect(service.cancelRequest('uid-1')).rejects.toThrow(NotFoundException);
    });

    it('records ACCOUNT_DELETION_CANCELLED audit event', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(ACTIVE_USER);
      (prisma.accountDeletionRequest.findFirst as Mock).mockResolvedValue(PENDING_REQUEST);
      (prisma.accountDeletionRequest.update as Mock).mockResolvedValue({});

      await service.cancelRequest('uid-1');
      expect(prisma.authAuditLog.create).toHaveBeenCalledWith({
        data: { userId: 'uid-1', event: AuditEvent.ACCOUNT_DELETION_CANCELLED, success: true },
      });
    });

    it('does not hard-delete any user data', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(ACTIVE_USER);
      (prisma.accountDeletionRequest.findFirst as Mock).mockResolvedValue(PENDING_REQUEST);
      (prisma.accountDeletionRequest.update as Mock).mockResolvedValue({});

      await service.cancelRequest('uid-1');
      // user.delete should never be called
      expect((prisma.user as Record<string, unknown>)['delete']).toBeUndefined();
    });
  });
});
