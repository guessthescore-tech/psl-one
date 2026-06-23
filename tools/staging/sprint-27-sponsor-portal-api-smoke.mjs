#!/usr/bin/env node
/**
 * Sprint 27 Sponsor Portal API Smoke Tool
 *
 * PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NO PSL ACTIVATION
 * BILLING INVOICE_ONLY | REWARDS NON_FINANCIAL | CAMPAIGNS DRAFT_ONLY
 *
 * Run: BASE_URL=... PSL_ADMIN_TOKEN=... SPONSOR_TOKEN=... TEST_SPONSOR_ID=... \
 *      node tools/staging/sprint-27-sponsor-portal-api-smoke.mjs
 *
 * To allow write operations: ALLOW_WRITE_SMOKE=true
 *
 * Security: Token values are never printed to output.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const PSL_ADMIN_TOKEN = process.env.PSL_ADMIN_TOKEN ?? '';
const SPONSOR_TOKEN = process.env.SPONSOR_TOKEN ?? '';
const TEST_SPONSOR_ID = process.env.TEST_SPONSOR_ID ?? 'test-sponsor-id';
const ALLOW_WRITE = process.env.ALLOW_WRITE_SMOKE === 'true';

const results = [];

async function check(label, fn) {
  try {
    const r = await fn();
    results.push({ label, status: r });
    console.log(`${r.padEnd(25)} ${label}`);
  } catch (e) {
    results.push({ label, status: 'ERROR' });
    console.log(`${'ERROR'.padEnd(25)} ${label}: ${e.message}`);
  }
}

async function get(path, token) {
  if (!token) return 'PENDING_TOKEN';
  const r = await fetch(`${BASE_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (r.status >= 500) return 'UNEXPECTED_5XX';
  if (r.status === 200) {
    const body = await r.json();
    if (body?.scopeStatus === 'API_SCOPE_PENDING') return 'API_SCOPE_PENDING';
    if (body?.billingStatus === 'INVOICE_ONLY') return 'INVOICE_ONLY_PASS';
    return 'PASS';
  }
  return `HTTP_${r.status}`;
}

const endpoints = [
  `/sponsor-portal/overview?sponsorId=${TEST_SPONSOR_ID}`,
  `/sponsor-portal/profile?sponsorId=${TEST_SPONSOR_ID}`,
  `/sponsor-portal/campaigns?sponsorId=${TEST_SPONSOR_ID}`,
  `/sponsor-portal/audiences?sponsorId=${TEST_SPONSOR_ID}`,
  `/sponsor-portal/activations?sponsorId=${TEST_SPONSOR_ID}`,
  `/sponsor-portal/rewards?sponsorId=${TEST_SPONSOR_ID}`,
  `/sponsor-portal/analytics?sponsorId=${TEST_SPONSOR_ID}`,
  `/sponsor-portal/clubs?sponsorId=${TEST_SPONSOR_ID}`,
  `/sponsor-portal/assets?sponsorId=${TEST_SPONSOR_ID}`,
  `/sponsor-portal/billing-placeholder`,
];

console.log('Sprint 27 Sponsor Portal API Smoke');
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | BILLING INVOICE_ONLY');
console.log('='.repeat(60));

for (const ep of endpoints) {
  await check(`PSL_ADMIN ${ep}`, () => get(ep, PSL_ADMIN_TOKEN));
  await check(`SPONSOR ${ep}`, () => get(ep, SPONSOR_TOKEN));
}

if (ALLOW_WRITE) {
  await check('POST /sponsor-portal/campaigns/drafts (PSL_ADMIN)', async () => {
    if (!PSL_ADMIN_TOKEN) return 'PENDING_TOKEN';
    const r = await fetch(`${BASE_URL}/sponsor-portal/campaigns/drafts?sponsorId=${TEST_SPONSOR_ID}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${PSL_ADMIN_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Smoke Draft Campaign',
        startsAt: '2026-08-01T00:00:00Z',
        endsAt: '2026-09-01T00:00:00Z',
      }),
    });
    if (r.status >= 500) return 'UNEXPECTED_5XX';
    if (r.status === 200 || r.status === 201) {
      const body = await r.json();
      if (body?.status === 'ACTIVE') return 'FAIL_CAMPAIGN_ACTIVE';
      if (body?.status === 'DRAFT') return 'PASS_DRAFT';
      return 'PASS';
    }
    return `HTTP_${r.status}`;
  });
}

const unexpected5xx = results.filter((r) => r.status === 'UNEXPECTED_5XX');
console.log('='.repeat(60));
console.log(`\nSummary: ${results.length} checks | ${unexpected5xx.length} UNEXPECTED_5XX`);
if (unexpected5xx.length > 0) {
  console.error('FAIL: Unexpected 5xx responses detected');
  process.exit(1);
}
console.log('PASS: No unexpected 5xx responses');
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NO PSL ACTIVATION');
