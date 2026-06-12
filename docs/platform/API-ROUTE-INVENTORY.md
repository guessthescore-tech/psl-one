# PSL One — API Route Inventory

**Base URL (local):** `http://localhost:4000`  
**Auth header:** `Authorization: Bearer <jwt>`  
**Roles:** `FAN`, `PSL_ADMIN`  
**Sprint:** 1 Final

All routes verified from source files in `apps/api/src/`.

---

## /auth — Authentication

**Purpose:** Fan registration, login, JWT issuance, password management.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | None | Register new fan user, creates FanProfile |
| POST | `/auth/login` | None | Login, returns `accessToken` JWT |
| POST | `/auth/logout` | FAN | Logout (client-side token discard) |
| GET | `/auth/me` | FAN | Return current user (no password fields) |
| POST | `/auth/password-reset/request` | None | Generate password reset token |
| POST | `/auth/password-reset/confirm` | None | Confirm token and set new password |

**Notes:** Password hashes are never returned. Email delivery of reset tokens is Sprint 3.

---

## /football — Football Core

**Purpose:** Read access to competition, season, team, player, fixture, and standings data. Admin controls live match state.

**Fan routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/football/competitions` | None | List all competitions |
| GET | `/football/competitions/:slug` | None | Competition detail |
| GET | `/football/seasons` | None | List seasons (optional seasonId filter) |
| GET | `/football/seasons/active` | None | Current active season |
| GET | `/football/teams` | None | List teams (optional seasonId, competitionId) |
| GET | `/football/teams/:slug` | None | Team detail with players |
| GET | `/football/teams/:slug/players` | None | Players for a team |
| GET | `/football/players` | None | Player pool (seasonId, teamId, position filters) |
| GET | `/football/players/:id` | None | Player detail |
| GET | `/football/fixtures` | None | Fixtures (seasonId, teamId, status, date range filters) |
| GET | `/football/fixtures/:id` | None | Fixture detail |
| GET | `/football/fixtures/:id/live` | None | Live match status |
| GET | `/football/fixtures/:id/live-state` | None | Full live state object |
| GET | `/football/fixtures/:id/live-dashboard` | PSL_ADMIN | Admin live dashboard view |
| GET | `/football/fixtures/:id/timeline` | None | Match event timeline |
| GET | `/football/fixtures/:id/player-stats` | None | Player stats for fixture |
| GET | `/football/fixtures/:id/live-fantasy-preview` | FAN | Live fantasy points preview |
| GET | `/football/fixtures/:id/events` | None | Match events list |
| GET | `/football/fixtures/:id/lineups` | None | Lineup for fixture |
| GET | `/football/fixtures/:id/availability` | None | Player availability check |
| GET | `/football/standings` | None | League standings (seasonId, competitionId) |
| GET | `/football/match-centre/:fixtureId` | None | Combined match centre data |

**Admin routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| PATCH | `/football/admin/fixtures/:id/status` | PSL_ADMIN | Update fixture status |
| PATCH | `/football/admin/fixtures/:id/score` | PSL_ADMIN | Update fixture score |
| POST | `/football/admin/fixtures/:id/events` | PSL_ADMIN | Add match event |
| POST | `/football/admin/fixtures/:id/lineups` | PSL_ADMIN | Set lineups |
| PATCH | `/football/admin/fixtures/:id/live-state` | PSL_ADMIN | Update live state |
| POST | `/football/admin/fixtures/:id/match-events` | PSL_ADMIN | Bulk add match events |
| PATCH | `/football/admin/events/:eventId` | PSL_ADMIN | Update event |

---

## /profile — Fan Profile

**Purpose:** Fan profile management and preferences.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/profile/me` | FAN | Get own profile |
| PATCH | `/profile/me` | FAN | Update display name, bio, avatar, favourite team |
| GET | `/profile/preferences` | FAN | Get notification preferences |
| PATCH | `/profile/preferences` | FAN | Update notification preferences |
| GET | `/profile/summary` | FAN | Profile summary card (FV, achievements, predictions) |

---

## /gameweeks — Gameweeks

**Purpose:** Gameweek lifecycle management. Fans read gameweek state; admins control it.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/gameweeks` | None | List all gameweeks (optional seasonId) |
| GET | `/gameweeks/active` | None | Current active/open gameweek |
| GET | `/gameweeks/:id` | None | Gameweek detail |
| GET | `/gameweeks/:id/fixtures` | None | Fixtures in gameweek |
| GET | `/gameweeks/:id/lock-state` | None | Whether gameweek is locked |
| PATCH | `/admin/gameweeks/:id/status` | PSL_ADMIN | Update gameweek status |
| PATCH | `/admin/gameweeks/:id/deadlines` | PSL_ADMIN | Update gameweek deadline |

---

## /predictions — Guess the Score

**Purpose:** Score prediction game. Fans predict match scores; admin settles predictions after matches.

**Fan routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/predictions` | FAN | Create prediction for a fixture |
| GET | `/predictions/me` | FAN | All own predictions |
| GET | `/predictions/me/:fixtureId` | FAN | Own prediction for specific fixture |
| PATCH | `/predictions/:id` | FAN | Update prediction (only while fixture is open) |
| GET | `/predictions/fixtures/:fixtureId/lock-state` | FAN | Whether predictions are locked for fixture |
| GET | `/predictions/gameweek/:gameweekId` | FAN | Predictions for a gameweek |

