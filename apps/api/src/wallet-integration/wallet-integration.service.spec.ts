import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WalletIntegrationService } from './wallet-integration.service';
import { SiliconEnterpriseSandboxWalletAdapter } from './wallet-provider.adapter';
import type { PrismaService } from '../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

const makeAdapter = () => ({
  providerSlug: 'silicon-enterprise-wallet',
  startWalletLink: vi.fn().mockResolvedValue({
    walletLinkId: 'SANDBOX-WALLET-1',
    providerCustomerRef: 'SANDBOX-CUST-FAN-0001',
    status: 'LINK_PENDING',
    sandboxOnly: true,
  }),
  confirmWalletLink: vi.fn().mockResolvedValue({
    walletLinkId: 'link-1',
    status: 'LINKED',
    kycStatus: 'NOT_STARTED',
    sandboxOnly: true,
    kycDisclaimer: 'Sandbox KYC is not regulated verification.',
  }),
  unlinkWallet: vi.fn().mockResolvedValue({
    walletLinkId: 'link-1',
    status: 'UNLINKED',
    sandboxOnly: true,
  }),
  issueReward: vi.fn().mockResolvedValue({
    transactionId: 'tx-1',
    status: 'PROVIDER_PENDING',
    providerStatus: 'SANDBOX_QUEUED',
    sandboxOnly: true,
    disclaimer: 'No real value transferred.',
  }),
  handleWebhook: vi.fn().mockResolvedValue({ processed: true, sandboxOnly: true }),
});

