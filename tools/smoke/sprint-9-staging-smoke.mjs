#!/usr/bin/env node
/**
 * PSL One — Sprint 9 Staging Smoke Suite
 * Idempotent staging-safe smoke tests. No fan data mutation.
 * Usage: BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-staging-smoke.mjs
 *        SMOKE_ADMIN_TOKEN=<token> BASE_URL=... node tools/smoke/sprint-9-staging-smoke.mjs
 * Note: No key values are printed. Admin token is consumed but never logged.
 */

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:4000';
const SMOKE_ADMIN_TOKEN = process.env['SMOKE_ADMIN_TOKEN'];

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

async function get(path, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, { headers, signal: AbortSignal.timeout(8000) });
  return res;
}

async function post(path, headers = {}, body = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  return res;
}

// 1. API health
async function healthCheck() {
  try {
    const res = await get('/health');
    if (res.status === 200) pass('API health', `HTTP ${res.status}`);
    else fail('API health', `HTTP ${res.status} (expected 200)`);
  } catch (err) {
    fail('API health', `Network error: ${err.message}`);
  }
}

// 2. Fixture list (public endpoint)
async function fixtureListCheck() {
  try {
    const res = await get('/football/fixtures?limit=3');
    if (res.status === 200) {
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : (Array.isArray(data?.data) ? data.data.length : '?');
      pass('Fixture list (public)', `HTTP 200, ${count} fixture(s)`);
    } else {
      fail('Fixture list (public)', `HTTP ${res.status}`);
    }
  } catch (err) {
    fail('Fixture list (public)', err.message);
  }
}

// 3. Challenge result — non-existent token (expect 404)
async function challengeResultNotFoundCheck() {
  try {
    const res = await get('/predictions/challenges/smoke-test-nonexistent-token/result');
    if (res.status === 404) pass('Challenge result 404 (expected)', 'endpoint exists and correctly returns 404 for unknown token');
    else if (res.status === 200) fail('Challenge result 404', `Got 200 — should be 404 for nonexistent token`);
    else fail('Challenge result 404', `HTTP ${res.status} (expected 404)`);
  } catch (err) {
    fail('Challenge result 404', err.message);
  }
}

// 4. Settlement admin gate — no auth (expect 401)
async function settlementGateCheck() {
  try {
    const res = await post('/predictions/challenges/settle-fixture/smoke-test-fx', {}, {});
    if (res.status === 401) pass('Settlement admin gate (401)', 'auth guard active — unauthenticated request correctly rejected');
    else if (res.status === 403) pass('Settlement admin gate (403)', 'RBAC guard active — forbidden correctly');
    else fail('Settlement admin gate', `HTTP ${res.status} (expected 401)`);
  } catch (err) {
    fail('Settlement admin gate', err.message);
  }
}

// 5. Onboarding endpoint exists and is gated (expect 401)
async function onboardingCheck() {
  try {
    const res = await get('/onboarding/status');
    if (res.status === 401) pass('Onboarding endpoint gated (401)', 'endpoint exists and requires auth');
    else if (res.status === 200) pass('Onboarding endpoint (200)', 'endpoint accessible (may be public)');
    else fail('Onboarding endpoint', `HTTP ${res.status}`);
  } catch (err) {
    fail('Onboarding endpoint', err.message);
  }
}

// 6. Provider health admin endpoint (expect 401 without auth)
async function providerHealthGateCheck() {
  try {
    const res = await get('/admin/data-provider/health');
    if (res.status === 401) pass('Provider health admin gate (401)', 'endpoint exists and requires auth');
    else if (res.status === 403) pass('Provider health admin gate (403)', 'RBAC guard active');
    else fail('Provider health admin gate', `HTTP ${res.status} (expected 401)`);
  } catch (err) {
    fail('Provider health admin gate', err.message);
  }
}

// 7. Admin provider health (requires SMOKE_ADMIN_TOKEN)
async function adminProviderHealthCheck() {
  if (!SMOKE_ADMIN_TOKEN) {
    skip('Admin provider health (authed)', 'SMOKE_ADMIN_TOKEN not set');
    return;
  }
  try {
    // Token consumed but never printed
    const res = await get('/admin/data-provider/health', { Authorization: `Bearer ${SMOKE_ADMIN_TOKEN}` });
    if (res.status === 200) {
      const data = await res.json();
      const providerName = data?.provider ?? 'unknown';
      const available = data?.available ?? false;
      pass('Admin provider health (authed)', `provider=${providerName}, available=${available}`);
    } else {
      fail('Admin provider health (authed)', `HTTP ${res.status}`);
    }
  } catch (err) {
    fail('Admin provider health (authed)', err.message);
  }
}

// 8. Admin settle-fixture (requires SMOKE_ADMIN_TOKEN, uses safe nonexistent fixture)
async function adminSettlementCheck() {
  if (!SMOKE_ADMIN_TOKEN) {
    skip('Admin settle-fixture (authed)', 'SMOKE_ADMIN_TOKEN not set');
    return;
  }
  try {
    const res = await post(
      '/predictions/challenges/settle-fixture/smoke-test-nonexistent-fixture-id',
      { Authorization: `Bearer ${SMOKE_ADMIN_TOKEN}` },
    );
    // 200 with 0 settled is fine (no challenges for nonexistent fixture)
    // 404 means fixture not found — also acceptable
    if (res.status === 200 || res.status === 404) {
      pass('Admin settle-fixture (authed)', `HTTP ${res.status} — endpoint reachable and authorized`);
    } else if (res.status === 401 || res.status === 403) {
      fail('Admin settle-fixture (authed)', `HTTP ${res.status} — token may not have ADMIN role`);
    } else {
      fail('Admin settle-fixture (authed)', `HTTP ${res.status}`);
    }
  } catch (err) {
    fail('Admin settle-fixture (authed)', err.message);
  }
}

async function main() {
  console.log('PSL One — Sprint 9 Staging Smoke Suite');
  console.log('========================================');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Admin token: ${SMOKE_ADMIN_TOKEN ? '[SET — not printed]' : '[not set — auth checks will be SKIPPED]'}`);
  console.log('');

  await healthCheck();
  await fixtureListCheck();
  await challengeResultNotFoundCheck();
  await settlementGateCheck();
  await onboardingCheck();
  await providerHealthGateCheck();
  await adminProviderHealthCheck();
  await adminSettlementCheck();

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  console.log('');
  console.log('── Summary ─────────────────────────────────');
  console.log(`  PASS: ${passed}  FAIL: ${failed}  SKIP: ${skipped}  TOTAL: ${results.length}`);

  let overall;
  if (failed === 0 && passed > 0) overall = 'PASS';
  else if (failed === 0) overall = 'PARTIAL (all skipped or no checks ran)';
  else overall = 'FAIL';
  console.log(`  Overall: ${overall}`);

  if (failed > 0) {
    console.log('\n  Failed checks:');
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`    - ${r.name}: ${r.detail}`));
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Smoke suite crashed:', err.message);
  process.exit(1);
});
