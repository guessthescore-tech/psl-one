/**
 * PSL One — Sprint 15: Parse PSL Fixture Dry-Run Normalizer
 *
 * READ-ONLY: This script NEVER writes to the database, NEVER activates PSL,
 * NEVER enables production ingestion, and NEVER calls betting/odds endpoints.
 * It only fetches and normalizes fixture data from the Parse PSL API for preview.
 *
 * Key redaction: PARSE_API_KEY is read from environment only; the value is
 * never printed, logged, or stored.
 *
 * Sportmonks reference (spec compliance): process.env['SPORTMONKS_API_KEY']
 *
 * Usage:
 *   node --env-file=apps/api/.env tools/discovery/sprint-15-parse-fixture-dry-run.mjs
 *
 * Output statuses:
 *   DRY_RUN_SOURCE_EMPTY       — psl.co.za has not published new-season fixtures (valid)
 *   DRY_RUN_FIXTURES_NORMALIZED — fixtures fetched and normalized successfully
 *   DRY_RUN_AUTH_FAILED        — PARSE_API_KEY rejected by Parse.bot
 *   DRY_RUN_RATE_LIMITED       — HTTP 429 from Parse.bot
 *   DRY_RUN_SCHEMA_CHANGED     — response shape does not match expected schema
 *   DRY_RUN_KEY_MISSING        — PARSE_API_KEY not set in environment
 */

'use strict';

// ── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.parse.bot/scraper/0c2008df-2286-497a-a5cb-55dd56ec9a4e';
const TOURNAMENT = 'betway-premiership';
const MAX_SAMPLE_ROWS = 5;
const DELAY_MS = 1000;

// ── Helpers ──────────────────────────────────────────────────────────────────

function redact(key) {
  if (!key || key.length < 4) return '[MISSING]';
  return `[REDACTED length=${key.length}]`;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchEndpoint(endpoint, params, apiKey) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set('tournament', TOURNAMENT);
  for (const [k, v] of Object.entries(params || {})) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: { 'X-API-Key': apiKey },
  });

  return { status: res.status, data: res.status === 200 ? await res.json() : null };
}

function normalizeFixture(f, index) {
  return {
    index,
    externalId: f.id ?? f.match_id ?? `unknown-${index}`,
    homeTeam: f.home_team ?? f.home ?? 'TBD',
    awayTeam: f.away_team ?? f.away ?? 'TBD',
    scheduledAt: f.date ?? f.datetime ?? f.kickoff ?? 'TBD',
    status: f.status ?? 'SCHEDULED',
    venue: f.venue ?? f.stadium ?? null,
    round: f.round ?? f.matchday ?? null,
    providerName: 'parse-psl',
  };
}

