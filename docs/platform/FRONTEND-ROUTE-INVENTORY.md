# PSL One — Frontend Route Inventory

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
| `/leaderboards/predictions` | Prediction leaderboard | None | `predictions-client` | Top fans by points |

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
