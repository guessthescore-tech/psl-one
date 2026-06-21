#!/usr/bin/env node
/**
 * PSL One — Provider Health Check
 * Checks the health of configured data providers.
 * Requires server-side env vars only — never NEXT_PUBLIC_*.
 * Run: node tools/discovery/provider-health-check.mjs
 */

const SPORTMONKS_KEY = process.env['SPORTMONKS_API_KEY'];
const SPORTSDATAIO_KEY = process.env['SPORTSDATAIO_SOCCER_API_KEY'];

async function checkSportmonks() {
  if (!SPORTMONKS_KEY) {
    console.log('[BLOCKED] sportmonks: BLOCKED_BY_REPLACEMENT_TOKEN');
    console.log('  → Set SPORTMONKS_API_KEY in apps/api/.env to unblock');
    return { provider: 'sportmonks', available: false, status: 'BLOCKED_BY_REPLACEMENT_TOKEN' };
  }
  try {
    const res = await fetch('https://api.sportmonks.com/v3/football/seasons?per_page=1', {
      headers: { Authorization: `Bearer ${SPORTMONKS_KEY}` },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 401 || res.status === 403) {
      console.log(`[FAIL]    sportmonks: available=false | HTTP ${res.status} | Auth failed — key may be expired`);
      return { provider: 'sportmonks', available: false, status: `HTTP_${res.status}` };
    }
    if (res.status === 429) {
      console.log('[WARN]    sportmonks: rate-limited — try again later');
      return { provider: 'sportmonks', available: false, status: 'RATE_LIMITED' };
    }
    if (!res.ok) {
      console.log(`[FAIL]    sportmonks: available=false | HTTP ${res.status}`);
      return { provider: 'sportmonks', available: false, status: `HTTP_${res.status}` };
    }
    const data = await res.json();
    const count = Array.isArray(data?.data) ? data.data.length : 'unknown';
    console.log(`[OK]      sportmonks: available=true | HTTP 200 | ${count} season(s) returned`);
    return { provider: 'sportmonks', available: true, status: 'OK', count };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[FAIL]    sportmonks: network error — ${msg}`);
    return { provider: 'sportmonks', available: false, status: 'NETWORK_ERROR' };
  }
}

async function checkSportsDataIo() {
  if (!SPORTSDATAIO_KEY) {
    console.log('[BLOCKED] sportsdataio: BLOCKED_BY_REPLACEMENT_TOKEN');
    console.log('  → Set SPORTSDATAIO_SOCCER_API_KEY in apps/api/.env to unblock');
    return { provider: 'sportsdataio', available: false, status: 'BLOCKED_BY_REPLACEMENT_TOKEN' };
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
    console.log(`[OK]      sportsdataio: available=true | HTTP 200 | ${count} competition(s) returned (trial: UCL only)`);
    return { provider: 'sportsdataio', available: true, status: 'OK', count };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[FAIL]    sportsdataio: network error — ${msg}`);
    return { provider: 'sportsdataio', available: false, status: 'NETWORK_ERROR' };
  }
}

async function main() {
  console.log('PSL One — Provider Health Check');
  console.log('================================');
  console.log('Note: No key values will be printed.\n');

  const results = await Promise.all([checkSportmonks(), checkSportsDataIo()]);

  const available = results.filter(r => r.available).length;
  const blocked = results.filter(r => r.status === 'BLOCKED_BY_REPLACEMENT_TOKEN').length;

  console.log('\n── Summary ─────────────────────────────────');
  console.log(`Providers available:              ${available}/${results.length}`);
  console.log(`Providers blocked (no key):       ${blocked}/${results.length}`);
  if (blocked === results.length) {
    console.log('\nAll providers BLOCKED — set replacement keys in apps/api/.env to validate.');
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
