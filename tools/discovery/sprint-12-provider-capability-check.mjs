#!/usr/bin/env node
/**
 * PSL One — Sprint 12 Provider Capability Check
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 * Checks all configured providers and prints a capability summary.
 * Does NOT make live API calls unless keys are present.
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-12-provider-capability-check.mjs
 * Keys are loaded via env file — never printed.
 * process.env['FOOTBALL_DATA_API_KEY']
 * process.env['API_FOOTBALL_KEY']
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED, Sprint 10)
 */

const FOOTBALL_DATA_API_KEY = process.env['FOOTBALL_DATA_API_KEY'];
const API_FOOTBALL_KEY = process.env['API_FOOTBALL_KEY'];
// Sportmonks is REJECTED as of Sprint 10; key read for spec compliance only
void process.env['SPORTMONKS_API_KEY'];

const DATA_PROVIDER = process.env['DATA_PROVIDER'];

function keyStatus(val) {
  return val ? 'SET' : 'MISSING';
}

async function liveCheckFootballData() {
  try {
    const res = await fetch('https://api.football-data.org/v4/competitions/WC', {
      headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 200) {
      return '[LIVE_CHECK] football-data.org /v4/competitions/WC → HTTP 200 PASS';
    }
    return `[LIVE_CHECK] football-data.org /v4/competitions/WC → HTTP ${res.status} FAIL`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `[LIVE_CHECK] football-data.org → network error: ${msg}`;
  }
}

async function liveCheckApiFootball() {
  try {
    const res = await fetch('https://v3.football.api-sports.io/leagues?id=288&current=true', {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 200) {
      return '[LIVE_CHECK] api-football /leagues?id=288&current=true → HTTP 200 PASS';
    }
    return `[LIVE_CHECK] api-football /leagues?id=288&current=true → HTTP ${res.status} FAIL`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `[LIVE_CHECK] api-football → network error: ${msg}`;
  }
}

function resolveAdapter() {
  if (!DATA_PROVIDER) return 'NoOpAdapter (default — DATA_PROVIDER not set)';
  switch (DATA_PROVIDER) {
    case 'football-data-org':  return 'FootballDataOrgAdapter';
    case 'api-football':       return 'ApiFootballAdapter';
    case 'sportmonks':         return 'REJECTED — do not use';
    case 'sportsdataio':       return 'SportsDataIoAdapter';
    case 'noop':               return 'NoOpAdapter';
    default:                   return `Unknown adapter for DATA_PROVIDER=${DATA_PROVIDER}`;
  }
}

function overallStatus() {
  const hasFootballData = !!FOOTBALL_DATA_API_KEY;
  const hasApiFootball  = !!API_FOOTBALL_KEY;

  if (hasFootballData && hasApiFootball) return 'READY_FOR_VALIDATION';
  if (!hasFootballData && !hasApiFootball) return 'FULLY_BLOCKED';
  return 'PARTIALLY_CONFIGURED';
}

async function main() {
  console.log('PSL One — Sprint 12 Provider Capability Check');
  console.log('=============================================');
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('Note: No key values will be printed.\n');

  console.log('── Provider Capability Matrix ──────────────────────────────────────');
  console.log(`[football-data.org] key=${keyStatus(FOOTBALL_DATA_API_KEY)} | competitions=WC,CL,PL (PSL=NOT_SUPPORTED)`);
  console.log(`[api-football]      key=${keyStatus(API_FOOTBALL_KEY)} | PSL=league_288 (UNVALIDATED)`);
  console.log('[sportmonks]        REJECTED — do not use');
  console.log('[espn]              RESEARCH_ONLY — no adapter wired');
  console.log('[sportsdataio]      SECONDARY_CANDIDATE — PSL not found');
  console.log('[noop]              DEFAULT — active when no DATA_PROVIDER set');
  console.log('');

  const providerDisplay = DATA_PROVIDER ? DATA_PROVIDER : 'not set';
  console.log(`DATA_PROVIDER env:  ${providerDisplay}`);
  console.log(`Active adapter:     ${resolveAdapter()}`);
  console.log('');

  // Live checks when provider + key are both configured
  if (DATA_PROVIDER === 'football-data-org' && FOOTBALL_DATA_API_KEY) {
    const result = await liveCheckFootballData();
    console.log(result);
    console.log('');
  }

  if (DATA_PROVIDER === 'api-football' && API_FOOTBALL_KEY) {
    const result = await liveCheckApiFootball();
    console.log(result);
    console.log('');
  }

  const status = overallStatus();
  console.log(`── Overall Status ──────────────────────────────────────────────────`);
  console.log(`${status}`);

  if (status === 'FULLY_BLOCKED') {
    console.log('  → Set FOOTBALL_DATA_API_KEY and/or API_FOOTBALL_KEY in apps/api/.env to unblock');
  }
}

main().catch(err => {
  console.error('Capability check failed:', err.message);
  process.exit(1);
});
