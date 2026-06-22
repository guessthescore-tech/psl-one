#!/usr/bin/env node
/**
 * PSL One — Sprint 12 Football-data.org Health Check
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * Checks health for football-data.org World Cup beta candidate.
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-health.mjs
 * Keys are loaded via env file — never printed.
 * process.env['FOOTBALL_DATA_API_KEY']
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED, Sprint 10)
 */

const FOOTBALL_DATA_API_KEY = process.env['FOOTBALL_DATA_API_KEY'];
// Sportmonks is REJECTED as of Sprint 10; key read for spec compliance only
void process.env['SPORTMONKS_API_KEY'];

async function main() {
  console.log('PSL One — Sprint 12 Football-data.org Health Check');
  console.log('===================================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('Note: No key values will be printed.\n');

  if (!FOOTBALL_DATA_API_KEY) {
    console.log('[BLOCKED_BY_FOOTBALL_DATA_KEY] football-data.org: FOOTBALL_DATA_API_KEY not set');
    console.log('  → Set FOOTBALL_DATA_API_KEY in apps/api/.env to unblock');
    process.exit(0);
  }

  try {
    const res = await fetch('https://api.football-data.org/v4/competitions/WC', {
      headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 200) {
      console.log('[PASS] football-data.org: available=true | World Cup competition found');
      process.exit(0);
    }

    if (res.status === 401 || res.status === 403) {
      console.log(`[FAIL] football-data.org: auth error HTTP ${res.status}`);
      process.exit(1);
    }

    if (res.status === 429) {
      console.log('[WARN] Rate limited');
      process.exit(1);
    }

    console.log(`[FAIL] football-data.org: unexpected HTTP ${res.status}`);
    process.exit(1);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[FAIL] football-data.org: network error — ${msg}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});
