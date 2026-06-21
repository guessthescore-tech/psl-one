#!/usr/bin/env node
/**
 * PSL One — Provider Coverage Check
 * Tests each endpoint for the configured provider.
 * Usage: PROVIDER=sportmonks SEASON_ID=23614 node tools/discovery/provider-coverage-check.mjs
 *        PROVIDER=sportsdataio SEASON_ID=2024 node tools/discovery/provider-coverage-check.mjs
 * Requires server-side env vars only — never NEXT_PUBLIC_*.
 */

const PROVIDER = process.env['PROVIDER'] || 'sportmonks';
const SEASON_ID = process.env['SEASON_ID'] || '';
const SPORTMONKS_KEY = process.env['SPORTMONKS_API_KEY'];
const SPORTSDATAIO_KEY = process.env['SPORTSDATAIO_SOCCER_API_KEY'];

// SportsDataIO trial is limited to UEFA Champions League (Competition ID 3)
const SDIO_TRIAL_COMP_ID = 3;

function getKey() {
  if (PROVIDER === 'sportmonks') return SPORTMONKS_KEY;
  if (PROVIDER === 'sportsdataio') return SPORTSDATAIO_KEY;
  return null;
}

function makeHeaders(key) {
  if (PROVIDER === 'sportmonks') return { Authorization: `Bearer ${key}` };
  if (PROVIDER === 'sportsdataio') return { 'Ocp-Apim-Subscription-Key': key };
  return {};
}

async function fetchEndpoint(url, key) {
  try {
    const res = await fetch(url, {
      headers: makeHeaders(key),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, status: res.status, count: 0, notes: `HTTP ${res.status}` };
    const data = await res.json();
    const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    return { ok: true, status: res.status, count: arr.length, notes: '' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, count: 0, notes: msg.slice(0, 60) };
  }
}

function row(endpoint, result) {
  const status = result.ok ? 'OK    ' : 'FAIL  ';
  const http = String(result.status).padEnd(3);
  const count = String(result.count).padEnd(6);
  const notes = result.notes || '';
  return `  ${status} | ${http} | ${count} | ${endpoint.padEnd(20)} | ${notes}`;
}

function blockedRow(endpoint) {
  return `  BLOCKED | --- | ------ | ${endpoint.padEnd(20)} | BLOCKED_BY_REPLACEMENT_TOKEN`;
}

async function runSportmonks(key) {
  const base = 'https://api.sportmonks.com/v3/football';
  const seasonParam = SEASON_ID ? `/${SEASON_ID}` : '';

  const endpoints = [
    { name: 'seasons', url: `${base}/seasons?per_page=5` },
    { name: 'fixtures', url: SEASON_ID ? `${base}/fixtures/between/${SEASON_ID}?per_page=5` : `${base}/fixtures?per_page=5` },
    { name: 'teams', url: SEASON_ID ? `${base}/teams/seasons/${SEASON_ID}?per_page=5` : `${base}/teams?per_page=5` },
    { name: 'players', url: `${base}/players?per_page=5` },
    { name: 'standings', url: SEASON_ID ? `${base}/standings/seasons/${SEASON_ID}` : `${base}/standings?per_page=5` },
  ];

  console.log(`\nSportmonks coverage${SEASON_ID ? ` (season ${SEASON_ID})` : ' (no season filter)'}:`);
  console.log(`  Status | HTTP | Count  | Endpoint             | Notes`);
  console.log(`  -------+------+--------+----------------------+------`);

  for (const ep of endpoints) {
    const result = await fetchEndpoint(ep.url, key);
    console.log(row(ep.name, result));
  }
}

async function runSportsDataIo(key) {
  const base = 'https://api.sportsdata.io/v4/soccer/scores/json';
  const compId = SDIO_TRIAL_COMP_ID;
  const seasonParam = SEASON_ID || '2024';

  const endpoints = [
    { name: 'competitions', url: `${base}/Competitions` },
    { name: 'schedules', url: `${base}/SchedulesBasic/${compId}/${seasonParam}` },
    { name: 'teams', url: `${base}/Teams/${compId}` },
    { name: 'players (sample team)', url: `${base}/PlayersByTeam/503` },
    { name: 'standings', url: `${base}/Standings/${compId}/${seasonParam}` },
  ];

  console.log(`\nSportsDataIO coverage (trial: UCL comp ${compId}, season ${seasonParam}):`);
  console.log(`  Status | HTTP | Count  | Endpoint             | Notes`);
  console.log(`  -------+------+--------+----------------------+------`);

  for (const ep of endpoints) {
    const result = await fetchEndpoint(ep.url, key);
    console.log(row(ep.name, result));
  }
}

async function main() {
  console.log('PSL One — Provider Coverage Check');
  console.log('===================================');
  console.log(`Provider: ${PROVIDER}`);
  console.log('Note: No key values will be printed.\n');

  if (!['sportmonks', 'sportsdataio'].includes(PROVIDER)) {
    console.error(`Unknown provider: ${PROVIDER}. Use PROVIDER=sportmonks or PROVIDER=sportsdataio`);
    process.exit(1);
  }

  const key = getKey();
  if (!key) {
    console.log(`[BLOCKED] ${PROVIDER}: BLOCKED_BY_REPLACEMENT_TOKEN`);
    console.log(`\nTo unblock: set ${PROVIDER === 'sportmonks' ? 'SPORTMONKS_API_KEY' : 'SPORTSDATAIO_SOCCER_API_KEY'} in apps/api/.env`);
    console.log('\nBlocked coverage table:');
    const endpoints = ['seasons', 'fixtures', 'teams', 'players', 'standings'];
    console.log(`  Status  | --- | ------ | Endpoint             | Notes`);
    endpoints.forEach(ep => console.log(blockedRow(ep)));
    process.exit(0);
  }

  if (PROVIDER === 'sportmonks') await runSportmonks(key);
  else await runSportsDataIo(key);

  console.log('\n── Notes ────────────────────────────────────');
  if (PROVIDER === 'sportsdataio') {
    console.log('SportsDataIO trial scope: UEFA Champions League (Competition ID 3) only.');
    console.log('PSL and WC2026 coverage requires a paid plan — not validated in trial.');
  }
  console.log('Do not use betting/odds endpoints — PSL One policy.');
}

main().catch(err => {
  console.error('Coverage check failed:', err.message);
  process.exit(1);
});
