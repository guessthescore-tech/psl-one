import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { BetaLaunchService, ACTIVATION_DISABLED_NOTICE } from './beta-launch.service';
import { BetaLaunchSmokeTestService } from './beta-launch-smoke-test.service';
import { PrismaService } from '../prisma/prisma.service';
import { SeasonSwitchingService } from '../season-switching/season-switching.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

function makePrisma() {
  return {
    season: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    betaCohort: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
    betaCohortMember: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    seasonActivationApproval: { findFirst: vi.fn(), create: vi.fn(), count: vi.fn() },
    adminAuditLog: { create: vi.fn() },
    fixture: { count: vi.fn() },
    fantasyPlayerPrice: { count: vi.fn() },
    seasonSquadRegistration: { count: vi.fn() },
    gameweek: { count: vi.fn() },
    seasonSwitchAudit: { findFirst: vi.fn() },
    user: { findUnique: vi.fn() },
  };
}

function makeSeasonSwitching() {
  return {
    getSeasonSwitchReadiness: vi.fn(),
    getSeasonSwitchPreview: vi.fn(),
  };
}

const mockSeason = { id: 'season-psl', name: 'PSL Premiership', slug: 'psl', isActive: false, status: 'UPCOMING' };
const mockWorldCupSeason = { id: 'season-wc', name: 'FIFA World Cup 2026', slug: 'fifa-world-cup-2026', isActive: true, status: 'ACTIVE' };

const mockReadiness = {
  seasonId: 'season-psl',
  seasonName: 'PSL Premiership',
  activationStatus: 'READY_WITH_WARNINGS',
  checks: [
    { domain: 'clubs', label: 'Season teams registered', severity: 'BLOCKER', passed: true, detail: '16 teams registered' },
    { domain: 'fixtures', label: 'Fixtures loaded', severity: 'WARNING', passed: true, detail: '240 fixtures loaded' },
    { domain: 'fixtures', label: 'Fixtures published', severity: 'WARNING', passed: false, detail: 'No fixtures are published yet' },
    { domain: 'gameweeks', label: 'Gameweeks created', severity: 'WARNING', passed: true, detail: '30 gameweeks defined' },
    { domain: 'fantasy', label: 'Fantasy rules configured', severity: 'WARNING', passed: true, detail: 'Fantasy rules config present' },
    { domain: 'fantasy', label: 'Player prices set', severity: 'WARNING', passed: true, detail: '96 player prices set' },
    { domain: 'clubs', label: 'Club profiles complete', severity: 'INFO', passed: true, detail: 'All 16 clubs have profiles' },
    { domain: 'predictions', label: 'Prediction rules configured', severity: 'WARNING', passed: true, detail: 'Prediction rules configured (PROVISIONAL)' },
    { domain: 'matchday', label: 'Matchday operations ready', severity: 'WARNING', passed: false, detail: 'Gameweeks exist but no published fixtures' },
    { domain: 'engagement', label: 'Engagement season scope clean', severity: 'WARNING', passed: true, detail: 'No fan value entries yet' },
    { domain: 'player_stats', label: 'Player stats pipeline ready', severity: 'INFO', passed: true, detail: 'No completed fixtures' },
    { domain: 'squad_import', label: 'Squad import ready', severity: 'WARNING', passed: true, detail: '96 confirmed squad registrations' },
    { domain: 'fantasy_price_calibration', label: 'Fantasy price calibration ready', severity: 'WARNING', passed: true, detail: '96 prices set, all within bounds' },
  ],
  blockers: [],
  warnings: [{ domain: 'fixtures', label: 'Fixtures published', severity: 'WARNING', passed: false, detail: 'No fixtures are published yet' }],
};

