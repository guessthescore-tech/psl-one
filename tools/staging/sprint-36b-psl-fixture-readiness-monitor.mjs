#!/usr/bin/env node
/**
 * Sprint 36B — PSL Fixture Readiness Monitor
 *
 * Calls GET /admin/data-provider/psl-fixture-readiness.
 * Prints a safe summary. Redacts all token/key values.
 * Returns exit 0 for SOURCE_EMPTY and PROVIDER_NOT_CONFIGURED (expected states).
 * Returns exit 1 only for unexpected provider/app failures or forbidden conditions.
 *
 * Usage:
 *   BASE_URL=http://api:4000 ADMIN_TOKEN=<psl-admin-jwt> node sprint-36b-psl-fixture-readiness-monitor.mjs
 *
 * SECURITY:
 *   - ADMIN_TOKEN is never printed.
 *   - Provider keys are never printed (server returns presence flag only).
 *   - No DB writes. No fixture import. No fixture publication. No PSL activation.
 *   - No scheduler. No production ingestion. No real-money functionality.
 */

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:4000';
const ADMIN_TOKEN = process.env['ADMIN_TOKEN'] ?? '';

// Never print the token
const tokenPresent = ADMIN_TOKEN.length > 0;

const results = [];

function pass(name, detail = '') {
  results.push({ name, status: 'PASS', detail });
  console.log(`  [PASS] ${name}${detail ? ' — ' + detail : ''}`);
}

function info(name, detail = '') {
  results.push({ name, status: 'INFO', detail });
  console.log(`  [INFO] ${name}${detail ? ' — ' + detail : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, status: 'FAIL', detail });
  console.log(`  [FAIL] ${name}${detail ? ' — ' + detail : ''}`);
}

async function apiGet(path) {
  const headers = { 'Content-Type': 'application/json' };
  if (ADMIN_TOKEN) headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
  const res = await fetch(`${BASE_URL}${path}`, { method: 'GET', headers });
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json };
}

console.log('=== Sprint 36B — PSL Fixture Readiness Monitor ===');
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`token present: ${tokenPresent ? 'YES' : 'NO'}`);
console.log('Mode: READ-ONLY — no fixture writes, no publication, no PSL activation\n');

// 1. Auth check
if (!tokenPresent) {
  fail('Auth check', 'ADMIN_TOKEN not set — PSL_ADMIN JWT required');
  console.log('\nProvide a PSL_ADMIN JWT via the env var before running.');
  process.exit(2);
}

// 2. API health
const health = await apiGet('/health');
if (health.status !== 200) {
  fail('API health', `HTTP ${health.status} — API unreachable`);
  process.exit(1);
}
pass('API health', `HTTP ${health.status}`);

// 3. PSL fixture readiness endpoint
console.log('\n[ PSL Fixture Readiness — read-only ]\n');

const readiness = await apiGet('/admin/data-provider/psl-fixture-readiness');

if (readiness.status === 401) {
  fail('Readiness endpoint', 'HTTP 401 — PSL_ADMIN token invalid');
  process.exit(2);
}

if (readiness.status === 403) {
  fail('Readiness endpoint', 'HTTP 403 — PSL_ADMIN role required');
  process.exit(2);
}

if (readiness.status >= 500) {
  fail('Readiness endpoint', `HTTP ${readiness.status} — server error`);
  process.exit(1);
}

if (readiness.status !== 200) {
  fail('Readiness endpoint', `HTTP ${readiness.status} — unexpected`);
  process.exit(1);
}

pass('Readiness endpoint', `HTTP ${readiness.status}`);

const r = readiness.json ?? {};

// 4. Safety flag assertions — if these fail, something is wrong server-side
if (r.safety?.noWrites !== true) {
  fail('Safety: noWrites', 'EXPECTED true — server returned false or missing');
  process.exit(1);
}
pass('Safety: noWrites', 'true');

if (r.safety?.noPslActivation !== true) {
  fail('Safety: noPslActivation', 'EXPECTED true — server returned false or missing');
  process.exit(1);
}
pass('Safety: noPslActivation', 'true');

if (r.pslActive !== false) {
  fail('PSL active check', 'EXPECTED false — PSL must not be active');
  process.exit(1);
}
pass('PSL not active', 'pslActive=false confirmed');

if (r.fixturePublicationIsActivation !== false) {
  fail('Publication/activation separation', 'EXPECTED false — publication is not activation');
  process.exit(1);
}
pass('Publication ≠ Activation', 'fixturePublicationIsActivation=false');

// 5. Readiness status interpretation
const status = r.readinessStatus ?? 'UNKNOWN';
const parsePsl = r.parsePsl ?? {};
const apiFootball = r.apiFootball ?? {};

console.log(`\n  Readiness status: ${status}`);
console.log(`  Competition: ${r.competition ?? '?'} · Season: ${r.season ?? '?'}`);
console.log(`  Parse PSL: configured=${parsePsl.configured} status=${parsePsl.status} candidates=${parsePsl.candidateFixtureCount ?? 0}`);
console.log(`  API-Football (league ${apiFootball.leagueId}): configured=${apiFootball.configured} status=${apiFootball.status}`);

if (status === 'SOURCE_EMPTY') {
  info('Source status', 'SOURCE_EMPTY — no PSL fixtures available yet');
  info('Expected date', 'PSL 2026/27 fixture schedule expected ~July/August 2026');
  info('Action required', 'None — re-run periodically until status changes');
} else if (status === 'PROVIDER_NOT_CONFIGURED') {
  info('Provider status', 'PROVIDER_NOT_CONFIGURED — set DATA_PROVIDER + provider key in API env');
  info('Action required', 'Owner: configure provider env vars in .env.beta');
} else if (status === 'FIXTURES_AVAILABLE_DRY_RUN_REQUIRED') {
  pass('Fixtures available', 'Run dry-run import for owner review');
  info('Next step', 'Run parse-psl dry-run import via admin data-provider endpoint (dryRun=true)');
} else if (status === 'READY_FOR_OWNER_IMPORT_REVIEW') {
  pass('Ready for owner review', 'Dry-run complete — owner must approve write import');
} else if (status === 'PROVIDER_ERROR') {
  fail('Provider error', 'Check provider config and network connectivity');
  process.exit(1);
} else {
  info('Unknown status', status);
}

// 6. Owner/forbidden actions summary
if (r.ownerActions?.length > 0) {
  console.log('\n  Owner actions:');
  r.ownerActions.slice(0, 3).forEach(a => console.log(`    → ${a}`));
}

// 7. Final summary
const passCt = results.filter(r => r.status === 'PASS').length;
const failCt = results.filter(r => r.status === 'FAIL').length;
const infoCt = results.filter(r => r.status === 'INFO').length;

console.log('\n────────────────────────────────────────────────────────────');
console.log(`PASS: ${passCt} | FAIL: ${failCt} | INFO: ${infoCt}`);
console.log(`\nFinal status: ${status}`);
console.log('\nSECURITY: Read-only. No fixture writes. No fixture publication.');
console.log('          No PSL activation. No scheduler. No production ingestion.');
console.log('          Admin JWT was NOT printed. Provider keys were NOT returned.');

process.exit(failCt > 0 ? 1 : 0);
