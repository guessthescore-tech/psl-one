import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FixtureImportBatchStatus,
  FixtureImportRowStatus,
  FixtureImportSource,
  FixtureStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddRowDto } from './dto/add-row.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateRowDto } from './dto/update-row.dto';

// Severity enum for validation items
export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ValidationItem {
  severity: ValidationSeverity;
  field?: string;
  message: string;
}

export interface RowValidationResult {
  rowId: string;
  rowNumber: number;
  status: FixtureImportRowStatus;
  errors: ValidationItem[];
  warnings: ValidationItem[];
}

export interface BatchValidationSummary {
  batchId: string;
  status: FixtureImportBatchStatus;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  canCommit: boolean;
  rowResults: RowValidationResult[];
}

export interface ConflictReport {
  seasonId: string;
  conflicts: ConflictItem[];
  totalConflicts: number;
}

export interface ConflictItem {
  type: string;
  severity: ValidationSeverity;
  description: string;
  fixtureIds: string[];
}

export interface GameweekReadiness {
  seasonId: string;
  totalFixtures: number;
  fixturesWithGameweek: number;
  fixturesWithoutGameweek: number;
  gameweeksCreated: number;
  deadlineWarnings: string[];
  lockTimingWarnings: string[];
}

export interface PublishingReadiness {
  seasonId: string;
  totalFixtures: number;
  publishedFixtures: number;
  unpublishedFixtures: number;
  batchesCommitted: number;
  blockingErrors: string[];
  warnings: string[];
  canPublish: boolean;
}

const BATCH_SELECT = {
  id: true,
  seasonId: true,
  source: true,
  status: true,
  label: true,
  fileName: true,
  sourceReference: true,
  importedByUserId: true,
  totalRows: true,
  validRows: true,
  warningRows: true,
  errorRows: true,
  committedRows: true,
  createdAt: true,
  updatedAt: true,
  validatedAt: true,
  committedAt: true,
  publishedAt: true,
  rejectedAt: true,
} as const;

