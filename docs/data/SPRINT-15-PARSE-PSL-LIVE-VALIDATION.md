# Sprint 15 — Parse PSL Live Validation

## Status: PARSE_PSL_HEALTH_OK — Source-Empty (Expected Seasonal)

Live validation run 2026-06-22. Key present and valid. All endpoints reachable. No fixtures or
standings available yet because psl.co.za has not published the 2026/27 Betway Premiership season.

## Tool Results (2026-06-22)

| Tool | Status | Notes |
|------|--------|-------|
| sprint-14-parse-psl-health.mjs | PARSE_PSL_HEALTH_OK + PARSE_PSL_FIXTURES_SOURCE_EMPTY | Endpoint reachable; 0 fixtures |
| sprint-14-parse-psl-fixtures.mjs | PARSE_PSL_FIXTURES_SOURCE_EMPTY | 0 fixtures — season not yet published |
| sprint-14-parse-psl-results.mjs | PARSE_PSL_RESULTS_EMPTY | 0 results — season not yet started |
| sprint-14-parse-psl-standings.mjs | PARSE_PSL_STANDINGS_EMPTY | 0 standings — season not yet started |
| sprint-15-parse-fixture-dry-run.mjs | DRY_RUN_SOURCE_EMPTY | HTTP 200; empty array; 0 DB writes; exits clean |

## Interpretation

The Parse PSL API is working correctly. The key authenticates successfully (HTTP 200 on all endpoints).
All data is empty because psl.co.za has not published the 2026/27 Betway Premiership season yet.

**This is the expected seasonal state for June/July.** Fixtures are typically published in July ahead
of the August season start.

## Next Action

No action required until psl.co.za publishes new-season fixtures (~July/August 2026).

When fixtures appear, re-run:
```bash
node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-fixtures.mjs
node --env-file=apps/api/.env tools/discovery/sprint-15-parse-fixture-dry-run.mjs
```

Expected status change: `PARSE_PSL_FIXTURES_SOURCE_EMPTY` → `PARSE_PSL_FIXTURES_AVAILABLE`
and `DRY_RUN_SOURCE_EMPTY` → `DRY_RUN_FIXTURES_NORMALIZED`.

## Expected Post-Key Results

| Result | Meaning | Action |
|--------|---------|--------|
| `PARSE_PSL_HEALTH_OK` | Key valid, API reachable | Proceed with further validation |
| `PARSE_PSL_AUTH_FAILED` | Key rejected by Parse.bot | Check key, contact Parse.bot support |
| `PARSE_PSL_FIXTURES_AVAILABLE` | Betway Premiership fixtures returned | Full data path confirmed |
| `PARSE_PSL_FIXTURES_SOURCE_EMPTY` | psl.co.za has not published new season | Expected — wait for PSL to publish fixtures |
| `PARSE_PSL_RESULTS_AVAILABLE` | Match results returned | Partial data confirmed |
| `PARSE_PSL_STANDINGS_AVAILABLE` | Standings returned | Partial data confirmed |
| `PARSE_PSL_RATE_LIMITED` | Too many requests | Back off, see SPRINT-15-PARSE-RATE-LIMIT-PLAN.md |

## Source-Empty Interpretation

If `get_fixtures` returns an empty array (`[]`), this is **not an adapter failure**. PSL (psl.co.za) typically publishes new-season fixtures close to the season start. As of Sprint 15, the 2026/27 Betway Premiership season fixtures may not yet be available.

**Source-empty is ACCEPTABLE until psl.co.za publishes fixtures.**

See `SPRINT-15-PARSE-PSL-SOURCE-EMPTY-ASSESSMENT.md` for the full assessment.

## Commercial Risk

Parse.bot wraps publicly available psl.co.za data. This is an unofficial scraper — PSL has not granted API access directly. Key risks are documented in `docs/handover/SPRINT-14-KNOWN-GAPS.md` (G7).

Owner must review Parse.bot terms of service before enabling any scheduled ingestion.

## Related Documents

- `docs/data/SPRINT-14-PARSE-PSL-VALIDATION.md` — Sprint 14 baseline
- `docs/data/SPRINT-15-PARSE-PSL-SOURCE-EMPTY-ASSESSMENT.md`
- `docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md`
- `docs/handover/SPRINT-14-KNOWN-GAPS.md` — G7 (unofficial scraper risk)
