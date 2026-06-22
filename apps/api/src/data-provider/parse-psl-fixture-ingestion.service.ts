import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParsePslAdapter } from './parse-psl.adapter';
import type { ProviderFixture } from './provider-adapter.interface';
import type {
  ParsePslFixtureCandidateDto,
  ParsePslIngestionPreviewResponseDto,
} from './dto/parse-psl-fixture-ingestion.dto';

export type { ParsePslIngestionPreviewResponseDto as FixtureIngestionResult };

const PROVIDER_SOURCE_URL =
  'https://api.parse.bot/scraper/0c2008df-2286-497a-a5cb-55dd56ec9a4e/get_fixtures';

type NormalizedFixture = {
  externalId: string;
  homeTeamName: string;
  awayTeamName: string;
  kickoffAt: string;
  status: string;
};

type IngestOpts = {
  competitionCode?: string;
  dryRun?: boolean;
  seasonId?: string;
  includeCandidates?: boolean;
};

/**
 * Manual, idempotent, dry-run-first fixture ingestion service for Parse PSL.
 *
 * Default mode is dryRun=true — no DB writes occur unless the caller explicitly
 * passes dryRun=false AND provides a seasonId.
 *
 * Source-empty (psl.co.za has not published fixtures) is treated as a successful
 * no-op, not a failure. No PSL activation occurs. No scheduler is wired.
 *
 * PARSE_API_KEY is never logged.
 */
@Injectable()
export class ParsePslFixtureIngestionService {
  private readonly logger = new Logger(ParsePslFixtureIngestionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ingest(opts: IngestOpts): Promise<ParsePslIngestionPreviewResponseDto> {
    const competitionCode = opts.competitionCode ?? 'BETWAY_PREMIERSHIP';
    const dryRun = opts.dryRun !== false; // default true
    const includeCandidates = opts.includeCandidates !== false || dryRun; // always true for dry-run

    const result: ParsePslIngestionPreviewResponseDto = {
      provider: 'parse-psl',
      competitionCode,
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
    };

    const adapter = new ParsePslAdapter();

    if (!process.env['PARSE_API_KEY']) {
      result.sourceStatus = 'AUTH_FAILED';
      result.errors.push('PARSE_API_KEY not set — cannot fetch fixtures');
      this.logger.warn('ParsePslFixtureIngestionService: PARSE_API_KEY not set');
      await this.writeAuditLog('PARSE_PSL_FIXTURE_INGESTION_FAILED', { reason: 'AUTH_FAILED' });
      return result;
    }

    let providerFixtures: ProviderFixture[] = [];
    try {
      providerFixtures = await adapter.getFixtures(competitionCode);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('429') || msg.toLowerCase().includes('rate')) {
        result.sourceStatus = 'RATE_LIMITED';
        result.errors.push('INGESTION_RATE_LIMITED: ' + msg);
      } else if (msg.toLowerCase().includes('401') || msg.toLowerCase().includes('403') || msg.toLowerCase().includes('auth')) {
        result.sourceStatus = 'AUTH_FAILED';
        result.errors.push('INGESTION_AUTH_FAILED: ' + msg);
      } else {
        result.sourceStatus = 'PROVIDER_ERROR';
        result.errors.push('INGESTION_PROVIDER_ERROR: ' + msg);
      }
      this.logger.error(`ParsePslFixtureIngestionService: fetch error — ${msg}`);
      await this.writeAuditLog('PARSE_PSL_FIXTURE_INGESTION_FAILED', { reason: result.sourceStatus });
      return result;
    }

    result.discovered = providerFixtures.length;

    if (providerFixtures.length === 0) {
      result.sourceStatus = 'SOURCE_EMPTY';
      this.logger.log(
        'ParsePslFixtureIngestionService: INGESTION_SOURCE_EMPTY_NOOP — ' +
        'psl.co.za has not published new-season fixtures (expected seasonal state)',
      );
      await this.writeAuditLog('PARSE_PSL_FIXTURE_INGESTION_SOURCE_EMPTY', { competitionCode });
      return result;
    }

    const normalized = this.normalizeFixtures(providerFixtures);
    result.normalized = normalized.length;
    result.sourceStatus = 'SOURCE_AVAILABLE';

    if (normalized.length < providerFixtures.length) {
      result.warnings.push(
        `SCHEMA_CHANGED: ${providerFixtures.length - normalized.length} fixtures could not be normalized`,
      );
      if (normalized.length === 0) {
        result.sourceStatus = 'SCHEMA_CHANGED';
        return result;
      }
    }

    // Build candidate DTOs (always include on dry-run; optional on write)
    if (includeCandidates) {
      result.candidates = await this.buildCandidates(normalized);
      for (const c of result.candidates) {
        result.warnings.push(...c.teamResolution.warnings);
      }
    }

    if (dryRun) {
      result.skipped = normalized.length;
      this.logger.log(
        `ParsePslFixtureIngestionService: DRY_RUN — ${normalized.length} fixture(s) normalized; 0 DB writes`,
      );
      await this.writeAuditLog('PARSE_PSL_FIXTURE_INGESTION_DRY_RUN', {
        competitionCode,
        normalized: normalized.length,
        candidates: result.candidates.length,
      });
      return result;
    }

    // Write mode — requires seasonId
    if (!opts.seasonId) {
      result.errors.push('seasonId required for write mode; aborting');
      result.sourceStatus = 'PROVIDER_ERROR';
      return result;
    }

    await this.writeAuditLog('PARSE_PSL_FIXTURE_INGESTION_WRITE_ATTEMPTED', {
      competitionCode,
      seasonId: opts.seasonId,
      normalized: normalized.length,
    });

    const { created, updated, skipped, errors, warnings } = await this.upsertFixtures(
      normalized,
      opts.seasonId,
    );
    result.created = created;
    result.updated = updated;
    result.skipped = skipped;
    result.errors.push(...errors);
    result.warnings.push(...warnings);

    this.logger.log(
      `ParsePslFixtureIngestionService: WRITE — ` +
      `created=${created} updated=${updated} skipped=${skipped} errors=${errors.length}`,
    );

    await this.writeAuditLog('PARSE_PSL_FIXTURE_INGESTION_WRITE_COMPLETED', {
      competitionCode,
      seasonId: opts.seasonId,
      created,
      updated,
      skipped,
    });

    return result;
  }

