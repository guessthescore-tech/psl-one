import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SponsorPortalService } from './sponsor-portal.service';
import { PrismaService } from '../prisma/prisma.service';

const makePrisma = () => ({
  sponsor: { findFirst: vi.fn(), findMany: vi.fn() },
  sponsorCampaign: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
  rewardDefinition: { findMany: vi.fn(), count: vi.fn() },
  campaignAnalyticsSnapshot: { findMany: vi.fn() },
  team: { findMany: vi.fn() },
});

describe('SponsorPortalService', () => {
  let service: SponsorPortalService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SponsorPortalService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SponsorPortalService>(SponsorPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSponsorOverview', () => {
    it('returns scopeStatus when no sponsorId', async () => {
      const result = await service.getSponsorOverview(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns sponsor, campaignCount, rewardCount when sponsorId provided', async () => {
      prisma.sponsor.findFirst.mockResolvedValue({ id: 'sp-1', name: 'Nike' });
      prisma.sponsorCampaign.count.mockResolvedValue(3);
      prisma.rewardDefinition.count.mockResolvedValue(5);

      const result = await service.getSponsorOverview('sp-1');
      expect(result).toMatchObject({ campaignCount: 3, rewardCount: 5 });
    });
  });

  describe('getSponsorProfile', () => {
    it('returns scopeStatus when no sponsorId', async () => {
      const result = await service.getSponsorProfile(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns sponsor when sponsorId provided', async () => {
      const mockSponsor = { id: 'sp-1', name: 'Nike', status: 'ACTIVE' };
      prisma.sponsor.findFirst.mockResolvedValue(mockSponsor);

      const result = await service.getSponsorProfile('sp-1');
      expect(result).toEqual(mockSponsor);
    });
  });

  describe('getSponsorCampaigns', () => {
    it('returns scopeStatus when no sponsorId', async () => {
      const result = await service.getSponsorCampaigns(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns campaigns when sponsorId provided', async () => {
      const mockCampaigns = [{ id: 'camp-1', title: 'Campaign A', status: 'DRAFT' }];
      prisma.sponsorCampaign.findMany.mockResolvedValue(mockCampaigns);

      const result = await service.getSponsorCampaigns('sp-1');
      expect(result).toEqual(mockCampaigns);
    });
  });

  describe('createCampaignDraft', () => {
    it('returns scopeStatus when no sponsorId', async () => {
      const dto = { title: 'Test', startsAt: '2026-07-01', endsAt: '2026-08-01' };
      const result = await service.createCampaignDraft(dto, undefined, 'user-1');
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('creates campaign with DRAFT status (never ACTIVE)', async () => {
      const dto = { title: 'Summer Campaign', startsAt: '2026-07-01', endsAt: '2026-08-01' };
      const created = { id: 'camp-new', title: 'Summer Campaign', status: 'DRAFT' };
      prisma.sponsorCampaign.create.mockResolvedValue(created);

      const result = await service.createCampaignDraft(dto, 'sp-1', 'user-1');
      expect(result).toEqual(created);
      const firstCall = prisma.sponsorCampaign.create.mock.calls[0];
      const callArgs = firstCall![0] as { data: { status: string } };
      expect(callArgs.data.status).toBe('DRAFT');
      expect(callArgs.data.status).not.toBe('ACTIVE');
      expect(callArgs.data.status).not.toBe('PUBLISHED');
    });
  });

  describe('getSponsorAudiences', () => {
    it('returns PLANNED placeholder', () => {
      const result = service.getSponsorAudiences('sp-1');
      expect(result).toMatchObject({ audienceStatus: 'PLANNED', segments: [] });
    });

    it('mentions Sprint 28 in message', () => {
      const result = service.getSponsorAudiences('sp-1');
      expect(result.message).toMatch(/Sprint 28/);
    });
  });

  describe('getSponsorActivations', () => {
    it('returns scopeStatus when no sponsorId', async () => {
      const result = await service.getSponsorActivations(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns empty array when no campaigns', async () => {
      prisma.sponsorCampaign.findMany.mockResolvedValue([]);

      const result = await service.getSponsorActivations('sp-1');
      expect(result).toEqual([]);
    });
  });

  describe('getSponsorRewards', () => {
    it('returns scopeStatus when no sponsorId', async () => {
      const result = await service.getSponsorRewards(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('enforces isFinancial: false on all rewards', async () => {
      const mockRewards = [
        { id: 'r1', title: 'Badge', rewardType: 'DIGITAL_BADGE' },
        { id: 'r2', title: 'Points', rewardType: 'FAN_POINTS' },
      ];
      prisma.rewardDefinition.findMany.mockResolvedValue(mockRewards);

      const result = await service.getSponsorRewards('sp-1') as Array<Record<string, unknown>>;
      expect(Array.isArray(result)).toBe(true);
      for (const r of result) {
        expect(r.isFinancial).toBe(false);
      }
    });
  });

  describe('getSponsorAnalytics', () => {
    it('returns scopeStatus when no sponsorId', async () => {
      const result = await service.getSponsorAnalytics(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns zero totals when no campaigns', async () => {
      prisma.sponsorCampaign.findMany.mockResolvedValue([]);

      const result = await service.getSponsorAnalytics('sp-1');
      expect(result).toMatchObject({ totalImpressions: 0, totalEngagements: 0 });
    });
  });

  describe('getSponsorClubs', () => {
    it('returns scopeStatus when no sponsorId', async () => {
      const result = await service.getSponsorClubs(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns empty array when no club campaigns', async () => {
      prisma.sponsorCampaign.findMany.mockResolvedValue([]);

      const result = await service.getSponsorClubs('sp-1');
      expect(result).toEqual([]);
    });
  });

  describe('getSponsorAssets', () => {
    it('returns PLANNED placeholder', () => {
      const result = service.getSponsorAssets('sp-1');
      expect(result).toMatchObject({ assetsStatus: 'PLANNED', assets: [] });
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
  });
});