**Admin routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/predictions/admin/settle-fixture/:fixtureId` | PSL_ADMIN | Settle all predictions for fixture |
| POST | `/predictions/admin/lock-fixture/:fixtureId` | PSL_ADMIN | Lock predictions for fixture |
| POST | `/predictions/admin/void-fixture/:fixtureId` | PSL_ADMIN | Void all predictions for fixture |
| POST | `/predictions/admin/lock-gameweek/:gameweekId` | PSL_ADMIN | Lock all fixtures in gameweek |
| POST | `/predictions/admin/lock-gameweek/:gameweekId/force` | PSL_ADMIN | Force-lock even with issues |
| POST | `/predictions/admin/settle-gameweek/:gameweekId` | PSL_ADMIN | Settle all fixtures in gameweek |

**Scoring:** 10 pts (exact), 5 pts (correct goal diff), 3 pts (correct result), 0 pts (wrong). Non-financial.

---

## /challenges — Peer Challenges

**Purpose:** Head-to-head prediction contests between fans.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/challenges` | FAN | Create challenge vs. another fan on a fixture |
| GET | `/challenges/me` | FAN | Own challenges (sent + received) |
| GET | `/challenges/:id` | FAN | Challenge detail |
| POST | `/challenges/:id/accept` | FAN | Accept incoming challenge |
| POST | `/challenges/:id/decline` | FAN | Decline incoming challenge |
| POST | `/challenges/:id/cancel` | FAN | Cancel sent challenge |

**Notes:** Challenges use Fan Value as wager — non-financial, no cash value.

---

## /leaderboards — Season-Scoped Leaderboards (STORY-33)

**Purpose:** Fan-facing season-scoped leaderboards. Default to active season. `?seasonSlug=` for historical access.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/leaderboards` | None | Overview snapshot: top-5 from all 4 leaderboard types |
| GET | `/leaderboards/seasons` | None | All seasons with leaderboard URLs |
| GET | `/leaderboards/overall?seasonSlug=` | None | Overall leaderboard (Fan Value, avoids double-counting) |
| GET | `/leaderboards/fan-value?seasonSlug=` | None | Fan Value leaderboard by season (non-financial) |
| GET | `/leaderboards/fantasy?seasonSlug=` | None | Fantasy leaderboard by season (points-only) |
| GET | `/leaderboards/predictions?seasonSlug=` | None | Predictions leaderboard by season (points-only) |
| GET | `/leaderboards/achievements` | None | Achievements leaderboard (always ALL_TIME, cross-season) |

---

## /fantasy — Fantasy Football

**Purpose:** Full fantasy football lifecycle: team management, transfers, chips, scoring, leagues, cups.

**Fan routes (team):**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/fantasy/team` | FAN | Create fantasy team for active season |
| GET | `/fantasy/team/me` | FAN | Get own fantasy team |
| POST | `/fantasy/team/me` | FAN | Alias create own team |
| PATCH | `/fantasy/team/me` | FAN | Update team name/formation |
| POST | `/fantasy/team/me/players` | FAN | Add player to team |
| DELETE | `/fantasy/team/me/players/:playerId` | FAN | Remove player from team |
| PATCH | `/fantasy/team/me/players/:playerId` | FAN | Update player role (captain/VC/bench order) |
| POST | `/fantasy/team/me/transfers` | FAN | Make a transfer |
| POST | `/fantasy/team/me/validate` | FAN | Validate team before gameweek |
| POST | `/fantasy/validate` | FAN | Validate team composition |

**Fan routes (data):**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/fantasy/player-pool` | FAN | Browse available players |
| GET | `/fantasy/player-pool/:fixtureId` | FAN | Players for a fixture |
| GET | `/fantasy/deadline` | FAN | Current transfer deadline |
| GET | `/fantasy/gameweeks/:gameweekId/deadline` | FAN | Deadline for specific gameweek |
| GET | `/fantasy/gameweeks/:gameweekId/score` | FAN | Fantasy score for gameweek |
| GET | `/fantasy/gameweeks/:gameweekId/players` | FAN | Player scores for gameweek |
| GET | `/fantasy/transfers/status` | FAN | Transfer status (free transfers remaining) |
| GET | `/fantasy/chips` | FAN | Available chips |
| POST | `/fantasy/chips/:chipId/activate` | FAN | Activate chip |
| POST | `/fantasy/chips/:chipId/cancel` | FAN | Cancel active chip |
| GET | `/fantasy/player-prices` | FAN | Player price list |
| GET | `/fantasy/leagues/me` | FAN | Own leagues |
| POST | `/fantasy/leagues/private` | FAN | Create private league |
| POST | `/fantasy/leagues/join` | FAN | Join by invite code |
| POST | `/fantasy/leagues/public/join` | FAN | Join public league |
| GET | `/fantasy/leagues/:leagueId` | FAN | League detail |
| GET | `/fantasy/leagues/:leagueId/standings` | FAN | League standings |
| POST | `/fantasy/leagues/:leagueId/leave` | FAN | Leave league |
| GET | `/fantasy/cups/me` | FAN | Own cups |
| GET | `/fantasy/cups/:id` | FAN | Cup detail |

**Admin routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/fantasy/admin/settle-fixture/:fixtureId` | PSL_ADMIN | Settle fantasy points for fixture |
| POST | `/fantasy/admin/gameweeks/:gameweekId/recalculate-deadline` | PSL_ADMIN | Recalculate deadline |
| POST | `/fantasy/admin/gameweeks/:gameweekId/rollover-transfers` | PSL_ADMIN | Rollover unused transfers |
| POST | `/fantasy/admin/players/:playerId/price` | PSL_ADMIN | Update player price |
| POST | `/fantasy/admin/gameweeks/:gameweekId/process-auto-subs` | PSL_ADMIN | Process auto-substitutions |
| POST | `/fantasy/admin/fixtures/:fixtureId/match-stats` | PSL_ADMIN | Set match stats for fixture |
| POST | `/fantasy/admin/fixtures/:fixtureId/settle-fantasy-points` | PSL_ADMIN | Settle fantasy for fixture |
| POST | `/fantasy/admin/scoring/gameweeks/:gameweekId/settle` | PSL_ADMIN | Full gameweek scoring settlement |
| POST | `/fantasy/admin/scoring/gameweeks/:gameweekId/recalculate` | PSL_ADMIN | Recalculate gameweek scores |

