#!/usr/bin/env node
/**
 * Sprint 38A — World Cup GTS (Guess the Score) Card Builder
 *
 * Previews WC 2026 prediction markets / GTS cards that would be generated
 * from imported fixtures. Checks for eligible upcoming fixtures and
 * reports prediction card readiness.
 *
 * Dry-run only — no writes, no PSL activation, no real money.
 * GTS is points-only (no cash prizes, no wagers, no stakes).
 *
 * Usage:
 *   ADMIN_TOKEN=<jwt> node tools/staging/sprint-38a-world-cup-gts-card-build.mjs
 *
 * Admin JWT was NOT printed and is not logged by this tool.
 */

const ADMIN_TOKEN = process.env['ADMIN_TOKEN'];
const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

if (!ADMIN_TOKEN) {
  console.error('[WC_GTS_CARDS] ERROR: ADMIN_TOKEN env var required');
  process.exit(1);
}

console.log('[WC_GTS_CARDS] Building World Cup 2026 GTS card preview...');
console.log(`[WC_GTS_CARDS] API: ${API_URL}`);
console.log('[WC_GTS_CARDS] Admin JWT: [redacted]');
console.log('[WC_GTS_CARDS] Mode: DRY-RUN (read-only preview)');
console.log('[WC_GTS_CARDS] Type: POINTS-ONLY (no real money, no wagers, no cash prizes)');

async function run() {
  // Check WC readiness
  const readinessRes = await fetch(`${API_URL}/admin/data-provider/world-cup-live-readiness`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });

  if (!readinessRes.ok) {
    console.error(`[WC_GTS_CARDS] FAIL: readiness check ${readinessRes.status}`);
    process.exit(1);
  }

  const readiness = await readinessRes.json();

  console.log('\n=== WC 2026 GTS CARD READINESS ===');
  console.log(`Provider: ${readiness.primaryProvider}`);
  console.log(`WC active beta: ${readiness.worldCupActive}`);

  // Discover fixtures for GTS card generation
  const fixturesRes = await fetch(`${API_URL}/admin/data-provider/discovery/fixtures/WC`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });

  let fixtures = [];
  if (fixturesRes.ok) {
    const raw = await fixturesRes.json().catch(() => []);
    fixtures = Array.isArray(raw) ? raw : [];
  }

  const now = new Date();
  const upcoming = fixtures.filter(f => {
    const kickoff = new Date(f.kickoffAt ?? f.utcDate ?? '');
    return !isNaN(kickoff.getTime()) && kickoff > now;
  });
  const completed = fixtures.filter(f => {
    const s = (f.status ?? '').toUpperCase();
    return s === 'FINISHED' || s === 'CLOSED' || s === 'ENDED';
  });

  console.log(`\n--- Fixture Pool ---`);
  console.log(`  Total discovered: ${fixtures.length}`);
  console.log(`  Upcoming (GTS eligible): ${upcoming.length}`);
  console.log(`  Completed (GTS closed): ${completed.length}`);

  if (upcoming.length > 0) {
    console.log('\n--- Upcoming GTS Card Candidates (first 5) ---');
    upcoming.slice(0, 5).forEach((f, i) => {
      const kickoff = new Date(f.kickoffAt ?? f.utcDate ?? '');
      const dateStr = isNaN(kickoff.getTime()) ? 'TBD' : kickoff.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
      console.log(`  ${i + 1}. ${f.homeTeam?.name ?? f.homeTeamName ?? 'TBD'} vs ${f.awayTeam?.name ?? f.awayTeamName ?? 'TBD'} [${dateStr}]`);
    });
  }

  console.log('\n--- GTS Card Requirements ---');
  console.log('  1. Fixtures must be imported (isPublished=false after write import)');
  console.log('  2. Fixtures must be published (admin action, separate from PSL activation)');
  console.log('  3. PSL prediction config must allow WC competition (check PredictionRulesConfig)');
  console.log('  4. GTS lock time: kickoff - 30 min (default)');

  console.log('\n--- Points-Only Safety ---');
  console.log('  GTS = Guess the Score (points only)');
  console.log('  No cash prizes, no wagers, no stakes, no deposits, no withdrawals');
  console.log('  No betting or bookmaker mechanics');
  console.log('  No PSL activation required for WC GTS');
  console.log('  PSL INACTIVE');

  const status = upcoming.length > 0 ? 'FIXTURES_AVAILABLE_PUBLISH_REQUIRED' : 'NO_FIXTURES_IMPORT_REQUIRED';
  console.log(`\n[WC_GTS_CARDS] STATUS: ${status}`);

  if (upcoming.length === 0) {
    console.log('\nNext steps:');
    console.log('  1. Run sprint-38a-world-cup-fixture-import.mjs --dry-run to preview fixtures');
    console.log('  2. With owner approval: run --write mode to import fixtures');
    console.log('  3. Publish fixtures via admin UI');
    console.log('  4. GTS cards auto-generate for published, upcoming fixtures');
  } else {
    console.log(`\n✅ ${upcoming.length} upcoming fixtures ready for GTS card generation after publication`);
  }
}

run().catch(err => {
  console.error('[WC_GTS_CARDS] FATAL:', err.message);
  process.exit(1);
});
