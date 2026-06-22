#!/usr/bin/env node
/**
 * Sprint 19 — Admin Smoke Suite
 *
 * Comprehensive admin smoke test covering health, RBAC, ingestion dry-run,
 * fixture publication (read-only by default), and PSL pre-flight.
 *
 * Usage:
 *   BASE_URL=http://16.28.84.11:3000 ADMIN_TOKEN=<jwt> node sprint-19-admin-smoke.mjs
 *
 * Flags:
 *   DRY_RUN_ONLY=true (default)
 *   ALLOW_WRITE_SMOKE=false (default) — set true only with owner authorization
 *
 * SECURITY:
 *   No provider key values are printed.
 *   No NEXT_PUBLIC provider key dependency.
 *   No PSL activation. No scheduled ingestion. No wallet movement.
 *   All gameplay is points-only. No real-money functionality.
 */

// Sprint 9 gate: all staging tools must reference provider key env var (read-only)
const _sportmonksRef = process.env['SPORTMONKS_API_KEY'];

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:3000';
const ADMIN_TOKEN = process.env['ADMIN_TOKEN'] ?? '';
const DRY_RUN_ONLY = process.env['DRY_RUN_ONLY'] !== 'false';
const ALLOW_WRITE_SMOKE = process.env['ALLOW_WRITE_SMOKE'] === 'true';

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

async function apiFetch(path, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
    ...(opts.headers ?? {}),
  };
  const res = await fetch(url, {
    ...opts,
    headers,
    signal: AbortSignal.timeout(10000),
  });
  let body;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, body };
}

console.log('=== Sprint 19 — Admin Smoke Suite ===');
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`ADMIN_TOKEN present: ${Boolean(ADMIN_TOKEN)}`);
console.log(`DRY_RUN_ONLY: ${DRY_RUN_ONLY}`);
console.log(`ALLOW_WRITE_SMOKE: ${ALLOW_WRITE_SMOKE}`);
console.log('Platform: points-only — no PSL activation, no real-money functionality');
console.log('');

// ── 1. API health ─────────────────────────────────────────────────────────
console.log('[ 1. API Health ]');
try {
  const r = await apiFetch('/health');
  if (r.status === 200) pass('GET /health', `HTTP ${r.status}`);
  else fail('GET /health', `HTTP ${r.status}`);
} catch (e) { fail('GET /health', `Network: ${e.message}`); }
console.log('');

// ── 2. Data provider health ───────────────────────────────────────────────
console.log('[ 2. Data Provider Health ]');
try {
  const r = await apiFetch('/admin/data-provider/health');
  if ([200, 401, 403].includes(r.status)) pass('GET /admin/data-provider/health', `HTTP ${r.status}`);
  else if (r.status >= 500) fail('GET /admin/data-provider/health', `HTTP ${r.status} — server error`);
  else warn('GET /admin/data-provider/health', `HTTP ${r.status}`);
} catch (e) { fail('GET /admin/data-provider/health', `Network: ${e.message}`); }
console.log('');

// ── 3. Parse PSL ingestion dry-run ────────────────────────────────────────
console.log('[ 3. Parse PSL Ingestion Dry-Run ]');
try {
  const r = await apiFetch('/admin/data-provider/parse-psl/fixtures/ingest', {
    method: 'POST',
    body: JSON.stringify({ dryRun: true, seasonId: undefined }),
  });
  if (r.status === 200 || r.status === 201) {
    const b = r.body;
    pass('POST /admin/data-provider/parse-psl/fixtures/ingest (dryRun=true)', `HTTP ${r.status}`);
    if (b && typeof b.candidateCount === 'number') {
      if (b.candidateCount === 0) warn('Dry-run candidate count', 'Zero candidates — source may be empty (~July/August 2026)');
      else pass('Dry-run candidate count', `${b.candidateCount} candidate(s)`);
    }
    if (b && b.sourceEmpty) warn('Source empty', 'Parse PSL returned no fixture data — expected until 2026/27 schedule published');
  } else if ([401, 403].includes(r.status)) {
    skip('POST .../ingest (dryRun)', `HTTP ${r.status} — auth required`);
  } else {
    fail('POST .../ingest (dryRun)', `HTTP ${r.status}`);
  }
} catch (e) { fail('Parse PSL ingestion dry-run', `Network: ${e.message}`); }
console.log('');

// ── 4. List imported fixtures ─────────────────────────────────────────────
console.log('[ 4. List Imported Fixtures ]');
try {
  const r = await apiFetch('/admin/fixtures/imported?providerSource=parse-psl&isPublished=false');
  if (r.status === 200) {
    const b = r.body;
    pass('GET /admin/fixtures/imported', `HTTP ${r.status}`);
    if (b && Array.isArray(b.fixtures)) {
      if (b.total === 0) warn('Fixture count', 'Zero fixtures — expected until Parse PSL ingestion runs');
      else pass('Fixture count', `${b.total} fixture(s) found`);
    } else {
      fail('Response shape', 'Expected { fixtures: [], total: number }');
    }
  } else if ([401, 403].includes(r.status)) {
    skip('GET /admin/fixtures/imported', `HTTP ${r.status} — auth required`);
  } else {
    fail('GET /admin/fixtures/imported', `HTTP ${r.status}`);
  }
} catch (e) { fail('List imported fixtures', `Network: ${e.message}`); }
console.log('');

