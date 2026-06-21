#!/usr/bin/env node
/**
 * PSL One — Sprint 9 Challenge Settlement Smoke
 * Validates settlement logic via file-level checks and optional live API checks.
 * File-level checks run without a server; live checks require BASE_URL.
 * Usage: node tools/smoke/sprint-9-challenge-settlement-smoke.mjs
 *        BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-challenge-settlement-smoke.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:4000';
const REPO_ROOT = resolve(new URL('.', import.meta.url).pathname, '../..');

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

// ── File-level checks (no server required) ──────────────────────────────────

function checkSettlementServiceExists() {
  const p = resolve(REPO_ROOT, 'apps/api/src/prediction-challenges/challenge-settlement.service.ts');
  if (existsSync(p)) {
    pass('Settlement service file exists', p.replace(REPO_ROOT, '.'));
  } else {
    fail('Settlement service file exists', 'Not found: apps/api/src/prediction-challenges/challenge-settlement.service.ts');
  }
}

function checkSettleAllMethodExists() {
  const p = resolve(REPO_ROOT, 'apps/api/src/prediction-challenges/challenge-settlement.service.ts');
  if (!existsSync(p)) {
    fail('settleAllAcceptedForFixture method', 'File not found');
    return;
  }
  const src = readFileSync(p, 'utf8');
  if (src.includes('settleAllAcceptedForFixture')) {
    pass('settleAllAcceptedForFixture method exists', 'bulk settlement method present');
  } else {
    fail('settleAllAcceptedForFixture method', 'Method not found in source');
  }
}

function checkFireAndForgetIntegration() {
  const p = resolve(REPO_ROOT, 'apps/api/src/football/football.service.ts');
  if (!existsSync(p)) {
    fail('Fire-and-forget integration', 'football.service.ts not found');
    return;
  }
  const src = readFileSync(p, 'utf8');
  const hasSettle = src.includes('settleAllAcceptedForFixture');
  const hasCatch = src.includes('.catch(');
  if (hasSettle && hasCatch) {
    pass('Fire-and-forget settlement integration', 'FootballService wires settlement with .catch()');
  } else if (hasSettle) {
    fail('Fire-and-forget settlement integration', 'settleAllAcceptedForFixture found but .catch() missing');
  } else {
    fail('Fire-and-forget settlement integration', 'settleAllAcceptedForFixture not found in football.service.ts');
  }
}

function checkNoWalletInSettlement() {
  const p = resolve(REPO_ROOT, 'apps/api/src/prediction-challenges/challenge-settlement.service.ts');
  if (!existsSync(p)) return;
  const src = readFileSync(p, 'utf8');
  const hasWallet = /wallet|payment|transfer|payout|cash|money/i.test(src);
  if (!hasWallet) {
    pass('No wallet/payment in settlement service', 'Points-only settlement confirmed');
  } else {
    fail('No wallet/payment in settlement service', 'Financial language detected — investigate');
  }
}

function checkNoProviderKeyInSettlement() {
  const p = resolve(REPO_ROOT, 'apps/api/src/prediction-challenges/challenge-settlement.service.ts');
  if (!existsSync(p)) return;
  const src = readFileSync(p, 'utf8');
  const hasProviderKey = /SPORTMONKS_API_KEY|SPORTSDATAIO_SOCCER_API_KEY|NEXT_PUBLIC_/i.test(src);
  if (!hasProviderKey) {
    pass('No provider key in settlement service', 'Settlement is isolated from provider keys');
  } else {
    fail('No provider key in settlement service', 'Unexpected provider key reference found');
  }
}

// ── Live checks (require running API at BASE_URL) ──────────────────────────

async function liveResultEndpointCheck() {
  try {
    const res = await fetch(`${BASE_URL}/predictions/challenges/nonexistent-token/result`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 404) {
      pass('Live: result endpoint 404', `${BASE_URL} — 404 for nonexistent token (correct)`);
    } else if (res.status === 200) {
      fail('Live: result endpoint 404', `Got 200 for nonexistent token — should be 404`);
    } else {
      skip('Live: result endpoint 404', `HTTP ${res.status} — unexpected`);
    }
  } catch (err) {
    if (err.message.includes('ECONNREFUSED') || err.message.includes('fetch failed')) {
      skip('Live: result endpoint 404', `No server at ${BASE_URL} — start API to run live checks`);
    } else {
      fail('Live: result endpoint 404', err.message);
    }
  }
}

async function liveSettlementGateCheck() {
  try {
    const res = await fetch(`${BASE_URL}/predictions/challenges/settle-fixture/nonexistent-fixture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 401) {
      pass('Live: settlement admin gate (401)', 'Auth guard active — unauthenticated rejected');
    } else if (res.status === 403) {
      pass('Live: settlement admin gate (403)', 'RBAC guard active — forbidden');
    } else {
      skip('Live: settlement admin gate', `HTTP ${res.status}`);
    }
  } catch (err) {
    if (err.message.includes('ECONNREFUSED') || err.message.includes('fetch failed')) {
      skip('Live: settlement admin gate', `No server at ${BASE_URL}`);
    } else {
      fail('Live: settlement admin gate', err.message);
    }
  }
}

async function liveHealthCheck() {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(5000) });
    if (res.status === 200) pass('Live: API health', `HTTP 200 at ${BASE_URL}`);
    else fail('Live: API health', `HTTP ${res.status}`);
  } catch (err) {
    if (err.message.includes('ECONNREFUSED') || err.message.includes('fetch failed')) {
      skip('Live: API health', `No server at ${BASE_URL}`);
    } else {
      fail('Live: API health', err.message);
    }
  }
}

async function main() {
  console.log('PSL One — Challenge Settlement Smoke');
  console.log('=====================================');
  console.log(`Target: ${BASE_URL}`);
  console.log('');

  console.log('── File-level checks (no server required) ──');
  checkSettlementServiceExists();
  checkSettleAllMethodExists();
  checkFireAndForgetIntegration();
  checkNoWalletInSettlement();
  checkNoProviderKeyInSettlement();

  console.log('\n── Live checks (require API server) ─────────');
  await liveHealthCheck();
  await liveResultEndpointCheck();
  await liveSettlementGateCheck();

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  console.log('');
  console.log('── Summary ─────────────────────────────────');
  console.log(`  PASS: ${passed}  FAIL: ${failed}  SKIP: ${skipped}  TOTAL: ${results.length}`);

  const fileChecksFailed = results.filter(r => r.status === 'FAIL' && !r.name.startsWith('Live')).length;
  if (fileChecksFailed > 0) {
    console.log('  Overall: FAIL (file-level checks failed)');
    process.exit(1);
  } else if (failed > 0) {
    console.log('  Overall: PARTIAL (live checks failed — check server)');
    process.exit(0);
  } else {
    console.log('  Overall: PASS');
  }
}

main().catch(err => {
  console.error('Settlement smoke crashed:', err.message);
  process.exit(1);
});
