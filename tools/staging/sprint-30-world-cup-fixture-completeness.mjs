#!/usr/bin/env node
/**
 * Sprint 30 — World Cup Fixture Completeness Audit
 *
 * PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | BETA ONLY
 *
 * Queries the API to report WC2026 fixture data completeness.
 * Never modifies data. Never calls external APIs. Dry-read only.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 \
 *   PSL_ADMIN_TOKEN=<token> \
 *   node tools/staging/sprint-30-world-cup-fixture-completeness.mjs
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const PSL_ADMIN_TOKEN = process.env.PSL_ADMIN_TOKEN ?? '';

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Sprint 30 — World Cup 2026 Fixture Completeness Audit');
console.log('  PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | DRY READ');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`  BASE_URL : ${BASE_URL}`);
console.log(`  ADMIN    : ${PSL_ADMIN_TOKEN ? '[SET]' : '[MISSING — set PSL_ADMIN_TOKEN]'}`);
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

if (!PSL_ADMIN_TOKEN) {
  console.log('⚠️  PSL_ADMIN_TOKEN not set. Cannot query admin endpoints.');
  console.log('   Obtain token via admin provisioning runbook.');
  console.log('   Re-run with: PSL_ADMIN_TOKEN=<token> node tools/staging/sprint-30-world-cup-fixture-completeness.mjs');
  process.exit(1);
}

async function get(path) {
  const r = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${PSL_ADMIN_TOKEN}`, 'Content-Type': 'application/json' },
  });
  if (!r.ok) return { error: r.status, body: await r.text().catch(() => '') };
  return r.json();
}

const counts = {
  SCHEDULED: 0,
  LIVE: 0,
  FINISHED: 0,
  POSTPONED: 0,
  CANCELLED: 0,
  unknown: 0,
};

let totalFixtures = 0;
let withTeams = 0;
let withKickoff = 0;
let withVenue = 0;
let published = 0;

try {
  console.log('Fetching fixture data...');

  const fixtureRes = await get('/admin/fixtures?limit=200&offset=0');

  if (fixtureRes.error) {
    console.log(`❌ Failed to fetch fixtures: HTTP ${fixtureRes.error}`);
    console.log('   Check that the API is running and your token is valid.');
    process.exit(1);
  }

  const fixtures = fixtureRes.data ?? fixtureRes.fixtures ?? fixtureRes ?? [];
  const fixtureList = Array.isArray(fixtures) ? fixtures : [];

  totalFixtures = fixtureList.length;

  for (const f of fixtureList) {
    const status = f.status ?? 'unknown';
    if (counts[status] !== undefined) counts[status]++;
    else counts.unknown++;

    if (f.homeTeamId && f.awayTeamId) withTeams++;
    if (f.kickoffAt) withKickoff++;
    if (f.venueId) withVenue++;
    if (f.isPublished) published++;
  }

  const wc2026 = fixtureList.filter(
    (f) =>
      (f.competition?.name ?? '').toLowerCase().includes('world') ||
      (f.competition?.slug ?? '').toLowerCase().includes('wc') ||
      (f.round ?? '').toLowerCase().includes('group'),
  );

  console.log('');
  console.log('── Fixture Counts ────────────────────────────────────────────');
  console.log(`  Total fixtures in DB  : ${totalFixtures}`);
  console.log(`  WC-related (estimate) : ${wc2026.length}`);
  console.log('');
  console.log('── By Status ─────────────────────────────────────────────────');
  for (const [status, count] of Object.entries(counts)) {
    if (count > 0) console.log(`  ${status.padEnd(15)}: ${count}`);
  }
  console.log('');
  console.log('── Field Completeness ────────────────────────────────────────');
  const pct = (n) => totalFixtures > 0 ? `${Math.round((n / totalFixtures) * 100)}%` : 'N/A';
  console.log(`  With both teams  : ${withTeams}  (${pct(withTeams)})`);
  console.log(`  With kickoff time: ${withKickoff}  (${pct(withKickoff)})`);
  console.log(`  With venue       : ${withVenue}  (${pct(withVenue)})`);
  console.log(`  Published        : ${published}  (${pct(published)})`);
  console.log('');

  const expectedWcFixtures = 104;
  const completeness = Math.min(100, Math.round((totalFixtures / expectedWcFixtures) * 100));

  if (totalFixtures >= expectedWcFixtures) {
    console.log(`✅ COMPLETE — ${totalFixtures} fixtures ≥ ${expectedWcFixtures} expected WC2026 fixtures`);
  } else if (totalFixtures >= expectedWcFixtures * 0.5) {
    console.log(`⚠️  PARTIAL  — ${totalFixtures} fixtures (${completeness}% of ${expectedWcFixtures} expected)`);
  } else {
    console.log(`❌ EMPTY/LOW — ${totalFixtures} fixtures (${completeness}% of ${expectedWcFixtures} expected)`);
  }

  if (published < totalFixtures) {
    console.log(`ℹ️  Note: ${totalFixtures - published} fixtures not yet published. Admin must publish before fan display.`);
  }
} catch (e) {
  console.error('❌ Unexpected error:', e.message);
  process.exit(1);
}

console.log('');
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | BETA ONLY');
console.log('');
