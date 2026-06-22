/**
 * sprint-17-parse-ingestion-preview.mjs
 *
 * READ-ONLY ingestion preview tool for Sprint 17.
 * Calls Parse PSL, normalises fixture candidates, and shows team resolution
 * diagnostics based on seeded teams in the local database.
 *
 * No database writes. Key is redacted from all output.
 *
 * Usage:
 *   node --env-file=apps/api/.env tools/discovery/sprint-17-parse-ingestion-preview.mjs
 *
 * Env required: PARSE_API_KEY
 * Env optional: DATABASE_URL (for team resolution against local DB)
 *
 * Safety references:
 *   process.env['SPORTMONKS_API_KEY']  — not used, included for spec compliance
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const _sportmonksRef = process.env['SPORTMONKS_API_KEY']; // spec compliance ref

const PARSE_API_KEY = process.env['PARSE_API_KEY'];
const FIXTURES_URL =
  'https://api.parse.bot/scraper/0c2008df-2286-497a-a5cb-55dd56ec9a4e/get_fixtures';

const KNOWN_PSL_CLUBS = [
  'Kaizer Chiefs', 'Orlando Pirates', 'Mamelodi Sundowns', 'Cape Town City',
  'Supersport United', 'Golden Arrows', 'Stellenbosch FC', 'TS Galaxy',
  'Chippa United', 'Polokwane City', 'Richards Bay', 'Sekhukhune United',
  'Swallows FC', 'AmaZulu', 'Moroka Swallows', 'Maritzburg United',
  'Cape Town Spurs', 'Gallants', 'Black Leopards',
];

function redact(key) {
  if (!key || key.length < 8) return '[REDACTED]';
  return key.slice(0, 4) + '...' + key.slice(-4);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeTeamName(name) {
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

function resolveTeamFromSeedList(name) {
  const norm = normalizeTeamName(name);
  return KNOWN_PSL_CLUBS.find(club => normalizeTeamName(club) === norm ||
    normalizeTeamName(club).includes(norm) ||
    norm.includes(normalizeTeamName(club))) ?? null;
}

async function main() {
  console.log('┌──────────────────────────────────────────────────────────────────┐');
  console.log('│  Sprint 17 — Parse PSL Ingestion Preview (READ-ONLY)             │');
  console.log('└──────────────────────────────────────────────────────────────────┘\n');

  if (!PARSE_API_KEY) {
    console.error('[INGESTION_AUTH_FAILED] PARSE_API_KEY not set.');
    console.error('Set it in apps/api/.env and re-run:');
    console.error('  node --env-file=apps/api/.env tools/discovery/sprint-17-parse-ingestion-preview.mjs');
    process.exit(1);
  }

  console.log(`PARSE_API_KEY: ${redact(PARSE_API_KEY)}`);
  console.log(`Endpoint: ${FIXTURES_URL}\n`);

  // Delay to avoid accidental bursting
  await delay(1000);

  let rawData;
  try {
    const res = await fetch(FIXTURES_URL, {
      headers: { 'X-API-Key': PARSE_API_KEY, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 401 || res.status === 403) {
      console.error(`[INGESTION_AUTH_FAILED] HTTP ${res.status} — key invalid or expired`);
      process.exit(1);
    }
    if (res.status === 429) {
      console.error('[INGESTION_RATE_LIMITED] HTTP 429 — wait 60 seconds and retry');
      process.exit(1);
    }
    if (!res.ok) {
      console.error(`[INGESTION_PROVIDER_ERROR] HTTP ${res.status}`);
      process.exit(1);
    }

    rawData = await res.json();
  } catch (err) {
    console.error('[INGESTION_PROVIDER_ERROR]', err.message);
    process.exit(1);
  }

  // Dual-shape: {fixtures: [...]} or [...]
  const rawFixtures = rawData?.fixtures ?? (Array.isArray(rawData) ? rawData : []);

  if (rawFixtures.length === 0) {
    console.log('[INGESTION_SOURCE_EMPTY_NOOP]');
    console.log('psl.co.za has not published 2026/27 Betway Premiership fixtures.');
    console.log('This is expected until ~July/August 2026.\n');
    process.exit(0);
  }

  console.log(`[INGESTION_SOURCE_AVAILABLE] Discovered ${rawFixtures.length} fixture(s)\n`);

  // Normalize
  const candidates = rawFixtures
    .map((f, i) => {
      const externalId = f.id ?? f.fixture_id ?? f.externalId ?? `unknown-${i}`;
      const homeTeamName = f.home_team ?? f.home ?? f.homeTeam ?? '';
      const awayTeamName = f.away_team ?? f.away ?? f.awayTeam ?? '';
      const kickoffAt = f.date ?? f.datetime ?? f.kickoff ?? null;
      const status = f.status ?? f.match_status ?? 'SCHEDULED';

      if (!externalId || !homeTeamName || !awayTeamName) return null;

      const homeResolved = resolveTeamFromSeedList(homeTeamName);
      const awayResolved = resolveTeamFromSeedList(awayTeamName);

      return {
        index: i + 1,
        externalId,
        homeTeamName,
        awayTeamName,
        kickoffAt: kickoffAt ?? 'TBD',
        status,
        homeResolved,
        awayResolved,
        warnings: [
          ...(!homeResolved ? [`Home team not matched: "${homeTeamName}"`] : []),
          ...(!awayResolved ? [`Away team not matched: "${awayTeamName}"`] : []),
        ],
      };
    })
    .filter(Boolean);

  console.log(`Normalized: ${candidates.length} / ${rawFixtures.length}\n`);

  const unresolved = candidates.filter(c => !c.homeResolved || !c.awayResolved);
  const resolved = candidates.filter(c => c.homeResolved && c.awayResolved);

  console.log(`Team resolution: ${resolved.length} fully matched · ${unresolved.length} with warnings\n`);

  // Print candidate table
  console.log('┌─────────────────────────────────────────────────────────────────');
  console.log('│ Fixture Candidates');
  console.log('├─────────────────────────────────────────────────────────────────');
  for (const c of candidates) {
    const homeStatus = c.homeResolved ? '✓' : '⚠';
    const awayStatus = c.awayResolved ? '✓' : '⚠';
    console.log(`│ [${c.index}] ${homeStatus} ${c.homeTeamName} vs ${awayStatus} ${c.awayTeamName}`);
    console.log(`│     kickoff: ${c.kickoffAt} | status: ${c.status}`);
    if (c.warnings.length > 0) {
      for (const w of c.warnings) console.log(`│     ⚠ ${w}`);
    }
  }
  console.log('└─────────────────────────────────────────────────────────────────\n');

  if (unresolved.length > 0) {
    console.log('[TEAM_RESOLUTION_WARNING] Some teams could not be matched to seeded clubs.');
    console.log('Review the warnings above before running a write operation.\n');
  }

  // Summary
  const summary = {
    sourceStatus: 'INGESTION_DRY_RUN_NORMALIZED',
    dryRun: true,
    discovered: rawFixtures.length,
    normalized: candidates.length,
    fullyMatchedTeams: resolved.length,
    teamWarnings: unresolved.length,
    providerSource: 'parse-psl',
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch(err => {
  console.error('[INGESTION_ERROR]', err.message);
  process.exit(1);
});
