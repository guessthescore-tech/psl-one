import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParsePslAdapter } from './parse-psl.adapter';
import type { ProviderFixture } from './provider-adapter.interface';

export type FixtureIngestionResult = {
  provider: 'parse-psl';
  competitionCode: string;
  dryRun: boolean;
  sourceStatus:
    | 'SOURCE_EMPTY'
    | 'SOURCE_AVAILABLE'
    | 'AUTH_FAILED'
    | 'RATE_LIMITED'
    | 'PROVIDER_ERROR'
    | 'SCHEMA_CHANGED';
  discovered: number;
  normalized: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  warnings: string[];
};

type NormalizedFixture = {
  externalId: string;
  homeTeamName: string;
  awayTeamName: string;
  kickoffAt: string;
  status: string;
  round: string | null;
};

/**
 * Manual, idempotent, dry-run-first fixture ingestion service for Parse PSL.
 *
 * Default mode is dryRun=true — no DB writes occur unless the caller explicitly
 * passes dryRun=false AND provides a seasonId for write operations.
 *
 * Source-empty (psl.co.za has not published fixtures) is treated as a successful
 * no-op, not a failure. No PSL activation occurs. No scheduler is wired.
 *
 * Key is never logged.
 */
@Injectable()
export class ParsePslFixtureIngestionService {
  private readonly logger = new Logger(ParsePslFixtureIngestionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ingest(opts: {
    competitionCode?: string;
    dryRun?: boolean;
    seasonId?: string;
  }): Promise<FixtureIngestionResult> {
    const competitionCode = opts.competitionCode ?? 'BETWAY_PREMIERSHIP';
    const dryRun = opts.dryRun !== false; // default true

    const result: FixtureIngestionResult = {
      provider: 'parse-psl',
      competitionCode,
      dryRun,
      sourceStatus: 'SOURCE_EMPTY',
      discovered: 0,
      normalized: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      warnings: [],
    };

    const adapter = new ParsePslAdapter();

    if (!process.env['PARSE_API_KEY']) {
      result.sourceStatus = 'AUTH_FAILED';
      result.errors.push('PARSE_API_KEY not set — cannot fetch fixtures');
      this.logger.warn('ParsePslFixtureIngestionService: PARSE_API_KEY not set');
      return result;
    }

    // Fetch from provider
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
      return result;
    }

    result.discovered = providerFixtures.length;

    // Source-empty: valid seasonal no-op
    if (providerFixtures.length === 0) {
      result.sourceStatus = 'SOURCE_EMPTY';
      result.skipped = 0;
      this.logger.log(
        'ParsePslFixtureIngestionService: INGESTION_SOURCE_EMPTY_NOOP — ' +
        'psl.co.za has not published new-season fixtures (expected seasonal state)',
      );
      return result;
    }

    // Normalize
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

    if (dryRun) {
      // Dry run: count what would happen without touching DB
      result.skipped = normalized.length;
      this.logger.log(
        `ParsePslFixtureIngestionService: DRY_RUN — ` +
        `${normalized.length} fixture(s) normalized; 0 DB writes`,
      );
      return result;
    }

    // Write mode — requires seasonId
    if (!opts.seasonId) {
      result.errors.push('seasonId required for write mode; aborting');
      result.sourceStatus = 'PROVIDER_ERROR';
      return result;
    }

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
        round: null,
      });
    }
    return results;
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
        // Resolve teams by name
        const homeTeam = await this.prisma.team.findFirst({
          where: { name: { contains: f.homeTeamName, mode: 'insensitive' } },
          select: { id: true },
        });
        const awayTeam = await this.prisma.team.findFirst({
          where: { name: { contains: f.awayTeamName, mode: 'insensitive' } },
          select: { id: true },
        });

        if (!homeTeam || !awayTeam) {
          warnings.push(
            `Team not matched: "${f.homeTeamName}" vs "${f.awayTeamName}" (externalId=${f.externalId})`,
          );
          skipped++;
          continue;
        }

        // Check for existing fixture by providerFixtureId + providerSource
        const existing = await this.prisma.fixture.findFirst({
          where: {
            providerFixtureId: f.externalId,
            providerSource: 'parse-psl',
          },
          select: { id: true },
        });

        const kickoffAt = new Date(f.kickoffAt);
        if (isNaN(kickoffAt.getTime())) {
          warnings.push(`Invalid kickoffAt for externalId=${f.externalId}: "${f.kickoffAt}"`);
          skipped++;
          continue;
        }

        if (existing) {
          // Idempotent update — only advance-safe fields
          await this.prisma.fixture.update({
            where: { id: existing.id },
            data: {
              kickoffAt,
              lastSyncedAt: now,
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
              status: 'SCHEDULED',
              providerSource: 'parse-psl',
              providerFixtureId: f.externalId,
              externalId: f.externalId,
              sourceUrl: 'https://api.parse.bot/scraper/0c2008df-2286-497a-a5cb-55dd56ec9a4e/get_fixtures',
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
}
