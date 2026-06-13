import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PlayerPosition,
  SquadImportBatchStatus,
  SquadImportBatchSourceType,
  SquadImportRowValidationStatus,
  SquadRegistrationStatus,
  SquadRegistrationSource,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ImportRowInput {
  teamId?: string;
  playerName: string;
  displayName?: string;
  position: string;
  shirtNumber?: number;
  nationality?: string;
  dateOfBirth?: string;
  fantasyPrice?: number;
}

export interface CreateManualBatchDto {
  sourceType?: SquadImportBatchSourceType;
  notes?: string;
  rows: ImportRowInput[];
}

type ValidationMessage = { code: string; severity: 'BLOCKER' | 'WARNING' | 'INFO'; message: string };

const VALID_POSITIONS = Object.values(PlayerPosition) as string[];

@Injectable()
export class SquadImportService {
  constructor(private readonly prisma: PrismaService) {}

  async getImportSeasons() {
    const seasons = await this.prisma.season.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: { select: { squadImportBatches: true, squadRegistrations: true } },
      },
    });

    return seasons.map(s => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      isActive: s.isActive,
      status: s.status,
      importBatchCount: s._count.squadImportBatches,
      squadRegistrationCount: s._count.squadRegistrations,
    }));
  }

  async getImportOverview(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const [batches, totalRegistrations, confirmedRegistrations, teamCount] = await Promise.all([
      this.prisma.squadImportBatch.findMany({
        where: { seasonId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, status: true, totalRows: true, importedRows: true, publishedRows: true, createdAt: true },
      }),
      this.prisma.seasonSquadRegistration.count({ where: { seasonId } }),
      this.prisma.seasonSquadRegistration.count({ where: { seasonId, status: SquadRegistrationStatus.CONFIRMED } }),
      this.prisma.seasonTeam.count({ where: { seasonId } }),
    ]);

    const latestBatch = batches[0] ?? null;

    return {
      seasonId,
      seasonName: season.name,
      teamCount,
      totalRegistrations,
      confirmedRegistrations,
      provisionalRegistrations: totalRegistrations - confirmedRegistrations,
      latestBatchStatus: latestBatch?.status ?? null,
      latestBatchImportedRows: latestBatch?.importedRows ?? 0,
      recentBatches: batches,
    };
  }

  async listBatches(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    return this.prisma.squadImportBatch.findMany({
      where: { seasonId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBatch(seasonId: string, batchId: string) {
    const batch = await this.prisma.squadImportBatch.findFirst({
      where: { id: batchId, seasonId },
      include: { _count: { select: { rows: true } } },
    });
    if (!batch) throw new NotFoundException(`Batch ${batchId} not found for season ${seasonId}`);
    return batch;
  }

  async listRows(seasonId: string, batchId: string) {
    await this.getBatch(seasonId, batchId);
    return this.prisma.squadImportRow.findMany({
      where: { batchId },
      orderBy: { rowNumber: 'asc' },
    });
  }

  async createManualBatch(seasonId: string, dto: CreateManualBatchDto, actorUserId?: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    if (!dto.rows || dto.rows.length === 0) {
      throw new BadRequestException('At least one row is required');
    }

    const batch = await this.prisma.squadImportBatch.create({
      data: {
        seasonId,
        sourceType: dto.sourceType ?? SquadImportBatchSourceType.MANUAL,
        notes: dto.notes ?? null,
        status: SquadImportBatchStatus.DRAFT,
        totalRows: dto.rows.length,
        createdByUserId: actorUserId ?? null,
      },
    });

    const rowCreates = dto.rows.map((row, idx) =>
      this.prisma.squadImportRow.create({
        data: {
          batchId: batch.id,
          rowNumber: idx + 1,
          seasonId,
          teamId: row.teamId ?? null,
          proposedPlayerName: row.playerName,
          proposedDisplayName: row.displayName ?? null,
          proposedPosition: row.position,
          proposedShirtNumber: row.shirtNumber ?? null,
          proposedNationality: row.nationality ?? null,
          proposedDateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
          proposedFantasyPrice: row.fantasyPrice ?? null,
          rawData: row as unknown as Prisma.InputJsonValue,
          validationStatus: SquadImportRowValidationStatus.PENDING,
        },
      }),
    );
    await Promise.all(rowCreates);

    await this.writeAuditLog('SQUAD_IMPORT_BATCH_CREATED', 'SquadImportBatch', batch.id, actorUserId, {
      seasonId,
      totalRows: dto.rows.length,
      sourceType: batch.sourceType,
    });

    return batch;
  }

  async validateBatch(seasonId: string, batchId: string, actorUserId?: string) {
    const batch = await this.getBatch(seasonId, batchId);

    if (batch.status === SquadImportBatchStatus.CANCELLED) {
      throw new BadRequestException('Cannot validate a cancelled batch');
    }
    if (batch.status === SquadImportBatchStatus.PUBLISHED) {
      throw new BadRequestException('Batch already published');
    }

    const rows = await this.prisma.squadImportRow.findMany({ where: { batchId } });

    // Load season teams for validation
    const seasonTeams = await this.prisma.seasonTeam.findMany({
      where: { seasonId },
      select: { teamId: true },
    });
    const validTeamIds = new Set(seasonTeams.map(st => st.teamId));

    // Load rules config for price bounds
    const rulesConfig = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId } });
    const minPrice = rulesConfig?.minPrice ?? 40;
    const maxPrice = rulesConfig?.maxPrice ?? 200;

    let validCount = 0;
    let warningCount = 0;
    let blockedCount = 0;

    for (const row of rows) {
      const messages: ValidationMessage[] = [];
      let hasBlocker = false;
      let hasWarning = false;

      // Validate position
      const pos = row.proposedPosition.toUpperCase();
      if (!VALID_POSITIONS.includes(pos)) {
        messages.push({ code: 'INVALID_POSITION', severity: 'BLOCKER', message: `Position '${row.proposedPosition}' is not valid. Must be one of: ${VALID_POSITIONS.join(', ')}` });
        hasBlocker = true;
      }

      // Validate team
      if (!row.teamId) {
        messages.push({ code: 'MISSING_TEAM', severity: 'BLOCKER', message: 'No teamId provided — cannot link player to a team' });
        hasBlocker = true;
      } else if (!validTeamIds.has(row.teamId)) {
        messages.push({ code: 'TEAM_NOT_IN_SEASON', severity: 'BLOCKER', message: `Team ${row.teamId} is not registered to season ${seasonId}` });
        hasBlocker = true;
      }

      // Validate player name
      if (!row.proposedPlayerName || row.proposedPlayerName.trim().length === 0) {
        messages.push({ code: 'MISSING_PLAYER_NAME', severity: 'BLOCKER', message: 'Player name is required' });
        hasBlocker = true;
      }

      // Validate fantasy price if provided
      if (row.proposedFantasyPrice !== null && row.proposedFantasyPrice !== undefined) {
        if (row.proposedFantasyPrice < minPrice) {
          messages.push({ code: 'PRICE_BELOW_MINIMUM', severity: 'BLOCKER', message: `Fantasy price ${row.proposedFantasyPrice} is below minimum ${minPrice}` });
          hasBlocker = true;
        } else if (row.proposedFantasyPrice > maxPrice) {
          messages.push({ code: 'PRICE_ABOVE_MAXIMUM', severity: 'BLOCKER', message: `Fantasy price ${row.proposedFantasyPrice} is above maximum ${maxPrice}` });
          hasBlocker = true;
        }
      } else {
        messages.push({ code: 'MISSING_FANTASY_PRICE', severity: 'WARNING', message: 'No fantasy price provided — will use default price if bulk-applying' });
        hasWarning = true;
      }

      // Duplicate detection — normalised name + teamId
      if (row.teamId && row.proposedPlayerName) {
        const duplicates = await this.findDuplicatePlayers(row.proposedPlayerName, row.teamId);
        if (duplicates.length > 0) {
          const existing = await this.prisma.seasonSquadRegistration.findFirst({
            where: { seasonId, playerId: { in: duplicates.map(d => d.id) } },
          });
          if (existing) {
            messages.push({ code: 'DUPLICATE_ACTIVE_REGISTRATION', severity: 'BLOCKER', message: `Player already has an active squad registration for this season (playerId: ${existing.playerId})` });
            hasBlocker = true;
          } else {
            messages.push({ code: 'POSSIBLE_DUPLICATE_PLAYER', severity: 'WARNING', message: `Found ${duplicates.length} possible duplicate player(s) with similar name` });
            hasWarning = true;
            await this.prisma.squadImportRow.update({
              where: { id: row.id },
              data: { duplicatePlayerIds: duplicates.map(d => d.id) as unknown as Prisma.InputJsonValue },
            });
          }
        }
      }

      // Optional warnings
      if (!row.proposedShirtNumber) {
        messages.push({ code: 'MISSING_SHIRT_NUMBER', severity: 'WARNING', message: 'Shirt number not provided' });
        hasWarning = true;
      }
      if (!row.proposedNationality) {
        messages.push({ code: 'MISSING_NATIONALITY', severity: 'WARNING', message: 'Nationality not provided' });
        hasWarning = true;
      }

      const status = hasBlocker
        ? SquadImportRowValidationStatus.BLOCKED
        : hasWarning
          ? SquadImportRowValidationStatus.WARNING
          : SquadImportRowValidationStatus.VALID;

      await this.prisma.squadImportRow.update({
        where: { id: row.id },
        data: {
          validationStatus: status,
          validationMessages: messages as unknown as Prisma.InputJsonValue,
          isImportable: !hasBlocker,
        },
      });

      if (hasBlocker) blockedCount++;
      else if (hasWarning) warningCount++;
      else validCount++;
    }

    const batchStatus = blockedCount > 0
      ? SquadImportBatchStatus.BLOCKED
      : warningCount > 0
        ? SquadImportBatchStatus.HAS_WARNINGS
        : SquadImportBatchStatus.VALIDATED;

    const updated = await this.prisma.squadImportBatch.update({
      where: { id: batchId },
      data: {
        status: batchStatus,
        validRows: validCount,
        warningRows: warningCount,
        blockedRows: blockedCount,
        validatedAt: new Date(),
      },
    });

    await this.writeAuditLog('SQUAD_IMPORT_BATCH_VALIDATED', 'SquadImportBatch', batchId, actorUserId, {
      seasonId,
      validRows: validCount,
      warningRows: warningCount,
      blockedRows: blockedCount,
      status: batchStatus,
    });

    return updated;
  }

  async importBatch(seasonId: string, batchId: string, actorUserId?: string) {
    const batch = await this.getBatch(seasonId, batchId);

    if (batch.status === SquadImportBatchStatus.BLOCKED) {
      throw new BadRequestException('Cannot import a BLOCKED batch — resolve all blockers first');
    }
    if (batch.status === SquadImportBatchStatus.DRAFT || batch.status === SquadImportBatchStatus.CANCELLED) {
      throw new BadRequestException(`Batch must be VALIDATED or HAS_WARNINGS before import (current: ${batch.status})`);
    }
    if (batch.status === SquadImportBatchStatus.PUBLISHED) {
      throw new BadRequestException('Batch already published');
    }

    const rows = await this.prisma.squadImportRow.findMany({
      where: { batchId, isImportable: true },
    });

    let importedCount = 0;

    for (const row of rows) {
      if (!row.teamId) continue;

      // Find or create player
      let playerId = row.matchedPlayerId ?? row.importedPlayerId;

      if (!playerId) {
        // Check if player already exists (by name + teamId)
        const existingPlayer = await this.prisma.player.findFirst({
          where: {
            name: row.proposedPlayerName,
            teamId: row.teamId,
          },
        });

        if (existingPlayer) {
          playerId = existingPlayer.id;
        } else {
          // Create new player record
          const pos = row.proposedPosition.toUpperCase() as PlayerPosition;
          const newPlayer = await this.prisma.player.create({
            data: {
              teamId: row.teamId,
              name: row.proposedPlayerName,
              position: pos,
              nationality: row.proposedNationality ?? 'Unknown',
              dateOfBirth: row.proposedDateOfBirth ?? null,
              number: row.proposedShirtNumber ?? null,
              source: 'squad_import',
              importedAt: new Date(),
            },
          });
          playerId = newPlayer.id;

          await this.writeAuditLog('PLAYER_CREATED_FROM_IMPORT', 'Player', playerId, actorUserId, {
            seasonId,
            batchId,
            teamId: row.teamId,
            playerName: row.proposedPlayerName,
          });
        }
      }

      // Create or update season squad registration (idempotent)
      const existing = await this.prisma.seasonSquadRegistration.findUnique({
        where: { seasonId_playerId: { seasonId, playerId } },
      });

      if (!existing) {
        const reg = await this.prisma.seasonSquadRegistration.create({
          data: {
            seasonId,
            teamId: row.teamId,
            playerId,
            status: SquadRegistrationStatus.PROVISIONAL,
            shirtNumber: row.proposedShirtNumber ?? null,
            source: SquadRegistrationSource.IMPORT,
            registeredAt: new Date(),
          },
        });

        await this.prisma.squadImportRow.update({
          where: { id: row.id },
          data: {
            importedPlayerId: playerId,
            importedRegistrationId: reg.id,
            validationStatus: SquadImportRowValidationStatus.IMPORTED,
          },
        });

        await this.writeAuditLog('SQUAD_REGISTRATION_CREATED', 'SeasonSquadRegistration', reg.id, actorUserId, {
          seasonId,
          batchId,
          playerId,
          teamId: row.teamId,
        });

        // Set fantasy price if provided and valid
        if (row.proposedFantasyPrice !== null && row.proposedFantasyPrice !== undefined) {
          await this.prisma.fantasyPlayerPrice.upsert({
            where: { playerId_seasonId: { playerId, seasonId } },
            create: { playerId, seasonId, price: row.proposedFantasyPrice },
            update: {},
          });
          await this.prisma.fantasyPlayerPriceHistory.create({
            data: { playerId, seasonId, price: row.proposedFantasyPrice, reason: 'SQUAD_IMPORT' },
          });
        }

        importedCount++;
      } else {
        // Already registered — mark row as skipped/imported
        await this.prisma.squadImportRow.update({
          where: { id: row.id },
          data: {
            importedPlayerId: playerId,
            importedRegistrationId: existing.id,
            validationStatus: SquadImportRowValidationStatus.IMPORTED,
          },
        });
        importedCount++;
      }
    }

    const updated = await this.prisma.squadImportBatch.update({
      where: { id: batchId },
      data: {
        status: SquadImportBatchStatus.IMPORTED,
        importedRows: importedCount,
        importedAt: new Date(),
      },
    });

    await this.writeAuditLog('SQUAD_IMPORT_BATCH_IMPORTED', 'SquadImportBatch', batchId, actorUserId, {
      seasonId,
      importedRows: importedCount,
    });

    return updated;
  }

  async publishBatch(seasonId: string, batchId: string, actorUserId?: string) {
    const batch = await this.getBatch(seasonId, batchId);

    if (batch.status !== SquadImportBatchStatus.IMPORTED) {
      throw new BadRequestException(`Batch must be IMPORTED before publishing (current: ${batch.status})`);
    }

    // Promote all PROVISIONAL registrations linked to this batch to CONFIRMED
    const rows = await this.prisma.squadImportRow.findMany({
      where: { batchId, importedRegistrationId: { not: null } },
    });

    let publishedCount = 0;
    for (const row of rows) {
      if (!row.importedRegistrationId) continue;
      const reg = await this.prisma.seasonSquadRegistration.findUnique({
        where: { id: row.importedRegistrationId },
      });
      if (reg && reg.status === SquadRegistrationStatus.PROVISIONAL) {
        await this.prisma.seasonSquadRegistration.update({
          where: { id: reg.id },
          data: { status: SquadRegistrationStatus.CONFIRMED },
        });

        await this.writeAuditLog('SQUAD_REGISTRATION_PUBLISHED', 'SeasonSquadRegistration', reg.id, actorUserId, {
          seasonId,
          batchId,
          playerId: reg.playerId,
          teamId: reg.teamId,
        });

        publishedCount++;
      }
    }

    const updated = await this.prisma.squadImportBatch.update({
      where: { id: batchId },
      data: {
        status: SquadImportBatchStatus.PUBLISHED,
        publishedRows: publishedCount,
        publishedAt: new Date(),
      },
    });

    await this.writeAuditLog('SQUAD_IMPORT_BATCH_PUBLISHED', 'SquadImportBatch', batchId, actorUserId, {
      seasonId,
      publishedRows: publishedCount,
    });

    return updated;
  }

  async cancelBatch(seasonId: string, batchId: string, actorUserId?: string) {
    const batch = await this.getBatch(seasonId, batchId);

    if (batch.status === SquadImportBatchStatus.PUBLISHED) {
      throw new BadRequestException('Cannot cancel a published batch');
    }
    if (batch.status === SquadImportBatchStatus.CANCELLED) {
      throw new BadRequestException('Batch is already cancelled');
    }

    const updated = await this.prisma.squadImportBatch.update({
      where: { id: batchId },
      data: { status: SquadImportBatchStatus.CANCELLED, cancelledAt: new Date() },
    });

    await this.writeAuditLog('SQUAD_IMPORT_BATCH_CANCELLED', 'SquadImportBatch', batchId, actorUserId, { seasonId });

    return updated;
  }

  async getDuplicates(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const rows = await this.prisma.squadImportRow.findMany({
      where: { seasonId, duplicatePlayerIds: { not: Prisma.JsonNull } },
      select: { id: true, proposedPlayerName: true, teamId: true, duplicatePlayerIds: true, validationStatus: true },
    });

    return {
      seasonId,
      seasonName: season.name,
      duplicateCount: rows.length,
      rows,
    };
  }

  async getReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const [teamCount, totalRegistrations, confirmedRegistrations, latestBatch] = await Promise.all([
      this.prisma.seasonTeam.count({ where: { seasonId } }),
      this.prisma.seasonSquadRegistration.count({ where: { seasonId } }),
      this.prisma.seasonSquadRegistration.count({ where: { seasonId, status: SquadRegistrationStatus.CONFIRMED } }),
      this.prisma.squadImportBatch.findFirst({
        where: { seasonId },
        orderBy: { createdAt: 'desc' },
        select: { status: true, blockedRows: true, totalRows: true },
      }),
    ]);

    const checks: Array<{ code: string; severity: 'BLOCKER' | 'WARNING' | 'INFO'; passed: boolean; message: string }> = [];

    checks.push({
      code: 'TEAMS_REGISTERED',
      severity: teamCount >= 2 ? 'INFO' : 'BLOCKER',
      passed: teamCount >= 2,
      message: teamCount >= 2 ? `${teamCount} teams registered` : 'No teams registered — import teams before squad data',
    });

    checks.push({
      code: 'SQUAD_REGISTRATIONS_EXIST',
      severity: 'WARNING',
      passed: totalRegistrations > 0,
      message: totalRegistrations > 0 ? `${totalRegistrations} squad registrations (${confirmedRegistrations} confirmed)` : 'No squad registrations — run squad import',
    });

    checks.push({
      code: 'CONFIRMED_REGISTRATIONS',
      severity: 'WARNING',
      passed: confirmedRegistrations > 0,
      message: confirmedRegistrations > 0 ? `${confirmedRegistrations} confirmed registrations` : 'No confirmed registrations — publish an import batch',
    });

    if (latestBatch) {
      checks.push({
        code: 'LATEST_BATCH_NOT_BLOCKED',
        severity: 'WARNING',
        passed: latestBatch.status !== SquadImportBatchStatus.BLOCKED,
        message: latestBatch.status !== SquadImportBatchStatus.BLOCKED
          ? `Latest batch status: ${latestBatch.status}`
          : `Latest batch is BLOCKED (${latestBatch.blockedRows} blocked rows)`,
      });
    }

    const blockers = checks.filter(c => c.severity === 'BLOCKER' && !c.passed);
    const warnings = checks.filter(c => c.severity === 'WARNING' && !c.passed);

    return {
      seasonId,
      seasonName: season.name,
      readinessStatus: blockers.length > 0 ? 'BLOCKED' : warnings.length > 0 ? 'READY_WITH_WARNINGS' : 'READY',
      checks,
      blockerCount: blockers.length,
      warningCount: warnings.length,
    };
  }

  async getActivationImpact(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const [totalRegistrations, confirmedRegistrations, batchCount, latestBatch] = await Promise.all([
      this.prisma.seasonSquadRegistration.count({ where: { seasonId } }),
      this.prisma.seasonSquadRegistration.count({ where: { seasonId, status: SquadRegistrationStatus.CONFIRMED } }),
      this.prisma.squadImportBatch.count({ where: { seasonId } }),
      this.prisma.squadImportBatch.findFirst({
        where: { seasonId },
        orderBy: { createdAt: 'desc' },
        select: { status: true, importedRows: true, publishedRows: true },
      }),
    ]);

    return {
      seasonId,
      seasonName: season.name,
      totalRegistrations,
      confirmedRegistrations,
      provisionalRegistrations: totalRegistrations - confirmedRegistrations,
      importBatchCount: batchCount,
      latestBatchStatus: latestBatch?.status ?? null,
      latestBatchImportedRows: latestBatch?.importedRows ?? 0,
      latestBatchPublishedRows: latestBatch?.publishedRows ?? 0,
      warnings: [
        ...(confirmedRegistrations === 0 ? ['No confirmed squad registrations — fans cannot build fantasy squads with real PSL player data'] : []),
        ...(totalRegistrations === confirmedRegistrations ? [] : [`${totalRegistrations - confirmedRegistrations} registrations are still provisional`]),
      ],
    };
  }

  async getActivationDryRun(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const readiness = await this.getReadiness(seasonId);
    const impact = await this.getActivationImpact(seasonId);

    // Pull additional context from season switching readiness
    const [fixtureCount, gameweekCount, teamCount] = await Promise.all([
      this.prisma.fixture.count({ where: { seasonId, isPublished: true } }),
      this.prisma.gameweek.count({ where: { seasonId } }),
      this.prisma.seasonTeam.count({ where: { seasonId } }),
    ]);

    const domainChecks = [
      {
        domain: 'squad_import',
        status: readiness.readinessStatus,
        blockerCount: readiness.blockerCount,
        warningCount: readiness.warningCount,
        registrations: impact.totalRegistrations,
        confirmed: impact.confirmedRegistrations,
      },
      {
        domain: 'fixtures',
        status: fixtureCount > 0 ? 'READY' : 'READY_WITH_WARNINGS',
        publishedFixtures: fixtureCount,
      },
      {
        domain: 'gameweeks',
        status: gameweekCount > 0 ? 'READY' : 'READY_WITH_WARNINGS',
        gameweekCount,
      },
      {
        domain: 'teams',
        status: teamCount >= 2 ? 'READY' : 'BLOCKED',
        teamCount,
      },
    ];

    const overallStatus = readiness.readinessStatus;

    return {
      seasonId,
      seasonName: season.name,
      dryRunOnly: true,
      activationWillNotBePerformed: true,
      readinessStatus: overallStatus,
      blockerCount: readiness.blockerCount,
      warningCount: readiness.warningCount,
      passedCheckCount: readiness.checks.filter(c => c.passed).length,
      failedCheckCount: readiness.checks.filter(c => !c.passed).length,
      domainChecks,
      nextActions: [
        ...(impact.confirmedRegistrations === 0 ? ['Run squad import and publish at least one batch'] : []),
        ...(fixtureCount === 0 ? ['Publish fixtures before activation'] : []),
        ...(gameweekCount === 0 ? ['Create gameweeks from fixtures'] : []),
      ],
      safetyConfirmations: {
        worldCupHistoryPreserved: true,
        pslActivationNotPerformed: true,
        productionMoneyMovementDisabled: true,
        checkoutTicketingLiveProviderDisabled: true,
        fantasyPointsOnly: true,
        fanValueNonFinancial: true,
      },
    };
  }

  // ── Duplicate detection ────────────────────────────────────────────────────

  private async findDuplicatePlayers(playerName: string, teamId: string) {
    const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalName = normalise(playerName);

    const candidates = await this.prisma.player.findMany({
      where: { teamId },
      select: { id: true, name: true },
    });

    return candidates.filter(p => normalise(p.name) === normalName);
  }

  // ── Audit ─────────────────────────────────────────────────────────────────

  private async writeAuditLog(
    action: string,
    entityType: string,
    entityId: string,
    actorUserId?: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action,
        entityType,
        entityId,
        route: `/admin/squad-import`,
        metadata: metadata as unknown as Prisma.InputJsonValue ?? Prisma.JsonNull,
      },
    });
  }
}
