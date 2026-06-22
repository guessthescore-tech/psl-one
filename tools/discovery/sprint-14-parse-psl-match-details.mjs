#!/usr/bin/env node
/**
 * PSL One — Sprint 14 Parse PSL Match Details Tool
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED)
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-match-details.mjs
 */

// Sportmonks is REJECTED; retained for spec compatibility only
void process.env['SPORTMONKS_API_KEY'];

const PARSE_API_KEY = process.env['PARSE_API_KEY'];
const BASE_URL = 'https://api.parse.bot/scraper/0c2008df-2286-497a-a5cb-55dd56ec9a4e';

async function parseFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-API-Key': PARSE_API_KEY },
    signal: AbortSignal.timeout(15000),
  });
  return res;
}

async function main() {
  console.log('PSL One — Sprint 14 Parse PSL Match Details Tool');
  console.log('==================================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('No key values will be printed.\n');

  if (!PARSE_API_KEY) {
    console.log('[PARSE_PSL_KEY_MISSING] PARSE_API_KEY not set in environment');
    console.log('  → Set PARSE_API_KEY in apps/api/.env to unblock');
    process.exit(0);
  }

  console.log(`PARSE_API_KEY: SET (length=${PARSE_API_KEY.length})`);

  // Step 1: Try to find a match ID from results first, then fixtures
  let matchId = null;

  console.log('\n[INFO] Attempting to find a match ID from results ...');
  try {
    const resultsRes = await parseFetch('/get_results?tournament=betway-premiership');
    if (resultsRes.status === 200) {
      const body = await resultsRes.json();
      const results = Array.isArray(body?.results) ? body.results
        : Array.isArray(body?.data) ? body.data
        : Array.isArray(body) ? body
        : [];
      if (results.length > 0) {
        matchId = results[0]?.id ?? results[0]?.match_id ?? results[0]?.fixture_id ?? null;
        if (matchId) {
          console.log(`[INFO] Found match ID from results: ${matchId}`);
        }
      }
    }
  } catch (_err) {
    // Non-fatal — fall through to fixtures
  }

  if (!matchId) {
    console.log('[INFO] No match ID from results — trying fixtures ...');
    try {
      const fixturesRes = await parseFetch('/get_fixtures?tournament=betway-premiership');
      if (fixturesRes.status === 200) {
        const body = await fixturesRes.json();
        const fixtures = Array.isArray(body?.fixtures) ? body.fixtures
          : Array.isArray(body?.data?.fixtures) ? body.data.fixtures
          : Array.isArray(body) ? body
          : [];
        if (fixtures.length > 0) {
          matchId = fixtures[0]?.id ?? fixtures[0]?.match_id ?? fixtures[0]?.fixture_id ?? null;
          if (matchId) {
            console.log(`[INFO] Found match ID from fixtures: ${matchId}`);
          }
        }
      }
    } catch (_err) {
      // Non-fatal — fall through to skip message
    }
  }

  if (!matchId) {
    console.log('[INFO] No match ID available — get_match_details skipped (need a live or recent match ID)');
    process.exit(0);
  }

  // Step 2: Fetch match details
  console.log(`\n[INFO] Fetching match details for match_id=${matchId} ...`);

  let res;
  try {
    res = await parseFetch(`/get_match_details?match_id=${matchId}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[PARSE_PSL_ERROR] ${msg}`);
    process.exit(1);
  }

  if (res.status === 401 || res.status === 403) {
    console.log(`[PARSE_PSL_AUTH_FAILED] HTTP ${res.status} — check PARSE_API_KEY`);
    process.exit(1);
  }

  if (res.status === 429) {
    console.log('[PARSE_PSL_RATE_LIMITED] HTTP 429 — rate limit exceeded');
    process.exit(1);
  }

  if (res.status !== 200) {
    console.log(`[PARSE_PSL_ERROR] Unexpected HTTP ${res.status} from get_match_details`);
    process.exit(1);
  }

  let body;
  try {
    body = await res.json();
  } catch (err) {
    console.log('[PARSE_PSL_ERROR] Failed to parse match details JSON response');
    process.exit(1);
  }

  const match = body?.match ?? body?.data ?? body ?? {};

  if (!match || Object.keys(match).length === 0) {
    console.log('[PARSE_PSL_MATCH_DETAILS_EMPTY] No match detail data returned');
    process.exit(0);
  }

  console.log('\n--- Match Details Summary ---');
  const home = match?.home_team ?? match?.homeTeam ?? match?.home ?? 'TBD';
  const away = match?.away_team ?? match?.awayTeam ?? match?.away ?? 'TBD';
  const date = match?.date ?? match?.match_date ?? match?.datetime ?? 'unknown date';
  const status = match?.status ?? match?.match_status ?? 'unknown';
  console.log(`  Teams:  ${home} vs ${away}`);
  console.log(`  Date:   ${date}`);
  console.log(`  Status: ${status}`);

  const hasLineups = Array.isArray(match?.lineups) && match.lineups.length > 0
    || Array.isArray(match?.home_lineup) && match.home_lineup.length > 0;
  const hasStats = match?.stats != null || match?.statistics != null
    || match?.home_stats != null;

  console.log(`  Lineups available: ${hasLineups ? 'yes' : 'no'}`);
  console.log(`  Stats available:   ${hasStats ? 'yes' : 'no'}`);

  console.log('\n[PARSE_PSL_MATCH_DETAILS_AVAILABLE] match details retrieved');
}

main().catch(err => {
  console.error('[PARSE_PSL_ERROR]', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