---

## /fan-value — Fan Value Ledger

**Purpose:** Non-financial engagement currency tracking. No cash value.

**Fan routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/fan-value/summary` | FAN | Total FV balance and breakdown |
| GET | `/fan-value/ledger` | FAN | Full transaction ledger (paginated) |
| GET | `/fan-value/by-type` | FAN | FV grouped by entry type |
| GET | `/fan-value/by-source` | FAN | FV grouped by source |
| GET | `/fan-value/seasons/:seasonId` | FAN | FV for specific season |
| GET | `/fan-value/gameweeks/:gameweekId` | FAN | FV for specific gameweek |

**Admin routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/fan-value/admin/summary` | PSL_ADMIN | Platform-wide FV summary |
| GET | `/fan-value/admin/users/:userId/ledger` | PSL_ADMIN | Ledger for specific user |
| POST | `/fan-value/admin/entries` | PSL_ADMIN | Post manual FV entry |
| POST | `/fan-value/admin/entries/:entryId/void` | PSL_ADMIN | Void an entry |
| POST | `/fan-value/admin/sponsor-engagement-ready` | PSL_ADMIN | Mark fan as sponsor-engagement ready |

---

## /achievements — Achievements & Badges

**Purpose:** Achievement and badge system. Fans earn achievements through platform activity.

**Fan routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/achievements` | FAN | Own achievements |
| GET | `/achievements/summary` | FAN | Achievement summary card |
| GET | `/achievements/progress` | FAN | Progress toward locked achievements |
| GET | `/achievements/badges` | FAN | Own badges |
| GET | `/achievements/definitions` | FAN | All achievement definitions (public) |
| GET | `/achievements/definitions/badges` | FAN | Badge definitions linked to achievements |
| POST | `/achievements/evaluate` | FAN | Trigger self-evaluation |

**Admin routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/achievements/admin/stats` | PSL_ADMIN | Platform achievement stats |
| GET | `/achievements/admin/definitions` | PSL_ADMIN | All definitions with counts |
| POST | `/achievements/admin/definitions` | PSL_ADMIN | Create definition |
| PATCH | `/achievements/admin/definitions/:id` | PSL_ADMIN | Update definition |
| GET | `/achievements/admin/badges` | PSL_ADMIN | All badges |
| POST | `/achievements/admin/badges` | PSL_ADMIN | Create badge |
| PATCH | `/achievements/admin/badges/:id` | PSL_ADMIN | Update badge |
| POST | `/achievements/admin/link-badge` | PSL_ADMIN | Link badge to definition |
| GET | `/achievements/admin/users/:userId` | PSL_ADMIN | User's achievements |
| POST | `/achievements/admin/users/:userId/award` | PSL_ADMIN | Manually award achievement |
| POST | `/achievements/admin/users/:userId/revoke-achievement/:fanAchievementId` | PSL_ADMIN | Revoke achievement |
| POST | `/achievements/admin/users/:userId/revoke-badge/:fanBadgeId` | PSL_ADMIN | Revoke badge |
| POST | `/achievements/admin/evaluate/:userId` | PSL_ADMIN | Evaluate user for all achievements |

---

## /rewards-readiness — Rewards Readiness

**Purpose:** Fan eligibility for sponsor rewards. Non-financial, no redemption in Sprint 1.

**Fan routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/rewards-readiness` | FAN | Own reward readiness records |
| GET | `/rewards-readiness/eligible` | FAN | Rewards the fan is eligible for |
| GET | `/rewards-readiness/locked` | FAN | Rewards the fan is not yet eligible for |
| POST | `/rewards-readiness/evaluate` | FAN | Trigger own eligibility evaluation |
| GET | `/rewards-readiness/definitions` | FAN | All reward definitions |

**Admin routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/rewards-readiness/admin/stats` | PSL_ADMIN | Platform eligibility stats |
| GET | `/rewards-readiness/admin/definitions` | PSL_ADMIN | All definitions with eligible counts |
| POST | `/rewards-readiness/admin/definitions` | PSL_ADMIN | Create definition |
| PATCH | `/rewards-readiness/admin/definitions/:id` | PSL_ADMIN | Update definition |
| POST | `/rewards-readiness/admin/definitions/:id/toggle` | PSL_ADMIN | Enable/disable definition |
| GET | `/rewards-readiness/admin/definitions/:id/eligible-fans` | PSL_ADMIN | Fans eligible for definition |
| POST | `/rewards-readiness/admin/evaluate/:userId` | PSL_ADMIN | Evaluate specific user |
| POST | `/rewards-readiness/admin/evaluate-all` | PSL_ADMIN | Evaluate all fans |

---

## /notifications — Notifications & Alerts

**Purpose:** In-app notification delivery and preference management.

**Fan routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/notifications` | FAN | Notification inbox (paginated) |
| GET | `/notifications/unread-count` | FAN | Count of unread notifications |
| GET | `/notifications/preferences` | FAN | Notification preferences |
| PATCH | `/notifications/preferences` | FAN | Update preferences |
| GET | `/notifications/:id` | FAN | Notification detail |
| POST | `/notifications/:id/read` | FAN | Mark as read |
| POST | `/notifications/read-all` | FAN | Mark all as read |
| POST | `/notifications/:id/archive` | FAN | Archive notification |

**Admin routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/notifications/admin/stats` | PSL_ADMIN | Delivery stats |
| GET | `/notifications/admin/recent` | PSL_ADMIN | Recent notifications |
| POST | `/notifications/admin/users/:userId` | PSL_ADMIN | Send notification to specific user |
| POST | `/notifications/admin/broadcast` | PSL_ADMIN | Broadcast to all fans |
| POST | `/notifications/admin/fantasy-deadline` | PSL_ADMIN | Send fantasy deadline alert |
| POST | `/notifications/admin/live-match-alert` | PSL_ADMIN | Send live match alert |

