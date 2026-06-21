# Sprint 10 — Delivery Plan

## Goal

Move beta from `CONDITIONAL_GO` toward operational staging readiness by validating provider coverage, preparing a read-only staging data pipeline, gating EC2 staging migration, and running live smoke tests.

## Branch

`feature/sprint-10-provider-staging-smoke`

## Base

`main` @ `d4cbc08` (Sprint 9 merge)

## Stories

| Story | Title | Status |
|-------|-------|--------|
| S10-01 | Sportmonks Key Fix and Coverage Validation | ⚠️ HTTP_401 — key invalid |
| S10-02 | SportsDataIO Trial Coverage Validation | ⚠️ PARTIAL — UCL only |
| S10-03 | Read-Only Provider Staging Pipeline | ✅ Docs and tools created |
| S10-04 | EC2 Staging Migration Gate | ⚠️ PENDING_OWNER_AUTH — no EC2 DB URL |
| S10-05 | Live API Smoke and Settlement Readiness | ✅ 6/6 PASS (local dev) |
| S10-06 | Beta Go/No-Go Update | ⚠️ CONDITIONAL_GO |

## Key findings

- Sportmonks replacement key (length 60) returns HTTP 401 on all v3 endpoints — key must be regenerated
- SportsDataIO trial: competitions (93) + teams (258) OK; schedules/players/standings blocked by tier
- Live staging smoke: 6/6 PASS after fixing onboarding path (`/onboarding/status` → `/account/onboarding`)
- Settlement smoke: 8/8 PASS
- EC2 staging migration: not applied — no EC2 DATABASE_URL configured
- Local dev DB: all 42 migrations up to date

## Hard constraints (unchanged)

- PSL INACTIVE
- WC2026 ACTIVE (beta context)
- Wallet SANDBOX_ONLY
- No provider key in frontend
- No production ingestion
- No real-money functionality
