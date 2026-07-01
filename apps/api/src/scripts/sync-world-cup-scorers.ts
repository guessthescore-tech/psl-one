/**
 * World Cup 2026 top-scorers import from football-data.org /v4/competitions/WC/scorers.
 *
 * The FDO free tier exposes competition-aggregate scorers (total goals + assists for the
 * whole tournament) but NOT per-match lineups. This script bridges that gap by writing
 * ONE aggregate PlayerMatchStats row per scorer, attached to the team's first finished
 * fixture in the season. This gives the leaderboard real data without requiring a paid FDO tier.
 *
 * Idempotent: upsert on (playerId, fixtureId).
 * Requires explicit confirmation: --confirm=SYNC_WC_SCORERS
 *
 * Usage:
 *   pnpm --filter @psl-one/api sync:world-cup-scorers -- --dry-run
 *   pnpm --filter @psl-one/api sync:world-cup-scorers -- --confirm=SYNC_WC_SCORERS
 */

import { PrismaClient, PlayerMatchStatsStatus, PlayerMatchStatsSource } from '@prisma/client';

const CONFIRM_TOKEN = 'SYNC_WC_SCORERS';
const WC_SEASON_SLUG = 'fifa-world-cup-2026';
const FDO_BASE = 'https://api.football-data.org';
const SCORERS_LIMIT = 100;

