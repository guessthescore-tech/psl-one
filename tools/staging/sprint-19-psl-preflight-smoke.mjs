#!/usr/bin/env node
/**
 * Sprint 19 — PSL Pre-Flight Smoke
 *
 * Read-only smoke that calls GET /admin/psl/preflight and validates the
 * response shape, check names, and safety invariants.
 *
 * This tool does NOT activate PSL. It is purely diagnostic.
 *
 * Usage:
 *   BASE_URL=http://16.28.84.11:3000 ADMIN_TOKEN=<jwt> \
 *     node sprint-19-psl-preflight-smoke.mjs [--season-id <id>]
 *
 * SECURITY: No provider keys printed. No DB mutations. Points-only.
 */

// Sprint 9 gate
const _sportmonksRef = process.env['SPORTMONKS_API_KEY'];

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:3000';
const ADMIN_TOKEN = process.env['ADMIN_TOKEN'] ?? '';

const args = process.argv.slice(2);
const sidIdx = args.indexOf('--season-id');
const seasonId = sidIdx >= 0 ? args[sidIdx + 1] : undefined;

const results = [];

function pass(name, detail = '') {
  results.push({ name, status: 'PASS', detail });
  console.log(`  [PASS] ${name}${detail ? ' — ' + detail : ''}`);
}
function fail(name, detail = '') {
  results.push({ name, status: 'FAIL', detail });
  console.log(`  [FAIL] ${name}${detail ? ' — ' + detail : ''}`);
}
function skip(name, reason = '') {
  results.push({ name, status: 'SKIP', detail: reason });
  console.log(`  [SKIP] ${name}${reason ? ' — ' + reason : ''}`);
}
function warn(name, detail = '') {
  results.push({ name, status: 'WARN', detail });
  console.log(`  [WARN] ${name}${detail ? ' — ' + detail : ''}`);
}

const REQUIRED_CHECKS = [
  'psl_season_exists',
  'psl_season_inactive',
  'fixtures_exist',
  'fixtures_have_teams',
  'fixtures_have_kickoff',
  'fixtures_published',
  'provider_provenance',
  'wallet_sandbox_only',
  'no_real_money_flags',
  'activation_approval',
];

console.log('=== Sprint 19 — PSL Pre-Flight Smoke ===');
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`ADMIN_TOKEN present: ${Boolean(ADMIN_TOKEN)}`);
if (seasonId) console.log(`Season ID override: ${seasonId}`);
console.log('This tool is READ-ONLY. It does NOT activate PSL.');
console.log('');

const qs = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : '';
const url = `${BASE_URL}/admin/psl/preflight${qs}`;

let res;
try {
  res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
    },
    signal: AbortSignal.timeout(10000),
  });
} catch (e) {
  fail('Network', `Cannot reach ${url}: ${e.message}`);
  process.exit(1);
}

if (res.status === 401 || res.status === 403) {
  skip('GET /admin/psl/preflight', `HTTP ${res.status} — ADMIN_TOKEN required`);
  console.log('');
  console.log('PASS (auth-gated). Set ADMIN_TOKEN to run full pre-flight smoke.');
  process.exit(0);
}

if (!res.ok) {
  const body = await res.text();
  fail('GET /admin/psl/preflight', `HTTP ${res.status}: ${body.slice(0, 200)}`);
  process.exit(1);
}

const result = await res.json();
pass('GET /admin/psl/preflight', `HTTP ${res.status}`);

// ── Response shape ────────────────────────────────────────────────────────
console.log('');
console.log('[ Response shape ]');
if (['GO', 'CONDITIONAL_GO', 'NO_GO'].includes(result.status)) pass('status field', result.status);
else fail('status field', `Unknown status: ${result.status}`);

if (Array.isArray(result.blockers)) pass('blockers array', `${result.blockers.length} blocker(s)`);
else fail('blockers array', 'Missing');

if (Array.isArray(result.warnings)) pass('warnings array', `${result.warnings.length} warning(s)`);
else fail('warnings array', 'Missing');

if (Array.isArray(result.checks)) pass('checks array', `${result.checks.length} check(s)`);
else fail('checks array', 'Missing');

// ── Required check names ──────────────────────────────────────────────────
console.log('');
console.log('[ Required checks ]');
const checkNames = result.checks?.map(c => c.name) ?? [];
for (const name of REQUIRED_CHECKS) {
  if (checkNames.includes(name)) pass(`Check: ${name}`);
  else fail(`Check: ${name}`, 'Missing from response');
}

// ── Safety checks ─────────────────────────────────────────────────────────
console.log('');
console.log('[ Safety invariants ]');

const walletCheck = result.checks?.find(c => c.name === 'wallet_sandbox_only');
if (walletCheck) {
  if (walletCheck.status === 'PASS') pass('wallet_sandbox_only PASS', 'All wallet providers in SANDBOX');
  else if (walletCheck.status === 'FAIL') fail('wallet_sandbox_only', 'Non-sandbox wallet provider detected — BLOCKER');
  else warn('wallet_sandbox_only', walletCheck.detail);
}

const realMoneyCheck = result.checks?.find(c => c.name === 'no_real_money_flags');
if (realMoneyCheck) {
  if (realMoneyCheck.status === 'PASS') pass('no_real_money_flags PASS', 'Platform is points-only');
  else fail('no_real_money_flags', 'Unexpected failure — investigate');
}

// ── Overall status ────────────────────────────────────────────────────────
console.log('');
console.log('[ Overall pre-flight status ]');
if (result.status === 'GO') {
  pass('Overall: GO', 'All checks pass — ready for owner-gated activation');
} else if (result.status === 'CONDITIONAL_GO') {
  warn('Overall: CONDITIONAL_GO', `${result.warnings.length} warning(s) — review before activation`);
  result.warnings.forEach(w => console.log(`    WARN: ${w}`));
} else {
  fail('Overall: NO_GO', `${result.blockers.length} blocker(s) — must resolve before activation`);
  result.blockers.forEach(b => console.log(`    BLOCKER: ${b}`));
}
console.log('');
console.log('NOTE: PSL activation is NOT performed by this tool.');
console.log('      Activation requires a separate owner-gated action via Season Switching.');

// ── Summary ───────────────────────────────────────────────────────────────
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const warned2 = results.filter(r => r.status === 'WARN').length;

console.log('');
console.log('─'.repeat(60));
console.log(`PASS: ${passed} | FAIL: ${failed} | WARN: ${warned2}`);

if (failed > 0) process.exit(1);
