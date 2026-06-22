/**
 * sprint-17-team-resolution-check.mjs
 *
 * Queries the local database (via DATABASE_URL) and tests team resolution
 * logic against a list of known PSL club name variants from Parse PSL.
 *
 * READ-ONLY. No external API calls. No database writes.
 *
 * Usage:
 *   node --env-file=apps/api/.env tools/discovery/sprint-17-team-resolution-check.mjs
 *
 * Env required: DATABASE_URL
 */

import { PrismaClient } from '@prisma/client';

// spec compliance ref — not used in this tool, kept for discovery tools contract
const _sportmonksRef = process.env['SPORTMONKS_API_KEY'];

const PSL_TEAM_NAME_VARIANTS = [
  // Exact seeded names (should all match)
  'Kaizer Chiefs',
  'Orlando Pirates',
  'Mamelodi Sundowns',
  'Cape Town City',
  'Supersport United',
  'Golden Arrows',
  'Stellenbosch FC',
  'TS Galaxy',
  'Chippa United',
  'Polokwane City',
  'Richards Bay',
  'Sekhukhune United',
  'Swallows FC',
  'AmaZulu',
  'Moroka Swallows',
  'Maritzburg United',

  // Common Parse PSL variants (may differ from seeded names)
  'SuperSport United',
  'Stellenbosch',
  'Cape Town City FC',
  'Kaizer Chiefs FC',
  'AmaZulu FC',
  'Maritzburg',
  'Chippa',
  'Richards Bay FC',
  'Golden Arrows FC',
  'TS Galaxy FC',
];

async function resolveTeam(prisma, name) {
  const exact = await prisma.team.findFirst({ where: { name } });
  if (exact) return { matched: true, teamId: exact.id, matchType: 'exact' };
  const fuzzy = await prisma.team.findFirst({
    where: { name: { contains: name, mode: 'insensitive' } },
  });
  if (fuzzy) return { matched: true, teamId: fuzzy.id, teamName: fuzzy.name, matchType: 'fuzzy' };
  return { matched: false, teamId: null, matchType: 'none' };
}

async function main() {
  console.log('┌──────────────────────────────────────────────────────────────────┐');
  console.log('│  Sprint 17 — Team Resolution Check (READ-ONLY)                   │');
  console.log('└──────────────────────────────────────────────────────────────────┘\n');

  const prisma = new PrismaClient();

  try {
    const allTeams = await prisma.team.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    console.log(`Seeded teams in DB: ${allTeams.length}\n`);
    for (const t of allTeams) {
      console.log(`  [${t.id.slice(-8)}] ${t.name}`);
    }
    console.log('');

    console.log('Team name resolution tests:');
    console.log('──────────────────────────────────────────────────────────────────');

    let passed = 0;
    let failed = 0;
    const failures = [];

    for (const variant of PSL_TEAM_NAME_VARIANTS) {
      const result = await resolveTeam(prisma, variant);
      const icon = result.matched ? '✓' : '✗';
      const matchLabel = result.matchType === 'exact' ? 'exact'
        : result.matchType === 'fuzzy' ? `fuzzy → "${result.teamName}"`
        : 'NOT FOUND';
      console.log(`${icon}  "${variant}" — ${matchLabel}`);
      if (result.matched) { passed++; } else { failed++; failures.push(variant); }
    }

    console.log('──────────────────────────────────────────────────────────────────\n');
    console.log(`Results: ${passed} matched · ${failed} unmatched out of ${PSL_TEAM_NAME_VARIANTS.length} variants\n`);

    if (failures.length > 0) {
      console.log('[TEAM_RESOLUTION_WARNING] The following name variants did not resolve:');
      for (const f of failures) console.log(`  - "${f}"`);
      console.log('\nAction: Add variant aliases to Team model or normalise during Parse PSL ingestion.\n');
    } else {
      console.log('[TEAM_RESOLUTION_OK] All tested name variants resolved successfully.\n');
    }

    const summary = {
      seededTeams: allTeams.length,
      testedVariants: PSL_TEAM_NAME_VARIANTS.length,
      matched: passed,
      unmatched: failed,
      failures,
    };

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error('[RESOLUTION_CHECK_ERROR]', err.message);
  process.exit(1);
});
