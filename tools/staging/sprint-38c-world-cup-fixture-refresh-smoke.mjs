#!/usr/bin/env node
/**
 * Sprint 38C — World Cup Fixture Refresh Smoke Test
 *
 * Verifies the new fixture status refresh endpoint:
 * 1. Endpoint exists and requires PSL_ADMIN auth
 * 2. With valid token, returns expected response shape
 * 3. Safety flags are present in response
 * 4. Provider key present in env → source status reported correctly
 *
 * Usage:
 *   ADMIN_TOKEN=<jwt> node tools/staging/sprint-38c-world-cup-fixture-refresh-smoke.mjs [BASE_URL]
 *
 * Defaults to http://localhost:4000 if no URL provided.
 * For EC2 staging: ADMIN_TOKEN=<jwt> node ... http://api.staging.pslone.co.za
 */

const BASE_URL = process.argv[2] ?? 'http://localhost:4000';
const ADMIN_TOKEN = process.env['ADMIN_TOKEN'];

let passed = 0;
let failed = 0;

function ok(label, value) {
  if (value) { console.log(`  PASS  ${label}`); passed++; }
  else { console.error(`  FAIL  ${label}`); failed++; }
}

async function main() {
  console.log(`\nSprint 38C WC Fixture Refresh Smoke — ${BASE_URL}`);
  console.log('='.repeat(60));

  // 1. Unauthenticated request should return 401
  console.log('\n[1] RBAC guard — unauthenticated request');
  try {
    const res = await fetch(`${BASE_URL}/admin/data-provider/world-cup/fixtures/refresh-status`, {
      method: 'POST',
    });
    ok('POST without auth → 401', res.status === 401);
  } catch (e) {
    console.error(`  FAIL  Request failed: ${e.message}`);
    failed++;
  }

  // 2. Authenticated request (if token provided)
  if (!ADMIN_TOKEN) {
    console.log('\n  SKIP  ADMIN_TOKEN not set — skipping authenticated tests');
    console.log('  INFO  Set ADMIN_TOKEN env var to run full smoke');
    console.log('\n' + '='.repeat(60));
    console.log(`RESULT: ${passed} PASS / ${failed} FAIL (partial — no token)`);
    if (failed > 0) process.exit(1);
    return;
  }

  console.log('\n[2] Authenticated request');
  let refreshResult = null;
  try {
    const res = await fetch(`${BASE_URL}/admin/data-provider/world-cup/fixtures/refresh-status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}`, 'Content-Type': 'application/json' },
    });
    ok('POST with PSL_ADMIN token → 200', res.status === 200);
    if (res.ok) refreshResult = await res.json();
  } catch (e) {
    console.error(`  FAIL  Request failed: ${e.message}`);
    failed++;
  }

  if (refreshResult) {
    console.log('\n[3] Response shape validation');
    ok('Has provider field', typeof refreshResult.provider === 'string');
    ok('Has sourceStatus field', typeof refreshResult.sourceStatus === 'string');
    ok('Has discovered field', typeof refreshResult.discovered === 'number');
    ok('Has matched field', typeof refreshResult.matched === 'number');
    ok('Has updated field', typeof refreshResult.updated === 'number');
    ok('Has skipped field', typeof refreshResult.skipped === 'number');
    ok('Has errors array', Array.isArray(refreshResult.errors));
    ok('Has safety object', refreshResult.safety && typeof refreshResult.safety === 'object');
    ok('safety.noPslActivation = true', refreshResult.safety?.noPslActivation === true);
    ok('safety.noRealMoney = true', refreshResult.safety?.noRealMoney === true);
    ok('safety.noNewFixtures = true', refreshResult.safety?.noNewFixtures === true);

    console.log('\n[4] Source status check');
    const VALID_SOURCE_STATUSES = ['SOURCE_AVAILABLE', 'SOURCE_EMPTY', 'AUTH_FAILED', 'RATE_LIMITED', 'PROVIDER_ERROR'];
    ok('sourceStatus is known value', VALID_SOURCE_STATUSES.includes(refreshResult.sourceStatus));
    console.log(`  INFO  sourceStatus: ${refreshResult.sourceStatus}`);
    console.log(`  INFO  discovered: ${refreshResult.discovered}`);
    console.log(`  INFO  matched: ${refreshResult.matched}`);
    console.log(`  INFO  updated: ${refreshResult.updated}`);
    console.log(`  INFO  skipped: ${refreshResult.skipped}`);
    if (refreshResult.errors.length > 0) {
      console.log(`  WARN  errors: ${refreshResult.errors.slice(0, 3).join('; ')}`);
    }
  }

  // 3. GTS status endpoint
  console.log('\n[5] GTS status endpoint');
  try {
    const res = await fetch(`${BASE_URL}/admin/data-provider/world-cup/gts-status`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    ok('GET /world-cup/gts-status → 200', res.status === 200);
    if (res.ok) {
      const gts = await res.json();
      ok('Has predictionMarkets', gts.predictionMarkets !== undefined);
      console.log(`  INFO  Open markets: ${gts.predictionMarkets?.open ?? 'N/A'}`);
    }
  } catch (e) {
    console.error(`  FAIL  ${e.message}`);
    failed++;
  }

  // 4. Media status endpoint
  console.log('\n[6] Media status endpoint');
  try {
    const res = await fetch(`${BASE_URL}/admin/data-provider/world-cup/media-status`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    ok('GET /world-cup/media-status → 200', res.status === 200);
    if (res.ok) {
      const media = await res.json();
      ok('Has provider field', typeof media.provider === 'string');
      ok('Has widget field', media.widget !== undefined);
      ok('safety.noPslActivation = true', media.safety?.noPslActivation === true);
      console.log(`  INFO  Widget available: ${media.widget?.available}`);
    }
  } catch (e) {
    console.error(`  FAIL  ${e.message}`);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`RESULT: ${passed} PASS / ${failed} FAIL`);
  if (failed > 0) process.exit(1);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
