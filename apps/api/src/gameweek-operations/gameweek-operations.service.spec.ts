import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GameweekOperationsService } from './gameweek-operations.service';
import { PrismaService } from '../prisma/prisma.service';
import { FixtureImportService } from '../fixture-import/fixture-import.service';
import { FantasyCalibrationService } from '../fantasy-calibration/fantasy-calibration.service';
import { PredictionCalibrationService } from '../prediction-calibration/prediction-calibration.service';
import { NotFoundException } from '@nestjs/common';

const SEASON_ID = 'season-psl';
const SEASON_NAME = 'PSL 2026/27';
const FUTURE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const PAST = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const mockSeason = () => ({
  id: SEASON_ID,
  name: SEASON_NAME,
  slug: 'psl-premiership-2026',
  status: 'UPCOMING',
  isActive: false,
  startDate: new Date('2026-08-01'),
  endDate: new Date('2027-05-31'),
});

const mockGameweek = (overrides: object = {}) => ({
  id: 'gw-1',
  name: 'Matchday 1',
  round: 1,
  status: 'UPCOMING',
  transferDeadlineAt: FUTURE,
  predictionDeadlineAt: FUTURE,
  fixtures: [],
  ...overrides,
});

const mockFixtureImportService = {
  getGameweekReadiness: vi.fn(),
  autoCreateGameweeks: vi.fn(),
  getSeasonFixtureValidation: vi.fn(),
  getSeasonFixtureConflicts: vi.fn(),
  getPublishingReadiness: vi.fn(),
};

const mockFantasyCalibrationService = {
  getCalibrationReadiness: vi.fn(),
  getGameweekReadiness: vi.fn(),
  deriveGameweekDeadlines: vi.fn(),
  getActivationImpact: vi.fn(),
};

const mockPredictionCalibrationService = {
  getCalibrationReadiness: vi.fn(),
  getLockReadiness: vi.fn(),
  getFixtureEligibility: vi.fn(),
};

const defaultGwReadiness = {
  seasonId: SEASON_ID,
  totalFixtures: 30,
  fixturesWithGameweek: 30,
  fixturesWithoutGameweek: 0,
  gameweeksCreated: 30,
  deadlineWarnings: [],
  lockTimingWarnings: [],
};

const defaultValidation = {
  seasonId: SEASON_ID,
  seasonName: SEASON_NAME,
  totalFixtures: 30,
  publishedFixtures: 30,
  unpublishedFixtures: 0,
  fixturesWithGameweek: 30,
  fixturesWithoutGameweek: 0,
  fixturesWithVenue: 30,
  fixturesWithoutVenue: 0,
  issues: [],
};

const defaultConflicts = { seasonId: SEASON_ID, conflicts: [], totalConflicts: 0 };

const defaultPubReadiness = {
  seasonId: SEASON_ID,
  totalFixtures: 30,
  publishedFixtures: 30,
  unpublishedFixtures: 0,
  batchesCommitted: 1,
  blockingErrors: [],
  warnings: [],
  canPublish: false,
};

const defaultFantasyReadiness = {
  status: 'READY',
  blockers: [],
  warnings: [],
  info: [],
  seasonId: SEASON_ID,
  seasonName: SEASON_NAME,
};

const defaultFantasyGwReadiness = {
  seasonId: SEASON_ID,
  gameweeks: [{ gameweekId: 'gw-1', round: 1, name: 'Matchday 1', hasTransferDeadline: true, hasPredictionDeadline: true, fixtureCount: 3, earliestKickoff: FUTURE }],
  totalGameweeks: 30,
  gameweeksWithDeadlines: 30,
  gameweeksWithFixtures: 30,
};

const defaultActivationImpact = {
  seasonId: SEASON_ID,
  seasonName: SEASON_NAME,
  fantasyTeamsAffected: 0,
  predictionCountAffected: 0,
  rulesConfigured: true,
  playerPricesSet: 96,
  gameweeksConfigured: 30,
  warnings: [],
};

const defaultPredictionReadiness = {
  activationStatus: 'READY',
  checks: [],
  blockers: [],
  warnings: [],
};