interface FdoScorer {
  player: { id: number; name: string };
  team: { id: number; name: string; tla: string };
  playedMatches: number;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

interface FdoScorersResponse {
  scorers: FdoScorer[];
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (const arg of argv.slice(2)) {
    const m = arg.match(/^--([^=]+)(?:=(.*))?$/);
    if (m?.[1]) args[m[1]] = m[2] ?? 'true';
  }
  return args;
}

export function normalise(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function fetchScorers(apiKey: string): Promise<FdoScorer[]> {
  const res = await fetch(
    `${FDO_BASE}/v4/competitions/WC/scorers?limit=${SCORERS_LIMIT}`,
    { headers: { 'X-Auth-Token': apiKey }, signal: AbortSignal.timeout(10000) },
  );
  if (!res.ok) {
    console.error(`[WC-SCORERS] FDO scorers HTTP ${res.status}`);
    return [];
  }
  const data = (await res.json()) as FdoScorersResponse;
  return data.scorers ?? [];
}

async function main() {
  const args = parseArgs(process.argv);
  const isDryRun = !args['confirm'];
  if (!isDryRun && args['confirm'] !== CONFIRM_TOKEN) {
    console.error(`Error: confirmed mode requires --confirm=${CONFIRM_TOKEN}`);
    process.exit(1);
  }

  const apiKey = process.env['FOOTBALL_DATA_API_KEY'];
  if (!apiKey) {
    console.error('[WC-SCORERS] FOOTBALL_DATA_API_KEY not set');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log(`[WC-SCORERS] ${isDryRun ? 'DRY-RUN' : 'CONFIRMED'} mode`);

    const season = await prisma.season.findFirst({
      where: { slug: WC_SEASON_SLUG },
      select: { id: true, name: true },
    });
    if (!season) {
      console.error(`[WC-SCORERS] Season '${WC_SEASON_SLUG}' not found — run backfill first`);
      process.exit(1);
    }
    console.log(`[WC-SCORERS] Season: ${season.name} (${season.id})`);

    // Fetch all finished WC fixtures
    const finishedFixtures = await prisma.fixture.findMany({
      where: { seasonId: season.id, status: 'FINISHED' },
      select: {
        id: true,
        homeTeamId: true,
        awayTeamId: true,
        homeTeam: { select: { externalId: true, name: true, shortName: true } },
        awayTeam: { select: { externalId: true, name: true, shortName: true } },
        kickoffAt: true,
      },
      orderBy: { kickoffAt: 'asc' },
    });

    if (finishedFixtures.length === 0) {
      console.error('[WC-SCORERS] No finished WC fixtures found');
      process.exit(1);
    }
    console.log(`[WC-SCORERS] Finished fixtures available: ${finishedFixtures.length}`);

    // Build fixture index: team externalId → first fixture they appear in
    const teamFirstFixture = new Map<string, string>(); // teamExternalId → fixtureId
    for (const f of finishedFixtures) {
      const homeExt = f.homeTeam.externalId;
      const awayExt = f.awayTeam.externalId;
      if (homeExt && !teamFirstFixture.has(homeExt)) teamFirstFixture.set(homeExt, f.id);
      if (awayExt && !teamFirstFixture.has(awayExt)) teamFirstFixture.set(awayExt, f.id);
    }

    // Load all WC players indexed by externalId and by name+team
    const players = await prisma.player.findMany({
      where: { team: { seasonTeams: { some: { seasonId: season.id } } } },
      select: {
        id: true,
        name: true,
        externalId: true,
        teamId: true,
        team: { select: { id: true, externalId: true, name: true, shortName: true } },
      },
    });

    const playerByExtId = new Map<string, typeof players[number]>();
    const playerByNormNameTeam = new Map<string, typeof players[number]>();

    for (const p of players) {
      if (p.externalId) playerByExtId.set(p.externalId, p);
      const key = `${normalise(p.name)}|${normalise(p.team?.name ?? '')}`;
      if (!playerByNormNameTeam.has(key)) playerByNormNameTeam.set(key, p);
    }

    // Fetch scorers from FDO
    const scorers = await fetchScorers(apiKey);
    console.log(`[WC-SCORERS] FDO returned ${scorers.length} scorers`);

    const summary = { total: scorers.length, matched: 0, written: 0, skipped: 0, noFixture: 0 };

    for (const scorer of scorers) {
      const fdoPlayerId = String(scorer.player.id);
      const fdoTeamId = String(scorer.team.id);

      // 1. Try exact externalId match
      let player = playerByExtId.get(fdoPlayerId) ?? null;

      // 2. Try normalised name + team name match
      if (!player) {
        const key = `${normalise(scorer.player.name)}|${normalise(scorer.team.name)}`;
        player = playerByNormNameTeam.get(key) ?? null;
      }

      // 3. Try normalised name + team TLA match (for teams whose name differs)
      if (!player) {
        const keyTla = `${normalise(scorer.player.name)}|${normalise(scorer.team.tla)}`;
        for (const [k, v] of playerByNormNameTeam) {
          const [normName] = k.split('|');
          const teamNormShort = normalise(v.team?.shortName ?? '');
          if (normName === normalise(scorer.player.name) && teamNormShort === normalise(scorer.team.tla)) {
            player = v;
            break;
          }
        }
      }

      if (!player) {
        console.log(
          `[WC-SCORERS] SKIP ${scorer.player.name} (${scorer.team.tla}) — no player match`,
        );
        summary.skipped++;
        continue;
      }
      summary.matched++;

      // Find team's first finished fixture
      const teamExtId = player.team?.externalId ?? fdoTeamId;
      const fixtureId = teamFirstFixture.get(teamExtId) ?? finishedFixtures[0]?.id;
      if (!fixtureId) {
        console.log(`[WC-SCORERS] SKIP ${scorer.player.name} — no finished fixture for team`);
        summary.noFixture++;
        continue;
      }

      const goals = scorer.goals ?? 0;
      const assists = scorer.assists ?? 0;
      const minutesPlayed = (scorer.playedMatches ?? 1) * 85; // approximate

      console.log(
        `[WC-SCORERS] ${isDryRun ? 'WOULD WRITE' : 'WRITE'} ` +
        `${scorer.player.name} | goals=${goals} assists=${assists} | ` +
        `player=${player.id} fixture=${fixtureId}`,
      );

      if (!isDryRun) {
        await prisma.playerMatchStats.upsert({
          where: { playerId_fixtureId: { playerId: player.id, fixtureId } },
          create: {
            playerId: player.id,
            fixtureId,
            teamId: player.teamId ?? undefined,
            seasonId: season.id,
            status: PlayerMatchStatsStatus.VERIFIED,
            source: PlayerMatchStatsSource.IMPORTED,
            goals,
            assists,
            minutesPlayed,
            started: true,
            verifiedAt: new Date(),
          },
          update: {
            goals,
            assists,
            minutesPlayed,
            status: PlayerMatchStatsStatus.VERIFIED,
            source: PlayerMatchStatsSource.IMPORTED,
            verifiedAt: new Date(),
          },
        });
        summary.written++;
      } else {
        summary.written++;
      }
    }

    console.log('\n[WC-SCORERS] Summary:');
    console.log(JSON.stringify(summary, null, 2));
    if (isDryRun) {
      console.log(`\n[WC-SCORERS] Dry-run done. Use --confirm=${CONFIRM_TOKEN} to persist.`);
    } else {
      console.log('\n[WC-SCORERS] Done — PlayerMatchStats rows written with status=VERIFIED.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('[WC-SCORERS] Fatal:', e instanceof Error ? e.message : e);
  process.exit(1);
});
