#!/usr/bin/env node
/**
 * Sprint 28 Role Cross-Tenant Smoke Tool
 * Verifies role isolation:
 *   - FAN → 403 on club-portal and sponsor-portal
 *   - CLUB_ADMIN → 403 on sponsor-portal
 *   - SPONSOR → 403 on club-portal
 *   - Anonymous → 401 on all portals
 *
 * PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NON-FINANCIAL
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 \
 *   FAN_TOKEN=<token> \
 *   CLUB_ADMIN_TOKEN=<token> \
 *   SPONSOR_TOKEN=<token> \
 *   node tools/staging/sprint-28-role-cross-tenant-smoke.mjs
 *
 * Tokens must be obtained via admin provisioning runbook.
 * Never print token values — security invariant.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const FAN_TOKEN = process.env.FAN_TOKEN ?? '';
const CLUB_ADMIN_TOKEN = process.env.CLUB_ADMIN_TOKEN ?? '';
const SPONSOR_TOKEN = process.env.SPONSOR_TOKEN ?? '';

const results = [];

async function check(label, fn) {
  try {
    const r = await fn();
    results.push({ label, status: r });
    console.log(`${String(r).padEnd(40)} ${label}`);
  } catch (e) {
    results.push({ label, status: 'ERROR' });
    console.log(`${'ERROR'.padEnd(40)} ${label}: ${e.message}`);
  }
}

async function expectStatus(path, token, expectedStatus, expectedLabel) {
  if (!token) return 'PENDING_TOKEN';
  const r = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (r.status === expectedStatus) return expectedLabel;
  if (r.status >= 500) return 'UNEXPECTED_5XX';
  return `UNEXPECTED_${r.status}`;
}

console.log('Sprint 28 Role Cross-Tenant Smoke Tool');
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NON-FINANCIAL');
console.log(`BASE_URL: ${BASE_URL}`);
const fanSet = FAN_TOKEN ? '[SET]' : '[MISSING]';
const clubSet = CLUB_ADMIN_TOKEN ? '[SET]' : '[MISSING]';
const sponsorSet = SPONSOR_TOKEN ? '[SET]' : '[MISSING]';
console.log(`fan credential: ${fanSet}`);
console.log(`club-admin credential: ${clubSet}`);
console.log(`sponsor credential: ${sponsorSet}`);
console.log('');

// ── Anonymous: 401 on both portals
await check('Anonymous /club-portal/overview → 401', async () => {
  const r = await fetch(`${BASE_URL}/club-portal/overview`);
  return r.status === 401 ? 'PASS_401' : `UNEXPECTED_${r.status}`;
});

await check('Anonymous /sponsor-portal/overview → 401', async () => {
  const r = await fetch(`${BASE_URL}/sponsor-portal/overview`);
  return r.status === 401 ? 'PASS_401' : `UNEXPECTED_${r.status}`;
});

// ── FAN → 403 on club-portal (not in @Roles list)
await check('FAN /club-portal/overview → 403', () =>
  expectStatus('/club-portal/overview', FAN_TOKEN, 403, 'PASS_FAN_FORBIDDEN'));

// ── FAN → 403 on sponsor-portal
await check('FAN /sponsor-portal/overview → 403', () =>
  expectStatus('/sponsor-portal/overview', FAN_TOKEN, 403, 'PASS_FAN_FORBIDDEN'));

// ── CLUB_ADMIN → 403 on sponsor-portal (wrong role)
await check('CLUB_ADMIN /sponsor-portal/overview → 403', () =>
  expectStatus('/sponsor-portal/overview', CLUB_ADMIN_TOKEN, 403, 'PASS_CLUB_ADMIN_NOT_SPONSOR'));

// ── CLUB_ADMIN → 200/403 on club-portal (correct role — scope depends on membership)
await check('CLUB_ADMIN /club-portal/overview → 200 or 403 (scope-dependent)', async () => {
  if (!CLUB_ADMIN_TOKEN) return 'PENDING_TOKEN';
  const r = await fetch(`${BASE_URL}/club-portal/overview`, {
    headers: { Authorization: `Bearer ${CLUB_ADMIN_TOKEN}` },
  });
  if (r.status >= 500) return 'UNEXPECTED_5XX';
  // 200 = has active membership, 403 = no membership or scope issue, 400 = missing teamId
  return r.status === 200 || r.status === 403 || r.status === 400 ? 'PASS_ROLE_ACCEPTED' : `UNEXPECTED_${r.status}`;
});

// ── SPONSOR → 403 on club-portal (wrong role)
await check('SPONSOR /club-portal/overview → 403', () =>
  expectStatus('/club-portal/overview', SPONSOR_TOKEN, 403, 'PASS_SPONSOR_NOT_CLUB_ADMIN'));

// ── SPONSOR → 200/403 on sponsor-portal (correct role — scope depends on membership)
await check('SPONSOR /sponsor-portal/overview → 200 or 403 (scope-dependent)', async () => {
  if (!SPONSOR_TOKEN) return 'PENDING_TOKEN';
  const r = await fetch(`${BASE_URL}/sponsor-portal/overview`, {
    headers: { Authorization: `Bearer ${SPONSOR_TOKEN}` },
  });
  if (r.status >= 500) return 'UNEXPECTED_5XX';
  return r.status === 200 || r.status === 403 || r.status === 400 ? 'PASS_ROLE_ACCEPTED' : `UNEXPECTED_${r.status}`;
});

// ── Cross-tenant: CLUB_ADMIN cannot access another club via PSL_ADMIN path
// (PSL_ADMIN escalation requires role=PSL_ADMIN in JWT, not just passing a teamId param)
await check('CLUB_ADMIN cannot escalate to PSL_ADMIN via teamId param', async () => {
  if (!CLUB_ADMIN_TOKEN) return 'PENDING_TOKEN';
  // CLUB_ADMIN with a teamId that doesn't match their membership → 403 (CROSS_CLUB_ACCESS_DENIED)
  const r = await fetch(`${BASE_URL}/club-portal/overview?teamId=some-other-team-id`, {
    headers: { Authorization: `Bearer ${CLUB_ADMIN_TOKEN}` },
  });
  if (r.status >= 500) return 'UNEXPECTED_5XX';
  // Expect 403 (cross-club denial) or 403 (no membership at all)
  return r.status === 403 ? 'PASS_CROSS_CLUB_DENIED' : r.status === 200 ? 'INVESTIGATE_200' : `HTTP_${r.status}`;
});

// ── Summary
const unexpected5xx = results.filter((r) => r.status === 'UNEXPECTED_5XX');
const passes = results.filter((r) => r.status.startsWith('PASS')).length;
const pending = results.filter((r) => r.status === 'PENDING_TOKEN').length;
const investigate = results.filter((r) => r.status.startsWith('INVESTIGATE'));

console.log('');
console.log(`Summary: ${results.length} checks | ${passes} PASS | ${pending} PENDING_CREDENTIAL | ${unexpected5xx.length} UNEXPECTED_5XX | ${investigate.length} INVESTIGATE`);
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NON-FINANCIAL');

if (unexpected5xx.length > 0 || investigate.length > 0) {
  if (unexpected5xx.length > 0) console.error('FAIL — unexpected 5xx responses detected');
  if (investigate.length > 0) console.error('FAIL — cross-tenant access may be permitted — investigate');
  process.exit(1);
}
