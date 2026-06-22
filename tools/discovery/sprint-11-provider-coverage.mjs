#!/usr/bin/env node
/**
 * PSL One — Sprint 11 Provider Coverage Check
 * READ-ONLY — no DB writes, no PSL activation, no betting endpoints.
 *
 * Endpoint-by-endpoint coverage check for API-Football (PSL + WC2026).
 * Use PROVIDER=sportsdataio to compare against SportsDataIO.
 *
 * Run: node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
 *      PROVIDER=sportsdataio node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
 *
 * Keys are loaded via env file — never printed.
 * process.env['API_FOOTBALL_KEY']
 * process.env['SPORTMONKS_API_KEY']  — retained for spec compatibility (Sportmonks REJECTED, Sprint 10)
 * process.env['SPORTSDATAIO_SOCCER_API_KEY']
 */

const PROVIDER = process.env['PROVIDER'] || 'api-football';
const API_FOOTBALL_KEY = process.env['API_FOOTBALL_KEY'];
const SPORTSDATAIO_KEY = process.env['SPORTSDATAIO_SOCCER_API_KEY'];
// Sportmonks is REJECTED as of Sprint 10; key read for spec compliance only
void process.env['SPORTMONKS_API_KEY'];

// PSL = league 288, WC2026 = league 1 (FIFA World Cup)
const PSL_LEAGUE_ID = 288;
const WC2026_LEAGUE_ID = 1;

function getKey() {
  if (PROVIDER === 'api-football') return API_FOOTBALL_KEY;
  if (PROVIDER === 'sportsdataio') return SPORTSDATAIO_KEY;
  return null;
}

async function fetchEndpoint(url, headers) {
  try {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { ok: false, status: res.status, count: 0, notes: `HTTP ${res.status}` };
    }
    const data = await res.json();
    // API-Football wraps results in data.response
    const arr = Array.isArray(data?.response) ? data.response
      : Array.isArray(data) ? data
      : Array.isArray(data?.data) ? data.data
      : [];
    return { ok: true, status: res.status, count: arr.length, notes: '' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, count: 0, notes: msg.slice(0, 60) };
  }
}

function row(label, result) {
  const state = result.ok ? 'OK     ' : 'FAIL   ';
  const http = String(result.status).padEnd(3);
  const count = String(result.count).padEnd(6);
  const notes = result.notes || '';
  return `  ${state} | ${http} | ${count} | ${label.padEnd(40)} | ${notes}`;
}

function blockedRow(label) {
  return `  BLOCKED_NO_KEY | --- | ------ | ${label.padEnd(40)} | key not set`;
}

async function runApiFootball(key) {
  const base = 'https://v3.football.api-sports.io';
  const headers = { 'x-apisports-key': key };

  const endpoints = [
    { name: '/leagues (all)',                url: `${base}/leagues` },
    { name: `/leagues?id=${PSL_LEAGUE_ID} (PSL)`,      url: `${base}/leagues?id=${PSL_LEAGUE_ID}` },
    { name: `/leagues?id=${WC2026_LEAGUE_ID} (WC2026)`, url: `${base}/leagues?id=${WC2026_LEAGUE_ID}` },
    { name: '/fixtures PSL 2025',            url: `${base}/fixtures?league=${PSL_LEAGUE_ID}&season=2025&timezone=UTC` },
    { name: '/standings PSL 2025',           url: `${base}/standings?league=${PSL_LEAGUE_ID}&season=2025` },
    { name: '/teams PSL 2025',               url: `${base}/teams?league=${PSL_LEAGUE_ID}&season=2025` },
  ];

  console.log('\nAPI-Football coverage (PSL league=288, WC2026 league=1):');
  console.log(`  Status  | HTTP | Count  | Endpoint                                 | Notes`);
  console.log(`  --------+------+--------+------------------------------------------+------`);

  let pslFound = false;
  for (const ep of endpoints) {
    const result = await fetchEndpoint(ep.url, headers);
    console.log(row(ep.name, result));
    if (ep.name.includes('PSL') && result.ok && result.count > 0) pslFound = true;
  }

  console.log(`\n  PSL (league ${PSL_LEAGUE_ID}): ${pslFound ? 'FOUND' : 'NOT_FOUND'}`);
}

async function runSportsDataIo(key) {
  const base = 'https://api.sportsdata.io/v4/soccer/scores/json';
  const headers = { 'Ocp-Apim-Subscription-Key': key };

  const endpoints = [
    { name: 'Competitions (all)',           url: `${base}/Competitions` },
    { name: 'Schedules UCL 2024',           url: `${base}/SchedulesBasic/3/2024` },
    { name: 'Teams UCL',                    url: `${base}/Teams/3` },
    { name: 'Standings UCL 2024',           url: `${base}/Standings/3/2024` },
  ];

  console.log('\nSportsDataIO coverage (trial scope: UCL comp=3):');
  console.log(`  Status  | HTTP | Count  | Endpoint                                 | Notes`);
  console.log(`  --------+------+--------+------------------------------------------+------`);

  for (const ep of endpoints) {
    const result = await fetchEndpoint(ep.url, headers);
    console.log(row(ep.name, result));
  }

  console.log(`\n  PSL (league ${PSL_LEAGUE_ID}): NOT_FOUND — trial scope limited to UCL only`);
}

async function main() {
  console.log('PSL One — Sprint 11 Provider Coverage Check');
  console.log('============================================');
  console.log(`Provider: ${PROVIDER}`);
  console.log('READ-ONLY: no DB writes, no PSL activation, no betting endpoints.');
  console.log('Note: No key values will be printed.\n');

  if (!['api-football', 'sportsdataio'].includes(PROVIDER)) {
    console.error(`Unknown provider: ${PROVIDER}. Use PROVIDER=api-football or PROVIDER=sportsdataio`);
    process.exit(1);
  }

  const key = getKey();
  if (!key) {
    console.log(`[BLOCKED_NO_KEY] ${PROVIDER}: key not set`);
    const keyVar = PROVIDER === 'api-football' ? 'API_FOOTBALL_KEY' : 'SPORTSDATAIO_SOCCER_API_KEY';
    console.log(`\nTo unblock: set ${keyVar} in apps/api/.env`);
    console.log('\nBlocked coverage table:');
    console.log(`  Status         | --- | ------ | Endpoint                                 | Notes`);
    const endpoints = PROVIDER === 'api-football'
      ? ['/leagues', `/leagues?id=${PSL_LEAGUE_ID}`, `/leagues?id=${WC2026_LEAGUE_ID}`, '/fixtures PSL 2025', '/standings PSL 2025', '/teams PSL 2025']
      : ['Competitions', 'Schedules UCL 2024', 'Teams UCL', 'Standings UCL 2024'];
    for (const ep of endpoints) console.log(blockedRow(ep));
    process.exit(0);
  }

  if (PROVIDER === 'api-football') await runApiFootball(key);
  else await runSportsDataIo(key);

  console.log('\n── Notes ────────────────────────────────────');
  console.log('Do not use betting/odds endpoints — PSL One policy.');
  if (PROVIDER === 'sportsdataio') {
    console.log('SportsDataIO trial scope: UEFA Champions League (Competition ID 3) only.');
    console.log('PSL and WC2026 coverage requires a paid plan — not validated in trial.');
  }
}

main().catch(err => {
  console.error('Coverage check failed:', err.message);
  process.exit(1);
});
