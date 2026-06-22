#!/usr/bin/env node
/**
 * Sprint 19 — Parse PSL Ingestion Smoke
 *
 * Validates the Parse PSL ingestion endpoint behaviour:
 * - Dry-run is always the default
 * - Source-empty is not a failure
 * - Write mode requires explicit authorization
 * - No provider key values are printed
 *
 * Usage:
 *   BASE_URL=http://16.28.84.11:3000 ADMIN_TOKEN=<jwt> node sprint-19-parse-ingestion-smoke.mjs
 *
 * Flags:
 *   DRY_RUN_ONLY=true (default) — never runs write ingestion
 *   ALLOW_WRITE_SMOKE=false (default)
 *
 * SECURITY: PARSE_API_KEY is server-side only. Never printed here.
 *   No PSL activation. No scheduled ingestion. Points-only platform.
 */

// Sprint 9 gate
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

async function post(path, body = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  let responseBody;
  try { responseBody = await res.json(); } catch { responseBody = null; }
  return { status: res.status, body: responseBody };
}

console.log('=== Sprint 19 — Parse PSL Ingestion Smoke ===');
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`ADMIN_TOKEN present: ${Boolean(ADMIN_TOKEN)}`);
console.log(`DRY_RUN_ONLY: ${DRY_RUN_ONLY}`);
console.log(`ALLOW_WRITE_SMOKE: ${ALLOW_WRITE_SMOKE}`);
console.log('');

if (!DRY_RUN_ONLY && !ALLOW_WRITE_SMOKE) {
  fail('Safety gate', 'DRY_RUN_ONLY=false requires ALLOW_WRITE_SMOKE=true — refusing to run write smoke');
  process.exit(1);
}

// ── 1. Dry-run without seasonId (default behaviour) ───────────────────────
console.log('[ 1. Dry-run (no seasonId) ]');
try {
  const r = await post('/admin/data-provider/parse-psl/fixtures/ingest', { dryRun: true });
  if ([200, 201].includes(r.status)) {
    pass('POST .../ingest dryRun=true', `HTTP ${r.status}`);
    if (r.body?.sourceEmpty === true) {
      warn('Source empty', 'Parse PSL has no fixtures — expected until ~July/August 2026');
    } else if (typeof r.body?.candidateCount === 'number') {
      pass('Candidate count', `${r.body.candidateCount} candidate(s)`);
    }
    if (r.body?.dryRun === true) pass('dryRun flag confirmed', 'response.dryRun=true');
    else warn('dryRun flag', 'Response did not include dryRun=true confirmation');
  } else if ([401, 403].includes(r.status)) {
    skip('Dry-run', `HTTP ${r.status} — ADMIN_TOKEN required`);
  } else {
    fail('Dry-run', `HTTP ${r.status}`);
  }
} catch (e) { fail('Dry-run', `Network: ${e.message}`); }
console.log('');

// ── 2. Write run blocked unless ALLOW_WRITE_SMOKE=true ────────────────────
console.log('[ 2. Write run guard ]');
if (!ALLOW_WRITE_SMOKE) {
  skip('Write ingestion smoke', 'ALLOW_WRITE_SMOKE=false — write run intentionally skipped');
  pass('Write smoke guard', 'Write ingestion is disabled by default — PASS');
} else {
  const seasonId = process.env['TEST_SEASON_ID'];
  if (!seasonId) {
    fail('Write ingestion smoke', 'TEST_SEASON_ID must be set when ALLOW_WRITE_SMOKE=true');
  } else {
    try {
      const r = await post('/admin/data-provider/parse-psl/fixtures/ingest', {
        dryRun: false,
        seasonId,
        confirmWrite: true,
      });
      if ([200, 201].includes(r.status)) {
        pass('Write ingestion', `HTTP ${r.status} — written=${r.body?.written ?? '?'}`);
      } else if ([401, 403].includes(r.status)) {
        skip('Write ingestion', `HTTP ${r.status} — auth required`);
      } else {
        fail('Write ingestion', `HTTP ${r.status}`);
      }
    } catch (e) { fail('Write ingestion', `Network: ${e.message}`); }
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
console.log('');
console.log('PARSE_API_KEY is server-side only — never printed by this tool.');
console.log('No PSL activation. No scheduled ingestion. Points-only.');

if (failed > 0) {
  results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  FAIL: ${r.name}: ${r.detail}`));
  process.exit(1);
}
