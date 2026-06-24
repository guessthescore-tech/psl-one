#!/usr/bin/env node
/**
 * Sprint 30 — Fantasy Player Pool Dry-Run Audit
 *
 * PSL INACTIVE | WALLET SANDBOX | POINTS_ONLY | NON-FINANCIAL | DRY READ
 *
 * Reports fantasy-eligible player pool completeness.
 * No real money. No wallet production. Points-only fantasy.
 * Never modifies data. Never calls external APIs.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 \
 *   PSL_ADMIN_TOKEN=<token> \
 *   node tools/staging/sprint-30-fantasy-player-pool-dry-run.mjs
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const PSL_ADMIN_TOKEN = process.env.PSL_ADMIN_TOKEN ?? '';

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Sprint 30 — Fantasy Player Pool Dry-Run Audit');
console.log('  POINTS_ONLY | NON-FINANCIAL | PSL INACTIVE | DRY READ');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`  BASE_URL : ${BASE_URL}`);
console.log(`  ADMIN    : ${PSL_ADMIN_TOKEN ? '[SET]' : '[MISSING]'}`);
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

if (!PSL_ADMIN_TOKEN) {
  console.log('⚠️  PSL_ADMIN_TOKEN not set.');
  process.exit(1);
}

async function get(path) {
  const r = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${PSL_ADMIN_TOKEN}` },
  });
  if (!r.ok) return { error: r.status };
  return r.json();
}

// Fantasy squad composition targets
const SQUAD_TEMPLATE = { GOALKEEPER: 2, DEFENDER: 5, MIDFIELDER: 5, FORWARD: 3 };
const TEAMS_NEEDED = 48;

try {
  console.log('Fetching player pool...');
  const res = await get('/admin/players?limit=500&offset=0');
  if (res.error) {
    console.log(`❌ Failed: HTTP ${res.error}`);
    process.exit(1);
  }

  const allPlayers = Array.isArray(res) ? res : res.data ?? res.players ?? [];

  // Fantasy eligibility: has position + has teamId (no explicit isEligible flag needed for beta)
  const eligible = allPlayers.filter((p) => p.position && p.teamId);
  const ineligible = allPlayers.filter((p) => !p.position || !p.teamId);

  const byPosition = {};
  const byTeam = {};
  const withPrice = [];
  const withoutPrice = [];

  for (const p of eligible) {
    const pos = p.position ?? 'UNKNOWN';
    byPosition[pos] = (byPosition[pos] ?? 0) + 1;

    const tid = p.teamId;
    byTeam[tid] = (byTeam[tid] ?? 0) + 1;

    if (p.currentPrice != null || p.priceDisplay != null) withPrice.push(p);
    else withoutPrice.push(p);
  }

  const teamsRepresented = Object.keys(byTeam).length;

  console.log('── Pool Overview ─────────────────────────────────────────────');
  console.log(`  Total players in DB      : ${allPlayers.length}`);
  console.log(`  Fantasy-eligible         : ${eligible.length}`);
  console.log(`  Not eligible (no pos/team): ${ineligible.length}`);
  console.log(`  With price set           : ${withPrice.length}`);
  console.log(`  Without price (flat TBD) : ${withoutPrice.length}`);
  console.log(`  Teams represented        : ${teamsRepresented} of ${TEAMS_NEEDED} needed`);
  console.log('');
  console.log('── By Position ───────────────────────────────────────────────');
  console.log('  Position      Count  Target (per 48 teams)  Status');
  console.log('  ───────────────────────────────────────────────────────────');

  const posTargets = {
    GOALKEEPER: 48 * 2,
    DEFENDER: 48 * 5,
    MIDFIELDER: 48 * 5,
    FORWARD: 48 * 3,
  };

  for (const [pos, target] of Object.entries(posTargets)) {
    const count = byPosition[pos] ?? 0;
    const pct = Math.round((count / target) * 100);
    const status = count >= target ? '✅ OK' : count >= target * 0.5 ? '⚠️ PARTIAL' : '❌ LOW';
    console.log(`  ${pos.padEnd(14)}${String(count).padStart(5)}  ${String(target).padStart(3)} (100%)             ${String(pct).padStart(3)}%  ${status}`);
  }

  console.log('');
  console.log('── Dry-Run: Fantasy Squad Creation Feasibility ───────────────');

  const minPerPos = { GOALKEEPER: 1, DEFENDER: 3, MIDFIELDER: 3, FORWARD: 1 };
  let canBuildSquad = true;

  for (const [pos, minNeeded] of Object.entries(minPerPos)) {
    const available = byPosition[pos] ?? 0;
    if (available < minNeeded) {
      console.log(`  ❌ Cannot build squad: need ${minNeeded} ${pos} min, have ${available}`);
      canBuildSquad = false;
    }
  }

  if (canBuildSquad) {
    console.log('  ✅ Minimum squad can be built (1 GK + 3 DEF + 3 MID + 1 FWD)');
    console.log('  ⚠️  Player pool is thin — limited team/player variety for users');
  }

  console.log('');
  console.log('── Recommendation ────────────────────────────────────────────');
  if (eligible.length >= 1104) {
    console.log('  ✅ POOL_COMPLETE — full WC player pool available');
  } else {
    const needed = 1104 - eligible.length;
    console.log(`  ⚠️  POOL_PARTIAL — ${needed} more players needed for full WC pool`);
    console.log('  → Owner gate: see SPRINT-30-WORLD-CUP-SQUAD-READINESS.md');
    console.log('  → Path A: Manual CSV upload via /admin/squad-import/batch');
    console.log('  → Path B: Owner procures API-Football key for bulk import');
  }
} catch (e) {
  console.error('❌ Unexpected error:', e.message);
  process.exit(1);
}

console.log('');
console.log('POINTS_ONLY | NON_FINANCIAL | PSL INACTIVE | WALLET SANDBOX | DRY READ');
console.log('');
