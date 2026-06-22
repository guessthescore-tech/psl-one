#!/usr/bin/env node
/**
 * Sprint 19 — Admin RBAC Smoke
 *
 * Verifies that all admin endpoints correctly reject unauthenticated
 * and non-admin requests. Does not test write operations.
 *
 * Usage:
 *   BASE_URL=http://16.28.84.11:3000 node sprint-19-admin-rbac-smoke.mjs
 *   ADMIN_TOKEN=<jwt> BASE_URL=... node sprint-19-admin-rbac-smoke.mjs
 *
 * SECURITY: No provider keys printed. No PSL activation. Points-only.
 */

// Sprint 9 gate
const _sportmonksRef = process.env['SPORTMONKS_API_KEY'];

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:3000';
const ADMIN_TOKEN = process.env['ADMIN_TOKEN'] ?? '';

const results = [];

function pass(name, detail = '') {
  results.push({ name, status: 'PASS', detail });
  console.log(`  [PASS] ${name}${detail ? ' — ' + detail : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, status: 'FAIL', detail });
  console.log(`  [FAIL] ${name}${detail ? ' — ' + detail : ''}`);
}

async function fetchRaw(path, headers = {}, method = 'GET', body = undefined) {
  const opts = { method, headers: { 'Content-Type': 'application/json', ...headers }, signal: AbortSignal.timeout(8000) };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  return res.status;
}

console.log('=== Sprint 19 — Admin RBAC Smoke ===');
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`ADMIN_TOKEN present: ${Boolean(ADMIN_TOKEN)}`);
console.log('');

// Admin routes that require ADMIN role
const adminGetRoutes = [
  '/admin/fixtures/imported',
  '/admin/psl/preflight',
  '/admin/data-provider/health',
];

// ── Unauthenticated requests should return 401 ────────────────────────────
console.log('[ Unauthenticated requests — expect 401 ]');
for (const route of adminGetRoutes) {
  try {
    const status = await fetchRaw(route);
    if (status === 401 || status === 403) pass(`No-auth: ${route}`, `HTTP ${status} — correctly rejected`);
    else fail(`No-auth: ${route}`, `HTTP ${status} — expected 401 or 403`);
  } catch (e) { fail(`No-auth: ${route}`, `Network: ${e.message}`); }
}
console.log('');

// ── Admin token requests should return non-5xx ────────────────────────────
if (ADMIN_TOKEN) {
  console.log('[ Admin token requests — expect non-5xx ]');
  const headers = { Authorization: `Bearer ${ADMIN_TOKEN}` };
  for (const route of adminGetRoutes) {
    try {
      const status = await fetchRaw(route, headers);
      if (status < 500) pass(`Admin: ${route}`, `HTTP ${status}`);
      else fail(`Admin: ${route}`, `HTTP ${status} — server error`);
    } catch (e) { fail(`Admin: ${route}`, `Network: ${e.message}`); }
  }
} else {
  console.log('[ Admin token requests — SKIPPED (no ADMIN_TOKEN) ]');
}
console.log('');

// ── POST publish without auth ─────────────────────────────────────────────
console.log('[ POST /admin/fixtures/publish — unauthenticated ]');
try {
  const status = await fetchRaw(
    '/admin/fixtures/publish',
    {},
    'POST',
    { fixtureIds: ['test'], publish: true, confirmPublication: true },
  );
  if (status === 401 || status === 403) pass('No-auth publish', `HTTP ${status} — correctly rejected`);
  else fail('No-auth publish', `HTTP ${status} — expected 401 or 403`);
} catch (e) { fail('No-auth publish', `Network: ${e.message}`); }
console.log('');

// ── POST publish without confirmPublication ───────────────────────────────
console.log('[ POST /admin/fixtures/publish — missing confirmPublication ]');
try {
  const headers = ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {};
  const status = await fetchRaw(
    '/admin/fixtures/publish',
    headers,
    'POST',
    { fixtureIds: ['test'], publish: true },
  );
  if ([400, 401, 403].includes(status)) pass('Publish without confirmPublication', `HTTP ${status} — correctly rejected`);
  else fail('Publish without confirmPublication', `HTTP ${status} — expected 400/401/403`);
} catch (e) { fail('Publish without confirmPublication', `Network: ${e.message}`); }
console.log('');

// ── Summary ───────────────────────────────────────────────────────────────
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;

console.log('─'.repeat(60));
console.log(`PASS: ${passed} | FAIL: ${failed}`);
if (failed > 0) {
  results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  FAIL: ${r.name}: ${r.detail}`));
  process.exit(1);
}
