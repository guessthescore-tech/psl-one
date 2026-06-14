# PSL Beta Launch Runbook

> **Historical Implementation Record** — This document was created during Sprint delivery as a working reference. It may be superseded by content in `docs/architecture/`, `docs/engineering/`, `docs/reference/`, or `docs/domain/`. Do not use as the canonical source for system behaviour.


> Status: DRAFT — activation not yet performed  
> Last updated: 2026-06-14 (STORY-39)  
> Safety: Do NOT activate PSL season without explicit PSL_ADMIN approval and all 13 readiness checks passing.

## Pre-Launch Checklist

### Phase 1 — Data Verification
- [ ] `pnpm --filter @psl-one/api db:seed` completes with no errors (run twice to confirm idempotency)
- [ ] 16 PSL clubs seeded at `/admin/clubs`
- [ ] 96 PSL players with provisional prices at `/admin/squad-import`
- [ ] PSL fixture schedule imported and published at `/admin/fixtures`
- [ ] Fantasy rules promoted from PROVISIONAL → ACTIVE at `/admin/fantasy/rules`
- [ ] Prediction rules promoted from PROVISIONAL → ACTIVE at `/admin/predictions/rules`
- [ ] PSL gameweeks created and confirmed at `/admin/gameweeks`

### Phase 2 — Season Switching Readiness (13 checks)
Navigate to `GET /admin/beta-launch/:pslSeasonId/readiness` and confirm all 13 checks pass.

| # | Check | Expected |
|---|-------|----------|
| 1 | clubs | PASS |
| 2 | fixtures_published | PASS |
| 3 | fantasy_rules | PASS |
| 4 | predictions_rules | PASS |
| 5 | player_prices | PASS |
| 6 | gameweeks | PASS |
| 7 | matchday_ops | PASS |
| 8 | prediction_calibration | PASS |
| 9 | gameweek_operations | PASS |
| 10 | squad_import | PASS |
| 11 | fantasy_price_calibration | PASS |
| 12 | beta_feedback | PASS |
| 13 | activation_approval | PASS or WARN |

### Phase 3 — Frontend Walkthrough
For each domain confirm admin and fan pages load with real seeded data:

1. Authentication — `/login`, `/admin`
2. Clubs — `/admin/clubs`, `/clubs`
3. Players — `/admin/player-stats`, `/players`
4. Fixtures — `/admin/fixtures`, `/fixtures`
5. Match Centre — `/admin/match-centre`, `/match-centre`
6. Fantasy — `/admin/fantasy`, `/fantasy`
7. Guess the Score — `/admin/predictions`, `/predictions`
8. Social Predictions — `/admin/social-predictions`, `/social-predictions`
9. Leaderboards — `/admin/engagement`, `/leaderboards`
10. Fan Value — `/admin/fan-value`, `/fan-value`
11. Achievements — `/admin/achievements`, `/achievements`
12. Notifications — `/admin/notifications`, `/notifications`
13. Activity Feed — `/admin/activity`, `/activity`
14. Campaigns — `/admin/campaigns`, `/campaigns`
15. Rewards — `/admin/rewards`, `/rewards`
16. Wallet Sandbox — `/admin/wallet`, `/wallet`
17. Media — `/admin/media`, `/media`
18. Beta Feedback — `/admin/beta-feedback`
19. Beta Launch — `/admin/beta-launch`, `/beta`

### Phase 4 — Security & RBAC Verification
- [ ] All admin routes return 401 without JWT
- [ ] All PSL_ADMIN routes return 403 with fan JWT
- [ ] No activation route exists at `POST /admin/beta-launch/*/activate`
- [ ] `ACTIVATION_DISABLED_NOTICE` present in dry-run responses
- [ ] Dry-run response carries `dryRunOnly: true`

### Phase 5 — Beta Cohort Setup
1. Create cohort at `POST /admin/beta-launch/cohorts` with `{ name, slug, seasonId }`
2. Set `maxUsers` limit before inviting users
3. Invite initial wave at `POST /admin/beta-launch/cohorts/:cohortId/members`
4. Start cohort at `POST /admin/beta-launch/cohorts/:cohortId/start`
5. Confirm: cohort start does NOT change `Season.isActive`

### Phase 6 — Approval Record (NOT activation)
1. Run dry-run at `POST /admin/beta-launch/:seasonId/dry-run` — confirm `activationWillNotBePerformed: true`
2. Confirm rollback dry-run at `POST /admin/beta-launch/:seasonId/rollback-dry-run`
3. Check all 6 verification flags before creating approval
4. Create approval at `POST /admin/beta-launch/:seasonId/approve`
5. Confirm `approvalStatus: 'APPROVED'` (NOT `ACTIVATED`)
6. Confirm `activationPerformedAt` is null

### Phase 7 — Smoke Tests
Run smoke test registry audit at `POST /admin/beta-launch/smoke-tests/run`.
Confirm `activationRouteAbsent: true` and `allNonDestructive: true`.

## Season Activation (FUTURE — NOT IN STORY-39)

Season activation has NOT been implemented in STORY-39. When activation is scheduled:
1. A new deployment window must be arranged with PSL operations
2. A new endpoint will be wired: `POST /admin/seasons/:seasonId/activate`
3. Activation will transition `Season.isActive = true` and emit `SeasonActivated` event
4. This must NOT be done from the BetaLaunchModule (read-only)

## Rollback Plan
See `PSL-BETA-ROLLBACK-RUNBOOK.md` for rollback procedure.

## Contacts
- Technical: guessthescore2@gmail.com
- This is a local beta — no AWS, no production database
