# PSL One — Frontend Route Inventory

> **Historical Implementation Record** — This document was created during Sprint delivery as a working reference. It may be superseded by content in `docs/architecture/`, `docs/engineering/`, `docs/reference/`, or `docs/domain/`. Do not use as the canonical source for system behaviour.


**Framework:** Next.js 14 App Router  
**Base URL (local):** `http://localhost:3001`  
**Auth:** Bearer token from login (stored in component state; `dev-token` placeholder in Sprint 1)  
**Sprint:** 1 Final

All pages verified from `apps/web/src/app/` directory scan.

---

## Public / Auth Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/` | Home / landing page | None | — | Links to login/register |
| `/login` | Fan login form | None | `auth-client` | Stores JWT in state |
| `/register` | Fan registration form | None | `auth-client` | Creates account + profile |
| `/forgot-password` | Request password reset | None | `auth-client` | Token delivery is Sprint 3 |
| `/reset-password` | Confirm new password | None | `auth-client` | Uses reset token |
| `/health` | Frontend health check | None | `api.ts` | Pings API /health |

---

## Football Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/football` | Football hub | None | `football-client` | Links to sub-sections |
| `/football/competitions` | Competition list | None | `football-client` | All competitions |
| `/football/seasons` | Season list | None | `football-client` | With status filter |
| `/football/teams` | Team list | None | `football-client` | With season/competition filter |
| `/football/teams/[slug]` | Team detail | None | `football-client` | Roster, fixtures |
| `/football/players` | Player pool | None | `football-client` | With team/position filter |
| `/football/fixtures` | Fixture list | None | `football-client` | With status/date filters |
| `/football/fixtures/[id]` | Fixture detail | None | `football-client` | Score, events, lineups |
| `/football/standings` | League table | None | `football-client` | By competition/season |
| `/football/match-centre/[fixtureId]` | Live match centre | None | `football-client` | Combined live view |

---

## Profile Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/account` | Account overview | FAN | `auth-client` | Links to profile/preferences |
| `/profile` | Fan profile view | FAN | `profile-client` | Display name, bio, team, FV total |
| `/profile/edit` | Edit profile | FAN | `profile-client` | Update display name, bio, avatar |
| `/profile/preferences` | Notification preferences | FAN | `profile-client` | Opt in/out per notification type |

---

## Guess the Score Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/predictions` | Prediction hub | FAN | `predictions-client` | Overview of prediction activity |
| `/predictions/fixtures` | Fixtures to predict | FAN | `predictions-client` | Upcoming fixtures with open predictions |
| `/predictions/fixtures/[id]` | Make/view prediction | FAN | `predictions-client` | Predict home/away score |
| `/predictions/me` | My predictions | FAN | `predictions-client` | History, points, status breakdown |
| `/leaderboards/predictions` | Prediction leaderboard | None | `leaderboards-client` | Top fans by points, season-scoped |

---

## Leaderboards Pages (STORY-33)

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/leaderboards` | Leaderboard overview | None | `leaderboards-client` | Top-5 snapshot across all 4 types; season selector |
| `/leaderboards/overall` | Overall leaderboard | None | `leaderboards-client` | Fan Value based to avoid double-counting |
| `/leaderboards/fan-value` | Fan Value leaderboard | None | `leaderboards-client` | Non-financial; season-scoped with WC accessible via `?seasonSlug=` |
| `/leaderboards/fantasy` | Fantasy leaderboard | None | `leaderboards-client` | Points-only; no paid entry |
| `/leaderboards/predictions` | Predictions leaderboard | None | `leaderboards-client` | Points-only; no wagering |
| `/leaderboards/achievements` | Achievements leaderboard | None | `leaderboards-client` | Always ALL_TIME (cross-season by design) |

---

## Peer Challenges Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/challenges` | Challenge hub | FAN | `challenges-client` | Sent and received challenges |
| `/challenges/[id]` | Challenge detail | FAN | `challenges-client` | Accept/decline/view result |

---

## Fantasy Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/fantasy` | Fantasy hub | FAN | `fantasy-client` | Team summary, quick links |
| `/fantasy/team` | My fantasy team | FAN | `fantasy-client` | Starting XI + bench view |
| `/fantasy/team/create` | Create team | FAN | `fantasy-client` | Initial squad selection |
| `/fantasy/transfers` | Manage transfers | FAN | `fantasy-client` | Transfer in/out, cost preview |
| `/fantasy/player-pool` | Browse all players | FAN | `fantasy-client` | By position/team/price |
| `/fantasy/player-pool/[fixtureId]` | Players for fixture | FAN | `fantasy-client` | Fixture-specific pool |
| `/fantasy/player-prices` | Player price list | FAN | `fantasy-client` | All prices by position |
| `/fantasy/chips` | Fantasy chips | FAN | `fantasy-client` | Activate Wildcard/FreeHit/TC/BB |
| `/fantasy/deadline` | Transfer deadline | FAN | `fantasy-client` | Current deadline and lock state |
| `/fantasy/rules` | Fantasy rules | FAN | `fantasy-rules-client` | Rules config, scoring guide |
| `/fantasy/history` | Scoring history | FAN | `fantasy-client` | All gameweek scores |
| `/fantasy/history/[gameweekId]` | Gameweek detail | FAN | `fantasy-client` | Player breakdown for gameweek |
| `/fantasy/leaderboard` | Fantasy leaderboard | None | `fantasy-client` | Top teams overall |
| `/fantasy/leagues` | My leagues | FAN | `fantasy-client` | All leagues with standings |
| `/fantasy/leagues/create` | Create private league | FAN | `fantasy-client` | Name, generate invite code |
| `/fantasy/leagues/join` | Join by code | FAN | `fantasy-client` | Enter invite code |
| `/fantasy/leagues/[id]` | League detail | FAN | `fantasy-client` | Standings, members |
| `/fantasy/cups` | My cups | FAN | `fantasy-client` | Mini-cup brackets |
| `/gameweeks` | Gameweek list | None | `gameweeks-client` | All gameweeks with status |
| `/gameweeks/[id]` | Gameweek detail | None | `gameweeks-client` | Deadline, fixtures |
| `/gameweeks/[id]/fixtures` | Fixtures in gameweek | None | `gameweeks-client` | Fixture list for gameweek |

---

