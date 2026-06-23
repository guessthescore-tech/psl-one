#!/usr/bin/env node
/**
 * Sprint 27 Club Portal API Smoke Tool
 *
 * PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NO PSL ACTIVATION
 *
 * Run: BASE_URL=... PSL_ADMIN_TOKEN=... CLUB_ADMIN_TOKEN=... TEST_CLUB_ID=... \
 *      node tools/staging/sprint-27-club-portal-api-smoke.mjs
 *
 * To allow write operations: ALLOW_WRITE_SMOKE=true
 *
 * Security: Token values are never printed to output.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const PSL_ADMIN_TOKEN = process.env.PSL_ADMIN_TOKEN ?? '';
const CLUB_ADMIN_TOKEN = process.env.CLUB_ADMIN_TOKEN ?? '';
const TEST_CLUB_ID = process.env.TEST_CLUB_ID ?? 'test-club-id';
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
    return 'PASS';
  }
  return `HTTP_${r.status}`;
}

const endpoints = [
  `/club-portal/overview?clubId=${TEST_CLUB_ID}`,
  `/club-portal/profile?clubId=${TEST_CLUB_ID}`,
  `/club-portal/squad?clubId=${TEST_CLUB_ID}`,
  `/club-portal/fixtures?clubId=${TEST_CLUB_ID}`,
  `/club-portal/fans?clubId=${TEST_CLUB_ID}`,
  `/club-portal/analytics?clubId=${TEST_CLUB_ID}`,
  `/club-portal/campaigns?clubId=${TEST_CLUB_ID}`,
  `/club-portal/sponsors?clubId=${TEST_CLUB_ID}`,
  `/club-portal/content?clubId=${TEST_CLUB_ID}`,
];

console.log('Sprint 27 Club Portal API Smoke');
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NO PSL ACTIVATION');
console.log('='.repeat(60));

for (const ep of endpoints) {
  await check(`PSL_ADMIN ${ep}`, () => get(ep, PSL_ADMIN_TOKEN));
  await check(`CLUB_ADMIN ${ep}`, () => get(ep, CLUB_ADMIN_TOKEN));
}

if (ALLOW_WRITE) {
  await check('POST /club-portal/content-submissions (PSL_ADMIN)', async () => {
    if (!PSL_ADMIN_TOKEN) return 'PENDING_TOKEN';
    const r = await fetch(`${BASE_URL}/club-portal/content-submissions?clubId=${TEST_CLUB_ID}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${PSL_ADMIN_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Smoke Test Content', contentType: 'article' }),
    });
    if (r.status >= 500) return 'UNEXPECTED_5XX';
    return r.status === 200 || r.status === 201 ? 'PASS' : `HTTP_${r.status}`;
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
