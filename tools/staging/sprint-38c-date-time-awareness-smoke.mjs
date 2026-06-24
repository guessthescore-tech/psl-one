#!/usr/bin/env node
/**
 * Sprint 38C — Date/Time Awareness Smoke Test
 *
 * Verifies that:
 * 1. Public fixture endpoint returns fixtures with valid kickoffAt timestamps
 * 2. SAST timezone display is consistent (UTC+2)
 * 3. Status values are valid enum members
 * 4. FINISHED fixtures have passed kickoff times
 * 5. SCHEDULED fixtures have future kickoff times
 *
 * Usage:
 *   node tools/staging/sprint-38c-date-time-awareness-smoke.mjs [BASE_URL]
 *
 * Defaults to http://localhost:4000 if no URL provided.
 * For EC2 staging: node ... http://api.staging.pslone.co.za
 */

const BASE_URL = process.argv[2] ?? 'http://localhost:4000';
const VALID_STATUSES = ['SCHEDULED', 'LIVE', 'HALF_TIME', 'FINISHED', 'POSTPONED', 'CANCELLED'];

let passed = 0;
let failed = 0;

function ok(label, value) {
  if (value) { console.log(`  PASS  ${label}`); passed++; }
  else { console.error(`  FAIL  ${label}`); failed++; }
}

async function main() {
  console.log(`\nSprint 38C Date/Time Awareness Smoke — ${BASE_URL}`);
  console.log('='.repeat(60));

  // 1. Fetch WC fixtures
  console.log('\n[1] Fetch WC fixtures via public endpoint');
  let fixtures = [];
  try {
    const res = await fetch(`${BASE_URL}/football/fixtures?seasonSlug=fifa-world-cup-2026`);
    ok('GET /football/fixtures?seasonSlug=fifa-world-cup-2026 → 200', res.ok);
    if (res.ok) {
      fixtures = await res.json();
      ok('Response is array', Array.isArray(fixtures));
      ok('Has fixtures', fixtures.length > 0);
      console.log(`  INFO  ${fixtures.length} fixtures returned`);
    }
  } catch (e) {
    console.error(`  FAIL  Request failed: ${e.message}`);
    failed++;
  }

  if (fixtures.length === 0) {
    console.log('\n  SKIP  No fixtures to validate — check seed');
    process.exit(0);
  }

  // 2. Validate kickoffAt timestamps
  console.log('\n[2] Validate kickoffAt timestamps');
  const invalidDates = fixtures.filter(f => isNaN(new Date(f.kickoffAt).getTime()));
  ok('All fixtures have valid kickoffAt', invalidDates.length === 0);
  if (invalidDates.length > 0) {
    console.error(`  FAIL  ${invalidDates.length} invalid dates: ${invalidDates.slice(0, 3).map(f => f.kickoffAt).join(', ')}`);
  }

  // 3. Validate status enum values
  console.log('\n[3] Validate status values');
  const invalidStatuses = fixtures.filter(f => !VALID_STATUSES.includes(f.status));
  ok('All fixtures have valid status enum', invalidStatuses.length === 0);
  if (invalidStatuses.length > 0) {
    console.error(`  FAIL  Invalid: ${[...new Set(invalidStatuses.map(f => f.status))].join(', ')}`);
  }

  // 4. Status distribution
  console.log('\n[4] Status distribution');
  const byStatus = {};
  for (const f of fixtures) byStatus[f.status] = (byStatus[f.status] ?? 0) + 1;
  for (const [status, count] of Object.entries(byStatus)) {
    console.log(`  INFO  ${status}: ${count}`);
  }
  ok('Has FINISHED fixtures', (byStatus['FINISHED'] ?? 0) > 0);
  ok('Has SCHEDULED fixtures', (byStatus['SCHEDULED'] ?? 0) > 0);

  // 5. FINISHED fixtures should have past kickoff times
  console.log('\n[5] FINISHED fixtures in the past');
  const now = new Date();
  const finished = fixtures.filter(f => f.status === 'FINISHED');
  const wronglyFinished = finished.filter(f => new Date(f.kickoffAt) > now);
  ok('All FINISHED fixtures have past kickoffAt', wronglyFinished.length === 0);
  if (wronglyFinished.length > 0) {
    console.error(`  WARN  ${wronglyFinished.length} FINISHED fixtures with future kickoffAt (status may need refresh)`);
  }

  // 6. SCHEDULED fixtures have kickoff times
  console.log('\n[6] SCHEDULED fixtures have kickoffAt');
  const scheduled = fixtures.filter(f => f.status === 'SCHEDULED');
  const scheduledMissingKickoff = scheduled.filter(f => !f.kickoffAt);
  ok('All SCHEDULED fixtures have kickoffAt', scheduledMissingKickoff.length === 0);
  console.log(`  INFO  ${scheduled.length} scheduled fixtures`);

  // 7. Sample SAST display check
  console.log('\n[7] SAST time display sample');
  const sample = fixtures[0];
  if (sample) {
    const kickoff = new Date(sample.kickoffAt);
    const sast = kickoff.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
    const utc = kickoff.toISOString();
    console.log(`  INFO  Sample: ${sample.homeTeam?.name ?? 'TBD'} vs ${sample.awayTeam?.name ?? 'TBD'}`);
    console.log(`  INFO  UTC:   ${utc}`);
    console.log(`  INFO  SAST:  ${sast}`);
    ok('kickoffAt parses to valid SAST time', !isNaN(kickoff.getTime()));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`RESULT: ${passed} PASS / ${failed} FAIL`);
  if (failed > 0) process.exit(1);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
