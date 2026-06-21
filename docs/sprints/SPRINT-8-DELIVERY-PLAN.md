# Sprint 8 — Delivery Plan

## Sprint Title
Staging Activation, Sportmonks Trial Validation & Settlement Automation

## Sprint Goal
Close the loop on challenge settlement automation, prepare staging migration runbooks, and document the Sportmonks trial validation gate. All new code must pass typechecks, API tests, and experience tests before merge.

## Sprint Stories

| Story | Title | Status |
|-------|-------|--------|
| S8-01 | Staging Migration Readiness | COMPLETE |
| S8-02 | Sportmonks Trial Validation | BLOCKED_BY_REPLACEMENT_TOKEN |
| S8-03 | Automatic Challenge Settlement | COMPLETE |
| S8-04 | Challenge Result UX Polish | COMPLETE |
| S8-05 | Beta Smoke Suite | COMPLETE |
| S8-06 | Vercel Preview Refresh | DOCUMENTED |
| S8-07 | Release Gate & Handover | COMPLETE |

## Migration Status
- Migration 40: `20260615000001_security_performance_hardening` — applied
- Migration 41: `20260621000001_account_security_trust` — applied
- Migration 42: `20260621000002_prediction_challenge_token` — applied
- Migration 43: `20260621000003_challenge_settlement` — applied (was sprint 7 migration 42)
- Staging: runbook ready at `docs/handover/SPRINT-8-STAGING-MIGRATION-RUNBOOK.md`; apply pending owner authorization
- All Sprint 7+8 migrations are additive (no DROP TABLE, no DROP COLUMN, no NOT NULL without default)

## Provider Status
- Sportmonks API key: BLOCKED_BY_REPLACEMENT_TOKEN
- Previous token must be revoked immediately in MySportmonks console
- Replacement token placement: owner action required (see SPRINT-8-SPORTMONKS-TRIAL-VALIDATION.md)
- No-key state: all adapter methods return safe empty arrays / `{ available: false }` — confirmed working

## Non-Negotiables
1. PSL season: INACTIVE — no activation in this sprint
2. Wallet: Sandbox-only — no real money, no production wallet config
3. Production ingestion: DISABLED — no Sportmonks live data in production
4. No AWS/Terraform/IAM changes
5. No token value committed to repository
6. STORY-40: RESERVED
7. Settlement is fire-and-forget — never blocks the fixture update response
8. No wallet records created by settlement service

## Delivery Checklist
- [x] Sprint planning docs
- [x] Staging migration runbook
- [x] Rollback plan documented
- [x] Sportmonks trial validation documented (BLOCKED_BY_REPLACEMENT_TOKEN)
- [x] `settleAllAcceptedForFixture` method in ChallengeSettlementService
- [x] ChallengeSettlementService exported from PredictionChallengesModule
- [x] PredictionChallengesModule imported into FootballModule
- [x] Settlement fire-and-forget trigger in FootballService.adminUpdateFixtureStatus
- [x] Admin bulk-settle endpoint `POST /predictions/challenges/settle-fixture/:fixtureId`
- [x] Challenge settlement fixture tests
- [x] Challenge result page at `/predict/challenge/result`
- [x] Experience spec tests for S8
- [x] Beta smoke suite (API + provider)
- [x] Owner review guide
- [x] Release gate
- [x] Handover docs

## Test Counts (target)
- API tests: >= 1,750 (from 1,739 baseline)
- Experience tests: >= 500 (from 487 baseline)

## Known Gaps
See `docs/handover/SPRINT-8-KNOWN-GAPS.md`