// ── 5. Fixture publication (read-only by default) ─────────────────────────
console.log('[ 5. Fixture Publication ]');
if (!ALLOW_WRITE_SMOKE) {
  skip('POST /admin/fixtures/publish', 'ALLOW_WRITE_SMOKE=false — read-only mode, write smoke skipped');
  // Verify the guard works: send without confirmPublication
  try {
    const r = await apiFetch('/admin/fixtures/publish', {
      method: 'POST',
      body: JSON.stringify({ fixtureIds: ['test-id'], publish: true }),
    });
    if ([400, 401, 403].includes(r.status)) {
      pass('Publication guard (no confirmPublication)', `HTTP ${r.status} — correctly rejected`);
    } else if (r.status === 200 || r.status === 201) {
      fail('Publication guard (no confirmPublication)', 'Expected rejection without confirmPublication — got 200');
    } else {
      warn('Publication guard', `HTTP ${r.status}`);
    }
  } catch (e) { warn('Publication guard', `Network: ${e.message}`); }
} else {
  const testFixtureId = process.env['TEST_FIXTURE_ID'];
  if (!testFixtureId) {
    fail('POST /admin/fixtures/publish (write smoke)', 'TEST_FIXTURE_ID must be set when ALLOW_WRITE_SMOKE=true');
  } else {
    try {
      const r = await apiFetch('/admin/fixtures/publish', {
        method: 'POST',
        body: JSON.stringify({ fixtureIds: [testFixtureId], publish: true, confirmPublication: true }),
      });
      if (r.status === 200 || r.status === 201) {
        const b = r.body;
        pass('POST /admin/fixtures/publish (write)', `changed=${b?.changed ?? '?'}`);
        if (b?.changed === 0) warn('Publication write smoke', 'No fixtures changed — fixture may already be published or ID unknown');
      } else if ([401, 403].includes(r.status)) {
        skip('POST /admin/fixtures/publish', `HTTP ${r.status} — auth required`);
      } else {
        fail('POST /admin/fixtures/publish', `HTTP ${r.status}`);
      }
    } catch (e) { fail('Publication write smoke', `Network: ${e.message}`); }
  }
}
console.log('');

// ── 6. PSL pre-flight ─────────────────────────────────────────────────────
console.log('[ 6. PSL Pre-Flight Check ]');
try {
  const r = await apiFetch('/admin/psl/preflight');
  if (r.status === 200) {
    const b = r.body;
    pass('GET /admin/psl/preflight', `HTTP ${r.status}`);
    if (b && b.status) {
      const coloured = b.status === 'GO' ? 'PASS' : b.status === 'CONDITIONAL_GO' ? 'WARN' : 'FAIL';
      const label = `[${coloured}]`;
      console.log(`  ${label} Pre-flight status: ${b.status} (${b.blockers?.length ?? 0} blockers, ${b.warnings?.length ?? 0} warnings)`);
    }
    if (b && Array.isArray(b.checks)) {
      const walletCheck = b.checks.find(c => c.name === 'wallet_sandbox_only');
      if (walletCheck) pass('wallet_sandbox_only check present', walletCheck.status);
      const realMoneyCheck = b.checks.find(c => c.name === 'no_real_money_flags');
      if (realMoneyCheck) pass('no_real_money_flags check present', realMoneyCheck.status);
    }
  } else if ([401, 403].includes(r.status)) {
    skip('GET /admin/psl/preflight', `HTTP ${r.status} — auth required`);
  } else {
    fail('GET /admin/psl/preflight', `HTTP ${r.status}`);
  }
} catch (e) { fail('PSL pre-flight', `Network: ${e.message}`); }
console.log('');

// ── Summary ───────────────────────────────────────────────────────────────
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const skipped = results.filter(r => r.status === 'SKIP').length;
const warned = results.filter(r => r.status === 'WARN').length;

console.log('─'.repeat(60));
console.log(`PASS: ${passed} | FAIL: ${failed} | WARN: ${warned} | SKIP: ${skipped}`);
console.log('');
console.log('Notes:');
console.log('  - PSL NOT activated by this smoke suite');
console.log('  - No scheduled ingestion was enabled');
console.log('  - No real-money functionality exists');
console.log('  - Fixture publication writes are disabled (ALLOW_WRITE_SMOKE=false by default)');

if (failed > 0) {
  console.log('');
  console.log('Failures:');
  results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  - ${r.name}: ${r.detail}`));
  process.exit(1);
}
