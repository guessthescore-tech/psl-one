/**
 * Historical replay harness for completed World Cup fixtures.
 *
 * Usage:
 *   pnpm --filter @psl-one/api replay:world-cup-fixture -- --fixtureId=<id> --dry-run
 *   pnpm --filter @psl-one/api replay:world-cup-fixture -- --fixtureId=<id> --confirm=REPLAY_WORLD_CUP_BETA
 *
 * Dry-run is the default and never writes to the database.
 * Confirmed mode seeds synthetic users + predictions + fantasy teams and runs settlement.
 *
 * Safety rules (non-negotiable):
 *   - Does NOT activate the PSL season.
 *   - Does NOT modify World Cup 2026 historical fixture data.
 *   - Only writes to synthetic-user records (email: @wc-beta.internal) and ledger tables.
 *   - Settlement is idempotent: re-running the same fixture is safe.
 */

import { PrismaClient } from '@prisma/client';
import { WcFixtureReplayService } from '../replay/wc-fixture-replay.service';

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
  if (!fixtureId) {
    console.error('Error: --fixtureId=<id> is required');
    console.error('Usage: pnpm --filter @psl-one/api replay:world-cup-fixture -- --fixtureId=<id> [--dry-run | --confirm=REPLAY_WORLD_CUP_BETA]');
    process.exit(1);
  }

  const isDryRun = !args['confirm'];

  if (!isDryRun && args['confirm'] !== 'REPLAY_WORLD_CUP_BETA') {
    console.error('Error: confirmed mode requires --confirm=REPLAY_WORLD_CUP_BETA');
    process.exit(1);
  }

  if (isDryRun) {
    console.log('[WC-REPLAY] Running in DRY-RUN mode — no database writes will occur.');
  } else {
    console.log('[WC-REPLAY] Running in CONFIRMED mode — synthetic data will be written to the database.');
    console.log('[WC-REPLAY] Settlement is idempotent: re-running this fixture is safe.');
  }

  const prisma = new PrismaClient();

  try {
    const svc = new WcFixtureReplayService(prisma);
    const result = await svc.run(fixtureId, { dryRun: isDryRun });

    console.log('\n' + JSON.stringify(result, null, 2));

    console.log('\n[WC-REPLAY] Summary:');
    console.log(`  Fixture: ${result.fixture.homeTeam} ${result.fixture.homeScore}–${result.fixture.awayScore} ${result.fixture.awayTeam}`);
    console.log(`  GTS: ${result.gts.predictionsSettled} settled, ${result.gts.lateRejected} late, ${result.gts.totalPointsAwarded} pts total`);
    if (result.fantasy.skipped) {
      console.log(`  Fantasy: SKIPPED — ${result.fantasy.skipReason}`);
    } else {
      const totalPlayers = result.fantasy.teams.reduce((s, t) => s + t.players.length, 0);
      console.log(`  Fantasy: ${totalPlayers} players scored, ${result.fantasy.teamsScored} team(s), ${result.fantasy.totalPointsWritten} pts total`);
    }

    if (isDryRun) {
      console.log('\n[WC-REPLAY] Dry-run complete. Use --confirm=REPLAY_WORLD_CUP_BETA to persist results.');
    } else {
      console.log('\n[WC-REPLAY] Confirmed run complete. Ledger entries written.');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n[WC-REPLAY] Error: ${message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
