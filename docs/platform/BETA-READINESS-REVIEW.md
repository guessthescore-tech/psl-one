# PSL One — Beta Readiness Review

> **Historical Implementation Record** — This document was created during Sprint delivery as a working reference. It may be superseded by content in `docs/architecture/`, `docs/engineering/`, `docs/reference/`, or `docs/domain/`. Do not use as the canonical source for system behaviour.


**Purpose:** Assess platform readiness for World Cup 2026 beta testing  
**Date:** 2026-06-13 (updated STORY-36)  
**Status:** BETA-READY (World Cup validation mode)

---

## 1. Beta Goal

Validate all platform mechanics with real fans during the FIFA World Cup 2026, before the PSL season begins. Use World Cup match data to exercise fantasy, predictions, fan value, achievements, social features, and the admin operating model.

**Not a production launch.** AWS deployment, commerce, and external services are Sprint 3.

---

## 2. What Can Be Tested During World Cup

| Feature Area | Beta Status | Notes |
|-------------|-------------|-------|
| Registration & Login | ✅ Ready | JWT auth, password reset (token delivery manual for beta) |
| Football data browsing | ✅ Ready | All 48 WC 2026 teams, 1200 players, 104 fixtures seeded |
| Fantasy team creation | ✅ Ready | Squad of up to 25, WC 2026 players |
| Fantasy transfers | ✅ Ready | Free transfer limits, penalties, rollover |
| Fantasy chips | ✅ Ready | Wildcard, Free Hit, Triple Captain, Bench Boost |
| Fantasy scoring | ✅ Ready | Admin-triggered settlement; auto-subs |
| Fantasy leagues | ✅ Ready | Private/public/global leagues, standings |
| Guess the Score | ✅ Ready | Predictions with lock/settle/void cycle |
| Peer challenges | ✅ Ready | Head-to-head Fan Value wager (non-financial) |
| Fan Value | ✅ Ready | Earned from all activities; no cash value |
| Achievements | ✅ Ready | 17 definitions seeded, auto-evaluation on actions |
| Reward readiness | ✅ Ready | 6 definitions seeded; eligibility evaluation |
| Notifications | ✅ Ready | In-app inbox, preferences, admin broadcast |
| Activity feed | ✅ Ready | Social feed, reactions, moderation |
| Admin command centre | ✅ Ready | Full operational visibility |
| Live match dashboard | ✅ Ready | Admin-driven score/event management |
| Player prices | ✅ Ready | Fantasy prices on all players |
| Player match stats | ✅ Ready | DRAFT→VERIFIED→PUBLISHED→LOCKED lifecycle; admin entry pipeline; fan views |
| Admin audit log | ✅ Ready | Append-only `AdminAuditLog`; playerStats publish/lock writes; other domain writes Sprint 3 |
| Beta feedback panel | ✅ Ready | Overview, known issues, UX checklist, release notes at `/admin/beta-feedback` |

---

## 3. Fan Beta Test Flows

### Flow 1: Register and Set Up Profile
1. Go to `/register`, create account with email + password
2. Login at `/login`, receive JWT
3. Set display name, favourite team, bio at `/profile/edit`
4. Set notification preferences at `/profile/preferences`

### Flow 2: Browse Competition Data
1. View competition at `/football/competitions`
2. Browse teams at `/football/teams`
3. Click into a team to see roster
4. Browse fixtures at `/football/fixtures`
5. View standings at `/football/standings`

### Flow 3: Build a Fantasy Team
1. Go to `/fantasy/team/create`
2. Pick 11 starting players + 4 bench from `/fantasy/player-pool`
3. Set captain and vice-captain
4. View team at `/fantasy/team`
5. Check transfer deadline at `/fantasy/deadline`

### Flow 4: Make Transfers
1. Go to `/fantasy/transfers`
2. Swap a player in for one out
3. View transfer status (free transfers remaining)
4. View updated team

### Flow 5: Use Fantasy Chips
1. Go to `/fantasy/chips`
2. Activate Wildcard before a gameweek
3. Make unlimited transfers
4. View chip status after gameweek

### Flow 6: Predict Match Scores
1. Go to `/predictions/fixtures`
2. Select an upcoming fixture
3. Enter predicted home/away score
4. View prediction at `/predictions/me`
5. After match: view points awarded

