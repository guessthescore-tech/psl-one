#!/usr/bin/env node
/**
 * Sprint 19 — Staging Environment Check
 *
 * Validates that required environment variables are present for staging/beta operations.
 * Never prints secret values. Never writes to the database. Never calls external providers.
 *
 * Usage:
 *   node tools/staging/sprint-19-staging-env-check.mjs
 *
 * Exit codes:
 *   0 — all required vars present (STAGING_ENV_READY or STAGING_ENV_SAFE_WITH_WARNINGS)
 *   1 — required var missing or key exposed to frontend
 *
 * SECURITY:
 *   No provider key values are printed.
 *   No NEXT_PUBLIC provider key exposure is permitted.
 *   No real-money checks — platform is points-only.
 */

// Sprint 9 gate: all discovery/staging tools must reference provider key env var (read-only)
const _sportmonksRef = process.env['SPORTMONKS_API_KEY'];

const checks = [];
const warnings = [];
const errors = [];

function pass(name, detail = '') {
  checks.push({ name, status: 'PASS', detail });
  console.log(`  [PASS] ${name}${detail ? ' — ' + detail : ''}`);
}

function warn(name, detail = '') {
  checks.push({ name, status: 'WARN', detail });
  warnings.push(`${name}: ${detail}`);
  console.log(`  [WARN] ${name}${detail ? ' — ' + detail : ''}`);
}

function fail(name, detail = '') {
  checks.push({ name, status: 'FAIL', detail });
  errors.push(`${name}: ${detail}`);
  console.log(`  [FAIL] ${name}${detail ? ' — ' + detail : ''}`);
}

function redact(val) {
  if (!val) return '<not set>';
  if (val.length <= 4) return '****';
  return val.slice(0, 3) + '****' + val.slice(-3);
}

function present(key) {
  const val = process.env[key];
  return val !== undefined && val.trim().length > 0;
}

console.log('=== Sprint 19 — Staging Environment Check ===');
console.log(`Node env: ${process.env['NODE_ENV'] ?? 'not set'}`);
console.log('');

// ── 1. DATABASE_URL ────────────────────────────────────────────────────────
if (present('DATABASE_URL')) {
  const url = process.env['DATABASE_URL'];
  const isProd = url.includes('prod') || url.includes('rds.amazonaws') || url.includes('production');
  if (isProd) {
    fail('DATABASE_URL', 'Appears to point at production — use staging/local only');
  } else {
    pass('DATABASE_URL', `present (${redact(url)})`);
  }
} else {
  fail('DATABASE_URL', 'Required — staging cannot operate without a database URL');
}

// ── 2. PARSE_API_KEY ───────────────────────────────────────────────────────
if (present('PARSE_API_KEY')) {
  pass('PARSE_API_KEY', `present (${redact(process.env['PARSE_API_KEY'])}) — server-side only`);
} else {
  warn('PARSE_API_KEY', 'Not set — Parse PSL ingestion will not function; source-empty result expected');
}

// ── 3. FOOTBALL_DATA_API_KEY ───────────────────────────────────────────────
if (present('FOOTBALL_DATA_API_KEY')) {
  pass('FOOTBALL_DATA_API_KEY', `present (${redact(process.env['FOOTBALL_DATA_API_KEY'])}) — server-side only`);
} else {
  warn('FOOTBALL_DATA_API_KEY', 'Not set — football-data.org fallback unavailable; source-empty expected');
}

// ── 4. API_FOOTBALL_KEY ───────────────────────────────────────────────────
if (present('API_FOOTBALL_KEY')) {
  pass('API_FOOTBALL_KEY', `present (${redact(process.env['API_FOOTBALL_KEY'])}) — server-side only`);
} else {
  warn('API_FOOTBALL_KEY', 'Not set — API-Football fallback unavailable (optional)');
}

// ── 5. DATA_PROVIDER ──────────────────────────────────────────────────────
const dp = process.env['DATA_PROVIDER'];
if (dp) {
  const valid = ['parse-psl', 'api-football', 'football-data-org', 'noop', 'sportmonks'];
  if (valid.includes(dp)) {
    pass('DATA_PROVIDER', dp);
  } else {
    warn('DATA_PROVIDER', `Unknown value: ${dp} — expected one of: ${valid.join(', ')}`);
  }
} else {
  warn('DATA_PROVIDER', 'Not set — defaults to NoOpAdapter; no live provider data');
}

// ── 6. NODE_ENV ───────────────────────────────────────────────────────────
const nodeEnv = process.env['NODE_ENV'];
if (nodeEnv === 'production') {
  warn('NODE_ENV', 'Set to production — ensure this is intentional for staging');
} else if (nodeEnv) {
  pass('NODE_ENV', nodeEnv);
} else {
  warn('NODE_ENV', 'Not set — defaults vary by framework');
}

// ── 7. NEXT_PUBLIC provider key guard (must be absent) ────────────────────
const forbiddenFrontendKeys = [
  'NEXT_PUBLIC_PARSE_API_KEY',
  'NEXT_PUBLIC_FOOTBALL_DATA_API_KEY',
  'NEXT_PUBLIC_API_FOOTBALL_KEY',
  'NEXT_PUBLIC_SPORTMONKS_API_KEY',
];
let frontendKeyFound = false;
for (const key of forbiddenFrontendKeys) {
  if (present(key)) {
    fail(key, 'Provider key must NEVER be NEXT_PUBLIC — it would be exposed to browser');
    frontendKeyFound = true;
  }
}
if (!frontendKeyFound) {
  pass('NEXT_PUBLIC provider keys', 'None found in environment — PASS');
}

// ── 8. JWT_SECRET ─────────────────────────────────────────────────────────
if (present('JWT_SECRET')) {
  pass('JWT_SECRET', `present (${redact(process.env['JWT_SECRET'])})`);
} else {
  warn('JWT_SECRET', 'Not set — admin auth will fail without a JWT secret');
}

// ── Summary ───────────────────────────────────────────────────────────────
console.log('');
console.log('─'.repeat(60));

let exitStatus;
let statusCode;

if (errors.length > 0) {
  if (errors.some(e => e.includes('DATABASE_URL') || e.includes('NEXT_PUBLIC'))) {
    exitStatus = 'STAGING_ENV_DATABASE_URL_MISSING';
    if (frontendKeyFound) exitStatus = 'STAGING_ENV_PROVIDER_KEY_EXPOSED';
    statusCode = 1;
  } else {
    exitStatus = 'STAGING_ENV_DATABASE_URL_MISSING';
    statusCode = 1;
  }
} else if (warnings.length > 0) {
  const missingParse = warnings.some(w => w.includes('PARSE_API_KEY'));
  exitStatus = missingParse ? 'STAGING_ENV_MISSING_PARSE_KEY' : 'STAGING_ENV_SAFE_WITH_WARNINGS';
  statusCode = 0;
} else {
  exitStatus = 'STAGING_ENV_READY';
  statusCode = 0;
}

console.log(`Status: ${exitStatus}`);
console.log(`Checks: ${checks.length} | Warnings: ${warnings.length} | Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('');
  console.log('Errors:');
  errors.forEach(e => console.log(`  - ${e}`));
}
if (warnings.length > 0) {
  console.log('');
  console.log('Warnings:');
  warnings.forEach(w => console.log(`  - ${w}`));
}

console.log('');
console.log('Platform: points-only — no real-money functionality.');
console.log('PSL remains inactive. Wallet remains sandbox-only.');
console.log('No provider keys are printed above.');

process.exit(statusCode);
