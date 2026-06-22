# Sprint 15 — Safe Fixture Ingestion Design

## Status: DESIGN ONLY — No Scheduled Job Active

This document describes the intended design for PSL fixture ingestion once Parse PSL data is validated. No scheduler is active. No production ingestion is enabled. No PSL season is activated.

Owner must explicitly approve and trigger the first manual run.

## Guiding Principles

1. **Read-only discovery first** — validate data shape and content before any DB write
2. **Manual run only** — no scheduled job until owner explicitly approves
3. **Idempotent upserts** — insert or update by `externalId`; never create duplicates
4. **Canonical data boundary** — provider data enriches, never overwrites locked canonical data
5. **Source-empty is success** — returning `[]` from `get_fixtures` is valid, not a failure
6. **Provenance tracking** — every ingested row records its provider source
7. **Rate-limit respect** — maximum 1 request per 5 seconds to Parse.bot endpoints
8. **Key never stored** — `PARSE_API_KEY` lives in environment only; never written to DB or logs
9. **No PSL activation** — fixture ingestion does not activate the PSL season

## Proposed Ingestion Flow

```
1. Health check (get_fixtures dry-run)
   → if PARSE_PSL_FIXTURES_SOURCE_EMPTY: EXIT_OK (nothing to ingest yet)
   → if PARSE_PSL_AUTH_FAILED: EXIT_ERROR (report to owner)
   → if PARSE_PSL_HEALTH_OK: continue

2. Fetch clubs list (get_clubs_list)
   → normalise to ProviderTeam[]
   → upsert clubs by externalId + providerName='parse-psl'

3. Fetch fixtures (get_fixtures)
   → normalise to ProviderFixture[]
   → for each fixture:
       a. look up homeTeam and awayTeam by name (fuzzy) or externalId
       b. upsert Fixture by externalId + providerName='parse-psl'
       c. set isPublished=false by default (owner publishes separately)
       d. record providerSource='parse-psl' on the row

4. Fetch results (get_results) — optional enrichment
   → normalise score data
   → update existing Fixture rows with result; do NOT overwrite manually-entered scores

5. Fetch standings (get_standings) — read-only; display only
   → no DB write; use for informational display

6. Log ingestion summary
   → clubs upserted / fixtures upserted / skipped / errors
   → no key values in log output
```

## Idempotency Rules

- Upsert key for Fixture: `(externalId, seasonId, competitionId, providerName)`
- Upsert key for Team: `(externalId, providerName)` or `(name, competitionId)` for fuzzy match
- Re-running the job must produce the same DB state as running it once
- Timestamps: `createdAt` set on first insert; `updatedAt` always updated
- Status transitions: only advance status forward (e.g., SCHEDULED → FINISHED); never revert

## Canonical Data Boundary

| Data Type | Provider Can Write? | Locked If? |
|-----------|--------------------|----|
| Fixture externalId | Yes | Never — provider source of truth |
| Fixture date/time | Yes | Owner manually edits |
| Fixture score (result) | Yes | Manually confirmed by admin |
| Fixture isPublished | No | Admin-only; published once approved |
| Team name | Reference only | Mapped to canonical Team row |
| Player data | No (Sprint 15) | Players via separate calibration |

See `SPRINT-15-CANONICAL-DATA-BOUNDARY.md` for the full boundary matrix.

## Rate Limit Plan

See `SPRINT-15-PARSE-RATE-LIMIT-PLAN.md` for detailed rate-limit handling.

Summary:
- Default delay: 1 second between API calls
- On 429: back off exponentially; max 3 retries
- On persistent 429: abort run; alert owner

## What Is NOT In Scope for Sprint 15

- Scheduled cron job
- Production ingestion trigger
- PSL season activation
- Player ingestion (via lineups — future sprint)
- Match event ingestion (live data — Sprint 17 architecture)
- Wallet or commerce integration
- Real-time fixture updates

## Owner Gate Before First Manual Run

1. `PARSE_API_KEY` validated (`PARSE_PSL_HEALTH_OK`)
2. Dry-run completed (`sprint-15-parse-fixture-dry-run.mjs`) with acceptable output
3. Canonical data boundary reviewed and accepted
4. Rate-limit plan accepted
5. Owner explicitly authorises run: `pnpm run ingest:fixtures:manual --dry-run=false`

## Related Documents

- `docs/data/SPRINT-15-IDEMPOTENT-INGESTION-RULES.md`
- `docs/data/SPRINT-15-PARSE-RATE-LIMIT-PLAN.md`
- `docs/data/SPRINT-15-CANONICAL-DATA-BOUNDARY.md`
- `docs/data/SPRINT-15-PARSE-PSL-LIVE-VALIDATION.md`
