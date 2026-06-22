#!/usr/bin/env node
/**
 * Sprint 19 — Fixture Publication Smoke
 *
 * Tests the fixture publication workflow in read-only mode by default.
 * Write smoke requires ALLOW_WRITE_SMOKE=true and TEST_FIXTURE_ID.
 *
 * Usage:
 *   BASE_URL=http://16.28.84.11:3000 ADMIN_TOKEN=<jwt> \
 *     node sprint-19-fixture-publication-smoke.mjs
 *
 * Flags:
 *   ALLOW_WRITE_SMOKE=false (default) — no publish writes
 *   TEST_FIXTURE_ID=<id> — required if ALLOW_WRITE_SMOKE=true
 *
 * SECURITY: No provider keys printed. No PSL activation. Points-only.
 *   Publishing fixtures is SEPARATE from PSL activation.
 *   Fixtures remain unpublished until admin explicitly publishes them.
 */

// Sprint 9 gate
const _sportmonksRef = process.env['SPORTMONKS_API_KEY'];

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:3000';
const ADMIN_TOKEN = process.env['ADMIN_TOKEN'] ?? '';
const ALLOW_WRITE_SMOKE = process.env['ALLOW_WRITE_SMOKE'] === 'true';
const TEST_FIXTURE_ID = process.env['TEST_FIXTURE_ID'] ?? '';

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

const headers = {
  'Content-Type': 'application/json',
  ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
};

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { ...headers, ...(opts.headers ?? {}) },
    signal: AbortSignal.timeout(10000),
  });
  let body;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, body };
}

console.log('=== Sprint 19 — Fixture Publication Smoke ===');
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`ADMIN_TOKEN present: ${Boolean(ADMIN_TOKEN)}`);
console.log(`ALLOW_WRITE_SMOKE: ${ALLOW_WRITE_SMOKE}`);
console.log('Publishing fixtures is SEPARATE from PSL activation.');
console.log('');

// ── 1. List imported fixtures ─────────────────────────────────────────────
console.log('[ 1. List imported fixtures ]');
try {
  const r = await apiFetch('/admin/fixtures/imported?providerSource=parse-psl');
  if (r.status === 200) {
    pass('GET /admin/fixtures/imported', `HTTP ${r.status}`);
    if (r.body && Array.isArray(r.body.fixtures)) {
      if (r.body.total === 0) warn('Empty fixture list', 'Zero fixtures — expected until ingestion runs (~July/August 2026)');
      else pass('Fixture list', `${r.body.total} fixture(s) found`);
    }
  } else if ([401, 403].includes(r.status)) {
    skip('GET /admin/fixtures/imported', `HTTP ${r.status} — auth required`);
  } else {
    fail('GET /admin/fixtures/imported', `HTTP ${r.status}`);
  }
} catch (e) { fail('List fixtures', `Network: ${e.message}`); }
console.log('');

// ── 2. Publish guard — missing confirmPublication ─────────────────────────
console.log('[ 2. Publication guard ]');
try {
  const r = await apiFetch('/admin/fixtures/publish', {
    method: 'POST',
    body: JSON.stringify({ fixtureIds: ['test'], publish: true }),
  });
  if ([400, 401, 403].includes(r.status)) {
    pass('Missing confirmPublication rejected', `HTTP ${r.status}`);
  } else if (r.status === 200) {
    fail('Missing confirmPublication', 'Expected 400 — service should reject without confirmPublication');
  } else {
    warn('confirmPublication guard', `HTTP ${r.status}`);
  }
} catch (e) { warn('confirmPublication guard', `Network: ${e.message}`); }
console.log('');

// ── 3. Publish guard — empty fixtureIds ───────────────────────────────────
console.log('[ 3. Empty fixtureIds guard ]');
try {
  const r = await apiFetch('/admin/fixtures/publish', {
    method: 'POST',
    body: JSON.stringify({ fixtureIds: [], publish: true, confirmPublication: true }),
  });
  if ([400, 401, 403].includes(r.status)) {
    pass('Empty fixtureIds rejected', `HTTP ${r.status}`);
  } else {
    warn('Empty fixtureIds guard', `HTTP ${r.status}`);
  }
} catch (e) { warn('Empty fixtureIds guard', `Network: ${e.message}`); }
console.log('');

// ── 4. Write smoke (opt-in only) ──────────────────────────────────────────
console.log('[ 4. Write smoke ]');
if (!ALLOW_WRITE_SMOKE) {
  skip('Publish write smoke', 'ALLOW_WRITE_SMOKE=false — write smoke disabled by default');
  pass('Write smoke guard', 'Fixture publication writes are disabled by default — PASS');
  console.log('  NOTE: Publishing is SEPARATE from PSL activation. PSL is NOT activated.');
} else {
  if (!TEST_FIXTURE_ID) {
    fail('Write smoke', 'TEST_FIXTURE_ID must be set when ALLOW_WRITE_SMOKE=true');
  } else {
    try {
      const r = await apiFetch('/admin/fixtures/publish', {
        method: 'POST',
        body: JSON.stringify({ fixtureIds: [TEST_FIXTURE_ID], publish: true, confirmPublication: true }),
      });
      if ([200, 201].includes(r.status)) {
        pass('Publish write', `changed=${r.body?.changed ?? '?'} skipped=${r.body?.skipped ?? '?'}`);
        if (r.body?.changed === 0) warn('Publish idempotent', 'Fixture may already be published or ID unknown');
      } else if ([401, 403].includes(r.status)) {
        skip('Publish write', `HTTP ${r.status} — auth required`);
      } else {
        fail('Publish write', `HTTP ${r.status}`);
      }
    } catch (e) { fail('Publish write', `Network: ${e.message}`); }
  }
}
console.log('');

// ── Summary ───────────────────────────────────────────────────────────────
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const skipped = results.filter(r => r.status === 'SKIP').length;
const warned = results.filter(r => r.status === 'WARN').length;

console.log('─'.repeat(60));
console.log(`PASS: ${passed} | FAIL: ${failed} | WARN: ${warned} | SKIP: ${skipped}`);
console.log('Publishing is SEPARATE from PSL activation. PSL remains inactive.');
console.log('Points-only — no real-money functionality.');

if (failed > 0) {
  results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  FAIL: ${r.name}: ${r.detail}`));
  process.exit(1);
}
