# Sprint 14 — Parse PSL Adapter Validation

## Summary

| Field | Value |
|---|---|
| Date | 2026-06-22 |
| Adapter | `ParsePslAdapter` |
| Base URL | redacted — stored in adapter source |
| Auth | `X-API-Key` header |
| Env var | `PARSE_API_KEY` |
| Result | `PENDING_LIVE_KEY` |

Live validation requires `PARSE_API_KEY` to be set in `apps/api/.env`. See Owner Action below.

---

## Source-Empty Handling

When `get_fixtures` returns an empty array, this does **not** indicate an adapter failure.

It means psl.co.za has not yet published new-season fixture data. The Parse.bot scraper faithfully returns what the source site exposes. An empty fixtures array is a valid, accepted state.

**Acceptance criteria when fixtures are source-empty:**

- `get_clubs_list` must still return all PSL clubs — this proves the adapter and key are functional
- `get_results` may return historical results from the prior season — this is acceptable
- `get_standings` should return current or final standings — this is acceptable
- `get_fixtures` returning `[]` is recorded as `PARSE_PSL_FIXTURES_SOURCE_EMPTY` and treated as `PASS`

Do not mark the adapter as failed or fall back to another provider solely because fixtures are empty. The source-data availability gate is an upstream concern; the adapter is working correctly.

---

## Owner Action Required

1. Obtain the `PARSE_API_KEY` value from the Parse.bot dashboard
2. Add it to `apps/api/.env`:
   ```
   PARSE_API_KEY=<your-key-here>
   ```
3. **Never commit `.env` to git**
4. Run the discovery tools (see Sprint 14 Owner Review Guide for full steps):
   ```bash
   node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-health.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-fixtures.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-results.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-standings.mjs
   ```
5. Record outcomes in the Expected Outcomes table below

---

## Expected Outcomes

| Endpoint | Expected Status Code | Expected Outcome Token |
|---|---|---|
| `get_clubs_list` | 200 | `PARSE_PSL_CLUBS_AVAILABLE` |
| `get_results` | 200 | `PARSE_PSL_RESULTS_AVAILABLE` or `PARSE_PSL_RESULTS_EMPTY` |
| `get_standings` | 200 | `PARSE_PSL_STANDINGS_AVAILABLE` |
| `get_fixtures` | 200 | `PARSE_PSL_FIXTURES_AVAILABLE` or `PARSE_PSL_FIXTURES_SOURCE_EMPTY` (valid) |

A 401 response indicates the key is invalid or not yet provisioned. A 403 indicates the key exists but lacks permission for the requested endpoint. Both require Parse.bot dashboard action.

---

## Important Notes

- Parse.bot is an **unofficial scraper** — it is not an official PSL developer API
- Data is sourced by scraping psl.co.za; PSL may change their site structure at any time without notice
- If psl.co.za restructures, Parse.bot may return degraded or empty data across all endpoints — monitor regularly
- The tournament slug used throughout is `betway-premiership`
- `PARSE_API_KEY` must remain server-side only; never expose via `NEXT_PUBLIC_*` or in any frontend bundle
- Commercial and usage terms for Parse.bot must be reviewed and accepted by the project owner before production use