## Fan Value Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/fan-value` | Fan Value hub | FAN | `fan-value-client` | Total balance, recent entries |
| `/fan-value/ledger` | Full ledger | FAN | `fan-value-client` | All transactions (paginated) |
| `/fan-value/by-type` | FV by entry type | FAN | `fan-value-client` | Prediction/Fantasy/Achievement breakdown |
| `/fan-value/by-source` | FV by source | FAN | `fan-value-client` | Per fixture/gameweek breakdown |

---

## Achievements Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/achievements` | Achievements hub | FAN | `achievements-client` | Earned achievements + badges |
| `/achievements/badges` | Badge collection | FAN | `achievements-client` | All earned badges with rarity |
| `/achievements/progress` | Progress tracker | FAN | `achievements-client` | Progress toward locked achievements |

---

## Rewards Readiness Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/rewards` | Rewards hub | FAN | `rewards-client` | Overview of eligibility status |
| `/rewards/eligible` | Eligible rewards | FAN | `rewards-client` | Rewards fan qualifies for |
| `/rewards/locked` | Locked rewards | FAN | `rewards-client` | Rewards with criteria not yet met |

---

## Notifications Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/notifications` | Notification inbox | FAN | `notifications-client` | Unread badge, paginated list |
| `/notifications/[id]` | Notification detail | FAN | `notifications-client` | Full notification content |
| `/notifications/preferences` | Preferences | FAN | `notifications-client` | Opt in/out per notification type |

---

## Activity Feed Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/activity` | Global activity feed | None | `activity-client` | All fans' public activity |
| `/activity/me` | My activity | FAN | `activity-client` | Own items with hide/show |
| `/activity/[id]` | Activity item detail | None | `activity-client` | Reactions, content |

---

## Admin Command Centre Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/admin` | Admin root | PSL_ADMIN | — | Redirects to `/admin/dashboard` |
| `/admin/dashboard` | Main command centre | PSL_ADMIN | `admin-dashboard-client` | KPIs, action-required, 11 sections |
| `/admin/dashboard/guess-the-score` | GTS command centre | PSL_ADMIN | `admin-dashboard-client` | Predictions stats, pending settlement |
| `/admin/dashboard/fantasy-rules` | Fantasy Rules section | PSL_ADMIN | `admin-dashboard-client` | Config status, gameweek summary |
| `/admin/dashboard/fantasy-league` | Fantasy League section | PSL_ADMIN | `admin-dashboard-client` | Teams, leagues, auto-subs |
| `/admin/dashboard/league-management` | League Mgmt section | PSL_ADMIN | `admin-dashboard-client` | Competitions, seasons, teams |
| `/admin/dashboard/fixture-management` | Fixture Mgmt section | PSL_ADMIN | `admin-dashboard-client` | Fixture status, live count |
| `/admin/dashboard/sponsor-management` | Sponsor Mgmt section | PSL_ADMIN | `admin-dashboard-client` | Reward readiness overview (no commerce yet) |
| `/admin/dashboard/content-moderation` | Content Moderation | PSL_ADMIN | `admin-dashboard-client` | Hidden/active activity items |
| `/admin/dashboard/reporting` | Reporting Centre | PSL_ADMIN | `admin-dashboard-client` | Top fans, achievement stats |
| `/admin/dashboard/compliance` | Compliance & POPIA | PSL_ADMIN | `admin-dashboard-client` | Notification delivery, opt-ins |
| `/admin/dashboard/user-audience` | User Audience | PSL_ADMIN | `admin-dashboard-client` | Fans by club, role breakdown |
| `/admin/dashboard/system` | System & Operations | PSL_ADMIN | `admin-dashboard-client` | Health, delivery logs, DB counts |

---

## Admin Operations Pages

### Competition & Season

| Path | Purpose | Auth | API Client |
|------|---------|------|-----------|
| `/admin/competitions` | Competition list | PSL_ADMIN | `admin-client` |
| `/admin/competitions/new` | Create competition | PSL_ADMIN | `admin-client` |
| `/admin/competitions/[id]` | Competition detail | PSL_ADMIN | `admin-client` |
| `/admin/competitions/[id]/seasons` | Seasons for competition | PSL_ADMIN | `admin-client` |
| `/admin/seasons/[id]` | Season detail & management | PSL_ADMIN | `admin-client` |

### Data Import

| Path | Purpose | Auth | API Client |
|------|---------|------|-----------|
| `/admin/imports` | Import job list | PSL_ADMIN | `admin-imports-client` |
| `/admin/imports/new` | Start new import | PSL_ADMIN | `admin-imports-client` |
| `/admin/imports/preview` | Preview import before commit | PSL_ADMIN | `admin-imports-client` |
| `/admin/imports/manual` | Manual data entry | PSL_ADMIN | `admin-imports-client` |
| `/admin/imports/[id]` | Import job detail | PSL_ADMIN | `admin-imports-client` |

### Fixture Assignment

| Path | Purpose | Auth | API Client |
|------|---------|------|-----------|
| `/admin/fixtures/unassigned` | Unassigned fixtures | PSL_ADMIN | `admin-fixtures-client` |
| `/admin/fixtures/assignments` | Assignment management | PSL_ADMIN | `admin-fixtures-client` |
| `/admin/fixtures/assignment-summary` | Coverage summary | PSL_ADMIN | `admin-fixtures-client` |

### Predictions Admin

| Path | Purpose | Auth | API Client |
|------|---------|------|-----------|
| `/admin/predictions` | Prediction overview | PSL_ADMIN | `admin-predictions-client` |
| `/admin/predictions/settlement` | Settle predictions | PSL_ADMIN | `admin-predictions-client` |

### Fantasy Admin

| Path | Purpose | Auth | API Client |
|------|---------|------|-----------|
| `/admin/fantasy/rules` | Fantasy rules config | PSL_ADMIN | `admin-fantasy-client` |
| `/admin/fantasy/scoring` | Scoring management | PSL_ADMIN | `admin-fantasy-client` |
| `/admin/fantasy/deadlines` | Deadline management | PSL_ADMIN | `admin-fantasy-client` |
| `/admin/fantasy/prices` | Player price management | PSL_ADMIN | `admin-fantasy-client` |
| `/admin/fantasy/auto-subs` | Auto-substitution log | PSL_ADMIN | `admin-fantasy-client` |
| `/admin/fantasy/leagues` | League administration | PSL_ADMIN | `admin-fantasy-client` |
| `/admin/fantasy/cups` | Cup administration | PSL_ADMIN | `admin-fantasy-client` |

### Fan Value Admin

