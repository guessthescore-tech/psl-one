import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { FixtureImportBatchStatus, FixtureImportRowStatus } from '@prisma/client';
import { FixtureImportService } from './fixture-import.service';

function makePrismaMock() {
  return {
    fixtureImportBatch: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
    fixtureImportRow: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    fixture: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    season: {
      findUnique: vi.fn(),
    },
    team: {
      findFirst: vi.fn(),
    },
    venue: {
      findFirst: vi.fn(),
    },
    gameweek: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  };
}

const SEASON_ID = 'season-1';
const BATCH_ID = 'batch-1';
const ROW_ID = 'row-1';
const TEAM_A = 'team-a';
const TEAM_B = 'team-b';

const DRAFT_BATCH = {
  id: BATCH_ID,
  seasonId: SEASON_ID,
  status: FixtureImportBatchStatus.DRAFT,
  errorRows: 0,
};

describe('FixtureImportService', () => {
  let service: FixtureImportService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new FixtureImportService(prisma as any);
  });

  // ── Batch CRUD ──────────────────────────────────────────────────────────

  describe('createBatch', () => {
    it('creates a batch for existing season', async () => {
      prisma.season.findUnique.mockResolvedValue({ id: SEASON_ID, slug: 'psl-2026' });
      prisma.fixtureImportBatch.create.mockResolvedValue({ id: BATCH_ID, seasonId: SEASON_ID });
      const result = await service.createBatch({ seasonId: SEASON_ID });
      expect(prisma.fixtureImportBatch.create).toHaveBeenCalled();
      expect(result).toMatchObject({ id: BATCH_ID });
    });

    it('throws when season not found', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.createBatch({ seasonId: 'nope' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('listBatches', () => {
    it('returns all batches without seasonId filter', async () => {
      prisma.fixtureImportBatch.findMany.mockResolvedValue([{ id: BATCH_ID }]);
      const result = await service.listBatches();
      expect(result).toHaveLength(1);
    });

    it('filters by seasonId when provided', async () => {
      prisma.fixtureImportBatch.findMany.mockResolvedValue([]);
      await service.listBatches(SEASON_ID);
      expect(prisma.fixtureImportBatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { seasonId: SEASON_ID } }),
      );
    });
  });

  describe('getBatch', () => {
    it('returns batch', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({ id: BATCH_ID });
      const result = await service.getBatch(BATCH_ID);
      expect(result).toMatchObject({ id: BATCH_ID });
    });

    it('throws when not found', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(null);
      await expect(service.getBatch('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBatch', () => {
    it('deletes a DRAFT batch', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportBatch.delete.mockResolvedValue({});
      const result = await service.deleteBatch(BATCH_ID);
      expect(result).toMatchObject({ deleted: true });
    });

    it('blocks deletion of COMMITTED batch', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({
        ...DRAFT_BATCH, status: FixtureImportBatchStatus.COMMITTED,
      });
      await expect(service.deleteBatch(BATCH_ID)).rejects.toThrow(BadRequestException);
    });
  });

  // ── Row CRUD ────────────────────────────────────────────────────────────

  describe('addRow', () => {
    it('adds a row and resolves team ids', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportRow.aggregate.mockResolvedValue({ _max: { rowNumber: 0 } });
      prisma.team.findFirst.mockResolvedValue({ id: TEAM_A });
      prisma.fixtureImportRow.create.mockResolvedValue({ id: ROW_ID, rowNumber: 1 });
      prisma.fixtureImportRow.groupBy.mockResolvedValue([]);
      prisma.fixtureImportBatch.update.mockResolvedValue({});

      const result = await service.addRow(BATCH_ID, {
        homeTeamRaw: 'Kaizer Chiefs',
        awayTeamRaw: 'Orlando Pirates',
        kickoffAtRaw: '2026-08-15T15:00:00Z',
      });
      expect(result).toMatchObject({ id: ROW_ID });
    });

    it('blocks adding to a COMMITTED batch', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({
        ...DRAFT_BATCH, status: FixtureImportBatchStatus.COMMITTED,
      });
      await expect(
        service.addRow(BATCH_ID, { kickoffAtRaw: '2026-08-15T15:00:00Z' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteRow', () => {
    it('deletes a row from a DRAFT batch', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportRow.findFirst.mockResolvedValue({ id: ROW_ID });
      prisma.fixtureImportRow.delete.mockResolvedValue({});
      prisma.fixtureImportRow.groupBy.mockResolvedValue([]);
      prisma.fixtureImportBatch.update.mockResolvedValue({});
      const result = await service.deleteRow(BATCH_ID, ROW_ID);
      expect(result).toMatchObject({ deleted: true });
    });

    it('throws when row not in batch', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportRow.findFirst.mockResolvedValue(null);
      await expect(service.deleteRow(BATCH_ID, 'bad-row')).rejects.toThrow(NotFoundException);
    });
  });

  // ── Validation ──────────────────────────────────────────────────────────

  describe('validateBatch', () => {
    const SEASON_DATA = {
      id: SEASON_ID,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2027-05-31'),
      seasonTeams: [
        { teamId: TEAM_A, status: 'ACTIVE' },
        { teamId: TEAM_B, status: 'ACTIVE' },
      ],
    };

    it('marks rows as VALID when all required fields and teams present', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportBatch.update.mockResolvedValue({});
      prisma.season.findUnique.mockResolvedValue(SEASON_DATA);
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        {
          id: ROW_ID,
          rowNumber: 1,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          homeTeamRaw: null, awayTeamRaw: null,
          homeTeamId: TEAM_A, awayTeamId: TEAM_B,
          venueId: 'venue-1', gameweekId: 'gw-1',
          venueRaw: null,
        },
      ]);
      prisma.gameweek.findUnique.mockResolvedValue({
        transferDeadlineAt: new Date('2026-09-01T13:00:00Z'),
        predictionDeadlineAt: new Date('2026-09-01T14:00:00Z'),
      });
      prisma.fixture.findFirst.mockResolvedValue(null);
      prisma.fixtureImportRow.update.mockResolvedValue({});

      const result = await service.validateBatch(BATCH_ID);
      expect(result.errorRows).toBe(0);
      expect(result.validRows).toBe(1);
      expect(result.canCommit).toBe(true);
    });

    it('blocks commit when home team is missing', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportBatch.update.mockResolvedValue({});
      prisma.season.findUnique.mockResolvedValue(SEASON_DATA);
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        {
          id: ROW_ID, rowNumber: 1,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          homeTeamRaw: null, awayTeamRaw: null,
          homeTeamId: null, awayTeamId: TEAM_B,
          venueId: null, gameweekId: null, venueRaw: null,
        },
      ]);
      prisma.fixtureImportRow.update.mockResolvedValue({});

      const result = await service.validateBatch(BATCH_ID);
      expect(result.errorRows).toBe(1);
      expect(result.canCommit).toBe(false);
      expect(result.rowResults[0]?.errors.some(e => e.field === 'homeTeam')).toBe(true);
    });

    it('blocks commit when away team is missing', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportBatch.update.mockResolvedValue({});
      prisma.season.findUnique.mockResolvedValue(SEASON_DATA);
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        {
          id: ROW_ID, rowNumber: 1,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          homeTeamRaw: null, awayTeamRaw: null,
          homeTeamId: TEAM_A, awayTeamId: null,
          venueId: null, gameweekId: null, venueRaw: null,
        },
      ]);
      prisma.fixtureImportRow.update.mockResolvedValue({});
      const result = await service.validateBatch(BATCH_ID);
      expect(result.errorRows).toBe(1);
      expect(result.rowResults[0]?.errors.some(e => e.field === 'awayTeam')).toBe(true);
    });

    it('blocks commit when home equals away', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportBatch.update.mockResolvedValue({});
      prisma.season.findUnique.mockResolvedValue(SEASON_DATA);
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        {
          id: ROW_ID, rowNumber: 1,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          homeTeamRaw: null, awayTeamRaw: null,
          homeTeamId: TEAM_A, awayTeamId: TEAM_A,
          venueId: null, gameweekId: null, venueRaw: null,
        },
      ]);
      prisma.fixtureImportRow.update.mockResolvedValue({});
      const result = await service.validateBatch(BATCH_ID);
      expect(result.errorRows).toBe(1);
      expect(result.rowResults[0]?.errors.some(e => e.field === 'teams')).toBe(true);
    });

    it('blocks commit when team not in season', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportBatch.update.mockResolvedValue({});
      prisma.season.findUnique.mockResolvedValue({ ...SEASON_DATA, seasonTeams: [] });
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        {
          id: ROW_ID, rowNumber: 1,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          homeTeamRaw: null, awayTeamRaw: null,
          homeTeamId: TEAM_A, awayTeamId: TEAM_B,
          venueId: null, gameweekId: null, venueRaw: null,
        },
      ]);
      prisma.fixtureImportRow.update.mockResolvedValue({});
      const result = await service.validateBatch(BATCH_ID);
      expect(result.errorRows).toBe(1);
    });

    it('warns when venue missing', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportBatch.update.mockResolvedValue({});
      prisma.season.findUnique.mockResolvedValue(SEASON_DATA);
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        {
          id: ROW_ID, rowNumber: 1,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          homeTeamRaw: null, awayTeamRaw: null,
          homeTeamId: TEAM_A, awayTeamId: TEAM_B,
          venueId: null, gameweekId: 'gw-1', venueRaw: null,
        },
      ]);
      prisma.gameweek.findUnique.mockResolvedValue({
        transferDeadlineAt: new Date('2026-09-01T13:00:00Z'),
        predictionDeadlineAt: new Date('2026-09-01T14:00:00Z'),
      });
      prisma.fixture.findFirst.mockResolvedValue(null);
      prisma.fixtureImportRow.update.mockResolvedValue({});
      const result = await service.validateBatch(BATCH_ID);
      expect(result.warningRows).toBe(1);
      expect(result.rowResults[0]?.warnings.some(w => w.field === 'venue')).toBe(true);
    });

    it('warns when gameweek missing', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportBatch.update.mockResolvedValue({});
      prisma.season.findUnique.mockResolvedValue(SEASON_DATA);
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        {
          id: ROW_ID, rowNumber: 1,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          homeTeamRaw: null, awayTeamRaw: null,
          homeTeamId: TEAM_A, awayTeamId: TEAM_B,
          venueId: 'venue-1', gameweekId: null, venueRaw: null,
        },
      ]);
      prisma.fixture.findFirst.mockResolvedValue(null);
      prisma.fixtureImportRow.update.mockResolvedValue({});
      const result = await service.validateBatch(BATCH_ID);
      expect(result.warningRows).toBe(1);
      expect(result.rowResults[0]?.warnings.some(w => w.field === 'gameweek')).toBe(true);
    });

    it('warns when duplicate exists in DB', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportBatch.update.mockResolvedValue({});
      prisma.season.findUnique.mockResolvedValue(SEASON_DATA);
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        {
          id: ROW_ID, rowNumber: 1,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          homeTeamRaw: null, awayTeamRaw: null,
          homeTeamId: TEAM_A, awayTeamId: TEAM_B,
          venueId: null, gameweekId: null, venueRaw: null,
        },
      ]);
      prisma.fixture.findFirst.mockResolvedValue({ id: 'existing-fixture' });
      prisma.fixtureImportRow.update.mockResolvedValue({});
      const result = await service.validateBatch(BATCH_ID);
      const warnings = result.rowResults[0]?.warnings ?? [];
      expect(warnings.some(w => w.message.includes('already exists'))).toBe(true);
    });

    it('detects duplicate row within batch', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportBatch.update.mockResolvedValue({});
      prisma.season.findUnique.mockResolvedValue(SEASON_DATA);
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        {
          id: 'row-1', rowNumber: 1,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          homeTeamRaw: null, awayTeamRaw: null,
          homeTeamId: TEAM_A, awayTeamId: TEAM_B,
          venueId: null, gameweekId: null, venueRaw: null,
        },
        {
          id: 'row-2', rowNumber: 2,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          homeTeamRaw: null, awayTeamRaw: null,
          homeTeamId: TEAM_A, awayTeamId: TEAM_B,
          venueId: null, gameweekId: null, venueRaw: null,
        },
      ]);
      prisma.fixture.findFirst.mockResolvedValue(null);
      prisma.fixtureImportRow.update.mockResolvedValue({});
      const result = await service.validateBatch(BATCH_ID);
      expect(result.errorRows).toBeGreaterThan(0);
    });
  });

  // ── Commit ──────────────────────────────────────────────────────────────

  describe('commitBatch', () => {
    it('requires VALIDATED status', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({
        ...DRAFT_BATCH, status: FixtureImportBatchStatus.DRAFT,
      });
      await expect(service.commitBatch(BATCH_ID)).rejects.toThrow(BadRequestException);
    });

    it('blocks commit when error rows remain', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({
        ...DRAFT_BATCH,
        status: FixtureImportBatchStatus.VALIDATED,
        errorRows: 3,
      });
      await expect(service.commitBatch(BATCH_ID)).rejects.toThrow(BadRequestException);
    });

    it('creates fixtures from valid rows', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({
        ...DRAFT_BATCH, status: FixtureImportBatchStatus.VALIDATED, errorRows: 0, seasonId: SEASON_ID,
      });
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        {
          id: ROW_ID, homeTeamId: TEAM_A, awayTeamId: TEAM_B,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          venueId: null, gameweekId: null, roundRaw: '1',
          status: FixtureImportRowStatus.VALID,
        },
      ]);
      prisma.fixture.findFirst.mockResolvedValue(null);
      prisma.fixture.create.mockResolvedValue({ id: 'new-fixture' });
      prisma.fixtureImportRow.update.mockResolvedValue({});
      prisma.fixtureImportBatch.update.mockResolvedValue({});

      const result = await service.commitBatch(BATCH_ID);
      expect(result.committed).toBe(1);
      expect(prisma.fixture.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isPublished: false }),
        }),
      );
    });

    it('is idempotent — skips rows with existing fixtures', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({
        ...DRAFT_BATCH, status: FixtureImportBatchStatus.VALIDATED, errorRows: 0, seasonId: SEASON_ID,
      });
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        {
          id: ROW_ID, homeTeamId: TEAM_A, awayTeamId: TEAM_B,
          kickoffAtRaw: '2026-09-01T15:00:00Z',
          venueId: null, gameweekId: null, roundRaw: null,
          status: FixtureImportRowStatus.VALID,
        },
      ]);
      prisma.fixture.findFirst.mockResolvedValue({ id: 'existing' });
      prisma.fixtureImportRow.update.mockResolvedValue({});
      prisma.fixtureImportBatch.update.mockResolvedValue({});

      const result = await service.commitBatch(BATCH_ID);
      expect(result.skipped).toBe(1);
      expect(prisma.fixture.create).not.toHaveBeenCalled();
    });
  });

  // ── Publish ─────────────────────────────────────────────────────────────

  describe('publishBatch', () => {
    it('requires COMMITTED status', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({
        ...DRAFT_BATCH, status: FixtureImportBatchStatus.VALIDATED,
      });
      await expect(service.publishBatch(BATCH_ID)).rejects.toThrow(BadRequestException);
    });

    it('cannot publish batch with errors', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({
        ...DRAFT_BATCH, status: FixtureImportBatchStatus.VALIDATED, errorRows: 2,
      });
      await expect(service.publishBatch(BATCH_ID)).rejects.toThrow(BadRequestException);
    });

    it('publishes committed fixtures and is idempotent', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({
        ...DRAFT_BATCH, status: FixtureImportBatchStatus.COMMITTED,
      });
      prisma.fixtureImportRow.findMany.mockResolvedValue([
        { fixtureId: 'fix-1' },
      ]);
      prisma.fixture.findFirst.mockResolvedValue(null);
      prisma.fixture.updateMany.mockResolvedValue({ count: 1 });
      prisma.fixtureImportBatch.update.mockResolvedValue({});

      const result = await service.publishBatch(BATCH_ID);
      expect(result.published).toBe(1);
      expect(prisma.fixture.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isPublished: true } }),
      );
    });

    it('blocks publish when fixture has live events', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({
        ...DRAFT_BATCH, status: FixtureImportBatchStatus.COMMITTED,
      });
      prisma.fixtureImportRow.findMany.mockResolvedValue([{ fixtureId: 'fix-1' }]);
      prisma.fixture.findFirst.mockResolvedValue({ id: 'fix-1' });
      await expect(service.publishBatch(BATCH_ID)).rejects.toThrow(ConflictException);
    });
  });

  // ── Reject ──────────────────────────────────────────────────────────────

  describe('rejectBatch', () => {
    it('rejects a DRAFT batch', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue(DRAFT_BATCH);
      prisma.fixtureImportBatch.update.mockResolvedValue({});
      const result = await service.rejectBatch(BATCH_ID);
      expect(result.status).toBe(FixtureImportBatchStatus.REJECTED);
    });

    it('cannot reject a PUBLISHED batch', async () => {
      prisma.fixtureImportBatch.findUnique.mockResolvedValue({
        ...DRAFT_BATCH, status: FixtureImportBatchStatus.PUBLISHED,
      });
      await expect(service.rejectBatch(BATCH_ID)).rejects.toThrow(BadRequestException);
    });
  });

  // ── Season validation ───────────────────────────────────────────────────

  describe('getSeasonFixtureValidation', () => {
    it('returns validation summary for a season', async () => {
      prisma.season.findUnique.mockResolvedValue({ id: SEASON_ID, name: 'PSL 2026', slug: 'psl-2026', startDate: null, endDate: null });
      prisma.fixture.findMany.mockResolvedValue([
        { id: 'f1', kickoffAt: new Date(), status: 'SCHEDULED', gameweekId: 'gw-1', venueId: 'v1', isPublished: true },
        { id: 'f2', kickoffAt: new Date(), status: 'SCHEDULED', gameweekId: null, venueId: null, isPublished: false },
      ]);
      const result = await service.getSeasonFixtureValidation(SEASON_ID);
      expect(result.totalFixtures).toBe(2);
      expect(result.fixturesWithoutGameweek).toBe(1);
      expect(result.unpublishedFixtures).toBe(1);
    });

    it('throws when season not found', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getSeasonFixtureValidation('nope')).rejects.toThrow(NotFoundException);
    });
  });

  // ── Conflict detection ──────────────────────────────────────────────────

  describe('getSeasonFixtureConflicts', () => {
    it('detects duplicate home/away on same day', async () => {
      prisma.season.findUnique.mockResolvedValue({ id: SEASON_ID });
      const kickoff = new Date('2026-09-06T15:00:00Z');
      prisma.fixture.findMany.mockResolvedValue([
        { id: 'f1', kickoffAt: kickoff, homeTeamId: TEAM_A, awayTeamId: TEAM_B, venueId: null, homeTeam: { name: 'A' }, awayTeam: { name: 'B' } },
        { id: 'f2', kickoffAt: kickoff, homeTeamId: TEAM_A, awayTeamId: TEAM_B, venueId: null, homeTeam: { name: 'A' }, awayTeam: { name: 'B' } },
      ]);
      const result = await service.getSeasonFixtureConflicts(SEASON_ID);
      expect(result.conflicts.some(c => c.type === 'DUPLICATE_FIXTURE')).toBe(true);
    });

    it('detects venue overlap at same kickoff', async () => {
      prisma.season.findUnique.mockResolvedValue({ id: SEASON_ID });
      const kickoff = new Date('2026-09-06T15:00:00Z');
      prisma.fixture.findMany.mockResolvedValue([
        { id: 'f1', kickoffAt: kickoff, homeTeamId: TEAM_A, awayTeamId: TEAM_B, venueId: 'v1', homeTeam: { name: 'A' }, awayTeam: { name: 'B' } },
        { id: 'f2', kickoffAt: kickoff, homeTeamId: 'c', awayTeamId: 'd', venueId: 'v1', homeTeam: { name: 'C' }, awayTeam: { name: 'D' } },
      ]);
      const result = await service.getSeasonFixtureConflicts(SEASON_ID);
      expect(result.conflicts.some(c => c.type === 'VENUE_OVERLAP')).toBe(true);
    });

    it('returns empty conflicts for valid schedule', async () => {
      prisma.season.findUnique.mockResolvedValue({ id: SEASON_ID });
      prisma.fixture.findMany.mockResolvedValue([]);
      const result = await service.getSeasonFixtureConflicts(SEASON_ID);
      expect(result.totalConflicts).toBe(0);
    });
  });

  // ── Gameweek readiness ──────────────────────────────────────────────────

  describe('getGameweekReadiness', () => {
    it('returns readiness summary', async () => {
      prisma.season.findUnique.mockResolvedValue({ id: SEASON_ID });
      prisma.fixture.findMany.mockResolvedValue([
        { id: 'f1', gameweekId: 'gw-1', kickoffAt: new Date('2026-09-06T15:00:00Z'), gameweek: { predictionDeadlineAt: new Date('2026-09-06T14:00:00Z'), transferDeadlineAt: new Date('2026-09-06T13:00:00Z') } },
        { id: 'f2', gameweekId: null, kickoffAt: new Date('2026-09-07T15:00:00Z'), gameweek: null },
      ]);
      prisma.gameweek.findMany.mockResolvedValue([{ id: 'gw-1' }]);
      const result = await service.getGameweekReadiness(SEASON_ID);
      expect(result.totalFixtures).toBe(2);
      expect(result.fixturesWithoutGameweek).toBe(1);
    });
  });

  // ── Publishing readiness ────────────────────────────────────────────────

  describe('getPublishingReadiness', () => {
    it('reports unpublished fixtures', async () => {
      prisma.season.findUnique.mockResolvedValue({ id: SEASON_ID, name: 'PSL 2026' });
      prisma.fixture.findMany.mockResolvedValue([
        { id: 'f1', isPublished: false, gameweekId: 'gw-1', venueId: 'v1' },
        { id: 'f2', isPublished: false, gameweekId: null, venueId: null },
      ]);
      prisma.fixtureImportBatch.findMany.mockResolvedValue([{ id: BATCH_ID }]);
      const result = await service.getPublishingReadiness(SEASON_ID);
      expect(result.unpublishedFixtures).toBe(2);
      expect(result.canPublish).toBe(true);
    });

    it('reports no fixtures as blocking error', async () => {
      prisma.season.findUnique.mockResolvedValue({ id: SEASON_ID, name: 'PSL 2026' });
      prisma.fixture.findMany.mockResolvedValue([]);
      prisma.fixtureImportBatch.findMany.mockResolvedValue([]);
      const result = await service.getPublishingReadiness(SEASON_ID);
      expect(result.canPublish).toBe(false);
      expect(result.blockingErrors.length).toBeGreaterThan(0);
    });
  });
});
