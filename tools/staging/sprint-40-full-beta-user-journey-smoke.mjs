#!/usr/bin/env node
/**
 * Sprint 40 — Full Beta User Journey Smoke Test
 *
 * Tests all critical routes against the real EC2 beta environment.
 * Run from any machine with access to the beta EC2 (port 80 open to 0.0.0.0/0).
 *
 * Usage:
 *   node tools/staging/sprint-40-full-beta-user-journey-smoke.mjs
 *   BASE_URL=http://16.28.84.11 node tools/staging/sprint-40-full-beta-user-journey-smoke.mjs
 *
 * For auth routes, set:
 *   FAN_JWT=<token> PSL_ADMIN_JWT=<token> node tools/staging/...
 */

const BASE_URL = process.env.BASE_URL ?? 'http://16.28.84.11';
const FAN_JWT = process.env.FAN_JWT ?? '';
const PSL_ADMIN_JWT = process.env.PSL_ADMIN_JWT ?? '';
const TIMEOUT_MS = 15_000;

const results = [];
let passed = 0;
let failed = 0;
let skipped = 0;

async function check(label, url, opts = {}) {
  const { expectStatus = 200, auth, expectField, dataSource = 'api', expectContains, method = 'GET' } = opts;

  const headers = { 'User-Agent': 'psl-smoke/sprint-40' };
  if (method === 'POST') headers['Content-Type'] = 'application/json';
  if (auth === 'fan' && FAN_JWT) headers['Authorization'] = `Bearer ${FAN_JWT}`;
  if (auth === 'admin' && PSL_ADMIN_JWT) headers['Authorization'] = `Bearer ${PSL_ADMIN_JWT}`;
  if (auth === 'fan' && !FAN_JWT) {
    results.push({ label, status: 'SKIP', reason: 'FAN_JWT not set', dataSource });
    skipped++;
    return;
  }
  if (auth === 'admin' && !PSL_ADMIN_JWT) {
    results.push({ label, status: 'SKIP', reason: 'PSL_ADMIN_JWT not set', dataSource });
    skipped++;
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const fetchOpts = { method, headers, signal: controller.signal };
    if (method === 'POST') fetchOpts.body = '{}';
    const res = await fetch(url, fetchOpts);
    clearTimeout(timeout);

    const body = await res.text();
    let json = null;
    try { json = JSON.parse(body); } catch {}

    const statusOk = res.status === expectStatus;

    let fieldOk = true;
    if (expectField && json) {
      fieldOk = expectField.split('.').reduce((o, k) => o?.[k], json) !== undefined;
    }

    let containsOk = true;
    if (expectContains) {
      containsOk = body.includes(expectContains);
    }

    const ok = statusOk && fieldOk && containsOk;

    results.push({
      label,
      status: ok ? 'PASS' : 'FAIL',
      httpStatus: res.status,
      expectedStatus: expectStatus,
      fieldCheck: expectField ? (fieldOk ? 'OK' : `MISSING: ${expectField}`) : undefined,
      containsCheck: expectContains ? (containsOk ? 'OK' : `MISSING: "${expectContains}"`) : undefined,
      dataSource,
      url,
    });
    if (ok) passed++; else failed++;
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = err.name === 'AbortError';
    results.push({
      label,
      status: 'FAIL',
      error: isTimeout ? 'TIMEOUT' : err.message,
      dataSource,
      url,
    });
    failed++;
  }
}

console.log(`\nPSL One — Sprint 40 Full Beta User Journey Smoke`);
console.log(`Base URL: ${BASE_URL}`);
console.log(`Auth: FAN=${FAN_JWT ? 'SET' : 'NOT SET'} | PSL_ADMIN=${PSL_ADMIN_JWT ? 'SET' : 'NOT SET'}`);
console.log('─'.repeat(70));

// ── PHASE 1: Infrastructure ──────────────────────────────────────────────────
console.log('\n[Phase 1] Infrastructure');
await check('API health', `${BASE_URL}/api/health`, { expectField: 'status' });
await check('API ready', `${BASE_URL}/api/health/ready`, { expectField: 'status' });

// ── PHASE 2: World Cup Data ──────────────────────────────────────────────────
console.log('\n[Phase 2] World Cup Data');
await check('WC fixtures endpoint', `${BASE_URL}/api/football/fixtures?seasonSlug=fifa-world-cup-2026`, {
  expectContains: 'SCHEDULED',
  dataSource: 'api',
});
await check('SA vs KOR fixture in API', `${BASE_URL}/api/football/fixtures?seasonSlug=fifa-world-cup-2026`, {
  expectContains: 'South Africa',
  dataSource: 'api',
});
await check('Prediction fixtures → 401 without token', `${BASE_URL}/api/predictions/fixtures`, {
  expectStatus: 401,
  dataSource: 'api',
});
await check('Football seasons (fan)', `${BASE_URL}/api/football/seasons`, {
  expectStatus: 200,
  dataSource: 'api',
});
await check('Active season', `${BASE_URL}/api/football/seasons/active`, {
  expectStatus: 200,
  dataSource: 'api',
});
await check('Fantasy player pool (public)', `${BASE_URL}/api/fantasy/player-pool`, {
  expectStatus: 200,
  dataSource: 'api',
});
await check('Fantasy leaderboard', `${BASE_URL}/api/fantasy/leaderboard`, {
  expectStatus: 200,
  dataSource: 'api',
});

// ── PHASE 3: Authentication ──────────────────────────────────────────────────
console.log('\n[Phase 3] Authentication');
await check('Auth login (no body → 400)', `${BASE_URL}/api/auth/login`, {
  expectStatus: 400,
  dataSource: 'api',
  method: 'POST',
});
await check('Auth register (no body → 400)', `${BASE_URL}/api/auth/register`, {
  expectStatus: 400,
  dataSource: 'api',
  method: 'POST',
});