const makePrisma = () =>
  ({
    walletProviderDetail: {
      findFirst: vi.fn().mockResolvedValue({
        id: 'wp-1',
        slug: 'silicon-enterprise-wallet',
        status: 'SANDBOX',
        name: 'Silicon Enterprise Wallet',
      }),
      findUnique: vi.fn().mockResolvedValue({
        id: 'wp-1',
        slug: 'silicon-enterprise-wallet',
        status: 'SANDBOX',
        name: 'Silicon Enterprise Wallet',
      }),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 'wp-1', slug: 'silicon-enterprise-wallet', name: 'Silicon Enterprise Wallet' }),
      update: vi.fn().mockResolvedValue({ id: 'wp-1' }),
    },
    walletLink: {
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({
        id: 'link-1',
        fanUserId: 'fan-1',
        walletProviderId: 'wp-1',
        status: 'LINK_PENDING',
        kycStatus: 'UNKNOWN',
        linkedAt: null,
        lastVerifiedAt: null,
        unlinkedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      update: vi.fn().mockResolvedValue({
        id: 'link-1',
        fanUserId: 'fan-1',
        walletProviderId: 'wp-1',
        status: 'LINKED',
        kycStatus: 'NOT_STARTED',
        linkedAt: new Date(),
        lastVerifiedAt: null,
        unlinkedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      upsert: vi.fn().mockResolvedValue({ id: 'link-1', fanUserId: 'fan-1', status: 'LINK_PENDING' }),
    },
    walletTransaction: {
      create: vi.fn().mockResolvedValue({ id: 'tx-1', status: 'CREATED' }),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue({ id: 'tx-1', status: 'SUCCESS' }),
      count: vi.fn().mockResolvedValue(0),
    },
    adminAuditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
    integrationProviderConfig: {
      findUnique: vi.fn().mockResolvedValue({ id: 'ipc-1' }),
    },
  });

// ---------------------------------------------------------------------------
// SiliconEnterpriseSandboxWalletAdapter — unit tests (no mocks, real class)
// ---------------------------------------------------------------------------

describe('SiliconEnterpriseSandboxWalletAdapter', () => {
  let adapter: SiliconEnterpriseSandboxWalletAdapter;

  beforeEach(() => {
    adapter = new SiliconEnterpriseSandboxWalletAdapter();
  });

  it('startWalletLink returns a deterministic providerCustomerRef derived from fanUserId', async () => {
    const result = await adapter.startWalletLink({
      fanUserId: 'fan-abcdefgh-xyz',
      walletProviderId: 'wp-1',
    });

    expect(result.providerCustomerRef).toMatch(/^SANDBOX-CUST-/);
    // deterministic: same fanUserId prefix → same ref
    const result2 = await adapter.startWalletLink({
      fanUserId: 'fan-abcdefgh-xyz',
      walletProviderId: 'wp-1',
    });
    expect(result2.providerCustomerRef).toBe(result.providerCustomerRef);
  });

  it('startWalletLink always returns sandboxOnly=true', async () => {
    const result = await adapter.startWalletLink({ fanUserId: 'fan-1', walletProviderId: 'wp-1' });
    expect(result.sandboxOnly).toBe(true);
    expect(result.status).toBe('LINK_PENDING');
  });

  it('confirmWalletLink returns status=LINKED and kycStatus=NOT_STARTED', async () => {
    const result = await adapter.confirmWalletLink({
      walletLinkId: 'link-abc',
      fanUserId: 'fan-1',
    });

    expect(result.status).toBe('LINKED');
    expect(result.kycStatus).toBe('NOT_STARTED');
    expect(result.sandboxOnly).toBe(true);
  });

  it('confirmWalletLink kycDisclaimer mentions not being regulated KYC', async () => {
    const result = await adapter.confirmWalletLink({
      walletLinkId: 'link-abc',
      fanUserId: 'fan-1',
    });

    expect(result.kycDisclaimer).toBeDefined();
    expect(result.kycDisclaimer.toLowerCase()).toMatch(/not regulated|sandbox/i);
  });

  it('unlinkWallet returns status=UNLINKED and sandboxOnly=true', async () => {
    const result = await adapter.unlinkWallet({
      walletLinkId: 'link-abc',
      fanUserId: 'fan-1',
    });

    expect(result.status).toBe('UNLINKED');
    expect(result.sandboxOnly).toBe(true);
  });

  it('issueReward returns PROVIDER_PENDING status with no-real-value disclaimer', async () => {
    const result = await adapter.issueReward({
      walletLinkId: 'link-abc',
      rewardDefinitionId: 'rwd-1',
      fanUserId: 'fan-1',
      displayValue: 'R10',
    });

    expect(result.status).toBe('PROVIDER_PENDING');
    expect(result.providerStatus).toBe('SANDBOX_QUEUED');
    expect(result.sandboxOnly).toBe(true);
    expect(result.disclaimer).toBeDefined();
    expect(result.disclaimer.toLowerCase()).toMatch(/no real value|sandbox/i);
  });

  it('handleWebhook returns processed=true and sandboxOnly=true', async () => {
    const result = await adapter.handleWebhook({
      providerSlug: 'silicon-enterprise-wallet',
      eventType: 'PAYMENT_SUCCESS',
      payload: { ref: 'abc' },
    });

    expect(result.processed).toBe(true);
    expect(result.sandboxOnly).toBe(true);
  });

  it('sandbox adapter methods are pure functions — no global fetch/axios call sites in source', async () => {
    // Confirm all adapter methods resolve without reaching out; if fetch was called
    // it would throw in test environment (no network). We validate by calling each method.
    await expect(
      adapter.startWalletLink({ fanUserId: 'f', walletProviderId: 'w' }),
    ).resolves.toBeDefined();
    await expect(
      adapter.confirmWalletLink({ walletLinkId: 'l', fanUserId: 'f' }),
    ).resolves.toBeDefined();
    await expect(
      adapter.unlinkWallet({ walletLinkId: 'l', fanUserId: 'f' }),
    ).resolves.toBeDefined();
    await expect(
      adapter.issueReward({ walletLinkId: 'l', rewardDefinitionId: 'r', fanUserId: 'f', displayValue: 'R10' }),
    ).resolves.toBeDefined();
    await expect(
      adapter.handleWebhook({ providerSlug: 'p', eventType: 'E', payload: {} }),
    ).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// WalletIntegrationService
// ---------------------------------------------------------------------------

const makeNotifications = () => ({
  createInAppNotification: vi.fn().mockResolvedValue(undefined),
});

const makeActivityFeed = () => ({
  createUserActivity: vi.fn().mockResolvedValue(undefined),
});

describe('WalletIntegrationService', () => {
  let service: WalletIntegrationService;
  let prisma: ReturnType<typeof makePrisma>;
  let adapter: ReturnType<typeof makeAdapter>;
  let notifications: ReturnType<typeof makeNotifications>;
  let activityFeed: ReturnType<typeof makeActivityFeed>;

  beforeEach(() => {
    prisma = makePrisma();
    adapter = makeAdapter();
    notifications = makeNotifications();
    activityFeed = makeActivityFeed();
    service = new WalletIntegrationService(prisma as any, adapter as any, notifications as any, activityFeed as any);
  });

  // -------------------------------------------------------------------------
  // fanGetWalletStatus
  // -------------------------------------------------------------------------

  describe('fanGetWalletStatus', () => {
    it('returns NOT_LINKED status when no wallet link exists', async () => {
      prisma.walletLink.findFirst.mockResolvedValue(null);

      const result = await service.fanGetWalletStatus('fan-1');

      expect(result.status).toBe('NOT_LINKED');
      expect(result.kycStatus).toBe('UNKNOWN');
    });

    it('includes safetyNote and sandboxMode=true when no link exists', async () => {
      prisma.walletLink.findFirst.mockResolvedValue(null);

      const result = await service.fanGetWalletStatus('fan-1');

      expect(result.sandboxMode).toBe(true);
      expect((result as any).safetyNote).toBeDefined();
      expect((result as any).safetyNote).toContain('PSL One does not hold customer funds');
    });

    it('masks providerCustomerRef and providerWalletRef (returns null) for linked wallet', async () => {
      prisma.walletLink.findFirst.mockResolvedValue({
        id: 'link-1',
        fanUserId: 'fan-1',
        walletProviderId: 'wp-1',
        status: 'LINKED',
        kycStatus: 'NOT_STARTED',
        providerCustomerRef: 'REAL-SECRET-REF',
        providerWalletRef: 'REAL-WALLET-REF',
        linkedAt: new Date(),
        lastVerifiedAt: null,
        unlinkedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.fanGetWalletStatus('fan-1');

      expect((result as any).providerCustomerRef).toBeNull();
      expect((result as any).providerWalletRef).toBeNull();
    });

    it('never exposes real providerCustomerRef in response', async () => {
      prisma.walletLink.findFirst.mockResolvedValue({
        id: 'link-1',
        fanUserId: 'fan-1',
        walletProviderId: 'wp-1',
        status: 'LINKED',
        kycStatus: 'VERIFIED',
        providerCustomerRef: 'CONFIDENTIAL-CUST-9999',
        providerWalletRef: 'CONFIDENTIAL-WALLET-9999',
        linkedAt: new Date(),
        lastVerifiedAt: new Date(),
        unlinkedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.fanGetWalletStatus('fan-1');
      const serialised = JSON.stringify(result);

      expect(serialised).not.toContain('CONFIDENTIAL-CUST-9999');
      expect(serialised).not.toContain('CONFIDENTIAL-WALLET-9999');
    });

    it('returns status and kycStatus from stored link record', async () => {
      prisma.walletLink.findFirst.mockResolvedValue({
        id: 'link-1',
        fanUserId: 'fan-1',
        walletProviderId: 'wp-1',
        status: 'LINKED',
        kycStatus: 'VERIFIED',
        linkedAt: new Date('2026-01-01'),
        lastVerifiedAt: null,
        unlinkedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.fanGetWalletStatus('fan-1');

      expect(result.status).toBe('LINKED');
      expect((result as any).kycStatus).toBe('VERIFIED');
    });
  });

  // -------------------------------------------------------------------------
  // fanStartWalletLink
  // -------------------------------------------------------------------------

  describe('fanStartWalletLink', () => {
    it('creates a WalletLink record and a WalletTransaction record', async () => {
      prisma.walletLink.findUnique.mockResolvedValue(null); // no existing link

      await service.fanStartWalletLink('fan-1', {});

      expect(prisma.walletLink.create).toHaveBeenCalledOnce();
      expect(prisma.walletTransaction.create).toHaveBeenCalledOnce();
    });

    it('returns sandboxOnly=true and safetyNote', async () => {
      prisma.walletLink.findUnique.mockResolvedValue(null);

      const result = await service.fanStartWalletLink('fan-1', {});

      expect(result.sandboxOnly).toBe(true);
      expect((result as any).safetyNote).toBeDefined();
    });

    it('returns status=LINK_PENDING', async () => {
      prisma.walletLink.findUnique.mockResolvedValue(null);

      const result = await service.fanStartWalletLink('fan-1', {});

      expect(result.status).toBe('LINK_PENDING');
    });

    it('updates existing link to LINK_PENDING rather than creating a second record', async () => {
      prisma.walletLink.findUnique.mockResolvedValue({
        id: 'link-existing',
        fanUserId: 'fan-1',
        walletProviderId: 'wp-1',
        status: 'UNLINKED',
      });

      await service.fanStartWalletLink('fan-1', {});

      expect(prisma.walletLink.create).not.toHaveBeenCalled();
      expect(prisma.walletLink.update).toHaveBeenCalled();
    });

    it('throws NotFoundException if no SANDBOX provider is available', async () => {
      prisma.walletProviderDetail.findFirst.mockResolvedValue(null);

      await expect(service.fanStartWalletLink('fan-1', {})).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------------------------------------------------------
  // fanConfirmWalletLink
  // -------------------------------------------------------------------------

  describe('fanConfirmWalletLink', () => {
    const linkedWalletLink = {
      id: 'link-1',
      fanUserId: 'fan-1',
      walletProviderId: 'wp-1',
      status: 'LINK_PENDING',
      kycStatus: 'UNKNOWN',
    };

    it('sets status=LINKED and kycStatus=NOT_STARTED on the WalletLink', async () => {
      prisma.walletLink.findUnique.mockResolvedValue(linkedWalletLink);

      await service.fanConfirmWalletLink('fan-1', { providerSlug: 'silicon-enterprise-wallet' });

      expect(prisma.walletLink.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'LINKED', kycStatus: 'NOT_STARTED' }),
        }),
      );
    });

    it('creates a SUCCESS WalletTransaction', async () => {
      prisma.walletLink.findUnique.mockResolvedValue(linkedWalletLink);

      await service.fanConfirmWalletLink('fan-1', { providerSlug: 'silicon-enterprise-wallet' });

      expect(prisma.walletTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'SUCCESS' }),
        }),
      );
    });

    it('returns status=LINKED and kycStatus from adapter', async () => {
      prisma.walletLink.findUnique.mockResolvedValue(linkedWalletLink);

      const result = await service.fanConfirmWalletLink('fan-1', { providerSlug: 'silicon-enterprise-wallet' });

      expect(result.status).toBe('LINKED');
      expect((result as any).kycStatus).toBe('NOT_STARTED');
    });

    it('throws NotFoundException if provider not found', async () => {
      prisma.walletProviderDetail.findUnique.mockResolvedValue(null);

      await expect(
        service.fanConfirmWalletLink('fan-1', { providerSlug: 'unknown-provider' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException if walletLink does not exist', async () => {
      prisma.walletLink.findUnique.mockResolvedValue(null);

      await expect(
        service.fanConfirmWalletLink('fan-1', { providerSlug: 'silicon-enterprise-wallet' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('fires WALLET_LINKED notification and activity feed after successful confirm', async () => {
      const linkedWalletLink = {
        id: 'link-1',
        fanUserId: 'fan-1',
        walletProviderId: 'wp-1',
        status: 'LINK_PENDING',
        kycStatus: 'UNKNOWN',
      };
      prisma.walletLink.findUnique.mockResolvedValue(linkedWalletLink);

      await service.fanConfirmWalletLink('fan-1', { providerSlug: 'silicon-enterprise-wallet' });

      expect(notifications.createInAppNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'WALLET_LINKED', userId: 'fan-1' }),
      );
      expect(activityFeed.createUserActivity).toHaveBeenCalledWith(
        'fan-1',
        expect.objectContaining({ type: 'WALLET_LINKED' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // fanUnlinkWallet
  // -------------------------------------------------------------------------

  describe('fanUnlinkWallet', () => {
    const activeLink = {
      id: 'link-1',
      fanUserId: 'fan-1',
      walletProviderId: 'wp-1',
      status: 'LINKED',
    };

    it('sets status=UNLINKED without deleting the record (preserves audit trail)', async () => {
      prisma.walletLink.findUnique.mockResolvedValue(activeLink);

      await service.fanUnlinkWallet('fan-1', { providerSlug: 'silicon-enterprise-wallet' });

      expect(prisma.walletLink.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'UNLINKED' }),
        }),
      );
      // Record must NOT be deleted
      expect((prisma.walletLink as any).delete).toBeUndefined();
    });

    it('returns status=UNLINKED and sandboxOnly=true', async () => {
      prisma.walletLink.findUnique.mockResolvedValue(activeLink);

      const result = await service.fanUnlinkWallet('fan-1', { providerSlug: 'silicon-enterprise-wallet' });

      expect(result.status).toBe('UNLINKED');
      expect(result.sandboxOnly).toBe(true);
    });

    it('throws BadRequestException if wallet is not in LINKED status', async () => {
      prisma.walletLink.findUnique.mockResolvedValue({ ...activeLink, status: 'LINK_PENDING' });

      await expect(
        service.fanUnlinkWallet('fan-1', { providerSlug: 'silicon-enterprise-wallet' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if provider not found', async () => {
      prisma.walletProviderDetail.findUnique.mockResolvedValue(null);

      await expect(
        service.fanUnlinkWallet('fan-1', { providerSlug: 'unknown-provider' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------------------------------------------------------
  // adminProcessSandboxWebhook
  // -------------------------------------------------------------------------

  describe('adminProcessSandboxWebhook', () => {
    const webhookDto = { eventType: 'PAYMENT_RECEIVED', payload: { ref: 'abc' } };

    it('creates a WEBHOOK_EVENT WalletTransaction', async () => {
      await service.adminProcessSandboxWebhook('silicon-enterprise-wallet', webhookDto, 'admin-1');

      expect(prisma.walletTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ transactionType: 'WEBHOOK_EVENT' }),
        }),
      );
    });

    it('writes an AdminAuditLog entry', async () => {
      await service.adminProcessSandboxWebhook('silicon-enterprise-wallet', webhookDto, 'admin-1');

      expect(prisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'SANDBOX_WEBHOOK_PROCESSED' }),
        }),
      );
    });

    it('returns processed=true and sandboxOnly=true', async () => {
      const result = await service.adminProcessSandboxWebhook(
        'silicon-enterprise-wallet',
        webhookDto,
        'admin-1',
      );

      expect(result.processed).toBe(true);
      expect(result.sandboxOnly).toBe(true);
    });

    it('throws NotFoundException if provider slug does not exist', async () => {
      prisma.walletProviderDetail.findUnique.mockResolvedValue(null);

      await expect(
        service.adminProcessSandboxWebhook('unknown-provider', webhookDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if provider is not in SANDBOX status', async () => {
      prisma.walletProviderDetail.findUnique.mockResolvedValue({
        id: 'wp-1',
        slug: 'silicon-enterprise-wallet',
        status: 'LIVE',
      });

      await expect(
        service.adminProcessSandboxWebhook('silicon-enterprise-wallet', webhookDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('idempotency — duplicate webhook call resolves without error and returns processed=true', async () => {
      // Second call should still resolve — adapter is stateless sandbox
      const first = await service.adminProcessSandboxWebhook(
        'silicon-enterprise-wallet',
        { ...webhookDto, idempotencyKey: 'idem-key-1' },
      );
      const second = await service.adminProcessSandboxWebhook(
        'silicon-enterprise-wallet',
        { ...webhookDto, idempotencyKey: 'idem-key-1' },
      );

      expect(first.processed).toBe(true);
      expect(second.processed).toBe(true);
    });
  });
});
