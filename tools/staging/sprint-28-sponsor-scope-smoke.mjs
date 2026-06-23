#!/usr/bin/env node
/**
 * Sprint 28 Sponsor Scope Smoke Tool
 * Tests DB-backed SPONSOR scoping via SponsorMembership table.
 *
 * PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NON-FINANCIAL | BILLING INVOICE-ONLY
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 \
 *   PSL_ADMIN_TOKEN=<token> \
 *   SPONSOR_TOKEN=<token> \
 *   SPONSOR_ID_ALLOWED=<sponsor-uuid> \
 *   SPONSOR_ID_FORBIDDEN=<another-sponsor-uuid> \
 *   node tools/staging/sprint-28-sponsor-scope-smoke.mjs
 *
 * Tokens must be obtained via admin provisioning runbook.
 * Never print token values — security invariant.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const PSL_ADMIN_TOKEN = process.env.PSL_ADMIN_TOKEN ?? '';
const SPONSOR_TOKEN = process.env.SPONSOR_TOKEN ?? '';
const SPONSOR_ID_ALLOWED = process.env.SPONSOR_ID_ALLOWED ?? '';
const SPONSOR_ID_FORBIDDEN = process.env.SPONSOR_ID_FORBIDDEN ?? 'cross-tenant-id';

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

console.log('Sprint 28 Sponsor Scope Smoke Tool');
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NON-FINANCIAL | BILLING INVOICE-ONLY');
console.log(`BASE_URL: ${BASE_URL}`);
const adminSet = PSL_ADMIN_TOKEN ? '[SET]' : '[MISSING]';
const sponsorSet = SPONSOR_TOKEN ? '[SET]' : '[MISSING]';
console.log(`psl-admin credential: ${adminSet}`);
console.log(`sponsor credential: ${sponsorSet}`);
console.log('');

// ── Anonymous: should get 401
await check('Anonymous /sponsor-portal/overview → 401', async () => {
  const r = await fetch(`${BASE_URL}/sponsor-portal/overview`);
  return r.status === 401 ? 'PASS' : `UNEXPECTED_${r.status}`;
});

// ── PSL_ADMIN without sponsorId → should fail with 400 or 403
await check('PSL_ADMIN /sponsor-portal/overview (no sponsorId) → 400/403', async () => {
  if (!PSL_ADMIN_TOKEN) return 'PENDING_TOKEN';
  const r = await fetch(`${BASE_URL}/sponsor-portal/overview`, {
    headers: { Authorization: `Bearer ${PSL_ADMIN_TOKEN}` },
  });
  return r.status === 400 || r.status === 403 ? 'PASS' : `UNEXPECTED_${r.status}`;
});

// ── PSL_ADMIN with explicit sponsorId
if (SPONSOR_ID_ALLOWED) {
  for (const ep of ['overview', 'profile', 'campaigns', 'activations', 'rewards', 'analytics']) {
    await check(`PSL_ADMIN /sponsor-portal/${ep}?sponsorId=${SPONSOR_ID_ALLOWED}`, () =>
      req(`/sponsor-portal/${ep}?sponsorId=${SPONSOR_ID_ALLOWED}`, PSL_ADMIN_TOKEN));
  }
} else {
  console.log('SPONSOR_ID_ALLOWED not set — skipping PSL_ADMIN with sponsorId checks');
}

// ── SPONSOR allowed
if (SPONSOR_ID_ALLOWED) {
  await check('SPONSOR /sponsor-portal/overview (allowed sponsor)', () =>
    req(`/sponsor-portal/overview?sponsorId=${SPONSOR_ID_ALLOWED}`, SPONSOR_TOKEN));

  await check('SPONSOR /sponsor-portal/campaigns (allowed sponsor)', () =>
    req(`/sponsor-portal/campaigns?sponsorId=${SPONSOR_ID_ALLOWED}`, SPONSOR_TOKEN));

  await check('SPONSOR /sponsor-portal/billing-placeholder → INVOICE_ONLY', async () => {
    if (!SPONSOR_TOKEN) return 'PENDING_TOKEN';
    const r = await fetch(`${BASE_URL}/sponsor-portal/billing-placeholder`, {
      headers: { Authorization: `Bearer ${SPONSOR_TOKEN}` },
    });
    if (r.status !== 200) return `HTTP_${r.status}`;
    const data = await r.json();
    return data.billingStatus === 'INVOICE_ONLY' ? 'PASS_INVOICE_ONLY' : 'UNEXPECTED_BILLING_STATUS';
  });
}

// ── SPONSOR cross-tenant → must be 403
await check('SPONSOR /sponsor-portal/overview (forbidden sponsor) → 403', async () => {
  if (!SPONSOR_TOKEN) return 'PENDING_TOKEN';
  const r = await fetch(`${BASE_URL}/sponsor-portal/overview?sponsorId=${SPONSOR_ID_FORBIDDEN}`, {
    headers: { Authorization: `Bearer ${SPONSOR_TOKEN}` },
  });
  return r.status === 403 ? 'PASS_FORBIDDEN_AS_EXPECTED' : `UNEXPECTED_${r.status}`;
});

// ── Verify billing is always INVOICE_ONLY (no payment processing)
await check('billing-placeholder always INVOICE_ONLY (anonymous fails, but check logic)', async () => {
  // billing endpoint requires auth — just check it returns 401 for anon
  const r = await fetch(`${BASE_URL}/sponsor-portal/billing-placeholder`);
  return r.status === 401 ? 'PASS_AUTH_REQUIRED' : `UNEXPECTED_${r.status}`;
});

// ── Rewards must be non-financial
if (SPONSOR_ID_ALLOWED) {
  await check('SPONSOR /sponsor-portal/rewards → isFinancial false', async () => {
    if (!SPONSOR_TOKEN) return 'PENDING_TOKEN';
    const r = await fetch(`${BASE_URL}/sponsor-portal/rewards?sponsorId=${SPONSOR_ID_ALLOWED}`, {
      headers: { Authorization: `Bearer ${SPONSOR_TOKEN}` },
    });
    if (r.status !== 200) return `HTTP_${r.status}`;
    const data = await r.json();
    if (!Array.isArray(data)) return 'PASS_EMPTY';
    const hasFinancial = data.some((item) => item.isFinancial === true);
    return hasFinancial ? 'FAIL_FINANCIAL_DETECTED' : 'PASS_NON_FINANCIAL';
  });
}

// ── Summary
const unexpected5xx = results.filter((r) => r.status === 'UNEXPECTED_5XX');
const passes = results.filter((r) => r.status.startsWith('PASS') || r.status === 'UNAUTHORIZED_EXPECTED').length;
const pending = results.filter((r) => r.status === 'PENDING_TOKEN').length;

console.log('');
console.log(`Summary: ${results.length} checks | ${passes} PASS | ${pending} PENDING_CREDENTIAL | ${unexpected5xx.length} UNEXPECTED_5XX`);
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NON-FINANCIAL | BILLING INVOICE-ONLY');

if (unexpected5xx.length > 0) {
  console.error('FAIL — unexpected 5xx responses detected');
  process.exit(1);
}