const defaultLockReadiness = {
  seasonId: SEASON_ID,
  seasonName: SEASON_NAME,
  totalPublished: 10,
  totalLocked: 0,
  totalOpen: 10,
  fixtures: [],
};

const defaultEligibility = {
  seasonId: SEASON_ID,
  seasonName: SEASON_NAME,
  fixtures: [
    { id: 'f1', isEligible: true },
    { id: 'f2', isEligible: true },
    { id: 'f3', isEligible: false },
  ],
};

describe('GameweekOperationsService', () => {
  let service: GameweekOperationsService;
  let prisma: {
    season: { findUnique: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
    gameweek: { findMany: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
    fixture: { count: ReturnType<typeof vi.fn> };
    fantasyRulesConfig: { findUnique: ReturnType<typeof vi.fn> };
    predictionRulesConfig: { findUnique: ReturnType<typeof vi.fn> };
  };

  beforeEach(async () => {
    prisma = {
      season: {
        findUnique: vi.fn().mockResolvedValue(mockSeason()),
        findMany: vi.fn().mockResolvedValue([mockSeason()]),
      },
      gameweek: {
        findMany: vi.fn().mockResolvedValue([mockGameweek()]),
        findFirst: vi.fn().mockResolvedValue(mockGameweek()),
        update: vi.fn().mockResolvedValue(mockGameweek()),
        count: vi.fn().mockResolvedValue(30),
      },
      fixture: {
        count: vi.fn().mockImplementation(({ where } = {}) => {
          if (where?.gameweekId === null) return Promise.resolve(0);
          return Promise.resolve(30);
        }),
      },
      fantasyRulesConfig: { findUnique: vi.fn().mockResolvedValue({ id: 'cfg-1' }) },
      predictionRulesConfig: { findUnique: vi.fn().mockResolvedValue({ id: 'pred-cfg-1', status: 'PROVISIONAL' }) },
    };

    mockFixtureImportService.getGameweekReadiness.mockResolvedValue(defaultGwReadiness);
    mockFixtureImportService.autoCreateGameweeks.mockResolvedValue({ seasonId: SEASON_ID, roundsProcessed: 30, gameweeksCreated: 30, fixturesAssigned: 240 });
    mockFixtureImportService.getSeasonFixtureValidation.mockResolvedValue(defaultValidation);
    mockFixtureImportService.getSeasonFixtureConflicts.mockResolvedValue(defaultConflicts);
    mockFixtureImportService.getPublishingReadiness.mockResolvedValue(defaultPubReadiness);
    mockFantasyCalibrationService.getCalibrationReadiness.mockResolvedValue(defaultFantasyReadiness);
    mockFantasyCalibrationService.getGameweekReadiness.mockResolvedValue(defaultFantasyGwReadiness);
    mockFantasyCalibrationService.deriveGameweekDeadlines.mockResolvedValue({ updated: 30, skipped: 0 });
    mockFantasyCalibrationService.getActivationImpact.mockResolvedValue(defaultActivationImpact);
    mockPredictionCalibrationService.getCalibrationReadiness.mockResolvedValue(defaultPredictionReadiness);
    mockPredictionCalibrationService.getLockReadiness.mockResolvedValue(defaultLockReadiness);
    mockPredictionCalibrationService.getFixtureEligibility.mockResolvedValue(defaultEligibility);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameweekOperationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: FixtureImportService, useValue: mockFixtureImportService },
        { provide: FantasyCalibrationService, useValue: mockFantasyCalibrationService },
        { provide: PredictionCalibrationService, useValue: mockPredictionCalibrationService },
      ],
    }).compile();

    service = module.get<GameweekOperationsService>(GameweekOperationsService);
  });

  // ── getOperationalSeasons ────────────────────────────────────────────────

  describe('getOperationalSeasons', () => {
    it('returns list of seasons with metadata', async () => {
      prisma.season.findMany.mockResolvedValue([
        { ...mockSeason(), _count: { gameweeks: 30, fixtures: 240 } },
      ]);
      const result = await service.getOperationalSeasons();
      expect(result).toHaveLength(1);
      expect(result[0]?.seasonId).toBe(SEASON_ID);
      expect(result[0]?.gameweekCount).toBe(30);
      expect(result[0]?.fixtureCount).toBe(240);
    });
  });

  // ── getSeasonOperationsOverview ──────────────────────────────────────────

  describe('getSeasonOperationsOverview', () => {
    it('returns READY when all configured', async () => {
      const result = await service.getSeasonOperationsOverview(SEASON_ID);
      expect(result.overallStatus).toBe('READY');
      expect(result.blockers).toHaveLength(0);
    });

    it('returns BLOCKED when no fixtures', async () => {
      prisma.fixture.count.mockResolvedValue(0);
      const result = await service.getSeasonOperationsOverview(SEASON_ID);
      expect(result.overallStatus).toBe('BLOCKED');
    });

    it('returns READY_WITH_WARNINGS when no gameweeks', async () => {
      prisma.gameweek.count.mockResolvedValue(0);
      const result = await service.getSeasonOperationsOverview(SEASON_ID);
      expect(result.overallStatus).toBe('READY_WITH_WARNINGS');
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getSeasonOperationsOverview('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getGameweekOperations ────────────────────────────────────────────────

  describe('getGameweekOperations', () => {
    it('returns DRAFT status for gameweek with no fixtures', async () => {
      prisma.gameweek.findMany.mockResolvedValue([mockGameweek({ fixtures: [] })]);
      const result = await service.getGameweekOperations(SEASON_ID);
      expect(result).toHaveLength(1);
      expect(result[0]?.operationalStatus).toBe('DRAFT');
      expect(result[0]?.blockers).toContain('No fixtures assigned');
    });

    it('returns READY_TO_PUBLISH when all fixtures published', async () => {
      const fixtureWithKickoff = { id: 'f1', kickoffAt: FUTURE, isPublished: true, status: 'SCHEDULED' };
      prisma.gameweek.findMany.mockResolvedValue([
        mockGameweek({
          fixtures: [fixtureWithKickoff, { ...fixtureWithKickoff, id: 'f2' }],
          transferDeadlineAt: new Date(FUTURE.getTime() - 2 * 60 * 60 * 1000),
          predictionDeadlineAt: new Date(FUTURE.getTime() - 2 * 60 * 60 * 1000),
        }),
      ]);
      const result = await service.getGameweekOperations(SEASON_ID);
      expect(result[0]?.operationalStatus).toBe('READY_TO_PUBLISH');
    });

    it('returns HISTORICAL for COMPLETED gameweek', async () => {
      prisma.gameweek.findMany.mockResolvedValue([mockGameweek({ status: 'COMPLETED' })]);
      const result = await service.getGameweekOperations(SEASON_ID);
      expect(result[0]?.operationalStatus).toBe('HISTORICAL');
    });

    it('returns IN_PROGRESS for LIVE gameweek', async () => {
      prisma.gameweek.findMany.mockResolvedValue([mockGameweek({ status: 'LIVE' })]);
      const result = await service.getGameweekOperations(SEASON_ID);
      expect(result[0]?.operationalStatus).toBe('IN_PROGRESS');
    });

    it('warns on unpublished fixtures', async () => {
      const fixture = { id: 'f1', kickoffAt: FUTURE, isPublished: false, status: 'SCHEDULED' };
      prisma.gameweek.findMany.mockResolvedValue([
        mockGameweek({ fixtures: [fixture] }),
      ]);
      const result = await service.getGameweekOperations(SEASON_ID);
      expect(result[0]?.warnings).toContain('1 fixture(s) unpublished');
    });
  });

  // ── getSeasonGameweekReadiness ───────────────────────────────────────────

  describe('getSeasonGameweekReadiness', () => {
    it('returns BLOCKED when no gameweeks created', async () => {
      mockFixtureImportService.getGameweekReadiness.mockResolvedValue({
        ...defaultGwReadiness,
        gameweeksCreated: 0,
      });
      const result = await service.getSeasonGameweekReadiness(SEASON_ID);
      expect(result.readinessStatus).toBe('BLOCKED');
      expect(result.blockers.length).toBeGreaterThan(0);
    });

    it('returns READY_WITH_WARNINGS when fixtures unassigned', async () => {
      mockFixtureImportService.getGameweekReadiness.mockResolvedValue({
        ...defaultGwReadiness,
        fixturesWithoutGameweek: 5,
      });
      const result = await service.getSeasonGameweekReadiness(SEASON_ID);
      expect(result.readinessStatus).toBe('READY_WITH_WARNINGS');
    });

    it('returns READY when all checks pass', async () => {
      const result = await service.getSeasonGameweekReadiness(SEASON_ID);
      expect(result.readinessStatus).toBe('READY');
    });

    it('reports deadline warnings', async () => {
      mockFixtureImportService.getGameweekReadiness.mockResolvedValue({
        ...defaultGwReadiness,
        deadlineWarnings: ['Fixture f1: prediction deadline is after kickoff'],
      });
      const result = await service.getSeasonGameweekReadiness(SEASON_ID);
      expect(result.deadlineWarnings).toHaveLength(1);
    });
  });

  // ── getDeadlineReadiness ─────────────────────────────────────────────────

  describe('getDeadlineReadiness', () => {
    it('marks deadline invalid when transferDeadlineAt is after kickoff', async () => {
      const afterKickoff = new Date(FUTURE.getTime() + 60 * 60 * 1000);
      prisma.gameweek.findMany.mockResolvedValue([{
        id: 'gw-1', name: 'Matchday 1', round: 1, status: 'UPCOMING',
        transferDeadlineAt: afterKickoff,
        predictionDeadlineAt: afterKickoff,
        fixtures: [{ kickoffAt: FUTURE }],
      }]);
      const result = await service.getDeadlineReadiness(SEASON_ID);
      expect(result.gameweeks[0]?.issues).toContain('Transfer deadline is after earliest kickoff');
      expect(result.gameweeksWithInvalidDeadlines).toBe(1);
    });

    it('marks deadline valid when transferDeadlineAt is before kickoff', async () => {
      const beforeKickoff = new Date(FUTURE.getTime() - 90 * 60 * 1000);
      prisma.gameweek.findMany.mockResolvedValue([{
        id: 'gw-1', name: 'Matchday 1', round: 1, status: 'UPCOMING',
        transferDeadlineAt: beforeKickoff,
        predictionDeadlineAt: beforeKickoff,
        fixtures: [{ kickoffAt: FUTURE }],
      }]);
      const result = await service.getDeadlineReadiness(SEASON_ID);
      expect(result.gameweeks[0]?.issues).toHaveLength(0);
      expect(result.gameweeksWithValidDeadlines).toBe(1);
    });
  });

  // ── getFixtureAssignmentReadiness ────────────────────────────────────────

  describe('getFixtureAssignmentReadiness', () => {
    it('delegates to fixture import service', async () => {
      await service.getFixtureAssignmentReadiness(SEASON_ID);
      expect(mockFixtureImportService.getSeasonFixtureValidation).toHaveBeenCalledWith(SEASON_ID);
      expect(mockFixtureImportService.getSeasonFixtureConflicts).toHaveBeenCalledWith(SEASON_ID);
      expect(mockFixtureImportService.getGameweekReadiness).toHaveBeenCalledWith(SEASON_ID);
    });

    it('reports conflicts', async () => {
      mockFixtureImportService.getSeasonFixtureConflicts.mockResolvedValue({
        ...defaultConflicts,
        conflicts: [{ type: 'DUPLICATE_FIXTURE', severity: 'ERROR', description: 'Dup', fixtureIds: ['f1', 'f2'] }],
        totalConflicts: 1,
      });
      const result = await service.getFixtureAssignmentReadiness(SEASON_ID);
      expect(result.totalConflicts).toBe(1);
      expect(result.canProceed).toBe(false);
    });
  });

  // ── getFantasyImpact ─────────────────────────────────────────────────────

  describe('getFantasyImpact', () => {
    it('returns READY status when fantasy configured', async () => {
      const result = await service.getFantasyImpact(SEASON_ID);
      expect(result.readinessStatus).toBe('READY');
      expect(result.rulesConfigured).toBe(true);
    });

    it('includes World Cup preservation note', async () => {
      const result = await service.getFantasyImpact(SEASON_ID);
      expect(result.worldCupNote).toContain('World Cup');
    });

    it('reflects BLOCKED when fantasy calibration blocked', async () => {
      mockFantasyCalibrationService.getCalibrationReadiness.mockResolvedValue({
        ...defaultFantasyReadiness,
        status: 'BLOCKED',
        blockers: [{ label: 'No gameweeks', domain: 'gameweeks', severity: 'BLOCKER', passed: false, detail: 'No gameweeks' }],
        warnings: [],
      });
      const result = await service.getFantasyImpact(SEASON_ID);
      expect(result.readinessStatus).toBe('BLOCKED');
    });
  });

  // ── getPredictionImpact ──────────────────────────────────────────────────

  describe('getPredictionImpact', () => {
    it('returns prediction readiness data', async () => {
      const result = await service.getPredictionImpact(SEASON_ID);
      expect(result.readinessStatus).toBe('READY');
      expect(result.openFixtures).toBe(10);
      expect(result.eligibleFixtures).toBe(2);
      expect(result.ineligibleFixtures).toBe(1);
    });

    it('includes World Cup preservation note', async () => {
      const result = await service.getPredictionImpact(SEASON_ID);
      expect(result.worldCupNote).toContain('World Cup');
    });
  });

  // ── getPublicationReadiness ──────────────────────────────────────────────

  describe('getPublicationReadiness', () => {
    it('reflects publishing readiness from fixture import service', async () => {
      const result = await service.getPublicationReadiness(SEASON_ID);
      expect(result.publishedFixtures).toBe(30);
      expect(result.canPublish).toBe(false); // all already published
    });

    it('includes canPublish true when unpublished fixtures exist', async () => {
      mockFixtureImportService.getPublishingReadiness.mockResolvedValue({
        ...defaultPubReadiness,
        unpublishedFixtures: 5,
        publishedFixtures: 25,
        canPublish: true,
      });
      const result = await service.getPublicationReadiness(SEASON_ID);
      expect(result.canPublish).toBe(true);
    });
  });

  // ── deriveGameweeks ──────────────────────────────────────────────────────

  describe('deriveGameweeks', () => {
    it('delegates to fixture import autoCreateGameweeks', async () => {
      const result = await service.deriveGameweeks(SEASON_ID);
      expect(mockFixtureImportService.autoCreateGameweeks).toHaveBeenCalledWith(SEASON_ID);
      expect(result.seasonId).toBe(SEASON_ID);
    });

    it('includes World Cup preservation note', async () => {
      const result = await service.deriveGameweeks(SEASON_ID);
      expect(result.worldCupNote).toContain('World Cup');
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.deriveGameweeks('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── deriveDeadlines ──────────────────────────────────────────────────────

  describe('deriveDeadlines', () => {
    it('updates deadlines for gameweeks with published fixtures in future', async () => {
      const earlyKickoff = new Date(FUTURE.getTime() - 2 * 60 * 60 * 1000); // already past — should skip
      const futureKickoff = FUTURE;
      prisma.gameweek.findMany.mockResolvedValue([
        {
          id: 'gw-1', round: 1,
          transferDeadlineAt: new Date(FUTURE.getTime() + 1000), // after kickoff — needs update
          predictionDeadlineAt: new Date(FUTURE.getTime() + 1000),
          fixtures: [{ kickoffAt: futureKickoff }],
        },
      ]);
      const result = await service.deriveDeadlines(SEASON_ID);
      expect(prisma.gameweek.update).toHaveBeenCalledTimes(1);
      expect(result.updated).toBe(1);
    });

    it('skips gameweeks without published fixtures', async () => {
      prisma.gameweek.findMany.mockResolvedValue([
        { id: 'gw-1', round: 1, transferDeadlineAt: FUTURE, predictionDeadlineAt: FUTURE, fixtures: [] },
      ]);
      const result = await service.deriveDeadlines(SEASON_ID);
      expect(result.skipped).toBe(1);
      expect(prisma.gameweek.update).not.toHaveBeenCalled();
    });

    it('skips gameweeks with past kickoffs', async () => {
      prisma.gameweek.findMany.mockResolvedValue([
        { id: 'gw-1', round: 1, transferDeadlineAt: PAST, predictionDeadlineAt: PAST, fixtures: [{ kickoffAt: PAST }] },
      ]);
      const result = await service.deriveDeadlines(SEASON_ID);
      expect(result.skipped).toBe(1);
      expect(prisma.gameweek.update).not.toHaveBeenCalled();
    });

    it('MISSING_ONLY skips gameweeks already with valid deadlines', async () => {
      const validDeadline = new Date(FUTURE.getTime() - 90 * 60 * 1000);
      prisma.gameweek.findMany.mockResolvedValue([
        {
          id: 'gw-1', round: 1,
          transferDeadlineAt: validDeadline,
          predictionDeadlineAt: validDeadline,
          fixtures: [{ kickoffAt: FUTURE }],
        },
      ]);
      const result = await service.deriveDeadlines(SEASON_ID, { mode: 'MISSING_ONLY' });
      expect(result.skipped).toBe(1);
      expect(prisma.gameweek.update).not.toHaveBeenCalled();
    });

    it('OVERWRITE_DERIVED_ONLY updates even valid deadlines', async () => {
      const validDeadline = new Date(FUTURE.getTime() - 90 * 60 * 1000);
      prisma.gameweek.findMany.mockResolvedValue([
        {
          id: 'gw-1', round: 1,
          transferDeadlineAt: validDeadline,
          predictionDeadlineAt: validDeadline,
          fixtures: [{ kickoffAt: FUTURE }],
        },
      ]);
      const result = await service.deriveDeadlines(SEASON_ID, { mode: 'OVERWRITE_DERIVED_ONLY' });
      expect(result.updated).toBe(1);
    });
  });

  // ── validateSeasonGameweeks ──────────────────────────────────────────────

  describe('validateSeasonGameweeks', () => {
    it('returns isValid true when no conflicts or assignment issues', async () => {
      const result = await service.validateSeasonGameweeks(SEASON_ID);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns isValid false when ERROR conflicts exist', async () => {
      mockFixtureImportService.getSeasonFixtureConflicts.mockResolvedValue({
        ...defaultConflicts,
        conflicts: [{ type: 'DUPLICATE_FIXTURE', severity: 'ERROR', description: 'Duplicate', fixtureIds: ['f1', 'f2'] }],
        totalConflicts: 1,
      });
      const result = await service.validateSeasonGameweeks(SEASON_ID);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate');
    });
  });

  // ── getMatchdayControl ───────────────────────────────────────────────────

  describe('getMatchdayControl', () => {
    it('returns matchday control panel data', async () => {
      const result = await service.getMatchdayControl(SEASON_ID);
      expect(result.seasonId).toBe(SEASON_ID);
      expect(result.fixtures).toBeDefined();
      expect(result.nextActions).toBeDefined();
    });

    it('fanVisibilitySafe is true when fixtures published and all assigned', async () => {
      const result = await service.getMatchdayControl(SEASON_ID);
      expect(result.fanVisibilitySafe).toBe(true);
    });

    it('fanVisibilitySafe is false when no published fixtures', async () => {
      mockFixtureImportService.getPublishingReadiness.mockResolvedValue({ ...defaultPubReadiness, publishedFixtures: 0 });
      const result = await service.getMatchdayControl(SEASON_ID);
      expect(result.fanVisibilitySafe).toBe(false);
    });

    it('includes safety note with no gambling language', async () => {
      const result = await service.getMatchdayControl(SEASON_ID);
      expect(result.safetyNote).not.toMatch(/bet|odds|stake|gambling|wager/i);
    });
  });
});