### Flow 7: Create a Peer Challenge
1. Go to `/challenges`
2. Challenge another fan on a specific fixture
3. Set Fan Value challenge amount (fan points only — non-financial)
4. Other fan accepts at `/challenges/[id]`
5. After match: view settlement

### Flow 8: View Fan Value
1. Go to `/fan-value`
2. View total balance and recent entries
3. See breakdown by type at `/fan-value/by-type`
4. See breakdown by source at `/fan-value/by-source`

### Flow 9: Earn Achievements
1. After making a prediction → "First Prediction" achievement unlocks
2. After creating fantasy team → "Fantasy Team Created" achievement unlocks
3. View achievements at `/achievements`
4. View badges at `/achievements/badges`
5. Check progress at `/achievements/progress`

### Flow 10: Check Reward Readiness
1. Go to `/rewards`
2. View eligibility status for each definition
3. View what criteria are needed at `/rewards/locked`
4. View eligible rewards at `/rewards/eligible`

### Flow 11: Use Notifications
1. After prediction settles → notification appears in `/notifications`
2. View notification detail at `/notifications/[id]`
3. Mark as read
4. Set preferences at `/notifications/preferences`

### Flow 12: Browse Activity Feed
1. Go to `/activity` for global feed
2. React to activity items with LIKE/FIRE/SHOCK/TROPHY/HEART
3. View own activity at `/activity/me`
4. View item detail at `/activity/[id]`

### Flow 13: View Fantasy History
1. After gameweek scores → view at `/fantasy/history`
2. Drill into gameweek at `/fantasy/history/[gameweekId]`
3. View league standings at `/fantasy/leagues/[id]`

---

## 4. Admin Beta Test Flows

### Flow A: Data Operations
1. Login as `admin@psl.co.za` / `Admin1234!`
2. View admin command centre at `/admin/dashboard`
3. Import or manually add fixture data at `/admin/imports/manual`
4. Assign fixtures to gameweeks at `/admin/fixtures/assignments`

### Flow B: Predictions Management
1. Lock predictions before kickoff at `/admin/predictions/settlement`
2. After match: settle predictions (awards points)
3. Void a postponed fixture

### Flow C: Fantasy Operations
1. Push match stats for a fixture at `/admin/fantasy/scoring`
2. Settle fantasy points for the gameweek
3. Process auto-substitutions at `/admin/fantasy/auto-subs`
4. Roll over unused transfers

### Flow D: Live Match Management
1. View live dashboard at `/admin/football/live`
2. Update match score during game
3. Add goal event (assigns scorer, assists)
4. Push half-time / full-time events

### Flow E: Fan Management
1. View fan value summary at `/admin/fan-value`
2. View achievement stats at `/admin/achievements`
3. Award achievement to a specific fan
4. Evaluate reward readiness for all fans

### Flow F: Content Moderation
1. View activity feed at `/admin/activity`
2. Hide inappropriate activity item
3. View hidden items
4. Unhide if needed

### Flow G: Notifications
1. Send notification to specific fan at `/admin/notifications/send`
2. Broadcast to all fans at `/admin/notifications/broadcast`
3. Send fantasy deadline alert

### Flow H: Command Centre
1. Open `/admin/dashboard` — see action-required alerts
2. Navigate to Guess the Score section — see pending settlement
3. Navigate to System section — verify all systems green
4. Navigate to Compliance section — check notification delivery failure rate

---

## 5. Data Assumptions

- World Cup 2026 structure: 48 teams, 12 groups of 4, 104 fixtures
- 9 gameweeks aligned to tournament rounds
- 1200 players (25 per team average)
- Fantasy prices based on seeded `fantasyPrice` values on `Player`
- Achievement definitions assume WC structure (group games, knockout rounds)
- Admin user: `admin@psl.co.za` / `Admin1234!` (seed-created)
- Prediction scoring: 10/5/3/0 points (exact/diff/result/miss)

---

## 6. Known Limitations

| Limitation | Impact | Sprint |
|-----------|--------|--------|
| No email/SMS/push notifications | In-app only | Sprint 3 |
| No real live sports data provider | Admin must push score/events manually | Sprint 2/3 |
| Web pages used dev-token placeholder | Resolved in STORY-35: 34 pages migrated to `getBetaToken()` | Sprint 3 full session |
| No rewards redemption workflow | Eligibility only, no fulfilment | Sprint 3 |
| Fan Value has no monetary backing | Engagement metric only (by design) | — |
| Prediction settlement is manual | Admin must trigger | Sprint 2 automation |
| Fantasy auto-subs are manual | Admin must trigger | Sprint 2 automation |
| No POPIA compliance workflows | Manual data handling | Sprint 3 |
| No CI/CD pipeline | Manual deployment | Sprint 3 |

