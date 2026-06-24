import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FootballDataOrgAdapter } from './football-data-org.adapter';
import { SportRadarSoccerAdapter } from './sportradar-soccer.adapter';
import type { ProviderFixture } from './provider-adapter.interface';
import type {
  WorldCupImportCandidateDto,
  WorldCupImportRequestDto,
  WorldCupImportResponseDto,
} from './dto/world-cup-import.dto';

const WC_PROVIDER_SOURCE = 'football-data-org';
const WC_COMPETITION_CODES = ['WC', 'WORLD_CUP_2026', 'FIFA_WORLD_CUP', 'WC2026'];
const WRITE_CONFIRM_VALUE = 'IMPORT_WORLD_CUP_BETA';
const WRITE_ENV_FLAG = 'ALLOW_WORLD_CUP_WRITE';

/**
 * World Cup 2026 fixture import service.
 *
 * Imports WC fixtures from football-data.org (primary) or SportRadar (fallback).
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
      } else {
        // Default: football-data-org
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
  ): { externalId: string; homeTeamName: string; awayTeamName: string; kickoffAt: string; status: string }[] {
    return raw.filter(f => f.externalId && f.homeTeamName && f.awayTeamName).map(f => ({
      externalId: f.externalId,
      homeTeamName: f.homeTeamName,
      awayTeamName: f.awayTeamName,
      kickoffAt: f.kickoffAt ?? new Date().toISOString(),
      status: f.status ?? 'SCHEDULED',
    }));
  }

  private async buildCandidates(
    fixtures: { externalId: string; homeTeamName: string; awayTeamName: string; kickoffAt: string; status: string }[],
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

  private async resolveTeam(name: string): Promise<{ id: string } | null> {
    const exact = await this.prisma.team.findFirst({ where: { name }, select: { id: true } });
    if (exact) return exact;
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
    fixtures: { externalId: string; homeTeamName: string; awayTeamName: string; kickoffAt: string; status: string }[],
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
        const existing = await this.prisma.fixture.findFirst({
          where: { providerFixtureId: f.externalId, providerSource },
          select: { id: true },
        });
        if (existing) {
          await this.prisma.fixture.update({
            where: { id: existing.id },
            data: { kickoffAt, lastSyncedAt: now },
          });
          updated++;
        } else {
          await this.prisma.fixture.create({
            data: {
              seasonId,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              kickoffAt,
              status: 'SCHEDULED',
              providerSource,
              providerFixtureId: f.externalId,
              externalId: f.externalId,
              importedAt: now,
              lastSyncedAt: now,
              isPublished: false,
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