**Notes:** Sprint 1 delivery is in-app only. Email/SMS/push channels are Sprint 3.

---

## /activity-feed — Social Activity Feed

**Purpose:** Social feed of fan platform activity with reactions and moderation.

**Fan routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/activity-feed` | None | Global activity feed (paginated) |
| GET | `/activity-feed/me` | FAN | Own activity feed |
| GET | `/activity-feed/:id` | None | Activity item detail |
| POST | `/activity-feed/:id/reactions` | FAN | Add reaction to item |
| DELETE | `/activity-feed/:id/reactions/:reactionType` | FAN | Remove own reaction |
| POST | `/activity-feed/:id/hide` | FAN | Hide own activity item |

**Admin routes:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/activity-feed/admin` | PSL_ADMIN | Full admin feed (includes hidden) |
| GET | `/activity-feed/admin/stats` | PSL_ADMIN | Activity feed stats |
| POST | `/activity-feed/admin/system` | PSL_ADMIN | Post system announcement |
| POST | `/activity-feed/admin/live-match-alert` | PSL_ADMIN | Post live match alert item |
| POST | `/activity-feed/admin/:id/hide` | PSL_ADMIN | Admin-hide item |
| POST | `/activity-feed/admin/:id/unhide` | PSL_ADMIN | Admin-unhide item |

---

## /admin-dashboard — Admin Command Centre

**Purpose:** Aggregated operational metrics for PSL_ADMIN. All routes require `PSL_ADMIN` role.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/admin-dashboard` | PSL_ADMIN | Full dashboard (all sections in parallel) |
| GET | `/admin-dashboard/overview` | PSL_ADMIN | Platform KPI overview |
| GET | `/admin-dashboard/health` | PSL_ADMIN | Platform health status |
| GET | `/admin-dashboard/action-required` | PSL_ADMIN | Items requiring admin action |
| GET | `/admin-dashboard/recent-events` | PSL_ADMIN | Recent operational events |
| GET | `/admin-dashboard/quick-links` | PSL_ADMIN | Quick links to admin pages |
| GET | `/admin-dashboard/football` | PSL_ADMIN | Football domain summary |
| GET | `/admin-dashboard/fans` | PSL_ADMIN | Fan domain summary |
| GET | `/admin-dashboard/fantasy` | PSL_ADMIN | Fantasy domain summary |
| GET | `/admin-dashboard/predictions` | PSL_ADMIN | Predictions domain summary |
| GET | `/admin-dashboard/challenges` | PSL_ADMIN | Challenges domain summary |
| GET | `/admin-dashboard/fan-value` | PSL_ADMIN | Fan Value domain summary |
| GET | `/admin-dashboard/achievements` | PSL_ADMIN | Achievements domain summary |
| GET | `/admin-dashboard/rewards` | PSL_ADMIN | Rewards domain summary |
| GET | `/admin-dashboard/notifications` | PSL_ADMIN | Notifications domain summary |
| GET | `/admin-dashboard/activity` | PSL_ADMIN | Activity domain summary |
| GET | `/admin-dashboard/guess-the-score` | PSL_ADMIN | Guess the Score command centre |
| GET | `/admin-dashboard/fantasy-rules` | PSL_ADMIN | Fantasy Rules command centre |
| GET | `/admin-dashboard/fantasy-league` | PSL_ADMIN | Fantasy League command centre |
| GET | `/admin-dashboard/league-management` | PSL_ADMIN | League Management command centre |
| GET | `/admin-dashboard/fixture-management` | PSL_ADMIN | Fixture Management command centre |
| GET | `/admin-dashboard/sponsor-management` | PSL_ADMIN | Sponsor Management command centre |
| GET | `/admin-dashboard/content-moderation` | PSL_ADMIN | Content Moderation command centre |
| GET | `/admin-dashboard/reporting` | PSL_ADMIN | Reporting Centre command centre |
| GET | `/admin-dashboard/compliance` | PSL_ADMIN | Compliance command centre |
| GET | `/admin-dashboard/user-audience` | PSL_ADMIN | User Audience command centre |
| GET | `/admin-dashboard/system-operations` | PSL_ADMIN | System Operations command centre |

---

## /admin/competitions — Competition Admin

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/admin/competitions` | PSL_ADMIN | List competitions |
| POST | `/admin/competitions` | PSL_ADMIN | Create competition |
| PATCH | `/admin/competitions/:id` | PSL_ADMIN | Update competition |
| GET | `/admin/competitions/:id/seasons` | PSL_ADMIN | List seasons for competition |
| POST | `/admin/competitions/:id/seasons` | PSL_ADMIN | Create season |
| PATCH | `/admin/seasons/:id` | PSL_ADMIN | Update season |
| POST | `/admin/seasons/:id/activate` | PSL_ADMIN | Activate season (deactivates others) |

---

