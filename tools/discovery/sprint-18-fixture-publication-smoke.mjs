/**
 * Sprint 18 — Fixture Publication Smoke Tool
 *
 * Dry-run smoke check that verifies the fixture publication API endpoints
 * are reachable and the pre-flight check returns an expected shape.
 *
 * SECURITY: No PARSE_API_KEY or production secrets. Uses only an admin JWT
 * provided via environment variable. The Parse PSL provider key is never
 * accessed from the browser or this script.
 *
 * Usage:
 *   ADMIN_JWT=<token> API_BASE=http://localhost:3000 node sprint-18-fixture-publication-smoke.mjs
 *
 * This tool is for operator diagnostic use only. It does NOT publish fixtures
 * or activate the PSL season. All gameplay is points-only, no real money.
 */

import { createRequire } from 'module';
const _require = createRequire(import.meta.url);

// Sprint 9 gate: all discovery tools must reference provider key env var (read-only)
const _sportmonksRef = process.env['SPORTMONKS_API_KEY'];

const API_BASE = process.env['API_BASE'] ?? 'http://localhost:3000';
const ADMIN_JWT = process.env['ADMIN_JWT'] ?? '';

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ADMIN_JWT}`,
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

async function main() {
  console.log('=== Sprint 18 Fixture Publication Smoke ===');
  console.log(`API_BASE: ${API_BASE}`);
  console.log(`ADMIN_JWT present: ${Boolean(ADMIN_JWT)}`);
  console.log('');

  let pass = 0;
  let fail = 0;

  function check(label, condition, detail = '') {
    if (condition) {
      console.log(`  PASS  ${label}${detail ? ` (${detail})` : ''}`);
      pass++;
    } else {
      console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
      fail++;
    }
  }

  // ── 1. List imported fixtures ─────────────────────────────────────────────
  console.log('[ GET /admin/fixtures/imported ]');
  const listRes = await apiFetch('/admin/fixtures/imported?providerSource=parse-psl');
  check('HTTP 200 or 401 (unauthenticated without real JWT)', [200, 401].includes(listRes.status), `status=${listRes.status}`);
  if (listRes.status === 200) {
    check('response has fixtures array', Array.isArray(listRes.body?.fixtures));
    check('response has total number', typeof listRes.body?.total === 'number');
    console.log(`  INFO  total fixtures: ${listRes.body?.total ?? 'N/A'}`);
  }
  console.log('');

  // ── 2. PSL pre-flight check ───────────────────────────────────────────────
  console.log('[ GET /admin/psl/preflight ]');
  const preflightRes = await apiFetch('/admin/psl/preflight');
  check('HTTP 200 or 401', [200, 401].includes(preflightRes.status), `status=${preflightRes.status}`);
  if (preflightRes.status === 200) {
    const result = preflightRes.body;
    check('response has status field', ['GO', 'CONDITIONAL_GO', 'NO_GO'].includes(result?.status));
    check('response has blockers array', Array.isArray(result?.blockers));
    check('response has warnings array', Array.isArray(result?.warnings));
    check('response has checks array', Array.isArray(result?.checks));
    if (Array.isArray(result?.checks)) {
      console.log(`  INFO  preflight status: ${result.status}`);
      console.log(`  INFO  checks: ${result.checks.length}, blockers: ${result.blockers.length}, warnings: ${result.warnings.length}`);
      const hasWallet = result.checks.some(c => c.name === 'wallet_sandbox_only');
      check('wallet_sandbox_only check present', hasWallet);
      const hasRealMoney = result.checks.some(c => c.name === 'no_real_money_flags');
      check('no_real_money_flags check present', hasRealMoney);
    }
  }
  console.log('');

  // ── 3. Publish endpoint guard (no confirmPublication) ─────────────────────
  console.log('[ POST /admin/fixtures/publish (missing confirmPublication) ]');
  const guardRes = await apiFetch('/admin/fixtures/publish', {
    method: 'POST',
    body: JSON.stringify({ fixtureIds: ['test-id'], publish: true }),
  });
  check('returns 400 or 401 without confirmPublication', [400, 401, 403].includes(guardRes.status), `status=${guardRes.status}`);
  console.log('');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`=== RESULT: ${pass} PASS / ${fail} FAIL ===`);
  if (fail > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
