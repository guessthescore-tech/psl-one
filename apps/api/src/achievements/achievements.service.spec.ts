import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AchievementStatus, AchievementCategory, AchievementTriggerType, FanValueStatus, FanValueType } from '@prisma/client';
import { AchievementsService } from './achievements.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { FanValueLedgerService } from '../fan-value/fan-value-ledger.service';

const makeFanValueMock = () => ({
  postAchievementAward: vi.fn().mockResolvedValue({}),
}) as unknown as FanValueLedgerService;

const makePrismaMock = () => ({
  achievementDefinition: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  badgeDefinition: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  achievementBadge: {
    upsert: vi.fn(),
  },
  fanAchievement: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
  },
  fanBadge: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  fantasyTeam: { count: vi.fn() },
  scorePrediction: { count: vi.fn() },
  fantasyLeagueMember: { count: vi.fn() },
  fantasyLeague: { count: vi.fn() },
  peerChallenge: { count: vi.fn() },
  fantasyGameweekScore: { aggregate: vi.fn() },
  predictionPointsLedger: { aggregate: vi.fn() },
  fanValueLedger: { aggregate: vi.fn() },
  fanProfile: { findUnique: vi.fn() },
});

const MOCK_DEF = {
  id: 'def-1',
  slug: 'first-fantasy-team',
  name: 'First Fantasy Team',
  description: 'Create your first fantasy team',
  category: AchievementCategory.FANTASY,
  triggerType: AchievementTriggerType.FIRST_FANTASY_TEAM,
  threshold: null,
  fanValuePoints: 10,
  isActive: true,
  sortOrder: 0,
  badges: [{ badge: { id: 'badge-1', slug: 'first-fantasy-team', name: 'First Team', rarity: 'COMMON', icon: '⚽', imageUrl: null, category: AchievementCategory.FANTASY } }],
};

