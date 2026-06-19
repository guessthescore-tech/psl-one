# Fantasy API Contracts — PSL One Experience

All requests go to the PSL One NestJS backend at `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:4000`).
Auth header: `Authorization: Bearer <psl_access_token>` (stored in localStorage).

Legend: `AUTH` = Bearer token required. `PUBLIC` = no auth required.

---

## Authentication (`src/lib/auth.ts`)

### POST /auth/login
**Auth:** PUBLIC  
**Body:** `{ email: string; password: string }`  
**Response:** `{ accessToken: string; user: { id, email, role } }`  
**Screens:** Login page, onboarding flow

### POST /auth/register
**Auth:** PUBLIC  
**Body:** `{ email: string; password: string }`  
**Response:** `{ accessToken: string; user: { id, email, role } }` or `{ message: string }`  
**Screens:** Registration page

### POST /auth/logout
**Auth:** AUTH  
**Body:** (empty)  
**Response:** 200 OK  
**Screens:** Settings / profile menu

### GET /auth/me
**Auth:** AUTH  
**Response:** `{ id, email, role }`  
**Screens:** Any authenticated screen to re-hydrate user identity

### POST /auth/password-reset/request
**Auth:** PUBLIC  
**Body:** `{ email: string }`  
**Response:** 200 OK (does not reveal whether address exists)  
**Screens:** Forgot password page

### POST /auth/password-reset/confirm
**Auth:** PUBLIC  
**Body:** `{ token: string; newPassword: string }`  
**Response:** 200 OK  
**Screens:** Reset password page (deep-link from email)

---

## Football Data (`src/lib/football-api.ts`)

### GET /football/seasons/active
**Auth:** PUBLIC  
**Response:** `Season` — `{ id, name, slug, startDate, endDate, isActive, competition: { id, name, slug } }`  
**Screens:** Homepage context bar, any screen needing seasonId

### GET /football/fixtures
**Auth:** PUBLIC  
**Query:** `seasonSlug?`, `status?`, `gameweekId?`, `group?`, `teamSlug?`  
**Response:** `Fixture[]`  
**Screens:** Fixtures list, Homepage hero, Matchday overview

### GET /football/fixtures/:id
**Auth:** PUBLIC  
**Response:** `Fixture`  
**Screens:** Match detail page

### GET /football/fixtures/:id/live
**Auth:** PUBLIC  
**Response:** `{ id, status, homeScore, awayScore, currentMinute, period, lastUpdatedAt, kickoffAt, homeTeam, awayTeam }`  
**Screens:** Live match ticker, Homepage live banner (poll every 30s)

### GET /football/fixtures/:id/timeline
**Auth:** PUBLIC  
**Response:** `MatchEvent[]`  
**Screens:** Live match timeline, Match centre events feed

### GET /football/fixtures/:id/lineups
**Auth:** PUBLIC  
**Response:** `FixtureLineup[]`  
**Screens:** Match lineups tab

### GET /football/fixtures/:id/live-fantasy-preview
**Auth:** PUBLIC  
**Response:** `{ provisional: true; fixtureId: string; players: LiveFantasyPlayerPreview[] }`  
**Screens:** Live fantasy points screen, live match dashboard fantasy tab

### GET /football/teams
**Auth:** PUBLIC  
**Query:** `seasonSlug?`  
**Response:** `Team[]`  
**Screens:** Teams hub, Club directory

### GET /football/teams/:slug
**Auth:** PUBLIC  
**Response:** `Team`  
**Screens:** Club detail page

### GET /football/standings
**Auth:** PUBLIC  
**Query:** `seasonSlug?`, `group?`  
**Response:** `StandingGroup[]` — `[{ groupName, standings: Standing[] }]`  
**Screens:** League table, Group standings page

---

## Fantasy Team (`src/lib/fantasy-api.ts`)

### GET /fantasy/team/me
**Auth:** AUTH  
**Response:** `FantasyTeam` — `{ id, name, formation, totalPoints, players: FantasyTeamPlayer[] }`  
**Screens:** My Squad page, Fantasy hub summary card

### POST /fantasy/team/me
**Auth:** AUTH  
**Body:** `{ name: string; players: FantasyPlayerSlot[] }`  
**Response:** `FantasyTeam`  
**Screens:** Squad creation flow (first time)

### PATCH /fantasy/team/me
**Auth:** AUTH  
**Body:** `{ name?: string; formation?: string }`  
**Response:** `FantasyTeam`  
**Screens:** Squad rename modal, formation picker

### POST /fantasy/team/me/players
**Auth:** AUTH  
**Body:** `FantasyPlayerSlot` — `{ playerId, squadRole, benchSlot?, isCaptain?, isViceCaptain? }`  
**Response:** `FantasyTeam`  
**Screens:** Player add flow, squad builder

