#!/usr/bin/env node
/**
 * PSL One — Sprint 14 Parse PSL Fixtures Tool
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED)
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-fixtures.mjs
 */

// Sportmonks is REJECTED; retained for spec compatibility only
void process.env['SPORTMONKS_API_KEY'];

const PARSE_API_KEY = process.env['PARSE_API_KEY'];
const BASE_URL = 'https://api.parse.bot/scraper/0c2008df-2286-497a-a5cb-55dd56ec9a4e';

async function main() {
  console.log('PSL One — Sprint 14 Parse PSL Fixtures Tool');
  console.log('=============================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('No key values will be printed.\n');

  if (!PARSE_API_KEY) {
    console.log('[PARSE_PSL_KEY_MISSING] PARSE_API_KEY not set in environment');
    console.log('  → Set PARSE_API_KEY in apps/api/.env to unblock');
    process.exit(0);
  }

  console.log(`PARSE_API_KEY: SET (length=${PARSE_API_KEY.length})`);
  console.log('\n[INFO] Fetching PSL fixtures from Parse ...');

  let res;
  try {
    res = await fetch(`${BASE_URL}/get_fixtures?tournament=betway-premiership`, {
      headers: { 'X-API-Key': PARSE_API_KEY },
      signal: AbortSignal.timeout(15000),
    });
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
    console.log(`[PARSE_PSL_ERROR] Unexpected HTTP ${res.status}`);
    process.exit(1);
  }

  let body;
  try {
    body = await res.json();
  } catch (err) {
    console.log('[PARSE_PSL_ERROR] Failed to parse JSON response');
    process.exit(1);
  }

  const fixtures = Array.isArray(body?.fixtures) ? body.fixtures
    : Array.isArray(body?.data) ? body.data
    : Array.isArray(body) ? body
    : [];

  if (fixtures.length === 0) {
    console.log('[PARSE_PSL_FIXTURES_SOURCE_EMPTY] 0 fixtures returned');
    console.log('  → psl.co.za may not have published new season fixtures yet — this is a valid state');
    process.exit(0);
  }

  console.log(`[PARSE_PSL_FIXTURES_AVAILABLE] ${fixtures.length} fixtures`);

  const sample = fixtures.slice(0, 3);
  console.log('\n--- Sample fixtures (up to 3) ---');
  for (const f of sample) {
    const home = f?.home_team ?? f?.homeTeam ?? f?.home ?? 'TBD';
    const away = f?.away_team ?? f?.awayTeam ?? f?.away ?? 'TBD';
    const date = f?.date ?? f?.match_date ?? f?.datetime ?? 'unknown date';
    const status = f?.status ?? f?.match_status ?? 'unknown';
    console.log(`  ${home} vs ${away} | ${date} | ${status}`);
  }
}

main().catch(err => {
  console.error('[PARSE_PSL_ERROR]', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