## /admin/imports — Data Import Pipeline

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/admin/imports` | PSL_ADMIN | List import jobs |
| POST | `/admin/imports/validate` | PSL_ADMIN | Validate import payload |
| POST | `/admin/imports/commit` | PSL_ADMIN | Commit validated import |
| POST | `/admin/imports/manual` | PSL_ADMIN | Create manual import entry |
| GET | `/admin/imports/:id` | PSL_ADMIN | Import job detail |
| POST | `/admin/imports/:id/retry` | PSL_ADMIN | Retry failed job |
| POST | `/admin/imports/:id/cancel` | PSL_ADMIN | Cancel job |
| POST | `/admin/imports/manual/competition` | PSL_ADMIN | Manual competition entry |
| POST | `/admin/imports/manual/season` | PSL_ADMIN | Manual season entry |
| POST | `/admin/imports/manual/team` | PSL_ADMIN | Manual team entry |
| POST | `/admin/imports/manual/player` | PSL_ADMIN | Manual player entry |
| POST | `/admin/imports/manual/venue` | PSL_ADMIN | Manual venue entry |
| POST | `/admin/imports/manual/fixture` | PSL_ADMIN | Manual fixture entry |

---

## /admin/fixtures — Fixture Assignment

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/admin/fixtures/unassigned` | PSL_ADMIN | Unassigned fixtures |
| GET | `/admin/fixtures/assignment-summary` | PSL_ADMIN | Assignment coverage summary |
| POST | `/admin/fixtures/bulk-assign-gameweek` | PSL_ADMIN | Bulk assign fixtures to gameweek |
| POST | `/admin/fixtures/bulk-assign-stage` | PSL_ADMIN | Bulk assign fixtures to stage |
| POST | `/admin/fixtures/auto-assign` | PSL_ADMIN | Auto-assign by date range |
| POST | `/admin/fixtures/:id/assign-gameweek` | PSL_ADMIN | Assign fixture to gameweek |
| POST | `/admin/fixtures/:id/assign-stage` | PSL_ADMIN | Assign fixture to stage |

---

## /health & /version

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | None | API health check |
| GET | `/version` | None | API version |

## /clubs — Club Experience (STORY-26)

### Fan Routes (Public)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/clubs` | None | List clubs (optional `?season=` slug filter) |
| GET | `/clubs/:slug` | None | Club identity and profile |
| GET | `/clubs/:slug/overview` | None | Club hub overview (fixture preview, squad preview, news) |
| GET | `/clubs/:slug/fixtures` | None | Upcoming fixtures for club |
| GET | `/clubs/:slug/results` | None | Recent results for club |
| GET | `/clubs/:slug/squad` | None | Squad grouped by position |
| GET | `/clubs/:slug/stats` | None | Club stats aggregate |
| GET | `/clubs/:slug/stadium` | None | Home venue/stadium info |
| GET | `/clubs/:slug/tickets` | None | Ticketing readiness (MVP stub — no sales) |
| GET | `/clubs/:slug/shop` | None | Club shopfront catalogue (no checkout) |
| GET | `/clubs/:slug/shop/:productSlug` | None | Product detail (no checkout) |

### Admin Routes (PSL_ADMIN only)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/clubs/admin/list` | PSL_ADMIN | All clubs with readiness status |
| GET | `/clubs/admin/readiness` | PSL_ADMIN | Readiness summary across all clubs |
| GET | `/clubs/admin/fixtures/unassigned` | PSL_ADMIN | Fixtures missing gameweek |
| GET | `/clubs/admin/players/unassigned` | PSL_ADMIN | Players without season registration |
| GET | `/clubs/admin/seasons/:seasonId/teams` | PSL_ADMIN | Teams registered for season |
| POST | `/clubs/admin/seasons/:seasonId/teams` | PSL_ADMIN | Add team to season |
| PATCH | `/clubs/admin/seasons/:seasonId/teams/:teamId` | PSL_ADMIN | Update participation status |
| DELETE | `/clubs/admin/seasons/:seasonId/teams/:teamId` | PSL_ADMIN | Remove team from season (club not deleted) |
| GET | `/clubs/admin/seasons/:seasonId/validate` | PSL_ADMIN | Validate season participation |
| GET | `/clubs/admin/seasons/:seasonId/fixtures/validate` | PSL_ADMIN | Validate fixture readiness |
| GET | `/clubs/admin/:id` | PSL_ADMIN | Admin club detail |
| GET | `/clubs/admin/:id/experience` | PSL_ADMIN | Club experience readiness status |
| GET | `/clubs/admin/:id/players` | PSL_ADMIN | Club players list |
| GET | `/clubs/admin/:id/shop/readiness` | PSL_ADMIN | Shopfront readiness check |
| GET | `/clubs/admin/:id/fixtures` | PSL_ADMIN | Club fixtures for admin |
| POST | `/clubs/admin/:id/validate` | PSL_ADMIN | Run data quality validation |
| POST | `/clubs/admin/:id/seasons/:seasonId/players` | PSL_ADMIN | Assign player to club for season |
| PATCH | `/clubs/admin/:id/seasons/:seasonId/players/:playerId` | PSL_ADMIN | Update player assignment |
| DELETE | `/clubs/admin/:id/seasons/:seasonId/players/:playerId` | PSL_ADMIN | Remove player from season squad |
| POST | `/clubs/admin/:id/seasons/:seasonId/players/:playerId/move` | PSL_ADMIN | Move player to another club |
| GET | `/clubs/admin/:id/seasons/:seasonId/squad/validate` | PSL_ADMIN | Validate squad completeness |
| PATCH | `/clubs/admin/fixtures/:fixtureId/teams` | PSL_ADMIN | Assign teams to fixture |
| PATCH | `/clubs/admin/fixtures/:fixtureId/venue` | PSL_ADMIN | Assign venue to fixture |
| PATCH | `/clubs/admin/fixtures/:fixtureId/gameweek` | PSL_ADMIN | Assign gameweek to fixture |
| PATCH | `/clubs/admin/fixtures/:fixtureId/assignment-status` | PSL_ADMIN | Update fixture assignment status |

## Fixture Import (STORY-27)

