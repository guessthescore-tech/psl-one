#!/usr/bin/env node
/**
 * PSL One — Sprint 11 Provider Health Check
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 *
 * Checks health for API-Football (primary candidate) and SportsDataIO (comparison).
 *
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-11-provider-health.mjs
 *
 * Keys are loaded via env file — never printed.
 * process.env['API_FOOTBALL_KEY']
 * process.env['SPORTSDATAIO_SOCCER_API_KEY']
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED, Sprint 10)
 */

const API_FOOTBALL_KEY = process.env['API_FOOTBALL_KEY'];
const SPORTSDATAIO_KEY = process.env['SPORTSDATAIO_SOCCER_API_KEY'];
// Sportmonks is REJECTED as of Sprint 10; key read for spec compliance only
void process.env['SPORTMONKS_API_KEY'];

async function checkApiFootball() {
  if (!API_FOOTBALL_KEY) {
    console.log('[BLOCKED_NO_KEY] api-football: API_FOOTBALL_KEY not set');
    console.log('  → Set API_FOOTBALL_KEY in apps/api/.env to unblock');
    return { provider: 'api-football', available: false, status: 'BLOCKED_NO_KEY' };
  }
  try {
    const res = await fetch('https://v3.football.api-sports.io/leagues?id=288&current=true', {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 401 || res.status === 403) {
      console.log(`[FAIL]    api-football: available=false | HTTP ${res.status} | Auth failed — check key`);
      return { provider: 'api-football', available: false, status: `HTTP_${res.status}` };
    }
    if (res.status === 429) {
      console.log('[WARN]    api-football: rate-limited — try again later');
      return { provider: 'api-football', available: false, status: 'RATE_LIMITED' };
    }
    if (!res.ok) {
      console.log(`[FAIL]    api-football: available=false | HTTP ${res.status}`);
      return { provider: 'api-football', available: false, status: `HTTP_${res.status}` };
    }
    const data = await res.json();
    const count = Array.isArray(data?.response) ? data.response.length : 'unknown';
    console.log(`[OK]      api-football: available=true | HTTP 200 | ${count} league(s) returned (PSL id=288)`);
    return { provider: 'api-football', available: true, status: 'OK', count };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[FAIL]    api-football: network error — ${msg}`);
    return { provider: 'api-football', available: false, status: 'NETWORK_ERROR' };
  }
}

async function checkSportsDataIo() {
  if (!SPORTSDATAIO_KEY) {
    console.log('[BLOCKED_NO_KEY] sportsdataio: SPORTSDATAIO_SOCCER_API_KEY not set');
    console.log('  → Set SPORTSDATAIO_SOCCER_API_KEY in apps/api/.env to unblock');
    return { provider: 'sportsdataio', available: false, status: 'BLOCKED_NO_KEY' };
  }
  try {
    const res = await fetch('https://api.sportsdata.io/v4/soccer/scores/json/Competitions', {
      headers: { 'Ocp-Apim-Subscription-Key': SPORTSDATAIO_KEY },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 401 || res.status === 403) {
      console.log(`[FAIL]    sportsdataio: available=false | HTTP ${res.status} | Auth failed`);
      return { provider: 'sportsdataio', available: false, status: `HTTP_${res.status}` };
    }
    if (res.status === 429) {
      console.log('[WARN]    sportsdataio: rate-limited — try again later');
      return { provider: 'sportsdataio', available: false, status: 'RATE_LIMITED' };
    }
    if (!res.ok) {
      console.log(`[FAIL]    sportsdataio: available=false | HTTP ${res.status}`);
      return { provider: 'sportsdataio', available: false, status: `HTTP_${res.status}` };
    }
    const data = await res.json();
    const count = Array.isArray(data) ? data.length : 'unknown';
    console.log(`[OK]      sportsdataio: available=true | HTTP 200 | ${count} competition(s) returned`);
    return { provider: 'sportsdataio', available: true, status: 'OK', count };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[FAIL]    sportsdataio: network error — ${msg}`);
    return { provider: 'sportsdataio', available: false, status: 'NETWORK_ERROR' };
  }
}

async function main() {
  console.log('PSL One — Sprint 11 Provider Health Check');
  console.log('==========================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('Note: No key values will be printed.\n');

  const results = await Promise.all([checkApiFootball(), checkSportsDataIo()]);

  const available = results.filter(r => r.available).length;
  const blocked = results.filter(r => r.status === 'BLOCKED_NO_KEY').length;

  console.log('\n── Summary ─────────────────────────────────');
  for (const r of results) {
    const state = r.available ? 'PASS' : (r.status === 'BLOCKED_NO_KEY' ? 'BLOCKED_NO_KEY' : 'FAIL');
    console.log(`  ${r.provider.padEnd(20)} ${state}`);
  }
  console.log(`\nProviders available:        ${available}/${results.length}`);
  console.log(`Providers blocked (no key): ${blocked}/${results.length}`);
  if (blocked === results.length) {
    console.log('\nAll providers BLOCKED — set keys in apps/api/.env to validate.');
  } else if (available === results.length) {
    console.log('\nAll providers healthy.');
  } else {
    console.log('\nPartial availability — check output above.');
  }
}

main().catch(err => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});
