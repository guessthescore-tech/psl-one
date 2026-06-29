import { Injectable, Logger } from '@nestjs/common';
import { FixtureStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FootballDataOrgAdapter } from './football-data-org.adapter';
import { SportRadarSoccerAdapter } from './sportradar-soccer.adapter';
import { WhenIsKickoffAdapter } from './wheniskickoff.adapter';
import type { ProviderFixture } from './provider-adapter.interface';
import type {
  WorldCupImportCandidateDto,
  WorldCupImportRequestDto,
  WorldCupImportResponseDto,
} from './dto/world-cup-import.dto';

const WC_PROVIDER_SOURCE = 'wheniskickoff';
const WC_COMPETITION_CODES = ['WC', 'WORLD_CUP_2026', 'FIFA_WORLD_CUP', 'WC2026'];
const WRITE_CONFIRM_VALUE = 'IMPORT_WORLD_CUP_BETA';
const WRITE_ENV_FLAG = 'ALLOW_WORLD_CUP_WRITE';

/**
 * World Cup 2026 fixture import service.
 *
 * Imports WC fixtures from wheniskickoff.com (primary) with football-data.org
 * and SportRadar as fallbacks.
 * Default mode is dryRun=true — no DB writes occur unless:
 *   1. dryRun=false in request body
 *   2. confirmWorldCupWrite='IMPORT_WORLD_CUP_BETA' in request body
 *   3. ALLOW_WORLD_CUP_WRITE=true in server environment
 *
 * PSL is never activated. No scheduled ingestion. No production ingestion.
 * Server-side only — provider keys are never returned in responses.
 */
