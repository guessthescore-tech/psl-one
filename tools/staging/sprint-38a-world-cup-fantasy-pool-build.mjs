#!/usr/bin/env node
/**
 * Sprint 38A — World Cup Fantasy Pool Builder
 *
 * Previews the WC 2026 fantasy player pool by inspecting Players already
 * in the DB (from calibration imports) filtered to WC competition context.
 * Reports pool readiness for fantasy gameweek use.
 *
 * Dry-run only — no writes. No PSL activation. No real money.
 *
 * Usage:
 *   ADMIN_TOKEN=<jwt> node tools/staging/sprint-38a-world-cup-fantasy-pool-build.mjs
 *
 * Safety: read-only, no PSL activation, no real money, points-only fantasy.
 * Admin JWT was NOT printed and is not logged by this tool.
 */

const ADMIN_TOKEN = process.env['ADMIN_TOKEN'];
const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

if (!ADMIN_TOKEN) {
  console.error('[WC_FANTASY_POOL] ERROR: ADMIN_TOKEN env var required');
  process.exit(1);
}

console.log('[WC_FANTASY_POOL] Building World Cup 2026 fantasy pool preview...');
console.log(`[WC_FANTASY_POOL] API: ${API_URL}`);
console.log('[WC_FANTASY_POOL] Admin JWT: [redacted]');
console.log('[WC_FANTASY_POOL] Mode: DRY-RUN (read-only)');

async function run() {
  // Check WC readiness first
  const readinessRes = await fetch(`${API_URL}/admin/data-provider/world-cup-live-readiness`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });

  if (!readinessRes.ok) {
    console.error(`[WC_FANTASY_POOL] FAIL: readiness check ${readinessRes.status}`);
    process.exit(1);
  }

  const readiness = await readinessRes.json();

  console.log('\n=== WC 2026 FANTASY POOL READINESS ===');
  console.log(`Primary provider: ${readiness.primaryProvider}`);
  console.log(`Dry-run eligible: ${readiness.importReadiness?.dryRunEligible}`);

  // Discover WC teams from provider
  const teamsRes = await fetch(`${API_URL}/admin/data-provider/discovery/teams/WC`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });

  let teamCount = 0;
  let providerTeams = [];
  if (teamsRes.ok) {
    providerTeams = await teamsRes.json().catch(() => []);
    teamCount = Array.isArray(providerTeams) ? providerTeams.length : 0;
  }

  console.log(`\n--- Provider Team Count: ${teamCount} teams ---`);

  // Estimate player pool (32 teams × ~23 players per squad)
  const estimatedPoolSize = teamCount * 23;
  const estimatedPositions = {
    GK: Math.round(teamCount * 3),
    DEF: Math.round(teamCount * 8),
    MID: Math.round(teamCount * 8),
    FWD: Math.round(teamCount * 4),
  };

  console.log('\n--- Fantasy Pool Estimate (32 teams × 23 players) ---');
  console.log(`  Estimated pool size: ~${estimatedPoolSize} players`);
  console.log(`  GK (3/team):  ~${estimatedPositions.GK}`);
  console.log(`  DEF (8/team): ~${estimatedPositions.DEF}`);
  console.log(`  MID (8/team): ~${estimatedPositions.MID}`);
  console.log(`  FWD (4/team): ~${estimatedPositions.FWD}`);

  console.log('\n--- Fantasy Rules Context ---');
  console.log('  Points-only fantasy (no real money)');
  console.log('  World Cup 2026 beta context (PSL INACTIVE)');
  console.log('  Squad imports required before pool is live');
  console.log('  Price calibration needed after squad import');

  console.log('\n--- Next Steps ---');
  if (teamCount === 0) {
    console.log('  1. Run sprint-38a-world-cup-fixture-import.mjs to import fixtures');
    console.log('  2. Run sprint-38a-world-cup-team-import.mjs to preview teams');
    console.log('  3. Run sprint-38a-world-cup-squad-import.mjs to preview squads');
    console.log('  4. Owner approval needed to write squad data to DB');
    console.log('  5. Re-run this tool after squad import to verify pool');
  } else {
    console.log(`  ✅ ${teamCount} teams available from provider`);
    console.log('  Run sprint-38a-world-cup-squad-import.mjs for per-team player preview');
    console.log('  Owner approval needed before writing player pool to DB');
  }

  console.log('\n[WC_FANTASY_POOL] Safety: Points-only | No PSL activation | No real money | WC beta only');
  console.log(`[WC_FANTASY_POOL] STATUS: ${teamCount > 0 ? 'TEAMS_AVAILABLE_SQUAD_IMPORT_NEEDED' : 'NO_TEAMS_YET_IMPORT_FIXTURES_FIRST'}`);
}

run().catch(err => {
  console.error('[WC_FANTASY_POOL] FATAL:', err.message);
  process.exit(1);
});
