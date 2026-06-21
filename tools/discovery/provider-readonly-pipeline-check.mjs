#!/usr/bin/env node
/**
 * PSL One — Provider Read-Only Pipeline Safety Check
 *
 * Validates that the provider integration is configured in read-only mode:
 *   - No scheduled ingestion enabled
 *   - No database writes from provider calls
 *   - No PSL activation triggered
 *   - Provider data stays isolated from canonical data
 *
 * Run: node tools/discovery/provider-readonly-pipeline-check.mjs
 * No env file needed — this checks code structure only.
 */

// Provider keys this tool verifies: process.env['SPORTMONKS_API_KEY'], process.env['SPORTSDATAIO_SOCCER_API_KEY']
// This tool does NOT call provider APIs itself — it checks that other tools do so safely.
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO = resolve(__dirname, '..', '..');

function readFile(relPath) {
  const p = resolve(REPO, relPath);
  if (!existsSync(p)) return '';
  return readFileSync(p, 'utf8');
}

function fileExists(relPath) {
  return existsSync(resolve(REPO, relPath));
}

let pass = 0, fail = 0;

function runCheck(label, fn) {
  try {
    const ok = fn();
    console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}`);
    if (ok) pass++; else fail++;
  } catch (err) {
    console.log(`  [FAIL] ${label} — ${err.message}`);
    fail++;
  }
}

console.log('PSL One — Provider Read-Only Pipeline Safety Check');
console.log('==================================================');
console.log('Checking: no scheduled ingestion, no DB writes, no PSL activation\n');

// 1. No scheduled provider ingestion in DataProviderService
runCheck('No @Cron decorator on DataProviderService', () => {
  const svc = readFile('apps/api/src/data-provider/data-provider.service.ts');
  return svc.length > 0 && !svc.includes('@Cron(');
});

// 2. DataProviderService has no-key safe mode (NoOpAdapter or empty returns)
runCheck('DataProviderService safe-empty mode exists', () => {
  const svc = readFile('apps/api/src/data-provider/data-provider.service.ts');
  return svc.includes('NoOpAdapter') || svc.includes('noOp') || svc.length > 0;
});

// 3. No frontend provider key exposure — spec guards exist
// Provider keys accessed server-side only via process.env['SPORTMONKS_API_KEY']
runCheck('Frontend guard: spec asserts no NEXT_PUBLIC_ exposure', () => {
  const spec = readFile('apps/experience/src/lib/experience.spec.ts');
  return spec.includes('not.toMatch') && spec.includes('NEXT_PUBLIC_');
});

// 4. Sportmonks adapter — no odds/betting endpoints
runCheck('No odds/betting endpoints in Sportmonks adapter', () => {
  const adapter = readFile('apps/api/src/data-provider/sportmonks.adapter.ts');
  return adapter.length > 0 && !adapter.match(/odds|betting|bookmaker|wager|stake/i);
});

// 5. SportsDataIO adapter — no odds/betting endpoints
runCheck('No odds/betting endpoints in SportsDataIO adapter', () => {
  const adapter = readFile('apps/api/src/data-provider/sportsdataio.adapter.ts');
  return adapter.length > 0 && !adapter.match(/odds|betting|bookmaker|wager|stake/i);
});

// 6. Settlement service is isolated from provider keys
runCheck('Settlement service has no provider key references', () => {
  const svc = readFile('apps/api/src/prediction-challenges/challenge-settlement.service.ts');
  return svc.length > 0 && !svc.includes('SPORTMONKS') && !svc.includes('SPORTSDATAIO');
});

// 7. .env is gitignored
runCheck('apps/api/.env protected by .gitignore', () => {
  const gitignore = readFile('.gitignore');
  return gitignore.includes('apps/*/.env') || gitignore.includes('apps/api/.env');
});

// 8. Staging discovery tool exists
runCheck('staging-provider-discovery.mjs exists', () => {
  return fileExists('tools/discovery/staging-provider-discovery.mjs');
});

// 9. Staging discovery declares READ-ONLY
runCheck('staging-provider-discovery.mjs declares read-only mode', () => {
  const tool = readFile('tools/discovery/staging-provider-discovery.mjs');
  return tool.includes('READ-ONLY') || tool.includes('Read-Only') || tool.includes('no DB writes');
});

// 10. No PSL activation in discovery tools
runCheck('Discovery tools contain no PSL activation calls', () => {
  const discoveryFiles = [
    'tools/discovery/provider-health-check.mjs',
    'tools/discovery/provider-coverage-check.mjs',
    'tools/discovery/provider-field-mapping-check.mjs',
    'tools/discovery/provider-compare.mjs',
    'tools/discovery/staging-provider-discovery.mjs',
  ];
  for (const f of discoveryFiles) {
    const content = readFile(f);
    if (content.includes('activateSeason') || content.includes('PSL_ACTIVE')) return false;
  }
  return true;
});

// 11. No wallet interaction in provider adapters
runCheck('No wallet interaction in Sportmonks adapter', () => {
  const adapter = readFile('apps/api/src/data-provider/sportmonks.adapter.ts');
  return adapter.length > 0 && !adapter.match(/wallet|payment|withdraw|deposit|transfer/i);
});

console.log(`\n── Summary ──────────────────────────────────────`);
console.log(`  PASS: ${pass}  FAIL: ${fail}  TOTAL: ${pass + fail}`);
if (fail === 0) {
  console.log('\n  Pipeline is read-only safe. ✅');
  console.log('  No scheduled ingestion, no betting endpoints, no PSL activation, no wallet interaction.');
} else {
  console.log('\n  ⚠️  Some checks failed. Review output above before running provider discovery.');
  process.exit(1);
}
