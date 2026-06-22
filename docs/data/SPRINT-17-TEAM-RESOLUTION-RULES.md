# Sprint 17 — Team Resolution Rules

## Overview

When fixture candidates are normalized from Parse PSL, each fixture's home and away team names are resolved against the PSL One database. Resolution is a two-pass lookup per team per fixture.

## Resolution Algorithm

```
resolveTeam(name: string): Promise<Team | null>
  1. exact match:    findFirst({ where: { name } })
  2. fuzzy match:    findFirst({ where: { name: { contains: name, mode: 'insensitive' } } })
  3. unresolved:     return null → warning added to candidate
```

Both passes are read-only database queries.

## TeamResolutionDto

Each fixture candidate carries a `teamResolution` object:

```typescript
type TeamResolutionDto = {
  homeTeamMatched: boolean;
  awayTeamMatched: boolean;
  homeTeamId?: string;
  awayTeamId?: string;
  warnings: string[];
};
```

- `homeTeamMatched: false` → home team name not found; fixture is skipped in write mode.
- `awayTeamMatched: false` → away team name not found; fixture is skipped in write mode.
- `warnings` — list of resolution failure messages for operator review.

## Write-Mode Behaviour

- Fixtures with unresolved teams are **skipped** (counted in `skipped`, not `errors`).
- `created` / `updated` counts reflect only fixtures with both teams resolved.
- Skip warnings are included in the top-level `warnings[]` array in the response.

## Name Variant Handling

psl.co.za may use slightly different team names than those seeded in the database. Examples:

| Parse PSL name | Seeded name |
|----------------|-------------|
| `SuperSport United` | `Supersport United` |
| `Stellenbosch` | `Stellenbosch FC` |
| `Cape Town City FC` | `Cape Town City` |
| `AmaZulu FC` | `AmaZulu` |

The fuzzy (case-insensitive `contains`) pass handles most common variants. If new variants appear after psl.co.za publishes 2026/27 fixtures, run:

```bash
node tools/discovery/sprint-17-team-resolution-check.mjs
```

If variants fail resolution, either:
1. Update the seeded team name to match Parse PSL output; or
2. Add a name-normalisation pre-processing step in `ParsePslFixtureIngestionService.normalizeFixtures()`.

## Discovery Tool

`tools/discovery/sprint-17-team-resolution-check.mjs` — reads from the local database, tests all known PSL club name variants, and reports which pass/fail exact and fuzzy resolution. READ-ONLY, no external API calls.
