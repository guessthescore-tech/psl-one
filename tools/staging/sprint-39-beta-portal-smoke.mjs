#!/usr/bin/env node
/**
 * Sprint 39 Beta Portal Smoke Test
 *
 * Tests:
 * - Fan routes return 200 without auth
 * - Admin routes return 401 without auth
 * - API health endpoint returns 200
 *
 * Usage:
 *   node tools/staging/sprint-39-beta-portal-smoke.mjs [BASE_URL]
 *   BASE_URL=http://16.28.84.11 node tools/staging/sprint-39-beta-portal-smoke.mjs
 *
 * WC_BETA · PSL_INACTIVE · NO_REAL_MONEY
 */

const BASE_URL = process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:3001';
const EXP_URL = process.env.EXP_URL ?? 'http://localhost:3000';

const API_CHECKS = [
  // Public API routes — should return 200
  { url: `${BASE_URL}/health`, expect: 200, label: 'API health' },
  { url: `${BASE_URL}/football/fixtures?seasonSlug=fifa-world-cup-2026`, expect: 200, label: 'Public WC fixtures' },
  { url: `${BASE_URL}/football/world-cup/scorebat-widget`, expect: 200, label: 'Public ScoreBat widget config' },
  { url: `${BASE_URL}/football/competitions`, expect: 200, label: 'Public competitions list' },
  { url: `${BASE_URL}/auth/me`, expect: 401, label: 'Auth /me without token (expect 401)' },
  // Admin routes without auth — should return 401
  { url: `${BASE_URL}/admin/data-provider/health`, expect: 401, label: 'Admin health without auth (expect 401)' },
  { url: `${BASE_URL}/admin/data-provider/world-cup/fixture-status`, expect: 401, label: 'Admin WC status without auth (expect 401)' },
  { url: `${BASE_URL}/admin/data-provider/psl-fixture-readiness`, expect: 401, label: 'Admin PSL readiness without auth (expect 401)' },
  { url: `${BASE_URL}/admin/data-provider/world-cup/gts-status`, expect: 401, label: 'Admin GTS status without auth (expect 401)' },
  { url: `${BASE_URL}/admin/data-provider/world-cup/media-status`, expect: 401, label: 'Admin media status without auth (expect 401)' },
];

let pass = 0;
let fail = 0;

async function check({ url, expect: expectedStatus, label }) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const ok = res.status === expectedStatus;
    if (ok) {
      console.log(`  PASS  ${label} [${res.status}]`);
      pass++;
    } else {
      console.log(`  FAIL  ${label} — expected ${expectedStatus}, got ${res.status} — ${url}`);
      fail++;
    }
  } catch (err) {
    console.log(`  FAIL  ${label} — network error: ${err.message}`);
    fail++;
  }
}

console.log(`\nSprint 39 Beta Portal Smoke — API @ ${BASE_URL}`);
console.log('='.repeat(60));

for (const c of API_CHECKS) {
  await check(c);
}

console.log('='.repeat(60));
console.log(`Result: ${pass} PASS / ${fail} FAIL\n`);

if (fail > 0) {
  process.exit(1);
}
