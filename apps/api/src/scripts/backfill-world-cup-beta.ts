/**
 * World Cup beta backfill harness.
 *
 * Default: dry-run only.
 * Confirmed mode requires --confirm=BACKFILL_WORLD_CUP_BETA and ALLOW_WORLD_CUP_WRITE=true.
 *
 * Safe usage:
 *   pnpm --filter @psl-one/api backfill:world-cup-beta -- --dry-run
 *   pnpm --filter @psl-one/api backfill:world-cup-beta -- --confirm=BACKFILL_WORLD_CUP_BETA
 *
 * The script reuses WorldCupBetaBackfillService, which:
 *   - backfills the WC competition + season if missing
 *   - upserts WC fantasy/prediction rules
 *   - populates the WC player pool from seed data
 *   - enriches players/teams from Sportmonks when available
 *   - writes SeasonTeam, SeasonSquadRegistration, and FantasyPlayerPrice rows
 *   - is idempotent by design
 */

import { PrismaClient } from '@prisma/client';
import { WorldCupBetaBackfillService } from '../data-provider/world-cup-beta-backfill.service';

const BACKFILL_CONFIRM = 'BACKFILL_WORLD_CUP_BETA';

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
  const isDryRun = !args['confirm'];

  if (!isDryRun && args['confirm'] !== BACKFILL_CONFIRM) {
    console.error(`Error: confirmed mode requires --confirm=${BACKFILL_CONFIRM}`);
    process.exit(1);
  }

  if (isDryRun) {
    console.log('[WC-BACKFILL] Running in DRY-RUN mode — no database writes will occur.');
  } else {
    console.log('[WC-BACKFILL] Running in CONFIRMED mode — seed + provider enrichment will be written to the database.');
    console.log('[WC-BACKFILL] Settlement is idempotent: re-running this backfill is safe.');
  }

  const prisma = new PrismaClient();

  try {
    const svc = new WorldCupBetaBackfillService(prisma);
    const result = await svc.run({
      dryRun: isDryRun,
      ...(isDryRun ? {} : { confirm: BACKFILL_CONFIRM }),
    });

    console.log('\n' + JSON.stringify(result, null, 2));

    console.log('\n[WC-BACKFILL] Summary:');
    console.log(`  Provider: ${result.provider}`);
    console.log(`  Season: ${result.seasonId}`);
    console.log(`  Teams: ${result.teamsMatchedToProvider}/${result.teamsPlanned} matched to provider`);
    console.log(`  Players: ${result.playersMatchedToProvider}/${result.playersPlanned} matched to provider`);
    console.log(`  Player external IDs backfilled: ${result.playersExternalIdsBackfilled}`);
    console.log(`  Season teams upserted: ${result.seasonTeamsUpserted}`);
    console.log(`  Squad registrations upserted: ${result.squadRegistrationsUpserted}`);
    console.log(`  Fantasy prices upserted: ${result.fantasyPricesUpserted}`);
    console.log(`  Fantasy rules upserted: ${result.fantasyRulesUpserted}`);
    console.log(`  Prediction rules upserted: ${result.predictionRulesUpserted}`);
    console.log(`  Fallback to seed data: ${result.fallbackToSeedData}`);

    if (isDryRun) {
      console.log(`\n[WC-BACKFILL] Dry-run complete. Use --confirm=${BACKFILL_CONFIRM} to persist results.`);
    } else {
      console.log('\n[WC-BACKFILL] Confirmed backfill complete.');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n[WC-BACKFILL] Error: ${message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