| Path | Purpose | Auth | API Client |
|------|---------|------|-----------|
| `/admin/fan-value` | FV admin overview | PSL_ADMIN | `fan-value-client` |
| `/admin/fan-value/post-entry` | Post manual FV entry | PSL_ADMIN | `fan-value-client` |
| `/admin/fan-value/users/[userId]` | User FV ledger | PSL_ADMIN | `fan-value-client` |

### Achievements Admin

| Path | Purpose | Auth | API Client |
|------|---------|------|-----------|
| `/admin/achievements` | Achievement overview | PSL_ADMIN | `achievements-client` |
| `/admin/achievements/definitions` | Definition management | PSL_ADMIN | `achievements-client` |
| `/admin/achievements/badges` | Badge management | PSL_ADMIN | `achievements-client` |
| `/admin/achievements/users/[userId]` | User achievements | PSL_ADMIN | `achievements-client` |

### Notifications Admin

| Path | Purpose | Auth | API Client |
|------|---------|------|-----------|
| `/admin/notifications` | Notification overview | PSL_ADMIN | `notifications-client` |
| `/admin/notifications/send` | Send to user | PSL_ADMIN | `notifications-client` |
| `/admin/notifications/broadcast` | Broadcast to all fans | PSL_ADMIN | `notifications-client` |

### Activity Feed Admin

| Path | Purpose | Auth | API Client |
|------|---------|------|-----------|
| `/admin/activity` | Activity feed admin | PSL_ADMIN | `activity-client` |
| `/admin/activity/moderation` | Content moderation | PSL_ADMIN | `activity-client` |
| `/admin/activity/system` | Post system announcement | PSL_ADMIN | `activity-client` |

### Rewards Admin

| Path | Purpose | Auth | API Client |
|------|---------|------|-----------|
| `/admin/rewards` | Rewards overview | PSL_ADMIN | `rewards-client` |
| `/admin/rewards/definitions` | Definition management | PSL_ADMIN | `rewards-client` |
| `/admin/rewards/definitions/[id]` | Definition detail | PSL_ADMIN | `rewards-client` |

### Live Dashboard

| Path | Purpose | Auth | API Client |
|------|---------|------|-----------|
| `/admin/football/live` | Live match dashboard | PSL_ADMIN | `admin-football-client` |
| `/admin/football/fixtures/[fixtureId]/live` | Fixture live control | PSL_ADMIN | `admin-football-client` |

---

## API Client Modules (`apps/web/src/lib/`)

| File | Routes served |
|------|--------------|
| `api.ts` | Base fetch helper |
| `auth-client.ts` | `/auth` routes |
| `football-client.ts` | `/football` routes |
| `profile-client.ts` | `/profile` routes |
| `predictions-client.ts` | `/predictions` routes |
| `challenges-client.ts` | `/challenges` routes |
| `gameweeks-client.ts` | `/gameweeks` routes |
| `fantasy-client.ts` | `/fantasy` routes (main) |
| `fantasy-rules-client.ts` | `/fantasy` rules config routes |
| `fan-value-client.ts` | `/fan-value` routes |
| `achievements-client.ts` | `/achievements` routes |
| `rewards-client.ts` | `/rewards-readiness` routes |
| `notifications-client.ts` | `/notifications` routes |
| `activity-client.ts` | `/activity-feed` routes |
| `admin-client.ts` | `/admin/competitions`, `/admin/seasons` |
| `admin-imports-client.ts` | `/admin/imports` routes |
| `admin-fixtures-client.ts` | `/admin/fixtures` routes |
| `admin-fantasy-client.ts` | `/fantasy/admin` routes |
| `admin-football-client.ts` | `/football/admin` routes |
| `admin-predictions-client.ts` | `/predictions/admin` routes |
| `admin-dashboard-client.ts` | `/admin-dashboard` routes |
| `query-keys.ts` | TanStack Query key constants |

---

## Club Experience Pages (STORY-26)

### Fan Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/clubs` | Club grid with colour avatars | None | `clubs-client` | Optional `?season=` filter |
| `/clubs/[slug]` | Club hub — header + tab nav | None | `clubs-client` | Links to all sub-pages |
| `/clubs/[slug]/overview` | Dashboard: fixture preview, squad, news | None | `clubs-client` | — |
| `/clubs/[slug]/fixtures` | Upcoming fixtures list | None | `clubs-client` | — |
| `/clubs/[slug]/results` | Recent results with scores | None | `clubs-client` | — |
| `/clubs/[slug]/squad` | Squad grouped by position | None | `clubs-client` | — |
| `/clubs/[slug]/stats` | Stats aggregate cards | None | `clubs-client` | — |
| `/clubs/[slug]/stadium` | Home venue / stadium info | None | `clubs-client` | — |
| `/clubs/[slug]/tickets` | Ticketing stub (not enabled MVP) | None | `clubs-client` | Commerce note only |
| `/clubs/[slug]/shop` | Product catalogue with category filter | None | `clubs-client` | No checkout |
| `/clubs/[slug]/shop/[productSlug]` | Product detail — disabled cart | None | `clubs-client` | No checkout |

### Admin Pages

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/admin/clubs` | Clubs table with readiness dots | PSL_ADMIN | `clubs-client` | — |
| `/admin/clubs/readiness` | Readiness dashboard with progress bars | PSL_ADMIN | `clubs-client` | — |
| `/admin/clubs/[id]` | Club detail + validate button | PSL_ADMIN | `clubs-client` | — |
| `/admin/clubs/[id]/experience` | Experience checklist with progress bar | PSL_ADMIN | `clubs-client` | — |
| `/admin/clubs/[id]/players` | Players table | PSL_ADMIN | `clubs-client` | — |
| `/admin/clubs/[id]/fixtures` | Fixtures with venue/gameweek warnings | PSL_ADMIN | `clubs-client` | — |
| `/admin/clubs/[id]/shop` | Shop readiness checklist | PSL_ADMIN | `clubs-client` | Commerce note |
| `/admin/seasons/[id]/clubs` | Season clubs with remove confirmation | PSL_ADMIN | `clubs-client` | Uses existing `[id]` segment |

---

## API Client Modules Update

| File | Routes served |
|------|--------------|
| `clubs-client.ts` | `/clubs` (fan) and `/clubs/admin` routes (STORY-26) |

## Fixture Import Admin Pages (STORY-27)

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/admin/fixtures/imports` | List all import batches; links to season tools | PSL_ADMIN | `fixture-import-client` | — |
| `/admin/fixtures/imports/new` | Create new import batch (seasonId, label, source) | PSL_ADMIN | `fixture-import-client` | — |
| `/admin/fixtures/imports/[batchId]` | Batch detail; status pipeline; lifecycle actions | PSL_ADMIN | `fixture-import-client` | — |
| `/admin/fixtures/imports/[batchId]/rows` | View/add/delete import rows | PSL_ADMIN | `fixture-import-client` | Inline add form |
| `/admin/fixtures/imports/[batchId]/validation` | Run validation; error/warning breakdown per row | PSL_ADMIN | `fixture-import-client` | Auto-runs on load |
| `/admin/fixtures/imports/[batchId]/publish` | Publish committed fixtures confirmation | PSL_ADMIN | `fixture-import-client` | Guards against live fixtures |
| `/admin/fixtures/validation` | Season-level fixture data quality check | PSL_ADMIN | `fixture-import-client` | Season ID lookup |
| `/admin/fixtures/conflicts` | Detect duplicate/overlap conflicts for season | PSL_ADMIN | `fixture-import-client` | Season ID lookup |
| `/admin/fixtures/gameweeks` | Gameweek readiness + auto-create from rounds | PSL_ADMIN | `fixture-import-client` | Season ID lookup |
| `/admin/fixtures/publishing` | Publish/unpublish all fixtures in season | PSL_ADMIN | `fixture-import-client` | Season ID lookup |

