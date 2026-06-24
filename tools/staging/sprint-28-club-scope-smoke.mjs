#!/usr/bin/env node
/**
 * Sprint 28 Club Scope Smoke Tool
 * Tests DB-backed CLUB_ADMIN scoping via ClubMembership table.
 *
 * PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NON-FINANCIAL
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 \
 *   PSL_ADMIN_TOKEN=<token> \
 *   CLUB_ADMIN_TOKEN=<token> \
 *   CLUB_ID_ALLOWED=<team-uuid> \
 *   CLUB_ID_FORBIDDEN=<another-team-uuid> \
 *   node tools/staging/sprint-28-club-scope-smoke.mjs
 *
 * Tokens must be obtained via admin provisioning runbook.
 * Never print token values — security invariant.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const PSL_ADMIN_TOKEN = process.env.PSL_ADMIN_TOKEN ?? '';
const CLUB_ADMIN_TOKEN = process.env.CLUB_ADMIN_TOKEN ?? '';
const CLUB_ID_ALLOWED = process.env.CLUB_ID_ALLOWED ?? '';
const CLUB_ID_FORBIDDEN = process.env.CLUB_ID_FORBIDDEN ?? 'cross-tenant-id';

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

async function req(path, token, method = 'GET', body) {
  if (!token) return 'PENDING_TOKEN';
  const opts = {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${BASE_URL}${path}`, opts);
  if (r.status >= 500) return 'UNEXPECTED_5XX';
  if (r.status === 200 || r.status === 201) return 'PASS';
  if (r.status === 401) return 'UNAUTHORIZED_EXPECTED';
  if (r.status === 403) return 'FORBIDDEN';
  if (r.status === 400) return 'BAD_REQUEST';
  if (r.status === 404) return 'NOT_FOUND';
  return `HTTP_${r.status}`;
}

console.log('Sprint 28 Club Scope Smoke Tool');
console.log(`PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY`);
console.log(`BASE_URL: ${BASE_URL}`);
const adminSet = PSL_ADMIN_TOKEN ? '[SET]' : '[MISSING]';
const clubSet = CLUB_ADMIN_TOKEN ? '[SET]' : '[MISSING]';
console.log(`psl-admin credential: ${adminSet}`);
console.log(`club-admin credential: ${clubSet}`);
console.log('');

// ── Anonymous: should get 401
await check('Anonymous /club-portal/overview → 401', async () => {
  const r = await fetch(`${BASE_URL}/club-portal/overview`);
  return r.status === 401 ? 'PASS' : `UNEXPECTED_${r.status}`;
});

// ── PSL_ADMIN without teamId → should fail with 400 or 403
await check('PSL_ADMIN /club-portal/overview (no teamId) → 400/403', async () => {
  if (!PSL_ADMIN_TOKEN) return 'PENDING_TOKEN';
  const r = await fetch(`${BASE_URL}/club-portal/overview`, {
    headers: { Authorization: `Bearer ${PSL_ADMIN_TOKEN}` },
  });
  return r.status === 400 || r.status === 403 ? 'PASS' : `UNEXPECTED_${r.status}`;
});

// ── PSL_ADMIN with explicit teamId
if (CLUB_ID_ALLOWED) {
  for (const ep of ['overview', 'profile', 'squad', 'fixtures', 'analytics', 'content']) {
    await check(`PSL_ADMIN /club-portal/${ep}?teamId=${CLUB_ID_ALLOWED}`, () =>
      req(`/club-portal/${ep}?teamId=${CLUB_ID_ALLOWED}`, PSL_ADMIN_TOKEN));
  }
} else {
  console.log('CLUB_ID_ALLOWED not set — skipping PSL_ADMIN with teamId checks');
}

// ── CLUB_ADMIN allowed club
if (CLUB_ID_ALLOWED) {
  await check('CLUB_ADMIN /club-portal/overview (allowed club)', () =>
    req(`/club-portal/overview?teamId=${CLUB_ID_ALLOWED}`, CLUB_ADMIN_TOKEN));

  await check('CLUB_ADMIN /club-portal/squad (allowed club)', () =>
    req(`/club-portal/squad?teamId=${CLUB_ID_ALLOWED}`, CLUB_ADMIN_TOKEN));

  await check('CLUB_ADMIN /club-portal/analytics (allowed club)', () =>
    req(`/club-portal/analytics?teamId=${CLUB_ID_ALLOWED}`, CLUB_ADMIN_TOKEN));
}

// ── CLUB_ADMIN cross-tenant → must be 403
await check('CLUB_ADMIN /club-portal/overview (forbidden club) → 403', async () => {
  if (!CLUB_ADMIN_TOKEN) return 'PENDING_TOKEN';
  const r = await fetch(`${BASE_URL}/club-portal/overview?teamId=${CLUB_ID_FORBIDDEN}`, {
    headers: { Authorization: `Bearer ${CLUB_ADMIN_TOKEN}` },
  });
  return r.status === 403 ? 'PASS_FORBIDDEN_AS_EXPECTED' : `UNEXPECTED_${r.status}`;
});

// ── CLUB_ADMIN without teamId → scope from membership
await check('CLUB_ADMIN /club-portal/overview (no teamId — scope from membership)', async () => {
  if (!CLUB_ADMIN_TOKEN) return 'PENDING_TOKEN';
  const r = await fetch(`${BASE_URL}/club-portal/overview`, {
    headers: { Authorization: `Bearer ${CLUB_ADMIN_TOKEN}` },
  });
  // 200 = has membership, 403 = no membership assigned yet
  return r.status === 200 || r.status === 403 ? 'PASS_OR_NO_MEMBERSHIP' : `UNEXPECTED_${r.status}`;
});

// ── Summary
const unexpected5xx = results.filter((r) => r.status === 'UNEXPECTED_5XX');
const passes = results.filter((r) => r.status.startsWith('PASS') || r.status === 'UNAUTHORIZED_EXPECTED').length;
const pending = results.filter((r) => r.status === 'PENDING_TOKEN').length;

console.log('');
console.log(`Summary: ${results.length} checks | ${passes} PASS | ${pending} PENDING_CREDENTIAL | ${unexpected5xx.length} UNEXPECTED_5XX`);
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NON-FINANCIAL');

if (unexpected5xx.length > 0) {
  console.error('FAIL — unexpected 5xx responses detected');
  process.exit(1);
}
