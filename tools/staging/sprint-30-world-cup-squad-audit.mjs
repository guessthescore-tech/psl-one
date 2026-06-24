#!/usr/bin/env node
/**
 * Sprint 30 — World Cup 2026 Squad Completeness Audit
 *
 * PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | DRY READ ONLY
 *
 * Queries the API to report player pool completeness per WC team.
 * Never modifies data. Never calls external APIs.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 \
 *   PSL_ADMIN_TOKEN=<token> \
 *   node tools/staging/sprint-30-world-cup-squad-audit.mjs
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const PSL_ADMIN_TOKEN = process.env.PSL_ADMIN_TOKEN ?? '';

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Sprint 30 — World Cup 2026 Squad Completeness Audit');
console.log('  PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | DRY READ');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`  BASE_URL : ${BASE_URL}`);
console.log(`  ADMIN    : ${PSL_ADMIN_TOKEN ? '[SET]' : '[MISSING]'}`);
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

if (!PSL_ADMIN_TOKEN) {
  console.log('⚠️  PSL_ADMIN_TOKEN not set. Cannot query admin endpoints.');
  process.exit(1);
}

async function get(path) {
  const r = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${PSL_ADMIN_TOKEN}` },
  });
  if (!r.ok) return { error: r.status };
  return r.json();
}

try {
  console.log('Fetching team data...');
  const teamsRes = await get('/admin/teams?limit=100&offset=0');
  if (teamsRes.error) {
    console.log(`❌ Failed to fetch teams: HTTP ${teamsRes.error}`);
    process.exit(1);
  }

  const teams = Array.isArray(teamsRes) ? teamsRes : teamsRes.data ?? teamsRes.teams ?? [];
  console.log(`Found ${teams.length} teams total.`);
  console.log('');
  console.log('Fetching player data...');
  const playersRes = await get('/admin/players?limit=500&offset=0');
  if (playersRes.error) {
    console.log(`❌ Failed to fetch players: HTTP ${playersRes.error}`);
    process.exit(1);
  }

  const players = Array.isArray(playersRes) ? playersRes : playersRes.data ?? playersRes.players ?? [];
  console.log(`Found ${players.length} players total.`);
  console.log('');

  // Group players by teamId
  const byTeam = {};
  for (const p of players) {
    const tid = p.teamId ?? p.team?.id ?? 'NO_TEAM';
    byTeam[tid] = (byTeam[tid] ?? []);
    byTeam[tid].push(p);
  }

  const byPosition = { GOALKEEPER: 0, DEFENDER: 0, MIDFIELDER: 0, FORWARD: 0, UNKNOWN: 0 };
  for (const p of players) {
    const pos = p.position ?? 'UNKNOWN';
    byPosition[pos] = (byPosition[pos] ?? 0) + 1;
  }

  // Categorise teams
  let completeTeams = 0;
  let partialTeams = 0;
  let emptyTeams = 0;

  console.log('── Per-Team Squad Completeness ───────────────────────────────');
  console.log('  Status    Players  Team');
  console.log('  ──────────────────────────────────────────────────────────');

  for (const team of teams.slice(0, 48)) {
    const pid = team.id;
    const teamPlayers = byTeam[pid] ?? [];
    const count = teamPlayers.length;
    let status;
    if (count >= 23) { status = '✅ COMPLETE'; completeTeams++; }
    else if (count >= 8) { status = '⚠️ PARTIAL '; partialTeams++; }
    else { status = '❌ EMPTY   '; emptyTeams++; }
    console.log(`  ${status}  ${String(count).padStart(3)}      ${team.name ?? team.slug ?? pid}`);
  }

  console.log('');
  console.log('── Summary ───────────────────────────────────────────────────');
  console.log(`  Complete teams (23+)   : ${completeTeams}`);
  console.log(`  Partial teams (8-22)   : ${partialTeams}`);
  console.log(`  Empty/thin teams (0-7) : ${emptyTeams}`);
  console.log('');
  console.log('── Player Pool by Position ───────────────────────────────────');
  for (const [pos, count] of Object.entries(byPosition)) {
    if (count > 0) console.log(`  ${pos.padEnd(12)}: ${count}`);
  }
  console.log(`  ${'TOTAL'.padEnd(12)}: ${players.length}`);
  console.log('');

  const target = 1104; // 48 × 23 minimum
  const pct = Math.round((players.length / target) * 100);
  if (players.length >= target) {
    console.log(`✅ SQUAD_POOL_COMPLETE — ${players.length} players ≥ ${target} target`);
  } else {
    console.log(`⚠️  SQUAD_POOL_PARTIAL — ${players.length}/${target} (${pct}%) — ${target - players.length} more needed`);
    console.log('   See SPRINT-30-WORLD-CUP-SQUAD-READINESS.md for resolution paths.');
  }

  if (players.some((p) => !p.position)) {
    const missing = players.filter((p) => !p.position).length;
    console.log(`ℹ️  ${missing} players have no position assigned — review at /admin/players`);
  }
} catch (e) {
  console.error('❌ Unexpected error:', e.message);
  process.exit(1);
}

console.log('');
console.log('PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | BETA ONLY');
console.log('');
