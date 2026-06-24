#!/usr/bin/env node
/**
 * Sprint 37 — Provider Environment Variable Check
 *
 * Checks presence (never values) of provider env vars.
 * Reports which provider is configured and whether it is safe.
 *
 * Usage:
 *   DATA_PROVIDER=parse-psl node sprint-37-provider-env-check.mjs
 *
 * SECURITY:
 *   - Key values are NEVER printed.
 *   - Key prefixes are NOT printed.
 *   - No env files are written.
 *   - No provider API calls are made.
 *   - No DB writes.
 *   - No fixture import.
 *   - No PSL activation.
 */

const DATA_PROVIDER = process.env['DATA_PROVIDER'] ?? '';
const PARSE_KEY_PRESENT = (process.env['PARSE_API_KEY'] ?? '').length > 0;
const AF_KEY_PRESENT = (process.env['API_FOOTBALL_KEY'] ?? '').length > 0;
const FDO_KEY_PRESENT = (process.env['FOOTBALL_DATA_API_KEY'] ?? '').length > 0;

// Front-end safety: these must NEVER appear on the client
const FRONTEND_EXPOSURE_RISK =
  !!(process.env['NEXT_PUBLIC_PARSE_API_KEY'] ||
     process.env['NEXT_PUBLIC_API_FOOTBALL_KEY'] ||
     process.env['NEXT_PUBLIC_FOOTBALL_DATA_API_KEY'] ||
     process.env['NEXT_PUBLIC_PROVIDER_KEY'] ||
     process.env['NEXT_PUBLIC_SPORT_KEY']);

const results = [];

function pass(name, detail = '') {
  results.push({ name, status: 'PASS', detail });
  console.log(`  [PASS] ${name}${detail ? ' — ' + detail : ''}`);
}

function warn(name, detail = '') {
  results.push({ name, status: 'WARN', detail });
  console.log(`  [WARN] ${name}${detail ? ' — ' + detail : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, status: 'FAIL', detail });
  console.log(`  [FAIL] ${name}${detail ? ' — ' + detail : ''}`);
}

function info(name, detail = '') {
  results.push({ name, status: 'INFO', detail });
  console.log(`  [INFO] ${name}${detail ? ' — ' + detail : ''}`);
}

console.log('=== Sprint 37 — Provider Environment Variable Check ===');
console.log('Mode: PRESENCE CHECK ONLY — no key values printed, no API calls\n');

// 1. DATA_PROVIDER env var
if (!DATA_PROVIDER) {
  warn('DATA_PROVIDER', 'not set — NoOpAdapter will be used');
} else {
  info('DATA_PROVIDER', `set to "${DATA_PROVIDER}"`);
}

// 2. Parse PSL check
if (DATA_PROVIDER === 'parse-psl') {
  if (PARSE_KEY_PRESENT) {
    pass('Parse PSL', 'DATA_PROVIDER=parse-psl AND PARSE_API_KEY present');
  } else {
    fail('Parse PSL', 'DATA_PROVIDER=parse-psl but PARSE_API_KEY not set — NoOpAdapter fallback');
  }
} else {
  info('Parse PSL', 'DATA_PROVIDER != parse-psl');
  if (PARSE_KEY_PRESENT) {
    warn('Parse PSL key', 'PARSE_API_KEY is present but DATA_PROVIDER != parse-psl — key is unused');
  }
}

// 3. API-Football check
if (DATA_PROVIDER === 'api-football') {
  if (AF_KEY_PRESENT) {
    pass('API-Football', 'DATA_PROVIDER=api-football AND API_FOOTBALL_KEY present');
    warn('API-Football suspension', 'Sprint 13 showed ACCOUNT_SUSPENDED on PSL 288 — verify account is active before use');
  } else {
    fail('API-Football', 'DATA_PROVIDER=api-football but API_FOOTBALL_KEY not set — NoOpAdapter fallback');
  }
} else {
  info('API-Football', 'DATA_PROVIDER != api-football');
}

// 4. Football-data.org check (World Cup path)
if (DATA_PROVIDER === 'football-data-org') {
  if (FDO_KEY_PRESENT) {
    pass('football-data.org', 'DATA_PROVIDER=football-data-org AND FOOTBALL_DATA_API_KEY present (WC path)');
  } else {
    fail('football-data.org', 'DATA_PROVIDER=football-data-org but FOOTBALL_DATA_API_KEY not set — NoOpAdapter fallback');
  }
} else {
  info('football-data.org', `DATA_PROVIDER != football-data-org (currently "${DATA_PROVIDER || 'not set'}") — WC path via ProviderRouter may still work if FOOTBALL_DATA_API_KEY present`);
  if (FDO_KEY_PRESENT) {
    pass('football-data.org key', 'FOOTBALL_DATA_API_KEY present — WC ProviderRouter path available');
  } else {
    warn('football-data.org key', 'FOOTBALL_DATA_API_KEY not present — WC route will fall back to NoOp');
  }
}

// 5. Frontend safety check
if (FRONTEND_EXPOSURE_RISK) {
  fail('Frontend key safety', 'NEXT_PUBLIC_* provider key variable detected — keys MUST be server-side only');
} else {
  pass('Frontend key safety', 'No NEXT_PUBLIC_* provider key variable detected');
}

// 6. Pairing validation
const pairingOk =
  (!DATA_PROVIDER) ||
  (DATA_PROVIDER === 'parse-psl' && PARSE_KEY_PRESENT) ||
  (DATA_PROVIDER === 'api-football' && AF_KEY_PRESENT) ||
  (DATA_PROVIDER === 'football-data-org' && FDO_KEY_PRESENT);

if (!pairingOk) {
  warn('Provider pairing', `DATA_PROVIDER="${DATA_PROVIDER}" is set but corresponding key is missing — NoOpAdapter will be used`);
} else if (DATA_PROVIDER) {
  pass('Provider pairing', `DATA_PROVIDER="${DATA_PROVIDER}" and key present — provider will be active`);
}

// 7. Build result
const parsePslConfigured = DATA_PROVIDER === 'parse-psl' && PARSE_KEY_PRESENT;
const apiFootballConfigured = DATA_PROVIDER === 'api-football' && AF_KEY_PRESENT;
const footballDataConfigured = DATA_PROVIDER === 'football-data-org' && FDO_KEY_PRESENT;
const anyConfigured = parsePslConfigured || apiFootballConfigured || footballDataConfigured;

const result = {
  dataProvider: DATA_PROVIDER || 'not_set',
  parsePslConfigured,
  apiFootballConfigured,
  footballDataConfigured,
  anyProviderConfigured: anyConfigured,
  frontendKeyExposure: FRONTEND_EXPOSURE_RISK ? 'DETECTED_UNSAFE' : 'not_detected',
  safe: !FRONTEND_EXPOSURE_RISK,
};

const passCt = results.filter(r => r.status === 'PASS').length;
const failCt = results.filter(r => r.status === 'FAIL').length;
const warnCt = results.filter(r => r.status === 'WARN').length;

console.log('\n────────────────────────────────────────────────────────────');
console.log(`PASS: ${passCt} | FAIL: ${failCt} | WARN: ${warnCt}`);
console.log('\nResult:');
console.log(JSON.stringify(result, null, 2));
console.log('\nSECURITY: No key values printed. No API calls made. No DB writes.');

if (FRONTEND_EXPOSURE_RISK) {
  console.log('\n[FATAL] Frontend provider key exposure detected. Remove NEXT_PUBLIC_* key vars immediately.');
  process.exit(1);
}

process.exit(0);
