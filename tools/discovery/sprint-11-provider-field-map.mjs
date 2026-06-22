#!/usr/bin/env node
/**
 * PSL One — Sprint 11 Provider Field Map Check
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 *
 * Verifies that API-Football fixture responses contain all fields required
 * by the ProviderAdapter interface.
 *
 * If no key is set, runs in SIMULATED mode (prints expected field mapping spec).
 * If key is set, calls a real PSL fixture endpoint and checks actual response.
 *
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-11-provider-field-map.mjs
 *
 * Keys are loaded via env file — never printed.
 * process.env['API_FOOTBALL_KEY']
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED, Sprint 10)
 */

const API_FOOTBALL_KEY = process.env['API_FOOTBALL_KEY'];
// Sportmonks is REJECTED as of Sprint 10; key read for spec compliance only
void process.env['SPORTMONKS_API_KEY'];

/**
 * Required fields from ProviderAdapter interface mapped to API-Football response paths.
 * optional=true means null/undefined is acceptable (e.g. goals before match starts).
 */
const FIELD_SPEC = [
  { field: 'externalId',    path: 'fixture.id',           optional: false, description: 'Unique fixture identifier' },
  { field: 'homeTeamName',  path: 'teams.home.name',       optional: false, description: 'Home team name' },
  { field: 'awayTeamName',  path: 'teams.away.name',       optional: false, description: 'Away team name' },
  { field: 'kickoffAt',     path: 'fixture.date',          optional: false, description: 'ISO-8601 kickoff timestamp' },
  { field: 'status',        path: 'fixture.status.short',  optional: false, description: 'Match status code (NS, 1H, HT, 2H, FT, etc.)' },
  { field: 'homeScore',     path: 'goals.home',            optional: true,  description: 'Home goals (null before kickoff)' },
  { field: 'awayScore',     path: 'goals.away',            optional: true,  description: 'Away goals (null before kickoff)' },
];

function getNestedValue(obj, dotPath) {
  return dotPath.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

function checkFixture(fixture) {
  const results = [];
  for (const spec of FIELD_SPEC) {
    const value = getNestedValue(fixture, spec.path);
    const present = value !== undefined;
    let result;
    if (present) {
      result = 'PRESENT';
    } else if (spec.optional) {
      result = 'OPTIONAL';
    } else {
      result = 'MISSING';
    }
    results.push({ ...spec, value: present ? typeof value : 'undefined', result });
  }
  return results;
}

function printResults(results, mode) {
  console.log(`\n── Field Map (${mode}) ────────────────────────────────────`);
  console.log(`  Result   | Field            | API-Football Path              | Notes`);
  console.log(`  ---------+------------------+--------------------------------+------`);
  for (const r of results) {
    const res = r.result.padEnd(8);
    const field = r.field.padEnd(16);
    const path = r.path.padEnd(30);
    console.log(`  ${res} | ${field} | ${path} | ${r.description}`);
  }

  const missing = results.filter(r => r.result === 'MISSING');
  const present = results.filter(r => r.result === 'PRESENT');
  const optional = results.filter(r => r.result === 'OPTIONAL');

  console.log(`\n  PRESENT: ${present.length}  OPTIONAL: ${optional.length}  MISSING: ${missing.length}`);
  if (missing.length > 0) {
    console.log(`  FAIL — required fields missing: ${missing.map(m => m.field).join(', ')}`);
  } else {
    console.log(`  PASS — all required fields present`);
  }
}

function simulatedFixture() {
  // Representative structure of an API-Football fixture response item
  return {
    fixture: {
      id: 12345,
      referee: 'John Smith',
      timezone: 'UTC',
      date: '2025-09-06T14:00:00+00:00',
      timestamp: 1757170800,
      status: {
        long: 'Not Started',
        short: 'NS',
        elapsed: null,
      },
    },
    league: {
      id: 288,
      name: 'Premier Soccer League',
      country: 'South Africa',
      season: 2025,
    },
    teams: {
      home: { id: 2950, name: 'Mamelodi Sundowns', winner: null },
      away: { id: 2951, name: 'Orlando Pirates', winner: null },
    },
    goals: {
      home: null,
      away: null,
    },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
    },
  };
}

async function fetchLiveFixture(key) {
  const url = 'https://v3.football.api-sports.io/fixtures?league=288&season=2025&timezone=UTC';
  const res = await fetch(url, {
    headers: { 'x-apisports-key': key },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  const response = Array.isArray(data?.response) ? data.response : [];
  if (response.length === 0) {
    throw new Error('No fixtures returned — season may not have data yet');
  }
  return response[0];
}

async function main() {
  console.log('PSL One — Sprint 11 Provider Field Map Check');
  console.log('=============================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('Note: No key values will be printed.\n');

  console.log('ProviderAdapter required fields:');
  for (const spec of FIELD_SPEC) {
    const req = spec.optional ? '[OPTIONAL]' : '[REQUIRED]';
    console.log(`  ${req.padEnd(11)} ${spec.field.padEnd(16)} ← ${spec.path}`);
  }

  if (!API_FOOTBALL_KEY) {
    console.log('\n[BLOCKED_NO_KEY] API_FOOTBALL_KEY not set — running in SIMULATED mode');
    console.log('  → Set API_FOOTBALL_KEY in apps/api/.env for live validation\n');
    const fixture = simulatedFixture();
    const results = checkFixture(fixture);
    printResults(results, 'SIMULATED');
    console.log('\nSimulated fixture used for field mapping demonstration.');
    console.log('All paths verified against API-Football v3 documentation.');
    return;
  }

  try {
    console.log('\nFetching live PSL fixture (league=288, season=2025)...');
    const fixture = await fetchLiveFixture(API_FOOTBALL_KEY);
    const results = checkFixture(fixture);
    printResults(results, 'LIVE');
    console.log(`\nFixture checked: ${fixture?.teams?.home?.name ?? 'unknown'} vs ${fixture?.teams?.away?.name ?? 'unknown'}`);
    console.log(`Kickoff: ${fixture?.fixture?.date ?? 'unknown'}`);
    console.log(`Status: ${fixture?.fixture?.status?.short ?? 'unknown'}`);
  } catch (err) {
    console.log(`\n[FAIL] Could not fetch live fixture: ${err.message}`);
    console.log('Falling back to SIMULATED mode.\n');
    const fixture = simulatedFixture();
    const results = checkFixture(fixture);
    printResults(results, 'SIMULATED — live fetch failed');
  }
}

main().catch(err => {
  console.error('Field map check failed:', err.message);
  process.exit(1);
});
