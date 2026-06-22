#!/usr/bin/env node
/**
 * PSL One — Sprint 13 PSL Sample Data Tool (API-Football)
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * Fetches a sample of PSL fixture data from API-Football (league 288).
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-13-psl-sample.mjs
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED)
 */

// Sportmonks is REJECTED; retained for spec compatibility only
void process.env['SPORTMONKS_API_KEY'];

const API_FOOTBALL_KEY = process.env['API_FOOTBALL_KEY'];

const BASE_URL = 'https://v3.football.api-sports.io';

async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-apisports-key': API_FOOTBALL_KEY },
    signal: AbortSignal.timeout(10000),
  });
  return res;
}

async function main() {
  console.log('PSL One — Sprint 13 PSL Sample Data Tool (API-Football)');
  console.log('==========================================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('No key values will be printed.\n');

  if (!API_FOOTBALL_KEY) {
    console.log('[BLOCKED_NO_KEY] API_FOOTBALL_KEY not set');
    console.log('  → Set API_FOOTBALL_KEY in apps/api/.env to unblock');
    process.exit(0);
  }

  // --- Step 1: Verify league 288 exists ---
  console.log('[INFO] Checking league 288 (PSL) on API-Football ...');

  let leagueRes;
  try {
    leagueRes = await apiFetch('/leagues?id=288&current=true');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[NETWORK_ERROR] ${msg}`);
    process.exit(1);
  }

  if (leagueRes.status === 401 || leagueRes.status === 403) {
    console.log(`[AUTH_FAIL] Invalid key — check API_FOOTBALL_KEY (HTTP ${leagueRes.status})`);
    process.exit(1);
  }

  if (leagueRes.status !== 200) {
    console.log(`[ERROR] Unexpected HTTP ${leagueRes.status} from /leagues`);
    process.exit(1);
  }

  let leagueBody;
  try {
    leagueBody = await leagueRes.json();
  } catch (err) {
    console.log('[ERROR] Failed to parse league JSON response');
    process.exit(1);
  }

  const leagueResults = leagueBody?.response ?? [];

  if (leagueResults.length === 0) {
    console.log('[PSL_NOT_FOUND] league 288 returned no results');
    console.log('[CRITICAL] PSL not found — API-Football may not cover PSL on free tier');
    process.exit(0);
  }

  const leagueEntry = leagueResults[0];
  const leagueName = leagueEntry?.league?.name ?? 'Unknown';
  const seasons = leagueEntry?.seasons ?? [];
  const currentSeason = seasons.find(s => s.current === true);
  const seasonYear = currentSeason?.year ?? 'unknown';
  const isCurrent = currentSeason ? 'true' : 'false';

  console.log(`[PSL_FOUND] API-Football: PSL league 288 found | season: ${seasonYear}`);
  console.log(`  League name: ${leagueName} | current: ${isCurrent}`);

  // --- Step 2: Fetch sample fixtures ---
  console.log('\n[INFO] Fetching PSL fixtures (league=288, season=2025) ...');

  let fixtureRes;
  try {
    fixtureRes = await apiFetch('/fixtures?league=288&season=2025');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[NETWORK_ERROR] ${msg}`);
    process.exit(1);
  }

  if (fixtureRes.status === 401 || fixtureRes.status === 403) {
    console.log(`[AUTH_FAIL] Invalid key on fixtures endpoint (HTTP ${fixtureRes.status})`);
    process.exit(1);
  }

  if (fixtureRes.status !== 200) {
    console.log(`[ERROR] Unexpected HTTP ${fixtureRes.status} from /fixtures`);
    process.exit(1);
  }

  let fixtureBody;
  try {
    fixtureBody = await fixtureRes.json();
  } catch (err) {
    console.log('[ERROR] Failed to parse fixtures JSON response');
    process.exit(1);
  }

  const fixtures = fixtureBody?.response ?? [];

  if (fixtures.length === 0) {
    console.log('[PSL_SAMPLE_EMPTY] No fixtures returned for league=288 season=2025');
  } else {
    const sample = fixtures.slice(0, 5);
    console.log(`\n--- Sample fixtures (up to 5 of ${fixtures.length}) ---`);
    for (const entry of sample) {
      const home = entry?.teams?.home?.name ?? 'TBD';
      const away = entry?.teams?.away?.name ?? 'TBD';
      const date = entry?.fixture?.date ?? 'unknown date';
      const status = entry?.fixture?.status?.short ?? 'unknown';
      console.log(`  ${home} vs ${away} | ${date} | ${status}`);
    }
    console.log(`\n[PSL_SAMPLE_OK] ${fixtures.length} fixtures returned`);
  }
}

main().catch(err => {
  console.error('[FATAL]', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
