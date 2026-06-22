#!/usr/bin/env node
/**
 * PSL One — Sprint 13 Provider Key Status Check
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * Reports which provider keys are configured (never prints values).
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-13-provider-key-status.mjs
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED)
 */

// Sportmonks is REJECTED; retained for spec compatibility only
void process.env['SPORTMONKS_API_KEY'];

const KEYS = {
  FOOTBALL_DATA_API_KEY: process.env['FOOTBALL_DATA_API_KEY'],
  API_FOOTBALL_KEY: process.env['API_FOOTBALL_KEY'],
  SPORTSDATAIO_SOCCER_API_KEY: process.env['SPORTSDATAIO_SOCCER_API_KEY'],
};

const DATA_PROVIDER = process.env['DATA_PROVIDER'];

function keyStatus(name, value) {
  if (value) {
    return `SET (length=${value.length})`;
  }
  return 'MISSING';
}

function main() {
  console.log('PSL One — Sprint 13 Provider Key Status Check');
  console.log('==============================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('No key values will be printed.\n');

  console.log('--- Provider Key Status ---');
  for (const [name, value] of Object.entries(KEYS)) {
    console.log(`  ${name}: ${keyStatus(name, value)}`);
  }

  console.log('');
  console.log('--- DATA_PROVIDER env ---');
  console.log(`  DATA_PROVIDER: ${DATA_PROVIDER ?? '(not set)'}`);

  console.log('');
  console.log('--- Routing Status ---');
  const wcReady = Boolean(KEYS.FOOTBALL_DATA_API_KEY);
  const pslReady = Boolean(KEYS.API_FOOTBALL_KEY);
  console.log(`  WC route:  ${wcReady ? 'READY' : 'BLOCKED_NO_KEY'}`);
  console.log(`  PSL route: ${pslReady ? 'READY' : 'BLOCKED_NO_KEY'}`);

  console.log('');
  console.log('--- Adapter Selection ---');
  if (DATA_PROVIDER) {
    console.log(`  DATA_PROVIDER override active: ${DATA_PROVIDER}`);
    console.log(`  WC  → ${DATA_PROVIDER} (forced by DATA_PROVIDER)`);
    console.log(`  PSL → ${DATA_PROVIDER} (forced by DATA_PROVIDER)`);
  } else {
    console.log(`  WC  → ${wcReady ? 'football-data-org' : 'NoOpAdapter (BLOCKED_NO_KEY)'}`);
    console.log(`  PSL → ${pslReady ? 'api-football' : 'NoOpAdapter (BLOCKED_NO_KEY)'}`);
  }

  console.log('');
  console.log('--- Provider Advisories ---');
  console.log('  Sportmonks: REJECTED — never use');
  console.log('  ESPN:       RESEARCH_ONLY — not wired');
}

main();