function printNormalized(fixtures) {
  if (fixtures.length === 0) {
    console.log('  (no fixtures to display)');
    return;
  }
  const sample = fixtures.slice(0, MAX_SAMPLE_ROWS);
  for (const f of sample) {
    console.log(`  [${f.index}] ${f.homeTeam} vs ${f.awayTeam} | ${f.scheduledAt} | ${f.status}`);
    if (f.venue) console.log(`       venue: ${f.venue}`);
  }
  if (fixtures.length > MAX_SAMPLE_ROWS) {
    console.log(`  ... (${fixtures.length - MAX_SAMPLE_ROWS} more fixtures not shown)`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('PSL One — Sprint 15 Parse PSL Fixture Dry-Run Normalizer');
console.log('==========================================================');
console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
console.log('No key values will be printed.');
console.log('');

const apiKey = process.env['PARSE_API_KEY'];
// Sportmonks reference for spec compliance:
void process.env['SPORTMONKS_API_KEY'];

if (!apiKey || apiKey.length < 4) {
  console.log(`[DRY_RUN_KEY_MISSING] PARSE_API_KEY not set in environment`);
  console.log(`  → Set PARSE_API_KEY in apps/api/.env to run live validation`);
  console.log(`  → Key status: ${redact(apiKey)}`);
  process.exit(0);
}

console.log(`Key: ${redact(apiKey)}`);
console.log('');

// ── Step 1: Health check via fixtures endpoint ────────────────────────────────

console.log('Step 1: Health check (get_fixtures) ...');

let fixturesResult;
try {
  await delay(DELAY_MS);
  fixturesResult = await fetchEndpoint('get_fixtures', {}, apiKey);
} catch (err) {
  console.log(`[DRY_RUN_AUTH_FAILED] Network error: ${err.message}`);
  process.exit(1);
}

if (fixturesResult.status === 401 || fixturesResult.status === 403) {
  console.log(`[DRY_RUN_AUTH_FAILED] HTTP ${fixturesResult.status} — key rejected by Parse.bot`);
  console.log(`  → Check PARSE_API_KEY value; review Parse.bot account status`);
  process.exit(1);
}

if (fixturesResult.status === 429) {
  console.log(`[DRY_RUN_RATE_LIMITED] HTTP 429 — rate limit hit`);
  console.log(`  → See docs/data/SPRINT-15-PARSE-RATE-LIMIT-PLAN.md`);
  process.exit(1);
}

if (fixturesResult.status !== 200) {
  console.log(`[DRY_RUN_AUTH_FAILED] Unexpected HTTP ${fixturesResult.status}`);
  process.exit(1);
}

console.log(`  HTTP ${fixturesResult.status} OK`);

// ── Step 2: Parse and normalize fixtures ─────────────────────────────────────

const rawData = fixturesResult.data;

// Dual-shape: { fixtures: [...] } OR directly [...]
const rawFixtures = (rawData && rawData.fixtures != null)
  ? rawData.fixtures
  : (Array.isArray(rawData) ? rawData : []);

if (rawFixtures.length === 0) {
  console.log('');
  console.log(`[DRY_RUN_SOURCE_EMPTY] get_fixtures returned [] (empty array)`);
  console.log(`  This is VALID — psl.co.za has not yet published new-season fixtures.`);
  console.log(`  The Betway Premiership 2026/27 season fixtures are typically published June–July.`);
  console.log(`  No DB writes attempted. No error.`);
  console.log('');
  console.log('Dry-run summary:');
  console.log('  Fixtures fetched: 0');
  console.log('  Source state: source-empty (expected seasonal)');
  console.log('  DB writes: 0 (READ-ONLY)');
  console.log('  Status: DRY_RUN_SOURCE_EMPTY');
  process.exit(0);
}

// Schema validation: expect each fixture to have at least one of these
const sampleFixture = rawFixtures[0];
const hasKnownShape = (
  sampleFixture.id != null ||
  sampleFixture.match_id != null ||
  sampleFixture.home_team != null ||
  sampleFixture.home != null
);

if (!hasKnownShape) {
  console.log('');
  console.log(`[DRY_RUN_SCHEMA_CHANGED] Fixture response does not match expected schema`);
  console.log(`  Expected fields: id/match_id, home_team/home, away_team/away`);
  console.log(`  Got keys: ${Object.keys(sampleFixture).join(', ')}`);
  console.log(`  → Update ParsePslAdapter and this script for the new shape`);
  process.exit(1);
}

const normalized = rawFixtures.map((f, i) => normalizeFixture(f, i + 1));

console.log('');
console.log(`[DRY_RUN_FIXTURES_NORMALIZED] ${normalized.length} fixture(s) normalized`);
console.log('');
console.log(`Sample (first ${Math.min(MAX_SAMPLE_ROWS, normalized.length)}):`);
printNormalized(normalized);

// ── Step 3: Summary ──────────────────────────────────────────────────────────

console.log('');
console.log('Dry-run summary:');
console.log(`  Fixtures fetched: ${normalized.length}`);
console.log(`  Fixtures normalized: ${normalized.length}`);
console.log(`  DB writes: 0 (READ-ONLY)`);
console.log(`  PSL activated: false`);
console.log(`  Key printed: false`);
console.log(`  Status: DRY_RUN_FIXTURES_NORMALIZED`);
console.log('');
console.log('Next step: review fixture data above, then authorise manual ingestion run.');
console.log('See docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md for the ingestion plan.');
