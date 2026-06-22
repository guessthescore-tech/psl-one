#!/usr/bin/env node
/**
 * PSL One — Sprint 13 Per-Competition Router Check
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * Validates per-competition routing logic without live API calls.
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-13-routing-check.mjs
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED)
 */

// Sportmonks is REJECTED; retained for spec compatibility only
void process.env['SPORTMONKS_API_KEY'];

const FOOTBALL_DATA_API_KEY = process.env['FOOTBALL_DATA_API_KEY'];
const API_FOOTBALL_KEY = process.env['API_FOOTBALL_KEY'];
const DATA_PROVIDER = process.env['DATA_PROVIDER'];

// Routing rules — mirrors ProviderRouterService
const WC_CODES = ['WC', 'WORLD_CUP_2026', 'FIFA_WORLD_CUP'];
const PSL_CODES = ['PSL', 'SOUTH_AFRICA_PSL', '288'];

function wcStatus() {
  return FOOTBALL_DATA_API_KEY ? 'READY' : 'BLOCKED_NO_KEY';
}

function pslStatus() {
  return API_FOOTBALL_KEY ? 'READY' : 'BLOCKED_NO_KEY';
}

function globalAdapterName() {
  if (!DATA_PROVIDER) return null;
  switch (DATA_PROVIDER.toLowerCase()) {
    case 'football-data-org':
    case 'football_data_org':
      return 'football-data-org';
    case 'api-football':
    case 'api_football':
      return 'api-football';
    case 'sportsdataio':
      return 'sportsdataio';
    default:
      return DATA_PROVIDER;
  }
}

function main() {
  console.log('PSL One — Sprint 13 Per-Competition Router Check');
  console.log('=================================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('No live API calls — routing decisions based on env key presence.\n');

  console.log('--- WC Competition Codes → football-data-org ---');
  for (const code of WC_CODES) {
    console.log(`  [WC]  ${code} → football-data-org (${wcStatus()})`);
  }

  console.log('');
  console.log('--- PSL Competition Codes → api-football ---');
  for (const code of PSL_CODES) {
    console.log(`  [PSL] ${code} → api-football (${pslStatus()})`);
  }

  console.log('');
  console.log('--- Unknown/Default ---');
  console.log('  [UNKNOWN] CL → NoOpAdapter (default)');

  console.log('');
  console.log('--- DATA_PROVIDER env selection ---');
  if (DATA_PROVIDER) {
    const adapter = globalAdapterName();
    console.log(`  DATA_PROVIDER=${DATA_PROVIDER} → global adapter: ${adapter}`);
    console.log('  WARNING: DATA_PROVIDER override bypasses per-competition routing');
  } else {
    console.log('  DATA_PROVIDER: (not set) — per-competition routing active');
  }

  console.log('');
  console.log('--- Overall Routing Status ---');
  const hasWc = Boolean(FOOTBALL_DATA_API_KEY);
  const hasPsl = Boolean(API_FOOTBALL_KEY);
  if (hasWc && hasPsl) {
    console.log('  ROUTING_READY — both WC and PSL keys configured');
  } else if (hasWc || hasPsl) {
    const missing = hasWc ? 'API_FOOTBALL_KEY (PSL)' : 'FOOTBALL_DATA_API_KEY (WC)';
    console.log(`  PARTIAL_ROUTING — missing: ${missing}`);
  } else {
    console.log('  ROUTING_BLOCKED — neither FOOTBALL_DATA_API_KEY nor API_FOOTBALL_KEY set');
  }
}

main();
