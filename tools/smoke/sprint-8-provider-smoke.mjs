#!/usr/bin/env node
/**
 * Sprint 8 Provider Smoke — validates provider boundary (no-key state)
 * Does NOT require SPORTMONKS_API_KEY.
 * Run: node tools/smoke/sprint-8-provider-smoke.mjs
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    fn();
    console.log(`  PASS ${label}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL ${label}: ${err.message}`);
    failed++;
  }
}

function scanDir(dir) {
  const results = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) results.push(...scanDir(full));
    else results.push(full);
  }
  return results;
}

console.log('\n=== Sprint 8 Provider Smoke ===\n');

// Adapter exists
check('SportmonksAdapter file exists', () => {
  const p = resolve(ROOT, 'apps/api/src/data-provider/sportmonks.adapter.ts');
  if (!existsSync(p)) throw new Error('File not found');
});

// No key in frontend source
check('No SPORTMONKS_API_KEY in experience/src', () => {
  const srcDir = resolve(ROOT, 'apps/experience/src');
  if (!existsSync(srcDir)) throw new Error('apps/experience/src not found');
  const files = scanDir(srcDir).filter(f => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.endsWith('.spec.ts'));
  for (const f of files) {
    const content = readFileSync(f, 'utf8');
    if (content.includes('SPORTMONKS_API_KEY') || content.includes('api_token=')) {
      throw new Error(`Found in ${f}`);
    }
  }
});

// Token not in staging runbook
check('Provider token not in staging runbook', () => {
  const p = resolve(ROOT, 'docs/handover/SPRINT-8-STAGING-MIGRATION-RUNBOOK.md');
  if (!existsSync(p)) throw new Error('Runbook not found');
  const content = readFileSync(p, 'utf8');
  // Should not contain anything that looks like a real token (40+ char alphanumeric)
  if (/[A-Za-z0-9]{40,}/.test(content)) throw new Error('Possible token value found in runbook');
});

// No real-money in settlement service
check('Settlement service has no real-money language', () => {
  const p = resolve(ROOT, 'apps/api/src/prediction-challenges/challenge-settlement.service.ts');
  if (!existsSync(p)) throw new Error('Settlement service not found');
  const content = readFileSync(p, 'utf8');
  if (/\b(wallet|payout|deposit|withdraw|stake|wager|cash)\b/i.test(content)) {
    throw new Error('Real-money language found in settlement service');
  }
});

// BLOCKED_BY_REPLACEMENT_TOKEN documented
check('Provider validation doc says BLOCKED_BY_REPLACEMENT_TOKEN', () => {
  const p = resolve(ROOT, 'docs/data/SPRINT-8-SPORTMONKS-TRIAL-VALIDATION.md');
  if (!existsSync(p)) throw new Error('Validation doc not found');
  const content = readFileSync(p, 'utf8');
  if (!content.includes('BLOCKED_BY_REPLACEMENT_TOKEN')) throw new Error('Status not documented');
});

// settleAllAcceptedForFixture exists
check('settleAllAcceptedForFixture is implemented in settlement service', () => {
  const p = resolve(ROOT, 'apps/api/src/prediction-challenges/challenge-settlement.service.ts');
  const content = readFileSync(p, 'utf8');
  if (!content.includes('settleAllAcceptedForFixture')) throw new Error('Method not found');
});

// Fire-and-forget pattern exists
check('Settlement trigger is fire-and-forget (.catch) in football service', () => {
  const p = resolve(ROOT, 'apps/api/src/football/football.service.ts');
  if (!existsSync(p)) throw new Error('Football service not found');
  const content = readFileSync(p, 'utf8');
  if (!content.includes('.catch(')) throw new Error('.catch( not found — not fire-and-forget');
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
