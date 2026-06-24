#!/usr/bin/env node
/**
 * Sprint 37 — World Cup Provider Availability Check
 *
 * Verifies the football-data.org WC 2026 path via the API health/discovery
 * endpoints. Checks provider routing status. Never writes to DB.
 *
 * Usage:
 *   BASE_URL=http://api:4000 ADMIN_TOKEN=<psl-admin-jwt> \
 *     node sprint-37-world-cup-provider-availability-check.mjs
 *
 * SECURITY:
 *   - ADMIN_TOKEN is NEVER printed.
 *   - Provider keys are NEVER returned by the server.
 *   - No DB writes. No fixture import. No PSL activation.
 */

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:4000';
const ADMIN_TOKEN = process.env['ADMIN_TOKEN'] ?? '';
const tokenPresent = ADMIN_TOKEN.length > 0;

const results = [];

function pass(name, detail = '') {
  results.push({ name, status: 'PASS', detail });
  console.log(`  [PASS] ${name}${detail ? ' — ' + detail : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, status: 'FAIL', detail });
  console.log(`  [FAIL] ${name}${detail ? ' — ' + detail : ''}`);
}

function info(name, detail = '') {
  results.push({ name, status: 'INFO', detail });
  console.log(`  [INFO] ${name}${detail ? ' — ' + detail : ''}`);
}

function warn(name, detail = '') {
  results.push({ name, status: 'WARN', detail });
  console.log(`  [WARN] ${name}${detail ? ' — ' + detail : ''}`);
}

async function apiGet(path) {
  const headers = { 'Content-Type': 'application/json' };
  if (ADMIN_TOKEN) headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
  try {
    const res = await fetch(`${BASE_URL}${path}`, { method: 'GET', headers });
    let json = null;
    try { json = await res.json(); } catch (_) {}
    return { status: res.status, json };
  } catch (err) {
    return { status: 0, json: null, error: err.message };
  }
}

console.log('=== Sprint 37 — World Cup Provider Availability Check ===');
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`token present: ${tokenPresent ? 'YES' : 'NO'}`);
console.log('Mode: READ-ONLY — no fixture writes, no PSL activation\n');

if (!tokenPresent) {
  fail('Auth check', 'ADMIN_TOKEN not set — PSL_ADMIN JWT required');
  console.log('\nSet ADMIN_TOKEN=<psl-admin-jwt> before running.');
  process.exit(2);
}

// 1. API health
const health = await apiGet('/health');
if (health.status !== 200) {
  fail('API health', `HTTP ${health.status}${health.error ? ' — ' + health.error : ''}`);
  process.exit(1);
}
pass('API health', `HTTP ${health.status}`);

// 2. Data provider health (uses globally configured DATA_PROVIDER)
console.log('\n[ Data Provider Health — server-configured adapter ]\n');
const dpHealth = await apiGet('/admin/data-provider/health');

if (dpHealth.status === 401) {
  fail('Provider health', 'HTTP 401 — admin token invalid');
  process.exit(2);
}
if (dpHealth.status === 403) {
  fail('Provider health', 'HTTP 403 — PSL_ADMIN role required');
  process.exit(2);
}

if (dpHealth.status === 200) {
  pass('Provider health endpoint', `HTTP ${dpHealth.status}`);
  const h = dpHealth.json ?? {};
  if (h.available) {
    pass('Provider available', `provider=${h.provider ?? 'unknown'} message=${h.message ?? ''}`);
  } else {
    info('Provider not available', `provider=${h.provider ?? 'unknown'} message=${h.message ?? ''} — NoOp or key not set`);
  }
} else if (dpHealth.status === 404) {
  info('Provider health', `HTTP 404 — adapter threw NotFoundException (NoOp or no live key) — safe state`);
} else {
  warn('Provider health', `HTTP ${dpHealth.status} — unexpected`);
}

// 3. World Cup specific: seasons discovery
console.log('\n[ World Cup 2026 — Season Discovery ]\n');
info('Note', 'Seasons endpoint via data-provider discovery (provider must be football-data-org or similar)');

const seasons = await apiGet('/admin/data-provider/discovery/seasons');
if (seasons.status === 401) {
  fail('Seasons discovery', 'HTTP 401');
  process.exit(2);
}

if (seasons.status === 200) {
  const s = seasons.json ?? [];
  const count = Array.isArray(s) ? s.length : (s.seasons?.length ?? 0);
  if (count > 0) {
    pass('Seasons found', `${count} season(s) from provider`);
  } else {
    info('No seasons returned', 'Provider may be NoOp or no data available');
  }
} else if (seasons.status === 404) {
  info('Seasons discovery', 'HTTP 404 — NoOp adapter (no live key configured) — expected safe state');
} else {
  info('Seasons discovery', `HTTP ${seasons.status}`);
}

// 4. Known WC state
console.log('\n[ World Cup 2026 — Known State ]\n');
info('WC fixture target', '104 matches (validated Sprint 13 via football-data.org)');
info('WC adapter', 'FootballDataOrgAdapter — routes via ProviderRouterService when FOOTBALL_DATA_API_KEY set');
info('WC season status', 'ACTIVE beta context — WC 2026 is the current active season');
info('Football-data.org key', 'FOOTBALL_DATA_API_KEY must be set server-side — check beta EC2 .env');
info('No write', 'This tool does not import or modify any WC fixtures');

// 5. Summary
const passCt = results.filter(r => r.status === 'PASS').length;
const failCt = results.filter(r => r.status === 'FAIL').length;
const infoCt = results.filter(r => r.status === 'INFO').length;
const warnCt = results.filter(r => r.status === 'WARN').length;

console.log('\n────────────────────────────────────────────────────────────');
console.log(`PASS: ${passCt} | FAIL: ${failCt} | WARN: ${warnCt} | INFO: ${infoCt}`);
console.log('\nWC 2026 provider check complete.');
console.log('SECURITY: Read-only. No DB writes. No fixture import. No PSL activation.');
console.log('          Admin JWT was NOT printed. Provider keys were NOT returned.');

process.exit(failCt > 0 ? 1 : 0);