## Admin — Season Switching (STORY-28)

| Route | Purpose | Auth | Client | Notes |
|-------|---------|------|--------|-------|
| `/admin/seasons/context` | Active season card, all seasons table, last switch info | PSL_ADMIN | `season-context-client` | Links to switching per season |
| `/admin/seasons/switching` | List inactive seasons + recent switch history | PSL_ADMIN | `season-context-client` | — |
| `/admin/seasons/switching/[seasonId]` | Season detail: status, dates, activation history | PSL_ADMIN | `season-context-client` | — |
| `/admin/seasons/switching/[seasonId]/readiness` | Cross-domain readiness dashboard: 7 checks, BLOCKER/WARNING/INFO | PSL_ADMIN | `season-context-client` | Links to preview if not BLOCKED |
| `/admin/seasons/switching/[seasonId]/preview` | Activation preview: from/to season, impact summary, activate button | PSL_ADMIN | `season-context-client` | Warning acknowledgement checkbox |

## Admin — Fantasy Calibration (STORY-29)

| Route | Purpose | Auth | Client | Notes |
|-------|---------|------|--------|-------|
| `/admin/fantasy/calibration` | List all seasons with calibration status (rules configured, price count, gameweek count) | PSL_ADMIN | `fantasy-calibration-client` | — |
| `/admin/fantasy/calibration/[seasonId]` | Season calibration dashboard: overall readiness status, blockers, warnings, nav to sub-pages | PSL_ADMIN | `fantasy-calibration-client` | — |
| `/admin/fantasy/calibration/[seasonId]/readiness` | Detailed readiness breakdown: all checks with codes, messages, details | PSL_ADMIN | `fantasy-calibration-client` | — |
| `/admin/fantasy/calibration/[seasonId]/rules` | View current fantasy rules config; create provisional PSL rules button if missing | PSL_ADMIN | `fantasy-calibration-client` | PROVISIONAL label |
| `/admin/fantasy/calibration/[seasonId]/players` | Player price readiness: counts by position; generate provisional prices button | PSL_ADMIN | `fantasy-calibration-client` | PROVISIONAL prices |
| `/admin/fantasy/calibration/[seasonId]/gameweeks` | Gameweek readiness: fixture linkage, deadline status; derive deadlines from fixtures | PSL_ADMIN | `fantasy-calibration-client` | — |
| `/admin/fantasy/calibration/[seasonId]/activation-impact` | Activation impact summary; links to Season Switching for final activation | PSL_ADMIN | `fantasy-calibration-client` | Links to /admin/seasons/switching |

## Admin — Prediction Calibration (STORY-30)

