import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SquadImportService } from './squad-import.service';
import type { PrismaService } from '../prisma/prisma.service';
import {
  SquadImportBatchStatus,
  SquadImportBatchSourceType,
  SquadImportRowValidationStatus,
  SquadRegistrationStatus,
} from '@prisma/client';

const SEASON = { id: 'season-1', name: 'PSL 2026/27', slug: 'psl-2026-27', isActive: false, status: 'UPCOMING' };
const TEAM_ID = 'team-1';
const PLAYER_ID = 'player-1';

const makeBatch = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'batch-1',
  seasonId: 'season-1',
  sourceType: SquadImportBatchSourceType.MANUAL,
  status: SquadImportBatchStatus.DRAFT,
  notes: null,
  totalRows: 1,
  validRows: 0,
  warningRows: 0,
  blockedRows: 0,
  importedRows: 0,
  publishedRows: 0,
  createdByUserId: null,
  validatedAt: null,
  importedAt: null,
  publishedAt: null,
  cancelledAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { rows: 1 },
  ...overrides,
});

const makeRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'row-1',
  batchId: 'batch-1',
  rowNumber: 1,
  seasonId: 'season-1',
  teamId: TEAM_ID,
  proposedPlayerName: 'Sipho Dlamini',
  proposedDisplayName: null,
  proposedPosition: 'FORWARD',
  proposedShirtNumber: 10,
  proposedNationality: 'South African',
  proposedDateOfBirth: null,
  proposedFantasyPrice: 60,
  rawData: {},
  validationStatus: SquadImportRowValidationStatus.PENDING,
  validationMessages: null,
  isImportable: null,
  matchedPlayerId: null,
  importedPlayerId: null,
  importedRegistrationId: null,
  duplicatePlayerIds: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePrisma = () => ({
  season: {
    findUnique: vi.fn().mockResolvedValue(SEASON),
    findMany: vi.fn().mockResolvedValue([{ ...SEASON, _count: { squadImportBatches: 0, squadRegistrations: 0 } }]),
  },
  squadImportBatch: {
    create: vi.fn().mockResolvedValue(makeBatch()),
    findMany: vi.fn().mockResolvedValue([makeBatch()]),
    findFirst: vi.fn().mockResolvedValue(makeBatch()),
    update: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => Promise.resolve(makeBatch(data))),
    count: vi.fn().mockResolvedValue(1),
  },
  squadImportRow: {
    create: vi.fn().mockResolvedValue(makeRow()),
    findMany: vi.fn().mockResolvedValue([makeRow()]),
    findFirst: vi.fn().mockResolvedValue(makeRow()),
    update: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => Promise.resolve(makeRow(data))),
    count: vi.fn().mockResolvedValue(0),
  },
  seasonTeam: {
    findMany: vi.fn().mockResolvedValue([{ teamId: TEAM_ID }]),
    count: vi.fn().mockResolvedValue(16),
  },
  fantasyRulesConfig: {
    findUnique: vi.fn().mockResolvedValue({ minPrice: 40, maxPrice: 200, defaultPrice: 55 }),
  },
  player: {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: PLAYER_ID, name: 'Sipho Dlamini' }),
  },
  seasonSquadRegistration: {
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: 'reg-1', playerId: PLAYER_ID, teamId: TEAM_ID, status: SquadRegistrationStatus.PROVISIONAL }),
    update: vi.fn().mockResolvedValue({ id: 'reg-1', status: SquadRegistrationStatus.CONFIRMED }),
    count: vi.fn().mockResolvedValue(5),
  },
  fantasyPlayerPrice: {
    upsert: vi.fn().mockResolvedValue({ playerId: PLAYER_ID, seasonId: 'season-1', price: 60 }),
  },
  fantasyPlayerPriceHistory: {
    create: vi.fn().mockResolvedValue({ id: 'hist-1' }),
  },
  adminAuditLog: {
    create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
  },
  fixture: {
    count: vi.fn().mockResolvedValue(10),
  },
  gameweek: {
    count: vi.fn().mockResolvedValue(6),
  },
});