### DELETE /fantasy/team/me/players/:playerId
**Auth:** AUTH  
**Response:** `FantasyTeam`  
**Screens:** Remove player from squad

### PATCH /fantasy/team/me/players/:playerId
**Auth:** AUTH  
**Body:** `{ squadRole?, benchSlot?, isCaptain?, isViceCaptain? }`  
**Response:** `FantasyTeam`  
**Screens:** Captain/vice-captain selection, bench order drag-and-drop

### POST /fantasy/team/me/transfers
**Auth:** AUTH  
**Body:** `{ removePlayerId: string; addPlayerId: string }`  
**Response:** `FantasyTeam`  
**Screens:** Transfer confirmation page

### POST /fantasy/team/me/validate
**Auth:** AUTH  
**Body:** (empty)  
**Response:** `SquadValidation` — `{ isValid, errors, squadCounts, starterCounts, formation, benchSummary, captainValid, viceCaptainValid, maxPerTeamValid }`  
**Screens:** Squad validation before deadline, squad builder sidebar

---

## Fantasy Player Pool & Prices (`src/lib/fantasy-api.ts`)

### GET /fantasy/player-pool
**Auth:** PUBLIC  
**Query:** `position?` (GOALKEEPER|DEFENDER|MIDFIELDER|FORWARD)  
**Response:** `PlayerSummary[]`  
**Screens:** Player pool browser, transfer search modal

### GET /fantasy/player-prices
**Auth:** PUBLIC  
**Query:** `seasonId?`  
**Response:** `PlayerPriceInfo[]` — `{ playerId, playerName, seasonId, currentPrice }`  
**Screens:** Player pool with price column, budget tracker

---

## Deadline & Transfer Status (`src/lib/fantasy-api.ts`)

### GET /fantasy/deadline
**Auth:** AUTH  
**Query:** `seasonId?`  
**Response:** `DeadlineInfo` — `{ gameweekId, gameweekName, transferDeadlineAt, isLocked, lockReason, serverTime, firstFixtureKickoffAt }`  
**Screens:** Transfer deadline countdown banner, squad lock state

### GET /fantasy/transfers/status
**Auth:** AUTH  
**Response:** `TransferStatus` — `{ fantasyTeamId, freeTransfersAvailable, hasPassedFirstDeadline, totalTransferDeductions, isDeadlineLocked, lockReason, gameweekId, gameweekTransferCount, nextTransferCost, maxTransfersPerGameweek }`  
**Screens:** Transfers page header, budget/transfers remaining chip

---

## Chips (`src/lib/fantasy-api.ts`)

### GET /fantasy/chips
**Auth:** AUTH  
**Response:** `Chip[]` — `{ id, type, status, gameweekId, activatedAt, usedAt }`  
**Screens:** Chips management page, squad builder chip selector

### POST /fantasy/chips/:chipId/activate
**Auth:** AUTH  
**Body:** `{ gameweekId: string }`  
**Response:** `Chip`  
**Screens:** Activate chip confirmation modal

### POST /fantasy/chips/:chipId/cancel
**Auth:** AUTH  
**Body:** (empty)  
**Response:** `Chip`  
**Screens:** Deactivate chip modal (before deadline)

---

## Leagues (`src/lib/fantasy-api.ts`)

### GET /fantasy/leagues/me
**Auth:** AUTH  
**Response:** `LeagueMembership[]` — `{ id, leagueId, userId, fantasyTeamId, role, joinedAt, leftAt, league: League }`  
**Screens:** My Leagues list, League hub

### GET /fantasy/leagues/:id
**Auth:** AUTH  
**Response:** `League` — `{ id, name, type, scoringType, seasonId, inviteCode, isJoinable, createdByUserId, createdAt }`  
**Screens:** League detail header

### GET /fantasy/leagues/:id/standings
**Auth:** AUTH  
**Query:** `type?` (classic|h2h)  
**Response:** `ClassicStandingsRow[]` or `H2HStandingsRow[]`  
**Screens:** League standings table, H2H standings table

### POST /fantasy/leagues/join
**Auth:** AUTH  
**Body:** `{ inviteCode: string }`  
**Response:** `LeagueMembership`  
**Screens:** Join league by code page

### POST /fantasy/leagues/public/join
**Auth:** AUTH  
**Body:** `{ seasonId: string }`  
**Response:** `LeagueMembership`  
**Screens:** Join public league modal

### POST /fantasy/leagues/private
**Auth:** AUTH  
**Body:** `{ name: string; seasonId: string }`  
**Response:** `League`  
**Screens:** Create private league form

