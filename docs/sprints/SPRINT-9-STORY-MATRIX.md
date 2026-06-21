# Sprint 9 — Story Matrix

| Story | Title | Status | Key Files | Gate |
|-------|-------|--------|-----------|------|
| S9-01 | Provider Replacement-Key Validation | TOOLING_COMPLETE / BLOCKED_BY_REPLACEMENT_TOKEN | `tools/discovery/provider-*.mjs`, `docs/data/SPRINT-9-PROVIDER-*.md` | Keys present + health check passes |
| S9-02 | Staging Migration Apply Gate | RUNBOOK_COMPLETE / STAGING_APPLY_PENDING_OWNER_AUTHORIZATION | `docs/handover/SPRINT-9-STAGING-MIGRATION-*.md` | Explicit owner authorization received |
| S9-03 | Staging Challenge Flow Smoke Suite | FILE_CHECKS_PASS / LIVE_PENDING_SERVER | `tools/smoke/sprint-9-*.mjs`, `docs/handover/SPRINT-9-SMOKE-RESULTS.md` | Running API server |
| S9-04 | Provider Decision Gate | RECOMMENDATION_COMPLETE / PENDING_TRIAL | `docs/data/SPRINT-9-PROVIDER-DECISION-RECOMMENDATION.md` | Live trial results |
| S9-05 | Beta Release Readiness Gate | COMPLETE / OVERALL_NO-GO | `docs/handover/SPRINT-9-BETA-GO-NOGO.md`, `docs/handover/SPRINT-9-HANDOVER.md` | Migration apply + provider validation |

## Sprint 9 Overall Status: NO-GO for live beta activation

Blockers:
1. Replacement provider keys not yet in local env
2. Staging migration apply not yet authorized by owner
