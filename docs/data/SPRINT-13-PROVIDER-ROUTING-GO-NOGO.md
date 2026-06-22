# Sprint 13 — Provider Routing Go/No-Go

## Status: CONDITIONAL_GO

Per-competition routing (`ProviderRouterService`) is code-ready. Full GO requires live key validation for both providers.

## GO Conditions

| # | Condition | Status |
|---|---|---|
| 1 | football-data.org WC validation passes with live key | **CLEARED** — `WC_BETA_VALIDATED` (104 matches, 2026-06-22) |
| 2 | API-Football PSL league 288 validation passes with live key | BLOCKED — account suspended |
| 3 | Commercial terms accepted for both providers | PENDING — owner review |
| 4 | EC2 staging migration applied | PENDING — apply not authorised |
| 5 | Staging live smoke passing | PENDING — depends on condition 4 |
| 6 | No betting/odds endpoints enabled | CONFIRMED — not implemented |

## Current Blocking Gates

### G2 — API-Football account suspended

`API_FOOTBALL_KEY` is present (length=32) but the account is suspended. All API-Football endpoints return HTTP 200 with `errors.access = "Your account is suspended"` and an empty `response` array.

**Owner action:** Log in to https://dashboard.api-football.com, reactivate or upgrade, then run:
```bash
node --env-file=apps/api/.env tools/discovery/sprint-13-psl-sample.mjs
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
```
Expected clear code: `PSL_FOUND` + `PSL_SAMPLE_OK`

### G1 — CLEARED

football-data.org WC validation passed on 2026-06-22. 104 World Cup 2026 matches returned. Score data available on free tier.

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
