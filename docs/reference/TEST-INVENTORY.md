# PSL One — Test Inventory

**Purpose:** Test file inventory and coverage summary  
**Audience:** Engineers, QA  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Summary

| Metric | Value |
|--------|-------|
| Total API tests | 1,560 |
| API spec files | 54 |
| Web spec files | 3 |
| Test framework | Vitest 4.x |

---

## API Test Files

All spec files in `apps/api/src/`:

| File | Domain |
|------|--------|
| `auth/auth.service.spec.ts` | Auth |
| `users/users.service.spec.ts` | Users |
| `competitions/competitions.service.spec.ts` | Competitions |
| `teams/teams.service.spec.ts` | Teams |
| `players/players.service.spec.ts` | Players |
| `fixtures/fixtures.service.spec.ts` | Fixtures |
| `venues/venues.service.spec.ts` | Venues |
| `gameweek/gameweek.service.spec.ts` | Gameweek |
| `fantasy/fantasy.service.spec.ts` | Fantasy |
| `fantasy-transfers/fantasy-transfers.service.spec.ts` | Fantasy Transfers |
| `fantasy-chips/fantasy-chips.service.spec.ts` | Fantasy Chips |
| `fantasy-rules/fantasy-rules.service.spec.ts` | Fantasy Rules |
| `fantasy-leagues/fantasy-leagues.service.spec.ts` | Fantasy Leagues |
| `fantasy-scoring/fantasy-scoring.service.spec.ts` | Fantasy Scoring |
| `fantasy-auto-sub/fantasy-auto-sub.service.spec.ts` | Auto-Substitution |
| `fantasy-calibration/fantasy-calibration.service.spec.ts` | Fantasy Calibration |
| `predictions/predictions.service.spec.ts` | Predictions |
| `prediction-rules/prediction-rules.service.spec.ts` | Prediction Rules |
| `social-prediction/social-prediction.service.spec.ts` | Social Prediction |
| `match-centre/match-centre.service.spec.ts` | Match Centre |
| `fan-value/fan-value.service.spec.ts` | Fan Value |
| `achievements/achievements.service.spec.ts` | Achievements |
| `rewards/rewards.service.spec.ts` | Rewards |
| `notifications/notifications.service.spec.ts` | Notifications |
| `activity-feed/activity-feed.service.spec.ts` | Activity Feed |
| `engagement/engagement.service.spec.ts` | Engagement |
| `player-stats/player-stats.service.spec.ts` | Player Stats |
| `club-experience/club-experience.service.spec.ts` | Club Experience |
| `fixture-import/fixture-import.service.spec.ts` | Fixture Import |
| `squad-import/squad-import.service.spec.ts` | Squad Import |
| `season-switching/season-switching.service.spec.ts` | Season Switching |
| `gameweek-ops/gameweek-ops.service.spec.ts` | Gameweek Ops |
| `media/media.service.spec.ts` | Media |
| `campaigns/campaigns.service.spec.ts` | Campaigns |
| `campaigns/campaign-trigger.service.spec.ts` | Campaign Triggers |
| `wallet/wallet.service.spec.ts` | Wallet |
| `admin-operations/admin-operations.service.spec.ts` | Admin Operations |
| `admin-dashboard/admin-dashboard.service.spec.ts` | Admin Dashboard |
| `beta-feedback/beta-feedback.service.spec.ts` | Beta Feedback |
| `beta-launch/beta-launch.service.spec.ts` | Beta Launch |
| `beta-launch/beta-launch-smoke-test.service.spec.ts` | Beta Smoke Tests |
| + remaining spec files (54 total) | Various |

---

## Web Test Files

Minimal web tests (3 spec files) — web is tested primarily through build + manual review.

---

## Test Philosophy

- **Unit tests only** in current build — Prisma mocked via `vi.fn()`
- **No integration tests** against real database — mock pattern only
- **No end-to-end tests** — planned for Sprint 3
- **No web component tests** — Next.js pages are build-tested

---

## Running Tests

```bash
# Full test suite
pnpm --filter @psl-one/api test

# Single module
pnpm --filter @psl-one/api test <module-name>

# Watch mode
pnpm --filter @psl-one/api test:watch

# Coverage
pnpm --filter @psl-one/api test:cov
```

---

## Coverage Areas by Domain

| Domain | Coverage |
|--------|---------|
| Auth | Core flows: login, register, JWT validation |
| Fantasy | Team selection, transfers, chips, scoring, auto-sub |
| Predictions | Submit, lock, settle, void, points ledger |
| Social Prediction | Listings, marketplace, direct challenge, atomic acceptance, settlement |
| Fan Value | Award, history, season scope |
| Achievements | Unlock, badge, side effects |
| Admin | RBAC, audit log, all admin mutations |
| Beta Launch | Readiness, dry-run, rollback, cohorts, smoke tests |
| Season Switching | All 13 checks, transactional switch, rollback |

---

## Test Gaps (Known)

- No integration tests (Prisma real database)
- No end-to-end tests (browser-level)
- No load tests (2M fan validation)
- No performance tests (query benchmarks)
- No contract tests (API interface stability)
- Minimal web component tests
