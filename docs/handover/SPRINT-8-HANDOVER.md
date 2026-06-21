# Sprint 8 — Handover

## Sprint Title
Staging Activation, Sportmonks Trial Validation & Settlement Automation

## Delivered

### S8-01: Staging Migration Readiness
- `docs/handover/SPRINT-8-STAGING-MIGRATION-RUNBOOK.md` — step-by-step migration apply guide
- `docs/handover/SPRINT-8-STAGING-MIGRATION-CHECKLIST.md` — pre/post verification checklist
- `docs/handover/SPRINT-8-STAGING-ROLLBACK-PLAN.md` — rollback constraints and procedures

### S8-02: Sportmonks Trial Validation (BLOCKED_BY_REPLACEMENT_TOKEN)
- `docs/data/SPRINT-8-SPORTMONKS-TRIAL-VALIDATION.md` — status, security note, no-key state
- `docs/data/SPRINT-8-PROVIDER-COVERAGE-RESULTS.md` — template for results after token available
- `docs/data/SPRINT-8-PROVIDER-FIELD-MAPPING-RESULTS.md` — field mapping template

### S8-03: Automatic Challenge Settlement
- `ChallengeSettlementService.settleAllAcceptedForFixture(fixtureId)` — bulk settle method
- `FootballService.adminUpdateFixtureStatus` — fire-and-forget settlement trigger on FINISHED
- `FootballModule` — imports PredictionChallengesModule
- `PredictionChallengesModule` — exports ChallengeSettlementService
- `POST /predictions/challenges/settle-fixture/:fixtureId` — admin-only manual re-trigger endpoint
- Tests: 12 new API tests in `challenge-settlement-fixture.service.spec.ts`

### S8-04: Challenge Result UX Polish
- `apps/experience/src/app/predict/challenge/result/page.tsx` — new result route
- 18 new experience spec tests covering S8-03, S8-04, S8-02 isolation

### S8-05: Beta Smoke Suite
- `tools/smoke/sprint-8-beta-smoke.mjs` — HTTP smoke tests for API health + preview routes
- `tools/smoke/sprint-8-provider-smoke.mjs` — file-level provider isolation checks

### S8-06: Vercel Preview Refresh
- `apps/experience/docs/SPRINT-8-PREVIEW-STATUS.md` — preview status documentation

### S8-07: Release Gate & Handover
- This document + SPRINT-8-KNOWN-GAPS.md + SPRINT-8-OWNER-REVIEW-GUIDE.md + SPRINT-8-RELEASE-GATE.md + SPRINT-8-ROLLBACK-PLAN.md

## Test Counts
- API tests: see SPRINT-8-RELEASE-GATE.md for final count
- Experience tests: see SPRINT-8-RELEASE-GATE.md for final count

## Migration Status
- No new migrations in Sprint 8
- Migration 43 (challenge settlement) was authored in Sprint 7 and applied to main DB
- Staging: runbook ready, apply pending owner authorization

## Provider Status
- Sportmonks: BLOCKED_BY_REPLACEMENT_TOKEN
- No-key state: all adapter methods return safe empty arrays — confirmed

## Product State
- PSL: INACTIVE
- World Cup 2026: ACTIVE (beta)
- Wallet: Sandbox-only
- Production ingestion: DISABLED
- STORY-40: RESERVED

## Owner Actions Required
1. Revoke exposed Sportmonks token at https://app.sportmonks.com/api-tokens
2. Generate replacement token and place in `.env` or staging SSM
3. Authorize staging migration apply (see runbook)
4. Review challenge settlement automation code changes