describe('SquadImportService', () => {
  let service: SquadImportService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new SquadImportService(prisma as unknown as PrismaService);
  });

  // ── getImportSeasons ─────────────────────────────────────────────────────────

  describe('getImportSeasons', () => {
    it('returns seasons with batch and registration counts', async () => {
      const result = await service.getImportSeasons();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 'season-1', importBatchCount: 0, squadRegistrationCount: 0 });
    });
  });

  // ── getImportOverview ────────────────────────────────────────────────────────

  describe('getImportOverview', () => {
    it('returns overview for a season', async () => {
      prisma.squadImportBatch.findMany.mockResolvedValue([makeBatch()]);
      prisma.seasonSquadRegistration.count.mockResolvedValueOnce(10).mockResolvedValueOnce(3);
      prisma.seasonTeam.count.mockResolvedValue(16);

      const result = await service.getImportOverview('season-1');
      expect(result.seasonId).toBe('season-1');
      expect(result.teamCount).toBe(16);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getImportOverview('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── listBatches ──────────────────────────────────────────────────────────────

  describe('listBatches', () => {
    it('returns batches for the season', async () => {
      const result = await service.listBatches('season-1');
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('batch-1');
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.listBatches('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getBatch ─────────────────────────────────────────────────────────────────

  describe('getBatch', () => {
    it('returns the batch', async () => {
      const result = await service.getBatch('season-1', 'batch-1');
      expect(result.id).toBe('batch-1');
    });

    it('throws NotFoundException when batch does not exist', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(null);
      await expect(service.getBatch('season-1', 'bad-batch')).rejects.toThrow(NotFoundException);
    });
  });

  // ── listRows ─────────────────────────────────────────────────────────────────

  describe('listRows', () => {
    it('returns rows for the batch', async () => {
      const result = await service.listRows('season-1', 'batch-1');
      expect(result).toHaveLength(1);
      expect(result[0]!.batchId).toBe('batch-1');
    });
  });

  // ── createManualBatch ────────────────────────────────────────────────────────

  describe('createManualBatch', () => {
    it('creates batch and rows', async () => {
      const result = await service.createManualBatch('season-1', {
        rows: [{ playerName: 'Sipho Dlamini', position: 'FORWARD', teamId: TEAM_ID }],
      });
      expect(result.id).toBe('batch-1');
      expect(prisma.squadImportBatch.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ seasonId: 'season-1', status: SquadImportBatchStatus.DRAFT }) }),
      );
      expect(prisma.adminAuditLog.create).toHaveBeenCalled();
    });

    it('throws BadRequestException when rows array is empty', async () => {
      await expect(service.createManualBatch('season-1', { rows: [] })).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.createManualBatch('bad', { rows: [{ playerName: 'X', position: 'FORWARD' }] })).rejects.toThrow(NotFoundException);
    });
  });

  // ── validateBatch ────────────────────────────────────────────────────────────

  describe('validateBatch', () => {
    it('marks batch VALIDATED when all rows pass', async () => {
      prisma.squadImportRow.findMany.mockResolvedValue([
        makeRow({ proposedShirtNumber: 10, proposedNationality: 'SA', proposedFantasyPrice: 60 }),
      ]);
      prisma.player.findMany.mockResolvedValue([]);

      const result = await service.validateBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.VALIDATED);
    });

    it('marks batch HAS_WARNINGS when rows have only warnings', async () => {
      prisma.squadImportRow.findMany.mockResolvedValue([
        makeRow({ proposedShirtNumber: null, proposedNationality: null, proposedFantasyPrice: null }),
      ]);
      prisma.player.findMany.mockResolvedValue([]);

      const result = await service.validateBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.HAS_WARNINGS);
    });

    it('marks batch BLOCKED when rows have blocker', async () => {
      prisma.squadImportRow.findMany.mockResolvedValue([
        makeRow({ proposedPosition: 'INVALID_POS', teamId: null }),
      ]);

      const result = await service.validateBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.BLOCKED);
    });

    it('marks BLOCKED when price is below minimum', async () => {
      prisma.squadImportRow.findMany.mockResolvedValue([
        makeRow({ proposedFantasyPrice: 10 }),
      ]);
      prisma.player.findMany.mockResolvedValue([]);

      const result = await service.validateBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.BLOCKED);
    });

    it('marks BLOCKED when price is above maximum', async () => {
      prisma.squadImportRow.findMany.mockResolvedValue([
        makeRow({ proposedFantasyPrice: 300 }),
      ]);
      prisma.player.findMany.mockResolvedValue([]);

      const result = await service.validateBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.BLOCKED);
    });

    it('marks BLOCKED when team not in season', async () => {
      prisma.squadImportRow.findMany.mockResolvedValue([
        makeRow({ teamId: 'unknown-team' }),
      ]);
      prisma.seasonTeam.findMany.mockResolvedValue([{ teamId: TEAM_ID }]);
      prisma.player.findMany.mockResolvedValue([]);

      const result = await service.validateBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.BLOCKED);
    });

    it('marks BLOCKED when duplicate has active registration', async () => {
      prisma.squadImportRow.findMany.mockResolvedValue([
        makeRow({ proposedFantasyPrice: 60, proposedShirtNumber: 10, proposedNationality: 'SA' }),
      ]);
      prisma.player.findMany.mockResolvedValue([{ id: PLAYER_ID, name: 'Sipho Dlamini' }]);
      prisma.seasonSquadRegistration.findFirst.mockResolvedValue({ id: 'reg-1', playerId: PLAYER_ID });

      const result = await service.validateBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.BLOCKED);
    });

    it('marks HAS_WARNINGS when possible duplicate has no active registration', async () => {
      prisma.squadImportRow.findMany.mockResolvedValue([
        makeRow({ proposedFantasyPrice: 60, proposedShirtNumber: 10, proposedNationality: 'SA' }),
      ]);
      prisma.player.findMany.mockResolvedValue([{ id: PLAYER_ID, name: 'Sipho Dlamini' }]);
      prisma.seasonSquadRegistration.findFirst.mockResolvedValue(null);

      const result = await service.validateBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.HAS_WARNINGS);
    });

    it('throws BadRequestException for cancelled batch', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.CANCELLED }));
      await expect(service.validateBatch('season-1', 'batch-1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for published batch', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.PUBLISHED }));
      await expect(service.validateBatch('season-1', 'batch-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ── importBatch ──────────────────────────────────────────────────────────────

  describe('importBatch', () => {
    it('imports validated batch and creates registrations', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.VALIDATED }));
      prisma.squadImportRow.findMany.mockResolvedValue([makeRow({ isImportable: true })]);
      prisma.player.findFirst.mockResolvedValue(null);

      const result = await service.importBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.IMPORTED);
      expect(prisma.player.create).toHaveBeenCalled();
      expect(prisma.seasonSquadRegistration.create).toHaveBeenCalled();
    });

    it('imports HAS_WARNINGS batch', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.HAS_WARNINGS }));
      prisma.squadImportRow.findMany.mockResolvedValue([makeRow({ isImportable: true })]);
      prisma.player.findFirst.mockResolvedValue(null);

      const result = await service.importBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.IMPORTED);
    });

    it('skips existing registration (idempotent)', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.VALIDATED }));
      prisma.squadImportRow.findMany.mockResolvedValue([makeRow({ isImportable: true })]);
      prisma.player.findFirst.mockResolvedValue({ id: PLAYER_ID });
      prisma.seasonSquadRegistration.findUnique.mockResolvedValue({ id: 'reg-1', playerId: PLAYER_ID });

      await service.importBatch('season-1', 'batch-1');
      expect(prisma.seasonSquadRegistration.create).not.toHaveBeenCalled();
    });

    it('sets fantasy price if provided', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.VALIDATED }));
      prisma.squadImportRow.findMany.mockResolvedValue([makeRow({ isImportable: true, proposedFantasyPrice: 75 })]);
      prisma.player.findFirst.mockResolvedValue(null);
      prisma.seasonSquadRegistration.findUnique.mockResolvedValue(null);

      await service.importBatch('season-1', 'batch-1');
      expect(prisma.fantasyPlayerPrice.upsert).toHaveBeenCalled();
      expect(prisma.fantasyPlayerPriceHistory.create).toHaveBeenCalled();
    });

    it('throws BadRequestException for BLOCKED batch', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.BLOCKED }));
      await expect(service.importBatch('season-1', 'batch-1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for DRAFT batch', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.DRAFT }));
      await expect(service.importBatch('season-1', 'batch-1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for already PUBLISHED batch', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.PUBLISHED }));
      await expect(service.importBatch('season-1', 'batch-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ── publishBatch ─────────────────────────────────────────────────────────────

  describe('publishBatch', () => {
    it('promotes PROVISIONAL registrations to CONFIRMED', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.IMPORTED }));
      prisma.squadImportRow.findMany.mockResolvedValue([makeRow({ importedRegistrationId: 'reg-1' })]);
      prisma.seasonSquadRegistration.findUnique.mockResolvedValue({
        id: 'reg-1', playerId: PLAYER_ID, teamId: TEAM_ID, status: SquadRegistrationStatus.PROVISIONAL,
      });

      const result = await service.publishBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.PUBLISHED);
      expect(prisma.seasonSquadRegistration.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: SquadRegistrationStatus.CONFIRMED } }),
      );
    });

    it('throws BadRequestException when batch is not IMPORTED', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.VALIDATED }));
      await expect(service.publishBatch('season-1', 'batch-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ── cancelBatch ──────────────────────────────────────────────────────────────

  describe('cancelBatch', () => {
    it('cancels a DRAFT batch', async () => {
      const result = await service.cancelBatch('season-1', 'batch-1');
      expect(result.status).toBe(SquadImportBatchStatus.CANCELLED);
      expect(prisma.adminAuditLog.create).toHaveBeenCalled();
    });

    it('throws BadRequestException for a PUBLISHED batch', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.PUBLISHED }));
      await expect(service.cancelBatch('season-1', 'batch-1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for an already CANCELLED batch', async () => {
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.CANCELLED }));
      await expect(service.cancelBatch('season-1', 'batch-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ── getDuplicates ────────────────────────────────────────────────────────────

  describe('getDuplicates', () => {
    it('returns rows with duplicate player IDs', async () => {
      prisma.squadImportRow.findMany.mockResolvedValue([
        makeRow({ duplicatePlayerIds: [PLAYER_ID] }),
      ]);

      const result = await service.getDuplicates('season-1');
      expect(result.duplicateCount).toBe(1);
      expect(result.rows).toHaveLength(1);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getDuplicates('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getReadiness ─────────────────────────────────────────────────────────────

  describe('getReadiness', () => {
    it('returns READY when all checks pass', async () => {
      prisma.seasonTeam.count.mockResolvedValue(16);
      prisma.seasonSquadRegistration.count.mockResolvedValueOnce(96).mockResolvedValueOnce(96);
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.PUBLISHED, blockedRows: 0 }));

      const result = await service.getReadiness('season-1');
      expect(result.readinessStatus).toBe('READY');
      expect(result.blockerCount).toBe(0);
    });

    it('returns BLOCKED when no teams are registered', async () => {
      prisma.seasonTeam.count.mockResolvedValue(0);
      prisma.seasonSquadRegistration.count.mockResolvedValue(0);
      prisma.squadImportBatch.findFirst.mockResolvedValue(null);

      const result = await service.getReadiness('season-1');
      expect(result.readinessStatus).toBe('BLOCKED');
      expect(result.blockerCount).toBeGreaterThan(0);
    });

    it('returns READY_WITH_WARNINGS when no registrations exist', async () => {
      prisma.seasonTeam.count.mockResolvedValue(16);
      prisma.seasonSquadRegistration.count.mockResolvedValue(0);
      prisma.squadImportBatch.findFirst.mockResolvedValue(null);

      const result = await service.getReadiness('season-1');
      expect(result.readinessStatus).toBe('READY_WITH_WARNINGS');
      expect(result.warningCount).toBeGreaterThan(0);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getReadiness('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getActivationImpact ──────────────────────────────────────────────────────

  describe('getActivationImpact', () => {
    it('returns impact summary', async () => {
      prisma.seasonSquadRegistration.count.mockResolvedValueOnce(96).mockResolvedValueOnce(96);
      prisma.squadImportBatch.count.mockResolvedValue(3);
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.PUBLISHED, importedRows: 32, publishedRows: 32 }));

      const result = await service.getActivationImpact('season-1');
      expect(result.totalRegistrations).toBe(96);
      expect(result.confirmedRegistrations).toBe(96);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getActivationImpact('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getActivationDryRun ──────────────────────────────────────────────────────

  describe('getActivationDryRun', () => {
    it('returns dryRunOnly: true and activationWillNotBePerformed: true', async () => {
      prisma.seasonTeam.count.mockResolvedValue(16);
      prisma.seasonSquadRegistration.count.mockResolvedValue(96);
      prisma.squadImportBatch.findFirst.mockResolvedValue(makeBatch({ status: SquadImportBatchStatus.PUBLISHED, blockedRows: 0 }));
      prisma.fixture.count.mockResolvedValue(10);
      prisma.gameweek.count.mockResolvedValue(6);

      const result = await service.getActivationDryRun('season-1');
      expect(result.dryRunOnly).toBe(true);
      expect(result.activationWillNotBePerformed).toBe(true);
      expect(result.safetyConfirmations.fantasyPointsOnly).toBe(true);
      expect(result.safetyConfirmations.fanValueNonFinancial).toBe(true);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getActivationDryRun('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
