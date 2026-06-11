import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CompetitionFormat,
  CompetitionImportSourceType,
  CompetitionImportStatus,
  FixtureStatus,
  GameweekStatus,
  PlayerPosition,
  Prisma,
  SeasonStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CompetitionImportPayload,
  ImportCommitResult,
  ImportFixtureDto,
  ImportGameweekDto,
  ImportGroupDto,
  ImportPlayerDto,
  ImportPreviewCounts,
  ImportTeamDto,
  ImportValidationResult,
  ImportVenueDto,
} from './dto/competition-import-payload.dto';

@Injectable()
export class CompetitionImportService {
  constructor(private prisma: PrismaService) {}

  // ── Job management ────────────────────────────────────────────────────────

  listJobs() {
    return this.prisma.competitionImportJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getJob(id: string) {
    const job = await this.prisma.competitionImportJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`Import job '${id}' not found`);
    return job;
  }

  async createDraftJob(payload: CompetitionImportPayload, userId?: string) {
    return this.prisma.competitionImportJob.create({
      data: {
        source: payload.source ?? 'MANUAL',
        sourceType: (payload.sourceType as CompetitionImportSourceType) ?? CompetitionImportSourceType.MANUAL,
        status: CompetitionImportStatus.DRAFT,
        rawPayload: payload as unknown as Prisma.InputJsonValue,
        ...(userId ? { createdByUserId: userId } : {}),
      },
    });
  }

  async cancelJob(id: string) {
    const job = await this.getJob(id);
    if (job.status === CompetitionImportStatus.COMPLETED || job.status === CompetitionImportStatus.FAILED) {
      throw new Error(`Cannot cancel a job in status ${job.status}`);
    }
    return this.prisma.competitionImportJob.update({
      where: { id },
      data: { status: CompetitionImportStatus.CANCELLED },
    });
  }

  async retryJob(id: string) {
    const job = await this.getJob(id);
    if (!job.rawPayload) throw new Error('Job has no stored payload to retry');
    const payload = job.rawPayload as unknown as CompetitionImportPayload;
    const retryOpts: { userId?: string; jobId?: string } = { jobId: id };
    if (job.createdByUserId) retryOpts.userId = job.createdByUserId;
    return this.commit(payload, retryOpts);
  }

  // ── Validate ──────────────────────────────────────────────────────────────

