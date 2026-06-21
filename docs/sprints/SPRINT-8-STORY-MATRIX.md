# Sprint 8 — Story Matrix

| Story | Title | Owner | Files Changed | Tests |
|-------|-------|-------|---------------|-------|
| S8-01 | Staging Migration Readiness | Backend | docs/handover/SPRINT-8-STAGING-MIGRATION-RUNBOOK.md, docs/handover/SPRINT-8-STAGING-MIGRATION-CHECKLIST.md, docs/handover/SPRINT-8-STAGING-ROLLBACK-PLAN.md | N/A |
| S8-02 | Sportmonks Trial Validation | Backend | docs/data/SPRINT-8-SPORTMONKS-TRIAL-VALIDATION.md, docs/data/SPRINT-8-PROVIDER-COVERAGE-RESULTS.md, docs/data/SPRINT-8-PROVIDER-FIELD-MAPPING-RESULTS.md | BLOCKED_BY_REPLACEMENT_TOKEN |
| S8-03 | Automatic Challenge Settlement | Backend | apps/api/src/prediction-challenges/challenge-settlement.service.ts, apps/api/src/prediction-challenges/prediction-challenges.module.ts, apps/api/src/prediction-challenges/prediction-challenges.controller.ts, apps/api/src/football/football.module.ts, apps/api/src/football/football.service.ts, apps/api/src/prediction-challenges/challenge-settlement-fixture.service.spec.ts | +14 API tests |
| S8-04 | Challenge Result UX Polish | Frontend | apps/experience/src/app/predict/challenge/result/page.tsx, apps/experience/src/lib/experience.spec.ts | +18 experience tests |
| S8-05 | Beta Smoke Suite | DevOps | tools/smoke/sprint-8-beta-smoke.mjs, tools/smoke/sprint-8-provider-smoke.mjs | smoke scripts |
| S8-06 | Vercel Preview Refresh | Frontend | apps/experience/docs/SPRINT-8-PREVIEW-STATUS.md | N/A |
| S8-07 | Release Gate & Handover | All | docs/handover/SPRINT-8-HANDOVER.md, docs/handover/SPRINT-8-KNOWN-GAPS.md, docs/handover/SPRINT-8-OWNER-REVIEW-GUIDE.md, docs/handover/SPRINT-8-RELEASE-GATE.md, docs/handover/SPRINT-8-ROLLBACK-PLAN.md | N/A |

## Dependency Order
```
S8-01 (runbook) → S8-03 (settlement code) → S8-04 (UX) → S8-05 (smoke) → S8-07 (gate)
S8-02 (provider docs) → S8-05 (smoke) [provider smoke checks docs]
S8-06 (preview status) — independent
```

## Status Legend
- COMPLETE: code written, tests passing, typechecks green
- DOCUMENTED: no code required, doc-only story
- BLOCKED_BY_REPLACEMENT_TOKEN: blocked pending owner action (revoke old token, issue new token)
