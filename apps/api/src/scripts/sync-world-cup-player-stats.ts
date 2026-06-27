/**
 * World Cup provider player-stat sync harness.
 *
 * Default: dry-run only.
 * Confirmed mode requires --confirm=SYNC_PROVIDER_PLAYER_STATS.
 *
 * Safe usage:
 *   pnpm --filter @psl-one/api sync:world-cup-player-stats -- --dry-run
 *   pnpm --filter @psl-one/api sync:world-cup-player-stats -- --confirm=SYNC_PROVIDER_PLAYER_STATS
 *
 * The script reuses LiveMatchService.syncProviderPlayerStats(), which already:
 *   - maps provider player stats into FantasyPlayerMatchStat
 *   - records AdminAuditLog entries on confirmed writes
 *   - is idempotent by player + fixture
 *   - requires explicit confirmation for writes
 */

import { PrismaClient } from '@prisma/client';
import { LiveMatchService } from '../football/live-match.service';
import type { PrismaService } from '../prisma/prisma.service';

const SYNC_CONFIRM = 'SYNC_PROVIDER_PLAYER_STATS';
const DEFAULT_SEASON_SLUG = 'fifa-world-cup-2026';

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (const arg of argv.slice(2)) {
    const match = arg.match(/^--([^=]+)(?:=(.*))?$/);
    if (match && match[1]) {
      args[match[1]] = match[2] ?? 'true';
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const fixtureId = args['fixtureId'];
  const seasonSlug = args['seasonSlug'] ?? DEFAULT_SEASON_SLUG;
  const isDryRun = !args['confirm'];

  if (!isDryRun && args['confirm'] !== SYNC_CONFIRM) {
    console.error(`Error: confirmed mode requires --confirm=${SYNC_CONFIRM}`);
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const service = new LiveMatchService(prisma as unknown as PrismaService);

  try {
    const fixtures = fixtureId
      ? await prisma.fixture.findMany({
          where: {
            id: fixtureId,
            status: 'FINISHED',
            providerFixtureId: { not: null },
            season: { slug: seasonSlug },
          },
          select: {
            id: true,
            providerFixtureId: true,
            homeScore: true,
            awayScore: true,
            kickoffAt: true,
            homeTeam: { select: { shortName: true } },
            awayTeam: { select: { shortName: true } },
          },
        })
      : await prisma.fixture.findMany({
          where: {
            status: 'FINISHED',
            providerFixtureId: { not: null },
            season: { slug: seasonSlug },
          },
          select: {
            id: true,
            providerFixtureId: true,
            homeScore: true,
            awayScore: true,
            kickoffAt: true,
            homeTeam: { select: { shortName: true } },
            awayTeam: { select: { shortName: true } },
          },
          orderBy: { kickoffAt: 'asc' },
        });

    console.log(
      `[WC-SYNC] ${isDryRun ? 'DRY-RUN' : 'CONFIRMED'} mode — season=${seasonSlug} fixtures=${fixtures.length}`,
    );

    if (fixtures.length === 0) {
      console.log('[WC-SYNC] No finished fixtures with providerFixtureId found.');
      return;
    }

    const summary = {
      total: fixtures.length,
      synced: 0,
      skipped: 0,
      written: 0,
      wouldWrite: 0,
      unmapped: 0,
    };

    for (const fixture of fixtures) {
      const result = await service.syncProviderPlayerStats(
        fixture.id,
        isDryRun
          ? { dryRun: true }
          : { dryRun: false, confirm: SYNC_CONFIRM },
        null,
      );

      const label = `${fixture.homeTeam.shortName} ${fixture.homeScore ?? '?'}-${fixture.awayScore ?? '?'} ${fixture.awayTeam.shortName}`;
      const reason = 'reason' in result ? ((result as { reason?: string }).reason ?? null) : null;
      if (result.synced) summary.synced++;
      else summary.skipped++;

      summary.written += result.written;
      summary.wouldWrite += result.wouldWrite;
      summary.unmapped += result.unmapped.length;

      console.log(
        [
          `[WC-SYNC] ${fixture.id} ${label}`,
          `provider=${result.provider}`,
          `dryRun=${result.dryRun}`,
          `fetched=${result.fetched}`,
          `mapped=${result.mapped}`,
          `written=${result.written}`,
          `unmapped=${result.unmapped.length}`,
          reason ? `reason=${reason}` : null,
        ]
          .filter(Boolean)
          .join(' | '),
      );
    }

    console.log('\n[WC-SYNC] Summary:');
    console.log(JSON.stringify(summary, null, 2));
    if (isDryRun) {
      console.log(`\n[WC-SYNC] Dry-run complete. Use --confirm=${SYNC_CONFIRM} to persist results.`);
    } else {
      console.log('\n[WC-SYNC] Confirmed sync complete. FantasyPlayerMatchStat rows updated.');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n[WC-SYNC] Error: ${message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
