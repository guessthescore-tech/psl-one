#!/usr/bin/env node
/**
 * PSL One — Sprint 14 Parse PSL Results Tool
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED)
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-results.mjs
 */

// Sportmonks is REJECTED; retained for spec compatibility only
void process.env['SPORTMONKS_API_KEY'];

const PARSE_API_KEY = process.env['PARSE_API_KEY'];
const BASE_URL = 'https://api.parse.bot/scraper/0c2008df-2286-497a-a5cb-55dd56ec9a4e';

async function main() {
  console.log('PSL One — Sprint 14 Parse PSL Results Tool');
  console.log('============================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('No key values will be printed.\n');

  if (!PARSE_API_KEY) {
    console.log('[PARSE_PSL_KEY_MISSING] PARSE_API_KEY not set in environment');
    console.log('  → Set PARSE_API_KEY in apps/api/.env to unblock');
    process.exit(0);
  }

  console.log(`PARSE_API_KEY: SET (length=${PARSE_API_KEY.length})`);
  console.log('\n[INFO] Fetching PSL results from Parse ...');

  let res;
  try {
    res = await fetch(`${BASE_URL}/get_results?tournament=betway-premiership`, {
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

  const results = Array.isArray(body?.results) ? body.results
    : Array.isArray(body?.data) ? body.data
    : Array.isArray(body) ? body
    : [];

  if (results.length === 0) {
    console.log('[PARSE_PSL_RESULTS_EMPTY] 0 results returned — season may not have started yet');
    process.exit(0);
  }

  console.log(`[PARSE_PSL_RESULTS_AVAILABLE] ${results.length} results`);

  const sample = results.slice(0, 3);
  console.log('\n--- Sample results (up to 3) ---');
  for (const r of sample) {
    const home = r?.home_team ?? r?.homeTeam ?? r?.home ?? 'TBD';
    const away = r?.away_team ?? r?.awayTeam ?? r?.away ?? 'TBD';
    const score = r?.score ?? r?.result ?? r?.ft_score
      ?? `${r?.home_score ?? '?'}-${r?.away_score ?? '?'}`;
    const date = r?.date ?? r?.match_date ?? r?.datetime ?? 'unknown date';
    console.log(`  ${home} vs ${away} | ${score} | ${date}`);
  }
}

main().catch(err => {
  console.error('[PARSE_PSL_ERROR]', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