### Admin Routes (PSL_ADMIN only — controller: `fixtures/admin`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/fixtures/admin/imports` | PSL_ADMIN | List all import batches (filter by ?seasonId) |
| POST | `/fixtures/admin/imports` | PSL_ADMIN | Create new import batch |
| GET | `/fixtures/admin/imports/:batchId` | PSL_ADMIN | Get batch detail with season |
| DELETE | `/fixtures/admin/imports/:batchId` | PSL_ADMIN | Delete DRAFT/FAILED batch |
| GET | `/fixtures/admin/imports/:batchId/summary` | PSL_ADMIN | Batch summary with row counts by status |
| GET | `/fixtures/admin/imports/:batchId/rows` | PSL_ADMIN | List rows in batch |
| POST | `/fixtures/admin/imports/:batchId/rows` | PSL_ADMIN | Add row to batch |
| PATCH | `/fixtures/admin/imports/:batchId/rows/:rowId` | PSL_ADMIN | Update row |
| DELETE | `/fixtures/admin/imports/:batchId/rows/:rowId` | PSL_ADMIN | Delete row |
| POST | `/fixtures/admin/imports/:batchId/validate` | PSL_ADMIN | Run validation on all rows |
| POST | `/fixtures/admin/imports/:batchId/commit` | PSL_ADMIN | Commit validated rows as unpublished fixtures |
| POST | `/fixtures/admin/imports/:batchId/publish` | PSL_ADMIN | Publish committed fixtures (set isPublished=true) |
| POST | `/fixtures/admin/imports/:batchId/reject` | PSL_ADMIN | Reject batch |
| GET | `/fixtures/admin/validation/season/:seasonId` | PSL_ADMIN | Season-level fixture validation summary |
| GET | `/fixtures/admin/conflicts/season/:seasonId` | PSL_ADMIN | Detect duplicate/overlap conflicts |
| GET | `/fixtures/admin/gameweeks/season/:seasonId/readiness` | PSL_ADMIN | Gameweek assignment readiness |
| POST | `/fixtures/admin/gameweeks/season/:seasonId/auto-create` | PSL_ADMIN | Auto-create gameweeks from round data |
| POST | `/fixtures/admin/gameweeks/season/:seasonId/assign-by-round` | PSL_ADMIN | Assign fixtures to gameweeks by round |
| GET | `/fixtures/admin/publishing/season/:seasonId/readiness` | PSL_ADMIN | Publishing readiness check |
| POST | `/fixtures/admin/publishing/season/:seasonId/publish-provisional` | PSL_ADMIN | Publish all unpublished fixtures in season |
| POST | `/fixtures/admin/publishing/season/:seasonId/unpublish-provisional` | PSL_ADMIN | Unpublish safe fixtures (no predictions/fantasy/events) |

## /football — Season Context (STORY-28 additions)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/football/context` | None | Active season + upcoming seasons context for fan default experience |
| GET | `/football/seasons/:slug` | None | Get season by slug (including historical seasons like WC2026) |

## /seasons/admin — Season Switching (STORY-28)

**Purpose:** Admin-only season switching workflow with readiness checks, preview, activation, completion, rollback, and audit trail.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/seasons/admin/context` | PSL_ADMIN | Admin season context: active, all seasons, last switch |
| GET | `/seasons/admin/switching/history` | PSL_ADMIN | Audit history of all season switch actions |
| GET | `/seasons/admin/switching/readiness/:seasonId` | PSL_ADMIN | Cross-domain readiness check for season activation |
| GET | `/seasons/admin/switching/preview/:seasonId` | PSL_ADMIN | Preview activation impact: fromSeason, toSeason, willComplete, willActivate |
| POST | `/seasons/admin/switching/activate/:seasonId` | PSL_ADMIN | Activate season (transactional, requires acknowledgeWarnings if READY_WITH_WARNINGS) |
| POST | `/seasons/admin/switching/complete/:seasonId` | PSL_ADMIN | Explicitly mark a season COMPLETED |
| POST | `/seasons/admin/switching/rollback/:seasonId` | PSL_ADMIN | Rollback activation — deactivates current and restores prior active season |

## /fantasy/admin/calibration — PSL Fantasy Calibration (STORY-29)

**Purpose:** Admin-only PSL fantasy calibration workflow. Configure provisional rules, pricing, and gameweek deadlines for the PSL season. All values are provisional and clearly marked as such.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/fantasy/admin/calibration` | PSL_ADMIN | List all seasons with calibration status (rules, price count, gameweek count) |
| GET | `/fantasy/admin/calibration/:seasonId` | PSL_ADMIN | Full calibration readiness check (READY / READY_WITH_WARNINGS / BLOCKED) |
| GET | `/fantasy/admin/calibration/:seasonId/readiness` | PSL_ADMIN | Detailed readiness breakdown (blockers, warnings, info) |
| GET | `/fantasy/admin/calibration/:seasonId/rules` | PSL_ADMIN | Get current fantasy rules config (null if not set) |
| POST | `/fantasy/admin/calibration/:seasonId/rules` | PSL_ADMIN | Create provisional PSL rules (halfwayGameweek=15, seasonGameweekCount=30) — idempotent |
| PATCH | `/fantasy/admin/calibration/:seasonId/rules` | PSL_ADMIN | Update specific fantasy rules fields |
| GET | `/fantasy/admin/calibration/:seasonId/players` | PSL_ADMIN | Player price readiness: priced vs unpriced by position |
| POST | `/fantasy/admin/calibration/:seasonId/players/generate-prices` | PSL_ADMIN | Generate provisional prices for unpriced registered players — idempotent (skips already-priced) |
| PATCH | `/fantasy/admin/calibration/:seasonId/players/:playerId/price` | PSL_ADMIN | Update single player price |
| GET | `/fantasy/admin/calibration/:seasonId/squads` | PSL_ADMIN | Per-club squad eligibility readiness |
| GET | `/fantasy/admin/calibration/:seasonId/gameweeks` | PSL_ADMIN | Gameweek readiness: fixture linkage and deadline status |
| POST | `/fantasy/admin/calibration/:seasonId/gameweeks/derive-deadlines` | PSL_ADMIN | Derive transfer/prediction deadlines from earliest fixture kickoff (−90 min) |
| GET | `/fantasy/admin/calibration/:seasonId/activation-impact` | PSL_ADMIN | Summary of platform state impact if season is activated |

