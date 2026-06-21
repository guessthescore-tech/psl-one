#!/usr/bin/env node
/**
 * PSL One — Provider Field Mapping Check
 * Verifies that required PSL One fields are present in provider responses.
 * Usage: PROVIDER=sportmonks node tools/discovery/provider-field-mapping-check.mjs
 *        PROVIDER=sportsdataio node tools/discovery/provider-field-mapping-check.mjs
 * Requires server-side env vars only — never NEXT_PUBLIC_*.
 */

const PROVIDER = process.env['PROVIDER'] || 'sportmonks';
const SPORTMONKS_KEY = process.env['SPORTMONKS_API_KEY'];
const SPORTSDATAIO_KEY = process.env['SPORTSDATAIO_SOCCER_API_KEY'];

// PSL One required fields per entity type
const REQUIRED_FIXTURE_FIELDS = ['externalId', 'homeTeamName', 'awayTeamName', 'kickoffAt', 'status'];
const OPTIONAL_FIXTURE_FIELDS = ['homeScore', 'awayScore'];
const REQUIRED_TEAM_FIELDS = ['externalId', 'name', 'shortName'];
const REQUIRED_STANDING_FIELDS = ['externalId', 'teamName', 'position', 'points', 'played'];

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

async function fetchSample(url, key) {
  try {
    const res = await fetch(url, {
      headers: makeHeaders(key),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    return arr[0] ?? null;
  } catch {
    return null;
  }
}

function mapSportmonksFixture(raw) {
  if (!raw) return null;
  return {
    externalId: raw.id ? String(raw.id) : undefined,
    homeTeamName: raw.name?.split(' vs ')?.[0] ?? raw.participants?.[0]?.name,
    awayTeamName: raw.name?.split(' vs ')?.[1] ?? raw.participants?.[1]?.name,
    kickoffAt: raw.starting_at,
    status: raw.result_info ?? raw.state?.developer_name,
    homeScore: raw.scores?.find(s => s.description === 'CURRENT' && s.score?.participant === 'home')?.score?.goals,
    awayScore: raw.scores?.find(s => s.description === 'CURRENT' && s.score?.participant === 'away')?.score?.goals,
  };
}

function mapSdioFixture(raw) {
  if (!raw) return null;
  return {
    externalId: raw.GameId ? String(raw.GameId) : undefined,
    homeTeamName: raw.HomeTeamName,
    awayTeamName: raw.AwayTeamName,
    kickoffAt: raw.Day,
    status: raw.Status,
    homeScore: raw.HomeTeamScore ?? undefined,
    awayScore: raw.AwayTeamScore ?? undefined,
  };
}

function mapSportmonksTeam(raw) {
  if (!raw) return null;
  return {
    externalId: raw.id ? String(raw.id) : undefined,
    name: raw.name,
    shortName: raw.short_code,
  };
}

function mapSdioTeam(raw) {
  if (!raw) return null;
  return {
    externalId: raw.TeamId ? String(raw.TeamId) : undefined,
    name: raw.Name,
    shortName: raw.ShortName,
  };
}

function checkFields(mapped, required, optional, entityName) {
  console.log(`\n  ${entityName} field mapping:`);
  console.log(`  PSL One Field         | Raw Provider Value       | Status`);
  console.log(`  ----------------------+--------------------------+--------`);
  for (const field of required) {
    const val = mapped?.[field];
    const present = val !== undefined && val !== null;
    const display = present ? String(val).slice(0, 24).padEnd(24) : '(absent)'.padEnd(24);
    console.log(`  ${field.padEnd(22)}| ${display} | ${present ? 'MAPPED ✅' : 'MISSING ❌'}`);
  }
  for (const field of optional) {
    const val = mapped?.[field];
    const present = val !== undefined && val !== null;
    const display = present ? String(val).slice(0, 24).padEnd(24) : '(absent)'.padEnd(24);
    console.log(`  ${field.padEnd(22)}| ${display} | ${present ? 'MAPPED ✅' : 'OPTIONAL —'}`);
  }
}

async function runSportmonks(key) {
  const base = 'https://api.sportmonks.com/v3/football';
  console.log('\nFetching Sportmonks sample data...');

  const rawFixture = await fetchSample(`${base}/fixtures?per_page=1&include=scores;participants`, key);
  const rawTeam = await fetchSample(`${base}/teams?per_page=1`, key);

  checkFields(mapSportmonksFixture(rawFixture), REQUIRED_FIXTURE_FIELDS, OPTIONAL_FIXTURE_FIELDS, 'Fixture');
  checkFields(mapSportmonksTeam(rawTeam), REQUIRED_TEAM_FIELDS, [], 'Team');
  console.log('\n  Note: Raw API response not shown to avoid leaking sensitive fields.');
}

async function runSportsDataIo(key) {
  const base = 'https://api.sportsdata.io/v4/soccer/scores/json';
  const COMP_ID = 3; // UEFA Champions League trial scope
  console.log(`\nFetching SportsDataIO sample data (trial: UCL comp ${COMP_ID})...`);

  const rawFixture = await fetchSample(`${base}/SchedulesBasic/${COMP_ID}/2024`, key);
  const rawTeam = await fetchSample(`${base}/Teams/${COMP_ID}`, key);

  checkFields(mapSdioFixture(rawFixture), REQUIRED_FIXTURE_FIELDS, OPTIONAL_FIXTURE_FIELDS, 'Fixture');
  checkFields(mapSdioTeam(rawTeam), REQUIRED_TEAM_FIELDS, [], 'Team');
  console.log('\n  Note: Raw API response not shown to avoid leaking sensitive fields.');
  console.log('  Trial scope is UCL only — PSL/WC2026 mapping unvalidated on trial tier.');
}

async function main() {
  console.log('PSL One — Provider Field Mapping Check');
  console.log('=======================================');
  console.log(`Provider: ${PROVIDER}`);
  console.log('Note: No key values will be printed. Sample data shown field-by-field only.\n');

  if (!['sportmonks', 'sportsdataio'].includes(PROVIDER)) {
    console.error(`Unknown provider: ${PROVIDER}`);
    process.exit(1);
  }

  const key = getKey();
  if (!key) {
    const envVar = PROVIDER === 'sportmonks' ? 'SPORTMONKS_API_KEY' : 'SPORTSDATAIO_SOCCER_API_KEY';
    console.log(`[BLOCKED] ${PROVIDER}: BLOCKED_BY_REPLACEMENT_TOKEN`);
    console.log(`\nTo unblock: set ${envVar} in apps/api/.env`);
    const fields = [...REQUIRED_FIXTURE_FIELDS, ...OPTIONAL_FIXTURE_FIELDS, ...REQUIRED_TEAM_FIELDS];
    console.log('\nBlocked field mapping table:');
    console.log(`  PSL One Field         | Status`);
    fields.forEach(f => console.log(`  ${f.padEnd(22)}| BLOCKED_BY_REPLACEMENT_TOKEN`));
    process.exit(0);
  }

  if (PROVIDER === 'sportmonks') await runSportmonks(key);
  else await runSportsDataIo(key);
}

main().catch(err => {
  console.error('Field mapping check failed:', err.message);
  process.exit(1);
});
