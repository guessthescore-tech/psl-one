# Sprint 13 — Provider Routing Go/No-Go

## Status: CONDITIONAL_GO

Per-competition routing (`ProviderRouterService`) is code-ready. Full GO requires live key validation for both providers.

## GO Conditions

| # | Condition | Status |
|---|---|---|
| 1 | football-data.org WC validation passes with live key | BLOCKED — key not set |
| 2 | API-Football PSL league 288 validation passes with live key | BLOCKED — key empty |
| 3 | Commercial terms accepted for both providers | PENDING — owner review |
| 4 | EC2 staging migration applied | PENDING — apply not authorised |
| 5 | Staging live smoke passing | PENDING — depends on condition 4 |
| 6 | No betting/odds endpoints enabled | CONFIRMED — not implemented |

## Current Blocking Gates

### G1 — FOOTBALL_DATA_API_KEY not set locally

`FOOTBALL_DATA_API_KEY` is absent from `apps/api/.env`. No HTTP call has been made to football-data.org. Owner must set the key and re-run validation before this gate clears.

**Owner action:** Add `FOOTBALL_DATA_API_KEY=<token>` to `apps/api/.env` (never commit), then run:
```bash
node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-worldcup.mjs
```
Expected clear code: `FOOTBALL_DATA_WORLD_CUP_BETA_VALIDATED`

### G2 — API_FOOTBALL_KEY not set locally

`API_FOOTBALL_KEY` is empty in `apps/api/.env`. No HTTP call has been made to API-Football. Owner must set the key and re-run validation before this gate clears.

**Owner action:** Add `API_FOOTBALL_KEY=<key>` to `apps/api/.env` (never commit), then run:
```bash
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
```
Expected clear code: `API_FOOTBALL_PSL_VALIDATED`

## What Is Active Right Now

- `NoOpAdapter` is the default for all competitions.
- `DataProviderService` global behaviour is unchanged.
- `ProviderRouterService` exists in code but is not wired into any request path.
- No data ingestion is scheduled or active.

## What Changes When All Conditions Are Met

Full GO authorises wiring `ProviderRouterService` into an ingestion pipeline (Sprint 14 scope). It does not automatically activate PSL or any live data flow — that requires a separate authorisation step.

## Related Documents

- `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md`
- `docs/handover/SPRINT-13-BETA-GO-NOGO.md`
- `docs/handover/SPRINT-13-KNOWN-GAPS.md`
- `docs/handover/SPRINT-13-OWNER-REVIEW-GUIDE.md`