## /predictions/admin/calibration — PSL Prediction Calibration (STORY-30)

**Purpose:** Admin-only PSL prediction calibration workflow. Configure prediction rules, view fixture eligibility, monitor lock/settlement/challenge readiness. All values are provisional and clearly marked as such. No gambling mechanics.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/predictions/admin/calibration` | PSL_ADMIN | List all seasons with prediction calibration status |
| GET | `/predictions/admin/calibration/:seasonId` | PSL_ADMIN | Calibration readiness dashboard (READY / READY_WITH_WARNINGS / BLOCKED) |
| GET | `/predictions/admin/calibration/:seasonId/readiness` | PSL_ADMIN | Detailed readiness check breakdown |
| GET | `/predictions/admin/calibration/:seasonId/rules` | PSL_ADMIN | Get current prediction rules config (null if not set) |
| POST | `/predictions/admin/calibration/:seasonId/rules` | PSL_ADMIN | Create provisional PSL prediction rules (10/5/3/0 scoring — matches engine defaults) |
| PATCH | `/predictions/admin/calibration/:seasonId/rules` | PSL_ADMIN | Update specific prediction rules fields or promote to ACTIVE |
| GET | `/predictions/admin/calibration/:seasonId/fixture-eligibility` | PSL_ADMIN | Per-fixture eligibility: published, kickoff status, reasons |
| GET | `/predictions/admin/calibration/:seasonId/lock-readiness` | PSL_ADMIN | Lock readiness: open vs locked, lock reason per fixture |
| GET | `/predictions/admin/calibration/:seasonId/settlement-readiness` | PSL_ADMIN | Settlement readiness: finished fixtures with results ready to settle |
| GET | `/predictions/admin/calibration/:seasonId/peer-challenge-readiness` | PSL_ADMIN | Peer challenge counts by status for published fixtures |
| GET | `/predictions/admin/calibration/:seasonId/activation-impact` | PSL_ADMIN | Impact summary: fixtures, rules config, prediction counts |

## /predictions — Fan Prediction Routes Extended (STORY-30)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/predictions/fixtures` | JWT | List published, prediction-eligible fixtures (optionally filtered by `?seasonSlug=`) |
| GET | `/predictions/fixtures/:fixtureId/eligibility` | JWT | Per-fixture eligibility check with ineligibility reasons |

## /gameweeks/admin/operations — Gameweek & Matchday Operations (STORY-31)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/gameweeks/admin/operations/seasons` | PSL_ADMIN | List all seasons with gameweek/fixture metadata |
| GET | `/gameweeks/admin/operations/:seasonId/overview` | PSL_ADMIN | Season operations overview: status, blockers, warnings, next action |
| GET | `/gameweeks/admin/operations/:seasonId/gameweeks` | PSL_ADMIN | Per-gameweek computed operational status list |
| GET | `/gameweeks/admin/operations/:seasonId/gameweeks/:gameweekId` | PSL_ADMIN | Single gameweek operational detail |
| GET | `/gameweeks/admin/operations/:seasonId/readiness` | PSL_ADMIN | Season gameweek readiness: fixture assignment coverage |
| GET | `/gameweeks/admin/operations/:seasonId/deadlines` | PSL_ADMIN | Per-gameweek deadline validity |
| GET | `/gameweeks/admin/operations/:seasonId/fixture-assignment` | PSL_ADMIN | Cross-domain fixture assignment: validation, conflicts, gameweek coverage |
| GET | `/gameweeks/admin/operations/:seasonId/fantasy-impact` | PSL_ADMIN | Fantasy calibration status and gameweek readiness |
| GET | `/gameweeks/admin/operations/:seasonId/prediction-impact` | PSL_ADMIN | Prediction calibration, lock readiness, fixture eligibility |
| GET | `/gameweeks/admin/operations/:seasonId/publication-readiness` | PSL_ADMIN | Fixture publication status and per-gameweek breakdown |
| GET | `/gameweeks/admin/operations/:seasonId/activation-impact` | PSL_ADMIN | Cross-domain activation readiness aggregation |
| GET | `/gameweeks/admin/operations/:seasonId/matchday-control` | PSL_ADMIN | Full matchday control panel: safety flags, status counts, next actions |
| POST | `/gameweeks/admin/operations/:seasonId/gameweeks/derive` | PSL_ADMIN | Derive gameweeks from fixtures (delegates to autoCreateGameweeks) |
| POST | `/gameweeks/admin/operations/:seasonId/derive-deadlines` | PSL_ADMIN | Derive transfer/prediction deadlines with mode and buffer options |
| POST | `/gameweeks/admin/operations/:seasonId/validate` | PSL_ADMIN | Comprehensive season gameweek validation |
| GET | `/predictions/me?seasonSlug=` | JWT | Fan predictions filtered by season slug (no seasonSlug = all predictions) |

