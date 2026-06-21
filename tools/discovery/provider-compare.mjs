#!/usr/bin/env node
/**
 * PSL One — Provider Comparison
 * Side-by-side comparison of Sportmonks vs SportsDataIO.
 * Runs available providers; shows BLOCKED for those without keys.
 * Requires server-side env vars only — never NEXT_PUBLIC_*.
 * Run: node tools/discovery/provider-compare.mjs
 */

const SPORTMONKS_KEY = process.env['SPORTMONKS_API_KEY'];
const SPORTSDATAIO_KEY = process.env['SPORTSDATAIO_SOCCER_API_KEY'];

async function quickHealth(url, headers) {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return { ok: false, status: res.status };
    const data = await res.json();
    const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    return { ok: true, status: res.status, count: arr.length };
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

async function testSportmonks() {
  if (!SPORTMONKS_KEY) return null;
  const h = await quickHealth('https://api.sportmonks.com/v3/football/seasons?per_page=3', {
    Authorization: `Bearer ${SPORTMONKS_KEY}`,
  });
  return h;
}

async function testSportsDataIo() {
  if (!SPORTSDATAIO_KEY) return null;
  const h = await quickHealth('https://api.sportsdata.io/v4/soccer/scores/json/Competitions', {
    'Ocp-Apim-Subscription-Key': SPORTSDATAIO_KEY,
  });
  return h;
}

function col(val, width = 30) {
  return String(val ?? '').slice(0, width).padEnd(width);
}

async function main() {
  console.log('PSL One — Provider Comparison');
  console.log('==============================');
  console.log('Note: No key values will be printed.\n');

  const [smResult, sdioResult] = await Promise.all([testSportmonks(), testSportsDataIo()]);

  const sm = {
    available: smResult?.ok ? `✅ HTTP ${smResult.status} (${smResult.count} seasons)` : (SPORTMONKS_KEY ? `❌ HTTP ${smResult?.status}` : 'BLOCKED_BY_REPLACEMENT_TOKEN'),
  };
  const sdio = {
    available: sdioResult?.ok ? `✅ HTTP ${sdioResult.status} (${sdioResult.count} competitions)` : (SPORTSDATAIO_KEY ? `❌ HTTP ${sdioResult?.status}` : 'BLOCKED_BY_REPLACEMENT_TOKEN'),
  };

  const rows = [
    ['Feature', 'Sportmonks', 'SportsDataIO'],
    ['─'.repeat(28), '─'.repeat(30), '─'.repeat(30)],
    ['Live health check', sm.available, sdio.available],
    ['Auth method', 'Authorization: Bearer', 'Ocp-Apim-Subscription-Key'],
    ['Key env var', 'SPORTMONKS_API_KEY', 'SPORTSDATAIO_SOCCER_API_KEY'],
    ['Frontend exposure', 'NEVER — server-side only ✅', 'NEVER — server-side only ✅'],
    ['Adapter status', 'DEPRECATED (retained) ⚠️', 'Skeleton/candidate only ⚠️'],
    ['DataProviderService', 'NOT WIRED (removed) ❌', 'Not yet wired ⚠️'],
    ['Trial scope', 'Unknown (key needed)', 'UCL only (comp ID 3)'],
    ['PSL coverage', 'Pending trial validation', 'Pending trial validation'],
    ['WC2026 coverage', 'Pending trial validation', 'Trial: UCL only (not WC2026)'],
    ['Rate limit handling', '429 handled gracefully ✅', '429 handled gracefully ✅'],
    ['401/403 handling', 'Safe disabled mode ✅', 'Safe disabled mode ✅'],
    ['No-key safe mode', 'Returns empty arrays ✅', 'Returns empty arrays ✅'],
    ['Betting/odds use', 'PROHIBITED ✅', 'PROHIBITED ✅'],
    ['Commercial terms', 'Unknown — owner must check', 'Unknown — owner must check'],
    ['getStandings()', 'Implemented ✅', 'Implemented ✅'],
    ['getFixtures()', 'Implemented ✅', 'Implemented ✅'],
    ['getTeams()', 'Implemented ✅', 'Implemented ✅'],
    ['getPlayers()', 'Implemented ✅', 'Implemented ✅'],
    ['─'.repeat(28), '─'.repeat(30), '─'.repeat(30)],
    ['Active strategy status', 'REJECTED — removed ❌', 'Candidate — UNDECIDED ⚠️'],
  ];

  for (const [feature, sportmonks, sportsdata] of rows) {
    console.log(`  ${col(feature, 28)} | ${col(sportmonks, 30)} | ${col(sportsdata, 30)}`);
  }

  console.log('\n── Provider Strategy Status ─────────────────────────────────────');
  console.log('Sportmonks: REJECTED — removed from active provider strategy (Sprint 10 amendment).');
  console.log('Reason: does not provide the required data points for the PSL One platform.');
  console.log('        Adapter retained for reference; NOT wired to DataProviderService.');
  console.log('');
  console.log('Primary provider: UNDECIDED');
  console.log('See: docs/data/SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md');
  console.log('See: docs/data/SPRINT-10-NEW-PROVIDER-SHORTLIST.md');
  console.log('');
  console.log('SportsDataIO: secondary candidate — PSL NOT in competition list on trial;');
  console.log('              paid plan + PSL coverage validation required before wiring.');
  if (!SPORTSDATAIO_KEY) console.log('\n  Set SPORTSDATAIO_SOCCER_API_KEY=<trial_key> in apps/api/.env to test SportsDataIO.');
  console.log('\n  Re-run: node tools/discovery/provider-compare.mjs');
}

main().catch(err => {
  console.error('Comparison failed:', err.message);
  process.exit(1);
});