describe('BetaLaunchService', () => {
  let service: BetaLaunchService;
  let prisma: ReturnType<typeof makePrisma>;
  let seasonSwitching: ReturnType<typeof makeSeasonSwitching>;

  beforeEach(async () => {
    prisma = makePrisma();
    seasonSwitching = makeSeasonSwitching();

    const module = await Test.createTestingModule({
      providers: [
        BetaLaunchService,
        { provide: PrismaService, useValue: prisma },
        { provide: SeasonSwitchingService, useValue: seasonSwitching },
      ],
    }).compile();

    service = module.get(BetaLaunchService);
  });

  // ── Readiness aggregate ───────────────────────────────────────────────────

  describe('getReadiness', () => {
    it('includes all 13 checks', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.getReadiness('season-psl');
      expect(result.checks).toHaveLength(13);
    });

    it('computes correct blocker and warning counts', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.getReadiness('season-psl');
      expect(result.blockerCount).toBe(0);
      expect(result.warningCount).toBe(2);
    });

    it('returns READY_WITH_WARNINGS when warnings exist', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.getReadiness('season-psl');
      expect(result.overallStatus).toBe('READY_WITH_WARNINGS');
    });

    it('returns BLOCKED when blockers exist', async () => {
      const blocked = { ...mockReadiness, activationStatus: 'BLOCKED', blockers: [{ domain: 'clubs', label: 'Season teams registered', severity: 'BLOCKER', passed: false, detail: 'Only 0 teams' }], checks: [{ domain: 'clubs', label: 'Season teams registered', severity: 'BLOCKER', passed: false, detail: 'Only 0 teams' }, ...mockReadiness.checks.slice(1)] };
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(blocked);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.getReadiness('season-psl');
      expect(result.overallStatus).toBe('BLOCKED');
      expect(result.blockerCount).toBe(1);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getReadiness('bad-season')).rejects.toThrow(NotFoundException);
    });

    it('includes activation disabled notice', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.getReadiness('season-psl');
      expect(result.activationDisabledNotice).toBe(ACTIVATION_DISABLED_NOTICE);
    });

    it('does not mutate season status', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});

      await service.getReadiness('season-psl');
      expect(prisma.season.update).not.toHaveBeenCalled();
    });

    it('shows World Cup as current active season', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.getReadiness('season-psl');
      expect(result.currentActiveSeason?.name).toBe('FIFA World Cup 2026');
      expect(result.targetSeason.isActive).toBe(false);
    });
  });

  // ── Dry run non-mutation ─────────────────────────────────────────────────

  describe('executeDryRun', () => {
    it('returns dryRunOnly: true and activationWillNotBePerformed: true', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});
      prisma.fixture.count.mockResolvedValue(10);
      prisma.fantasyPlayerPrice.count.mockResolvedValue(96);
      prisma.seasonSquadRegistration.count.mockResolvedValue(96);
      prisma.gameweek.count.mockResolvedValue(30);
      prisma.betaCohort.count.mockResolvedValue(1);

      const result = await service.executeDryRun('season-psl', 'user-1');
      expect(result.dryRunOnly).toBe(true);
      expect(result.activationWillNotBePerformed).toBe(true);
    });

    it('does not change season active state', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});
      prisma.fixture.count.mockResolvedValue(0);
      prisma.fantasyPlayerPrice.count.mockResolvedValue(0);
      prisma.seasonSquadRegistration.count.mockResolvedValue(0);
      prisma.gameweek.count.mockResolvedValue(0);
      prisma.betaCohort.count.mockResolvedValue(0);

      await service.executeDryRun('season-psl', null);
      expect(prisma.season.update).not.toHaveBeenCalled();
    });
  });

  // ── Rollback dry run ──────────────────────────────────────────────────────

  describe('executeRollbackDryRun', () => {
    it('returns dryRunOnly and rollbackWillNotBePerformed', async () => {
      prisma.season.findUnique.mockResolvedValue({ ...mockSeason, isActive: false });
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.seasonSwitchAudit.findFirst.mockResolvedValue(null);
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.executeRollbackDryRun('season-psl', null);
      expect(result.dryRunOnly).toBe(true);
      expect(result.rollbackWillNotBePerformed).toBe(true);
    });

    it('preserves World Cup data flag', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.seasonSwitchAudit.findFirst.mockResolvedValue(null);
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.executeRollbackDryRun('season-psl', null);
      expect(result.preservedWorldCupData.fixtures).toBe(true);
      expect(result.fantasyHistoryPreserved).toBe(true);
    });
  });

  // ── Approval workflow ─────────────────────────────────────────────────────

  describe('createApproval', () => {
    const approvalDto = {
      rollbackVerified: true,
      betaCohortVerified: true,
      frontendVerified: true,
      dataVerified: true,
      securityVerified: true,
      operationsVerified: true,
    };

    it('creates approval when no blockers', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});
      prisma.seasonActivationApproval.create.mockResolvedValue({ id: 'approval-1', approvalStatus: 'APPROVED', seasonId: 'season-psl' });

      const result = await service.createApproval('season-psl', 'admin-1', approvalDto);
      expect(prisma.seasonActivationApproval.create).toHaveBeenCalledOnce();
      expect(result.activationDisabledNotice).toBe(ACTIVATION_DISABLED_NOTICE);
    });

    it('blocks approval when blockers exist', async () => {
      const blocked = { ...mockReadiness, activationStatus: 'BLOCKED', blockers: [{ domain: 'clubs', label: 'Teams', severity: 'BLOCKER', passed: false, detail: 'No teams' }], checks: [{ domain: 'clubs', label: 'Season teams registered', severity: 'BLOCKER', passed: false, detail: 'Only 0 teams' }, ...mockReadiness.checks.slice(1)] };
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(blocked);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});

      await expect(service.createApproval('season-psl', 'admin-1', approvalDto)).rejects.toThrow(BadRequestException);
    });

    it('blocks approval when not all flags true', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});

      const dto = { ...approvalDto, rollbackVerified: false };
      await expect(service.createApproval('season-psl', 'admin-1', dto)).rejects.toThrow(BadRequestException);
    });

    it('does not set approvalStatus to ACTIVATED', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});
      prisma.seasonActivationApproval.create.mockResolvedValue({ id: 'a1', approvalStatus: 'APPROVED', seasonId: 'season-psl' });

      await service.createApproval('season-psl', 'admin-1', approvalDto);
      const createCall = prisma.seasonActivationApproval.create.mock.calls[0]![0]!;
      expect(createCall.data.approvalStatus).toBe('APPROVED');
      expect(createCall.data.approvalStatus).not.toBe('ACTIVATED');
      expect(createCall.data.activationPerformedAt).toBeUndefined();
    });
  });

  // ── Cohort lifecycle ──────────────────────────────────────────────────────

  describe('cohort lifecycle', () => {
    const mockCohort = { id: 'cohort-1', name: 'Beta Cohort 1', slug: 'beta-1', seasonId: 'season-psl', status: 'DRAFT', maxUsers: 100, startsAt: null, _count: { members: 0 } };

    it('creates a cohort', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      prisma.betaCohort.findUnique.mockResolvedValue(null);
      prisma.betaCohort.create.mockResolvedValue({ ...mockCohort });
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.createCohort({ name: 'Beta Cohort 1', slug: 'beta-1', seasonId: 'season-psl' }, 'admin-1');
      expect(prisma.betaCohort.create).toHaveBeenCalledOnce();
      expect(result.slug).toBe('beta-1');
    });

    it('rejects duplicate slug', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      prisma.betaCohort.findUnique.mockResolvedValue(mockCohort);

      await expect(service.createCohort({ name: 'Dup', slug: 'beta-1', seasonId: 'season-psl' }, 'admin-1')).rejects.toThrow(ConflictException);
    });

    it('rejects unknown user when adding member', async () => {
      prisma.betaCohort.findUnique.mockResolvedValue({ ...mockCohort, maxUsers: null, _count: { members: 0 } });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.addMember('cohort-1', { userId: 'bad-user' }, 'admin-1')).rejects.toThrow(NotFoundException);
    });

    it('enforces max user limit', async () => {
      prisma.betaCohort.findUnique.mockResolvedValue({ ...mockCohort, maxUsers: 2, _count: { members: 2 } });
      prisma.user.findUnique.mockResolvedValue({ id: 'user-3', role: 'FAN' });

      await expect(service.addMember('cohort-1', { userId: 'user-3' }, 'admin-1')).rejects.toThrow(BadRequestException);
    });

    it('rejects duplicate active membership', async () => {
      prisma.betaCohort.findUnique.mockResolvedValue({ ...mockCohort, maxUsers: null, _count: { members: 1 } });
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'FAN' });
      prisma.betaCohortMember.findUnique.mockResolvedValue({ id: 'mem-1', status: 'ACTIVE' });

      await expect(service.addMember('cohort-1', { userId: 'user-1' }, 'admin-1')).rejects.toThrow(ConflictException);
    });

    it('allows re-adding a removed member', async () => {
      prisma.betaCohort.findUnique.mockResolvedValue({ ...mockCohort, maxUsers: null, _count: { members: 0 } });
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'FAN' });
      prisma.betaCohortMember.findUnique.mockResolvedValue({ id: 'mem-1', status: 'REMOVED' });
      prisma.betaCohortMember.update.mockResolvedValue({ id: 'mem-1', status: 'INVITED' });
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.addMember('cohort-1', { userId: 'user-1' }, 'admin-1');
      expect(result.status).toBe('INVITED');
    });

    it('retains removed member historically', async () => {
      prisma.betaCohort.findUnique.mockResolvedValue(mockCohort);
      prisma.betaCohortMember.findUnique.mockResolvedValue({ id: 'mem-1', cohortId: 'cohort-1', userId: 'user-1', status: 'ACTIVE' });
      prisma.betaCohortMember.update.mockResolvedValue({ id: 'mem-1', status: 'REMOVED', removedAt: new Date() });
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.removeMember('cohort-1', 'user-1', 'admin-1');
      expect(result.status).toBe('REMOVED');
      expect(prisma.betaCohortMember.delete).not.toHaveBeenCalled();
    });

    it('starts cohort and writes audit log', async () => {
      prisma.betaCohort.findUnique.mockResolvedValue(mockCohort);
      prisma.betaCohort.update.mockResolvedValue({ ...mockCohort, status: 'ACTIVE' });
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.startCohort('cohort-1', 'admin-1');
      expect(result.status).toBe('ACTIVE');
      expect(prisma.adminAuditLog.create).toHaveBeenCalledOnce();
    });

    it('starting a cohort does not activate the season', async () => {
      prisma.betaCohort.findUnique.mockResolvedValue(mockCohort);
      prisma.betaCohort.update.mockResolvedValue({ ...mockCohort, status: 'ACTIVE' });
      prisma.adminAuditLog.create.mockResolvedValue({});

      await service.startCohort('cohort-1', 'admin-1');
      expect(prisma.season.update).not.toHaveBeenCalled();
    });

    it('blocks invalid lifecycle transition', async () => {
      prisma.betaCohort.findUnique.mockResolvedValue({ ...mockCohort, status: 'COMPLETED' });

      await expect(service.startCohort('cohort-1', 'admin-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ── Security ──────────────────────────────────────────────────────────────

  describe('security', () => {
    it('PSL seasons remain inactive in all read-only operations', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
      seasonSwitching.getSeasonSwitchReadiness.mockResolvedValue(mockReadiness);
      prisma.season.findFirst.mockResolvedValue(mockWorldCupSeason);
      prisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.getReadiness('season-psl');
      expect(result.targetSeason.isActive).toBe(false);
      expect(result.currentActiveSeason?.name).toContain('World Cup');
    });
  });
});

// ── Smoke Test Service ─────────────────────────────────────────────────────────

describe('BetaLaunchSmokeTestService', () => {
  let smokeService: BetaLaunchSmokeTestService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    const module = await Test.createTestingModule({
      providers: [
        BetaLaunchSmokeTestService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    smokeService = module.get(BetaLaunchSmokeTestService);
  });

  it('contains all required areas', () => {
    const summary = smokeService.getSummary();
    const areas = summary.areas;
    expect(areas).toContain('authentication');
    expect(areas).toContain('fan home');
    expect(areas).toContain('clubs');
    expect(areas).toContain('Match Centre');
    expect(areas).toContain('Fantasy');
    expect(areas).toContain('Guess the Score');
    expect(areas).toContain('social predictions');
    expect(areas).toContain('leaderboards');
    expect(areas).toContain('Fan Value');
    expect(areas).toContain('wallet sandbox');
  });

  it('activation route is absent from registry', () => {
    const summary = smokeService.getSummary();
    expect(summary.activationRouteAbsent).toBe(true);
    const hasActivate = summary.registry.some(r => r.route.includes('/activate'));
    expect(hasActivate).toBe(false);
  });

  it('no destructive routes in registry', () => {
    const summary = smokeService.getSummary();
    expect(summary.destructiveRoutesAbsent).toBe(true);
    const hasDestructive = summary.registry.some(r => r.destructive);
    expect(hasDestructive).toBe(false);
  });

  it('all registry items start as NOT_RUN', () => {
    const registry = smokeService.getRegistry();
    expect(registry.every(r => r.status === 'NOT_RUN')).toBe(true);
  });

  it('run writes audit log', async () => {
    prisma.adminAuditLog.create.mockResolvedValue({});
    await smokeService.runRegistry('admin-1');
    expect(prisma.adminAuditLog.create).toHaveBeenCalledOnce();
  });
});