---

## 7. Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| WC 2026 player prices are not calibrated for interesting fantasy | Medium | Admin can update prices via API before launch |
| Manual match score/event entry error | Medium | Admin tools are clear; event pipeline validates |
| Fan registration volume overwhelming local DB | N/A for beta | Production uses RDS in Sprint 3 |
| Achievement criteria misaligned with WC format | Low | 17 definitions are generic enough to apply |
| Seed data FK violation on fresh database | Low | Seed script ordering is correct and tested |

---

## 8. Demo Script

**5-minute admin demo:**
1. Open `/admin/dashboard` — show KPI cards, action-required alerts, 11 sections
2. Navigate to `/admin/dashboard/guess-the-score` — show prediction stats
3. Navigate to `/admin/football/live` — show live match management panel
4. Navigate to `/admin/dashboard/system` — show platform health (all green)
5. Navigate to `/admin/fantasy/scoring` — show gameweek settlement controls

**5-minute fan demo:**
1. Open `/football` — browse WC fixtures and teams
2. Open `/fantasy/team` — show starting XI and bench
3. Open `/predictions/me` — show prediction history and points
4. Open `/achievements` — show unlocked achievements and badges
5. Open `/fan-value` — show FV total and transaction breakdown
6. Open `/activity` — show social feed with reactions

---

## 9. QA Checklist

### Backend
- [x] All 1293 API tests pass (updated STORY-36)
- [x] Prisma schema valid
- [x] Seed runs cleanly on fresh database
- [x] All migrations apply cleanly in sequence
- [x] JWT auth returns 401 for missing/invalid tokens
- [x] PSL_ADMIN routes return 403 for FAN tokens
- [x] Prediction settlement awards correct points (10/5/3/0)
- [x] Fantasy transfer limits enforced per gameweek
- [x] Fantasy chip rules enforced (one active, one per type per season)
- [x] Auto-sub records show correct skip reason when no eligible sub
- [x] Player stats lifecycle: LOCKED blocks mutation; PUBLISHED blocks delete
- [x] AdminAuditLog writes on playerStats publish/lock
- [x] Beta feedback routes: PSL_ADMIN=200, FAN=403, unauth=401
- [x] Squad import batch lifecycle: DRAFT→VALIDATED→IMPORTED→PUBLISHED, duplicates detected
- [x] Fantasy price calibration: bounds validation, bulk defaults, `pricesHaveNoCashValue: true` enforced
- [x] Season switching: 13 readiness checks (squad import + price calibration added STORY-36)
- [x] Activation dry-run: read-only, `dryRunOnly: true`, `activationWillNotBePerformed: true`

### Frontend
- [x] All 8 web tests pass
- [x] TypeScript clean (0 errors)
- [x] Web build succeeds (static + dynamic pages compiled, 17 new pages STORY-36)
- [x] Admin pages require PSL_ADMIN JWT (return 401 otherwise)
- [x] Fan pages render seeded competition, team, fixture data
- [x] Admin command centre loads all module readiness sections (SQUAD_IMPORT + FANTASY_PRICE_CALIBRATION added)
- [x] All dev-token placeholders replaced with `getBetaToken()`
- [x] Port defaults corrected to 4000 across all web clients

### Integration
- [x] Prediction settlement → Fan Value entry created
- [x] Achievement evaluation → FanAchievement + FanBadge created
- [x] Activity post → ActivityItem created after key fan actions
- [x] Notification sent → NotificationDeliveryLog created

---

## 10. Go / No-Go Criteria

### GO ✅
- API tests: 1293/1293 pass
- Web typechecks: clean
- Seed: runs without errors
- Admin login: `admin@psl.co.za` authenticates successfully
- Fan registration: creates user + profile in single request
- Fantasy team creation: enforces squad rules
- Prediction scoring: correct points for exact/diff/result/miss
- Achievement evaluation: awards achievement on trigger
- Player stats: LOCKED stat blocks mutation; fan sees only PUBLISHED/VERIFIED

