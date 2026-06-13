import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CampaignAnalyticsService } from './campaign-analytics.service';
import type { PrismaService } from '../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------

const makePrisma = () =>
  ({
    sponsorCampaign: {
      findUnique: vi.fn().mockResolvedValue({ id: 'camp-1', sponsorId: 'sponsor-1', clubId: 'club-1' }),
      findMany: vi.fn().mockResolvedValue([{ id: 'camp-1' }]),
    },
    mediaAsset: {
      findMany: vi.fn().mockResolvedValue([]), // no assets by default → avoids extra count calls
    },
    fanCampaignParticipation: {
      count: vi.fn().mockResolvedValue(10),
    },
    fanCampaignActionCompletion: {
      count: vi.fn().mockResolvedValue(25),
    },
    fanReward: {
      count: vi.fn().mockResolvedValue(8),
    },
    mediaEngagementEvent: {
      count: vi.fn().mockResolvedValue(50),
    },
    walletTransaction: {
      count: vi.fn().mockResolvedValue(5),
    },
    campaignAnalyticsSnapshot: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({
        id: 'snap-1',
        campaignId: 'camp-1',
        snapshotDate: new Date('2026-06-13'),
        uniqueParticipants: 10,
        completedParticipants: 6,
        actionsCompleted: 25,
        rewardsIssued: 8,
        rewardsRedeemed: 3,
        videoViews: 0,
        videoCompletions: 0,
        ctaClicks: 25,
        walletLinksStarted: 5,
        walletLinksCompleted: 5,
      }),
    },
    adminAuditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
  });

// ---------------------------------------------------------------------------
// getCampaignAnalytics
// ---------------------------------------------------------------------------

describe('CampaignAnalyticsService.getCampaignAnalytics', () => {
  let service: CampaignAnalyticsService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new CampaignAnalyticsService(prisma as any);
  });

  it('throws NotFoundException when campaign does not exist', async () => {
    prisma.sponsorCampaign.findUnique.mockResolvedValue(null);

    await expect(service.getCampaignAnalytics('camp-missing')).rejects.toThrow(NotFoundException);
  });

  it('returns zero liveAggregates when all counts are zero', async () => {
    prisma.fanCampaignParticipation.count.mockResolvedValue(0);
    prisma.fanCampaignActionCompletion.count.mockResolvedValue(0);
    prisma.fanReward.count.mockResolvedValue(0);
    prisma.mediaEngagementEvent.count.mockResolvedValue(0);
    prisma.walletTransaction.count.mockResolvedValue(0);

    const result = await service.getCampaignAnalytics('camp-1');

    expect(result.liveAggregates.uniqueParticipants).toBe(0);
    expect(result.liveAggregates.completedParticipants).toBe(0);
    expect(result.liveAggregates.rewardsIssued).toBe(0);
    expect(result.liveAggregates.videoViews).toBe(0);
    expect(result.liveAggregates.ctaClicks).toBe(0);
  });

  it('returns uniqueParticipants from FanCampaignParticipation count', async () => {
    prisma.fanCampaignParticipation.count
      .mockResolvedValueOnce(42)  // uniqueParticipants (no status filter)
      .mockResolvedValueOnce(20); // completedParticipants (status filter)

    const result = await service.getCampaignAnalytics('camp-1');

    expect(result.liveAggregates.uniqueParticipants).toBe(42);
  });

  it('returns completedParticipants from participation count filtered by COMPLETED/REWARDED', async () => {
    prisma.fanCampaignParticipation.count
      .mockResolvedValueOnce(100) // uniqueParticipants
      .mockResolvedValueOnce(37); // completedParticipants

    const result = await service.getCampaignAnalytics('camp-1');

    expect(result.liveAggregates.completedParticipants).toBe(37);
  });

  it('returns rewardsIssued from FanReward count (excluding CANCELLED)', async () => {
    prisma.fanReward.count
      .mockResolvedValueOnce(15) // rewardsIssued (status != CANCELLED)
      .mockResolvedValueOnce(4); // rewardsRedeemed (status = REDEEMED)

    const result = await service.getCampaignAnalytics('camp-1');

    expect(result.liveAggregates.rewardsIssued).toBe(15);
  });

  it('returns videoViews=0 when campaign has no media assets (short-circuits count query)', async () => {
    prisma.mediaAsset.findMany.mockResolvedValue([]); // no assets

    const result = await service.getCampaignAnalytics('camp-1');

    expect(result.liveAggregates.videoViews).toBe(0);
    // mediaEngagementEvent.count must NOT have been called (optimised path)
    expect(prisma.mediaEngagementEvent.count).not.toHaveBeenCalled();
  });

  it('returns videoViews from MediaEngagementEvent VIEW count when assets exist', async () => {
    prisma.mediaAsset.findMany.mockResolvedValue([{ id: 'asset-1' }]);
    prisma.mediaEngagementEvent.count.mockResolvedValue(99);

    const result = await service.getCampaignAnalytics('camp-1');

    expect(result.liveAggregates.videoViews).toBe(99);
  });

  it('returns ctaClicks from FanCampaignActionCompletion count', async () => {
    prisma.fanCampaignActionCompletion.count
      .mockResolvedValueOnce(30) // actionsCompleted
      .mockResolvedValueOnce(7); // ctaClicks (CLICK_CTA filter)

    const result = await service.getCampaignAnalytics('camp-1');

    expect(result.liveAggregates.ctaClicks).toBe(7);
  });

  it('does NOT expose fan identity in response (no fanUserId, email, name fields)', async () => {
    const result = await service.getCampaignAnalytics('camp-1');
    const serialised = JSON.stringify(result);

    expect(serialised).not.toMatch(/fanUserId/);
    expect(serialised).not.toMatch(/email/);
    expect(serialised).not.toMatch(/displayName/);
  });

  it('includes campaignId and latestSnapshot in response shape', async () => {
    const result = await service.getCampaignAnalytics('camp-1');

    expect(result.campaignId).toBe('camp-1');
    expect(Object.keys(result)).toContain('latestSnapshot');
    expect(Object.keys(result)).toContain('liveAggregates');
  });
});

