#!/usr/bin/env node
/**
 * PSL One — Sprint 14 Parse PSL Standings Tool
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED)
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-standings.mjs
 */

// Sportmonks is REJECTED; retained for spec compatibility only
void process.env['SPORTMONKS_API_KEY'];

const PARSE_API_KEY = process.env['PARSE_API_KEY'];
const BASE_URL = 'https://api.parse.bot/scraper/0c2008df-2286-497a-a5cb-55dd56ec9a4e';

async function main() {
  console.log('PSL One — Sprint 14 Parse PSL Standings Tool');
  console.log('==============================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('No key values will be printed.\n');

  if (!PARSE_API_KEY) {
    console.log('[PARSE_PSL_KEY_MISSING] PARSE_API_KEY not set in environment');
    console.log('  → Set PARSE_API_KEY in apps/api/.env to unblock');
    process.exit(0);
  }

  console.log(`PARSE_API_KEY: SET (length=${PARSE_API_KEY.length})`);
  console.log('\n[INFO] Fetching PSL standings from Parse ...');

  let res;
  try {
    res = await fetch(`${BASE_URL}/get_standings?tournament=betway-premiership`, {
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

  const standings = Array.isArray(body?.standings) ? body.standings
    : Array.isArray(body?.data) ? body.data
    : Array.isArray(body) ? body
    : [];

  if (standings.length === 0) {
    console.log('[PARSE_PSL_STANDINGS_EMPTY] 0 standings rows returned — season may not have started yet');
    process.exit(0);
  }

  console.log(`[PARSE_PSL_STANDINGS_AVAILABLE] ${standings.length} rows`);

  const sample = standings.slice(0, 5);
  console.log('\n--- Standings table (top 5) ---');
  console.log('  Pos | Team                         | P  | W  | D  | L  | Pts');
  console.log('  ----|------------------------------|----|----|----|----|----');
  for (const row of sample) {
    const pos = String(row?.position ?? row?.rank ?? row?.pos ?? '?').padEnd(3);
    const team = String(row?.team ?? row?.team_name ?? row?.club ?? 'Unknown').padEnd(28);
    const played = String(row?.played ?? row?.games_played ?? row?.mp ?? '?').padEnd(3);
    const won = String(row?.won ?? row?.wins ?? row?.w ?? '?').padEnd(3);
    const drawn = String(row?.drawn ?? row?.draws ?? row?.d ?? '?').padEnd(3);
    const lost = String(row?.lost ?? row?.losses ?? row?.l ?? '?').padEnd(3);
    const pts = String(row?.points ?? row?.pts ?? '?');
    console.log(`  ${pos} | ${team} | ${played}| ${won}| ${drawn}| ${lost}| ${pts}`);
  }
}

main().catch(err => {
  console.error('[PARSE_PSL_ERROR]', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
