# PSL Beta Hypercare Plan

> Status: DRAFT  
> Last updated: 2026-06-14 (STORY-39)  
> Hypercare period: First 14 days after beta cohort invite

## Objectives

1. Monitor platform stability with real users
2. Collect structured feedback via `/beta-feedback` endpoint
3. Identify and resolve blockers before wider rollout
4. Confirm World Cup data is isolated from PSL operations

## Monitoring

### Daily checks during hypercare
- `GET /admin/beta-launch/:seasonId/readiness` — all 13 checks remain green
- `GET /admin/beta-feedback/overview` — review new feedback submissions
- `GET /admin/beta-feedback/known-issues` — verify no regressions
- `GET /admin/operations/readiness` — integration providers stable
- `GET /admin/match-centre/ingestion` — ingestion log healthy

### Cohort health
- `GET /admin/beta-launch/cohorts?seasonId=:id` — active member count
- Watch for PAUSED or REMOVED members (may indicate friction)

## Feedback Channels

| Channel | Where |
|---------|-------|
| In-app feedback | `POST /beta-feedback` |
| Admin review | `GET /admin/beta-feedback` |
| Known issues | `GET /admin/beta-feedback/known-issues` |
| UX checklist | `GET /admin/beta-feedback/ux-checklist` |

## Escalation Thresholds

| Severity | Example | Action |
|----------|---------|--------|
| P0 — Data corruption | World Cup data modified | Immediately pause cohort, rollback |
| P1 — Auth failure | Login broken for >10% of cohort | Investigate JWT, rotate if needed |
| P2 — Feature broken | Fantasy team save fails | Hotfix within 24h |
| P3 — UX degraded | Slow page load | Log for next sprint |

## Safety Checks (daily)

- `activationPerformedAt` must remain null
- `Season.isActive` for PSL must remain false
- `Season.isActive` for World Cup must remain true
- No real-money transactions present in wallet logs
- `SocialPredictionPointsEntry` type never `REAL_MONEY_*`

## Exit Criteria

Hypercare period ends when:
- [ ] Zero P0/P1 issues for 7 consecutive days
- [ ] Feedback score positive (>70% positive)
- [ ] All 13 readiness checks pass
- [ ] Rollback dry-run confirmed still clean
- [ ] Sprint 3 planning completed (AWS, live data provider, email/SMS)
