# Sprint 7 — Story Matrix

| Story ID | Title | Owner | Status | Files Changed |
|----------|-------|-------|--------|---------------|
| S7-01 | Sportmonks Trial Activation | API | COMPLETE | `sportmonks.adapter.ts`, `provider-adapter.interface.ts`, `no-op.adapter.ts`, `data-provider.service.ts`, `data-provider.controller.ts` |
| S7-02 | Challenge Settlement Engine | API + Experience | COMPLETE | `schema.prisma`, `migration 42`, `challenge-settlement.service.ts`, `prediction-challenges.controller.ts`, `prediction-challenges.module.ts`, `accept/page.tsx` |
| S7-03 | Beta/Staging Migration Readiness | Infra | COMPLETE | `SPRINT-7-STAGING-MIGRATION-RUNBOOK.md`, `SPRINT-7-STAGING-MIGRATION-ROLLBACK.md` |
| S7-04 | Vercel Preview Refresh | Frontend | DOCUMENTED | N/A — owner action required |
| S7-05 | Live Data Route Upgrade Plan | API | DOCUMENTED | `SPRINT-7-PROVIDER-COVERAGE-REPORT.md` |
| S7-06 | Release Gate | All | COMPLETE | `SPRINT-7-RELEASE-GATE.md` |

---

## Acceptance Criteria Summary

### S7-01: Sportmonks Trial
- Adapter reads `SPORTMONKS_API_KEY` from env (server-side only)
- When no key: all methods return empty arrays / `available: false`
- When key present: fetch with `Authorization: Bearer` header (not query param)
- 401, 429, network errors handled gracefully (no throw)
- `getStandings()` added to interface, NoOp, DataProvider, and Controller

### S7-02: Challenge Settlement
- `POST /predictions/challenges/:token/settle` — admin-only
- `GET /predictions/challenges/:token/result` — public
- Idempotent: second call returns existing result without mutation
- No wallet or ledger records created
- CHALLENGE_SETTLED audit event written for both participants
- Frontend shows settled state with points, winner/draw indicator, "Points only · no real money" disclaimer

### S7-03: Staging Readiness
- Migration 42 runbook documented
- Rollback documented
- PSL NOT activated in runbook