### POST /fantasy/leagues/:id/leave
**Auth:** AUTH  
**Body:** (empty)  
**Response:** `LeagueMembership`  
**Screens:** Leave league confirmation modal

---

## Fantasy Rules (`src/lib/fantasy-api.ts`)

### GET /fantasy/rules
**Auth:** PUBLIC  
**Response:** `FantasyRules` — full config object with squad sizes, transfer rules, chip counts, formation constraints  
**Screens:** Fantasy rules info page, squad builder formation constraints, validation error messages

---

## Scoring & History (`src/lib/fantasy-api.ts`)

### GET /fantasy/gameweeks/:id/score
**Auth:** AUTH  
**Response:** `FantasyGameweekScore` — `{ id, grossPoints, transferCost, chipPoints, benchPoints, captainPoints, netPoints, rank, settledAt, gameweek, playerScores }`  
**Screens:** Gameweek points breakdown page, My Points detail

### GET /fantasy/history
**Auth:** AUTH  
**Response:** `FantasyHistoryEntry[]`  
**Screens:** Season history list, cumulative points graph

### GET /fantasy/history/:gameweekId
**Auth:** AUTH  
**Response:** `FantasyGameweekScore` (with playerScores)  
**Screens:** Historical gameweek detail page

---

## Leaderboard (`src/lib/fantasy-api.ts`)

### GET /fantasy/leaderboard
**Auth:** PUBLIC  
**Query:** `seasonId?`  
**Response:** `SeasonLeaderboardRow[]` — `{ rank, fantasyTeamId, teamName, managerName, netPoints, grossPoints, transferCost, seasonId }`  
**Screens:** Global season leaderboard page

### GET /fantasy/leaderboard/gameweek/:gameweekId
**Auth:** PUBLIC  
**Response:** `GameweekLeaderboardRow[]` — `{ rank, fantasyTeamId, teamName, managerName, netPoints, grossPoints, transferCost, gameweekId }`  
**Screens:** Gameweek leaderboard page

---

## Player Stats (`src/lib/players-api.ts`)

### GET /players/:id/profile
**Auth:** PUBLIC  
**Response:** `PlayerProfile` — `{ id, name, position, nationality, dateOfBirth, number, team }`  
**Screens:** Player profile page header

### GET /players/:id/season/:seasonId/stats
**Auth:** PUBLIC  
**Response:** `PlayerSeasonStats` — `{ playerId, seasonId, appearances, minutesPlayed, goals, assists, yellowCards, redCards, cleanSheets, saves, fantasyPoints }`  
**Screens:** Player stats tab on profile page, season stats grid

### GET /players/season/:seasonId/top-performers
**Auth:** PUBLIC  
**Query:** `limit?` (default 10)  
**Response:** `TopPerformer[]` — `{ playerId, playerName, teamName, position, goals, assists, minutesPlayed, fantasyPoints, cleanSheets }`  
**Screens:** Top performers widget on Homepage, Stats hub top scorers/assisters

---

## Media (`src/lib/media-api.ts`)

### GET /fan/media
**Auth:** PUBLIC  
**Query:** `type?` (ARTICLE|VIDEO|GALLERY|PODCAST), `page?`, `clubId?`  
**Response:** `MediaItem[]`  
**Screens:** News feed, Video hub, Club media tab

### GET /fan/media/:slug
**Auth:** PUBLIC  
**Response:** `MediaItem` — `{ id, slug, title, type, summary, body, thumbnailUrl, videoUrl, durationSeconds, tags, publishedAt, club }`  
**Screens:** Article reader page, Video player page

### POST /fan/media/:id/view
**Auth:** AUTH  
**Body:** `{ idempotencyKey: string }`  
**Response:** 200 OK  
**Screens:** Any media detail page (fires on mount, fan-value credit)

### POST /fan/media/:id/complete
**Auth:** AUTH  
**Body:** `{ idempotencyKey: string }`  
**Response:** 200 OK  
**Screens:** Video player completion event, article scroll-to-bottom event (fan-value credit)

---

## Profile (`src/lib/profile-api.ts`)

### GET /profile/me
**Auth:** AUTH  
**Response:** `FanProfile` — `{ id, userId, displayName, city, country, preferredTeamId, preferredTeam, preferences, createdAt, updatedAt }`  
**Screens:** Profile page, Settings page

### PATCH /profile/me
**Auth:** AUTH  
**Body:** `UpdateProfileInput` — `{ displayName?, city?, country?, preferredTeamId? }`  
**Response:** `FanProfile`  
**Screens:** Edit profile form

### GET /profile/summary
**Auth:** AUTH  
**Response:** `ProfileSummary` — `{ email, role, displayName, city, country, preferredTeam, completionPercent }`  
**Screens:** Profile completion banner, Homepage greeting card
