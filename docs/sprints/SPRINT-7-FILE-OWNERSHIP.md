# Sprint 7 — File Ownership

## API Changes

| File | Story | Change Type |
|------|-------|-------------|
| `apps/api/prisma/schema.prisma` | S7-02 | SETTLED enum value, settlement fields, winner relation |
| `apps/api/prisma/migrations/20260621000003_challenge_settlement/migration.sql` | S7-02 | New migration |
| `apps/api/src/data-provider/provider-adapter.interface.ts` | S7-01 | Added ProviderStandings, getStandings() |
| `apps/api/src/data-provider/no-op.adapter.ts` | S7-01 | Added getStandings() stub |
| `apps/api/src/data-provider/data-provider.service.ts` | S7-01 | Added getStandings() delegation |
| `apps/api/src/data-provider/data-provider.controller.ts` | S7-01 | Added GET /discovery/standings/:seasonId |
| `apps/api/src/data-provider/sportmonks.adapter.ts` | S7-01 | Full v3 implementation with response mapping |
| `apps/api/src/data-provider/sportmonks.adapter.spec.ts` | S7-01 | New spec (14 tests) |
| `apps/api/src/prediction-challenges/challenge-settlement.service.ts` | S7-02 | New service |
| `apps/api/src/prediction-challenges/challenge-settlement.service.spec.ts` | S7-02 | New spec (11 tests) |
| `apps/api/src/prediction-challenges/prediction-challenges.controller.ts` | S7-02 | Added settle + getResult routes |
| `apps/api/src/prediction-challenges/prediction-challenges.module.ts` | S7-02 | Added ChallengeSettlementService provider |

## Experience Changes

| File | Story | Change Type |
|------|-------|-------------|
| `apps/experience/src/app/predict/challenge/accept/page.tsx` | S7-02 | Added SETTLED status handling, result fetch, settled UI |
| `apps/experience/src/lib/experience.spec.ts` | S7-02/S7-01/S7-03 | Appended 13 new tests |

## Documentation

| File | Story |
|------|-------|
| `docs/sprints/SPRINT-7-DELIVERY-PLAN.md` | All |
| `docs/sprints/SPRINT-7-STORY-MATRIX.md` | All |
| `docs/sprints/SPRINT-7-RISK-REGISTER.md` | All |
| `docs/sprints/SPRINT-7-FILE-OWNERSHIP.md` | All |
| `docs/data/SPRINT-7-PROVIDER-COVERAGE-REPORT.md` | S7-01 |
| `apps/experience/docs/SPRINT-7-API-WIRING-MATRIX.md` | S7-02 |
| `docs/handover/SPRINT-7-STAGING-MIGRATION-RUNBOOK.md` | S7-03 |
| `docs/handover/SPRINT-7-STAGING-MIGRATION-ROLLBACK.md` | S7-03 |
| `docs/handover/SPRINT-7-HANDOVER.md` | All |
| `docs/handover/SPRINT-7-KNOWN-GAPS.md` | All |
| `docs/handover/SPRINT-7-OWNER-REVIEW-GUIDE.md` | All |
| `docs/handover/SPRINT-7-RELEASE-GATE.md` | S7-06 |
| `docs/handover/SPRINT-7-ROLLBACK-PLAN.md` | S7-03 |
