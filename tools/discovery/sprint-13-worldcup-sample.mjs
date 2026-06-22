#!/usr/bin/env node
/**
 * PSL One — Sprint 13 World Cup Sample Data Tool
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * Fetches a sample of WC match data from football-data.org.
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-13-worldcup-sample.mjs
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED)
 */

// Sportmonks is REJECTED; retained for spec compatibility only
void process.env['SPORTMONKS_API_KEY'];

const FOOTBALL_DATA_API_KEY = process.env['FOOTBALL_DATA_API_KEY'];

async function main() {
  console.log('PSL One — Sprint 13 World Cup Sample Data Tool');
  console.log('===============================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('No key values will be printed.\n');

  if (!FOOTBALL_DATA_API_KEY) {
    console.log('[BLOCKED_BY_FOOTBALL_DATA_KEY] FOOTBALL_DATA_API_KEY not set');
    console.log('  → Set FOOTBALL_DATA_API_KEY in apps/api/.env to unblock');
    process.exit(0);
  }

  console.log('[INFO] Fetching WC matches from football-data.org ...');

  let res;
  try {
    res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY },
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[NETWORK_ERROR] ${msg}`);
    process.exit(1);
  }

  if (res.status === 401 || res.status === 403) {
    console.log(`[AUTH_FAIL] Invalid key — check FOOTBALL_DATA_API_KEY (HTTP ${res.status})`);
    process.exit(1);
  }

  if (res.status === 429) {
    console.log('[RATE_LIMITED] football-data.org rate limit hit — try again later');
    process.exit(1);
  }

  if (res.status !== 200) {
    console.log(`[ERROR] Unexpected HTTP ${res.status}`);
    process.exit(1);
  }

  let body;
  try {
    body = await res.json();
  } catch (err) {
    console.log('[ERROR] Failed to parse JSON response');
    process.exit(1);
  }

  const matches = Array.isArray(body?.matches) ? body.matches : [];

  if (matches.length === 0) {
    console.log('[WC_SAMPLE_EMPTY] No matches returned from football-data.org');
  } else {
    const sample = matches.slice(0, 5);
    console.log(`\n--- Sample matches (up to 5 of ${matches.length}) ---`);
    for (const match of sample) {
      const home = match?.homeTeam?.name ?? 'TBD';
      const away = match?.awayTeam?.name ?? 'TBD';
      const date = match?.utcDate ?? 'unknown date';
      const status = match?.status ?? 'unknown';
      console.log(`  ${home} vs ${away} | ${date} | ${status}`);
    }

    // Check score data availability
    const hasScores = matches.some(
      m => m?.score?.fullTime?.home !== null && m?.score?.fullTime?.home !== undefined,
    );
    console.log('');
    console.log(`[INFO] Score data in free tier: ${hasScores ? 'AVAILABLE' : 'NOT_AVAILABLE or no finished matches'}`);

    console.log(`\n[WC_SAMPLE_OK] ${matches.length} matches returned`);
  }

  console.log('\n[INFO] PSL (Premier Soccer League) is NOT supported on football-data.org');
}

main().catch(err => {
  console.error('[FATAL]', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