### NO-GO 🚫
- Any API test regression below 1293
- Prisma schema validation failure
- Seed failure on fresh database
- Auth bypass (PSL_ADMIN routes accessible without PSL_ADMIN role)
- Password hash exposure in any API response
- Financial mechanics introduced (betting, odds, stakes, fiat, crypto)

---

## STORY-38 Update

**New test gate:** 1528 API tests passing (53 spec files). Both typechecks clean. 319 web pages.

### New capabilities

- Direct fan-to-fan challenges with atomic acceptance and immutable history
- Campaign trigger engine (9 event types, idempotent, failure-isolated)
- 10 fan match centre pages (live scores, lineups, stats, fantasy preview, predictions, social)
- 11 admin live-match operations pages (lifecycle actions, events, stats, impact views)
- PostgreSQL concurrency integration test (`direct-challenge-concurrency.integration.spec.ts`)

### GO / NO-GO update

**GO ✅ additions:**
- Direct challenge acceptance: atomic `$transaction`, no double-spend
- Decline/withdraw: immutable history — `invitationStatus` only, never re-publishes
- Campaign triggers: failure-isolated, time-window-enforced
- Admin live-match pages: kick off / half time / full time / reopen actions all wired

**NO-GO 🚫 unchanged:**
- Financial mechanics: still fully excluded
- Real provider calls: none
- Auth bypass: not possible
- Test regression: gate is 1528 tests

## STORY-39 — PSL Season Activation, Frontend Showcase & Beta Launch Readiness

**Story:** Beta launch readiness — 13-check gate, cohort management, dry-run analysis, approval records (APPROVED not ACTIVATED).

### What changed

- `BetaLaunchModule` with 27 routes, 32 new API tests, `ACTIVATION_DISABLED_NOTICE` constant
- `BetaCohort`, `BetaCohortMember`, `SeasonActivationApproval` — 3 new models, migration 20260614000001
- 24-item smoke test registry — programmatically confirmed: `activationRouteAbsent: true`, `allNonDestructive: true`
- 8 new `AdminOperations` module readiness entries covering all beta dimensions
- 17 admin beta-launch pages + 1 fan `/beta` landing page
- `completedStories`: 14, `apiTestCount`: 1560, `webPageCount`: 336
- 5 new platform docs: runbook, rollback runbook, hypercare plan, frontend walkthrough, smoke test plan

### GO / NO-GO update

**GO ✅ additions:**
- 13-check readiness gate delegates to existing `SeasonSwitchingService` — no duplication
- Approval: status `APPROVED`, `activationPerformedAt` is null, season NOT activated
- Dry-run: `dryRunOnly: true`, `activationWillNotBePerformed: true` always present
- Rollback dry-run: `rollbackWillNotBePerformed: true`, `worldCupHistoryPreserved: true` always present
- Smoke tests: `activationRouteAbsent: true` confirmed programmatically

**NO-GO 🚫 unchanged:**
- Season activation: NOT performed in STORY-39; endpoint does not exist
- Financial mechanics: still fully excluded
- Real provider calls: none
- Auth bypass: not possible
- Test regression: gate is 1560 tests (32 new, 0 regressions)

### Final beta readiness assessment

| Dimension | Status |
|-----------|--------|
| Football data | READY (16 clubs, 96 players, provisional fixtures) |
| Fantasy | READY (rules configurable, calibration module built) |
| Guess the Score | READY (lock/settle/void lifecycle, prediction rules) |
| Social prediction gaming | READY (FIFO matching, direct challenges, atomic acceptance) |
| Match Centre | READY (standings, form, player ratings, sandbox ingestion) |
| Leaderboards | READY (season-scoped, WC and PSL isolated) |
| Fan Value | READY (non-financial, ledger, achievements) |
| Media | READY (rights gate, engagement deduplication) |
| Campaigns | READY (full lifecycle, trigger engine) |
| Wallet | SANDBOX_ONLY (SiliconEnterpriseSandboxWalletAdapter) |
| Notifications | READY (in-app only; email/SMS Sprint 3) |
| Activity Feed | READY |
| Rewards | READY |
| Admin operations | READY (AdminOperationsModule, 29 module readiness entries) |
| Beta cohort | READY (BetaCohort lifecycle, member management) |
| Beta readiness gate | READY (13-check, approval, dry-run, rollback dry-run) |
| Season activation | PENDING (approval record created; activation not performed) |