| Route | Purpose | Auth | Client | Notes |
|-------|---------|------|--------|-------|
| `/admin/predictions/calibration` | List all seasons with prediction calibration status (rules configured, rules status) | PSL_ADMIN | `prediction-calibration-client` | — |
| `/admin/predictions/calibration/[seasonId]` | Season prediction dashboard: readiness status, nav to sub-pages | PSL_ADMIN | `prediction-calibration-client` | — |
| `/admin/predictions/calibration/[seasonId]/readiness` | Detailed readiness breakdown: all checks with severity and detail | PSL_ADMIN | `prediction-calibration-client` | — |
| `/admin/predictions/calibration/[seasonId]/rules` | View/create/update prediction rules config; inline field editing; promote to ACTIVE | PSL_ADMIN | `prediction-calibration-client` | PROVISIONAL label |
| `/admin/predictions/calibration/[seasonId]/fixtures` | Per-fixture eligibility: published, kickoff, status, ineligibility reasons | PSL_ADMIN | `prediction-calibration-client` | — |
| `/admin/predictions/calibration/[seasonId]/locks` | Lock readiness: open vs locked per fixture, lock reason, pending prediction count | PSL_ADMIN | `prediction-calibration-client` | — |
| `/admin/predictions/calibration/[seasonId]/settlement` | Settlement readiness: FINISHED fixtures with results ready to settle | PSL_ADMIN | `prediction-calibration-client` | — |
| `/admin/predictions/calibration/[seasonId]/peer-challenges` | Peer challenge counts by status for published fixtures. Fan points only — no stakes or wagers. | PSL_ADMIN | `prediction-calibration-client` | — |
| `/admin/gameweeks/operations` | Season list for gameweek operations | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/gameweeks/operations/[seasonId]` | Season operations overview: status tiles, nav to sub-areas | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/gameweeks/operations/[seasonId]/gameweeks` | Per-gameweek operational status table; derive gameweeks action | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/gameweeks/operations/[seasonId]/gameweeks/[gameweekId]` | Single gameweek operational detail | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/gameweeks/operations/[seasonId]/readiness` | Season gameweek readiness: fixture assignment coverage, unassigned count | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/gameweeks/operations/[seasonId]/deadlines` | Per-gameweek deadline validity; derive deadlines (MISSING_ONLY / OVERWRITE_DERIVED_ONLY) | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/gameweeks/operations/[seasonId]/fixture-assignment` | Fixture assignment: validation issues, conflicts, gameweek coverage | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/gameweeks/operations/[seasonId]/fantasy-impact` | Fantasy calibration status and gameweek readiness | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/gameweeks/operations/[seasonId]/prediction-impact` | Prediction activation status, lock readiness, eligibility counts | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/gameweeks/operations/[seasonId]/publication` | Fixture publication status and per-gameweek breakdown | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/gameweeks/operations/[seasonId]/activation-impact` | Cross-domain activation readiness aggregation by domain | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/gameweeks/operations/[seasonId]/matchday-control` | Matchday control panel: safety flags, status counts, validate action | PSL_ADMIN | `gameweek-operations-client` | — |
| `/admin/predictions/calibration/[seasonId]/activation-impact` | Fixture, rules, and prediction count summary before season activation | PSL_ADMIN | `prediction-calibration-client` | — |
| `/admin/operations` | Admin operations control plane: section index, summary stats | PSL_ADMIN | `admin-operations-client` | — |
| `/admin/operations/capability-review` | 9-category capability gap review table with status, evidence, risk | PSL_ADMIN | `admin-operations-client` | — |
| `/admin/operations/launch-readiness` | Launch readiness checklist: pass/fail/pending, blockers, next steps | PSL_ADMIN | `admin-operations-client` | — |
| `/admin/operations/module-readiness/[seasonId]` | Per-season module readiness: 19 modules, blockers, warnings | PSL_ADMIN | `admin-operations-client` | — |
| `/admin/operations/smoke-tests` | Route smoke tests: tabbed view of routes, RBAC, workflows, run results | PSL_ADMIN | `admin-operations-client` | Run button |
| `/admin/operations/integrations` | Integration providers index: all configs, commercial readiness summary | PSL_ADMIN | `admin-operations-client` | — |
| `/admin/operations/integrations/wallet-payments` | Wallet & payments readiness detail | PSL_ADMIN | `admin-operations-client` | — |
| `/admin/operations/integrations/checkout-commerce` | Checkout & commerce readiness detail | PSL_ADMIN | `admin-operations-client` | — |
| `/admin/operations/integrations/ticketing` | Ticketing readiness detail | PSL_ADMIN | `admin-operations-client` | — |
| `/admin/operations/integrations/live-data` | Live sports data provider readiness detail | PSL_ADMIN | `admin-operations-client` | — |
| `/admin/operations/integrations/sponsor-activation` | Sponsor activation readiness detail | PSL_ADMIN | `admin-operations-client` | — |
| `/admin/operations/integrations/rewards-redemption` | Rewards redemption readiness detail | PSL_ADMIN | `admin-operations-client` | — |

## Admin Engagement Metrics Pages (STORY-33)

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/admin/engagement` | Engagement season index | PSL_ADMIN | `admin-engagement-client` | All seasons; links to overview + scope audit |
| `/admin/engagement/[seasonId]` | Season engagement overview | PSL_ADMIN | `admin-engagement-client` | Fan value, fantasy, predictions, achievements summary; safety confirmations |
| `/admin/engagement/[seasonId]/leaderboards` | Admin leaderboard snapshots | PSL_ADMIN | `admin-engagement-client` | Top-5 per type |
| `/admin/engagement/[seasonId]/fan-value` | Fan value breakdown | PSL_ADMIN | `admin-engagement-client` | By type, by source, unscoped count, disclaimer |
| `/admin/engagement/[seasonId]/fantasy` | Fantasy engagement detail | PSL_ADMIN | `admin-engagement-client` | Teams, leagues, net/gross points |
| `/admin/engagement/[seasonId]/predictions` | Predictions engagement detail | PSL_ADMIN | `admin-engagement-client` | Points, count, settled, unique fans; season via fixture.seasonId |
| `/admin/engagement/[seasonId]/achievements` | Achievements engagement | PSL_ADMIN | `admin-engagement-client` | ALL_TIME scope; fan value via achievements this season |
| `/admin/engagement/[seasonId]/unscoped-ledger` | Unscoped ledger (admin-only) | PSL_ADMIN | `admin-engagement-client` | Entries with null seasonId; classification table |
| `/admin/engagement/[seasonId]/season-scope-audit` | Season scope audit | PSL_ADMIN | `admin-engagement-client` | 10 checks; READY/READY_WITH_WARNINGS/BLOCKED |
| `/admin/engagement/[seasonId]/activation-impact` | Activation impact | PSL_ADMIN | `admin-engagement-client` | WC preservation, PSL clean start, safety confirmations |

## Player Stats — Fan Pages (STORY-34)

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/players` | Players index | PUBLIC | — | Entry point to season stats, gameweeks, clubs |
| `/players/[playerId]` | Player profile | PUBLIC | `players-client` | Career totals, team, position |
| `/players/[playerId]/season/[seasonId]` | Player season stats | PUBLIC | `players-client` | Match-by-match history + season totals |
| `/players/[playerId]/fixture/[fixtureId]` | Player match stat detail | PUBLIC | `players-client` | Full stat breakdown for one fixture |
| `/players/fixtures/[fixtureId]` | Fixture player stats | PUBLIC | `players-client` | All players for a fixture |
| `/players/season/[seasonId]` | Season stats index | PUBLIC | — | Links to top performers |
| `/players/season/[seasonId]/top-performers` | Top scorers & assists | PUBLIC | `players-client` | Tab-switcher: scorers / assists |
| `/players/gameweek/[gameweekId]` | Gameweek player stats | PUBLIC | `players-client` | All player stats for a gameweek |
| `/players/season/[seasonId]/team/[teamId]/squad-stats` | Squad stats (fan) | PUBLIC | `players-client` | Aggregated squad stats (via API; no dedicated page) |

## Player Stats — Admin Pages (STORY-34)

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/admin/player-stats` | Stats list | PSL_ADMIN | `admin-player-stats-client` | Filterable by status; Suspense for useSearchParams |
| `/admin/player-stats/new` | New stat entry | PSL_ADMIN | `admin-player-stats-client` | Manual entry form (playerId + fixtureId) |
| `/admin/player-stats/[statId]` | Stat detail + actions | PSL_ADMIN | `admin-player-stats-client` | Verify / Publish / Lock / Delete lifecycle |
| `/admin/player-stats/season/[seasonId]` | Season stats admin | PSL_ADMIN | — | Links to readiness + filtered lists |
| `/admin/player-stats/season/[seasonId]/readiness` | Season readiness | PSL_ADMIN | `admin-player-stats-client` | NO_DATA / PROVISIONAL / PARTIAL / VERIFIED / PUBLISHED |
| `/admin/player-stats/fixture/[fixtureId]` | Fixture stats admin | PSL_ADMIN | `admin-player-stats-client` | Per-fixture list + bulk publish action |

