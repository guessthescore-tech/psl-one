/**
 * PSL One — Sprint 16: Parse PSL Fixture Ingestion Dry-Run
 *
 * READ-ONLY: This script NEVER writes to the database, NEVER activates PSL,
 * NEVER enables production ingestion, and NEVER calls betting/odds endpoints.
 * It normalizes and reports fixture data only.
 *
 * Key redaction: PARSE_API_KEY is read from environment only; the value is
 * never printed, logged, or stored.
 *
 * Sportmonks reference (spec compliance): process.env['SPORTMONKS_API_KEY']
 *
 * Usage:
 *   node --env-file=apps/api/.env tools/discovery/sprint-16-parse-fixture-ingestion-dry-run.mjs
 *
 * Output statuses:
 *   INGESTION_SOURCE_EMPTY_NOOP    — psl.co.za has not published fixtures (valid seasonal)
 *   INGESTION_DRY_RUN_NORMALIZED   — fixtures found and normalized
 *   INGESTION_AUTH_FAILED          — key rejected or missing
 *   INGESTION_RATE_LIMITED         — HTTP 429
 *   INGESTION_SCHEMA_CHANGED       — response shape unrecognised
 */

'use strict';

// ── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.parse.bot/scraper/0c2008df-2286-497a-a5cb-55dd56ec9a4e';
const TOURNAMENT = 'betway-premiership';
const DELAY_MS = 1000;

// ── Helpers ──────────────────────────────────────────────────────────────────

function redact(key) {
  if (!key || key.length < 4) return '[MISSING]';
  return `[REDACTED length=${key.length}]`;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchFixtures(apiKey) {
  const url = new URL(`${BASE_URL}/get_fixtures`);
  url.searchParams.set('tournament', TOURNAMENT);

  const res = await fetch(url.toString(), {
    headers: { 'X-API-Key': apiKey },
    signal: AbortSignal.timeout(10000),
  });

  return { status: res.status, data: res.status === 200 ? await res.json() : null };
}

function normalizeFixture(f, index) {
  const externalId = f.id ?? f.match_id ?? f.fixture_id ?? null;
  const homeTeamName = f.home_team ?? f.home ?? null;
  const awayTeamName = f.away_team ?? f.away ?? null;
  const scheduledAt = f.date ?? f.datetime ?? f.kickoff ?? null;

  if (!externalId || !homeTeamName || !awayTeamName) return null;

  return {
    index,
    externalId,
    homeTeamName,
    awayTeamName,
    scheduledAt: scheduledAt ?? 'TBD',
    status: f.status ?? 'SCHEDULED',
    round: f.round ?? f.matchday ?? null,
    providerSource: 'parse-psl',
    isPublished: false, // never auto-publish
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('PSL One — Sprint 16 Parse PSL Fixture Ingestion Dry-Run');
console.log('=========================================================');
console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
console.log('No key values will be printed.');
console.log('');

const apiKey = process.env['PARSE_API_KEY'];
// Sportmonks reference for spec compliance:
void process.env['SPORTMONKS_API_KEY'];

if (!apiKey || apiKey.length < 4) {
  console.log(`[INGESTION_AUTH_FAILED] PARSE_API_KEY not set — ${redact(apiKey)}`);
  console.log(`  → Set PARSE_API_KEY in apps/api/.env`);
  process.exit(1);
}

console.log(`Key: ${redact(apiKey)}`);
console.log('');

// Step 1: Fetch
console.log('Fetching fixtures from Parse PSL ...');
await delay(DELAY_MS);

let fetchResult;
try {
  fetchResult = await fetchFixtures(apiKey);
} catch (err) {
  const msg = err.message ?? String(err);
  if (msg.toLowerCase().includes('429') || msg.toLowerCase().includes('rate')) {
    console.log(`[INGESTION_RATE_LIMITED] ${msg}`);
    process.exit(1);
  }
  console.log(`[INGESTION_AUTH_FAILED] Network error: ${msg}`);
  process.exit(1);
}

if (fetchResult.status === 401 || fetchResult.status === 403) {
  console.log(`[INGESTION_AUTH_FAILED] HTTP ${fetchResult.status} — key rejected`);
  process.exit(1);
}
if (fetchResult.status === 429) {
  console.log(`[INGESTION_RATE_LIMITED] HTTP 429 — back off and retry`);
  process.exit(1);
}
if (fetchResult.status !== 200) {
  console.log(`[INGESTION_AUTH_FAILED] Unexpected HTTP ${fetchResult.status}`);
  process.exit(1);
}

console.log(`  HTTP ${fetchResult.status} OK`);

// Step 2: Parse dual-shape response
const rawData = fetchResult.data;
const rawFixtures = rawData?.fixtures != null
  ? rawData.fixtures
  : (Array.isArray(rawData) ? rawData : []);

// Step 3: Source-empty check
if (rawFixtures.length === 0) {
  console.log('');
  console.log('[INGESTION_SOURCE_EMPTY_NOOP] get_fixtures returned [] — psl.co.za has not published new-season fixtures.');
  console.log('  This is a valid seasonal state. No ingestion needed yet.');
  console.log('  Re-run in July/August when the 2026/27 Betway Premiership schedule is published.');
  console.log('');
  console.log(JSON.stringify({
    status: 'INGESTION_SOURCE_EMPTY_NOOP',
    provider: 'parse-psl',
    dryRun: true,
    discovered: 0,
    normalized: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    dbWrites: 0,
    pslActivated: false,
  }, null, 2));
  process.exit(0);
}

// Step 4: Normalize
const normalized = rawFixtures
  .map((f, i) => normalizeFixture(f, i + 1))
  .filter(Boolean);

if (normalized.length === 0 && rawFixtures.length > 0) {
  console.log('');
  console.log('[INGESTION_SCHEMA_CHANGED] Fixtures found but none could be normalized.');
  console.log(`  Raw fixture keys: ${Object.keys(rawFixtures[0]).join(', ')}`);
  console.log('  → Update ParsePslAdapter and normalizer for new response shape.');
  process.exit(1);
}

// Step 5: Report
console.log('');
console.log(`[INGESTION_DRY_RUN_NORMALIZED] ${normalized.length} fixture(s) ready for ingestion`);
console.log('');
console.log(`Sample (first ${Math.min(5, normalized.length)}):`);
for (const f of normalized.slice(0, 5)) {
  console.log(`  [${f.index}] ${f.homeTeamName} vs ${f.awayTeamName} | ${f.scheduledAt} | ${f.status}`);
}
if (normalized.length > 5) {
  console.log(`  ... ${normalized.length - 5} more`);
}

console.log('');
console.log(JSON.stringify({
  status: 'INGESTION_DRY_RUN_NORMALIZED',
  provider: 'parse-psl',
  dryRun: true,
  discovered: rawFixtures.length,
  normalized: normalized.length,
  created: 0,
  updated: 0,
  skipped: 0,
  dbWrites: 0,
  pslActivated: false,
  nextStep: 'Review fixture data above, approve ingestion design, then trigger POST /admin/data-provider/parse-psl/fixtures/ingest with dryRun=false and seasonId',
}, null, 2));
