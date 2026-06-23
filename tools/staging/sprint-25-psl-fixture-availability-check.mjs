#!/usr/bin/env node
/**
 * Sprint 25 — PSL Fixture Availability Check
 *
 * Calls the Parse PSL ingestion endpoint in dry-run mode only.
 * Never imports fixtures. Never activates PSL.
 * Exits 0 for SOURCE_EMPTY and for candidates found.
 * Exits non-zero only for real errors (auth failure, network error, server error).
 *
 * Usage:
 *   BASE_URL=http://api:4000 ADMIN_TOKEN=<jwt> node sprint-25-psl-fixture-availability-check.mjs
 *
 * SECURITY: dryRun=true always. No provider keys printed. No PSL activation.
 */

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:4000';
const ADMIN_TOKEN = process.env['ADMIN_TOKEN'] ?? '';

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

async function apiCall(path, method = 'GET', body = undefined) {
  const headers = { 'Content-Type': 'application/json' };
  if (ADMIN_TOKEN) headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json };
}

console.log('=== Sprint 25 — PSL Fixture Availability Check ===');
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`token present: ${ADMIN_TOKEN ? 'YES' : 'NO'}`);
console.log('Mode: DRY-RUN ONLY — no fixture writes, no PSL activation\n');

// 1. Auth check
if (!ADMIN_TOKEN) {
  fail('Auth check', 'ADMIN_TOKEN not set — PSL_FIXTURE_AUTH_REQUIRED');
  console.log('\nPSL_FIXTURE_AUTH_REQUIRED');
  console.log('\nSet ADMIN_TOKEN=<psl-admin-jwt> to run availability check.');
  process.exit(2);
}

// 2. API health
const health = await apiCall('/health');
if (health.status !== 200) {
  fail('API health', `HTTP ${health.status}`);
  console.log('\nPSL_FIXTURE_PROVIDER_ERROR — API unreachable');
  process.exit(1);
}
pass('API health', `HTTP ${health.status}`);

// 3. Parse PSL dry-run ingestion
console.log('\n[ Parse PSL fixture availability — dryRun=true ]\n');

const dryRun = await apiCall('/admin/data-provider/parse-psl/fixtures/ingest', 'POST', {
  dryRun: true,
  includeCandidates: true,
});

if (dryRun.status === 401) {
  fail('Parse PSL dry-run', 'HTTP 401 — PSL_FIXTURE_AUTH_REQUIRED');
  console.log('\nPSL_FIXTURE_AUTH_REQUIRED');
  process.exit(2);
}

if (dryRun.status === 403) {
  fail('Parse PSL dry-run', 'HTTP 403 — insufficient role');
  console.log('\nPSL_FIXTURE_AUTH_REQUIRED (role mismatch)');
  process.exit(2);
}

if (dryRun.status >= 500) {
  fail('Parse PSL dry-run', `HTTP ${dryRun.status} — PSL_FIXTURE_PROVIDER_ERROR`);
  console.log('\nPSL_FIXTURE_PROVIDER_ERROR');
  process.exit(1);
}

if (dryRun.status !== 200 && dryRun.status !== 201) {
  fail('Parse PSL dry-run', `HTTP ${dryRun.status} — unexpected`);
  process.exit(1);
}

pass('Parse PSL dry-run', `HTTP ${dryRun.status}`);

const r = dryRun.json ?? {};

// 4. Interpret result
const sourceEmpty = r.sourceEmpty === true ||
  (r.status && String(r.status).includes('EMPTY')) ||
  (r.message && String(r.message).toLowerCase().includes('empty')) ||
  (r.candidateCount === 0 && !r.candidates?.length);

const candidateCount = r.candidateCount ?? r.candidates?.length ?? 0;

if (sourceEmpty || candidateCount === 0) {
  info('Source status', 'SOURCE_EMPTY — no PSL fixtures available yet from psl.co.za');
  info('Expected date', 'PSL 2026/27 fixture schedule expected ~July/August 2026');
  info('Action required', 'None — re-run this check when psl.co.za publishes 2026/27 schedule');
  console.log('\n────────────────────────────────────────────────────────────');
  console.log('PSL_FIXTURES_SOURCE_EMPTY');
  console.log('\nNOTE: Source-empty is NOT a provider failure.');
  console.log('      Do NOT import fixtures. Do NOT activate PSL.');
  console.log('      Re-run when psl.co.za publishes the 2026/27 PSL fixture schedule.');
} else {
  pass('Candidates found', `${candidateCount} fixture candidate(s)`);

  // 5. Team resolution check
  const warnings = r.teamResolutionWarnings ?? r.warnings ?? [];
  const unresolved = r.unresolvedTeams ?? [];

  if (unresolved.length > 0) {
    fail('Team resolution', `${unresolved.length} unresolved team(s): ${unresolved.join(', ')}`);
  } else if (warnings.length > 0) {
    info('Team resolution warnings', `${warnings.length} warning(s)`);
  } else {
    pass('Team resolution', 'All teams resolved');
  }

  console.log('\n────────────────────────────────────────────────────────────');
  if (unresolved.length > 0) {
    console.log('PSL_FIXTURE_TEAM_RESOLUTION_WARNINGS');
    console.log('\nAction required: resolve team name mappings before import write.');
  } else {
    console.log('PSL_FIXTURE_CANDIDATES_FOUND');
    console.log(`\n${candidateCount} fixture candidate(s) available.`);
    console.log('Action: owner review required before fixture import write.');
  }
}

const passCt = results.filter(r => r.status === 'PASS').length;
const failCt = results.filter(r => r.status === 'FAIL').length;
const infoCt = results.filter(r => r.status === 'INFO').length;
console.log(`\nPASS: ${passCt} | FAIL: ${failCt} | INFO: ${infoCt}`);
console.log('\nSECURITY: dryRun=true enforced. No fixture writes. No PSL activation. Points-only platform.');

process.exit(failCt > 0 ? 1 : 0);
