#!/usr/bin/env node
/**
 * PSL One — API-Football Provider Discovery Script
 *
 * Read-only spike. No database writes. No application API calls. No AWS calls.
 *
 * Usage:
 *   API_FOOTBALL_KEY=your-key node tools/data-provider-spike/api-football-discovery.mjs
 *
 * Output: sanitized JSON written to /tmp/api-football-discovery-{timestamp}.json
 *
 * Authentication: uses direct API-Football host (api-sports.io), NOT RapidAPI.
 * If your account is on RapidAPI, adjust the HOST and headers accordingly.
 *
 * Official documentation: https://www.api-football.com/documentation-v3
 */

import { writeFileSync } from 'fs';

// ── Config ────────────────────────────────────────────────────────────────────

const HOST = 'https://v3.football.api-sports.io';
const KEY = process.env['API_FOOTBALL_KEY'];
const OUTPUT_PATH = `/tmp/api-football-discovery-${Date.now()}.json`;

// ── Validation ────────────────────────────────────────────────────────────────

if (!KEY) {
  console.error('ERROR: API_FOOTBALL_KEY environment variable is not set.');
  console.error('Set it with: API_FOOTBALL_KEY=your-key node tools/data-provider-spike/api-football-discovery.mjs');
  process.exit(1);
}

// Redact key from any logs
function redact(str) {
  return String(str).replace(KEY, '[REDACTED]');
}

// ── Request helper ─────────────────────────────────────────────────────────────