const ROW_SELECT = {
  id: true,
  batchId: true,
  rowNumber: true,
  homeTeamRaw: true,
  awayTeamRaw: true,
  venueRaw: true,
  kickoffAtRaw: true,
  roundRaw: true,
  homeTeamId: true,
  awayTeamId: true,
  venueId: true,
  gameweekId: true,
  fixtureId: true,
  status: true,
  errorsJson: true,
  warningsJson: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class FixtureImportService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Batch CRUD ────────────────────────────────────────────────────────────

  async listBatches(seasonId?: string) {
    return this.prisma.fixtureImportBatch.findMany({
      ...(seasonId ? { where: { seasonId } } : {}),
      select: BATCH_SELECT,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createBatch(dto: CreateBatchDto, userId?: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: dto.seasonId },
      select: { id: true, slug: true },
    });
    if (!season) throw new NotFoundException(`Season '${dto.seasonId}' not found`);

    return this.prisma.fixtureImportBatch.create({
      data: {
        seasonId: dto.seasonId,
        source: dto.source ?? FixtureImportSource.MANUAL,
        label: dto.label ?? null,
        fileName: dto.fileName ?? null,
        sourceReference: dto.sourceReference ?? null,
        importedByUserId: userId ?? null,
      },
      select: BATCH_SELECT,
    });
  }

  async getBatch(batchId: string) {
    const batch = await this.prisma.fixtureImportBatch.findUnique({
      where: { id: batchId },
      select: { ...BATCH_SELECT, season: { select: { id: true, name: true, slug: true } } },
    });
    if (!batch) throw new NotFoundException(`Import batch '${batchId}' not found`);
    return batch;
  }

  async deleteBatch(batchId: string) {
    const batch = await this._requireBatch(batchId);
    if (batch.status === FixtureImportBatchStatus.COMMITTED || batch.status === FixtureImportBatchStatus.PUBLISHED) {
      throw new BadRequestException('Cannot delete a committed or published batch. Reject it first.');
    }
    await this.prisma.fixtureImportBatch.delete({ where: { id: batchId } });
    return { deleted: true };
  }

  // ── Row CRUD ──────────────────────────────────────────────────────────────

  async getBatchRows(batchId: string) {
    await this._requireBatch(batchId);
    return this.prisma.fixtureImportRow.findMany({
      where: { batchId },
      select: ROW_SELECT,
      orderBy: { rowNumber: 'asc' },
    });
  }

  async addRow(batchId: string, dto: AddRowDto) {
    const batch = await this._requireBatch(batchId);
    this._assertMutable(batch);

    const maxRow = await this.prisma.fixtureImportRow.aggregate({
      where: { batchId },
      _max: { rowNumber: true },
    });
    const nextRow = dto.rowNumber ?? ((maxRow._max.rowNumber ?? 0) + 1);

    const resolvedHomeTeamId = dto.homeTeamId ?? (dto.homeTeamRaw ? await this._resolveTeamId(dto.homeTeamRaw) : null);
    const resolvedAwayTeamId = dto.awayTeamId ?? (dto.awayTeamRaw ? await this._resolveTeamId(dto.awayTeamRaw) : null);
    const resolvedVenueId = dto.venueId ?? (dto.venueRaw ? await this._resolveVenueId(dto.venueRaw) : null);

    const row = await this.prisma.fixtureImportRow.create({
      data: {
        batchId,
        rowNumber: nextRow,
        rawDataJson: dto as unknown as Prisma.InputJsonValue,
        homeTeamRaw: dto.homeTeamRaw ?? null,
        awayTeamRaw: dto.awayTeamRaw ?? null,
        venueRaw: dto.venueRaw ?? null,
        kickoffAtRaw: dto.kickoffAtRaw,
        roundRaw: dto.roundRaw ?? null,
        homeTeamId: resolvedHomeTeamId ?? null,
        awayTeamId: resolvedAwayTeamId ?? null,
        venueId: resolvedVenueId ?? null,
        gameweekId: dto.gameweekId ?? null,
        status: FixtureImportRowStatus.PENDING,
      },
      select: ROW_SELECT,
    });

    await this._updateBatchCounts(batchId);
    return row;
  }

  async updateRow(batchId: string, rowId: string, dto: UpdateRowDto) {
    const batch = await this._requireBatch(batchId);
    this._assertMutable(batch);
    const row = await this.prisma.fixtureImportRow.findFirst({
      where: { id: rowId, batchId },
      select: { id: true },
    });
    if (!row) throw new NotFoundException(`Row '${rowId}' not found in batch '${batchId}'`);

    const resolvedHomeTeamId = dto.homeTeamId ?? (dto.homeTeamRaw ? await this._resolveTeamId(dto.homeTeamRaw) : undefined);
    const resolvedAwayTeamId = dto.awayTeamId ?? (dto.awayTeamRaw ? await this._resolveTeamId(dto.awayTeamRaw) : undefined);
    const resolvedVenueId = dto.venueId ?? (dto.venueRaw ? await this._resolveVenueId(dto.venueRaw) : undefined);

    return this.prisma.fixtureImportRow.update({
      where: { id: rowId },
      data: {
        rawDataJson: dto as unknown as Prisma.InputJsonValue,
        ...(dto.homeTeamRaw !== undefined ? { homeTeamRaw: dto.homeTeamRaw } : {}),
        ...(dto.awayTeamRaw !== undefined ? { awayTeamRaw: dto.awayTeamRaw } : {}),
        ...(dto.venueRaw !== undefined ? { venueRaw: dto.venueRaw } : {}),
        ...(dto.kickoffAtRaw !== undefined ? { kickoffAtRaw: dto.kickoffAtRaw } : {}),
        ...(dto.roundRaw !== undefined ? { roundRaw: dto.roundRaw } : {}),
        ...(resolvedHomeTeamId !== undefined ? { homeTeamId: resolvedHomeTeamId } : {}),
        ...(resolvedAwayTeamId !== undefined ? { awayTeamId: resolvedAwayTeamId } : {}),
        ...(resolvedVenueId !== undefined ? { venueId: resolvedVenueId } : {}),
        ...(dto.gameweekId !== undefined ? { gameweekId: dto.gameweekId } : {}),
        status: FixtureImportRowStatus.PENDING,
        errorsJson: Prisma.JsonNull,
        warningsJson: Prisma.JsonNull,
      },
      select: ROW_SELECT,
    });
  }

  async deleteRow(batchId: string, rowId: string) {
    const batch = await this._requireBatch(batchId);
    this._assertMutable(batch);
    const row = await this.prisma.fixtureImportRow.findFirst({
      where: { id: rowId, batchId },
      select: { id: true },
    });
    if (!row) throw new NotFoundException(`Row '${rowId}' not found in batch '${batchId}'`);
    await this.prisma.fixtureImportRow.delete({ where: { id: rowId } });
    await this._updateBatchCounts(batchId);
    return { deleted: true };
  }

  // ── Validation ────────────────────────────────────────────────────────────

  async validateBatch(batchId: string): Promise<BatchValidationSummary> {
    const batch = await this._requireBatch(batchId);
    if (batch.status === FixtureImportBatchStatus.COMMITTED || batch.status === FixtureImportBatchStatus.PUBLISHED) {
      throw new BadRequestException(`Batch '${batchId}' is already ${batch.status} and cannot be re-validated`);
    }

    await this.prisma.fixtureImportBatch.update({
      where: { id: batchId },
      data: { status: FixtureImportBatchStatus.VALIDATING },
    });

    const rows = await this.prisma.fixtureImportRow.findMany({
      where: { batchId },
      orderBy: { rowNumber: 'asc' },
    });

    const season = await this.prisma.season.findUnique({
      where: { id: batch.seasonId },
      select: { id: true, startDate: true, endDate: true, seasonTeams: { select: { teamId: true, status: true } } },
    });

    const rowResults: RowValidationResult[] = [];
    let validCount = 0;
    let warnCount = 0;
    let errorCount = 0;

    // Track seen combos for duplicate detection within batch
    const seenCombos = new Map<string, number>();

    for (const row of rows) {
      const errors: ValidationItem[] = [];
      const warnings: ValidationItem[] = [];

      const kickoffAt = row.kickoffAtRaw ? new Date(row.kickoffAtRaw) : null;

      // Required field checks
      if (!row.homeTeamId && !row.homeTeamRaw) {
        errors.push({ severity: 'ERROR', field: 'homeTeam', message: 'Home team is required' });
      }
      if (!row.awayTeamId && !row.awayTeamRaw) {
        errors.push({ severity: 'ERROR', field: 'awayTeam', message: 'Away team is required' });
      }
      if (!row.kickoffAtRaw) {
        errors.push({ severity: 'ERROR', field: 'kickoffAt', message: 'Kickoff date/time is required' });
      } else if (!kickoffAt || isNaN(kickoffAt.getTime())) {
        errors.push({ severity: 'ERROR', field: 'kickoffAt', message: `'${row.kickoffAtRaw}' is not a valid date` });
      }

      // Team equality check
      if (row.homeTeamId && row.awayTeamId && row.homeTeamId === row.awayTeamId) {
        errors.push({ severity: 'ERROR', field: 'teams', message: 'Home team and away team cannot be the same' });
      }

      // Team resolution (if raw name but no ID)
      let resolvedHomeId = row.homeTeamId;
      let resolvedAwayId = row.awayTeamId;

      if (!resolvedHomeId && row.homeTeamRaw) {
        resolvedHomeId = await this._resolveTeamId(row.homeTeamRaw);
        if (!resolvedHomeId) {
          errors.push({ severity: 'ERROR', field: 'homeTeam', message: `Team '${row.homeTeamRaw}' not found in database` });
        }
      }
      if (!resolvedAwayId && row.awayTeamRaw) {
        resolvedAwayId = await this._resolveTeamId(row.awayTeamRaw);
        if (!resolvedAwayId) {
          errors.push({ severity: 'ERROR', field: 'awayTeam', message: `Team '${row.awayTeamRaw}' not found in database` });
        }
      }

      // Season participation checks
      if (season && resolvedHomeId) {
        const participation = season.seasonTeams.find(st => st.teamId === resolvedHomeId);
        if (!participation) {
          errors.push({ severity: 'ERROR', field: 'homeTeam', message: `Home team is not registered in this season` });
        } else if (participation.status !== 'ACTIVE') {
          warnings.push({ severity: 'WARNING', field: 'homeTeam', message: `Home team participation status is '${participation.status}' (not ACTIVE)` });
        }
      }
      if (season && resolvedAwayId) {
        const participation = season.seasonTeams.find(st => st.teamId === resolvedAwayId);
        if (!participation) {
          errors.push({ severity: 'ERROR', field: 'awayTeam', message: `Away team is not registered in this season` });
        } else if (participation.status !== 'ACTIVE') {
          warnings.push({ severity: 'WARNING', field: 'awayTeam', message: `Away team participation status is '${participation.status}' (not ACTIVE)` });
        }
      }

      // Season date window check
      if (season && kickoffAt && !isNaN(kickoffAt.getTime())) {
        if (season.startDate && kickoffAt < season.startDate) {
          warnings.push({ severity: 'WARNING', field: 'kickoffAt', message: `Kickoff ${row.kickoffAtRaw} is before season start date` });
        }
        if (season.endDate && kickoffAt > season.endDate) {
          warnings.push({ severity: 'WARNING', field: 'kickoffAt', message: `Kickoff ${row.kickoffAtRaw} is after season end date` });
        }
      }

      // Venue check
      if (!row.venueId && !row.venueRaw) {
        warnings.push({ severity: 'WARNING', field: 'venue', message: 'Venue is not specified' });
      }

      // Gameweek check
      if (!row.gameweekId) {
        warnings.push({ severity: 'WARNING', field: 'gameweek', message: 'Gameweek not assigned' });
      } else {
        // Check gameweek deadline vs kickoff
        const gw = await this.prisma.gameweek.findUnique({
          where: { id: row.gameweekId },
          select: { transferDeadlineAt: true, predictionDeadlineAt: true },
        });
        if (gw && kickoffAt) {
          if (gw.predictionDeadlineAt > kickoffAt) {
            warnings.push({ severity: 'WARNING', field: 'gameweek', message: 'Prediction deadline is after fixture kickoff' });
          }
        }
      }

      // Duplicate detection within batch
      if (resolvedHomeId && resolvedAwayId && kickoffAt && !isNaN(kickoffAt.getTime())) {
        const combo = `${resolvedHomeId}|${resolvedAwayId}|${kickoffAt.toISOString()}`;
        if (seenCombos.has(combo)) {
          errors.push({ severity: 'ERROR', message: `Duplicate row in batch (same as row ${seenCombos.get(combo)})` });
        } else {
          seenCombos.set(combo, row.rowNumber);
        }
      }

      // Duplicate detection against existing DB fixtures
      if (resolvedHomeId && resolvedAwayId && kickoffAt && !isNaN(kickoffAt.getTime())) {
        const existing = await this.prisma.fixture.findFirst({
          where: {
            homeTeamId: resolvedHomeId,
            awayTeamId: resolvedAwayId,
            kickoffAt: kickoffAt,
          },
          select: { id: true },
        });
        if (existing) {
          warnings.push({ severity: 'WARNING', message: `A fixture with the same home team, away team, and kickoff already exists in the database (id: ${existing.id})` });
        }
      }

      // Determine row status
      let rowStatus: FixtureImportRowStatus;
      if (errors.length > 0) {
        rowStatus = FixtureImportRowStatus.ERROR;
        errorCount++;
      } else if (warnings.length > 0) {
        rowStatus = FixtureImportRowStatus.WARNING;
        warnCount++;
      } else {
        rowStatus = FixtureImportRowStatus.VALID;
        validCount++;
      }

      // Persist results
      await this.prisma.fixtureImportRow.update({
        where: { id: row.id },
        data: {
          status: rowStatus,
          homeTeamId: resolvedHomeId ?? row.homeTeamId,
          awayTeamId: resolvedAwayId ?? row.awayTeamId,
          errorsJson: errors.length > 0 ? (errors as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          warningsJson: warnings.length > 0 ? (warnings as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });

      rowResults.push({ rowId: row.id, rowNumber: row.rowNumber, status: rowStatus, errors, warnings });
    }

    const finalStatus = errorCount > 0
      ? FixtureImportBatchStatus.FAILED_VALIDATION
      : FixtureImportBatchStatus.VALIDATED;

    await this.prisma.fixtureImportBatch.update({
      where: { id: batchId },
      data: {
        status: finalStatus,
        totalRows: rows.length,
        validRows: validCount,
        warningRows: warnCount,
        errorRows: errorCount,
        validatedAt: new Date(),
      },
    });

    return {
      batchId,
      status: finalStatus,
      totalRows: rows.length,
      validRows: validCount,
      warningRows: warnCount,
      errorRows: errorCount,
      canCommit: errorCount === 0,
      rowResults,
    };
  }

  // ── Commit ────────────────────────────────────────────────────────────────

  async commitBatch(batchId: string) {
    const batch = await this._requireBatch(batchId);

    if (batch.status !== FixtureImportBatchStatus.VALIDATED) {
      throw new BadRequestException(`Batch must be in VALIDATED status to commit. Current status: ${batch.status}. Run validate first.`);
    }
    if (batch.errorRows > 0) {
      throw new BadRequestException(`Batch has ${batch.errorRows} rows with errors. Fix errors and re-validate before committing.`);
    }

    const rows = await this.prisma.fixtureImportRow.findMany({
      where: { batchId, status: { in: [FixtureImportRowStatus.VALID, FixtureImportRowStatus.WARNING] } },
    });

    let committed = 0;
    let skipped = 0;

    for (const row of rows) {
      if (!row.homeTeamId || !row.awayTeamId || !row.kickoffAtRaw) {
        await this.prisma.fixtureImportRow.update({
          where: { id: row.id },
          data: { status: FixtureImportRowStatus.SKIPPED },
        });
        skipped++;
        continue;
      }

      const kickoffAt = new Date(row.kickoffAtRaw);

      // Check for exact duplicate (idempotent)
      const existing = await this.prisma.fixture.findFirst({
        where: {
          homeTeamId: row.homeTeamId,
          awayTeamId: row.awayTeamId,
          kickoffAt,
          seasonId: batch.seasonId,
        },
        select: { id: true },
      });

      if (existing) {
        await this.prisma.fixtureImportRow.update({
          where: { id: row.id },
          data: { status: FixtureImportRowStatus.COMMITTED, fixtureId: existing.id },
        });
        skipped++;
        continue;
      }

      const fixture = await this.prisma.fixture.create({
        data: {
          seasonId: batch.seasonId,
          homeTeamId: row.homeTeamId,
          awayTeamId: row.awayTeamId,
          venueId: row.venueId ?? null,
          gameweekId: row.gameweekId ?? null,
          kickoffAt,
          status: FixtureStatus.SCHEDULED,
          round: row.roundRaw ?? null,
          source: 'fixture-import',
          isPublished: false,
          assignmentStatus: 'UNASSIGNED',
        },
        select: { id: true },
      });

      await this.prisma.fixtureImportRow.update({
        where: { id: row.id },
        data: { status: FixtureImportRowStatus.COMMITTED, fixtureId: fixture.id },
      });
      committed++;
    }

    await this.prisma.fixtureImportBatch.update({
      where: { id: batchId },
      data: {
        status: FixtureImportBatchStatus.COMMITTED,
        committedRows: committed,
        committedAt: new Date(),
      },
    });

    return { batchId, committed, skipped, status: FixtureImportBatchStatus.COMMITTED };
  }

  // ── Publish ───────────────────────────────────────────────────────────────

  async publishBatch(batchId: string) {
    const batch = await this._requireBatch(batchId);
    if (batch.status !== FixtureImportBatchStatus.COMMITTED) {
      throw new BadRequestException(`Batch must be COMMITTED before publishing. Current status: ${batch.status}`);
    }

    const rows = await this.prisma.fixtureImportRow.findMany({
      where: { batchId, status: FixtureImportRowStatus.COMMITTED, fixtureId: { not: null } },
      select: { fixtureId: true },
    });

    const fixtureIds = rows.map(r => r.fixtureId!);

    // Block publish if any linked fixtures have prediction or fantasy data
    const locked = await this.prisma.fixture.findFirst({
      where: {
        id: { in: fixtureIds },
        OR: [
          { predictions: { some: {} } },
          { fantasyLedger: { some: {} } },
          { events: { some: {} } },
        ],
      },
      select: { id: true },
    });
    if (locked) {
      throw new ConflictException(`Fixture '${locked.id}' already has predictions, fantasy data, or live events and cannot be republished safely.`);
    }

    await this.prisma.fixture.updateMany({
      where: { id: { in: fixtureIds } },
      data: { isPublished: true },
    });

    await this.prisma.fixtureImportBatch.update({
      where: { id: batchId },
      data: {
        status: FixtureImportBatchStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    return { batchId, published: fixtureIds.length, status: FixtureImportBatchStatus.PUBLISHED };
  }

  async rejectBatch(batchId: string) {
    const batch = await this._requireBatch(batchId);
    if (batch.status === FixtureImportBatchStatus.PUBLISHED) {
      throw new BadRequestException('Cannot reject an already published batch.');
    }
    await this.prisma.fixtureImportBatch.update({
      where: { id: batchId },
      data: { status: FixtureImportBatchStatus.REJECTED, rejectedAt: new Date() },
    });
    return { batchId, status: FixtureImportBatchStatus.REJECTED };
  }

  async getBatchSummary(batchId: string) {
    const batch = await this.getBatch(batchId);
    const rowsByStatus = await this.prisma.fixtureImportRow.groupBy({
      by: ['status'],
      where: { batchId },
      _count: { id: true },
    });
    return {
      ...batch,
      rowsByStatus: rowsByStatus.map(r => ({ status: r.status, count: r._count.id })),
    };
  }

  // ── Season-level validation ───────────────────────────────────────────────

  async getSeasonFixtureValidation(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true, slug: true, startDate: true, endDate: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const fixtures = await this.prisma.fixture.findMany({
      where: { seasonId },
      select: {
        id: true,
        kickoffAt: true,
        status: true,
        gameweekId: true,
        venueId: true,
        isPublished: true,
        homeTeam: { select: { id: true, name: true, slug: true } },
        awayTeam: { select: { id: true, name: true, slug: true } },
      },
    });

    const issues: ValidationItem[] = [];
    const noGameweek = fixtures.filter(f => !f.gameweekId);
    const noVenue = fixtures.filter(f => !f.venueId);
    const unpublished = fixtures.filter(f => !f.isPublished);

    if (noGameweek.length > 0) {
      issues.push({ severity: 'WARNING', message: `${noGameweek.length} fixture(s) have no gameweek assigned` });
    }
    if (noVenue.length > 0) {
      issues.push({ severity: 'WARNING', message: `${noVenue.length} fixture(s) have no venue assigned` });
    }
    if (unpublished.length > 0) {
      issues.push({ severity: 'INFO', message: `${unpublished.length} fixture(s) are staged but not yet published` });
    }

    return {
      seasonId,
      seasonName: season.name,
      totalFixtures: fixtures.length,
      publishedFixtures: fixtures.length - unpublished.length,
      unpublishedFixtures: unpublished.length,
      fixturesWithGameweek: fixtures.length - noGameweek.length,
      fixturesWithoutGameweek: noGameweek.length,
      fixturesWithVenue: fixtures.length - noVenue.length,
      fixturesWithoutVenue: noVenue.length,
      issues,
    };
  }

  // ── Conflict detection ────────────────────────────────────────────────────

  async getSeasonFixtureConflicts(seasonId: string): Promise<ConflictReport> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const fixtures = await this.prisma.fixture.findMany({
      where: { seasonId },
      select: {
        id: true,
        kickoffAt: true,
        homeTeamId: true,
        awayTeamId: true,
        venueId: true,
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
      },
      orderBy: { kickoffAt: 'asc' },
    });

    const conflicts: ConflictItem[] = [];
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    // Same home/away on same day (duplicate)
    const seenPairs = new Map<string, string>();
    for (const f of fixtures) {
      const key = `${f.homeTeamId}|${f.awayTeamId}|${f.kickoffAt.toISOString().slice(0, 10)}`;
      if (seenPairs.has(key)) {
        conflicts.push({
          type: 'DUPLICATE_FIXTURE',
          severity: 'ERROR',
          description: `${f.homeTeam.name} vs ${f.awayTeam.name} appears more than once on ${f.kickoffAt.toISOString().slice(0, 10)}`,
          fixtureIds: [seenPairs.get(key)!, f.id],
        });
      } else {
        seenPairs.set(key, f.id);
      }
    }

    // Team schedule overlap (same team within 2 hours)
    const teamLastFixture = new Map<string, { kickoffAt: Date; fixtureId: string; name: string }>();
    for (const f of fixtures) {
      for (const [teamId, teamName] of [[f.homeTeamId, f.homeTeam.name], [f.awayTeamId, f.awayTeam.name]] as [string, string][]) {
        const last = teamLastFixture.get(teamId);
        if (last && Math.abs(f.kickoffAt.getTime() - last.kickoffAt.getTime()) < TWO_HOURS) {
          conflicts.push({
            type: 'TEAM_SCHEDULE_OVERLAP',
            severity: 'ERROR',
            description: `${teamName} has overlapping fixtures within 2 hours`,
            fixtureIds: [last.fixtureId, f.id],
          });
        }
        teamLastFixture.set(teamId, { kickoffAt: f.kickoffAt, fixtureId: f.id, name: teamName });
      }
    }

    // Venue overlap (same venue, same time)
    const venueFixtures = new Map<string, { kickoffAt: Date; fixtureId: string }>();
    for (const f of fixtures) {
      if (!f.venueId) continue;
      const key = `${f.venueId}|${f.kickoffAt.toISOString()}`;
      if (venueFixtures.has(key)) {
        conflicts.push({
          type: 'VENUE_OVERLAP',
          severity: 'ERROR',
          description: `Venue used by multiple fixtures at the same time`,
          fixtureIds: [venueFixtures.get(key)!.fixtureId, f.id],
        });
      } else {
        venueFixtures.set(key, { kickoffAt: f.kickoffAt, fixtureId: f.id });
      }
    }

    return { seasonId, conflicts, totalConflicts: conflicts.length };
  }

  // ── Gameweek readiness ────────────────────────────────────────────────────

  async getGameweekReadiness(seasonId: string): Promise<GameweekReadiness> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [fixtures, gameweeks] = await Promise.all([
      this.prisma.fixture.findMany({
        where: { seasonId },
        select: { id: true, gameweekId: true, kickoffAt: true, gameweek: { select: { predictionDeadlineAt: true, transferDeadlineAt: true } } },
      }),
      this.prisma.gameweek.findMany({ where: { seasonId }, select: { id: true } }),
    ]);

    const noGameweek = fixtures.filter(f => !f.gameweekId);
    const deadlineWarnings: string[] = [];
    const lockTimingWarnings: string[] = [];

    for (const f of fixtures) {
      if (f.gameweek) {
        if (f.gameweek.predictionDeadlineAt > f.kickoffAt) {
          deadlineWarnings.push(`Fixture ${f.id}: prediction deadline is after kickoff`);
        }
        if (f.gameweek.transferDeadlineAt > f.kickoffAt) {
          lockTimingWarnings.push(`Fixture ${f.id}: transfer deadline is after kickoff`);
        }
      }
    }

    return {
      seasonId,
      totalFixtures: fixtures.length,
      fixturesWithGameweek: fixtures.length - noGameweek.length,
      fixturesWithoutGameweek: noGameweek.length,
      gameweeksCreated: gameweeks.length,
      deadlineWarnings,
      lockTimingWarnings,
    };
  }

  async autoCreateGameweeks(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, slug: true, startDate: true, endDate: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    // Find all distinct rounds among fixtures that have no gameweek
    const fixtures = await this.prisma.fixture.findMany({
      where: { seasonId, gameweekId: null, round: { not: null } },
      select: { id: true, round: true, kickoffAt: true },
      orderBy: { kickoffAt: 'asc' },
    });

    const roundMap = new Map<string, { kickoffs: Date[]; fixtureIds: string[] }>();
    for (const f of fixtures) {
      if (!f.round) continue;
      const entry = roundMap.get(f.round) ?? { kickoffs: [], fixtureIds: [] };
      entry.kickoffs.push(f.kickoffAt);
      entry.fixtureIds.push(f.id);
      roundMap.set(f.round, entry);
    }

    let created = 0;
    let assigned = 0;

    for (const [round, data] of roundMap.entries()) {
      const roundNum = parseInt(round.replace(/\D/g, ''), 10) || 0;
      const earliest = data.kickoffs.reduce((a, b) => (a < b ? a : b));
      const latest = data.kickoffs.reduce((a, b) => (a > b ? a : b));
      const deadline = new Date(earliest.getTime() - 60 * 60 * 1000); // 1h before earliest kickoff

      const slug = `${season.slug}-gw-${roundNum || round.toLowerCase().replace(/\s+/g, '-')}`;
      const name = `Matchday ${roundNum || round}`;

      const existing = await this.prisma.gameweek.findFirst({ where: { seasonId, slug }, select: { id: true } });
      const gw = existing ?? await this.prisma.gameweek.create({
        data: {
          seasonId,
          name,
          slug,
          round: roundNum,
          startsAt: earliest,
          endsAt: new Date(latest.getTime() + 2 * 60 * 60 * 1000),
          transferDeadlineAt: deadline,
          predictionDeadlineAt: deadline,
          source: 'fixture-import-auto',
        },
        select: { id: true },
      });

      if (!existing) created++;

      await this.prisma.fixture.updateMany({
        where: { id: { in: data.fixtureIds } },
        data: { gameweekId: gw.id },
      });
      assigned += data.fixtureIds.length;
    }

    return { seasonId, roundsProcessed: roundMap.size, gameweeksCreated: created, fixturesAssigned: assigned };
  }

  async assignFixturesByRound(seasonId: string) {
    return this.autoCreateGameweeks(seasonId);
  }

  // ── Publishing readiness ──────────────────────────────────────────────────

  async getPublishingReadiness(seasonId: string): Promise<PublishingReadiness> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [fixtures, batches] = await Promise.all([
      this.prisma.fixture.findMany({
        where: { seasonId },
        select: { id: true, isPublished: true, gameweekId: true, venueId: true },
      }),
      this.prisma.fixtureImportBatch.findMany({
        where: { seasonId, status: FixtureImportBatchStatus.COMMITTED },
        select: { id: true },
      }),
    ]);

    const unpublished = fixtures.filter(f => !f.isPublished);
    const noGameweek = fixtures.filter(f => !f.gameweekId);
    const blockingErrors: string[] = [];
    const warnings: string[] = [];

    if (fixtures.length === 0) {
      blockingErrors.push('No fixtures exist for this season. Import and commit fixtures first.');
    }
    if (noGameweek.length > 0) {
      warnings.push(`${noGameweek.length} fixture(s) have no gameweek — they will be published without gameweek links`);
    }

    return {
      seasonId,
      totalFixtures: fixtures.length,
      publishedFixtures: fixtures.length - unpublished.length,
      unpublishedFixtures: unpublished.length,
      batchesCommitted: batches.length,
      blockingErrors,
      warnings,
      canPublish: blockingErrors.length === 0 && unpublished.length > 0,
    };
  }

  async publishProvisionalFixtures(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const result = await this.prisma.fixture.updateMany({
      where: { seasonId, isPublished: false },
      data: { isPublished: true },
    });

    return { seasonId, published: result.count };
  }

  async unpublishProvisionalFixtures(seasonId: string) {
    // Only unpublish fixtures that have no predictions, fantasy, or live events
    const safeToUnpublish = await this.prisma.fixture.findMany({
      where: {
        seasonId,
        isPublished: true,
        predictions: { none: {} },
        fantasyLedger: { none: {} },
        events: { none: {} },
      },
      select: { id: true },
    });

    if (safeToUnpublish.length === 0) {
      return { seasonId, unpublished: 0, note: 'No safe fixtures to unpublish' };
    }

    await this.prisma.fixture.updateMany({
      where: { id: { in: safeToUnpublish.map(f => f.id) } },
      data: { isPublished: false },
    });

    return { seasonId, unpublished: safeToUnpublish.length };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async _requireBatch(batchId: string) {
    const batch = await this.prisma.fixtureImportBatch.findUnique({
      where: { id: batchId },
      select: { id: true, seasonId: true, status: true, errorRows: true },
    });
    if (!batch) throw new NotFoundException(`Import batch '${batchId}' not found`);
    return batch;
  }

  private _assertMutable(batch: { status: FixtureImportBatchStatus }) {
    const immutable: FixtureImportBatchStatus[] = [
      FixtureImportBatchStatus.COMMITTED,
      FixtureImportBatchStatus.PUBLISHED,
      FixtureImportBatchStatus.REJECTED,
    ];
    if (immutable.includes(batch.status)) {
      throw new BadRequestException(`Batch in status '${batch.status}' cannot be modified`);
    }
  }

  private async _resolveTeamId(nameOrSlug: string): Promise<string | null> {
    const team = await this.prisma.team.findFirst({
      where: { OR: [{ name: nameOrSlug }, { slug: nameOrSlug }, { shortName: nameOrSlug }, { externalId: nameOrSlug }] },
      select: { id: true },
    });
    return team?.id ?? null;
  }

  private async _resolveVenueId(nameOrCity: string): Promise<string | null> {
    const venue = await this.prisma.venue.findFirst({
      where: { OR: [{ name: nameOrCity }, { externalId: nameOrCity }] },
      select: { id: true },
    });
    return venue?.id ?? null;
  }

  private async _updateBatchCounts(batchId: string) {
    const counts = await this.prisma.fixtureImportRow.groupBy({
      by: ['status'],
      where: { batchId },
      _count: { id: true },
    });
    const total = counts.reduce((s, c) => s + c._count.id, 0);
    const valid = counts.find(c => c.status === FixtureImportRowStatus.VALID)?._count.id ?? 0;
    const warn = counts.find(c => c.status === FixtureImportRowStatus.WARNING)?._count.id ?? 0;
    const error = counts.find(c => c.status === FixtureImportRowStatus.ERROR)?._count.id ?? 0;
    await this.prisma.fixtureImportBatch.update({
      where: { id: batchId },
      data: { totalRows: total, validRows: valid, warningRows: warn, errorRows: error },
    });
  }
}
