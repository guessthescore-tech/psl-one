#!/usr/bin/env node
/**
 * Sprint 37 — PSL Provider Availability Check
 *
 * Calls GET /admin/data-provider/psl-fixture-readiness (read-only).
 * Reports provider configuration, readiness status, and owner next actions.
 * Never calls fixture import. Never publishes fixtures. Never activates PSL.
 *
 * Usage:
 *   BASE_URL=http://api:4000 ADMIN_TOKEN=<psl-admin-jwt> \
 *     node sprint-37-psl-provider-availability-check.mjs
 *
 * SECURITY:
 *   - ADMIN_TOKEN is NEVER printed.
 *   - Provider keys are NEVER returned by the server (presence flag only).
 *   - No fixture import write. No fixture publication. No PSL activation.
 *   - No scheduled ingestion. No production ingestion. No real-money.
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

console.log('=== Sprint 37 — PSL Provider Availability Check ===');
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`token present: ${tokenPresent ? 'YES' : 'NO'}`);
console.log('Mode: READ-ONLY — no fixture writes, no publication, no PSL activation\n');

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

// 2. PSL fixture readiness endpoint
console.log('\n[ PSL Provider Readiness — read-only ]\n');
const readiness = await apiGet('/admin/data-provider/psl-fixture-readiness');

if (readiness.status === 401) {
  fail('Readiness endpoint', 'HTTP 401 — PSL_ADMIN token invalid or expired');
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

// 3. Safety assertions
if (r.safety?.noWrites !== true) {
  fail('Safety: noWrites', 'EXPECTED true');
  process.exit(1);
}
pass('Safety: noWrites', 'true');

if (r.safety?.noPslActivation !== true) {
  fail('Safety: noPslActivation', 'EXPECTED true');
  process.exit(1);
}
pass('Safety: noPslActivation', 'true');

if (r.pslActive !== false) {
  fail('PSL active', 'EXPECTED false — PSL must not be active');
  process.exit(1);
}
pass('PSL inactive', 'pslActive=false');

if (r.writeImportForbidden !== true) {
  fail('writeImportForbidden', 'EXPECTED true');
  process.exit(1);
}
pass('Write import forbidden', 'writeImportForbidden=true');

if (r.pslActivationForbidden !== true) {
  fail('pslActivationForbidden', 'EXPECTED true');
  process.exit(1);
}
pass('PSL activation forbidden', 'pslActivationForbidden=true');

// 4. Provider status
const status = r.readinessStatus ?? 'UNKNOWN';
const parsePsl = r.parsePsl ?? {};
const apiFootball = r.apiFootball ?? {};
const providerDecision = r.providerDecision ?? 'unknown';
const dryRunEligible = r.dryRunEligible ?? false;

console.log(`\n  Readiness status  : ${status}`);
console.log(`  Provider decision : ${providerDecision}`);
console.log(`  Dry-run eligible  : ${dryRunEligible}`);
console.log(`  Competition       : ${r.competition ?? '?'} · Season: ${r.season ?? '?'}`);
console.log(`  Parse PSL         : configured=${parsePsl.configured} status=${parsePsl.status} candidates=${parsePsl.candidateFixtureCount ?? 0}`);
console.log(`  API-Football 288  : configured=${apiFootball.configured} status=${apiFootball.status}`);

if (status === 'SOURCE_EMPTY') {
  info('Source status', 'SOURCE_EMPTY — no PSL 2026/27 fixtures available yet');
  info('Expected date', 'PSL 2026/27 schedule expected ~July/August 2026 from psl.co.za');
  info('Action', 'None required — re-run periodically');
} else if (status === 'PROVIDER_NOT_CONFIGURED') {
  info('Provider status', 'PROVIDER_NOT_CONFIGURED — set DATA_PROVIDER + key in API env');
  info('Action', 'Owner: configure DATA_PROVIDER=parse-psl + PARSE_API_KEY in beta .env');
} else if (status === 'FIXTURES_AVAILABLE_DRY_RUN_REQUIRED') {
  pass('Fixtures available', 'PSL fixtures found — dry-run import available');
  info('Next step', 'Use sprint-25-psl-fixture-availability-check.mjs for dry-run import review');
} else if (status === 'READY_FOR_OWNER_IMPORT_REVIEW') {
  pass('Ready for review', 'Dry-run complete — owner must approve write import separately');
}

// 5. Owner actions
if (r.ownerActions?.length > 0) {
  console.log('\n  Owner actions:');
  r.ownerActions.slice(0, 4).forEach(a => console.log(`    → ${a}`));
}

// 6. Summary
const passCt = results.filter(r => r.status === 'PASS').length;
const failCt = results.filter(r => r.status === 'FAIL').length;
const infoCt = results.filter(r => r.status === 'INFO').length;

console.log('\n────────────────────────────────────────────────────────────');
console.log(`PASS: ${passCt} | FAIL: ${failCt} | INFO: ${infoCt}`);
console.log(`\nFinal PSL readiness: ${status}`);
console.log('\nSECURITY: Read-only. No fixture writes. No fixture publication.');
console.log('          No PSL activation. No scheduler. No production ingestion.');
console.log('          Admin JWT was NOT printed. Provider keys were NOT returned.');

process.exit(failCt > 0 ? 1 : 0);
