# Sprint 15 — Parse PSL Live Validation

## Status: PARSE_PSL_KEY_MISSING

Live validation cannot proceed until `PARSE_API_KEY` is set in `apps/api/.env`.

## Tool Results (2026-06-22)

| Tool | Status | Notes |
|------|--------|-------|
| sprint-14-parse-psl-health.mjs | PARSE_PSL_KEY_MISSING | Key not in local `.env` |
| sprint-14-parse-psl-fixtures.mjs | PARSE_PSL_KEY_MISSING | Key not in local `.env` |
| sprint-14-parse-psl-results.mjs | PARSE_PSL_KEY_MISSING | Key not in local `.env` |
| sprint-14-parse-psl-standings.mjs | PARSE_PSL_KEY_MISSING | Key not in local `.env` |
| sprint-14-parse-psl-match-details.mjs | PARSE_PSL_KEY_MISSING | Key not in local `.env` |

## How to Unblock

1. Obtain the Parse API key from parse.bot (marketplace listing for psl-co-za-api).
2. Place it server-side only:
   ```
   PARSE_API_KEY=<your-key-here>
   ```
   in `apps/api/.env` (gitignored — never commit).
3. Do NOT set `NEXT_PUBLIC_PARSE_API_KEY`. The key must never reach the browser.
4. Re-run all discovery tools:
   ```bash
   node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-health.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-fixtures.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-results.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-standings.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-match-details.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-15-parse-fixture-dry-run.mjs
   ```
5. Update this file with actual results.

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
