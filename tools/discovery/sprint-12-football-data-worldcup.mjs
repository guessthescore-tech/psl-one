#!/usr/bin/env node
/**
 * PSL One — Sprint 12 Football-data.org World Cup Endpoint Validation
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * Validates World Cup endpoints for football-data.org World Cup beta candidate.
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-worldcup.mjs
 * Keys are loaded via env file — never printed.
 * process.env['FOOTBALL_DATA_API_KEY']
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED, Sprint 10)
 */

const FOOTBALL_DATA_API_KEY = process.env['FOOTBALL_DATA_API_KEY'];
// Sportmonks is REJECTED as of Sprint 10; key read for spec compliance only
void process.env['SPORTMONKS_API_KEY'];

const BASE_URL = 'https://api.football-data.org';

async function fetchEndpoint(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  }
  return res.json();
}

async function checkCompetition() {
  const data = await fetchEndpoint('/v4/competitions/WC');
  const name = data?.name ?? 'unknown';
  const currentSeason = data?.currentSeason?.startDate ?? data?.currentSeason?.id ?? 'unknown';
  console.log(`[PASS] /v4/competitions/WC | name=${name} | currentSeason=${currentSeason}`);
  return true;
}

async function checkMatches() {
  const data = await fetchEndpoint('/v4/competitions/WC/matches?limit=5');
  const count = data?.count ?? data?.matches?.length ?? 'unknown';
  const firstMatch = Array.isArray(data?.matches) && data.matches.length > 0
    ? data.matches[0]
    : null;
  const homeTeam = firstMatch?.homeTeam?.name ?? firstMatch?.homeTeam?.shortName ?? 'unknown';
  const awayTeam = firstMatch?.awayTeam?.name ?? firstMatch?.awayTeam?.shortName ?? 'unknown';
  console.log(`[PASS] /v4/competitions/WC/matches?limit=5 | count=${count} | first match: ${homeTeam} vs ${awayTeam}`);
  return true;
}

async function checkTeams() {
  const data = await fetchEndpoint('/v4/competitions/WC/teams');
  const teams = Array.isArray(data?.teams) ? data.teams : [];
  const count = teams.length;
  const first3 = teams.slice(0, 3).map(t => t?.name ?? t?.shortName ?? 'unknown').join(', ');
  console.log(`[PASS] /v4/competitions/WC/teams | count=${count} | first 3: ${first3}`);
  return true;
}

async function checkStandings() {
  const data = await fetchEndpoint('/v4/competitions/WC/standings');
  const standings = data?.standings ?? [];
  const firstGroup = Array.isArray(standings) && standings.length > 0 ? standings[0] : null;
  const firstEntry = Array.isArray(firstGroup?.table) && firstGroup.table.length > 0
    ? firstGroup.table[0]
    : null;
  const teamName = firstEntry?.team?.name ?? firstEntry?.team?.shortName ?? 'unknown';
  const points = firstEntry?.points ?? 'unknown';
  console.log(`[PASS] /v4/competitions/WC/standings | first entry: ${teamName} (${points} pts)`);
  return true;
}

async function main() {
  console.log('PSL One — Sprint 12 Football-data.org World Cup Endpoint Validation');
  console.log('====================================================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('Note: No key values will be printed.\n');

  if (!FOOTBALL_DATA_API_KEY) {
    console.log('[BLOCKED_BY_FOOTBALL_DATA_KEY] football-data.org: FOOTBALL_DATA_API_KEY not set');
    console.log('  → Set FOOTBALL_DATA_API_KEY in apps/api/.env to unblock');
    process.exit(0);
  }

  const checks = [
    { name: 'competition', fn: checkCompetition },
    { name: 'matches',     fn: checkMatches },
    { name: 'teams',       fn: checkTeams },
    { name: 'standings',   fn: checkStandings },
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      await check.fn();
    } catch (err) {
      const status = err.status;
      if (status === 401 || status === 403) {
        console.log(`[FAIL] ${check.name}: auth error HTTP ${status}`);
      } else if (status === 429) {
        console.log(`[WARN] ${check.name}: rate limited`);
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`[FAIL] ${check.name}: ${msg}`);
      }
      allPassed = false;
    }
  }

  console.log('');

  if (allPassed) {
    console.log('[FOOTBALL_DATA_WORLD_CUP_BETA_VALIDATED] World Cup endpoints accessible');
  } else {
    console.log('[FOOTBALL_DATA_WORLD_CUP_BETA_PARTIAL] One or more World Cup endpoints failed — see above');
  }

  console.log('[PSL_NOT_SUPPORTED] football-data.org does not cover PSL — use API-Football for PSL');
  console.log('[INFO] PSL (Premier Soccer League, South Africa) is not available on football-data.org free or standard tier');
}

main().catch(err => {
  console.error('World Cup validation failed:', err.message);
  process.exit(1);
});