// ---------------------------------------------------------------------------
// recalculateDailySnapshot
// ---------------------------------------------------------------------------

describe('CampaignAnalyticsService.recalculateDailySnapshot', () => {
  let service: CampaignAnalyticsService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new CampaignAnalyticsService(prisma as any);
  });

  it('throws NotFoundException when campaign does not exist', async () => {
    prisma.sponsorCampaign.findUnique.mockResolvedValue(null);

    await expect(service.recalculateDailySnapshot('camp-missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('upserts a CampaignAnalyticsSnapshot keyed on (campaignId, snapshotDate)', async () => {
    await service.recalculateDailySnapshot('camp-1', new Date('2026-06-13'), 'admin-1');

    expect(prisma.campaignAnalyticsSnapshot.upsert).toHaveBeenCalledOnce();
    const call = prisma.campaignAnalyticsSnapshot.upsert.mock.calls[0]![0]!;
    expect(call.where.campaignId_snapshotDate.campaignId).toBe('camp-1');
    expect(call.where.campaignId_snapshotDate.snapshotDate).toBeInstanceOf(Date);
  });

  it('writes an AdminAuditLog entry with ANALYTICS_RECALCULATED action', async () => {
    await service.recalculateDailySnapshot('camp-1', undefined, 'admin-1');

    expect(prisma.adminAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'ANALYTICS_RECALCULATED' }),
      }),
    );
  });

  it('is idempotent — calling twice uses upsert which updates existing snapshot', async () => {
    await service.recalculateDailySnapshot('camp-1', new Date('2026-06-13'));
    await service.recalculateDailySnapshot('camp-1', new Date('2026-06-13'));

    // Both calls should use upsert (not create) — no throw, same key
    expect(prisma.campaignAnalyticsSnapshot.upsert).toHaveBeenCalledTimes(2);
    // Both calls target the same composite key
    const calls = prisma.campaignAnalyticsSnapshot.upsert.mock.calls;
    const key0 = calls[0]![0]!.where.campaignId_snapshotDate;
    const key1 = calls[1]![0]!.where.campaignId_snapshotDate;
    expect(key0.campaignId).toBe(key1.campaignId);
    expect(key0.snapshotDate.getTime()).toBe(key1.snapshotDate.getTime());
  });

  it('returns the upserted snapshot', async () => {
    const result = await service.recalculateDailySnapshot('camp-1');

    expect(result).toMatchObject({ id: 'snap-1', campaignId: 'camp-1' });
  });

  it('defaults snapshotDate to today (UTC midnight) when not provided', async () => {
    await service.recalculateDailySnapshot('camp-1');

    const call = prisma.campaignAnalyticsSnapshot.upsert.mock.calls[0]![0]!;
    const snapshotDate: Date = call.where.campaignId_snapshotDate.snapshotDate;
    // Should be UTC midnight — hours/minutes/seconds/ms all zero
    expect(snapshotDate.getUTCHours()).toBe(0);
    expect(snapshotDate.getUTCMinutes()).toBe(0);
    expect(snapshotDate.getUTCSeconds()).toBe(0);
    expect(snapshotDate.getUTCMilliseconds()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getSponsorAnalytics
// ---------------------------------------------------------------------------

describe('CampaignAnalyticsService.getSponsorAnalytics', () => {
  let service: CampaignAnalyticsService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new CampaignAnalyticsService(prisma as any);
  });

  it('returns zero totals when sponsor has no campaigns', async () => {
    prisma.sponsorCampaign.findMany.mockResolvedValue([]);

    const result = await service.getSponsorAnalytics('sponsor-1');

    expect(result.campaignCount).toBe(0);
    expect(result.totalUniqueParticipants).toBe(0);
    expect(result.totalRewardsIssued).toBe(0);
    expect(result.totalVideoViews).toBe(0);
    expect(result.totalCtaClicks).toBe(0);
  });

  it('returns aggregate totals summed from latest snapshot per campaign', async () => {
    prisma.sponsorCampaign.findMany.mockResolvedValue([{ id: 'camp-1' }, { id: 'camp-2' }]);
    prisma.campaignAnalyticsSnapshot.findMany.mockResolvedValue([
      {
        id: 'snap-1',
        campaignId: 'camp-1',
        snapshotDate: new Date('2026-06-13'),
        uniqueParticipants: 100,
        completedParticipants: 60,
        rewardsIssued: 20,
        rewardsRedeemed: 10,
        videoViews: 300,
        ctaClicks: 50,
        actionsCompleted: 80,
        walletLinksStarted: 5,
        walletLinksCompleted: 4,
      },
      {
        id: 'snap-2',
        campaignId: 'camp-2',
        snapshotDate: new Date('2026-06-13'),
        uniqueParticipants: 50,
        completedParticipants: 30,
        rewardsIssued: 10,
        rewardsRedeemed: 5,
        videoViews: 150,
        ctaClicks: 25,
        actionsCompleted: 40,
        walletLinksStarted: 2,
        walletLinksCompleted: 2,
      },
    ]);

    const result = await service.getSponsorAnalytics('sponsor-1');

    expect(result.campaignCount).toBe(2);
    expect(result.totalUniqueParticipants).toBe(150);
    expect(result.totalRewardsIssued).toBe(30);
    expect(result.totalVideoViews).toBe(450);
    expect(result.totalCtaClicks).toBe(75);
  });

  it('uses only the latest snapshot per campaign (deduplicates by date desc)', async () => {
    prisma.sponsorCampaign.findMany.mockResolvedValue([{ id: 'camp-1' }]);
    // Two snapshots for the same campaign — service should pick the first (latest) per campId
    prisma.campaignAnalyticsSnapshot.findMany.mockResolvedValue([
      {
        id: 'snap-latest',
        campaignId: 'camp-1',
        snapshotDate: new Date('2026-06-13'),
        uniqueParticipants: 200,
        completedParticipants: 100,
        rewardsIssued: 40,
        rewardsRedeemed: 20,
        videoViews: 600,
        ctaClicks: 100,
        actionsCompleted: 160,
        walletLinksStarted: 10,
        walletLinksCompleted: 8,
      },
      {
        id: 'snap-old',
        campaignId: 'camp-1',
        snapshotDate: new Date('2026-06-12'),
        uniqueParticipants: 50,
        completedParticipants: 20,
        rewardsIssued: 5,
        rewardsRedeemed: 2,
        videoViews: 100,
        ctaClicks: 10,
        actionsCompleted: 30,
        walletLinksStarted: 1,
        walletLinksCompleted: 1,
      },
    ]);

    const result = await service.getSponsorAnalytics('sponsor-1');

    // Must use latest snapshot (200), not sum of both (250)
    expect(result.totalUniqueParticipants).toBe(200);
  });

  it('does not include fan identity fields in aggregate response', async () => {
    prisma.sponsorCampaign.findMany.mockResolvedValue([{ id: 'camp-1' }]);

    const result = await service.getSponsorAnalytics('sponsor-1');
    const serialised = JSON.stringify(result);

    expect(serialised).not.toMatch(/fanUserId/);
    expect(serialised).not.toMatch(/email/);
  });
});

// ---------------------------------------------------------------------------
// getClubAnalytics
// ---------------------------------------------------------------------------

describe('CampaignAnalyticsService.getClubAnalytics', () => {
  let service: CampaignAnalyticsService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new CampaignAnalyticsService(prisma as any);
  });

  it('returns zero totals when club has no campaigns', async () => {
    prisma.sponsorCampaign.findMany.mockResolvedValue([]);

    const result = await service.getClubAnalytics('club-1');

    expect(result.campaignCount).toBe(0);
    expect(result.totalUniqueParticipants).toBe(0);
    expect(result.totalRewardsIssued).toBe(0);
    expect(result.totalVideoViews).toBe(0);
  });

  it('returns aggregate totals for club-scoped campaigns', async () => {
    prisma.sponsorCampaign.findMany.mockResolvedValue([{ id: 'camp-A' }, { id: 'camp-B' }]);
    prisma.campaignAnalyticsSnapshot.findMany.mockResolvedValue([
      {
        id: 'snap-A',
        campaignId: 'camp-A',
        snapshotDate: new Date('2026-06-13'),
        uniqueParticipants: 80,
        completedParticipants: 40,
        rewardsIssued: 16,
        rewardsRedeemed: 8,
        videoViews: 400,
        ctaClicks: 60,
        actionsCompleted: 50,
        walletLinksStarted: 3,
        walletLinksCompleted: 3,
      },
      {
        id: 'snap-B',
        campaignId: 'camp-B',
        snapshotDate: new Date('2026-06-13'),
        uniqueParticipants: 20,
        completedParticipants: 10,
        rewardsIssued: 4,
        rewardsRedeemed: 2,
        videoViews: 100,
        ctaClicks: 15,
        actionsCompleted: 12,
        walletLinksStarted: 1,
        walletLinksCompleted: 1,
      },
    ]);

    const result = await service.getClubAnalytics('club-1');

    expect(result.clubId).toBe('club-1');
    expect(result.campaignCount).toBe(2);
    expect(result.totalUniqueParticipants).toBe(100);
    expect(result.totalRewardsIssued).toBe(20);
    expect(result.totalVideoViews).toBe(500);
  });

  it('club analytics response does not expose fan identity', async () => {
    prisma.sponsorCampaign.findMany.mockResolvedValue([]);

    const result = await service.getClubAnalytics('club-1');
    const serialised = JSON.stringify(result);

    expect(serialised).not.toMatch(/fanUserId/);
    expect(serialised).not.toMatch(/email/);
  });
});
