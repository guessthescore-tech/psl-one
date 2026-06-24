#!/usr/bin/env node
/**
 * Sprint 38A — World Cup Squad Discovery Tool
 *
 * Discovers WC 2026 squad (players per team) from the configured
 * data provider. Dry-run preview only — no DB writes.
 *
 * Usage:
 *   ADMIN_TOKEN=<jwt> TEAM_ID=<external-team-id> node tools/staging/sprint-38a-world-cup-squad-import.mjs
 *   ADMIN_TOKEN=<jwt> TEAM_ID=758 node tools/staging/sprint-38a-world-cup-squad-import.mjs
 *   (758 = Brazil on football-data.org)
 *
 * Safety: read-only discovery, no PSL activation, no real money.
 * Admin JWT was NOT printed and is not logged by this tool.
 */

const ADMIN_TOKEN = process.env['ADMIN_TOKEN'];
const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';
const TEAM_ID = process.env['TEAM_ID'];

if (!ADMIN_TOKEN) {
  console.error('[WC_SQUAD_IMPORT] ERROR: ADMIN_TOKEN env var required');
  process.exit(1);
}

if (!TEAM_ID) {
  console.log('[WC_SQUAD_IMPORT] INFO: No TEAM_ID set — checking provider health and season list instead');
  console.log('  Usage: ADMIN_TOKEN=<jwt> TEAM_ID=<external-id> node tools/staging/sprint-38a-world-cup-squad-import.mjs');
  console.log('  Example: TEAM_ID=758 (Brazil on football-data.org)');
}

console.log('[WC_SQUAD_IMPORT] Discovering WC 2026 squad data...');
console.log(`[WC_SQUAD_IMPORT] API: ${API_URL}`);
console.log('[WC_SQUAD_IMPORT] Admin JWT: [redacted]');

async function run() {
  if (!TEAM_ID) {
    // Fallback to seasons discovery to list teams
    const seasonsRes = await fetch(`${API_URL}/admin/data-provider/discovery/seasons`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    if (!seasonsRes.ok) {
      console.error(`[WC_SQUAD_IMPORT] FAIL: seasons check ${seasonsRes.status}`);
      process.exit(1);
    }
    const seasons = await seasonsRes.json();
    const list = Array.isArray(seasons) ? seasons : [];
    console.log(`\n=== AVAILABLE SEASONS (${list.length}) ===`);
    list.forEach(s => console.log(`  ${s.externalId} — ${s.name}`));
    console.log('\n[WC_SQUAD_IMPORT] Set TEAM_ID=<external-id> and re-run to discover squad.');
    return;
  }

  const res = await fetch(
    `${API_URL}/admin/data-provider/discovery/players/${encodeURIComponent(TEAM_ID)}`,
    { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } },
  ).catch(() => null);

  // Many APIs don't expose a dedicated /players/:teamId endpoint — handle gracefully
  if (!res || !res.ok) {
    console.log(`[WC_SQUAD_IMPORT] INFO: Players endpoint returned ${res?.status ?? 'no response'}`);
    console.log('[WC_SQUAD_IMPORT] Note: Squad discovery depends on provider API plan tier');
    console.log(`  football-data.org: GET /v4/teams/${TEAM_ID}/squad`);
    console.log(`  SportRadar: GET /competitors/${TEAM_ID}/profile.json`);
    console.log('[WC_SQUAD_IMPORT] STATUS: SQUAD_ENDPOINT_UNAVAILABLE — use provider direct API to verify');
    return;
  }

  const players = await res.json();
  const list = Array.isArray(players) ? players : [];

  console.log(`\n=== WC SQUAD for teamExternalId=${TEAM_ID}: ${list.length} players ===`);
  list.forEach((p, i) => {
    console.log(`  ${String(i + 1).padStart(2)}.  ${p.name ?? 'Unknown'} [${p.position ?? '?'}] (externalId: ${p.externalId ?? '?'})`);
  });

  console.log('\n[WC_SQUAD_IMPORT] MODE: DRY-RUN (preview only — no DB writes)');
  console.log(`[WC_SQUAD_IMPORT] STATUS: ${list.length > 0 ? 'SQUAD_AVAILABLE' : 'NO_PLAYERS_FOUND'}`);
}

run().catch(err => {
  console.error('[WC_SQUAD_IMPORT] FATAL:', err.message);
  process.exit(1);
});
