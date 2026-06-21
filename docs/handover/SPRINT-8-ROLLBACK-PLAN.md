# Sprint 8 — Rollback Plan

## Scope
Sprint 8 adds no new database migrations. Migration 43 was authored in Sprint 7.
Rollback means reverting Sprint 8 code changes only.

## Code Changes in Sprint 8

### apps/api/src/prediction-challenges/challenge-settlement.service.ts
- Added: `private readonly logger = new Logger(...)`
- Added: `settleAllAcceptedForFixture(fixtureId)` method
- Changed: import added Logger from @nestjs/common

### apps/api/src/prediction-challenges/prediction-challenges.module.ts
- Changed: added `ChallengeSettlementService` to exports array

### apps/api/src/prediction-challenges/prediction-challenges.controller.ts
- Added: `POST settle-fixture/:fixtureId` endpoint (before :token routes)

### apps/api/src/football/football.module.ts
- Changed: added `PredictionChallengesModule` to imports array

### apps/api/src/football/football.service.ts
- Changed: added `ChallengeSettlementService` injection
- Changed: added fire-and-forget trigger in `adminUpdateFixtureStatus`

### apps/experience/src/app/predict/challenge/result/page.tsx
- Added: new file (new route)

### New test files
- apps/api/src/prediction-challenges/challenge-settlement-fixture.service.spec.ts

### New doc files
- docs/sprints/SPRINT-8-*.md
- docs/handover/SPRINT-8-*.md
- docs/data/SPRINT-8-*.md
- tools/smoke/sprint-8-*.mjs
- apps/experience/docs/SPRINT-8-PREVIEW-STATUS.md

## Rollback Steps (code only)
1. Identify last known-good commit (tip of Sprint 7: see git log)
2. Create hotfix branch from Sprint 7 commit
3. Redeploy from that commit
4. No migration action needed (Sprint 8 has no migrations)
5. The settlement columns from migration 43 remain but are unused by Sprint 7 code — safe

## What Rollback Does NOT Do
- Does not remove migration 43 columns (they are additive, nullable, harmless)
- Does not remove SETTLED/CHALLENGE_SETTLED enum values (Postgres enum constraints)
- Does not affect PSL status (INACTIVE either way)

## Rollback Is NOT Required For
- Removing the challenge result page (/predict/challenge/result) — it is a thin redirect
- Removing the settle-fixture endpoint — can be done without schema change