async function apiFetch(path, params = {}) {
  const url = new URL(path, HOST);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const redactedUrl = redact(url.toString());
  console.log(`  → GET ${redactedUrl}`);

  const res = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': KEY,
    },
  });

  const usageRemaining = res.headers.get('x-ratelimit-requests-remaining');
  const usageLimit = res.headers.get('x-ratelimit-requests-limit');
  const requestsCurrent = res.headers.get('X-RateLimit-Remaining');

  const quota = {
    remaining: usageRemaining ?? requestsCurrent ?? 'unknown',
    limit: usageLimit ?? 'unknown',
  };

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} for ${redactedUrl}: ${redact(text)}`);
  }

  const json = await res.json();
  return { data: json, quota };
}

// ── Main discovery ─────────────────────────────────────────────────────────────

async function run() {
  console.log('\n=== PSL One — API-Football Discovery Spike ===');
  console.log('Read-only. No database writes. No AWS calls.\n');

  const report = {
    timestamp: new Date().toISOString(),
    host: HOST,
    steps: [],
  };

  // Step 1: Query leagues for South Africa
  console.log('Step 1: Querying leagues for country "South Africa" ...');
  const leaguesRes = await apiFetch('/leagues', { country: 'South Africa' });
  const allLeagues = leaguesRes.data?.response ?? [];

  console.log(`  → Found ${allLeagues.length} leagues`);
  const leagueSummary = allLeagues.map(l => ({
    id: l.league?.id,
    name: l.league?.name,
    type: l.league?.type,
    seasons: l.seasons?.map(s => s.year) ?? [],
  }));

  report.steps.push({
    step: 1,
    description: 'Leagues in South Africa',
    count: allLeagues.length,
    leagues: leagueSummary,
    quota: leaguesRes.quota,
  });

  leagueSummary.forEach(l => {
    console.log(`    [${l.id}] ${l.name} (${l.type}) — seasons: ${l.seasons.slice(-3).join(', ')}`);
  });

  // Step 2: Find Premier Soccer League
  console.log('\nStep 2: Identifying Premier Soccer League ...');
  const pslLeague = allLeagues.find(l =>
    l.league?.name?.toLowerCase().includes('premier soccer league') ||
    l.league?.name?.toLowerCase().includes('dstv premiership') ||
    l.league?.name?.toLowerCase().includes('psl')
  );

  if (!pslLeague) {
    console.warn('  WARNING: Could not find a league named "Premier Soccer League" in the response.');
    console.warn('  Available leagues printed above. Review and select the correct ID manually.');
    console.warn('  Do NOT guess or hardcode a league ID from documentation examples.');
    report.steps.push({ step: 2, description: 'PSL identification', result: 'NOT FOUND', warning: true });
    writeOutput(report);
    return;
  }

  const pslId = pslLeague.league.id;
  const pslName = pslLeague.league.name;
  const pslSeasons = pslLeague.seasons?.map(s => s.year).sort((a, b) => b - a) ?? [];
  const latestSeason = pslSeasons[0];

  console.log(`  → Found: [${pslId}] ${pslName}`);
  console.log(`  → Available seasons: ${pslSeasons.slice(0, 5).join(', ')}`);
  console.log(`  → Using latest season: ${latestSeason}`);

  report.steps.push({
    step: 2,
    description: 'PSL identification',
    leagueId: pslId,
    leagueName: pslName,
    seasons: pslSeasons,
    latestSeason,
    quota: leaguesRes.quota,
  });

  // Step 3: Coverage details for PSL league
  console.log(`\nStep 3: Querying coverage details for league ${pslId} ...`);
  const coverageRes = await apiFetch('/leagues', { id: pslId });
  const coverageDetail = coverageRes.data?.response?.[0];
  const coverage = coverageDetail?.seasons?.find(s => s.year === latestSeason)?.coverage ?? {};

  console.log(`  → Coverage for ${latestSeason}:`);
  Object.entries(coverage).forEach(([k, v]) => {
    if (typeof v === 'boolean' || typeof v === 'object') {
      console.log(`    ${k}: ${JSON.stringify(v)}`);
    }
  });

  report.steps.push({
    step: 3,
    description: `Coverage for PSL league ${pslId}, season ${latestSeason}`,
    coverage,
    quota: coverageRes.quota,
  });

  // Step 4: Standings
  console.log(`\nStep 4: Querying standings for league ${pslId}, season ${latestSeason} ...`);
  try {
    const standingsRes = await apiFetch('/standings', { league: pslId, season: latestSeason });
    const standingsData = standingsRes.data?.response?.[0]?.league?.standings?.[0] ?? [];
    console.log(`  → Found ${standingsData.length} standings rows`);
    const standingsSample = standingsData.slice(0, 3).map(s => ({
      rank: s.rank,
      team: s.team?.name,
      points: s.points,
      played: s.all?.played,
    }));
    console.log('  → Sample (top 3):');
    standingsSample.forEach(s => console.log(`    ${s.rank}. ${s.team} — ${s.points}pts (${s.played}P)`));

    report.steps.push({
      step: 4,
      description: 'Standings',
      rowCount: standingsData.length,
      sample: standingsSample,
      quota: standingsRes.quota,
    });
  } catch (err) {
    console.warn(`  WARNING: Standings query failed: ${err.message}`);
    report.steps.push({ step: 4, description: 'Standings', error: err.message });
  }

  // Step 5: Fixtures
  console.log(`\nStep 5: Querying fixtures for league ${pslId}, season ${latestSeason} ...`);
  try {
    const fixturesRes = await apiFetch('/fixtures', { league: pslId, season: latestSeason });
    const fixturesData = fixturesRes.data?.response ?? [];
    console.log(`  → Found ${fixturesData.length} fixtures`);
    const fixtureSample = fixturesData.slice(0, 2).map(f => ({
      id: f.fixture?.id,
      date: f.fixture?.date,
      home: f.teams?.home?.name,
      away: f.teams?.away?.name,
      status: f.fixture?.status?.short,
    }));
    console.log('  → Sample (first 2):');
    fixtureSample.forEach(f => console.log(`    [${f.id}] ${f.home} vs ${f.away} — ${f.date} (${f.status})`));

    report.steps.push({
      step: 5,
      description: 'Fixtures',
      count: fixturesData.length,
      sample: fixtureSample,
      quota: fixturesRes.quota,
    });
  } catch (err) {
    console.warn(`  WARNING: Fixtures query failed: ${err.message}`);
    report.steps.push({ step: 5, description: 'Fixtures', error: err.message });
  }

  // Step 6: Teams
  console.log(`\nStep 6: Querying teams for league ${pslId}, season ${latestSeason} ...`);
  try {
    const teamsRes = await apiFetch('/teams', { league: pslId, season: latestSeason });
    const teamsData = teamsRes.data?.response ?? [];
    console.log(`  → Found ${teamsData.length} teams`);
    const teamSample = teamsData.slice(0, 3).map(t => ({
      id: t.team?.id,
      name: t.team?.name,
      code: t.team?.code,
      city: t.venue?.city,
    }));
    console.log('  → Sample (first 3):');
    teamSample.forEach(t => console.log(`    [${t.id}] ${t.name} (${t.code}) — ${t.city}`));

    report.steps.push({
      step: 6,
      description: 'Teams',
      count: teamsData.length,
      sample: teamSample,
      quota: teamsRes.quota,
    });
  } catch (err) {
    console.warn(`  WARNING: Teams query failed: ${err.message}`);
    report.steps.push({ step: 6, description: 'Teams', error: err.message });
  }

  // Step 7: Players (top scorers as a proxy for player data availability)
  console.log(`\nStep 7: Querying top scorers for league ${pslId}, season ${latestSeason} ...`);
  try {
    const topScorersRes = await apiFetch('/players/topscorers', { league: pslId, season: latestSeason });
    const topScorers = topScorersRes.data?.response ?? [];
    console.log(`  → Found ${topScorers.length} top scorer entries`);
    const scorerSample = topScorers.slice(0, 3).map(p => ({
      id: p.player?.id,
      name: p.player?.name,
      nationality: p.player?.nationality,
      goals: p.statistics?.[0]?.goals?.total,
      club: p.statistics?.[0]?.team?.name,
    }));
    console.log('  → Sample (top 3):');
    scorerSample.forEach(p => console.log(`    [${p.id}] ${p.name} (${p.nationality}) — ${p.goals}G for ${p.club}`));

    report.steps.push({
      step: 7,
      description: 'Top scorers (player data proxy)',
      count: topScorers.length,
      sample: scorerSample,
      quota: topScorersRes.quota,
    });
  } catch (err) {
    console.warn(`  WARNING: Top scorers query failed: ${err.message}`);
    report.steps.push({ step: 7, description: 'Top scorers', error: err.message });
  }

  // Final quota summary
  const lastQuota = report.steps.at(-1)?.quota;
  if (lastQuota) {
    console.log(`\n=== API Quota ===`);
    console.log(`  Remaining: ${lastQuota.remaining}`);
    console.log(`  Limit:     ${lastQuota.limit}`);
  }

  writeOutput(report);
}

function writeOutput(report) {
  const sanitized = JSON.stringify(report, null, 2);
  writeFileSync(OUTPUT_PATH, sanitized, 'utf8');
  console.log(`\n✓ Sanitized output written to: ${OUTPUT_PATH}`);
  console.log('\nNOTE: No data was written to the PSL One database.');
  console.log('NOTE: No AWS calls were made.');
  console.log('NOTE: This script is read-only and safe to re-run.\n');
}

run().catch(err => {
  console.error('Fatal error:', redact ? redact(err.message) : err.message);
  process.exit(1);
});
