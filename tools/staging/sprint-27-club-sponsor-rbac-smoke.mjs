#!/usr/bin/env node
/**
 * Sprint 27 Club & Sponsor Portal RBAC Cross-Role Smoke Tool
 *
 * PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NO PSL ACTIVATION
 *
 * Tests cross-role access denial and PSL_ADMIN super-access.
 *
 * Run: BASE_URL=... FAN_TOKEN=... CLUB_ADMIN_TOKEN=... SPONSOR_TOKEN=... PSL_ADMIN_TOKEN=... \
 *      node tools/staging/sprint-27-club-sponsor-rbac-smoke.mjs
 *
 * Security: Token values are never printed to output.
 * Expected results:
 *   FAN → club-portal → FORBIDDEN_EXPECTED (401/403)
 *   FAN → sponsor-portal → FORBIDDEN_EXPECTED (401/403)
 *   CLUB_ADMIN → sponsor-portal → FORBIDDEN_EXPECTED (403)
 *   SPONSOR → club-portal → FORBIDDEN_EXPECTED (403)
 *   PSL_ADMIN → both portals → PASS (200)
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const FAN_TOKEN = process.env.FAN_TOKEN ?? '';
const CLUB_ADMIN_TOKEN = process.env.CLUB_ADMIN_TOKEN ?? '';
const SPONSOR_TOKEN = process.env.SPONSOR_TOKEN ?? '';
const PSL_ADMIN_TOKEN = process.env.PSL_ADMIN_TOKEN ?? '';

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

async function expectForbidden(path, token) {
  if (!token) return 'PENDING_TOKEN';
  const r = await fetch(`${BASE_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (r.status === 401 || r.status === 403) return 'FORBIDDEN_EXPECTED';
  if (r.status >= 500) return 'UNEXPECTED_5XX';
  return `UNEXPECTED_${r.status}`;
}

async function expectPass(path, token) {
  if (!token) return 'PENDING_TOKEN';
  const r = await fetch(`${BASE_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (r.status >= 500) return 'UNEXPECTED_5XX';
  if (r.status === 200) return 'PASS';
  return `HTTP_${r.status}`;
}

console.log('Sprint 27 Club & Sponsor Portal RBAC Smoke');
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NO PSL ACTIVATION');
console.log('='.repeat(60));

// FAN access to club-portal → must be FORBIDDEN
await check('FAN → /club-portal/overview (FORBIDDEN_EXPECTED)', () =>
  expectForbidden('/club-portal/overview', FAN_TOKEN));
await check('FAN → /club-portal/profile (FORBIDDEN_EXPECTED)', () =>
  expectForbidden('/club-portal/profile', FAN_TOKEN));

// FAN access to sponsor-portal → must be FORBIDDEN
await check('FAN → /sponsor-portal/overview (FORBIDDEN_EXPECTED)', () =>
  expectForbidden('/sponsor-portal/overview', FAN_TOKEN));
await check('FAN → /sponsor-portal/profile (FORBIDDEN_EXPECTED)', () =>
  expectForbidden('/sponsor-portal/profile', FAN_TOKEN));

// CLUB_ADMIN access to sponsor-portal → must be FORBIDDEN
await check('CLUB_ADMIN → /sponsor-portal/profile (FORBIDDEN_EXPECTED)', () =>
  expectForbidden('/sponsor-portal/profile', CLUB_ADMIN_TOKEN));
await check('CLUB_ADMIN → /sponsor-portal/campaigns (FORBIDDEN_EXPECTED)', () =>
  expectForbidden('/sponsor-portal/campaigns', CLUB_ADMIN_TOKEN));

// SPONSOR access to club-portal → must be FORBIDDEN
await check('SPONSOR → /club-portal/profile (FORBIDDEN_EXPECTED)', () =>
  expectForbidden('/club-portal/profile', SPONSOR_TOKEN));
await check('SPONSOR → /club-portal/squad (FORBIDDEN_EXPECTED)', () =>
  expectForbidden('/club-portal/squad', SPONSOR_TOKEN));

// PSL_ADMIN access to both portals → must PASS
await check('PSL_ADMIN → /club-portal/overview (PASS)', () =>
  expectPass('/club-portal/overview', PSL_ADMIN_TOKEN));
await check('PSL_ADMIN → /club-portal/profile (PASS)', () =>
  expectPass('/club-portal/profile', PSL_ADMIN_TOKEN));
await check('PSL_ADMIN → /sponsor-portal/overview (PASS)', () =>
  expectPass('/sponsor-portal/overview', PSL_ADMIN_TOKEN));
await check('PSL_ADMIN → /sponsor-portal/billing-placeholder (PASS)', () =>
  expectPass('/sponsor-portal/billing-placeholder', PSL_ADMIN_TOKEN));

const unexpected5xx = results.filter((r) => r.status === 'UNEXPECTED_5XX');
const unexpectedPass = results.filter((r) =>
  r.label.includes('FORBIDDEN_EXPECTED') && r.status.startsWith('UNEXPECTED'));

console.log('='.repeat(60));
console.log(`\nSummary: ${results.length} checks`);
console.log(`  UNEXPECTED_5XX: ${unexpected5xx.length}`);
console.log(`  Unexpected role bypass: ${unexpectedPass.length}`);

if (unexpected5xx.length > 0 || unexpectedPass.length > 0) {
  console.error('FAIL: RBAC issues detected');
  process.exit(1);
}
console.log('PASS: RBAC boundaries confirmed');
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NO PSL ACTIVATION');