## Beta Feedback — Admin Pages (STORY-35)

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/admin/beta-feedback` | Beta overview | PSL_ADMIN | `beta-feedback-client` | Status banner, KPI cards, sub-page nav, recommended actions |
| `/admin/beta-feedback/known-issues` | Known issues list | PSL_ADMIN | `beta-feedback-client` | 12 issues with severity/status badges |
| `/admin/beta-feedback/ux-checklist` | UX checks grouped by area | PSL_ADMIN | `beta-feedback-client` | PASS/WARN/FAIL/PENDING with summary chips |
| `/admin/beta-feedback/release-notes` | Release notes STORY-26 to STORY-35 | PSL_ADMIN | `beta-feedback-client` | Reverse-chronological; key deliverables + safety boundaries |

## Squad Import — Admin Pages (STORY-36)

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/admin/squad-import` | Season list | PSL_ADMIN | `squad-import-client` | Lists seasons with batch counts and registration counts |
| `/admin/squad-import/[seasonId]` | Season overview | PSL_ADMIN | `squad-import-client` | Registration summary, recent batches, nav links |
| `/admin/squad-import/[seasonId]/batches` | Batch list | PSL_ADMIN | `squad-import-client` | All batches with row counts per status; links to detail/rows |
| `/admin/squad-import/[seasonId]/batches/[batchId]` | Batch detail + actions | PSL_ADMIN | `squad-import-client` | Validate / Import / Publish / Cancel lifecycle buttons |
| `/admin/squad-import/[seasonId]/batches/[batchId]/rows` | Batch row table | PSL_ADMIN | `squad-import-client` | All rows with validationStatus, messages, positions |
| `/admin/squad-import/[seasonId]/duplicates` | Duplicate detection | PSL_ADMIN | `squad-import-client` | Rows with duplicatePlayerIds; BLOCKER vs WARNING |
| `/admin/squad-import/[seasonId]/readiness` | Import readiness | PSL_ADMIN | `squad-import-client` | 4-check gate: TEAMS_REGISTERED, SQUAD_REGISTRATIONS_EXIST, CONFIRMED, LATEST_BATCH |
| `/admin/squad-import/[seasonId]/activation-impact` | Activation impact | PSL_ADMIN | `squad-import-client` | Registration counts, latest batch stats, warnings |
| `/admin/squad-import/[seasonId]/activation-dry-run` | Activation dry run | PSL_ADMIN | `squad-import-client` | Read-only; dryRunOnly + safetyConfirmations display |

## Fantasy Price Calibration — Admin Pages (STORY-36)

| Path | Purpose | Auth | API Client | Notes |
|------|---------|------|-----------|-------|
| `/admin/fantasy-price-calibration` | Season list | PSL_ADMIN | `fantasy-price-calibration-client` | Lists seasons with price bounds, counts, calibration batch count |
| `/admin/fantasy-price-calibration/[seasonId]` | Calibration overview | PSL_ADMIN | `fantasy-price-calibration-client` | Missing/invalid counts, Apply Defaults + Validate + Publish actions |
| `/admin/fantasy-price-calibration/[seasonId]/players` | Player price table | PSL_ADMIN | `fantasy-price-calibration-client` | Inline price editing; validity indicator |
| `/admin/fantasy-price-calibration/[seasonId]/missing-prices` | Missing prices | PSL_ADMIN | `fantasy-price-calibration-client` | Players without price; bulk apply defaults button |
| `/admin/fantasy-price-calibration/[seasonId]/invalid-prices` | Invalid prices | PSL_ADMIN | `fantasy-price-calibration-client` | Prices outside bounds; BELOW_MINIMUM / ABOVE_MAXIMUM violation |
| `/admin/fantasy-price-calibration/[seasonId]/readiness` | Calibration readiness | PSL_ADMIN | `fantasy-price-calibration-client` | 4-check gate including published batch check |
| `/admin/fantasy-price-calibration/[seasonId]/activation-impact` | Activation impact | PSL_ADMIN | `fantasy-price-calibration-client` | Coverage counts, missing/invalid, warnings; links to dry run |
| `/admin/fantasy-price-calibration/[seasonId]/activation-dry-run` | Activation dry run | PSL_ADMIN | `fantasy-price-calibration-client` | Read-only; pricesHaveNoCashValue + safety confirmations |

## STORY-37 — Media, Sponsor Campaigns & Wallet (25 new pages)

### Fan Pages

| Route | Title | Auth | Client | Notes |
|-------|-------|------|--------|-------|
| `/media` | Media Catalogue | Public | `media-client` | Lists PUBLIC+CLEAR assets; media rights notice shown |
| `/media/[slug]` | Media Detail | Public | `media-client` | Records view event on load; content player placeholder (CDN not configured) |
| `/clubs/[slug]/media` | Club Media | Public | `media-client` | Filtered by clubId; links to /media/[slug] |
| `/campaigns` | Fan Campaigns | Fan | `campaigns-client` | Lists PUBLISHED campaigns; FV pts displayed per campaign |
| `/campaigns/[slug]` | Campaign Detail | Fan | `campaigns-client` | Join, complete actions, progress; MANUAL_REVIEW note for SCAN_QR/SHARE_CONTENT |
| `/my-rewards` | My Rewards | Fan | `campaign-rewards-client` | Fan's issued rewards; redeem button for CLAIMED rewards; wallet safety copy |
| `/wallet` | My Wallet | Fan | `wallet-client` | Sandbox only; link/confirm/unlink flow; KYC and fund-holding disclaimers |

### Admin Pages