const MOCK_FA = {
  id: 'fa-1',
  userId: 'user-1',
  achievementDefinitionId: 'def-1',
  status: AchievementStatus.UNLOCKED,
  progress: 1,
  target: null,
  unlockedAt: new Date('2026-01-01'),
  awardedByUserId: null,
  revokedAt: null,
  revokeReason: null,
  metadataJson: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AchievementsService', () => {
  let service: AchievementsService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let fanValueMock: ReturnType<typeof makeFanValueMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    fanValueMock = makeFanValueMock();
    service = new AchievementsService(prisma as unknown as PrismaService, fanValueMock, { createInAppNotification: vi.fn().mockResolvedValue(null) } as any, { createAchievementActivity: vi.fn().mockResolvedValue(null), createBadgeActivity: vi.fn().mockResolvedValue(null) } as any);
  });

  // ── 1. getDefinitions ──────────────────────────────────────────────────────
  it('getDefinitions returns all active definitions', async () => {
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_DEF]);
    const result = await service.getDefinitions({ isActive: true });
    expect(result).toHaveLength(1);
    expect(result[0]!.slug).toBe('first-fantasy-team');
  });

  it('getDefinitions passes category filter', async () => {
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await service.getDefinitions({ category: AchievementCategory.FANTASY });
    expect(prisma.achievementDefinition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: AchievementCategory.FANTASY }) }),
    );
  });

  // ── 2. getFanAchievements ──────────────────────────────────────────────────
  it('getFanAchievements merges definitions with fan progress', async () => {
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_DEF]);
    (prisma.fanAchievement.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { ...MOCK_FA, definition: MOCK_DEF },
    ]);
    const result = await service.getFanAchievements('user-1');
    expect(result.achievements).toHaveLength(1);
    expect(result.achievements[0]!.status).toBe(AchievementStatus.UNLOCKED);
    expect(result.achievements[0]!.unlockedAt).toBeTruthy();
  });

  it('getFanAchievements shows LOCKED for unearned definitions', async () => {
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_DEF]);
    (prisma.fanAchievement.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const result = await service.getFanAchievements('user-1');
    expect(result.achievements[0]!.status).toBe(AchievementStatus.LOCKED);
    expect(result.achievements[0]!.unlockedAt).toBeNull();
  });

  // ── 3. getFanBadges ────────────────────────────────────────────────────────
  it('getFanBadges returns only non-revoked badges', async () => {
    const badge = { id: 'fb-1', badgeDefinitionId: 'badge-1', userId: 'user-1', awardedAt: new Date(), revokedAt: null, revokeReason: null, isDisplayed: true, badge: { slug: 'first-fantasy-team', name: 'First Team', description: '', rarity: 'COMMON', icon: '⚽', imageUrl: null, category: AchievementCategory.FANTASY } };
    (prisma.fanBadge.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([badge]);
    const result = await service.getFanBadges('user-1');
    expect(result.badges).toHaveLength(1);
    expect(result.badges[0]!.slug).toBe('first-fantasy-team');
  });

  // ── 4. getFanAchievementSummary ────────────────────────────────────────────
  it('getFanAchievementSummary returns correct totals', async () => {
    (prisma.achievementDefinition.count as ReturnType<typeof vi.fn>).mockResolvedValue(17);
    (prisma.fanAchievement.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { ...MOCK_FA, definition: MOCK_DEF },
    ]);
    (prisma.fanBadge.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    (prisma.fanValueLedger.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({ _sum: { points: 50 } });
    (prisma.fanBadge.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await service.getFanAchievementSummary('user-1');
    expect(result.totalCount).toBe(17);
    expect(result.unlockedCount).toBe(1);
    expect(result.badgeCount).toBe(1);
    expect(result.achievementPoints).toBe(50);
  });

  // ── 5. awardAchievement — idempotent ──────────────────────────────────────
  it('awardAchievement creates fan achievement and posts fan value', async () => {
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_DEF);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_FA);
    (prisma.fanBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await service.awardAchievement('user-1', 'first-fantasy-team');

    expect(prisma.fanAchievement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ userId: 'user-1', status: AchievementStatus.UNLOCKED }) }),
    );
    expect(fanValueMock.postAchievementAward).toHaveBeenCalledWith('def-1', 'user-1', 10, expect.any(String));
  });

  it('awardAchievement returns existing without re-awarding if already UNLOCKED', async () => {
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_DEF);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_FA);

    const result = await service.awardAchievement('user-1', 'first-fantasy-team');

    expect(result).toEqual(MOCK_FA);
    expect(prisma.fanAchievement.upsert).not.toHaveBeenCalled();
    expect(fanValueMock.postAchievementAward).not.toHaveBeenCalled();
  });

  it('awardAchievement throws NotFoundException for unknown slug', async () => {
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.awardAchievement('user-1', 'no-such-slug')).rejects.toThrow(NotFoundException);
  });

  it('awardAchievement skips fan value post if fanValuePoints is 0', async () => {
    const defNoPoints = { ...MOCK_DEF, fanValuePoints: 0, badges: [] };
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(defNoPoints);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_FA);

    await service.awardAchievement('user-1', 'first-fantasy-team');
    expect(fanValueMock.postAchievementAward).not.toHaveBeenCalled();
  });

  // ── 6. updateProgress ─────────────────────────────────────────────────────
  it('updateProgress sets IN_PROGRESS when below threshold', async () => {
    const defWithThreshold = { ...MOCK_DEF, threshold: 25, fanValuePoints: 15, badges: [] };
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(defWithThreshold);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await service.updateProgress('user-1', 'first-fantasy-team', 10, 25);

    expect(prisma.fanAchievement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ status: AchievementStatus.IN_PROGRESS, progress: 10 }) }),
    );
  });

  it('updateProgress awards when progress meets threshold', async () => {
    const defWithThreshold = { ...MOCK_DEF, threshold: 25, badges: [] };
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(defWithThreshold);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(null) // first call in updateProgress check
      .mockResolvedValue(null); // call inside awardAchievement

    // Mock the full awardAchievement path
    const awardSpy = vi.spyOn(service, 'awardAchievement').mockResolvedValue(MOCK_FA);

    await service.updateProgress('user-1', 'first-fantasy-team', 25, 25);
    expect(awardSpy).toHaveBeenCalledWith('user-1', 'first-fantasy-team');
  });

  it('updateProgress is no-op if already UNLOCKED', async () => {
    const defWithThreshold = { ...MOCK_DEF, threshold: 25, badges: [] };
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(defWithThreshold);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_FA);

    await service.updateProgress('user-1', 'first-fantasy-team', 25, 25);
    expect(prisma.fanAchievement.upsert).not.toHaveBeenCalled();
  });

  // ── 7. revokeAchievement ──────────────────────────────────────────────────
  it('revokeAchievement marks status REVOKED', async () => {
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_FA);
    (prisma.fanAchievement.update as ReturnType<typeof vi.fn>).mockResolvedValue({ ...MOCK_FA, status: AchievementStatus.REVOKED });

    const result = await service.revokeAchievement('user-1', 'fa-1', 'test reason', 'admin-1');
    expect(result.status).toBe(AchievementStatus.REVOKED);
    expect(prisma.fanAchievement.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: AchievementStatus.REVOKED }) }),
    );
  });

  it('revokeAchievement throws NotFoundException if fan achievement missing', async () => {
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.revokeAchievement('user-1', 'fa-missing', 'reason', 'admin-1')).rejects.toThrow(NotFoundException);
  });

  it('revokeAchievement throws BadRequestException if achievement belongs to different user', async () => {
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ ...MOCK_FA, userId: 'user-other' });
    await expect(service.revokeAchievement('user-1', 'fa-1', 'reason', 'admin-1')).rejects.toThrow(BadRequestException);
  });

  // ── 8. revokeBadge ────────────────────────────────────────────────────────
  it('revokeBadge marks revokedAt and isDisplayed:false', async () => {
    const mockBadge = { id: 'fb-1', userId: 'user-1', badgeDefinitionId: 'badge-1', revokedAt: null, isDisplayed: true };
    (prisma.fanBadge.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockBadge);
    (prisma.fanBadge.update as ReturnType<typeof vi.fn>).mockResolvedValue({ ...mockBadge, revokedAt: new Date(), isDisplayed: false });

    const result = await service.revokeBadge('user-1', 'fb-1', 'cheating', 'admin-1');
    expect(result.isDisplayed).toBe(false);
    expect(result.revokedAt).toBeTruthy();
  });

  // ── 9. createAchievementDefinition ────────────────────────────────────────
  it('createAchievementDefinition delegates to prisma.create', async () => {
    (prisma.achievementDefinition.create as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_DEF);
    const result = await service.createAchievementDefinition({
      slug: 'first-fantasy-team', name: 'First Fantasy Team', description: '...', category: AchievementCategory.FANTASY, triggerType: AchievementTriggerType.FIRST_FANTASY_TEAM,
    });
    expect(result.slug).toBe('first-fantasy-team');
  });

  it('updateAchievementDefinition throws NotFoundException if missing', async () => {
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.updateAchievementDefinition('def-missing', { name: 'Updated' })).rejects.toThrow(NotFoundException);
  });

  // ── 10. evaluateUserAchievements ──────────────────────────────────────────
  it('evaluateUserAchievements evaluates all non-manual active definitions', async () => {
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_DEF]);
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_DEF);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fantasyTeam.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_FA);
    (prisma.fanBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await service.evaluateUserAchievements('user-1');
    expect(result.evaluated).toBe(1);
    expect(result.results[0]!.awarded).toBe(true);
  });

  it('evaluateUserAchievements skips already unlocked achievements', async () => {
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_DEF]);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_FA);

    const result = await service.evaluateUserAchievements('user-1');
    expect(result.results[0]!.awarded).toBe(false);
    expect(prisma.fanAchievement.upsert).not.toHaveBeenCalled();
  });

  // ── 11. trigger evaluators ────────────────────────────────────────────────
  it('checkTrigger FIRST_FANTASY_TEAM returns true when fantasyTeam exists', async () => {
    const defNoPoints = { ...MOCK_DEF, id: 'def-x', fanValuePoints: 0, badges: [] };
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([defNoPoints]);
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(defNoPoints);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fantasyTeam.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_FA);
    (prisma.fanBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await service.evaluateUserAchievements('user-1');
    expect(result.results[0]!.awarded).toBe(true);
  });

  it('checkTrigger FANTASY_GAMEWEEK_POINTS awards when threshold met', async () => {
    const gwDef = { ...MOCK_DEF, id: 'def-gw', slug: 'fantasy-gameweek-25', triggerType: AchievementTriggerType.FANTASY_GAMEWEEK_POINTS, threshold: 25, fanValuePoints: 15, badges: [] };
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([gwDef]);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fantasyGameweekScore.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({ _max: { netPoints: 30 } });
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(gwDef);
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ ...MOCK_FA, achievementDefinitionId: 'def-gw' });
    (prisma.fanBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await service.evaluateUserAchievements('user-1');
    expect(result.results[0]!.awarded).toBe(true);
  });

  it('checkTrigger PROFILE_COMPLETED returns true when displayName set', async () => {
    const profDef = { ...MOCK_DEF, id: 'def-prof', slug: 'profile-completed', triggerType: AchievementTriggerType.PROFILE_COMPLETED, threshold: null, fanValuePoints: 5, badges: [] };
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([profDef]);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fanProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ displayName: 'Sipho' });
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(profDef);
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ ...MOCK_FA, achievementDefinitionId: 'def-prof' });
    (prisma.fanBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await service.evaluateUserAchievements('user-1');
    expect(result.results[0]!.awarded).toBe(true);
  });

  // ── 12. getAdminAchievementStats ──────────────────────────────────────────
  it('getAdminAchievementStats returns correct shape', async () => {
    (prisma.achievementDefinition.count as ReturnType<typeof vi.fn>).mockResolvedValue(17);
    (prisma.fanAchievement.count as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(30);
    (prisma.fanBadge.count as ReturnType<typeof vi.fn>).mockResolvedValue(25);
    (prisma.fanAchievement.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.fanAchievement.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([{ status: AchievementStatus.UNLOCKED, _count: { id: 30 } }]);

    const result = await service.getAdminAchievementStats();
    expect(result.totalDefinitions).toBe(17);
    expect(result.totalFanAchievements).toBe(50);
    expect(result.totalUnlocked).toBe(30);
    expect(result.totalBadges).toBe(25);
    expect(result.unlockRate).toBe(60);
  });

  // ── 13. safeEvaluate (integration hook safety) ────────────────────────────
  it('safeEvaluate resolves even when evaluateSingleAchievement throws', async () => {
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    // Should not throw
    await expect(service.safeEvaluate('user-1', ['nonexistent-slug'])).resolves.toBeUndefined();
  });

  it('safeEvaluate evaluates multiple slugs', async () => {
    const spy = vi.spyOn(service, 'evaluateSingleAchievement').mockResolvedValue({ slug: 'test', awarded: false });
    await service.safeEvaluate('user-1', ['slug-a', 'slug-b']);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  // ── 14. linkBadgeToAchievement ────────────────────────────────────────────
  it('linkBadgeToAchievement calls upsert with correct composite key', async () => {
    (prisma.achievementBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'ab-1' });
    await service.linkBadgeToAchievement('def-1', 'badge-1');
    expect(prisma.achievementBadge.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { achievementDefinitionId_badgeDefinitionId: { achievementDefinitionId: 'def-1', badgeDefinitionId: 'badge-1' } },
      }),
    );
  });

  // ── 15. createBadgeDefinition ─────────────────────────────────────────────
  it('createBadgeDefinition delegates to prisma.create', async () => {
    const mockBadgeDef = { id: 'bd-1', slug: 'first-team-badge', name: 'First Team', rarity: 'COMMON', category: AchievementCategory.FANTASY };
    (prisma.badgeDefinition.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockBadgeDef);
    const result = await service.createBadgeDefinition({ slug: 'first-team-badge', name: 'First Team', description: 'Earn first team', rarity: 'COMMON', category: AchievementCategory.FANTASY });
    expect(result.slug).toBe('first-team-badge');
    expect(prisma.badgeDefinition.create).toHaveBeenCalled();
  });

  it('updateBadgeDefinition throws NotFoundException if missing', async () => {
    (prisma.badgeDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.updateBadgeDefinition('bd-missing', { name: 'Updated' })).rejects.toThrow(NotFoundException);
  });

  // ── 16. awardAchievement creates FanBadge ─────────────────────────────────
  it('awardAchievement also upserts FanBadge for linked badges', async () => {
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_DEF);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_FA);
    (prisma.fanBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await service.awardAchievement('user-1', 'first-fantasy-team');

    expect(prisma.fanBadge.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_badgeDefinitionId: { userId: 'user-1', badgeDefinitionId: 'badge-1' } },
        create: expect.objectContaining({ userId: 'user-1', badgeDefinitionId: 'badge-1' }),
      }),
    );
  });

  // ── 17. Inactive achievements do not auto-award ────────────────────────────
  it('evaluateAchievement returns awarded:false for inactive definition', async () => {
    const inactiveDef = { ...MOCK_DEF, isActive: false };
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(inactiveDef);
    const result = await service.evaluateAchievement('user-1', 'first-fantasy-team');
    expect(result.awarded).toBe(false);
    expect(result.reason).toBe('manual or inactive');
    expect(prisma.fanAchievement.upsert).not.toHaveBeenCalled();
  });

  it('evaluateAchievement returns awarded:false for MANUAL trigger', async () => {
    const manualDef = { ...MOCK_DEF, triggerType: AchievementTriggerType.MANUAL, isActive: true };
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(manualDef);
    const result = await service.evaluateAchievement('user-1', 'early-supporter');
    expect(result.awarded).toBe(false);
    expect(result.reason).toBe('manual or inactive');
  });

  it('evaluateUserAchievements skips MANUAL trigger types', async () => {
    const manualDef = { ...MOCK_DEF, id: 'def-manual', slug: 'early-supporter', triggerType: AchievementTriggerType.MANUAL, isActive: true, badges: [] };
    // evaluateUserAchievements queries with triggerType not MANUAL, so returns empty
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const result = await service.evaluateUserAchievements('user-1');
    expect(result.evaluated).toBe(0);
    expect(prisma.fanAchievement.upsert).not.toHaveBeenCalled();
    void manualDef; // suppress unused variable
  });

  // ── 18. Missing trigger evaluators ────────────────────────────────────────
  it('checkTrigger FIRST_PREDICTION awards when user has prediction', async () => {
    const predDef = { ...MOCK_DEF, id: 'def-pred', slug: 'first-prediction', triggerType: AchievementTriggerType.FIRST_PREDICTION, threshold: null, fanValuePoints: 5, badges: [] };
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([predDef]);
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(predDef);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.scorePrediction.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ ...MOCK_FA, achievementDefinitionId: 'def-pred' });
    (prisma.fanBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await service.evaluateUserAchievements('user-1');
    expect(result.results[0]!.awarded).toBe(true);
  });

  it('checkTrigger FIRST_LEAGUE_JOIN awards when user has membership', async () => {
    const leagueDef = { ...MOCK_DEF, id: 'def-league', slug: 'joined-first-fantasy-league', triggerType: AchievementTriggerType.FIRST_LEAGUE_JOIN, threshold: null, fanValuePoints: 5, badges: [] };
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([leagueDef]);
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(leagueDef);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fantasyLeagueMember.count as ReturnType<typeof vi.fn>).mockResolvedValue(2);
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ ...MOCK_FA, achievementDefinitionId: 'def-league' });
    (prisma.fanBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await service.evaluateUserAchievements('user-1');
    expect(result.results[0]!.awarded).toBe(true);
  });

  it('checkTrigger FANTASY_SEASON_POINTS awards when cumulative meets threshold', async () => {
    const def = { ...MOCK_DEF, id: 'def-season', slug: 'fantasy-season-100', triggerType: AchievementTriggerType.FANTASY_SEASON_POINTS, threshold: 100, fanValuePoints: 25, badges: [] };
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([def]);
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(def);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fantasyGameweekScore.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({ _sum: { netPoints: 120 } });
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ ...MOCK_FA, achievementDefinitionId: 'def-season' });
    (prisma.fanBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await service.evaluateUserAchievements('user-1');
    expect(result.results[0]!.awarded).toBe(true);
  });

  it('checkTrigger PREDICTION_POINTS awards when cumulative meets threshold', async () => {
    const def = { ...MOCK_DEF, id: 'def-pp', slug: 'prediction-points-25', triggerType: AchievementTriggerType.PREDICTION_POINTS, threshold: 25, fanValuePoints: 10, badges: [] };
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([def]);
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(def);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.predictionPointsLedger.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({ _sum: { points: 30 } });
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ ...MOCK_FA, achievementDefinitionId: 'def-pp' });
    (prisma.fanBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await service.evaluateUserAchievements('user-1');
    expect(result.results[0]!.awarded).toBe(true);
  });

  it('checkTrigger FAN_VALUE_POINTS awards when cumulative meets threshold', async () => {
    const def = { ...MOCK_DEF, id: 'def-fvp', slug: 'fan-value-100', triggerType: AchievementTriggerType.FAN_VALUE_POINTS, threshold: 100, fanValuePoints: 0, badges: [] };
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([def]);
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(def);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fanValueLedger.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({ _sum: { points: 150 } });
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ ...MOCK_FA, achievementDefinitionId: 'def-fvp' });
    (prisma.fanBadge.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await service.evaluateUserAchievements('user-1');
    expect(result.results[0]!.awarded).toBe(true);
  });

  it('checkTrigger PREDICTION_POINTS does NOT award when below threshold', async () => {
    const def = { ...MOCK_DEF, id: 'def-pp2', slug: 'prediction-points-50', triggerType: AchievementTriggerType.PREDICTION_POINTS, threshold: 50, fanValuePoints: 10, badges: [] };
    (prisma.achievementDefinition.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([def]);
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.predictionPointsLedger.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({ _sum: { points: 20 } });
    (prisma.fanAchievement.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ status: AchievementStatus.IN_PROGRESS, progress: 20, target: 50 });

    const result = await service.evaluateUserAchievements('user-1');
    expect(result.results[0]!.awarded).toBe(false);
  });

  // ── 19. Revoked achievement handling ─────────────────────────────────────
  it('revokeAchievement stores admin user id in revokeReason', async () => {
    (prisma.fanAchievement.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_FA);
    (prisma.fanAchievement.update as ReturnType<typeof vi.fn>).mockResolvedValue({ ...MOCK_FA, status: AchievementStatus.REVOKED, revokeReason: '[Admin admin-1] cheating' });

    const result = await service.revokeAchievement('user-1', 'fa-1', 'cheating', 'admin-1');
    expect(result.revokeReason).toContain('[Admin admin-1]');
    expect(result.revokeReason).toContain('cheating');
  });

  // ── 20. evaluateAchievement public method ─────────────────────────────────
  it('evaluateAchievement is the public alias for evaluateSingleAchievement', async () => {
    (prisma.achievementDefinition.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    // Both should throw NotFoundException for missing slug
    await expect(service.evaluateAchievement('user-1', 'missing')).rejects.toThrow(NotFoundException);
    await expect(service.evaluateSingleAchievement('user-1', 'missing')).rejects.toThrow(NotFoundException);
  });
});
