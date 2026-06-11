import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { RewardReadinessCategory, RewardReadinessStatus } from '@prisma/client';
import { RewardsReadinessService } from './rewards-readiness.service';
import type { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = () => ({
  rewardReadinessDefinition: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  fanRewardReadiness: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  fanValueLedger: {
    aggregate: vi.fn(),
  },
  achievementDefinition: {
    findUnique: vi.fn(),
  },
  badgeDefinition: {
    findUnique: vi.fn(),
  },
  fanAchievement: {
    findUnique: vi.fn(),
  },
  fanBadge: {
    findUnique: vi.fn(),
  },
  fantasyTeam: {
    count: vi.fn(),
  },
  scorePrediction: {
    count: vi.fn(),
  },
  peerChallenge: {
    count: vi.fn(),
  },
});

const MOCK_DEF = {
  id: 'def-1',
  slug: 'fantasy-starter-reward',
  name: 'Fantasy Starter Reward',
  description: 'Test desc',
  category: RewardReadinessCategory.FANTASY,
  isEnabled: true,
  sortOrder: 10,
  minFanValuePoints: 10,
  requiredAchievementSlugs: [],
  requiredBadgeSlugs: [],
  requiresFantasyTeam: true,
  requiresPredictionActivity: false,
  requiresChallengeActivity: false,
  unlockHint: 'Build a team',
  sponsorName: null,
  notRedeemableNote: 'Not redeemable.',
  metadataJson: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_USER = { id: 'user-1', isActive: true };

describe('RewardsReadinessService', () => {
  let service: RewardsReadinessService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new RewardsReadinessService(prisma as unknown as PrismaService, { createInAppNotification: vi.fn().mockResolvedValue(null) } as any, { createRewardEligibleActivity: vi.fn().mockResolvedValue(null) } as any);
  });

  // ── 1. getDefinitions ──────────────────────────────────────────────────────
  it('getDefinitions returns all definitions with no filter', async () => {
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([MOCK_DEF]);
    const result = await service.getDefinitions();
    expect(prisma.rewardReadinessDefinition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
    expect(result).toHaveLength(1);
  });

  it('getDefinitions filters by isEnabled', async () => {
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([MOCK_DEF]);
    await service.getDefinitions({ isEnabled: true });
    expect(prisma.rewardReadinessDefinition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isEnabled: true } }),
    );
  });

  it('getDefinitions filters by category', async () => {
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([MOCK_DEF]);
    await service.getDefinitions({ category: RewardReadinessCategory.FANTASY });
    expect(prisma.rewardReadinessDefinition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { category: RewardReadinessCategory.FANTASY } }),
    );
  });

  // ── 2. createDefinition ────────────────────────────────────────────────────
  it('createDefinition creates and returns definition', async () => {
    prisma.rewardReadinessDefinition.create.mockResolvedValue(MOCK_DEF);
    const dto = {
      slug: 'new-reward',
      name: 'New Reward',
      description: 'desc',
      category: RewardReadinessCategory.FANTASY,
    };
    const result = await service.createDefinition(dto);
    expect(prisma.rewardReadinessDefinition.create).toHaveBeenCalled();
    expect(result).toBe(MOCK_DEF);
  });

  it('createDefinition defaults requiredSlugs to empty arrays', async () => {
    prisma.rewardReadinessDefinition.create.mockResolvedValue(MOCK_DEF);
    await service.createDefinition({
      slug: 'test',
      name: 'Test',
      description: 'desc',
      category: RewardReadinessCategory.PLATFORM,
    });
    const callArg = prisma.rewardReadinessDefinition.create.mock.calls[0]![0]!;
    expect(callArg.data.requiredAchievementSlugs).toEqual([]);
    expect(callArg.data.requiredBadgeSlugs).toEqual([]);
  });

  // ── 3. updateDefinition ────────────────────────────────────────────────────
  it('updateDefinition throws NotFoundException when def not found', async () => {
    prisma.rewardReadinessDefinition.findUnique.mockResolvedValue(null);
    await expect(service.updateDefinition('missing-id', { name: 'X' })).rejects.toThrow(NotFoundException);
  });

  it('updateDefinition updates and returns definition', async () => {
    prisma.rewardReadinessDefinition.findUnique.mockResolvedValue(MOCK_DEF);
    const updated = { ...MOCK_DEF, name: 'Updated' };
    prisma.rewardReadinessDefinition.update.mockResolvedValue(updated);
    const result = await service.updateDefinition('def-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  // ── 4. toggleDefinition ────────────────────────────────────────────────────
  it('toggleDefinition throws NotFoundException when not found', async () => {
    prisma.rewardReadinessDefinition.findUnique.mockResolvedValue(null);
    await expect(service.toggleDefinition('x')).rejects.toThrow(NotFoundException);
  });

  it('toggleDefinition flips isEnabled from true to false', async () => {
    prisma.rewardReadinessDefinition.findUnique.mockResolvedValue({ ...MOCK_DEF, isEnabled: true });
    prisma.rewardReadinessDefinition.update.mockResolvedValue({ ...MOCK_DEF, isEnabled: false });
    const result = await service.toggleDefinition('def-1');
    expect(prisma.rewardReadinessDefinition.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isEnabled: false } }),
    );
    expect(result.isEnabled).toBe(false);
  });

  it('toggleDefinition flips isEnabled from false to true', async () => {
    prisma.rewardReadinessDefinition.findUnique.mockResolvedValue({ ...MOCK_DEF, isEnabled: false });
    prisma.rewardReadinessDefinition.update.mockResolvedValue({ ...MOCK_DEF, isEnabled: true });
    await service.toggleDefinition('def-1');
    expect(prisma.rewardReadinessDefinition.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isEnabled: true } }),
    );
  });

  // ── 5. evaluateFanEligibility ──────────────────────────────────────────────
  it('evaluateFanEligibility throws NotFoundException for unknown user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.evaluateFanEligibility('ghost')).rejects.toThrow(NotFoundException);
  });

  it('evaluateFanEligibility marks ELIGIBLE when all requirements met (fan value + fantasy team)', async () => {
    prisma.user.findUnique.mockResolvedValue(MOCK_USER);
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([MOCK_DEF]);
    prisma.fanValueLedger.aggregate.mockResolvedValue({ _sum: { points: 15 } });
    prisma.fantasyTeam.count.mockResolvedValue(1);
    prisma.fanRewardReadiness.upsert.mockResolvedValue({});

    const results = await service.evaluateFanEligibility('user-1');
    expect(results[0]!.status).toBe(RewardReadinessStatus.ELIGIBLE);
    expect(results[0]!.metRequirements.length).toBeGreaterThan(0);
    expect(results[0]!.unmetRequirements).toHaveLength(0);
  });

  it('evaluateFanEligibility marks INELIGIBLE when fan value insufficient', async () => {
    prisma.user.findUnique.mockResolvedValue(MOCK_USER);
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([MOCK_DEF]);
    prisma.fanValueLedger.aggregate.mockResolvedValue({ _sum: { points: 5 } });
    prisma.fantasyTeam.count.mockResolvedValue(1);
    prisma.fanRewardReadiness.upsert.mockResolvedValue({});

    const results = await service.evaluateFanEligibility('user-1');
    expect(results[0]!.status).toBe(RewardReadinessStatus.INELIGIBLE);
    expect(results[0]!.unmetRequirements.length).toBeGreaterThan(0);
  });

  it('evaluateFanEligibility marks INELIGIBLE when fantasy team missing', async () => {
    prisma.user.findUnique.mockResolvedValue(MOCK_USER);
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([MOCK_DEF]);
    prisma.fanValueLedger.aggregate.mockResolvedValue({ _sum: { points: 50 } });
    prisma.fantasyTeam.count.mockResolvedValue(0);
    prisma.fanRewardReadiness.upsert.mockResolvedValue({});

    const results = await service.evaluateFanEligibility('user-1');
    expect(results[0]!.status).toBe(RewardReadinessStatus.INELIGIBLE);
    expect(results[0]!.unmetRequirements.some(u => u.toLowerCase().includes('fantasy team'))).toBe(true);
  });

  it('evaluateFanEligibility checks achievement requirement', async () => {
    const defWithAch = {
      ...MOCK_DEF,
      minFanValuePoints: null,
      requiresFantasyTeam: false,
      requiredAchievementSlugs: ['early-supporter'],
    };
    prisma.user.findUnique.mockResolvedValue(MOCK_USER);
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([defWithAch]);
    prisma.achievementDefinition.findUnique.mockResolvedValue({ id: 'ach-1', slug: 'early-supporter' });
    prisma.fanAchievement.findUnique.mockResolvedValue({ status: 'UNLOCKED' });
    prisma.fanRewardReadiness.upsert.mockResolvedValue({});

    const results = await service.evaluateFanEligibility('user-1');
    expect(results[0]!.status).toBe(RewardReadinessStatus.ELIGIBLE);
    expect(results[0]!.metRequirements.some(m => m.includes('early-supporter'))).toBe(true);
  });

  it('evaluateFanEligibility marks INELIGIBLE when achievement not unlocked', async () => {
    const defWithAch = {
      ...MOCK_DEF,
      minFanValuePoints: null,
      requiresFantasyTeam: false,
      requiredAchievementSlugs: ['early-supporter'],
    };
    prisma.user.findUnique.mockResolvedValue(MOCK_USER);
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([defWithAch]);
    prisma.achievementDefinition.findUnique.mockResolvedValue({ id: 'ach-1', slug: 'early-supporter' });
    prisma.fanAchievement.findUnique.mockResolvedValue({ status: 'LOCKED' });
    prisma.fanRewardReadiness.upsert.mockResolvedValue({});

    const results = await service.evaluateFanEligibility('user-1');
    expect(results[0]!.status).toBe(RewardReadinessStatus.INELIGIBLE);
  });

  it('evaluateFanEligibility checks badge requirement', async () => {
    const defWithBadge = {
      ...MOCK_DEF,
      minFanValuePoints: null,
      requiresFantasyTeam: false,
      requiredBadgeSlugs: ['badge-early-supporter'],
    };
    prisma.user.findUnique.mockResolvedValue(MOCK_USER);
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([defWithBadge]);
    prisma.badgeDefinition.findUnique.mockResolvedValue({ id: 'badge-1', slug: 'badge-early-supporter' });
    prisma.fanBadge.findUnique.mockResolvedValue({ id: 'fb-1', revokedAt: null });
    prisma.fanRewardReadiness.upsert.mockResolvedValue({});

    const results = await service.evaluateFanEligibility('user-1');
    expect(results[0]!.status).toBe(RewardReadinessStatus.ELIGIBLE);
  });

  it('evaluateFanEligibility marks INELIGIBLE when badge revoked', async () => {
    const defWithBadge = {
      ...MOCK_DEF,
      minFanValuePoints: null,
      requiresFantasyTeam: false,
      requiredBadgeSlugs: ['badge-early-supporter'],
    };
    prisma.user.findUnique.mockResolvedValue(MOCK_USER);
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([defWithBadge]);
    prisma.badgeDefinition.findUnique.mockResolvedValue({ id: 'badge-1', slug: 'badge-early-supporter' });
    prisma.fanBadge.findUnique.mockResolvedValue({ id: 'fb-1', revokedAt: new Date() });
    prisma.fanRewardReadiness.upsert.mockResolvedValue({});

    const results = await service.evaluateFanEligibility('user-1');
    expect(results[0]!.status).toBe(RewardReadinessStatus.INELIGIBLE);
  });

  it('evaluateFanEligibility checks prediction activity requirement', async () => {
    const defWithPred = {
      ...MOCK_DEF,
      minFanValuePoints: null,
      requiresFantasyTeam: false,
      requiresPredictionActivity: true,
    };
    prisma.user.findUnique.mockResolvedValue(MOCK_USER);
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([defWithPred]);
    prisma.scorePrediction.count.mockResolvedValue(3);
    prisma.fanRewardReadiness.upsert.mockResolvedValue({});

    const results = await service.evaluateFanEligibility('user-1');
    expect(results[0]!.status).toBe(RewardReadinessStatus.ELIGIBLE);
  });

  it('evaluateFanEligibility checks challenge activity requirement', async () => {
    const defWithChallenge = {
      ...MOCK_DEF,
      minFanValuePoints: null,
      requiresFantasyTeam: false,
      requiresChallengeActivity: true,
    };
    prisma.user.findUnique.mockResolvedValue(MOCK_USER);
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([defWithChallenge]);
    prisma.peerChallenge.count.mockResolvedValue(0);
    prisma.fanRewardReadiness.upsert.mockResolvedValue({});

    const results = await service.evaluateFanEligibility('user-1');
    expect(results[0]!.status).toBe(RewardReadinessStatus.INELIGIBLE);
    expect(results[0]!.unmetRequirements.some(u => u.toLowerCase().includes('challenge'))).toBe(true);
  });

  it('evaluateFanEligibility marks ELIGIBLE for definition with no requirements', async () => {
    const openDef = {
      ...MOCK_DEF,
      minFanValuePoints: null,
      requiresFantasyTeam: false,
      requiresPredictionActivity: false,
      requiresChallengeActivity: false,
      requiredAchievementSlugs: [],
      requiredBadgeSlugs: [],
    };
    prisma.user.findUnique.mockResolvedValue(MOCK_USER);
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([openDef]);
    prisma.fanRewardReadiness.upsert.mockResolvedValue({});

    const results = await service.evaluateFanEligibility('user-1');
    expect(results[0]!.status).toBe(RewardReadinessStatus.ELIGIBLE);
    expect(results[0]!.metRequirements.some(m => m.includes('No specific requirements'))).toBe(true);
  });

  // ── 6. evaluateAllFans ────────────────────────────────────────────────────
  it('evaluateAllFans evaluates all active users', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'u1', isActive: true })
      .mockResolvedValueOnce({ id: 'u2', isActive: true });
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([]);
    prisma.fanRewardReadiness.upsert.mockResolvedValue({});

    const result = await service.evaluateAllFans();
    expect(result.evaluated).toBe(2);
    expect(result.results).toHaveLength(2);
  });

  // ── 7. getFanReadinessOverview ─────────────────────────────────────────────
  it('getFanReadinessOverview returns counts and disclaimer', async () => {
    prisma.fanRewardReadiness.findMany.mockResolvedValue([
      { id: 'r1', definitionId: 'def-1', status: RewardReadinessStatus.ELIGIBLE, evaluatedAt: new Date(), metRequirementsJson: ['met'], unmetRequirementsJson: [], definition: MOCK_DEF },
      { id: 'r2', definitionId: 'def-2', status: RewardReadinessStatus.INELIGIBLE, evaluatedAt: new Date(), metRequirementsJson: [], unmetRequirementsJson: ['unmet'], definition: { ...MOCK_DEF, id: 'def-2', slug: 'pred-reward' } },
    ]);
    const overview = await service.getFanReadinessOverview('user-1');
    expect(overview.eligibleCount).toBe(1);
    expect(overview.ineligibleCount).toBe(1);
    expect(overview.nonFinancialDisclaimer).toContain('no cash value');
    expect(overview.notYetRedeemableNote).toContain('not yet redeemable');
  });

  // ── 8. getFanEligibleRewards ───────────────────────────────────────────────
  it('getFanEligibleRewards returns only ELIGIBLE rows', async () => {
    prisma.fanRewardReadiness.findMany.mockResolvedValue([
      { id: 'r1', definitionId: 'def-1', status: RewardReadinessStatus.ELIGIBLE, evaluatedAt: new Date(), metRequirementsJson: ['met'], unmetRequirementsJson: [], definition: MOCK_DEF },
    ]);
    const result = await service.getFanEligibleRewards('user-1');
    expect(result.eligibleCount).toBe(1);
    expect(result.notYetRedeemableNote).toContain('not yet redeemable');
    expect(result.nonFinancialDisclaimer).toContain('no cash value');
  });

  // ── 9. getFanLockedRewards ─────────────────────────────────────────────────
  it('getFanLockedRewards returns INELIGIBLE rows plus unevaluated definitions', async () => {
    prisma.rewardReadinessDefinition.findMany.mockResolvedValue([MOCK_DEF]);
    prisma.fanRewardReadiness.findMany
      .mockResolvedValueOnce([]) // ineligible rows
      .mockResolvedValueOnce([]); // eligible rows for deduplication
    const result = await service.getFanLockedRewards('user-1');
    expect(result.lockedCount).toBe(1); // 1 unevaluated def
    expect(result.locked[0]!.unmetRequirements[0]).toContain('Not yet evaluated');
  });

  // ── 10. getAdminStats ──────────────────────────────────────────────────────
  it('getAdminStats returns counts and non-financial confirmation', async () => {
    prisma.rewardReadinessDefinition.count
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(5);
    prisma.fanRewardReadiness.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(30)
      .mockResolvedValueOnce(60)
      .mockResolvedValueOnce(10);
    prisma.rewardReadinessDefinition.groupBy.mockResolvedValue([
      { category: RewardReadinessCategory.FANTASY, _count: { id: 2 } },
    ]);

    const stats = await service.getAdminStats();
    expect(stats.totalDefinitions).toBe(6);
    expect(stats.eligibleCount).toBe(30);
    expect(stats.eligibilityRate).toBe(30);
    expect(stats.nonFinancialConfirmation).toContain('non-financial');
  });

  // ── 11. getEligibleFansForDefinition ──────────────────────────────────────
  it('getEligibleFansForDefinition throws NotFoundException when def not found', async () => {
    prisma.rewardReadinessDefinition.findUnique.mockResolvedValue(null);
    await expect(service.getEligibleFansForDefinition('missing')).rejects.toThrow(NotFoundException);
  });

  it('getEligibleFansForDefinition returns paginated eligible fans', async () => {
    prisma.rewardReadinessDefinition.findUnique.mockResolvedValue(MOCK_DEF);
    prisma.fanRewardReadiness.findMany.mockResolvedValue([
      { id: 'r1', userId: 'u1', evaluatedAt: new Date(), metRequirementsJson: ['met'], user: { id: 'u1', email: 'u1@test.com', role: 'FAN', createdAt: new Date() } },
    ]);
    prisma.fanRewardReadiness.count.mockResolvedValue(1);

    const result = await service.getEligibleFansForDefinition('def-1');
    expect(result.total).toBe(1);
    expect(result.fans[0]!.email).toBe('u1@test.com');
  });
});