  validate(payload: CompetitionImportPayload): ImportValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!payload.source) errors.push('source is required');
    if (!payload.sourceType) errors.push('sourceType is required');

    const hasAny =
      payload.competition ||
      payload.season ||
      payload.teams?.length ||
      payload.venues?.length ||
      payload.players?.length ||
      payload.fixtures?.length ||
      payload.groups?.length ||
      payload.gameweeks?.length;
    if (!hasAny) errors.push('Payload must contain at least one section (competition, season, teams, venues, players, fixtures, groups, or gameweeks)');

    if (payload.competition) {
      const c = payload.competition;
      if (!c.name) errors.push('competition.name is required');
      if (!c.slug) errors.push('competition.slug is required');
      if (c.format && !Object.values(CompetitionFormat).includes(c.format)) {
        errors.push(`competition.format '${c.format}' is not valid`);
      }
    }

    if (payload.season) {
      const s = payload.season;
      if (!s.name) errors.push('season.name is required');
      if (!s.slug) errors.push('season.slug is required');
      if (!s.startDate) errors.push('season.startDate is required');
      if (!s.endDate) errors.push('season.endDate is required');
      if (s.startDate && s.endDate) {
        const start = new Date(s.startDate);
        const end = new Date(s.endDate);
        if (isNaN(start.getTime())) errors.push(`season.startDate '${s.startDate}' is not a valid date`);
        else if (isNaN(end.getTime())) errors.push(`season.endDate '${s.endDate}' is not a valid date`);
        else if (start >= end) errors.push('season.startDate must be before season.endDate');
      }
      if (s.status && !Object.values(SeasonStatus).includes(s.status)) {
        errors.push(`season.status '${s.status}' is not valid`);
      }
      if (!payload.competition && !payload.competitionSlug) {
        warnings.push('season included without competition — competition must exist in DB or provide competitionSlug');
      }
    }

    const teamSlugs = new Set<string>();
    for (let i = 0; i < (payload.teams?.length ?? 0); i++) {
      const t = payload.teams![i]!;
      if (!t.name) errors.push(`teams[${i}].name is required`);
      if (!t.slug) errors.push(`teams[${i}].slug is required`);
      if (!t.shortName) errors.push(`teams[${i}].shortName is required`);
      if (!t.country) errors.push(`teams[${i}].country is required`);
      if (t.slug) {
        if (teamSlugs.has(t.slug)) errors.push(`teams: duplicate slug '${t.slug}'`);
        else teamSlugs.add(t.slug);
      }
    }

    for (let i = 0; i < (payload.venues?.length ?? 0); i++) {
      const v = payload.venues![i]!;
      if (!v.name) errors.push(`venues[${i}].name is required`);
      if (!v.city) errors.push(`venues[${i}].city is required`);
      if (!v.country) errors.push(`venues[${i}].country is required`);
    }

    for (let i = 0; i < (payload.players?.length ?? 0); i++) {
      const p = payload.players![i]!;
      if (!p.name) errors.push(`players[${i}].name is required`);
      if (!p.position) errors.push(`players[${i}].position is required`);
      else if (!Object.values(PlayerPosition).includes(p.position)) {
        errors.push(`players[${i}].position '${p.position}' is not valid`);
      }
      if (!p.teamExternalId && !p.teamSlug) {
        errors.push(`players[${i}]: teamExternalId or teamSlug is required`);
      }
    }

    const hasHomeAway = payload.competition?.hasHomeAway ?? true;
    for (let i = 0; i < (payload.fixtures?.length ?? 0); i++) {
      const f = payload.fixtures![i]!;
      if (!f.kickoffAt) {
        errors.push(`fixtures[${i}].kickoffAt is required`);
      } else if (isNaN(new Date(f.kickoffAt).getTime())) {
        errors.push(`fixtures[${i}].kickoffAt '${f.kickoffAt}' is not a valid date`);
      }
      if (f.status && !Object.values(FixtureStatus).includes(f.status)) {
        errors.push(`fixtures[${i}].status '${f.status}' is not valid`);
      }
      if (hasHomeAway) {
        if (!f.homeTeamExternalId && !f.homeTeamSlug) {
          errors.push(`fixtures[${i}]: homeTeamExternalId or homeTeamSlug required when hasHomeAway is true`);
        }
        if (!f.awayTeamExternalId && !f.awayTeamSlug) {
          errors.push(`fixtures[${i}]: awayTeamExternalId or awayTeamSlug required when hasHomeAway is true`);
        }
      }
    }

    for (let i = 0; i < (payload.groups?.length ?? 0); i++) {
      const g = payload.groups![i]!;
      if (!g.name) errors.push(`groups[${i}].name is required`);
    }

    const gwSlugs = new Set<string>();
    for (let i = 0; i < (payload.gameweeks?.length ?? 0); i++) {
      const gw = payload.gameweeks![i]!;
      if (!gw.name) errors.push(`gameweeks[${i}].name is required`);
      if (!gw.slug) errors.push(`gameweeks[${i}].slug is required`);
      if (gw.round === undefined || gw.round === null) errors.push(`gameweeks[${i}].round is required`);
      if (!gw.startsAt) errors.push(`gameweeks[${i}].startsAt is required`);
      if (!gw.endsAt) errors.push(`gameweeks[${i}].endsAt is required`);
      if (!gw.transferDeadlineAt) errors.push(`gameweeks[${i}].transferDeadlineAt is required`);
      if (!gw.predictionDeadlineAt) errors.push(`gameweeks[${i}].predictionDeadlineAt is required`);
      if (gw.slug) {
        if (gwSlugs.has(gw.slug)) errors.push(`gameweeks: duplicate slug '${gw.slug}'`);
        else gwSlugs.add(gw.slug);
      }
    }

    const willActivateSeason = !!(payload.activateSeason && payload.season);
    if (willActivateSeason) {
      warnings.push('activateSeason=true will deactivate the currently active season globally');
    }

    // Warn when fixtures have no gameweek/stage assignment data and auto-assign is not requested
    if (payload.fixtures?.length && !payload.autoAssignFixtures) {
      const noGameweek = payload.fixtures.filter(f => !f.gameweekSlug && !f.stageSlug);
      if (noGameweek.length > 0) {
        warnings.push(`${noGameweek.length} fixture(s) have no gameweekSlug or stageSlug — set autoAssignFixtures=true or assign manually after import`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      previewCounts: {
        competitions: payload.competition ? 1 : 0,
        seasons: payload.season ? 1 : 0,
        teams: payload.teams?.length ?? 0,
        venues: payload.venues?.length ?? 0,
        players: payload.players?.length ?? 0,
        fixtures: payload.fixtures?.length ?? 0,
        groups: payload.groups?.length ?? 0,
        gameweeks: payload.gameweeks?.length ?? 0,
      },
      detectedFormat: payload.sourceType ?? 'UNKNOWN',
      willActivateSeason,
      replaceMode: payload.replaceMode ?? false,
    };
  }

  // ── Commit ────────────────────────────────────────────────────────────────

  async commit(
    payload: CompetitionImportPayload,
    opts: { userId?: string; jobId?: string } = {},
  ): Promise<ImportCommitResult> {
    const job = opts.jobId
      ? await this.prisma.competitionImportJob.update({
          where: { id: opts.jobId },
          data: {
            status: CompetitionImportStatus.IMPORTING,
            startedAt: new Date(),
            rawPayload: payload as unknown as Prisma.InputJsonValue,
          },
        })
      : await this.prisma.competitionImportJob.create({
          data: {
            source: payload.source ?? 'MANUAL',
            sourceType: (payload.sourceType as CompetitionImportSourceType) ?? CompetitionImportSourceType.MANUAL,
            status: CompetitionImportStatus.IMPORTING,
            startedAt: new Date(),
            rawPayload: payload as unknown as Prisma.InputJsonValue,
            ...(opts.userId ? { createdByUserId: opts.userId } : {}),
          },
        });

    const errors: string[] = [];
    const counts: ImportPreviewCounts = {
      competitions: 0, seasons: 0, teams: 0, venues: 0,
      players: 0, fixtures: 0, groups: 0, gameweeks: 0,
    };
    const source = payload.source ?? 'MANUAL';
    const importedAt = new Date();

    try {
      // Competition
      let competitionId: string | undefined;
      if (payload.competition) {
        const c = payload.competition;
        const comp = await this.upsertCompetition(c, source, importedAt);
        competitionId = comp.id;
        counts.competitions++;
      } else if (payload.competitionSlug) {
        const found = await this.prisma.competition.findUnique({
          where: { slug: payload.competitionSlug },
          select: { id: true },
        });
        if (found) competitionId = found.id;
      }

      // Season
      let seasonId: string | undefined;
      if (payload.season && competitionId) {
        const s = payload.season;
        const season = await this.upsertSeason(s, competitionId, source, importedAt);
        seasonId = season.id;
        counts.seasons++;

        if (payload.activateSeason) {
          await this.prisma.$transaction(async (tx) => {
            await tx.season.updateMany({
              where: { isActive: true },
              data: { isActive: false, status: SeasonStatus.COMPLETED },
            });
            await tx.season.update({
              where: { id: season.id },
              data: { isActive: true, status: SeasonStatus.ACTIVE },
            });
          });
        }
      } else if (payload.seasonSlug) {
        const found = await this.prisma.season.findUnique({
          where: { slug: payload.seasonSlug },
          select: { id: true },
        });
        if (found) seasonId = found.id;
      }

      // Venues
      const venueMap = new Map<string, string>(); // externalId|name → id
      for (const v of payload.venues ?? []) {
        try {
          const venue = await this.upsertVenue(v, source, importedAt);
          if (v.externalId) venueMap.set(v.externalId, venue.id);
          venueMap.set(v.name, venue.id);
          counts.venues++;
        } catch (e) {
          errors.push(`venue '${v.name}': ${String(e)}`);
        }
      }

      // Teams
      const teamByExtId = new Map<string, string>();
      const teamBySlug = new Map<string, string>();
      for (const t of payload.teams ?? []) {
        try {
          const team = await this.upsertTeam(t, source, importedAt);
          if (t.externalId) teamByExtId.set(t.externalId, team.id);
          teamBySlug.set(t.slug, team.id);
          counts.teams++;
        } catch (e) {
          errors.push(`team '${t.slug}': ${String(e)}`);
        }
      }

      // Players
      for (const p of payload.players ?? []) {
        try {
          const teamId = await this.resolveTeamId(p.teamExternalId, p.teamSlug, teamByExtId, teamBySlug);
          if (!teamId) { errors.push(`player '${p.name}': team not found`); continue; }
          await this.upsertPlayer(p, teamId, source, importedAt);
          counts.players++;
        } catch (e) {
          errors.push(`player '${p.name}': ${String(e)}`);
        }
      }

      // Groups
      const groupMap = new Map<string, string>(); // name → id
      if (seasonId) {
        for (const g of payload.groups ?? []) {
          try {
            const group = await this.upsertGroup(g, seasonId, source, importedAt);
            groupMap.set(g.name, group.id);
            counts.groups++;
          } catch (e) {
            errors.push(`group '${g.name}': ${String(e)}`);
          }
        }
      }

      // Gameweeks
      const gwMap = new Map<string, string>(); // slug → id
      if (seasonId) {
        for (const gw of payload.gameweeks ?? []) {
          try {
            const gameweek = await this.upsertGameweek(gw, seasonId, source, importedAt);
            gwMap.set(gw.slug, gameweek.id);
            counts.gameweeks++;
          } catch (e) {
            errors.push(`gameweek '${gw.slug}': ${String(e)}`);
          }
        }
      }

      // Fixtures
      if (seasonId) {
        for (const f of payload.fixtures ?? []) {
          try {
            await this.upsertFixture(f, seasonId, teamByExtId, teamBySlug, venueMap, groupMap, gwMap, source, importedAt);
            counts.fixtures++;
          } catch (e) {
            errors.push(`fixture '${f.externalId ?? f.kickoffAt}': ${String(e)}`);
          }
        }
      }

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const status = errors.length > 0 ? CompetitionImportStatus.COMPLETED : CompetitionImportStatus.COMPLETED;
      await this.prisma.competitionImportJob.update({
        where: { id: job.id },
        data: {
          status,
          completedAt: new Date(),
          totalRecords: total,
          importedRecords: total,
          failedRecords: errors.length,
          ...(competitionId ? { competitionId } : {}),
          ...(seasonId ? { seasonId } : {}),
          ...(errors.length > 0 ? { errorsJson: errors as unknown as Prisma.InputJsonValue } : {}),
        },
      });

      // Auto-assign fixtures to gameweeks/stages if requested and we have a seasonId
      let assignmentSummary: { total: number; assigned: number; skipped: number } | undefined;
      if (payload.autoAssignFixtures && seasonId) {
        try {
          const summary = await this.autoAssignFixtures(seasonId);
          assignmentSummary = summary;
        } catch {
          errors.push('auto-assignment failed — run /admin/fixtures/auto-assign manually');
        }
      } else if (payload.fixtures?.length && !payload.gameweeks?.length) {
        // Warn: fixtures imported without gameweek data and auto-assign not requested
        const fixturesWithoutGameweek = payload.fixtures.filter(f => !f.gameweekSlug);
        if (fixturesWithoutGameweek.length > 0) {
          // Warning is surfaced via assignmentSummary absence — caller can check
        }
      }

      return { jobId: job.id, counts, errors, status: CompetitionImportStatus.COMPLETED, ...(assignmentSummary ? { assignmentSummary } : {}) };
    } catch (err) {
      await this.prisma.competitionImportJob.update({
        where: { id: job.id },
        data: {
          status: CompetitionImportStatus.FAILED,
          completedAt: new Date(),
          errorsJson: [String(err)] as unknown as Prisma.InputJsonValue,
          failedRecords: 1,
        },
      });
      throw err;
    }
  }

  // ── Private upsert helpers ────────────────────────────────────────────────

  private async upsertCompetition(dto: NonNullable<CompetitionImportPayload['competition']>, source: string, importedAt: Date) {
    const updateData = {
      name: dto.name,
      format: dto.format ?? CompetitionFormat.LEAGUE,
      hasGroups: dto.hasGroups ?? false,
      hasKnockouts: dto.hasKnockouts ?? false,
      hasHomeAway: dto.hasHomeAway ?? true,
      usesNeutralVenues: dto.usesNeutralVenues ?? false,
      pointsForWin: dto.pointsForWin ?? 3,
      pointsForDraw: dto.pointsForDraw ?? 1,
      pointsForLoss: dto.pointsForLoss ?? 0,
      source,
      importedAt,
      ...(dto.teamCount !== undefined ? { teamCount: dto.teamCount } : {}),
      ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
      ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl } : {}),
      ...(dto.externalId !== undefined ? { externalId: dto.externalId } : {}),
    };
    // Try externalId first, then slug — handles the case where record exists by slug but has no externalId yet
    if (dto.externalId) {
      const byExtId = await this.prisma.competition.findFirst({ where: { externalId: dto.externalId }, select: { id: true } });
      if (byExtId) return this.prisma.competition.update({ where: { id: byExtId.id }, data: updateData });
    }
    return this.prisma.competition.upsert({
      where: { slug: dto.slug },
      create: { slug: dto.slug, ...updateData },
      update: updateData,
    });
  }

  private async upsertSeason(dto: NonNullable<CompetitionImportPayload['season']>, competitionId: string, source: string, importedAt: Date) {
    const data = {
      competitionId,
      name: dto.name,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: dto.status ?? SeasonStatus.UPCOMING,
      isActive: dto.isActive ?? false,
      source,
      importedAt,
      ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl } : {}),
      ...(dto.externalId !== undefined ? { externalId: dto.externalId } : {}),
    };
    return this.prisma.season.upsert({
      where: { slug: dto.slug },
      create: { slug: dto.slug, ...data },
      update: data,
    });
  }

  private async upsertVenue(dto: ImportVenueDto, source: string, importedAt: Date) {
    const data = {
      name: dto.name, city: dto.city, country: dto.country,
      source, importedAt,
      ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
      ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl } : {}),
      ...(dto.externalId !== undefined ? { externalId: dto.externalId } : {}),
    };
    if (dto.externalId) {
      return this.prisma.venue.upsert({
        where: { externalId: dto.externalId },
        create: data,
        update: data,
      });
    }
    const existing = await this.prisma.venue.findFirst({ where: { name: dto.name, city: dto.city } });
    if (existing) return this.prisma.venue.update({ where: { id: existing.id }, data });
    return this.prisma.venue.create({ data });
  }

  private async upsertTeam(dto: ImportTeamDto, source: string, importedAt: Date) {
    const data = {
      name: dto.name, shortName: dto.shortName, country: dto.country,
      source, importedAt,
      ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
      ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl } : {}),
      ...(dto.externalId !== undefined ? { externalId: dto.externalId } : {}),
    };
    if (dto.externalId) {
      const byExtId = await this.prisma.team.findFirst({ where: { externalId: dto.externalId }, select: { id: true } });
      if (byExtId) return this.prisma.team.update({ where: { id: byExtId.id }, data });
    }
    return this.prisma.team.upsert({
      where: { slug: dto.slug },
      create: { slug: dto.slug, ...data },
      update: data,
    });
  }

  private async upsertPlayer(dto: ImportPlayerDto, teamId: string, source: string, importedAt: Date) {
    const data = {
      teamId, name: dto.name, position: dto.position,
      nationality: dto.nationality ?? 'Unknown',
      source, importedAt,
      ...(dto.externalId !== undefined ? { externalId: dto.externalId } : {}),
      ...(dto.number !== undefined ? { number: dto.number } : {}),
      ...(dto.dateOfBirth !== undefined ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
      ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl } : {}),
    };
    if (dto.externalId) {
      const existing = await this.prisma.player.findFirst({ where: { externalId: dto.externalId } });
      if (existing) return this.prisma.player.update({ where: { id: existing.id }, data });
    } else {
      const existing = await this.prisma.player.findFirst({
        where: { teamId, name: dto.name, position: dto.position },
      });
      if (existing) return this.prisma.player.update({ where: { id: existing.id }, data });
    }
    return this.prisma.player.create({ data });
  }

  private async upsertGroup(dto: ImportGroupDto, seasonId: string, source: string, importedAt: Date) {
    const data = { source, importedAt, ...(dto.externalId ? { externalId: dto.externalId } : {}) };
    return this.prisma.group.upsert({
      where: { seasonId_name: { seasonId, name: dto.name } },
      create: { name: dto.name, seasonId, ...data },
      update: data,
    });
  }

  private async upsertGameweek(dto: ImportGameweekDto, seasonId: string, source: string, importedAt: Date) {
    const data = {
      name: dto.name, round: dto.round,
      startsAt: new Date(dto.startsAt), endsAt: new Date(dto.endsAt),
      transferDeadlineAt: new Date(dto.transferDeadlineAt),
      predictionDeadlineAt: new Date(dto.predictionDeadlineAt),
      status: dto.status ?? GameweekStatus.UPCOMING,
      source, importedAt,
      ...(dto.externalId !== undefined ? { externalId: dto.externalId } : {}),
      ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl } : {}),
    };
    return this.prisma.gameweek.upsert({
      where: { seasonId_slug: { seasonId, slug: dto.slug } },
      create: { seasonId, slug: dto.slug, ...data },
      update: data,
    });
  }

  private async upsertFixture(
    dto: ImportFixtureDto,
    seasonId: string,
    teamByExtId: Map<string, string>,
    teamBySlug: Map<string, string>,
    venueMap: Map<string, string>,
    groupMap: Map<string, string>,
    gwMap: Map<string, string>,
    source: string,
    importedAt: Date,
  ) {
    const homeTeamId = await this.resolveTeamId(dto.homeTeamExternalId, dto.homeTeamSlug, teamByExtId, teamBySlug);
    const awayTeamId = await this.resolveTeamId(dto.awayTeamExternalId, dto.awayTeamSlug, teamByExtId, teamBySlug);
    if (!homeTeamId) throw new Error('homeTeam not resolved');
    if (!awayTeamId) throw new Error('awayTeam not resolved');

    const venueId = dto.venueExternalId
      ? (venueMap.get(dto.venueExternalId) ?? null)
      : dto.venueName
        ? (venueMap.get(dto.venueName) ?? null)
        : null;
    const groupId = dto.groupName ? (groupMap.get(dto.groupName) ?? null) : null;
    const gameweekId = dto.gameweekSlug ? (gwMap.get(dto.gameweekSlug) ?? null) : null;

    const data = {
      seasonId, homeTeamId, awayTeamId,
      kickoffAt: new Date(dto.kickoffAt),
      status: dto.status ?? FixtureStatus.SCHEDULED,
      isNeutralVenue: dto.isNeutralVenue ?? false,
      source, importedAt,
      ...(venueId ? { venueId } : {}),
      ...(groupId ? { groupId } : {}),
      ...(gameweekId ? { gameweekId } : {}),
      ...(dto.round !== undefined ? { round: dto.round } : {}),
      ...(dto.legNumber !== undefined ? { legNumber: dto.legNumber } : {}),
      ...(dto.externalId !== undefined ? { externalId: dto.externalId } : {}),
      ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl } : {}),
    };

    if (dto.externalId) {
      const existing = await this.prisma.fixture.findFirst({ where: { externalId: dto.externalId } });
      if (existing) return this.prisma.fixture.update({ where: { id: existing.id }, data });
    } else {
      const kickoffAt = new Date(dto.kickoffAt);
      const existing = await this.prisma.fixture.findFirst({
        where: { seasonId, homeTeamId, awayTeamId, kickoffAt },
      });
      if (existing) return this.prisma.fixture.update({ where: { id: existing.id }, data });
    }
    return this.prisma.fixture.create({ data });
  }

  private async autoAssignFixtures(seasonId: string): Promise<{ total: number; assigned: number; skipped: number }> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { competition: { include: { stages: { orderBy: { order: 'asc' } } } } },
    });
    if (!season) return { total: 0, assigned: 0, skipped: 0 };

    const fixtures = await this.prisma.fixture.findMany({
      where: { seasonId, assignmentStatus: 'UNASSIGNED' },
      select: { id: true, round: true, kickoffAt: true, gameweekId: true, stageId: true },
    });
    if (!fixtures.length) return { total: 0, assigned: 0, skipped: 0 };

    const gameweeks = await this.prisma.gameweek.findMany({ where: { seasonId }, orderBy: { round: 'asc' } });
    const stages = season.competition.stages;
    const isLeague = season.competition.format === CompetitionFormat.LEAGUE || season.competition.format === CompetitionFormat.CUP;

    const ROUND_TO_STAGE: Record<string, string> = {
      GROUP: 'group-stage', ROUND_OF_32: 'round-of-32', ROUND_OF_16: 'round-of-16',
      QUARTER_FINAL: 'quarter-finals', SEMI_FINAL: 'semi-finals', THIRD_PLACE: 'third-place-play-off', FINAL: 'final',
    };
    const ROUND_TO_GW: Record<string, string> = {
      ROUND_OF_32: 'round-of-32', ROUND_OF_16: 'round-of-16', QUARTER_FINAL: 'quarter-finals',
      SEMI_FINAL: 'semi-finals', THIRD_PLACE: 'third-place', FINAL: 'final',
    };

    let assigned = 0;
    let skipped = 0;
    const now = new Date();

    for (const fixture of fixtures) {
      const round = fixture.round ?? '';
      let gameweekId: string | undefined;
      let stageId: string | undefined;

      if (isLeague) {
        const roundNum = parseInt(round, 10);
        if (!isNaN(roundNum)) {
          const gw = gameweeks.find(g => g.round === roundNum);
          if (gw) gameweekId = gw.id;
        }
        if (!gameweekId) {
          const gw = gameweeks.find(g => fixture.kickoffAt >= g.startsAt && fixture.kickoffAt <= g.endsAt);
          if (gw) gameweekId = gw.id;
        }
      } else {
        const stageSlug = ROUND_TO_STAGE[round];
        if (stageSlug) { const s = stages.find(st => st.slug === stageSlug); if (s) stageId = s.id; }
        if (round === 'GROUP') {
          const gw = gameweeks.find(g => fixture.kickoffAt >= g.startsAt && fixture.kickoffAt <= g.endsAt)
            ?? [...gameweeks].filter(g => g.slug.startsWith('group') && g.startsAt <= fixture.kickoffAt)
              .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())[0];
          if (gw) gameweekId = gw.id;
        } else {
          const gwSlug = ROUND_TO_GW[round];
          if (gwSlug) { const gw = gameweeks.find(g => g.slug === gwSlug); if (gw) gameweekId = gw.id; }
        }
      }

      if (gameweekId || stageId) {
        const updateData: Record<string, unknown> = { assignmentStatus: 'AUTO_ASSIGNED', assignmentSource: 'import', assignedAt: now };
        if (gameweekId) updateData['gameweekId'] = gameweekId;
        if (stageId) updateData['stageId'] = stageId;
        await this.prisma.fixture.update({ where: { id: fixture.id }, data: updateData });
        assigned++;
      } else {
        skipped++;
      }
    }

    return { total: fixtures.length, assigned, skipped };
  }

  private async resolveTeamId(
    extId: string | undefined,
    slug: string | undefined,
    teamByExtId: Map<string, string>,
    teamBySlug: Map<string, string>,
  ): Promise<string | null> {
    if (extId) {
      if (teamByExtId.has(extId)) return teamByExtId.get(extId)!;
      const t = await this.prisma.team.findUnique({ where: { externalId: extId }, select: { id: true } });
      if (t) { teamByExtId.set(extId, t.id); return t.id; }
    }
    if (slug) {
      if (teamBySlug.has(slug)) return teamBySlug.get(slug)!;
      const t = await this.prisma.team.findUnique({ where: { slug }, select: { id: true } });
      if (t) { teamBySlug.set(slug, t.id); return t.id; }
    }
    return null;
  }
}