  private normalizeFixtures(raw: ProviderFixture[]): NormalizedFixture[] {
    const results: NormalizedFixture[] = [];
    for (const f of raw) {
      if (!f.externalId || !f.homeTeamName || !f.awayTeamName) {
        continue;
      }
      results.push({
        externalId: f.externalId,
        homeTeamName: f.homeTeamName,
        awayTeamName: f.awayTeamName,
        kickoffAt: f.kickoffAt ?? new Date().toISOString(),
        status: f.status ?? 'SCHEDULED',
      });
    }
    return results;
  }

  private async buildCandidates(fixtures: NormalizedFixture[]): Promise<ParsePslFixtureCandidateDto[]> {
    const candidates: ParsePslFixtureCandidateDto[] = [];
    for (const f of fixtures) {
      const homeTeam = await this.resolveTeam(f.homeTeamName);
      const awayTeam = await this.resolveTeam(f.awayTeamName);

      const warnings: string[] = [];
      if (!homeTeam) warnings.push(`Home team not matched: "${f.homeTeamName}"`);
      if (!awayTeam) warnings.push(`Away team not matched: "${f.awayTeamName}"`);

      const candidate: ParsePslFixtureCandidateDto = {
        externalId: f.externalId,
        homeTeamName: f.homeTeamName,
        awayTeamName: f.awayTeamName,
        kickoffAt: f.kickoffAt,
        status: f.status,
        providerSource: 'parse-psl',
        providerFixtureId: f.externalId,
        sourceUrl: PROVIDER_SOURCE_URL,
        teamResolution: {
          homeTeamMatched: !!homeTeam,
          awayTeamMatched: !!awayTeam,
          ...(homeTeam ? { homeTeamId: homeTeam.id } : {}),
          ...(awayTeam ? { awayTeamId: awayTeam.id } : {}),
          warnings,
        },
      };
      candidates.push(candidate);
    }
    return candidates;
  }

  private async resolveTeam(name: string): Promise<{ id: string } | null> {
    // Exact match first, then case-insensitive contains
    const exact = await this.prisma.team.findFirst({
      where: { name },
      select: { id: true },
    });
    if (exact) return exact;

    return this.prisma.team.findFirst({
      where: { name: { contains: name, mode: 'insensitive' } },
      select: { id: true },
    });
  }

  private async upsertFixtures(
    fixtures: NormalizedFixture[],
    seasonId: string,
  ): Promise<{ created: number; updated: number; skipped: number; errors: string[]; warnings: string[] }> {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];
    const warnings: string[] = [];
    const now = new Date();

    for (const f of fixtures) {
      try {
        const homeTeam = await this.resolveTeam(f.homeTeamName);
        const awayTeam = await this.resolveTeam(f.awayTeamName);

        if (!homeTeam || !awayTeam) {
          warnings.push(`Team not matched: "${f.homeTeamName}" vs "${f.awayTeamName}" (externalId=${f.externalId})`);
          skipped++;
          continue;
        }

        const existing = await this.prisma.fixture.findFirst({
          where: { providerFixtureId: f.externalId, providerSource: 'parse-psl' },
          select: { id: true },
        });

        const kickoffAt = new Date(f.kickoffAt);
        if (isNaN(kickoffAt.getTime())) {
          warnings.push(`Invalid kickoffAt for externalId=${f.externalId}: "${f.kickoffAt}"`);
          skipped++;
          continue;
        }

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
              providerSource: 'parse-psl',
              providerFixtureId: f.externalId,
              externalId: f.externalId,
              sourceUrl: PROVIDER_SOURCE_URL,
              importedAt: now,
              lastSyncedAt: now,
              isPublished: false, // admin must publish explicitly
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
          entityType: 'fixture_ingestion',
          route: '/admin/data-provider/parse-psl/fixtures/ingest',
          metadata: metadata as never,
        },
      });
    } catch {
      // Audit log failure must never block ingestion
      this.logger.warn(`ParsePslFixtureIngestionService: audit log write failed for action=${action}`);
    }
  }
}
