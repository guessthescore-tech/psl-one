# Sprint 13 — Beta Go/No-Go

## Status: CONDITIONAL_GO

The per-competition router is code-ready. Full GO requires live key validation for both providers and fulfilment of the remaining conditions below.

## GO Conditions

| # | Condition | Status |
|---|---|---|
| 1 | football-data.org WC validation passes with live key (`FOOTBALL_DATA_WORLD_CUP_BETA_VALIDATED`) | BLOCKED — key not set |
| 2 | API-Football PSL league 288 validation passes with live key (`API_FOOTBALL_PSL_VALIDATED`) | BLOCKED — key empty |
| 3 | Commercial terms accepted for football-data.org | PENDING — owner review |
| 4 | Commercial terms accepted for API-Football | PENDING — owner review |
| 5 | EC2 staging migration applied and smoke passing | PENDING — apply not authorised |
| 6 | No betting/odds endpoints enabled | CONFIRMED |

## Critical Note

Live key validation for both providers is blocked by missing keys. `ProviderRouterService` is code-ready and has been reviewed but **has not been validated against live data**. The router falls back to `NoOpAdapter` for both competition paths until keys are present.

## What Is Already GO

- NoOpAdapter default is active and stable.
- DataProviderService global behaviour is unchanged.
- ProviderRouterService code is additive and safe to ship without live validation.
- No DB migrations in Sprint 13 — schema is stable.
- Rollback is always available (see `SPRINT-13-ROLLBACK-PLAN.md`).

## What Happens After Full GO

Full GO does **not** automatically activate PSL or trigger live data ingestion. It authorises:

1. Wiring `ProviderRouterService` into a read-only ingestion job (Sprint 14 scope).
2. Running staging smoke with real provider data.
3. Proceeding to production deployment planning.

PSL season activation remains a separate, explicit owner decision. It is not part of Sprint 13 scope.

## Related Documents

- `docs/data/SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md`
- `docs/handover/SPRINT-13-KNOWN-GAPS.md`
- `docs/handover/SPRINT-13-OWNER-REVIEW-GUIDE.md`
- `docs/handover/SPRINT-13-ROLLBACK-PLAN.md`
- `docs/handover/SPRINT-13-HANDOVER.md`
