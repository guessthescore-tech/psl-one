import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { FanValueLedgerService } from '../fan-value/fan-value-ledger.service';

const makeAchievementsServiceMock = () => ({
  getFanAchievements: vi.fn().mockResolvedValue({ achievements: [] }),
  getFanAchievementSummary: vi.fn().mockResolvedValue({ unlockedCount: 0, totalCount: 0, badgeCount: 0, achievementPoints: 0, recentUnlocks: [], featuredBadges: [] }),
  getFanAchievementProgress: vi.fn().mockResolvedValue({ inProgress: [] }),
  getFanBadges: vi.fn().mockResolvedValue({ badges: [] }),
  getDefinitions: vi.fn().mockResolvedValue([]),
  getBadgeDefinitions: vi.fn().mockResolvedValue([]),
  evaluateUserAchievements: vi.fn().mockResolvedValue({ userId: 'u1', evaluated: 0, results: [] }),
  getAdminAchievementStats: vi.fn().mockResolvedValue({ totalDefinitions: 0, totalFanAchievements: 0, totalUnlocked: 0, totalBadges: 0, unlockRate: 0, byStatus: [], recentUnlocks: [] }),
  createAchievementDefinition: vi.fn().mockResolvedValue({}),
  updateAchievementDefinition: vi.fn().mockResolvedValue({}),
  createBadgeDefinition: vi.fn().mockResolvedValue({}),
  updateBadgeDefinition: vi.fn().mockResolvedValue({}),
  linkBadgeToAchievement: vi.fn().mockResolvedValue({}),
  awardAchievement: vi.fn().mockResolvedValue({}),
  revokeAchievement: vi.fn().mockResolvedValue({}),
  revokeBadge: vi.fn().mockResolvedValue({}),
}) as unknown as AchievementsService;

// ── RolesGuard tests ───────────────────────────────────────────────────────

describe('RolesGuard — achievements admin routes', () => {
  function makeContext(role: string, requiredRoles: string[]) {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(requiredRoles),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const ctx = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role, sub: 'user-1' } }),
      }),
    } as unknown as ExecutionContext;
    return { guard, ctx };
  }

  it('allows PSL_ADMIN to access admin routes', () => {
    const { guard, ctx } = makeContext('PSL_ADMIN', ['PSL_ADMIN']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('blocks FAN from admin routes', () => {
    const { guard, ctx } = makeContext('FAN', ['PSL_ADMIN']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('allows any authenticated user on routes with no role requirement', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(null) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const ctx = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'FAN', sub: 'u1' } }) }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(ctx)).toBe(true);
  });
});

// ── Controller method dispatch ─────────────────────────────────────────────

describe('AchievementsController', () => {
  let controller: AchievementsController;
  let svc: ReturnType<typeof makeAchievementsServiceMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = makeAchievementsServiceMock();
    controller = new AchievementsController(svc);
  });

  const FAN_USER = { sub: 'fan-1', role: 'FAN' };
  const ADMIN_USER = { sub: 'admin-1', role: 'PSL_ADMIN' };

  it('getFanAchievements delegates to service.getFanAchievements with fan userId', async () => {
    await controller.getFanAchievements(FAN_USER);
    expect(svc.getFanAchievements).toHaveBeenCalledWith('fan-1');
  });

  it('getFanAchievementSummary delegates to service', async () => {
    await controller.getFanAchievementSummary(FAN_USER);
    expect(svc.getFanAchievementSummary).toHaveBeenCalledWith('fan-1');
  });

  it('getFanAchievementProgress delegates to service', async () => {
    await controller.getFanAchievementProgress(FAN_USER);
    expect(svc.getFanAchievementProgress).toHaveBeenCalledWith('fan-1');
  });

  it('getFanBadges delegates to service', async () => {
    await controller.getFanBadges(FAN_USER);
    expect(svc.getFanBadges).toHaveBeenCalledWith('fan-1');
  });

  it('evaluateSelf delegates to service.evaluateUserAchievements', async () => {
    await controller.evaluateSelf(FAN_USER);
    expect(svc.evaluateUserAchievements).toHaveBeenCalledWith('fan-1');
  });

  it('adminAwardAchievement passes adminUserId from JWT', async () => {
    await controller.adminAwardAchievement('target-user', { slug: 'first-fantasy-team' }, ADMIN_USER);
    expect(svc.awardAchievement).toHaveBeenCalledWith('target-user', 'first-fantasy-team', undefined, 'admin-1');
  });

  it('revokeAchievement passes adminUserId from JWT', async () => {
    await controller.revokeAchievement('target-user', 'fa-1', { reason: 'cheating' }, ADMIN_USER);
    expect(svc.revokeAchievement).toHaveBeenCalledWith('target-user', 'fa-1', 'cheating', 'admin-1');
  });

  it('revokeBadge passes adminUserId from JWT', async () => {
    await controller.revokeBadge('target-user', 'fb-1', { reason: 'abuse' }, ADMIN_USER);
    expect(svc.revokeBadge).toHaveBeenCalledWith('target-user', 'fb-1', 'abuse', 'admin-1');
  });

  it('createAchievementDefinition delegates to service', async () => {
    const dto = { slug: 'test', name: 'Test', description: 'test', category: 'FANTASY' as const, triggerType: 'MANUAL' as const };
    await controller.createAchievementDefinition(dto);
    expect(svc.createAchievementDefinition).toHaveBeenCalledWith(dto);
  });

  it('updateAchievementDefinition delegates to service', async () => {
    await controller.updateAchievementDefinition('def-1', { name: 'Updated' });
    expect(svc.updateAchievementDefinition).toHaveBeenCalledWith('def-1', { name: 'Updated' });
  });

  it('getAdminStats delegates to service', async () => {
    await controller.getAdminStats();
    expect(svc.getAdminAchievementStats).toHaveBeenCalled();
  });

  it('evaluateUserAchievements delegates to service with target userId', async () => {
    await controller.evaluateUserAchievements('target-user');
    expect(svc.evaluateUserAchievements).toHaveBeenCalledWith('target-user');
  });

  it('linkBadgeToAchievement delegates to service', async () => {
    await controller.linkBadgeToAchievement({ achievementDefinitionId: 'def-1', badgeDefinitionId: 'badge-1' });
    expect(svc.linkBadgeToAchievement).toHaveBeenCalledWith('def-1', 'badge-1');
  });
});
