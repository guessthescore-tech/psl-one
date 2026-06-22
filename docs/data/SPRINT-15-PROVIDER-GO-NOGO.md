# Sprint 15 — Provider Go/No-Go

## Overall Status: CONDITIONAL_GO

Full GO requires all conditions below to be cleared.

## Conditions

| # | Condition | Status | Notes |
|---|-----------|--------|-------|
| C1 | `PARSE_API_KEY` provisioned and validated | ✅ CLEARED | Key set 2026-06-22; HTTP 200 confirmed |
| C2 | Parse health returns `PARSE_PSL_HEALTH_OK` | ✅ CLEARED | Validated 2026-06-22 |
| C3 | Parse fixtures source state confirmed (available or source-empty) | ✅ CLEARED | `PARSE_PSL_FIXTURES_SOURCE_EMPTY` — expected seasonal state |
| C4 | Parse results, standings reachable | ✅ CLEARED | Endpoints reachable; empty is expected pre-season |
| C5 | Parse.bot commercial terms reviewed by owner | PENDING | Unofficial scraper — G7 risk |
| C6 | API-Football account reactivated (fallback) | PENDING | Account suspended; low priority until C1 cleared |
| C7 | EC2 staging migration applied | PENDING | Separate authorisation required |
| C8 | Staging smoke PASS after migration | PENDING | Blocked by C7 |
| C9 | Safe ingestion job owner-approved | PENDING | Design complete (Sprint 15); authorisation required |
| C10 | PSL season activated | NOT STARTED | Separate explicit owner decision |

## What Is Already GO

| Item | Status |
|------|--------|
| football-data.org WC beta | ✅ GO — WC_BETA_VALIDATED (104 matches) |
| NoOpAdapter safe fallback | ✅ GO — always active |
| ParsePslAdapter implementation | ✅ GO — code correct, tests passing |
| ProviderRouterService PSL routing | ✅ GO — routes Parse→AF→NoOp correctly |
| Source-empty handling | ✅ GO — `[]` handled without error |
| No production ingestion | ✅ GO — none enabled |
| No real-money mechanics | ✅ GO — confirmed throughout |

## Recommended Owner Action Sequence

1. Set `PARSE_API_KEY` in `apps/api/.env`
2. Run `node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-health.mjs`
3. If `PARSE_PSL_HEALTH_OK` → run all remaining tools; update SPRINT-15-PARSE-PSL-LIVE-VALIDATION.md
4. If `PARSE_PSL_FIXTURES_SOURCE_EMPTY` → confirm expected seasonal state; no action needed until August
5. Review Parse.bot terms of service
6. Reactivate API-Football account (low priority — Parse is primary)
7. Approve ingestion design in SPRINT-15-FIXTURE-INGESTION-DESIGN.md
8. Authorise EC2 staging migration (when ready)