## /admin/operations — Admin Operations Control Plane (STORY-32)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/admin/operations/overview` | PSL_ADMIN | Admin operations overview: sections, summary, safety note |
| GET | `/admin/operations/capability-review` | PSL_ADMIN | 9-category capability gap review with status and evidence |
| GET | `/admin/operations/launch-readiness` | PSL_ADMIN | Full launch readiness checklist with pass/fail/pending counts |
| GET | `/admin/operations/module-readiness/:seasonId` | PSL_ADMIN | Per-season module readiness: 19 modules with status and blockers |
| GET | `/admin/operations/smoke-tests/routes` | PSL_ADMIN | Deterministic route inventory (static smoke test list) |
| GET | `/admin/operations/smoke-tests/rbac` | PSL_ADMIN | RBAC definitions: PSL_ADMIN / FAN / UNAUTHENTICATED role boundaries |
| GET | `/admin/operations/smoke-tests/workflows` | PSL_ADMIN | Key workflow summaries with readiness and blockers |
| POST | `/admin/operations/smoke-tests/run` | PSL_ADMIN | Run static smoke test checks (no live HTTP calls) |
| GET | `/admin/operations/integrations/providers` | PSL_ADMIN | All IntegrationProviderConfig records (non-sensitive readiness state) |
| GET | `/admin/operations/integrations/commercial-readiness` | PSL_ADMIN | Commercial readiness summary: gameplay economy + provider statuses |
| GET | `/admin/operations/integrations/wallet-payments` | PSL_ADMIN | Wallet and payment provider readiness detail |
| GET | `/admin/operations/integrations/checkout-commerce` | PSL_ADMIN | Checkout and commerce readiness detail |
| GET | `/admin/operations/integrations/ticketing` | PSL_ADMIN | Ticket inventory and issuance readiness detail |
| GET | `/admin/operations/integrations/live-data` | PSL_ADMIN | Live sports data provider readiness detail |
| GET | `/admin/operations/integrations/sponsor-activation` | PSL_ADMIN | Sponsor activation readiness detail |
| GET | `/admin/operations/integrations/rewards-redemption` | PSL_ADMIN | Rewards redemption readiness detail |

## /admin/engagement — Admin Engagement Metrics (STORY-33)

**Purpose:** Season-scoped admin visibility into fan engagement, leaderboard health, unscoped ledger audit, and activation impact.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/admin/engagement/seasons` | PSL_ADMIN | All seasons available for engagement analysis |
| GET | `/admin/engagement/:seasonId/overview` | PSL_ADMIN | Full engagement overview: FanValue, Fantasy, Predictions, Achievements, safety confirmations |
| GET | `/admin/engagement/:seasonId/leaderboards` | PSL_ADMIN | Top-5 leaderboard snapshots across all types |
| GET | `/admin/engagement/:seasonId/fan-value` | PSL_ADMIN | Fan value engagement: totals, by-type, by-source, unscoped count |
| GET | `/admin/engagement/:seasonId/fantasy` | PSL_ADMIN | Fantasy engagement: net points, teams, leagues |
| GET | `/admin/engagement/:seasonId/predictions` | PSL_ADMIN | Prediction engagement: points, count, settled, unique fans |
| GET | `/admin/engagement/:seasonId/achievements` | PSL_ADMIN | Achievement engagement: global unlocked count, fan value via achievements |
| GET | `/admin/engagement/:seasonId/unscoped-ledger` | PSL_ADMIN | Fan value entries with null seasonId (admin-visible only) |
| GET | `/admin/engagement/:seasonId/season-scope-audit` | PSL_ADMIN | 10-check scope audit: READY / READY_WITH_WARNINGS / BLOCKED |
| GET | `/admin/engagement/:seasonId/activation-impact` | PSL_ADMIN | Activation impact: WC preservation, PSL start, safety confirmations |

## /players — Player Stats (STORY-34)

**Purpose:** Authoritative player match statistics — per-player season aggregates, fixture stats, gameweek stats, top performers.

### Fan routes (open)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/players/:playerId/profile` | PUBLIC | Player profile with career stats summary (PUBLISHED/VERIFIED only) |
| GET | `/players/:playerId/season/:seasonId/stats` | PUBLIC | Player season stats: match-by-match history + season totals |
| GET | `/players/:playerId/fixture/:fixtureId/stats` | PUBLIC | Single player match stat detail |
| GET | `/players/fixtures/:fixtureId/stats` | PUBLIC | All player stats for a fixture (PUBLISHED/VERIFIED only) |
| GET | `/players/season/:seasonId/top-performers` | PUBLIC | Top scorers and top assists for a season |
| GET | `/players/gameweek/:gameweekId/stats` | PUBLIC | All player stats for a gameweek |
| GET | `/players/season/:seasonId/team/:teamId/squad-stats` | PUBLIC | Aggregated squad stats for a team in a season |

### Admin routes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/players/admin/stats` | PSL_ADMIN | List all stat entries with optional ?seasonId / ?fixtureId / ?status filters |
| GET | `/players/admin/stats/season/:seasonId/readiness` | PSL_ADMIN | Season stats readiness: NO_DATA / PROVISIONAL / PARTIAL / VERIFIED / PUBLISHED |
| GET | `/players/admin/stats/:id` | PSL_ADMIN | Single stat entry detail (all fields, all statuses) |
| POST | `/players/admin/stats` | PSL_ADMIN | Upsert stat entry (derives seasonId, gameweekId from fixture) |
| PUT | `/players/admin/stats/:id` | PSL_ADMIN | Update stat entry |
| POST | `/players/admin/stats/:id/verify` | PSL_ADMIN | Transition DRAFT → VERIFIED, stamps verifiedAt + verifiedByUserId |
| POST | `/players/admin/stats/:id/publish` | PSL_ADMIN | Transition VERIFIED → PUBLISHED, stamps publishedAt |
| POST | `/players/admin/stats/:id/lock` | PSL_ADMIN | Transition PUBLISHED → LOCKED (immutable) |
| POST | `/players/admin/stats/fixtures/:fixtureId/bulk-publish` | PSL_ADMIN | Publish all VERIFIED stats for a fixture in one call |
| DELETE | `/players/admin/stats/:id` | PSL_ADMIN | Delete DRAFT or VERIFIED stat (PUBLISHED/LOCKED protected) |