| Route | Title | Auth | Client | Notes |
|-------|-------|------|--------|-------|
| `/admin/media` | Media Catalogue | PSL_ADMIN | `admin-media-client` | List all media assets; rights warning banner |
| `/admin/media/new` | New Media Asset | PSL_ADMIN | `admin-media-client` | Create DRAFT asset; rightsStatus selector |
| `/admin/media/[mediaId]` | Media Detail | PSL_ADMIN | `admin-media-client` | Publish (requires CLEAR rights); archive; engagement counts |
| `/admin/sponsors` | Sponsors | PSL_ADMIN | `sponsors-client` | List sponsors; link to campaigns; status badges |
| `/admin/sponsors/new` | New Sponsor | PSL_ADMIN | `sponsors-client` | Create sponsor; contact fields admin-only |
| `/admin/sponsors/[sponsorId]` | Sponsor Detail | PSL_ADMIN | `sponsors-client` + `campaign-analytics-client` | Status update; analytics summary |
| `/admin/campaigns` | Campaigns | PSL_ADMIN | `admin-campaigns-client` | List all campaigns; ?sponsorId filter; Suspense-wrapped for useSearchParams |
| `/admin/campaigns/new` | New Campaign | PSL_ADMIN | `admin-campaigns-client` | Create DRAFT campaign; sponsor selector |
| `/admin/campaigns/[campaignId]` | Campaign Detail | PSL_ADMIN | `admin-campaigns-client` | Lifecycle buttons; links to actions/rewards/analytics sub-pages |
| `/admin/campaigns/[campaignId]/actions` | Campaign Actions | PSL_ADMIN | `admin-campaigns-client` | Add/view actions; MANUAL_REVIEW note; only editable in DRAFT |
| `/admin/campaigns/[campaignId]/rewards` | Campaign Rewards | PSL_ADMIN | `campaign-rewards-client` | Reward definitions; add new with type/inventory controls; wallet safety copy |
| `/admin/campaigns/[campaignId]/analytics` | Campaign Analytics | PSL_ADMIN | `campaign-analytics-client` | 6 KPI tiles; recalculate button; participant/reward breakdowns |
| `/admin/reward-definitions` | Reward Definitions | PSL_ADMIN | `campaign-rewards-client` | All definitions across campaigns; FV disclaimer |
| `/admin/campaign-rewards` | Campaign Rewards Issued | PSL_ADMIN | `campaign-rewards-client` | All fan rewards; status table; wallet safety copy |
| `/admin/wallet` | Wallet Integration | PSL_ADMIN | — | Hub page; sandbox warning; links to providers/links/transactions |
| `/admin/wallet/providers` | Wallet Providers | PSL_ADMIN | `admin-wallet-client` | List providers; activate/deactivate toggle |
| `/admin/wallet/links` | Fan Wallet Links | PSL_ADMIN | `admin-wallet-client` | Fan link status table; audit trail note |
| `/admin/wallet/transactions` | Wallet Transactions | PSL_ADMIN | `admin-wallet-client` | Sandbox transaction log; PRODUCTION_DISABLED notice |

### Fan Pages — Social Prediction Challenge Marketplace (STORY-38)

| Route | Title | Auth | Client | Notes |
|-------|-------|------|--------|-------|
| `/social-predictions/allocation` | My Points Allocation | Fan | `social-prediction-client` | Shows gameweek allocation, used/remaining; safety copy required |
| `/social-predictions/marketplace/[fixtureId]` | Fixture Marketplace | Fan | `social-prediction-client` | Lists open markets for fixture; entry point for creating listings |
| `/social-predictions/create/[marketId]` | Create Challenge | Fan | `social-prediction-client` | Create listing form: selection, commitment %, multiplier; server-calculates award |
| `/social-predictions/my-listings` | My Listings | Fan | `social-prediction-client` | Fan's active and historical listings; withdraw action |
| `/social-predictions/[listingId]` | Listing Detail | Fan | `social-prediction-client` | Listing detail with match history, ledger; accept action |
| `/social-predictions/leaderboard` | Prediction Leaderboard | Fan | `social-prediction-client` | Season/gameweek leaderboard; points-only disclaimer |

### Fan Pages — Match Centre (STORY-38)

| Route | Title | Auth | Client | Notes |
|-------|-------|------|--------|-------|
| `/match-centre/standings/[seasonId]` | League Standings | Fan | `match-centre-client` | Season standings table with provenance and freshness status |

### Admin Pages — Social Prediction Admin (STORY-38)

| Route | Title | Auth | Client | Notes |
|-------|-------|------|--------|-------|
| `/admin/social-predictions/markets` | Market Configs | PSL_ADMIN | `admin-social-prediction-client` | List season market configs; enable/disable toggle |
| `/admin/social-predictions/markets/new` | New Market Config | PSL_ADMIN | `admin-social-prediction-client` | Create market config form (type, baseOpportunity, multipliers, return rate) |
| `/admin/social-predictions/markets/[id]` | Fixture Markets | PSL_ADMIN | `admin-social-prediction-client` | Generate, open, lock, settle, void markets per fixture |
| `/admin/social-predictions/listings` | All Listings | PSL_ADMIN | `admin-social-prediction-client` | Filterable listing table; void individual match action |
| `/admin/social-predictions/settlements` | Market Settlements | PSL_ADMIN | `admin-social-prediction-client` | Settle/void LOCKED markets; outcome entry |
| `/admin/social-predictions/allocations` | Points Allocations | PSL_ADMIN | `admin-social-prediction-client` | Grant gameweek allocations; adjust individual fan |
| `/admin/social-predictions/compliance` | Compliance Status | PSL_ADMIN | `admin-social-prediction-client` | INTERNAL_REVIEW_REQUIRED dashboard; classification notes |

### Admin Pages — Match Centre Admin (STORY-38)

| Route | Title | Auth | Client | Notes |
|-------|-------|------|--------|-------|
| `/admin/match-centre/standings` | Standings Admin | PSL_ADMIN | `admin-match-centre-client` | Batch upsert standings (JSON); provenance shown |
| `/admin/match-centre/ingestion` | Ingestion Log | PSL_ADMIN | `admin-match-centre-client` | Audit log of all ingest operations; capability status panel |
| `/admin/match-centre/ratings` | Player Ratings | PSL_ADMIN | `admin-match-centre-client` | Upsert player rating form; version tracking |
| `/admin/match-centre/fixtures/[fixtureId]/ingest` | Fixture Data Ingest | PSL_ADMIN | `admin-match-centre-client` | JSON ingestion form (LINEUP/MATCH_EVENT/PLAYER_RATING/STANDING); sandbox only |

### Fan Pages — Live Match Centre (STORY-38)

| Route | Title | Auth | Client | Notes |
|-------|-------|------|--------|-------|
| `/matches` | All Matches | Fan | `football-client` | Fixture list with status badges and links |
| `/matches/live` | Live Now | Fan | `football-client` | Auto-polls every 20s for live fixtures |
| `/matches/[fixtureId]` | Match Overview | Fan | `football-client` | Score, status, tab navigation to sub-pages |
| `/matches/[fixtureId]/lineups` | Lineups | Fan | `match-centre-client` | Starters and subs per team |
| `/matches/[fixtureId]/timeline` | Timeline | Fan | `football-client` | Chronological event list |
| `/matches/[fixtureId]/stats` | Stats | Fan | `football-client` | Player match stats |
| `/matches/[fixtureId]/players` | Player Ratings | Fan | `match-centre-client` | Ratings 0–10 per player |
| `/matches/[fixtureId]/fantasy` | Fantasy Preview | Fan | `football-client` | Estimated points per player (provisional) |
| `/matches/[fixtureId]/predictions` | Predictions | Fan | `football-client` | Live state, lock status, link to marketplace |
| `/matches/[fixtureId]/social` | Social | Fan | `social-prediction-client` | Active marketplace and direct challenges for this fixture |

