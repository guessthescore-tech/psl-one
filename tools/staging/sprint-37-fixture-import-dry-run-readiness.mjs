#!/usr/bin/env node
/**
 * Sprint 37 — Fixture Import Dry-Run Readiness Check
 *
 * Performs a readiness pre-check before running an actual dry-run import.
 * If all preconditions pass, optionally calls the dry-run endpoint.
 *
 * This tool NEVER:
 *   - Sets dryRun=false
 *   - Sets confirmWrite=true
 *   - Publishes fixtures
 *   - Activates PSL
 *   - Enables scheduled or production ingestion
 *
 * Usage (readiness check only, no import call):
 *   BASE_URL=http://api:4000 ADMIN_TOKEN=<psl-admin-jwt> \
 *     node sprint-37-fixture-import-dry-run-readiness.mjs
 *
 * Usage (readiness check + dry-run call, if PSL fixtures are available):
 *   BASE_URL=http://api:4000 ADMIN_TOKEN=<psl-admin-jwt> RUN_DRY_RUN=true \
 *     node sprint-37-fixture-import-dry-run-readiness.mjs
 *
 * SECURITY:
 *   - dryRun is ALWAYS true when calling the import endpoint.
 *   - confirmWrite is NEVER set.
 *   - ADMIN_TOKEN is NEVER printed.
 *   - Provider keys are NEVER printed.
 *   - No fixture write. No fixture publication. No PSL activation.
 */

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:4000';
const ADMIN_TOKEN = process.env['ADMIN_TOKEN'] ?? '';
const RUN_DRY_RUN = process.env['RUN_DRY_RUN'] === 'true';
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

async function apiPost(path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (ADMIN_TOKEN) headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    let json = null;
    try { json = await res.json(); } catch (_) {}
    return { status: res.status, json };
  } catch (err) {
    return { status: 0, json: null, error: err.message };
  }
}

console.log('=== Sprint 37 — Fixture Import Dry-Run Readiness ===');
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`token present: ${tokenPresent ? 'YES' : 'NO'}`);
console.log(`RUN_DRY_RUN: ${RUN_DRY_RUN ? 'YES (will call dry-run endpoint if fixtures available)' : 'NO (readiness check only)'}`);
console.log('SAFETY: dryRun=true always. confirmWrite=false always. No write import. No publication. No PSL activation.\n');

if (!tokenPresent) {
  fail('Auth check', 'ADMIN_TOKEN not set');
  info('Blocked state', 'PENDING_ADMIN_TOKEN — provide PSL_ADMIN JWT to run readiness check');
  process.exit(0); // Expected blocked state — exit 0
}

// 1. API health
const health = await apiGet('/health');
if (health.status !== 200) {
  fail('API health', `HTTP ${health.status}${health.error ? ' — ' + health.error : ''}`);
  process.exit(1);
}
pass('API health', `HTTP ${health.status}`);

// 2. PSL fixture readiness (provider configured check)
console.log('\n[ Pre-check: Provider Configuration ]\n');
const readiness = await apiGet('/admin/data-provider/psl-fixture-readiness');

if (readiness.status === 401) {
  fail('Readiness endpoint', 'HTTP 401 — token invalid');
  process.exit(2);
}
if (readiness.status === 403) {
  fail('Readiness endpoint', 'HTTP 403 — PSL_ADMIN role required');
  process.exit(2);
}
if (readiness.status !== 200) {
  fail('Readiness endpoint', `HTTP ${readiness.status}`);
  process.exit(1);
}
pass('Readiness endpoint', `HTTP ${readiness.status}`);

const r = readiness.json ?? {};

// Safety assertions
if (r.writeImportForbidden !== true) {
  fail('writeImportForbidden', 'EXPECTED true — server must always forbid write import via readiness endpoint');
  process.exit(1);
}
pass('writeImportForbidden', 'true');

if (r.pslActivationForbidden !== true) {
  fail('pslActivationForbidden', 'EXPECTED true');
  process.exit(1);
}
pass('pslActivationForbidden', 'true');

if (r.pslActive !== false) {
  fail('PSL inactive', 'EXPECTED false — PSL must not be active');
  process.exit(1);
}
pass('PSL inactive', 'pslActive=false');

const readinessStatus = r.readinessStatus ?? 'UNKNOWN';
const dryRunEligible = r.dryRunEligible ?? false;
const providerDecision = r.providerDecision ?? 'unknown';

console.log(`\n  Readiness status : ${readinessStatus}`);
console.log(`  Provider decision: ${providerDecision}`);
console.log(`  Dry-run eligible : ${dryRunEligible}`);

// 3. Precondition assessment
console.log('\n[ Dry-Run Preconditions ]\n');

if (!dryRunEligible) {
  info('Provider configured', 'NO — provider not configured (PROVIDER_NOT_CONFIGURED)');
  info('Blocked state', 'PROVIDER_NOT_CONFIGURED — configure DATA_PROVIDER + key to enable dry-run');
  info('Action', 'Owner: set DATA_PROVIDER=parse-psl + PARSE_API_KEY in beta .env');

  const passCt = results.filter(r => r.status === 'PASS').length;
  const failCt = results.filter(r => r.status === 'FAIL').length;
  const infoCt = results.filter(r => r.status === 'INFO').length;
  console.log('\n────────────────────────────────────────────────────────────');
  console.log(`PASS: ${passCt} | FAIL: ${failCt} | INFO: ${infoCt}`);
  console.log('\nFinal status: PROVIDER_NOT_CONFIGURED (exit 0 — expected blocked state)');
  console.log('SECURITY: dryRun=true always. No write import. No publication. No PSL activation.');
  process.exit(0);
}

