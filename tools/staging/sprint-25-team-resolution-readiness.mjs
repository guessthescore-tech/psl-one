#!/usr/bin/env node
/**
 * Sprint 25 — Team Resolution Readiness Check
 *
 * Reads seeded PSL teams from the DB (via API) and compares them against
 * a list of known canonical Parse PSL team names to identify any that would
 * fail resolution during fixture import.
 *
 * This is a READ-ONLY diagnostic. No fixture writes. No PSL activation.
 *
 * Usage:
 *   BASE_URL=http://api:4000 ADMIN_TOKEN=<jwt> node sprint-25-team-resolution-readiness.mjs
 *
 * SECURITY: Read-only. No fixture writes. No PSL activation.
 */

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:4000';
const ADMIN_TOKEN = process.env['ADMIN_TOKEN'] ?? '';

// Canonical PSL club names as used on psl.co.za / Parse
// These are the 16 clubs seeded in STORY-26 (Sprint 3)
const EXPECTED_PSL_CLUBS = [
  'Kaizer Chiefs',
  'Orlando Pirates',
  'Mamelodi Sundowns',
  'SuperSport United',
  'Stellenbosch FC',
  'Cape Town City',
  'Chippa United',
  'TS Galaxy',
  'Polokwane City',
  'Sekhukhune United',
  'Swallows FC',
  'Richards Bay',
  'Golden Arrows',
  'Moroka Swallows',
  'AmaZulu FC',
  'Cape Town Spurs',
];

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

async function apiCall(path, method = 'GET', body = undefined) {
  const headers = { 'Content-Type': 'application/json' };
  if (ADMIN_TOKEN) headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json };
}

function normalise(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

console.log('=== Sprint 25 — Team Resolution Readiness Check ===');
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`ADMIN_TOKEN present: ${!!ADMIN_TOKEN}`);
console.log('Mode: READ-ONLY — no fixture writes, no PSL activation\n');

if (!ADMIN_TOKEN) {
  fail('Auth check', 'ADMIN_TOKEN not set');
  console.log('\nTEAM_RESOLUTION_AUTH_REQUIRED');
  process.exit(2);
}

// 1. API health
const health = await apiCall('/health');
if (health.status !== 200) {
  fail('API health', `HTTP ${health.status}`);
  process.exit(1);
}
pass('API health', `HTTP ${health.status}`);

// 2. Load seeded clubs
console.log('\n[ Seeded PSL clubs ]\n');

const teamsRes = await apiCall('/clubs');
if (teamsRes.status !== 200) {
  fail('Load clubs', `HTTP ${teamsRes.status}`);
  console.log('\nTEAM_RESOLUTION_CLUBS_UNAVAILABLE');
  process.exit(1);
}

const clubs = teamsRes.json?.clubs ?? teamsRes.json?.data ?? teamsRes.json ?? [];
const clubArr = Array.isArray(clubs) ? clubs : [];

if (clubArr.length === 0) {
  fail('Load clubs', 'No clubs found in DB — seed may not have run');
  console.log('\nTEAM_RESOLUTION_NO_CLUBS_SEEDED');
  process.exit(1);
}

pass('Load clubs', `${clubArr.length} club(s) in DB`);

// Build normalised lookup
const clubNamesSeeded = clubArr.map(c => c.name ?? c.shortName ?? '').filter(Boolean);
const seededNormalised = new Set(clubNamesSeeded.map(normalise));

console.log('\n[ Team resolution matrix ]\n');
console.log(`${'Expected Name'.padEnd(30)} ${'Seeded'.padEnd(8)} Status`);
console.log('─'.repeat(60));

let matchCount = 0;
let missingCount = 0;
const missing = [];

for (const expected of EXPECTED_PSL_CLUBS) {
  const norm = normalise(expected);
  const found = seededNormalised.has(norm) ||
    clubNamesSeeded.some(s => normalise(s).includes(norm) || norm.includes(normalise(s)));

  if (found) {
    matchCount++;
    console.log(`  ${expected.padEnd(30)} YES      RESOLVED`);
  } else {
    missingCount++;
    missing.push(expected);
    console.log(`  ${expected.padEnd(30)} NO       UNRESOLVED`);
  }
}

console.log('─'.repeat(60));
console.log(`  Resolved: ${matchCount} / ${EXPECTED_PSL_CLUBS.length}`);

// 3. Verdict
console.log('');
if (missingCount === 0) {
  pass('Team resolution', `All ${matchCount} expected PSL clubs found in DB`);
  console.log('\n────────────────────────────────────────────────────────────');
  console.log('TEAM_RESOLUTION_READY');
  console.log('\nAll expected PSL clubs are seeded and will resolve correctly');
  console.log('during fixture import when fixtures become available.');
} else if (missingCount <= 2) {
  warn('Team resolution', `${missingCount} club(s) may not resolve: ${missing.join(', ')}`);
  console.log('\n────────────────────────────────────────────────────────────');
  console.log('TEAM_RESOLUTION_WARNINGS');
  console.log(`\n${missingCount} club(s) may need name alias mapping before fixture import:`);
  for (const m of missing) console.log(`  - ${m}`);
  console.log('\nAction: Add alias entries to FixtureImportService.resolveTeam() before import write.');
} else {
  fail('Team resolution', `${missingCount} clubs unresolved`);
  console.log('\n────────────────────────────────────────────────────────────');
  console.log('TEAM_RESOLUTION_BLOCKED');
  console.log(`\n${missingCount} clubs would fail to resolve during fixture import.`);
  console.log('Action required before any fixture import write.');
}

const passCt = results.filter(r => r.status === 'PASS').length;
const failCt = results.filter(r => r.status === 'FAIL').length;
const warnCt = results.filter(r => r.status === 'WARN').length;
console.log(`\nPASS: ${passCt} | FAIL: ${failCt} | WARN: ${warnCt}`);
console.log('\nSECURITY: Read-only. No fixture writes. No PSL activation.');

process.exit(failCt > 0 ? 1 : 0);
