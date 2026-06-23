# Sprint 25 — Team Resolution Readiness

## Status: TEAM_RESOLUTION_READY

The 16 PSL clubs seeded in STORY-26 are expected to resolve correctly against canonical Parse PSL team names.

## Seeded PSL Clubs (STORY-26)

| # | Canonical DB Name | Expected Parse Name | Match |
|---|-------------------|---------------------|-------|
| 1 | Kaizer Chiefs | Kaizer Chiefs | READY |
| 2 | Orlando Pirates | Orlando Pirates | READY |
| 3 | Mamelodi Sundowns | Mamelodi Sundowns | READY |
| 4 | SuperSport United | SuperSport United | READY |
| 5 | Stellenbosch FC | Stellenbosch FC | READY |
| 6 | Cape Town City | Cape Town City FC | MAY VARY |
| 7 | Chippa United | Chippa United | READY |
| 8 | TS Galaxy | TS Galaxy | READY |
| 9 | Polokwane City | Polokwane City | READY |
| 10 | Sekhukhune United | Sekhukhune United | READY |
| 11 | Swallows FC | Swallows FC / Moroka Swallows | MAY VARY |
| 12 | Richards Bay | Richards Bay FC | MAY VARY |
| 13 | Golden Arrows | Golden Arrows | READY |
| 14 | AmaZulu FC | AmaZulu | MAY VARY |
| 15 | Cape Town Spurs | Cape Town Spurs | READY |

> "MAY VARY" entries: the Parse source may use a slightly different suffix or abbreviation. The `ParsePslAdapter.resolveTeam()` method uses normalised fuzzy matching to handle common suffixes ("FC", "United", "City").

## Resolution Algorithm

`FixtureImportService.resolveTeam()` uses:

1. Exact match on `Club.name`
2. Case-insensitive exact match
3. Normalised match (removes "FC", "United", "City" suffixes)
4. Short-name match on `Club.shortName`

If none match: returns `teamResolutionFailed = true` for that candidate.

## When Fixtures Become Available

1. Run `tools/staging/sprint-25-team-resolution-readiness.mjs` against beta EC2
2. Review the output for any `UNRESOLVED` entries
3. For each unresolved team: add an alias to `ParsePslAdapter.resolveTeam()`
4. Re-run dry-run ingestion check to confirm resolution

## Safety

- This check is read-only
- No fixture writes occur during team resolution checks
- PSL remains INACTIVE
- All alias changes require a new PR and CI pass before deploy
