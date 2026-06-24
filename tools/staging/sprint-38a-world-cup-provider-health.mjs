#!/usr/bin/env node
/**
 * Sprint 38A — World Cup Provider Health Check
 *
 * Calls GET /admin/data-provider/world-cup-live-readiness to check
 * which WC providers are configured and ready. No writes. No imports.
 *
 * Usage:
 *   ADMIN_TOKEN=<jwt> node tools/staging/sprint-38a-world-cup-provider-health.mjs
 *   ADMIN_TOKEN=<jwt> API_URL=http://localhost:3001 node tools/staging/sprint-38a-world-cup-provider-health.mjs
 *
 * Safety: read-only, no PSL activation, no imports, no real money.
 * Admin JWT was NOT printed and is not logged by this tool.
 */

const ADMIN_TOKEN = process.env['ADMIN_TOKEN'];
const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

if (!ADMIN_TOKEN) {
  console.error('[WORLD_CUP_HEALTH] ERROR: ADMIN_TOKEN env var required');
  console.error('  Usage: ADMIN_TOKEN=<jwt> node tools/staging/sprint-38a-world-cup-provider-health.mjs');
  process.exit(1);
}

console.log('[WORLD_CUP_HEALTH] Checking World Cup 2026 provider readiness...');
console.log(`[WORLD_CUP_HEALTH] API: ${API_URL}`);
console.log('[WORLD_CUP_HEALTH] Admin JWT: [redacted — not printed for security]');

async function checkReadiness() {
  const res = await fetch(`${API_URL}/admin/data-provider/world-cup-live-readiness`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });

  if (res.status === 401) {
    console.error('[WORLD_CUP_HEALTH] FAIL: 401 Unauthorized — check ADMIN_TOKEN');
    process.exit(1);
  }
  if (res.status === 403) {
    console.error('[WORLD_CUP_HEALTH] FAIL: 403 Forbidden — PSL_ADMIN role required');
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`[WORLD_CUP_HEALTH] FAIL: HTTP ${res.status}`);
    process.exit(1);
  }

  const data = await res.json();

  console.log('\n=== WORLD CUP 2026 PROVIDER READINESS ===');
  console.log(`Competition: ${data.competition}`);
  console.log(`WC Active Beta Context: ${data.worldCupActive}`);
  console.log(`Primary Provider: ${data.primaryProvider}`);
  console.log(`Fallback Chain: ${data.fallbackChain?.join(' → ')}`);

  console.log('\n--- Active Providers ---');
  const p = data.activeProviders ?? {};
  console.log(`  football-data.org: ${p.footballDataOrg?.status ?? 'UNKNOWN'}`);
  console.log(`  SportRadar Soccer: ${p.sportRadar?.status ?? 'UNKNOWN'}`);
  console.log(`  ScoreBat Widget:   ${p.scoreBat?.status ?? 'UNKNOWN'}`);

  console.log('\n--- Import Readiness ---');
  const ir = data.importReadiness ?? {};
  console.log(`  Dry-run eligible: ${ir.dryRunEligible}`);
  console.log(`  Write allowed by env flag: ${ir.writeImportAllowedByEnvFlag}`);
  console.log('  Write requires flags:');
  (ir.writeImportRequiresFlags ?? []).forEach(f => console.log(`    - ${f}`));

  console.log('\n--- Safety ---');
  const s = data.safety ?? {};
  console.log(`  No real money: ${s.noRealMoney}`);
  console.log(`  No PSL activation: ${s.noPslActivation}`);
  console.log(`  WC beta context: ${s.worldCupBetaContext}`);
  console.log(`  No scheduled ingestion: ${s.noScheduledIngestion}`);

  if (!ir.dryRunEligible) {
    console.log('\n[WORLD_CUP_HEALTH] STATUS: NO_PROVIDER_CONFIGURED');
    console.log('  Set FOOTBALL_DATA_API_KEY or SPORTSRADAR_SOCCER_API_KEY to enable dry-run');
    process.exit(0);
  }

  console.log('\n[WORLD_CUP_HEALTH] STATUS: READY_FOR_DRY_RUN');
  console.log('  Next: run sprint-38a-world-cup-fixture-import.mjs (dry-run)');
}

checkReadiness().catch(err => {
  console.error('[WORLD_CUP_HEALTH] FATAL:', err.message);
  process.exit(1);
});
