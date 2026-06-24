#!/usr/bin/env node
/**
 * Sprint 38A — World Cup Team Discovery Tool
 *
 * Calls the discovery endpoint to preview WC 2026 teams available
 * from the configured data provider. Dry-run only — no DB writes.
 *
 * Usage:
 *   ADMIN_TOKEN=<jwt> node tools/staging/sprint-38a-world-cup-team-import.mjs
 *   ADMIN_TOKEN=<jwt> SEASON_ID=<wc-season-external-id> node tools/staging/sprint-38a-world-cup-team-import.mjs
 *
 * Safety: read-only discovery, no PSL activation, no real money.
 * Admin JWT was NOT printed and is not logged by this tool.
 */

const ADMIN_TOKEN = process.env['ADMIN_TOKEN'];
const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';
const SEASON_ID = process.env['SEASON_ID'] ?? 'WC';

if (!ADMIN_TOKEN) {
  console.error('[WC_TEAM_IMPORT] ERROR: ADMIN_TOKEN env var required');
  process.exit(1);
}

console.log('[WC_TEAM_IMPORT] Discovering WC 2026 teams via provider...');
console.log(`[WC_TEAM_IMPORT] API: ${API_URL}`);
console.log(`[WC_TEAM_IMPORT] Season/Competition code: ${SEASON_ID}`);
console.log('[WC_TEAM_IMPORT] Admin JWT: [redacted]');

async function run() {
  // First check readiness
  const readinessRes = await fetch(`${API_URL}/admin/data-provider/world-cup-live-readiness`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  if (!readinessRes.ok) {
    console.error(`[WC_TEAM_IMPORT] FAIL: readiness check ${readinessRes.status}`);
    process.exit(1);
  }
  const readiness = await readinessRes.json();
  console.log(`[WC_TEAM_IMPORT] Primary provider: ${readiness.primaryProvider}`);
  if (!readiness.importReadiness?.dryRunEligible) {
    console.error('[WC_TEAM_IMPORT] BLOCKED: No WC provider configured. Set FOOTBALL_DATA_API_KEY or SPORTSRADAR_SOCCER_API_KEY.');
    process.exit(1);
  }

  // Discover teams
  const teamsRes = await fetch(`${API_URL}/admin/data-provider/discovery/teams/${encodeURIComponent(SEASON_ID)}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });

  if (teamsRes.status === 401) { console.error('[WC_TEAM_IMPORT] FAIL: 401 Unauthorized'); process.exit(1); }
  if (teamsRes.status === 403) { console.error('[WC_TEAM_IMPORT] FAIL: 403 Forbidden'); process.exit(1); }

  if (!teamsRes.ok) {
    const body = await teamsRes.text();
    console.log(`[WC_TEAM_IMPORT] INFO: ${teamsRes.status} — ${body.slice(0, 200)}`);
    console.log('[WC_TEAM_IMPORT] STATUS: PROVIDER_NO_RESPONSE — may be SOURCE_EMPTY or trial key limitations');
    process.exit(0);
  }

  const teams = await teamsRes.json();
  const list = Array.isArray(teams) ? teams : [];

  console.log(`\n=== WC 2026 TEAMS DISCOVERED: ${list.length} ===`);
  list.slice(0, 32).forEach((t, i) => {
    console.log(`  ${String(i + 1).padStart(2)}.  ${t.name ?? 'Unknown'} [${t.externalId ?? '?'}] (${t.countryCode ?? '?'})`);
  });
  if (list.length > 32) console.log(`  ... and ${list.length - 32} more`);

  console.log('\n[WC_TEAM_IMPORT] MODE: DRY-RUN (discovery only — no DB writes)');
  console.log('  Teams displayed above are provider candidates only.');
  console.log('  To persist teams to DB, use the admin import UI or extend this tool.');
  console.log(`\n[WC_TEAM_IMPORT] STATUS: ${list.length > 0 ? 'TEAMS_AVAILABLE' : 'NO_TEAMS_FOUND'}`);
}

run().catch(err => {
  console.error('[WC_TEAM_IMPORT] FATAL:', err.message);
  process.exit(1);
});