@Injectable()
export class WorldCupImportService {
  private readonly logger = new Logger(WorldCupImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async importFixtures(opts: WorldCupImportRequestDto): Promise<WorldCupImportResponseDto> {
    const dryRun = opts.dryRun !== false;
    const source = opts.source ?? 'auto';
    const includeCandidates = opts.includeCandidates !== false || dryRun;

    const result: WorldCupImportResponseDto = {
      provider: source === 'sportradar-soccer' ? 'sportradar-soccer' : WC_PROVIDER_SOURCE,
      competitionCode: 'WC2026',
      dryRun,
      sourceStatus: 'SOURCE_EMPTY',
      discovered: 0,
      normalized: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      candidates: [],
      errors: [],
      warnings: [],
      safety: {
        noRealMoney: true,
        noPslActivation: true,
        worldCupBetaContext: true,
        writeRequiresFlags: [
          `${WRITE_ENV_FLAG}=true (server env var)`,
          `confirmWorldCupWrite=${WRITE_CONFIRM_VALUE} (request body)`,
        ],
      },
    };

    // Write-mode safety checks
    if (!dryRun) {
      if (opts.confirmWorldCupWrite !== WRITE_CONFIRM_VALUE) {
        result.sourceStatus = 'WRITE_BLOCKED_MISSING_FLAGS';
        result.errors.push(
          `confirmWorldCupWrite must be "${WRITE_CONFIRM_VALUE}" for write mode`,
        );
        return result;
      }
      if (process.env[WRITE_ENV_FLAG] !== 'true') {
        result.sourceStatus = 'WRITE_BLOCKED_ENV_FLAG';
        result.errors.push(
          `Server env var ${WRITE_ENV_FLAG}=true required for write mode`,
        );
        return result;
      }
    }

    // Fetch fixtures from chosen provider
    let providerFixtures: ProviderFixture[] = [];
    try {
      if (source === 'sportradar-soccer') {
        const adapter = new SportRadarSoccerAdapter();
        const h = await adapter.health();
        if (!h.available) {
          result.sourceStatus = 'AUTH_FAILED';
          result.errors.push(`SportRadar not available: ${h.message}`);
          return result;
        }
        const seasons = await adapter.getSeasons();
        if (seasons.length === 0) {
          result.sourceStatus = 'SOURCE_EMPTY';
          result.warnings.push('SportRadar: no WC seasons found');
          return result;
        }
        // seasons.length > 0 guaranteed by guard above
        const wc2026Season = seasons.find(s => s.name.includes('2026')) ?? seasons[0]!;
        providerFixtures = await adapter.getFixtures(wc2026Season.externalId);
        result.provider = 'sportradar-soccer';
      } else if (source === 'football-data-org') {
        const fdKey = process.env['FOOTBALL_DATA_API_KEY'];
        if (!fdKey) {
          result.sourceStatus = 'AUTH_FAILED';
          result.errors.push('FOOTBALL_DATA_API_KEY not set — cannot import WC fixtures');
          await this.writeAuditLog('WORLD_CUP_FIXTURE_IMPORT_FAILED', { reason: 'AUTH_FAILED' });
          return result;
        }
        const adapter = new FootballDataOrgAdapter();
        providerFixtures = await adapter.getFixtures('WC');
        result.provider = 'football-data-org';
      } else if (source === 'wheniskickoff') {
        const adapter = new WhenIsKickoffAdapter();
        providerFixtures = await adapter.getFixtures('wheniskickoff-world-cup-2026');
        result.provider = WC_PROVIDER_SOURCE;
      } else {
        const publicAdapter = new WhenIsKickoffAdapter();
        providerFixtures = await publicAdapter.getFixtures('wheniskickoff-world-cup-2026');
        result.provider = WC_PROVIDER_SOURCE;

        if (providerFixtures.length === 0) {
          const fdKey = process.env['FOOTBALL_DATA_API_KEY'];
          if (fdKey) {
            const fdAdapter = new FootballDataOrgAdapter();
            providerFixtures = await fdAdapter.getFixtures('WC');
            result.provider = 'football-data-org';
          }
        }

        if (providerFixtures.length === 0) {
          const srKey = process.env['SPORTSRADAR_SOCCER_API_KEY'];
          if (srKey) {
            const srAdapter = new SportRadarSoccerAdapter();
            const seasons = await srAdapter.getSeasons();
            if (seasons.length > 0) {
              const wc2026Season = seasons.find(s => s.name.includes('2026')) ?? seasons[0]!;
              providerFixtures = await srAdapter.getFixtures(wc2026Season.externalId);
              result.provider = 'sportradar-soccer';
            }
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('429') || msg.toLowerCase().includes('rate')) {
        result.sourceStatus = 'RATE_LIMITED';
        result.errors.push('RATE_LIMITED: ' + msg);
      } else if (msg.includes('401') || msg.includes('403') || msg.toLowerCase().includes('auth')) {
        result.sourceStatus = 'AUTH_FAILED';
        result.errors.push('AUTH_FAILED: ' + msg);
      } else {
        result.sourceStatus = 'PROVIDER_ERROR';
        result.errors.push('PROVIDER_ERROR: ' + msg);
      }
      this.logger.error(`WorldCupImportService: fetch error — ${msg}`);
      await this.writeAuditLog('WORLD_CUP_FIXTURE_IMPORT_FAILED', { reason: result.sourceStatus });
      return result;
    }

    result.discovered = providerFixtures.length;

    if (providerFixtures.length === 0) {
      result.sourceStatus = 'SOURCE_EMPTY';
      this.logger.log('WorldCupImportService: SOURCE_EMPTY — no WC fixtures from provider');
      await this.writeAuditLog('WORLD_CUP_FIXTURE_IMPORT_SOURCE_EMPTY', {});
      return result;
    }

    const normalized = this.normalizeFixtures(providerFixtures);
    result.normalized = normalized.length;
    result.sourceStatus = 'SOURCE_AVAILABLE';

    if (normalized.length < providerFixtures.length) {
      result.warnings.push(
        `${providerFixtures.length - normalized.length} fixtures skipped (missing required fields)`,
      );
    }

    if (includeCandidates) {
      result.candidates = await this.buildCandidates(normalized, result.provider);
    }

    if (dryRun) {
      result.skipped = normalized.length;
      this.logger.log(
        `WorldCupImportService: DRY_RUN — ${normalized.length} fixture(s); 0 DB writes`,
      );
      await this.writeAuditLog('WORLD_CUP_FIXTURE_IMPORT_DRY_RUN', {
        provider: result.provider,
        normalized: normalized.length,
      });
      return result;
    }

    // Write mode
    const resolvedSeasonId = opts.seasonId ?? (await this.findWcSeasonId());
    if (!resolvedSeasonId) {
      result.errors.push(
        'WC2026 season not found in DB — run seed or provide seasonId explicitly',
      );
      result.sourceStatus = 'PROVIDER_ERROR';
      return result;
    }

    await this.writeAuditLog('WORLD_CUP_FIXTURE_IMPORT_WRITE_ATTEMPTED', {
      provider: result.provider,
      seasonId: resolvedSeasonId,
      normalized: normalized.length,
    });

    const { created, updated, skipped, errors, warnings } = await this.upsertFixtures(
      normalized,
      resolvedSeasonId,
      result.provider,
    );
    result.created = created;
    result.updated = updated;
    result.skipped = skipped;
    result.errors.push(...errors);
    result.warnings.push(...warnings);

    this.logger.log(
      `WorldCupImportService: WRITE — created=${created} updated=${updated} skipped=${skipped}`,
    );
    await this.writeAuditLog('WORLD_CUP_FIXTURE_IMPORT_WRITE_COMPLETED', {
      provider: result.provider,
      seasonId: resolvedSeasonId,
      created,
      updated,
      skipped,
    });

    return result;
  }

  private normalizeFixtures(
    raw: ProviderFixture[],
  ): { externalId: string; homeTeamName: string; awayTeamName: string; kickoffAt: string; status: string; homeScore?: number; awayScore?: number }[] {
    return raw.filter(f => f.externalId && f.homeTeamName && f.awayTeamName).map(f => ({
      externalId: f.externalId,
      homeTeamName: f.homeTeamName,
      awayTeamName: f.awayTeamName,
      kickoffAt: f.kickoffAt ?? new Date().toISOString(),
      status: f.status ?? 'SCHEDULED',
      ...(f.homeScore !== undefined ? { homeScore: f.homeScore } : {}),
      ...(f.awayScore !== undefined ? { awayScore: f.awayScore } : {}),
    }));
  }

  private async buildCandidates(
    fixtures: { externalId: string; homeTeamName: string; awayTeamName: string; kickoffAt: string; status: string; homeScore?: number; awayScore?: number }[],
    providerSource: string,
  ): Promise<WorldCupImportCandidateDto[]> {
    const candidates: WorldCupImportCandidateDto[] = [];
    for (const f of fixtures) {
      const homeTeam = await this.resolveTeam(f.homeTeamName);
      const awayTeam = await this.resolveTeam(f.awayTeamName);
      const warnings: string[] = [];
      if (!homeTeam) warnings.push(`Home team not matched: "${f.homeTeamName}"`);
      if (!awayTeam) warnings.push(`Away team not matched: "${f.awayTeamName}"`);
      candidates.push({
        externalId: f.externalId,
        homeTeamName: f.homeTeamName,
        awayTeamName: f.awayTeamName,
        kickoffAt: f.kickoffAt,
        status: f.status,
        providerSource,
        teamResolution: {
          homeTeamMatched: !!homeTeam,
          awayTeamMatched: !!awayTeam,
          ...(homeTeam ? { homeTeamId: homeTeam.id } : {}),
          ...(awayTeam ? { awayTeamId: awayTeam.id } : {}),
          warnings,
        },
      });
    }
    return candidates;
  }

  /**
   * Maps football-data.org team names to the canonical names stored in the DB.
   * Keys are lowercase, apostrophes normalised. Values are DB-canonical.
   */
  private static readonly TEAM_ALIASES: Record<string, string> = {
    // Bosnia
    'bosnia-herzegovina': 'Bosnia and Herzegovina',
    'bosnia herzegovina': 'Bosnia and Herzegovina',
    'bih': 'Bosnia and Herzegovina',
    // Turkey / Türkiye
    'turkey': 'Türkiye',
    'turkiye': 'Türkiye',
    'tur': 'Türkiye',
    // Cape Verde
    'cape verde islands': 'Cape Verde',
    'cabo verde': 'Cape Verde',
    'cpv': 'Cape Verde',
    // DR Congo
    'congo dr': 'DR Congo',
    'democratic republic of congo': 'DR Congo',
    'democratic republic of the congo': 'DR Congo',
    'cod': 'DR Congo',
    // South Korea
    'korea republic': 'South Korea',
    'republic of korea': 'South Korea',
    'kor': 'South Korea',
    // Ivory Coast
    "ivory coast": "Côte d'Ivoire",
    "cote d'ivoire": "Côte d'Ivoire",
    "civ": "Côte d'Ivoire",
  };

  private async resolveTeam(name: string): Promise<{ id: string } | null> {
    // 1. Exact match
    const exact = await this.prisma.team.findFirst({ where: { name }, select: { id: true } });
    if (exact) return exact;

    // 2. Alias lookup — normalise input to lowercase + straighten apostrophes
    const normalised = name.toLowerCase().replace(/['']/g, "'").trim();
    const aliasedName = WorldCupImportService.TEAM_ALIASES[normalised];
    if (aliasedName) {
      const aliasMatch = await this.prisma.team.findFirst({ where: { name: aliasedName }, select: { id: true } });
      if (aliasMatch) return aliasMatch;
    }

    // 3. Contains fallback (insensitive)
    return this.prisma.team.findFirst({
      where: { name: { contains: name, mode: 'insensitive' } },
      select: { id: true },
    });
  }

  private async findWcSeasonId(): Promise<string | null> {
    // Find the active WC2026 season — match by externalId or name
    const season = await this.prisma.season.findFirst({
      where: {
        isActive: true,
        competition: {
          OR: [
            { externalId: { in: WC_COMPETITION_CODES } },
            { name: { contains: 'World Cup', mode: 'insensitive' } },
          ],
        },
      },
      select: { id: true },
    });
    if (season) return season.id;
    // Fallback: any WC season (active or not)
    const anyWc = await this.prisma.season.findFirst({
      where: {
        competition: {
          OR: [
            { externalId: { in: WC_COMPETITION_CODES } },
            { name: { contains: 'World Cup', mode: 'insensitive' } },
          ],
        },
      },
      select: { id: true },
    });
    return anyWc?.id ?? null;
  }

  private async upsertFixtures(
    fixtures: { externalId: string; homeTeamName: string; awayTeamName: string; kickoffAt: string; status: string; homeScore?: number; awayScore?: number }[],
    seasonId: string,
    providerSource: string,
  ): Promise<{ created: number; updated: number; skipped: number; errors: string[]; warnings: string[] }> {
    let created = 0; let updated = 0; let skipped = 0;
    const errors: string[] = []; const warnings: string[] = [];
    const now = new Date();

    for (const f of fixtures) {
      try {
        const homeTeam = await this.resolveTeam(f.homeTeamName);
        const awayTeam = await this.resolveTeam(f.awayTeamName);
        if (!homeTeam || !awayTeam) {
          warnings.push(`Team not matched: "${f.homeTeamName}" vs "${f.awayTeamName}"`);
          skipped++;
          continue;
        }
        const kickoffAt = new Date(f.kickoffAt);
        if (isNaN(kickoffAt.getTime())) {
          warnings.push(`Invalid kickoffAt for externalId=${f.externalId}`);
          skipped++;
          continue;
        }

        // Primary lookup: by providerFixtureId + providerSource (already provider-synced fixtures)
        let existing = await this.prisma.fixture.findFirst({
          where: { providerFixtureId: f.externalId, providerSource },
          select: { id: true, providerSource: true, providerFixtureId: true, importedAt: true, homeScore: true, awayScore: true },
        });

        // Cascade lookup: team + kickoff window matches seeded fixtures with no providerFixtureId
        if (!existing) {
          const windowStart = new Date(kickoffAt.getTime() - 2 * 60 * 60 * 1000);
          const windowEnd = new Date(kickoffAt.getTime() + 2 * 60 * 60 * 1000);
          existing = await this.prisma.fixture.findFirst({
            where: {
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              kickoffAt: { gte: windowStart, lte: windowEnd },
            },
            select: { id: true, providerSource: true, providerFixtureId: true, importedAt: true, homeScore: true, awayScore: true },
          });
        }

        if (existing) {
          // Preserve valid existing scores unless provider gives a new non-null value
          const scoreUpdates: { homeScore?: number | null; awayScore?: number | null } = {};
          if (f.homeScore !== undefined) {
            if (f.homeScore !== null || existing.homeScore == null) scoreUpdates.homeScore = f.homeScore;
          }
          if (f.awayScore !== undefined) {
            if (f.awayScore !== null || existing.awayScore == null) scoreUpdates.awayScore = f.awayScore;
          }

          await this.prisma.fixture.update({
            where: { id: existing.id },
            data: {
              kickoffAt,
              status: f.status as FixtureStatus,
              lastSyncedAt: now,
              // Backfill provider metadata on seeded fixtures
              ...(existing.providerSource == null ? { providerSource } : {}),
              ...(existing.providerFixtureId == null ? { providerFixtureId: f.externalId } : {}),
              ...(existing.importedAt == null ? { importedAt: now } : {}),
              ...scoreUpdates,
            },
          });
          updated++;
        } else {
          await this.prisma.fixture.create({
            data: {
              seasonId,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              kickoffAt,
              status: f.status as FixtureStatus,
              providerSource,
              providerFixtureId: f.externalId,
              externalId: f.externalId,
              importedAt: now,
              lastSyncedAt: now,
              isPublished: false,
              ...(f.homeScore != null ? { homeScore: f.homeScore } : {}),
              ...(f.awayScore != null ? { awayScore: f.awayScore } : {}),
            },
          });
          created++;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`externalId=${f.externalId}: ${msg}`);
      }
    }
    return { created, updated, skipped, errors, warnings };
  }

  /**
   * Refresh fixture statuses from football-data.org without creating new fixtures.
   * Maps external statuses to internal PSL One statuses.
   * Safety: noNewFixtures=true — only existing DB fixtures are updated.
   */
  async refreshFixtureStatuses(): Promise<{
    provider: string;
    sourceStatus: string;
    discovered: number;
    matched: number;
    updated: number;
    skipped: number;
    errors: string[];
    safety: { noNewFixtures: true; noRealMoney: true; noPslActivation: true };
  }> {
    const result = {
      provider: WC_PROVIDER_SOURCE,
      sourceStatus: 'SOURCE_EMPTY',
      discovered: 0,
      matched: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
      safety: { noNewFixtures: true as const, noRealMoney: true as const, noPslActivation: true as const },
    };

    const fdKey = process.env['FOOTBALL_DATA_API_KEY'];
    if (!fdKey) {
      result.sourceStatus = 'AUTH_FAILED';
      result.errors.push('FOOTBALL_DATA_API_KEY not set — cannot refresh statuses');
      await this.writeAuditLog('WORLD_CUP_FIXTURE_STATUS_REFRESH_FAILED', { reason: 'AUTH_FAILED' });
      return result;
    }

    let providerFixtures: ProviderFixture[] = [];
    try {
      const adapter = new FootballDataOrgAdapter();
      providerFixtures = await adapter.getFixtures('WC');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      result.sourceStatus = 'PROVIDER_ERROR';
      result.errors.push('PROVIDER_ERROR: ' + msg);
      this.logger.error(`refreshFixtureStatuses: fetch error — ${msg}`);
      await this.writeAuditLog('WORLD_CUP_FIXTURE_STATUS_REFRESH_FAILED', { reason: 'PROVIDER_ERROR' });
      return result;
    }

    result.discovered = providerFixtures.length;
    if (providerFixtures.length === 0) {
      result.sourceStatus = 'SOURCE_EMPTY';
      await this.writeAuditLog('WORLD_CUP_FIXTURE_STATUS_REFRESH_EMPTY', {});
      return result;
    }

    result.sourceStatus = 'SOURCE_AVAILABLE';
    const now = new Date();

    // Status mapping from provider values to internal enum
    const STATUS_MAP: Record<string, string> = {
      TIMED: 'SCHEDULED',
      SCHEDULED: 'SCHEDULED',
      not_started: 'SCHEDULED',
      IN_PLAY: 'LIVE',
      in_progress: 'LIVE',
      PAUSED: 'HALF_TIME',
      half_time: 'HALF_TIME',
      FINISHED: 'FINISHED',
      closed: 'FINISHED',
      ended: 'FINISHED',
      POSTPONED: 'POSTPONED',
      CANCELLED: 'CANCELLED',
      SUSPENDED: 'SUSPENDED',
    };

    for (const pf of providerFixtures) {
      try {
        const kickoffAt = pf.kickoffAt ? new Date(pf.kickoffAt) : null;
        if (!kickoffAt || isNaN(kickoffAt.getTime())) {
          result.skipped++;
          continue;
        }

        // Match by homeTeamName + awayTeamName + kickoffAt within ±24h window
        const windowStart = new Date(kickoffAt.getTime() - 24 * 60 * 60 * 1000);
        const windowEnd = new Date(kickoffAt.getTime() + 24 * 60 * 60 * 1000);

        const homeTeam = await this.resolveTeam(pf.homeTeamName);
        const awayTeam = await this.resolveTeam(pf.awayTeamName);
        if (!homeTeam || !awayTeam) {
          result.skipped++;
          continue;
        }

        const existing = await this.prisma.fixture.findFirst({
          where: {
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            kickoffAt: { gte: windowStart, lte: windowEnd },
          },
          select: { id: true, status: true, providerSource: true, providerFixtureId: true, importedAt: true, homeScore: true, awayScore: true },
        });

        if (!existing) {
          result.skipped++;
          continue;
        }

        result.matched++;
        const rawStatus = STATUS_MAP[pf.status ?? ''] ?? existing.status;
        const newStatus = rawStatus as FixtureStatus;

        // Preserve valid existing scores unless provider gives a new non-null value
        const scoreUpdates: { homeScore?: number | null; awayScore?: number | null } = {};
        if (pf.homeScore !== undefined) {
          if (pf.homeScore !== null || existing.homeScore == null) scoreUpdates.homeScore = pf.homeScore;
        }
        if (pf.awayScore !== undefined) {
          if (pf.awayScore !== null || existing.awayScore == null) scoreUpdates.awayScore = pf.awayScore;
        }

        await this.prisma.fixture.update({
          where: { id: existing.id },
          data: {
            status: newStatus,
            lastSyncedAt: now,
            // Backfill provider metadata on seeded fixtures
            ...(existing.providerSource == null ? { providerSource: WC_PROVIDER_SOURCE } : {}),
            ...(existing.providerFixtureId == null && pf.externalId ? { providerFixtureId: pf.externalId } : {}),
            ...(existing.importedAt == null ? { importedAt: now } : {}),
            ...scoreUpdates,
          },
        });
        result.updated++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(msg);
      }
    }

    this.logger.log(
      `refreshFixtureStatuses: discovered=${result.discovered} matched=${result.matched} updated=${result.updated} skipped=${result.skipped}`,
    );
    await this.writeAuditLog('WORLD_CUP_FIXTURE_STATUS_REFRESH', {
      provider: result.provider,
      discovered: result.discovered,
      matched: result.matched,
      updated: result.updated,
      skipped: result.skipped,
    });
    return result;
  }

  private async writeAuditLog(action: string, metadata: Record<string, unknown>): Promise<void> {
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          action,
          entityType: 'world_cup_import',
          route: '/admin/data-provider/world-cup/fixtures/import',
          metadata: metadata as never,
        },
      });
    } catch {
      this.logger.warn(`WorldCupImportService: audit log write failed for action=${action}`);
    }
  }
}
