import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { SponsorPortalService } from './sponsor-portal.service';
import { PrismaService } from '../prisma/prisma.service';
import { PortalScopeService } from '../portal-scope/portal-scope.service';

const makePrisma = () => ({
  sponsor: { findFirst: vi.fn(), findMany: vi.fn() },
  sponsorCampaign: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
  rewardDefinition: { findMany: vi.fn(), count: vi.fn() },
  campaignAnalyticsSnapshot: { findMany: vi.fn() },
  team: { findMany: vi.fn() },
  audienceSegment: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  mediaAsset: { findMany: vi.fn() },
});

const makeScope = () => ({
  resolveClubScope: vi.fn(),
  resolveSponsorScope: vi.fn(),
});

const ALLOWED_SPONSOR = {
  allowed: true as const,
  scopeType: 'sponsor' as const,
  sponsorId: 'sp-1',
  reason: 'SPONSOR active membership',
};

describe('SponsorPortalService (Sprint 28 — DB-backed scoping)', () => {
  let service: SponsorPortalService;
  let prisma: ReturnType<typeof makePrisma>;
  let scope: ReturnType<typeof makeScope>;

  beforeEach(async () => {
    prisma = makePrisma();
    scope = makeScope();
    scope.resolveSponsorScope.mockResolvedValue(ALLOWED_SPONSOR);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SponsorPortalService,
        { provide: PrismaService, useValue: prisma },
        { provide: PortalScopeService, useValue: scope },
      ],
    }).compile();

    service = module.get<SponsorPortalService>(SponsorPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSponsorOverview', () => {
    it('calls resolveSponsorScope with userId, role, sponsorId', async () => {
      prisma.sponsor.findFirst.mockResolvedValue({ id: 'sp-1', name: 'Nike' });
      prisma.sponsorCampaign.count.mockResolvedValue(3);
      prisma.rewardDefinition.count.mockResolvedValue(5);

      await service.getSponsorOverview('user-1', 'SPONSOR', 'sp-1');
      expect(scope.resolveSponsorScope).toHaveBeenCalledWith('user-1', 'SPONSOR', 'sp-1');
    });

    it('returns sponsor, campaignCount, rewardCount when allowed', async () => {
      prisma.sponsor.findFirst.mockResolvedValue({ id: 'sp-1', name: 'Nike' });
      prisma.sponsorCampaign.count.mockResolvedValue(3);
      prisma.rewardDefinition.count.mockResolvedValue(5);

      const result = await service.getSponsorOverview('user-1', 'SPONSOR');
      expect(result).toMatchObject({ campaignCount: 3, rewardCount: 5 });
    });

    it('throws ForbiddenException when denied (403)', async () => {
      scope.resolveSponsorScope.mockResolvedValue({
        allowed: false,
        reason: 'Cross-sponsor access denied',
        statusCode: 403,
        errorCode: 'CROSS_SPONSOR_ACCESS_DENIED',
      });

      await expect(service.getSponsorOverview('user-1', 'SPONSOR', 'wrong-sp')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws BadRequestException when PSL_ADMIN provides no sponsorId (400)', async () => {
      scope.resolveSponsorScope.mockResolvedValue({
        allowed: false,
        reason: 'PSL_ADMIN must provide sponsorId',
        statusCode: 400,
        errorCode: 'SPONSOR_SCOPE_REQUIRED',
      });

      await expect(service.getSponsorOverview('admin-user', 'PSL_ADMIN')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getSponsorProfile', () => {
    it('returns sponsor when allowed', async () => {
      const mockSponsor = { id: 'sp-1', name: 'Nike', status: 'ACTIVE' };
      prisma.sponsor.findFirst.mockResolvedValue(mockSponsor);

      const result = await service.getSponsorProfile('user-1', 'SPONSOR');
      expect(result).toEqual(mockSponsor);
    });

    it('throws ForbiddenException for cross-sponsor denial', async () => {
      scope.resolveSponsorScope.mockResolvedValue({
        allowed: false,
        reason: 'Cross-sponsor access denied',
        statusCode: 403,
        errorCode: 'CROSS_SPONSOR_ACCESS_DENIED',
      });

      await expect(service.getSponsorProfile('user-1', 'SPONSOR', 'other-sp')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getSponsorCampaigns', () => {
    it('returns campaigns when allowed', async () => {
      const mockCampaigns = [{ id: 'camp-1', title: 'Campaign A', status: 'DRAFT' }];
      prisma.sponsorCampaign.findMany.mockResolvedValue(mockCampaigns);

      const result = await service.getSponsorCampaigns('user-1', 'SPONSOR');
      expect(result).toEqual(mockCampaigns);
    });
  });

  describe('createCampaignDraft', () => {
    it('creates campaign with DRAFT status (never ACTIVE)', async () => {
      const dto = { title: 'Summer Campaign', startsAt: '2026-07-01', endsAt: '2026-08-01' };
      const created = { id: 'camp-new', title: 'Summer Campaign', status: 'DRAFT' };
      prisma.sponsorCampaign.create.mockResolvedValue(created);

      const result = await service.createCampaignDraft(dto, 'user-1', 'SPONSOR');
      expect(result).toEqual(created);
      const firstCall = prisma.sponsorCampaign.create.mock.calls[0];
      const callArgs = firstCall![0] as { data: { status: string } };
      expect(callArgs.data.status).toBe('DRAFT');
      expect(callArgs.data.status).not.toBe('ACTIVE');
      expect(callArgs.data.status).not.toBe('PUBLISHED');
    });

    it('throws ForbiddenException for cross-sponsor denial on draft creation', async () => {
      scope.resolveSponsorScope.mockResolvedValue({
        allowed: false,
        reason: 'Cross-sponsor access denied',
        statusCode: 403,
        errorCode: 'CROSS_SPONSOR_ACCESS_DENIED',
      });

      const dto = { title: 'Test', startsAt: '2026-07-01', endsAt: '2026-08-01' };
      await expect(service.createCampaignDraft(dto, 'user-1', 'SPONSOR', 'wrong-sp')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getSponsorAudiences', () => {
    it('returns active segments for the resolved sponsor', async () => {
      const mockSegments = [
        { id: 'seg-1', sponsorId: 'sp-1', name: 'WC Viewers', isActive: true, criteria: {} },
      ];
      prisma.audienceSegment.findMany.mockResolvedValue(mockSegments);

      const result = await service.getSponsorAudiences('user-1', 'SPONSOR');
      expect(result).toEqual(mockSegments);
      expect(prisma.audienceSegment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { sponsorId: 'sp-1', isActive: true } }),
      );
    });

    it('throws ForbiddenException when scope denied', async () => {
      scope.resolveSponsorScope.mockResolvedValue({
        allowed: false,
        reason: 'CROSS_SPONSOR_ACCESS_DENIED',
        statusCode: 403,
        errorCode: 'CROSS_SPONSOR_ACCESS_DENIED',
      });
      await expect(service.getSponsorAudiences('user-1', 'SPONSOR', 'wrong-sp')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getSponsorActivations', () => {
    it('returns empty array when no campaigns', async () => {
      prisma.sponsorCampaign.findMany.mockResolvedValue([]);

      const result = await service.getSponsorActivations('user-1', 'SPONSOR');
      expect(result).toEqual([]);
    });
  });

  describe('getSponsorRewards', () => {
    it('enforces isFinancial: false on all rewards', async () => {
      const mockRewards = [
        { id: 'r1', title: 'Badge', rewardType: 'DIGITAL_BADGE' },
        { id: 'r2', title: 'Points', rewardType: 'FAN_POINTS' },
      ];
      prisma.rewardDefinition.findMany.mockResolvedValue(mockRewards);

      const result = await service.getSponsorRewards('user-1', 'SPONSOR') as Array<Record<string, unknown>>;
      expect(Array.isArray(result)).toBe(true);
      for (const r of result) {
        expect(r.isFinancial).toBe(false);
      }
    });
  });

  describe('getSponsorAnalytics', () => {
    it('returns zero totals when no campaigns', async () => {
      prisma.sponsorCampaign.findMany.mockResolvedValue([]);

      const result = await service.getSponsorAnalytics('user-1', 'SPONSOR');
      expect(result).toMatchObject({ totalImpressions: 0, totalEngagements: 0 });
    });
  });

  describe('getSponsorClubs', () => {
    it('returns empty array when no club campaigns', async () => {
      prisma.sponsorCampaign.findMany.mockResolvedValue([]);

      const result = await service.getSponsorClubs('user-1', 'SPONSOR');
      expect(result).toEqual([]);
    });
  });

  describe('getSponsorAssets', () => {
    it('returns active media assets for the resolved sponsor', async () => {
      const mockAssets = [
        { id: 'a-1', sponsorId: 'sp-1', title: 'Logo', archivedAt: null },
      ];
      prisma.mediaAsset.findMany.mockResolvedValue(mockAssets);

      const result = await service.getSponsorAssets('user-1', 'SPONSOR');
      expect(result).toEqual(mockAssets);
      expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { sponsorId: 'sp-1', archivedAt: null } }),
      );
    });

    it('throws ForbiddenException when scope denied', async () => {
      scope.resolveSponsorScope.mockResolvedValue({
        allowed: false,
        reason: 'CROSS_SPONSOR_ACCESS_DENIED',
        statusCode: 403,
        errorCode: 'CROSS_SPONSOR_ACCESS_DENIED',
      });
      await expect(service.getSponsorAssets('user-1', 'SPONSOR', 'wrong-sp')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getBillingPlaceholder', () => {
    it('returns INVOICE_ONLY status', () => {
      const result = service.getBillingPlaceholder();
      expect(result).toMatchObject({
        billingStatus: 'INVOICE_ONLY',
        isFinancial: false,
        paymentProvider: null,
      });
    });

    it('does not process payments', () => {
      const result = service.getBillingPlaceholder();
      expect(result.paymentProvider).toBeNull();
      expect(result.billingStatus).toBe('INVOICE_ONLY');
    });

    it('references ADR-031', () => {
      const result = service.getBillingPlaceholder();
      expect(result.adr).toBe('ADR-031');
    });

    it('billing always INVOICE_ONLY regardless of sponsor', () => {
      // No DB call needed — always returns fixed placeholder
      const r1 = service.getBillingPlaceholder();
      const r2 = service.getBillingPlaceholder();
      expect(r1.billingStatus).toBe(r2.billingStatus);
    });
  });

  describe('PSL_ADMIN explicit scope', () => {
    it('PSL_ADMIN with explicit sponsorId returns sponsor data', async () => {
      scope.resolveSponsorScope.mockResolvedValue({
        allowed: true as const,
        scopeType: 'sponsor' as const,
        sponsorId: 'sp-explicit',
        reason: 'PSL_ADMIN explicit scope',
      });
      prisma.sponsor.findFirst.mockResolvedValue({ id: 'sp-explicit', name: 'Absa' });
      prisma.sponsorCampaign.count.mockResolvedValue(0);
      prisma.rewardDefinition.count.mockResolvedValue(0);

      const result = await service.getSponsorOverview('admin-user', 'PSL_ADMIN', 'sp-explicit');
      expect(result).toMatchObject({ campaignCount: 0 });
    });
  });
});
