import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RewardReadinessCategory, RewardReadinessStatus } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RewardsReadinessController } from './rewards-readiness.controller';
import { RewardsReadinessService } from './rewards-readiness.service';
import type { PrismaService } from '../prisma/prisma.service';

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

const makeServiceMock = () => ({
  getDefinitions: vi.fn().mockResolvedValue([MOCK_DEF]),
  createDefinition: vi.fn().mockResolvedValue(MOCK_DEF),
  updateDefinition: vi.fn().mockResolvedValue(MOCK_DEF),
  toggleDefinition: vi.fn().mockResolvedValue({ ...MOCK_DEF, isEnabled: false }),
  evaluateFanEligibility: vi.fn().mockResolvedValue([{ definitionId: 'def-1', slug: 'fantasy-starter-reward', name: 'Fantasy Starter Reward', status: RewardReadinessStatus.ELIGIBLE, metRequirements: ['met'], unmetRequirements: [] }]),
  evaluateAllFans: vi.fn().mockResolvedValue({ evaluated: 5, results: [] }),
  getFanReadinessOverview: vi.fn().mockResolvedValue({ userId: 'u1', eligibleCount: 1, ineligibleCount: 0, pendingCount: 0, nonFinancialDisclaimer: 'no cash value', notYetRedeemableNote: 'not redeemable', rows: [] }),
  getFanEligibleRewards: vi.fn().mockResolvedValue({ userId: 'u1', eligibleCount: 1, rewards: [] }),
  getFanLockedRewards: vi.fn().mockResolvedValue({ userId: 'u1', lockedCount: 0, locked: [] }),
  getAdminStats: vi.fn().mockResolvedValue({ totalDefinitions: 6, enabledDefinitions: 5, totalEvaluations: 0, eligibleCount: 0, ineligibleCount: 0, pendingCount: 0, eligibilityRate: 0, byCategory: [], nonFinancialConfirmation: 'non-financial' }),
  getEligibleFansForDefinition: vi.fn().mockResolvedValue({ definitionId: 'def-1', total: 0, fans: [] }),
}) as unknown as RewardsReadinessService;

// ── RolesGuard tests ───────────────────────────────────────────────────────

describe('RolesGuard — rewards admin routes', () => {
  function makeContext(role: string, requiredRoles: string[]) {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(requiredRoles) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const ctx = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role, sub: 'user-1' } }) }),
    } as unknown as ExecutionContext;
    return { guard, ctx };
  }

  it('allows PSL_ADMIN on admin routes', () => {
    const { guard, ctx } = makeContext('PSL_ADMIN', ['PSL_ADMIN']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('blocks FAN from admin routes', () => {
    const { guard, ctx } = makeContext('FAN', ['PSL_ADMIN']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

// ── Controller dispatch ────────────────────────────────────────────────────

describe('RewardsReadinessController', () => {
  let controller: RewardsReadinessController;
  let svc: ReturnType<typeof makeServiceMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = makeServiceMock();
    controller = new RewardsReadinessController(svc);
  });

  it('getFanOverview calls getFanReadinessOverview with userId', async () => {
    await controller.getFanOverview({ sub: 'u1' });
    expect(svc.getFanReadinessOverview).toHaveBeenCalledWith('u1');
  });

  it('getFanEligible calls getFanEligibleRewards', async () => {
    await controller.getFanEligible({ sub: 'u1' });
    expect(svc.getFanEligibleRewards).toHaveBeenCalledWith('u1');
  });

  it('getFanLocked calls getFanLockedRewards', async () => {
    await controller.getFanLocked({ sub: 'u1' });
    expect(svc.getFanLockedRewards).toHaveBeenCalledWith('u1');
  });

  it('evaluateSelf calls evaluateFanEligibility with userId', async () => {
    await controller.evaluateSelf({ sub: 'u1' });
    expect(svc.evaluateFanEligibility).toHaveBeenCalledWith('u1');
  });

  it('getPublicDefinitions calls getDefinitions with isEnabled:true', async () => {
    await controller.getPublicDefinitions();
    expect(svc.getDefinitions).toHaveBeenCalledWith(expect.objectContaining({ isEnabled: true }));
  });

  it('getPublicDefinitions passes category filter', async () => {
    await controller.getPublicDefinitions(RewardReadinessCategory.FANTASY);
    expect(svc.getDefinitions).toHaveBeenCalledWith(
      expect.objectContaining({ category: RewardReadinessCategory.FANTASY }),
    );
  });

  it('getAdminStats calls getAdminStats', async () => {
    await controller.getAdminStats();
    expect(svc.getAdminStats).toHaveBeenCalled();
  });

  it('getAdminDefinitions passes isEnabled and category filters', async () => {
    await controller.getAdminDefinitions('true', RewardReadinessCategory.FAN_VALUE);
    expect(svc.getDefinitions).toHaveBeenCalledWith(
      expect.objectContaining({ isEnabled: true, category: RewardReadinessCategory.FAN_VALUE }),
    );
  });

  it('getAdminDefinitions with isEnabled=false passes false', async () => {
    await controller.getAdminDefinitions('false', undefined);
    expect(svc.getDefinitions).toHaveBeenCalledWith(expect.objectContaining({ isEnabled: false }));
  });

  it('createDefinition delegates to service', async () => {
    const dto = { slug: 'x', name: 'X', description: 'd', category: RewardReadinessCategory.FANTASY };
    await controller.createDefinition(dto);
    expect(svc.createDefinition).toHaveBeenCalledWith(dto);
  });

  it('updateDefinition delegates to service with id and dto', async () => {
    await controller.updateDefinition('def-1', { name: 'Updated' });
    expect(svc.updateDefinition).toHaveBeenCalledWith('def-1', { name: 'Updated' });
  });

  it('toggleDefinition delegates to service', async () => {
    await controller.toggleDefinition('def-1');
    expect(svc.toggleDefinition).toHaveBeenCalledWith('def-1');
  });

  it('getEligibleFans passes definitionId with defaults', async () => {
    await controller.getEligibleFans('def-1');
    expect(svc.getEligibleFansForDefinition).toHaveBeenCalledWith('def-1', 50, 0);
  });

  it('getEligibleFans parses limit and offset query params', async () => {
    await controller.getEligibleFans('def-1', '25', '10');
    expect(svc.getEligibleFansForDefinition).toHaveBeenCalledWith('def-1', 25, 10);
  });

  it('evaluateFan calls evaluateFanEligibility with userId param', async () => {
    await controller.evaluateFan('u2');
    expect(svc.evaluateFanEligibility).toHaveBeenCalledWith('u2');
  });

  it('evaluateAll calls evaluateAllFans', async () => {
    await controller.evaluateAll();
    expect(svc.evaluateAllFans).toHaveBeenCalled();
  });
});
