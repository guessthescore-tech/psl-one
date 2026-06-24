#!/usr/bin/env node
/**
 * Sprint 38A — World Cup Fixture Import Tool
 *
 * Dry-run by default — previews WC 2026 fixtures from football-data.org
 * without writing to the database.
 *
 * Usage (dry-run):
 *   ADMIN_TOKEN=<jwt> node tools/staging/sprint-38a-world-cup-fixture-import.mjs
 *   ADMIN_TOKEN=<jwt> node tools/staging/sprint-38a-world-cup-fixture-import.mjs --dry-run
 *
 * Usage (write — requires BOTH safety flags):
 *   ALLOW_WORLD_CUP_WRITE=true \
 *   CONFIRM_WORLD_CUP_WRITE=IMPORT_WORLD_CUP_BETA \
 *   ADMIN_TOKEN=<jwt> \
 *   node tools/staging/sprint-38a-world-cup-fixture-import.mjs --write
 *
 * Safety: no PSL activation, no real money, no scheduled ingestion.
 * Admin JWT was NOT printed and is not logged by this tool.
 * Write mode blocked without both env flag AND request body confirmation.
 */

const ADMIN_TOKEN = process.env['ADMIN_TOKEN'];
const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';
const ALLOW_WC_WRITE = process.env['ALLOW_WORLD_CUP_WRITE'] === 'true';
const CONFIRM_WC_WRITE = process.env['CONFIRM_WORLD_CUP_WRITE'];
const CONFIRM_VALUE = 'IMPORT_WORLD_CUP_BETA';

const isWriteMode = process.argv.includes('--write');

if (!ADMIN_TOKEN) {
  console.error('[WC_FIXTURE_IMPORT] ERROR: ADMIN_TOKEN env var required');
  process.exit(1);
}

if (isWriteMode) {
  if (!ALLOW_WC_WRITE) {
    console.error('[WC_FIXTURE_IMPORT] ERROR: Write mode requires ALLOW_WORLD_CUP_WRITE=true');
    console.error('  Add ALLOW_WORLD_CUP_WRITE=true to your environment before running --write');
    process.exit(1);
  }
  if (CONFIRM_WC_WRITE !== CONFIRM_VALUE) {
    console.error(`[WC_FIXTURE_IMPORT] ERROR: Write mode requires CONFIRM_WORLD_CUP_WRITE=${CONFIRM_VALUE}`);
    process.exit(1);
  }
  console.log('[WC_FIXTURE_IMPORT] MODE: WRITE — fixtures will be imported to DB (isPublished=false)');
} else {
  console.log('[WC_FIXTURE_IMPORT] MODE: DRY-RUN — no DB writes');
}

console.log(`[WC_FIXTURE_IMPORT] API: ${API_URL}`);
console.log('[WC_FIXTURE_IMPORT] Admin JWT: [redacted]');

async function runImport() {
  const body = isWriteMode
    ? {
        dryRun: false,
        confirmWorldCupWrite: CONFIRM_VALUE,
        includeCandidates: true,
      }
    : { dryRun: true, includeCandidates: true };

  const res = await fetch(`${API_URL}/admin/data-provider/world-cup/fixtures/import`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) { console.error('[WC_FIXTURE_IMPORT] FAIL: 401 Unauthorized'); process.exit(1); }
  if (res.status === 403) { console.error('[WC_FIXTURE_IMPORT] FAIL: 403 Forbidden — PSL_ADMIN role required'); process.exit(1); }
  if (res.status === 400) {
    const err = await res.json().catch(() => ({}));
    console.error('[WC_FIXTURE_IMPORT] FAIL: 400 Bad Request —', err.message ?? JSON.stringify(err));
    process.exit(1);
  }
  if (!res.ok) { console.error(`[WC_FIXTURE_IMPORT] FAIL: HTTP ${res.status}`); process.exit(1); }

  const data = await res.json();

  console.log('\n=== WORLD CUP FIXTURE IMPORT RESULT ===');
  console.log(`Provider: ${data.provider}`);
  console.log(`Mode: ${data.dryRun ? 'DRY-RUN' : 'WRITE'}`);
  console.log(`Source status: ${data.sourceStatus}`);
  console.log(`Discovered: ${data.discovered}`);
  console.log(`Normalized: ${data.normalized}`);
  if (!data.dryRun) {
    console.log(`Created: ${data.created}`);
    console.log(`Updated: ${data.updated}`);
    console.log(`Skipped: ${data.skipped}`);
  }

  if (data.warnings?.length > 0) {
    console.log(`\nWarnings (${data.warnings.length}):`);
    data.warnings.slice(0, 5).forEach(w => console.log(`  ⚠️  ${w}`));
  }
  if (data.errors?.length > 0) {
    console.log(`\nErrors (${data.errors.length}):`);
    data.errors.slice(0, 5).forEach(e => console.log(`  ❌ ${e}`));
  }

  if (data.candidates?.length > 0) {
    console.log(`\nFixture Candidates (first 5 of ${data.candidates.length}):`);
    data.candidates.slice(0, 5).forEach(c => {
      const homeOk = c.teamResolution?.homeTeamMatched ? '✅' : '⚠️ ';
      const awayOk = c.teamResolution?.awayTeamMatched ? '✅' : '⚠️ ';
      console.log(`  ${homeOk} ${c.homeTeamName} vs ${awayOk} ${c.awayTeamName} [${c.kickoffAt}]`);
    });
  }

  console.log('\n--- Safety ---');
  const s = data.safety ?? {};
  console.log(`  No real money: ${s.noRealMoney}`);
  console.log(`  No PSL activation: ${s.noPslActivation}`);
  console.log(`  WC beta context: ${s.worldCupBetaContext}`);

  if (data.sourceStatus === 'SOURCE_AVAILABLE') {
    console.log(`\n[WC_FIXTURE_IMPORT] STATUS: ${data.dryRun ? 'DRY_RUN_COMPLETE' : 'IMPORT_COMPLETE'}`);
    if (data.dryRun) {
      console.log('  Next: Review candidates above, then run with --write flag (requires safety env vars)');
    }
  } else if (data.sourceStatus === 'SOURCE_EMPTY') {
    console.log('\n[WC_FIXTURE_IMPORT] STATUS: SOURCE_EMPTY — no fixtures available from provider');
  } else if (data.sourceStatus === 'AUTH_FAILED') {
    console.log('\n[WC_FIXTURE_IMPORT] STATUS: AUTH_FAILED — check FOOTBALL_DATA_API_KEY');
  } else {
    console.log(`\n[WC_FIXTURE_IMPORT] STATUS: ${data.sourceStatus}`);
  }
}

runImport().catch(err => {
  console.error('[WC_FIXTURE_IMPORT] FATAL:', err.message);
  process.exit(1);
});
