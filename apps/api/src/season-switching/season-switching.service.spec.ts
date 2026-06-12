import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SeasonSwitchingService } from './season-switching.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SeasonStatus, SeasonSwitchAction, SeasonSwitchStatus } from '@prisma/client';

const mockSeason = (overrides: object = {}) => ({
  id: 'season-1',
  name: 'PSL 2026/27',
  slug: 'psl-2026-27',
  status: SeasonStatus.UPCOMING,
  isActive: false,
  startDate: new Date('2026-08-01'),
  endDate: new Date('2027-05-31'),
  competitionId: 'comp-1',
  ...overrides,
});

const mockActiveSeason = () =>
  mockSeason({ id: 'wc-season', name: 'FIFA World Cup 2026', status: SeasonStatus.ACTIVE, isActive: true });

const mockAudit = (overrides: object = {}) => ({
  id: 'audit-1',
  toSeasonId: 'season-1',
  fromSeasonId: 'wc-season',
  action: SeasonSwitchAction.ACTIVATE,
  status: SeasonSwitchStatus.SUCCESS,
  performedByUserId: 'user-1',
  blockersJson: null,
  warningsJson: null,
  summaryJson: null,
  createdAt: new Date(),
  ...overrides,
});

describe('SeasonSwitchingService', () => {
  let service: SeasonSwitchingService;
  let prisma: {
    season: {
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    seasonSwitchAudit: {
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    seasonTeam: { count: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
    fixture: { count: ReturnType<typeof vi.fn> };
    gameweek: { count: ReturnType<typeof vi.fn> };
    fantasyRulesConfig: { findUnique: ReturnType<typeof vi.fn> };
    fantasyPlayerPrice: { count: ReturnType<typeof vi.fn> };
    clubProfile: { count: ReturnType<typeof vi.fn> };
    predictionRulesConfig: { findUnique: ReturnType<typeof vi.fn> };
    fanValueLedger: { count: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    prisma = {
      season: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      seasonSwitchAudit: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue(mockAudit()),
      },
      seasonTeam: {
        count: vi.fn().mockResolvedValue(16),
        findMany: vi.fn().mockResolvedValue(
          Array.from({ length: 16 }, (_, i) => ({ teamId: `team-${i}` })),
        ),
      },
      fixture: { count: vi.fn().mockResolvedValue(30) },
      gameweek: { count: vi.fn().mockResolvedValue(30) },
      fantasyRulesConfig: { findUnique: vi.fn().mockResolvedValue({ id: 'cfg-1' }) },
      fantasyPlayerPrice: { count: vi.fn().mockResolvedValue(200) },
      clubProfile: { count: vi.fn().mockResolvedValue(16) },
      predictionRulesConfig: { findUnique: vi.fn().mockResolvedValue({ id: 'pred-cfg-1', status: 'PROVISIONAL' }) },
      fanValueLedger: { count: vi.fn().mockResolvedValue(0) },
      $transaction: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeasonSwitchingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SeasonSwitchingService>(SeasonSwitchingService);
  });

  // ── getAdminSeasonContext ─────────────────────────────────────────────────

  describe('getAdminSeasonContext', () => {
    it('returns active season and all seasons', async () => {
      const active = mockActiveSeason();
      const all = [active, mockSeason()];
      prisma.season.findFirst.mockResolvedValue(active);
      prisma.season.findMany.mockResolvedValue(all);
      prisma.seasonSwitchAudit.findFirst.mockResolvedValue(null);

      const result = await service.getAdminSeasonContext();

      expect(result.activeSeason).toEqual(active);
      expect(result.allSeasons).toHaveLength(2);
      expect(result.lastSwitchAt).toBeNull();
    });

    it('returns lastSwitchAt from audit log', async () => {
      const audit = mockAudit();
      prisma.season.findFirst.mockResolvedValue(null);
      prisma.season.findMany.mockResolvedValue([]);
      prisma.seasonSwitchAudit.findFirst.mockResolvedValue(audit);

      const result = await service.getAdminSeasonContext();

      expect(result.lastSwitchAt).toEqual(audit.createdAt);
      expect(result.lastSwitchAction).toBe(SeasonSwitchAction.ACTIVATE);
    });

    it('handles no active season gracefully', async () => {
      prisma.season.findFirst.mockResolvedValue(null);
      prisma.season.findMany.mockResolvedValue([mockSeason()]);
      prisma.seasonSwitchAudit.findFirst.mockResolvedValue(null);

      const result = await service.getAdminSeasonContext();

      expect(result.activeSeason).toBeNull();
    });
  });

  // ── getSeasonSwitchReadiness ──────────────────────────────────────────────

  describe('getSeasonSwitchReadiness', () => {
    it('returns READY when all checks pass', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());

      const result = await service.getSeasonSwitchReadiness('season-1');

      expect(result.activationStatus).toBe('READY');
      expect(result.blockers).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('returns BLOCKED when no teams registered', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      prisma.seasonTeam.count.mockResolvedValue(0);
      prisma.seasonTeam.findMany.mockResolvedValue([]);

      const result = await service.getSeasonSwitchReadiness('season-1');

      expect(result.activationStatus).toBe('BLOCKED');
      expect(result.blockers.length).toBeGreaterThan(0);
      expect(result.blockers[0]!.domain).toBe('clubs');
    });

    it('returns READY_WITH_WARNINGS when fixtures missing but teams present', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      prisma.fixture.count.mockResolvedValue(0);
      prisma.gameweek.count.mockResolvedValue(0);
      prisma.fantasyRulesConfig.findUnique.mockResolvedValue(null);
      prisma.fantasyPlayerPrice.count.mockResolvedValue(0);

      const result = await service.getSeasonSwitchReadiness('season-1');

      expect(result.activationStatus).toBe('READY_WITH_WARNINGS');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.blockers).toHaveLength(0);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);

      await expect(service.getSeasonSwitchReadiness('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('checks fixtures published separately from loaded', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      // Use mockImplementation to distinguish isPublished:true from total counts
      // checkMatchdayOperationsReadiness also uses isPublished:true, so 0 applies there too
      prisma.fixture.count.mockImplementation(({ where }: { where?: { isPublished?: boolean } } = {}) =>
        Promise.resolve(where?.isPublished === true ? 0 : 30),
      );

      const result = await service.getSeasonSwitchReadiness('season-1');

      const publishedCheck = result.checks.find((c) => c.label === 'Fixtures published');
      expect(publishedCheck).toBeDefined();
      expect(publishedCheck?.passed).toBe(false);
      expect(result.activationStatus).toBe('READY_WITH_WARNINGS');
    });

    it('includes all 10 checks', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());

      const result = await service.getSeasonSwitchReadiness('season-1');

      expect(result.checks).toHaveLength(10);
    });
  });

  // ── getSeasonSwitchPreview ────────────────────────────────────────────────

  describe('getSeasonSwitchPreview', () => {
    beforeEach(() => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      prisma.season.findFirst.mockResolvedValue(mockActiveSeason());
    });

    it('returns fromSeason, toSeason, willComplete, willActivate', async () => {
      const result = await service.getSeasonSwitchPreview('season-1');

      expect(result.fromSeason).not.toBeNull();
      expect(result.fromSeason?.name).toBe('FIFA World Cup 2026');
      expect(result.toSeason.name).toBe('PSL 2026/27');
      expect(result.willComplete).toHaveLength(1);
      expect(result.willActivate).toHaveLength(1);
    });

    it('creates a PREVIEW audit record', async () => {
      await service.getSeasonSwitchPreview('season-1');

      expect(prisma.seasonSwitchAudit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: SeasonSwitchAction.PREVIEW }),
        }),
      );
    });

    it('handles no active season', async () => {
      prisma.season.findFirst.mockResolvedValue(null);

      const result = await service.getSeasonSwitchPreview('season-1');

      expect(result.fromSeason).toBeNull();
      expect(result.willComplete).toHaveLength(0);
    });

    it('throws for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);

      await expect(service.getSeasonSwitchPreview('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── activateSeason ────────────────────────────────────────────────────────

  describe('activateSeason', () => {
    const readySeason = mockSeason();

    beforeEach(() => {
      prisma.season.findUnique.mockResolvedValue(readySeason);
      prisma.season.findFirst.mockResolvedValue(mockActiveSeason());

      prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          season: {
            update: vi.fn().mockResolvedValue({ ...readySeason, isActive: true, status: SeasonStatus.ACTIVE }),
          },
        };
        const result = await fn(tx);
        return result;
      });
    });

    it('activates season when all checks pass', async () => {
      const result = await service.activateSeason('season-1', 'user-1', {});

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.seasonSwitchAudit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SeasonSwitchAction.ACTIVATE,
            status: SeasonSwitchStatus.SUCCESS,
          }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('throws BadRequest when BLOCKED', async () => {
      prisma.seasonTeam.count.mockResolvedValue(0);
      prisma.seasonTeam.findMany.mockResolvedValue([]);

      await expect(service.activateSeason('season-1', 'user-1', {})).rejects.toThrow(BadRequestException);
    });

    it('creates BLOCKED audit when activation blocked', async () => {
      prisma.seasonTeam.count.mockResolvedValue(0);
      prisma.seasonTeam.findMany.mockResolvedValue([]);

      await expect(service.activateSeason('season-1', 'user-1', {})).rejects.toThrow(BadRequestException);

      expect(prisma.seasonSwitchAudit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: SeasonSwitchStatus.BLOCKED }),
        }),
      );
    });

    it('requires acknowledgeWarnings when READY_WITH_WARNINGS', async () => {
      prisma.fantasyRulesConfig.findUnique.mockResolvedValue(null);

      await expect(service.activateSeason('season-1', 'user-1', {})).rejects.toThrow(BadRequestException);
    });

    it('proceeds with acknowledgeWarnings=true', async () => {
      prisma.fantasyRulesConfig.findUnique.mockResolvedValue(null);

      const result = await service.activateSeason('season-1', 'user-1', { acknowledgeWarnings: true });

      expect(result).toBeDefined();
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);

      await expect(service.activateSeason('bad-id', 'user-1', {})).rejects.toThrow(NotFoundException);
    });

    it('accepts null userId', async () => {
      const result = await service.activateSeason('season-1', null, {});

      expect(result).toBeDefined();
    });
  });

  // ── completeSeason ────────────────────────────────────────────────────────

  describe('completeSeason', () => {
    it('marks season COMPLETED', async () => {
      const season = mockSeason({ status: SeasonStatus.ACTIVE, isActive: true });
      prisma.season.findUnique.mockResolvedValue(season);
      prisma.season.update.mockResolvedValue({ ...season, isActive: false, status: SeasonStatus.COMPLETED });

      const result = await service.completeSeason('season-1', 'user-1');

      expect(prisma.season.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: SeasonStatus.COMPLETED, isActive: false }),
        }),
      );
      expect(result.status).toBe(SeasonStatus.COMPLETED);
    });

    it('throws if already COMPLETED', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason({ status: SeasonStatus.COMPLETED }));

      await expect(service.completeSeason('season-1', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);

      await expect(service.completeSeason('bad-id', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('creates a COMPLETE audit record', async () => {
      const season = mockSeason({ status: SeasonStatus.ACTIVE });
      prisma.season.findUnique.mockResolvedValue(season);
      prisma.season.update.mockResolvedValue({ ...season, status: SeasonStatus.COMPLETED, isActive: false });

      await service.completeSeason('season-1', 'user-1');

      expect(prisma.seasonSwitchAudit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: SeasonSwitchAction.COMPLETE }),
        }),
      );
    });
  });

  // ── rollbackSeason ────────────────────────────────────────────────────────

  describe('rollbackSeason', () => {
    const activeSeason = mockSeason({ status: SeasonStatus.ACTIVE, isActive: true });

    beforeEach(() => {
      prisma.season.findUnique.mockResolvedValue(activeSeason);
      prisma.seasonSwitchAudit.findFirst.mockResolvedValue(mockAudit({ fromSeasonId: 'wc-season' }));
      prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          season: {
            update: vi.fn()
              .mockResolvedValueOnce({ ...activeSeason, isActive: false, status: SeasonStatus.UPCOMING })
              .mockResolvedValueOnce({ id: 'wc-season', name: 'FIFA WC', isActive: true, status: SeasonStatus.ACTIVE }),
          },
        };
        return fn(tx);
      });
    });

    it('deactivates current season and restores previous', async () => {
      const result = await service.rollbackSeason('season-1', 'user-1');

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.deactivated).toBeDefined();
    });

    it('throws if no prior activation found', async () => {
      prisma.seasonSwitchAudit.findFirst.mockResolvedValue(null);

      await expect(service.rollbackSeason('season-1', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('throws if season is not ACTIVE', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason({ status: SeasonStatus.UPCOMING }));

      await expect(service.rollbackSeason('season-1', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);

      await expect(service.rollbackSeason('bad-id', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('creates ROLLBACK audit record', async () => {
      await service.rollbackSeason('season-1', 'user-1');

      expect(prisma.seasonSwitchAudit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: SeasonSwitchAction.ROLLBACK }),
        }),
      );
    });
  });

  // ── getSwitchHistory ──────────────────────────────────────────────────────

  describe('getSwitchHistory', () => {
    it('returns all audit records when no seasonId', async () => {
      prisma.seasonSwitchAudit.findMany.mockResolvedValue([mockAudit()]);

      const result = await service.getSwitchHistory();

      expect(prisma.seasonSwitchAudit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
      expect(result).toHaveLength(1);
    });

    it('filters by seasonId when provided', async () => {
      prisma.seasonSwitchAudit.findMany.mockResolvedValue([mockAudit()]);

      await service.getSwitchHistory('season-1');

      expect(prisma.seasonSwitchAudit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { toSeasonId: 'season-1' } }),
      );
    });

    it('returns empty array when no history', async () => {
      prisma.seasonSwitchAudit.findMany.mockResolvedValue([]);

      const result = await service.getSwitchHistory();

      expect(result).toHaveLength(0);
    });
  });
});
