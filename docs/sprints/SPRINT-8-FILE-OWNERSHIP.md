# Sprint 8 — File Ownership

## S8-01: Staging Migration Readiness
- `docs/handover/SPRINT-8-STAGING-MIGRATION-RUNBOOK.md` — migration sequence, commands, smoke checks
- `docs/handover/SPRINT-8-STAGING-MIGRATION-CHECKLIST.md` — pre/post checklist
- `docs/handover/SPRINT-8-STAGING-ROLLBACK-PLAN.md` — rollback steps and constraints

## S8-02: Sportmonks Trial Validation
- `docs/data/SPRINT-8-SPORTMONKS-TRIAL-VALIDATION.md` — BLOCKED_BY_REPLACEMENT_TOKEN; security note; no-key state
- `docs/data/SPRINT-8-PROVIDER-COVERAGE-RESULTS.md` — template; to be filled after token available
- `docs/data/SPRINT-8-PROVIDER-FIELD-MAPPING-RESULTS.md` — template; field mapping to be confirmed with real data

## S8-03: Automatic Challenge Settlement
- `apps/api/src/prediction-challenges/challenge-settlement.service.ts` — added `settleAllAcceptedForFixture`, Logger
- `apps/api/src/prediction-challenges/prediction-challenges.module.ts` — added ChallengeSettlementService to exports
- `apps/api/src/prediction-challenges/prediction-challenges.controller.ts` — added `POST settle-fixture/:fixtureId` (admin-only, BEFORE :token routes)
- `apps/api/src/football/football.module.ts` — added PredictionChallengesModule import
- `apps/api/src/football/football.service.ts` — added ChallengeSettlementService injection + fire-and-forget trigger on FINISHED
- `apps/api/src/prediction-challenges/challenge-settlement-fixture.service.spec.ts` — new; 9 unit tests + 3 integration wiring tests

## S8-04: Challenge Result UX Polish
- `apps/experience/src/app/predict/challenge/result/page.tsx` — new result route (redirects to accept with token)
- `apps/experience/src/lib/experience.spec.ts` — appended S8 test suites (S8-03, S8-04, S8-02 isolation)

## S8-05: Beta Smoke Suite
- `tools/smoke/sprint-8-beta-smoke.mjs` — HTTP smoke tests for API health and preview routes
- `tools/smoke/sprint-8-provider-smoke.mjs` — file-level checks for provider key isolation and doc presence

## S8-06: Vercel Preview Refresh
- `apps/experience/docs/SPRINT-8-PREVIEW-STATUS.md` — current preview URL and readiness status

## S8-07: Release Gate & Handover
- `docs/handover/SPRINT-8-HANDOVER.md` — sprint summary, test counts, known gaps
- `docs/handover/SPRINT-8-KNOWN-GAPS.md` — documented gaps and owner actions
- `docs/handover/SPRINT-8-OWNER-REVIEW-GUIDE.md` — what to review and how
- `docs/handover/SPRINT-8-RELEASE-GATE.md` — gate table with all checks
- `docs/handover/SPRINT-8-ROLLBACK-PLAN.md` — code rollback steps

## Files NOT modified in Sprint 8
- `prisma/schema.prisma` — no schema changes
- `prisma/migrations/` — no new migrations (migration 43 was added in Sprint 7)
- `apps/api/src/football/football.controller.ts` — no controller changes needed
- Any AWS/Terraform files
- Any wallet/payment files