pass('Provider configured', `dryRunEligible=true — ${providerDecision}`);

if (readinessStatus === 'SOURCE_EMPTY') {
  info('Source status', 'SOURCE_EMPTY — no PSL 2026/27 fixtures available from provider yet');
  info('Expected date', '~July/August 2026 when psl.co.za publishes the season schedule');

  if (!RUN_DRY_RUN) {
    const passCt = results.filter(r => r.status === 'PASS').length;
    const failCt = results.filter(r => r.status === 'FAIL').length;
    const infoCt = results.filter(r => r.status === 'INFO').length;
    console.log('\n────────────────────────────────────────────────────────────');
    console.log(`PASS: ${passCt} | FAIL: ${failCt} | INFO: ${infoCt}`);
    console.log('\nFinal status: SOURCE_EMPTY (exit 0 — expected no-op state)');
    console.log('SECURITY: dryRun=true always. No write import. No publication. No PSL activation.');
    process.exit(0);
  }
}

// 4. Optional dry-run import call (only if RUN_DRY_RUN=true and fixtures may be available)
if (RUN_DRY_RUN) {
  console.log('\n[ Dry-Run Import Call (dryRun=true — no writes) ]\n');
  warn('Dry-run', 'Calling POST /admin/data-provider/parse-psl/fixtures/ingest with dryRun=true');

  const dryRunBody = {
    dryRun: true,
    includeCandidates: true,
    competitionCode: 'BETWAY_PREMIERSHIP',
    // confirmWrite is NOT set — never set confirmWrite here
    // seasonId is NOT set — not needed for dry-run
  };

  // Final safety check: body must never contain confirmWrite=true or dryRun=false
  if (dryRunBody.confirmWrite === true) {
    fail('Dry-run safety', 'confirmWrite=true detected — BLOCKED');
    process.exit(1);
  }
  if (dryRunBody.dryRun === false) {
    fail('Dry-run safety', 'dryRun=false detected — BLOCKED');
    process.exit(1);
  }
  pass('Dry-run safety', 'dryRun=true, confirmWrite not set');

  const dryRun = await apiPost('/admin/data-provider/parse-psl/fixtures/ingest', dryRunBody);

  if (dryRun.status === 401) {
    fail('Dry-run endpoint', 'HTTP 401 — token invalid');
    process.exit(2);
  }
  if (dryRun.status === 403) {
    fail('Dry-run endpoint', 'HTTP 403 — PSL_ADMIN role required');
    process.exit(2);
  }
  if (dryRun.status >= 500) {
    fail('Dry-run endpoint', `HTTP ${dryRun.status} — server error`);
    process.exit(1);
  }

  if (dryRun.status === 200) {
    pass('Dry-run endpoint', `HTTP ${dryRun.status}`);
    const d = dryRun.json ?? {};

    console.log(`\n  Source status : ${d.sourceStatus ?? 'UNKNOWN'}`);
    console.log(`  Discovered    : ${d.discovered ?? 0}`);
    console.log(`  Normalized    : ${d.normalized ?? 0}`);
    console.log(`  Candidates    : ${d.candidates?.length ?? 0}`);
    console.log(`  Errors        : ${d.errors?.length ?? 0}`);
    console.log(`  Warnings      : ${d.warnings?.length ?? 0}`);
    console.log(`  DB writes     : ${d.created ?? 0} created / ${d.updated ?? 0} updated (must be 0 in dry-run)`);

    // Verify dry-run — no DB writes should occur
    if ((d.created ?? 0) > 0 || (d.updated ?? 0) > 0) {
      fail('No DB writes in dry-run', `created=${d.created} updated=${d.updated} — UNEXPECTED`);
      process.exit(1);
    }
    pass('No DB writes in dry-run', 'created=0 updated=0');

    if (d.candidates?.length > 0) {
      pass('Fixture candidates found', `${d.candidates.length} candidate(s) — owner review required before write import`);
      info('Next step', 'Share candidate list with owner for review before requesting write import approval');
      info('Write import', 'Requires separate owner approval — use docs/data/SPRINT-37-OWNER-APPROVAL-PACK-FIXTURE-WRITE-IMPORT.md');
    } else if (d.sourceStatus === 'SOURCE_EMPTY') {
      info('Source empty', 'No fixtures from provider — expected state until July/August 2026');
    }

    if (d.errors?.length > 0) {
      d.errors.slice(0, 5).forEach(e => console.log(`  [ERR] ${e}`));
    }
    if (d.warnings?.length > 0) {
      d.warnings.slice(0, 5).forEach(w => console.log(`  [WARN] ${w}`));
    }
  }
}

// 5. Summary
const passCt = results.filter(r => r.status === 'PASS').length;
const failCt = results.filter(r => r.status === 'FAIL').length;
const infoCt = results.filter(r => r.status === 'INFO').length;
const warnCt = results.filter(r => r.status === 'WARN').length;

console.log('\n────────────────────────────────────────────────────────────');
console.log(`PASS: ${passCt} | FAIL: ${failCt} | WARN: ${warnCt} | INFO: ${infoCt}`);
console.log('\nSECURITY: dryRun=true always. confirmWrite NOT set. No write import.');
console.log('          No fixture publication. No PSL activation. No scheduler.');
console.log('          Admin JWT was NOT printed. Provider keys were NOT returned.');

process.exit(failCt > 0 ? 1 : 0);