### Fan Pages — Direct Challenges (STORY-38)

| Route | Title | Auth | Client | Notes |
|-------|-------|------|--------|-------|
| `/social-challenges` | Challenges Hub | Fan | `social-prediction-client` | Overview: incoming/outgoing/new links |
| `/social-challenges/incoming` | Incoming Challenges | Fan | `social-prediction-client` | Accept or decline pending direct challenges |
| `/social-challenges/outgoing` | Outgoing Challenges | Fan | `social-prediction-client` | View status; withdraw or get share link |
| `/social-challenges/new` | Send Challenge | Fan | `social-prediction-client` | Create a direct challenge to a specific user |
| `/social-challenges/[challengeId]` | Challenge Detail | Fan | `social-prediction-client` | View single challenge lifecycle |

### Admin Pages — Live Match Operations (STORY-38)

| Route | Title | Auth | Client | Notes |
|-------|-------|------|--------|-------|
| `/admin/live-match` | Live Match Index | PSL_ADMIN | `football-client` | All live/scheduled fixtures; filter by LIVE/ALL |
| `/admin/live-match/provider-readiness` | Provider Readiness | PSL_ADMIN | `admin-match-centre-client` | Capability map; stub mode warning |
| `/admin/live-match/ingestion-batches` | Ingestion Batches | PSL_ADMIN | `admin-match-centre-client` | Audit log + sandbox ingest form |
| `/admin/live-match/[fixtureId]` | Fixture Overview | PSL_ADMIN | `football-client`, `admin-football-client` | Score, status, lifecycle actions (kick off / half time / full time / reopen) |
| `/admin/live-match/[fixtureId]/readiness` | Readiness | PSL_ADMIN | `football-client`, `admin-match-centre-client` | Player availability + provider capability |
| `/admin/live-match/[fixtureId]/lineups` | Lineups | PSL_ADMIN | `football-client`, `admin-football-client` | View/submit lineups; fire lineup-confirmed event |
| `/admin/live-match/[fixtureId]/events` | Events | PSL_ADMIN | `football-client`, `admin-football-client` | Add/delete match events; score update toggle |
| `/admin/live-match/[fixtureId]/team-stats` | Team Stats | PSL_ADMIN | `football-client` | Aggregated team-level stats from player data |
| `/admin/live-match/[fixtureId]/player-stats` | Player Stats | PSL_ADMIN | `football-client`, `admin-football-client` | Per-player stat upsert form + table |
| `/admin/live-match/[fixtureId]/fantasy-impact` | Fantasy Impact | PSL_ADMIN | `football-client` | Estimated fantasy points (provisional) |
| `/admin/live-match/[fixtureId]/prediction-impact` | Prediction Impact | PSL_ADMIN | `football-client` | Live state, settlement status, timeline |

## Beta Launch Admin Pages (STORY-39) — 17 pages

| Route | Page | Auth | Client | Notes |
|-------|------|------|--------|-------|
| `/admin/beta-launch` | Beta Launch Hub | PSL_ADMIN | `beta-launch-client` | Overview, season list, quick links |
| `/admin/beta-launch/[seasonId]` | Season Detail | PSL_ADMIN | `beta-launch-client` | 13-check summary, all sub-page links |
| `/admin/beta-launch/[seasonId]/readiness` | 13-Check Gate | PSL_ADMIN | `beta-launch-client` | All checks with status chips and admin routes |
| `/admin/beta-launch/[seasonId]/blockers` | Blockers | PSL_ADMIN | `beta-launch-client` | Blocker-only view |
| `/admin/beta-launch/[seasonId]/warnings` | Warnings | PSL_ADMIN | `beta-launch-client` | Warning-only view |
| `/admin/beta-launch/[seasonId]/frontend` | Frontend Readiness | PSL_ADMIN | `beta-launch-client` | Domain coverage by area |
| `/admin/beta-launch/[seasonId]/data` | Data Readiness | PSL_ADMIN | `beta-launch-client` | Seeded clubs/players/fixtures/prices |
| `/admin/beta-launch/[seasonId]/security` | Security & RBAC | PSL_ADMIN | `beta-launch-client` | JWT and RBAC check list |
| `/admin/beta-launch/[seasonId]/operations` | Operations | PSL_ADMIN | `beta-launch-client` | Infrastructure readiness areas |
| `/admin/beta-launch/[seasonId]/cohort` | Beta Cohort | PSL_ADMIN | `beta-launch-client` | Create/start cohorts; member management |
| `/admin/beta-launch/[seasonId]/activation-preview` | Activation Preview | PSL_ADMIN | `beta-launch-client` | Read-only impact preview |
| `/admin/beta-launch/[seasonId]/dry-run` | Dry Run | PSL_ADMIN | `beta-launch-client` | Run activation analysis; confirms dryRunOnly:true |
| `/admin/beta-launch/[seasonId]/rollback-dry-run` | Rollback Dry Run | PSL_ADMIN | `beta-launch-client` | Rollback analysis; worldCupHistoryPreserved:true |
| `/admin/beta-launch/[seasonId]/approval` | Approval | PSL_ADMIN | `beta-launch-client` | Create APPROVED record; reject; never ACTIVATED |
| `/admin/beta-launch/[seasonId]/walkthrough` | Frontend Walkthrough | PSL_ADMIN | `beta-launch-client` | 19-domain step-by-step walkthrough |
| `/admin/beta-launch/[seasonId]/runbook` | Launch Runbook | PSL_ADMIN | `beta-launch-client` | Phased runbook with safety notes |
| `/admin/beta-launch/smoke-tests` | Smoke Tests | PSL_ADMIN | `beta-launch-client` | 24-item registry; run audit; confirm no activation routes |

## Fan Beta Pages (STORY-39) — 1 page

| Route | Page | Auth | Client | Notes |
|-------|------|------|--------|-------|
| `/beta` | Beta Landing | PUBLIC | — | Cohort invite landing; points-only safety notice; links to all domains |