// ── PHASE 4: FAN Routes (authenticated) ──────────────────────────────────────
console.log('\n[Phase 4] Fan Routes (authenticated)');
await check('My profile (auth/me)', `${BASE_URL}/api/auth/me`, {
  auth: 'fan',
  expectStatus: 200,
  expectField: 'email',
  dataSource: 'api',
});
await check('My fantasy team', `${BASE_URL}/api/fantasy/team/me`, {
  auth: 'fan',
  expectStatus: 200,
  dataSource: 'api',
});
await check('My predictions', `${BASE_URL}/api/predictions/me`, {
  auth: 'fan',
  expectStatus: 200,
  dataSource: 'api',
});
await check('My notifications', `${BASE_URL}/api/notifications`, {
  auth: 'fan',
  expectStatus: 200,
  dataSource: 'api',
});
await check('Fantasy transfers status', `${BASE_URL}/api/fantasy/transfers/status`, {
  auth: 'fan',
  expectStatus: 200,
  dataSource: 'api',
});

// ── PHASE 5: Auth Guards (unauthenticated = 401) ──────────────────────────────
console.log('\n[Phase 5] Auth Guards (unauthenticated = 401)');
await check('auth/me → 401 without token', `${BASE_URL}/api/auth/me`, {
  expectStatus: 401,
  dataSource: 'api',
});
await check('fantasy/team/me → 401 without token', `${BASE_URL}/api/fantasy/team/me`, {
  expectStatus: 401,
  dataSource: 'api',
});
await check('notifications → 401 without token', `${BASE_URL}/api/notifications`, {
  expectStatus: 401,
  dataSource: 'api',
});

// ── PHASE 6: Admin Routes ────────────────────────────────────────────────────
console.log('\n[Phase 6] Admin Routes');
await check('admin/competitions → 401 without JWT', `${BASE_URL}/api/admin/competitions`, {
  expectStatus: 401,
  dataSource: 'api',
});
await check('Admin PSL fixture readiness', `${BASE_URL}/api/admin/data-provider/psl-fixture-readiness`, {
  auth: 'admin',
  expectStatus: 200,
  dataSource: 'api',
});
await check('Admin fantasy calibration seasons', `${BASE_URL}/api/admin/competitions`, {
  auth: 'admin',
  expectStatus: 200,
  dataSource: 'api',
});
await check('Admin fantasy player pool', `${BASE_URL}/api/fantasy/admin/calibration`, {
  auth: 'admin',
  expectStatus: 200,
  dataSource: 'api',
});
await check('FAN cannot access admin (403)', `${BASE_URL}/api/admin/competitions`, {
  auth: 'fan',
  expectStatus: 403,
  dataSource: 'api',
});

// ── PHASE 7: Club Portal ─────────────────────────────────────────────────────
console.log('\n[Phase 7] Club Portal');
await check('Club portal overview → 401 without token', `${BASE_URL}/api/club-portal/overview`, {
  expectStatus: 401,
  dataSource: 'api',
});
await check('Public clubs list (fan)', `${BASE_URL}/api/clubs`, {
  expectStatus: 200,
  dataSource: 'api',
});

// ── PHASE 8: Sponsor Portal ──────────────────────────────────────────────────
console.log('\n[Phase 8] Sponsor Portal');
await check('Sponsor portal overview → 401 without token', `${BASE_URL}/api/sponsor-portal/overview`, {
  expectStatus: 401,
  dataSource: 'api',
});

// ── PHASE 9: Security Boundaries ─────────────────────────────────────────────
console.log('\n[Phase 9] Security Boundaries');
await check('WC active season (WC_BETA)', `${BASE_URL}/api/football/seasons/active`, {
  expectStatus: 200,
  dataSource: 'api',
});
await check('Football context available', `${BASE_URL}/api/football/context`, {
  expectStatus: 200,
  dataSource: 'api',
});

// ── RESULTS ──────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(70));
console.log('Results:\n');

const maxLabel = Math.max(...results.map(r => r.label.length));

for (const r of results) {
  const statusIcon = r.status === 'PASS' ? '✓' : r.status === 'SKIP' ? '○' : '✗';
  const label = r.label.padEnd(maxLabel);
  let detail = '';
  if (r.status === 'FAIL') {
    detail = r.error ?? `HTTP ${r.httpStatus} (expected ${r.expectedStatus})`;
    if (r.fieldCheck && r.fieldCheck !== 'OK') detail += ` | ${r.fieldCheck}`;
    if (r.containsCheck && r.containsCheck !== 'OK') detail += ` | ${r.containsCheck}`;
  } else if (r.status === 'SKIP') {
    detail = r.reason;
  } else {
    detail = `HTTP ${r.httpStatus ?? '—'} [${r.dataSource}]`;
  }
  console.log(`  ${statusIcon}  ${label}  ${detail}`);
}

console.log('\n' + '─'.repeat(70));
console.log(`  PASS: ${passed}  |  FAIL: ${failed}  |  SKIP: ${skipped}  |  TOTAL: ${results.length}`);

if (failed > 0) {
  console.log(`\nFailing tests:`);
  for (const r of results.filter(r => r.status === 'FAIL')) {
    console.log(`  - ${r.label}: ${r.error ?? `HTTP ${r.httpStatus}`}`);
    if (r.url) console.log(`    ${r.url}`);
  }
}

console.log('');
process.exit(failed > 0 ? 1 : 0);
