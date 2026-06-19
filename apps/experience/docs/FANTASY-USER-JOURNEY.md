# PSL One — Fantasy Full User Journey Inventory
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-00)
**Status:** DRAFT — awaiting owner review
**Source:** Canonical screen list supplied by owner from Premier League reference screenshots

---

## How to Read This Document

Each screen records: route, purpose, primary user goal, entry/exit points, required API, authentication requirement, three states (empty/loading/error), mobile behaviour, desktop behaviour, accessibility requirements, current build status, dependencies, and acceptance criteria.

**Status values:**
| Status | Meaning |
|--------|---------|
| `NOT_STARTED` | Not designed, not built |
| `DESIGN_ONLY` | Design exists (Vision Studio / design-lab) but no wired data |
| `FRONTEND_BUILT` | Page renders but no live API data |
| `API_WIRED` | Page is connected to live API |
| `TESTED` | Page has passing tests |
| `DEPLOYED` | Live on beta or production |

**Coverage classification (gap analysis):**
| Class | Meaning |
|-------|---------|
| `EXISTS_COMPLETE` | Screen exists, wired, tested |
| `EXISTS_PARTIAL` | Screen exists but functional gaps remain |
| `DESIGN_ONLY` | Exists in Vision Studio / design-lab only |
| `MISSING_FRONTEND` | API exists, no fan-facing page |
| `MISSING_API` | Page skeleton exists, no API behind it |
| `MISSING_BOTH` | Neither page nor API |

---

## Phase 1 — Fantasy Core

---

### Screen 1 — Fantasy Landing

| Field | Value |
|-------|-------|
| **Route** | `/fantasy` |
| **Purpose** | Entry point to the Fantasy product; orient first-time and returning managers |
| **Primary user goal** | Understand what PSL One Fantasy is and get started, or return to their team |
| **Entry points** | Bottom nav Fantasy tab; homepage FantasyGameweekSection CTA; deep link from notification |
| **Exit points** | `/fantasy/team`, `/fantasy/onboarding`, `/fantasy/leagues`, `/fantasy/help` |
| **Required API data** | `GET /api/fantasy/deadline` (next deadline); `GET /api/football/context` (active season); `GET /api/fantasy/team/me` (if authenticated, to fork returning vs new flow) |
| **Required authentication** | Not required to view; required to enter onboarding |
| **Empty state** | Pre-season: "PSL One Fantasy opens [date]. Register your interest." |
| **Loading state** | Skeleton for deadline countdown + hero image |
| **Error state** | Deadline fetch failure — show static copy with "Check back soon" |
| **Mobile behaviour** | Full-bleed hero, stacked CTA buttons, sticky deadline countdown at bottom |
| **Desktop behaviour** | Split: left hero + right "quick stats" panel (prize pot, total managers, top score) |
| **Accessibility** | Deadline countdown uses `aria-live="polite"` for updates; hero image has descriptive `alt` |
| **Current status** | `MISSING_FRONTEND` in `apps/experience`; `EXISTS_PARTIAL` in `apps/web` (link-list only, no real landing) |
| **Gap classification** | `MISSING_FRONTEND` |
| **Dependencies** | Active season in DB; fantasy rules config seeded; deadline computed |
| **Acceptance criteria** | Unauthenticated user sees product pitch + "Join free" CTA; authenticated returning manager sees "Back to my team" CTA; deadline countdown is correct |

---

### Screen 2 — Fantasy Onboarding

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/onboarding` |
| **Purpose** | Guide a first-time manager through squad creation: pick players → name team → join league |
| **Primary user goal** | Create a valid 15-player squad, name it, and optionally join a league before the first gameweek deadline |
| **Entry points** | `/fantasy` "Join free" CTA; `/fantasy/team` when no team exists |
| **Exit points** | `/fantasy/team` on completion; `/fantasy/leagues/join` as optional last step |
| **Required API data** | `GET /api/fantasy/player-pool`; `GET /api/fantasy/player-prices`; `GET /api/fantasy/rules`; `POST /api/fantasy/team`; `POST /api/fantasy/team/me/validate` |
| **Required authentication** | Required — must be logged in |
| **Empty state** | N/A — screen itself is the onboarding creation flow |
| **Loading state** | Player pool skeleton grid; progress stepper visible throughout |
| **Error state** | Squad validation failure — inline per-rule messaging ("Need 1 GK", "Budget exceeded by £0.5m") |
| **Mobile behaviour** | Step-by-step wizard: step 1 pick GK, step 2 pick defenders, step 3 midfielders, step 4 forwards, step 5 name + confirm; pitch view sticky at top |
| **Desktop behaviour** | Two-column: left = player pool (search + filter), right = live pitch formation view; all positions visible at once |
| **Accessibility** | Stepper announces current step via `aria-current="step"`; player selection uses checkbox role; keyboard-navigable pool |
| **Current status** | `MISSING_BOTH` — no onboarding route in either frontend; `POST /api/fantasy/team` API exists |
| **Gap classification** | `MISSING_FRONTEND` |
| **Dependencies** | Screen 1 (landing); player pool API; pricing seeded; fantasy rules config active |
| **Acceptance criteria** | User cannot advance past squad step with invalid squad; budget constraint enforced in real time; team created via `POST /api/fantasy/team`; redirect to `/fantasy/team` on success |

---

### Screen 3 — Team Profile

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/team` |
| **Purpose** | The manager's primary home screen — current squad, captain, points, next deadline |
| **Primary user goal** | See squad status, points for current gameweek, and captain/vice-captain selection |
| **Entry points** | Bottom nav Fantasy tab (post-onboarding); notification deeplink; `/fantasy` for returning managers |
| **Exit points** | `/fantasy/team/transfers`, `/fantasy/team/chips`, `/fantasy/fixture-difficulty`, `/fantasy/leagues` |
| **Required API data** | `GET /api/fantasy/team/me`; `GET /api/fantasy/deadline`; `GET /api/fantasy/gameweeks/:id/score`; `GET /api/fantasy/transfers/status` |
| **Required authentication** | Required |
| **Empty state** | Redirect to `/fantasy/onboarding` when no team exists |
| **Loading state** | Pitch skeleton with 15 placeholder positions |
| **Error state** | API failure — "Unable to load your team. Pull to refresh." |
| **Mobile behaviour** | Pitch formation view (4-3-3 default); swipe to switch first XI / bench; captain badge on player; points total sticky header |
| **Desktop behaviour** | Pitch centred, sidebar shows deadline countdown + transfer allowance + chip availability |
| **Accessibility** | Formation uses list semantics with player `aria-label` ("Ronwen Williams, Goalkeeper, Captain, 8 points"); captain toggle keyboard accessible |
| **Current status** | `API_WIRED` in `apps/web` at `/fantasy/team` — functional but no formation pitch view or visual design |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Screen 2 (onboarding); FantasyGameweekScore model; captain field on FantasyTeam |
| **Acceptance criteria** | Formation renders correctly for all valid squad configurations; captain badge visible; points match API; deadline countdown live |

---

### Screen 4 — Transferring a Player

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/team/transfers` |
| **Purpose** | Replace one or more players in the squad, respecting transfer budget and rules |
| **Primary user goal** | Remove a player and add a replacement within budget and positional limits |
| **Entry points** | `/fantasy/team` "Make transfers" CTA; notification "Deadline approaching" |
| **Exit points** | `/fantasy/team` on confirm; `/players/[playerId]` for player research |
| **Required API data** | `GET /api/fantasy/team/me`; `GET /api/fantasy/player-pool`; `GET /api/fantasy/transfers/status`; `POST /api/fantasy/team/me/transfers`; `POST /api/fantasy/team/me/validate` |
| **Required authentication** | Required |
| **Empty state** | No transfers available — "All transfers used this gameweek. Wildcard available." |
| **Loading state** | Player pool skeleton; transfer budget bar shimmer |
| **Error state** | Transfer locked ("Gameweek deadline has passed" with remaining time until next deadline); validation errors inline |
| **Mobile behaviour** | Tap player on pitch to mark "out"; filter/scroll pool to find replacement; transfer bar shows cost delta; confirm CTA sticky at bottom |
| **Desktop behaviour** | Split: left = current pitch (click to remove), right = player pool with sort/filter; transfer summary panel below pitch |
| **Accessibility** | "Remove [name]" and "Add [name]" button labels; live region for budget update; transfer count uses `aria-live` |
| **Current status** | `API_WIRED` in `apps/web` at `/fantasy/transfers` — functional but no pitch interaction |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Screen 3 (team profile); transfer-window state from FantasyRulesConfig; lockReason from API |
| **Acceptance criteria** | Transfer rejected when budget exceeded; positional constraints enforced; lockReason displayed when locked; `TRANSFER_DEADLINE` and `GAMEWEEK_LOCKED` states handled |

---

### Screen 5 — Activating a Chip

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/team/chips` |
| **Purpose** | Let the manager view available chips and activate one for the current gameweek |
| **Primary user goal** | Understand which chips are available and activate the right one at the right time |
| **Entry points** | `/fantasy/team` "Chips" CTA; `/fantasy/team/transfers` chip reminder banner |
| **Exit points** | `/fantasy/team` after activation; chip cancellation returns to same screen |
| **Required API data** | `GET /api/fantasy/chips`; `POST /api/fantasy/chips/:chipId/activate`; `POST /api/fantasy/chips/:chipId/cancel` |
| **Required authentication** | Required |
| **Empty state** | All chips used — "You've played all your chips this season." |
| **Loading state** | Chip card skeletons |
| **Error state** | Activation failure — "Chip cannot be activated during a live gameweek" |
| **Mobile behaviour** | Card list of chips (BENCH_BOOST, FREE_HIT, TRIPLE_CAPTAIN, WILDCARD); available/used/active states; tap to expand description; confirm modal before activation |
| **Desktop behaviour** | Chip cards in 2×2 grid; confirmation inline with consequences description |
| **Accessibility** | Chip status announced to screen readers; confirmation dialog uses `role="alertdialog"` |
| **Current status** | `API_WIRED` in `apps/web` at `/fantasy/chips` — functional |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Chip definitions seeded via FantasyRulesConfig; gameweek lock state |
| **Acceptance criteria** | Only available chips shown as activatable; activated chip shown as "Active" with cancel option; Wildcard and Free Hit mutually exclusive per gameweek |

---

### Screen 6 — Fixture Difficulty Rating

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/fixture-difficulty` |
| **Purpose** | Matrix showing upcoming fixture difficulty for all clubs across next 6 gameweeks |
| **Primary user goal** | Identify which players have favourable upcoming fixtures to inform transfer decisions |
| **Entry points** | `/fantasy/team/transfers` "FDR" link; `/fantasy/team` "View fixtures" CTA |
| **Exit points** | `/players/[playerId]` for player research; `/fantasy/team/transfers` to act |
| **Required API data** | `GET /api/football/standings` (form); `GET /api/gameweeks` (next 6); `GET /api/football/fixtures` (by gameweek); `GET /api/football/teams` (club list) |
| **Required authentication** | Not required |
| **Empty state** | Pre-season — "Fixture difficulty ratings available once the season schedule is published" |
| **Loading state** | Table skeleton with club rows and GW columns |
| **Error state** | "Unable to load fixture data. Check back shortly." |
| **Mobile behaviour** | Horizontal scroll table: clubs as rows, gameweeks as columns; colour-coded cells (green = easy, red = hard); scrolls right to show GW+1 through GW+6 |
| **Desktop behaviour** | Full table visible without scroll; hover tooltip shows opponent name and venue |
| **Accessibility** | Table with `<th scope="col">` for gameweeks and `<th scope="row">` for clubs; difficulty described in text not colour alone |
| **Current status** | `MISSING_BOTH` — no FDR route or API computation in either frontend or backend |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | Fixture schedule published; difficulty algorithm (based on league position + form + home/away); GameweekOperationsModule |
| **Acceptance criteria** | Matrix covers next 6 gameweeks for all active clubs; colour scale has 5 levels (1–5); home/away indicated; correct opponent shown per cell |

---

### Screen 7 — League Detail

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/leagues/[leagueId]` |
| **Purpose** | Show standings and member teams within a specific league |
| **Primary user goal** | See current league position, points gap to leader, and rival managers' scores |
| **Entry points** | `/fantasy/leagues` league list; join confirmation redirect; notification "League updated" |
| **Exit points** | `/fantasy/leagues/[leagueId]/teams/[teamId]` for rival team; `/fantasy/leagues` back |
| **Required API data** | `GET /api/fantasy/leagues/:leagueId`; `GET /api/fantasy/leagues/:leagueId/standings` |
| **Required authentication** | Required to view private leagues; public leagues viewable without auth |
| **Empty state** | "This league has no members yet. Share the code to invite friends." |
| **Loading state** | Standings table skeleton |
| **Error state** | League not found (404) — "This league does not exist or you are not a member" |
| **Mobile behaviour** | League name + type badge at top; standings list; own row highlighted; last updated timestamp |
| **Desktop behaviour** | Standings table with movement arrows; league metadata sidebar (type, prize, created by) |
| **Accessibility** | Table with `aria-sort` on sortable columns; own row has `aria-current="true"` |
| **Current status** | `API_WIRED` in `apps/web` at `/fantasy/leagues/[id]` and `/fantasy/leagues/[id]/standings` |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | League created or joined (Screens 9, create flow); standings calculation complete for gameweek |
| **Acceptance criteria** | Own manager row highlighted; points and rank current to latest settled gameweek; h2h and classic modes both render correctly |

---

### Screen 8 — Team Detail

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/leagues/[leagueId]/teams/[teamId]` |
| **Purpose** | View a rival manager's team — squad, chip history, transfer history, gameweek score |
| **Primary user goal** | Understand a rival's strategy: who they picked, what chip they played, their captain |
| **Entry points** | `/fantasy/leagues/[leagueId]` standings row tap |
| **Exit points** | `/players/[playerId]` for player research; back to `/fantasy/leagues/[leagueId]` |
| **Required API data** | `GET /api/fantasy/leagues/:leagueId` (to verify membership); `GET /api/fantasy/team/me` equivalent for rival (no direct API endpoint yet — needs new route `GET /api/fantasy/teams/:teamId/public`) |
| **Required authentication** | Required (must be in same league) |
| **Empty state** | Team not yet created — "This manager hasn't set up their team yet." |
| **Loading state** | Pitch skeleton |
| **Error state** | Not in same league — "You must be in this league to view team details" |
| **Mobile behaviour** | Read-only pitch view; manager name + rank; captain highlighted; gameweek score shown |
| **Desktop behaviour** | Pitch + sidebar with chip history and transfer summary |
| **Accessibility** | Read-only pitch uses list semantics; no interactive controls |
| **Current status** | `MISSING_BOTH` — no public team-detail route or API endpoint |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | Screen 7 (league detail); new API endpoint `GET /api/fantasy/teams/:teamId/public` needed |
| **Acceptance criteria** | Only managers in the same league can view team detail; own team redirects to `/fantasy/team`; chip played this gameweek is visible |

---

### Screen 9 — Join a League

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/leagues` (hub) + `/fantasy/leagues/join` (action) |
| **Purpose** | Allow a manager to join a private league by code or browse public leagues |
| **Primary user goal** | Enter a league code to join a friend's private league, or discover and join a public league |
| **Entry points** | `/fantasy` "Leagues" nav; `/fantasy/leagues` "Join league" CTA |
| **Exit points** | `/fantasy/leagues/[leagueId]` on success |
| **Required API data** | `GET /api/fantasy/leagues/me`; `POST /api/fantasy/leagues/join`; `POST /api/fantasy/leagues/public/join`; `POST /api/fantasy/leagues/private` (create) |
| **Required authentication** | Required |
| **Empty state** | No leagues yet — "Join or create a league to compete with friends" |
| **Loading state** | League list skeleton |
| **Error state** | Invalid code — "No league found for that code. Check it with the organiser." |
| **Mobile behaviour** | Tab switcher: My Leagues / Join / Create; code input on Join tab; public league browser on separate tab |
| **Desktop behaviour** | Three-panel: my leagues left, join centre, create right |
| **Accessibility** | Code input with `aria-describedby` linking to error message; submission with `aria-busy` on button |
| **Current status** | `API_WIRED` in `apps/web` at `/fantasy/leagues` and `/fantasy/leagues/join` |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Fantasy team created (Screen 2/3); active season with leagues enabled |
| **Acceptance criteria** | Join by code succeeds for valid code; join by code fails with clear message for invalid; global league auto-joins on team creation |

---

### Screen 10 — Help and Rules

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/help` |
| **Purpose** | Explain how PSL One Fantasy works — scoring, transfers, chips, deadlines, leagues |
| **Primary user goal** | Understand the rules before committing to a transfer or chip activation |
| **Entry points** | `/fantasy` footer link; `/fantasy/team` "?" icon; `/fantasy/onboarding` "How does this work?" |
| **Exit points** | Any Fantasy screen |
| **Required API data** | `GET /api/fantasy/rules` (live config: budget, positions, scoring multipliers) |
| **Required authentication** | Not required |
| **Empty state** | Static rules always shown; API data supplements dynamic values |
| **Loading state** | Shimmer on dynamic values (budget, max-per-club); static copy instant |
| **Error state** | Fallback to hardcoded default rules if API unavailable |
| **Mobile behaviour** | Accordion sections: Scoring, Transfers, Chips, Deadlines, Leagues, Prizes; deep-link to specific section via hash |
| **Desktop behaviour** | Left nav anchors + main content; sticky section nav on scroll |
| **Accessibility** | Accordion uses `aria-expanded`; section anchors allow keyboard navigation |
| **Current status** | `API_WIRED` in `apps/web` at `/fantasy/rules` — shows raw config values, no structured help content |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web` (rules display only); `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | FantasyRulesConfig seeded; static content written by product owner |
| **Acceptance criteria** | All chip types explained; scoring table matches live `GET /api/fantasy/rules` values; deadline behaviour section explains lockReason states |

---

## Phase 2 — Research and Match Context

---

### Screen 11 — Results

| Field | Value |
|-------|-------|
| **Route** | `/matches` |
| **Purpose** | Chronological list of fixtures — past (results), present (live), future (upcoming) |
| **Primary user goal** | Check yesterday's scores and upcoming fixtures with kick-off times |
| **Entry points** | Bottom nav Fixtures tab; `/fantasy/fixture-difficulty` fixture links |
| **Exit points** | `/matches/[fixtureId]` for match detail |
| **Required API data** | `GET /api/football/fixtures` (with gameweek/date filter params) |
| **Required authentication** | Not required |
| **Empty state** | Pre-season — "The PSL 2025/26 season schedule will be published here." |
| **Loading state** | Fixture card skeletons |
| **Error state** | "Unable to load fixtures. Check your connection." |
| **Mobile behaviour** | Grouped by gameweek; pull-to-refresh; live fixtures pulse indicator; date filter tabs |
| **Desktop behaviour** | Two columns of fixture cards; left sidebar with gameweek picker |
| **Accessibility** | Each fixture card is a `<article>` with meaningful heading; live badge uses `aria-label="Live match"` |
| **Current status** | `API_WIRED` in `apps/web` at `/matches` and `/football/fixtures`; both exist with fixture lists |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Published fixtures; active season |
| **Acceptance criteria** | Past results show score; live fixtures show minute + score; upcoming shows kick-off time; grouping by gameweek correct |

---

### Screen 12 — Match Detail

| Field | Value |
|-------|-------|
| **Route** | `/matches/[fixtureId]` |
| **Purpose** | Full match centre: score, timeline, lineups, stats, player ratings, fantasy impact |
| **Primary user goal** | Follow a live or completed match in full detail |
| **Entry points** | `/matches` fixture card; notification "Match starting"; `/fantasy/team` (live points preview) |
| **Exit points** | `/players/[playerId]`; `/matches` |
| **Required API data** | `GET /api/football/fixtures/:id`; `GET /api/football/fixtures/:id/live`; `GET /api/football/fixtures/:id/timeline`; `GET /api/football/fixtures/:id/lineups`; `GET /api/match-centre/fixture/:id`; `GET /api/football/fixtures/:id/live-fantasy-preview` |
| **Required authentication** | Not required for read; fantasy preview requires auth |
| **Empty state** | Pre-match — "Line-ups confirmed 1 hour before kick-off" |
| **Loading state** | Score skeleton + tab skeleton |
| **Error state** | Match data unavailable — "Live data will appear when the match starts" |
| **Mobile behaviour** | Sticky score header; tab bar (Summary / Lineups / Stats / Fantasy); swipe between tabs |
| **Desktop behaviour** | Score header; tabbed content in main; sidebar with team form and standings context |
| **Accessibility** | Score region uses `aria-live="polite"` for live updates; tabs use `role="tablist"` |
| **Current status** | `API_WIRED` in `apps/web` at `/matches/[fixtureId]` with 7 sub-tabs; also at `/football/fixtures/[id]` |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | LiveMatchService; football.controller live routes; LineupModel |
| **Acceptance criteria** | Score updates without page refresh during live match; timeline events render chronologically; lineups tab shows starting XI + bench with formation |

---

### Screen 13 — Player Detail

| Field | Value |
|-------|-------|
| **Route** | `/players/[playerId]` |
| **Purpose** | Player profile: biography, club, position, current season stats, fantasy price + points |
| **Primary user goal** | Evaluate a player before transferring them in — are their stats worth the price? |
| **Entry points** | `/fantasy/team/transfers` player name; `/matches/[fixtureId]` lineup player; `/stats/season` top performers |
| **Exit points** | `/players/[playerId]/stats`; `/stats/compare`; back to transfer flow |
| **Required API data** | `GET /api/player-stats/:playerId/profile`; `GET /api/player-stats/:playerId/season/:seasonId/stats`; `GET /api/fantasy/player-prices` (for price + ownership %) |
| **Required authentication** | Not required |
| **Empty state** | Player not found — 404 with "Return to player list" |
| **Loading state** | Player card skeleton: portrait + stat grid |
| **Error state** | "Player data unavailable for this season" |
| **Mobile behaviour** | Hero portrait (club colour bg); stats grid (goals/assists/minutes/cards); season selector; "Add to team" CTA if authenticated |
| **Desktop behaviour** | Left column: portrait + bio; right column: stat cards; chart of per-gameweek points |
| **Accessibility** | Portrait image `alt` includes name, position, club; stat figures labelled with `aria-label` |
| **Current status** | `API_WIRED` in `apps/web` at `/players/[playerId]` — calls `getPlayerProfile`, shows stats array |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | PlayerMatchStats model seeded; player-stats API; fantasy price data |
| **Acceptance criteria** | Profile shows correct club, position, nationality; season stats current to latest settled gameweek; fantasy price shown when player is in the pool |

---

### Screen 14 — Player Stats

| Field | Value |
|-------|-------|
| **Route** | `/players/[playerId]/stats` |
| **Purpose** | Detailed per-gameweek breakdown of a player's performance and fantasy points history |
| **Primary user goal** | Understand consistency — does this player score every week or in clusters? |
| **Entry points** | `/players/[playerId]` "Full stats" CTA |
| **Exit points** | `/stats/compare` to compare with another player |
| **Required API data** | `GET /api/player-stats/:playerId/season/:seasonId/stats`; `GET /api/player-stats/:playerId/fixture/:fixtureId/stats` |
| **Required authentication** | Not required |
| **Empty state** | "Stats will appear once the first match is played." |
| **Loading state** | Table skeleton with GW rows |
| **Error state** | Season not yet seeded — "No stats available for this season yet." |
| **Mobile behaviour** | Per-gameweek table (GW, opponent, score, goals, assists, minutes, points); sortable; pull-to-refresh |
| **Desktop behaviour** | Table + bar chart of fantasy points per gameweek above |
| **Accessibility** | Table with sortable column headers using `aria-sort`; chart has text equivalent table |
| **Current status** | `API_WIRED` in `apps/web` at `/players/[playerId]/season/[seasonId]` and `/players/[playerId]/fixture/[fixtureId]` |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | PlayerMatchStats populated; gameweek scoring settled |
| **Acceptance criteria** | Correct stats for each gameweek; total column sums correctly; blank row for gameweeks not played |

---

### Screen 15 — Season Stats

| Field | Value |
|-------|-------|
| **Route** | `/stats/season` |
| **Purpose** | Season-wide statistical leaderboards: top scorers, assists, clean sheets, fantasy points |
| **Primary user goal** | Discover in-form players for transfer targeting; follow PSL Golden Boot race |
| **Entry points** | Bottom nav Stats tab; `/fantasy/team/transfers` "Top performers" CTA |
| **Exit points** | `/players/[playerId]` |
| **Required API data** | `GET /api/player-stats/season/:seasonId/top-performers`; `GET /api/football/standings` |
| **Required authentication** | Not required |
| **Empty state** | "Season stats will appear after matchday 1." |
| **Loading state** | Top-performers list skeleton |
| **Error state** | "Unable to load season stats." |
| **Mobile behaviour** | Tab bar: Goals / Assists / Clean Sheets / Fantasy Points; top-10 player cards per tab |
| **Desktop behaviour** | Four stat leaderboards side by side; click player to navigate to detail |
| **Accessibility** | Ranked list with `aria-label` including rank number |
| **Current status** | `API_WIRED` in `apps/web` at `/players/season/[seasonId]/top-performers` and `/football/standings` |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | PlayerMatchStats settled per gameweek; standings computed |
| **Acceptance criteria** | Each tab shows correct leaders; position filtering option; links to player profiles |

---

### Screen 16 — Comparing Players

| Field | Value |
|-------|-------|
| **Route** | `/stats/compare` |
| **Purpose** | Side-by-side stat comparison of two players to support transfer decisions |
| **Primary user goal** | Compare player A (to transfer out) vs player B (to transfer in) across key metrics |
| **Entry points** | `/players/[playerId]` "Compare" CTA; `/fantasy/team/transfers` comparison shortcut |
| **Exit points** | `/fantasy/team/transfers` transfer action; `/players/[playerId]` |
| **Required API data** | `GET /api/player-stats/:playerId/season/:seasonId/stats` × 2 (both players); `GET /api/fantasy/player-prices` |
| **Required authentication** | Not required |
| **Empty state** | "Select two players to compare" |
| **Loading state** | Comparison column skeletons |
| **Error state** | One player not found — clear error per column |
| **Mobile behaviour** | Two player cards side by side (scrollable if overflow); stat rows with winner highlighted in each row |
| **Desktop behaviour** | Three-column: left player, metric label, right player; sortable metric list |
| **Accessibility** | Table with two header columns (player names) and metric rows; winner badge has `aria-label` |
| **Current status** | `MISSING_BOTH` — no compare route or API aggregation endpoint |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | Screen 14 (player stats); player stats API returns comparable metrics |
| **Acceptance criteria** | Any two players selectable from search; stat categories cover goals/assists/minutes/clean sheets/cards/fantasy points; clear winner indicator per metric |

---

### Screen 17 — Sorting and Filtering League Tables

| Field | Value |
|-------|-------|
| **Route** | `/stats/standings` or integrated within `/matches` / season stats |
| **Purpose** | PSL league table with filter by split/stage and sort by any column |
| **Primary user goal** | Check current standings; understand relegation/promotion picture |
| **Entry points** | Bottom nav; `/matches` "Standings" tab; homepage league table section |
| **Exit points** | `/clubs/[slug]` for club detail |
| **Required API data** | `GET /api/football/standings`; `GET /api/match-centre/standings/:seasonId` |
| **Required authentication** | Not required |
| **Empty state** | Pre-season — "Standings published when matchday 1 is complete." |
| **Loading state** | Table skeleton |
| **Error state** | "Standings unavailable." |
| **Mobile behaviour** | Compact table (Pos / Club / Pts); tap row to expand GD/form; horizontal scroll for full stats |
| **Desktop behaviour** | Full table (Pos / Club / P / W / D / L / GF / GA / GD / Pts / Form); sortable columns |
| **Accessibility** | `<table>` with `aria-sort` on clicked column header |
| **Current status** | `API_WIRED` in `apps/web` at `/football/standings` and `/match-centre/standings/[seasonId]` |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Standings updated after each matchday |
| **Acceptance criteria** | Correct positions; form string matches last 5 results; table updates within 5 minutes of final whistle |

---

### Screen 18 — Transfers (Fantasy transfer history)

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/team/transfers` (same route as Screen 4, additional tab: History) |
| **Purpose** | Show the manager's full transfer history across the season |
| **Primary user goal** | Review past decisions — who was sold, who was bought, at what cost |
| **Entry points** | `/fantasy/team` "Transfer history" link |
| **Exit points** | `/players/[playerId]` for player detail |
| **Required API data** | `GET /api/fantasy/history` (includes transfer records); transfer log from FantasyTeamTransfer model |
| **Required authentication** | Required |
| **Empty state** | "No transfers made yet." |
| **Loading state** | Transfer row skeletons |
| **Error state** | "Transfer history unavailable." |
| **Mobile behaviour** | Chronological list of gameweek-by-gameweek transfer pairs (in/out with cost) |
| **Desktop behaviour** | Table with GW / Player Out / Player In / Transfer Cost / Hit columns |
| **Accessibility** | Table with correct column headers; each row meaningful in isolation |
| **Current status** | `MISSING_FRONTEND` — `/api/fantasy/history` exists; no dedicated transfer history page |
| **Gap classification** | `MISSING_FRONTEND` |
| **Dependencies** | FantasyTeamTransfer records; gameweek history API |
| **Acceptance criteria** | All transfers shown in correct gameweek order; transfer hit cost shown; wildcard/free-hit transfers labelled |

---

### Screen 19 — Awards

| Field | Value |
|-------|-------|
| **Route** | `/stats/awards` |
| **Purpose** | Season awards: Golden Boot, Golden Glove, Young Player, PSL Player of the Season |
| **Primary user goal** | Follow award races; celebrate achievers |
| **Entry points** | Stats section nav; editorial articles about awards |
| **Exit points** | `/players/[playerId]` |
| **Required API data** | `GET /api/player-stats/season/:seasonId/top-performers` filtered by category; awards data not yet in backend |
| **Required authentication** | Not required |
| **Empty state** | "Awards presented at the end of the season." |
| **Loading state** | Award card skeletons |
| **Error state** | "Awards data unavailable." |
| **Mobile behaviour** | Award cards (icon + category + current leader + stats) |
| **Desktop behaviour** | Award cards in grid with leader profile |
| **Accessibility** | Award category heading; player name as subheading |
| **Current status** | `MISSING_BOTH` — no awards model, route, or API |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | PlayerMatchStats; PlayerOfTheMatchModel (potential); season end trigger |
| **Acceptance criteria** | Leaders shown during season; winner shown after season end; links to player profiles |

---

### Screen 20 — Man of the Match

| Field | Value |
|-------|-------|
| **Route** | `/matches/[fixtureId]/motm` |
| **Purpose** | Highlight the player who most influenced a specific match result |
| **Primary user goal** | See who stood out; contextualise fantasy points from that fixture |
| **Entry points** | `/matches/[fixtureId]` MOTM tab or card |
| **Exit points** | `/players/[playerId]` |
| **Required API data** | `GET /api/match-centre/fixture/:fixtureId` (player ratings available in match-centre); best-rated player derivation |
| **Required authentication** | Not required |
| **Empty state** | Pre-match or live — "MOTM awarded after the final whistle." |
| **Loading state** | Player portrait skeleton |
| **Error state** | Ratings not submitted — "Match officials yet to submit ratings." |
| **Mobile behaviour** | Hero portrait of winning player; stats grid; quote or highlight; "Add to team" CTA |
| **Desktop behaviour** | Full-width hero + supporting player comparison |
| **Accessibility** | Award announcement uses `aria-label` |
| **Current status** | `MISSING_FRONTEND` — `POST /api/match-centre/player-ratings` exists; no MOTM derivation or display page |
| **Gap classification** | `MISSING_FRONTEND` |
| **Dependencies** | Match centre player ratings submitted; match finished |
| **Acceptance criteria** | MOTM shown only after final whistle; derived from highest player rating in the match |

---

### Screen 21 — Hall of Fame

| Field | Value |
|-------|-------|
| **Route** | `/stats/hall-of-fame` |
| **Purpose** | Historical all-time records: most PSL titles, most appearances, PSL records |
| **Primary user goal** | Explore PSL history; understand the club and player legacy |
| **Entry points** | Stats section nav; About section |
| **Exit points** | `/players/[playerId]`, `/clubs/[slug]` |
| **Required API data** | Historical data not yet in backend; requires dedicated model or CMS |
| **Required authentication** | Not required |
| **Empty state** | Placeholder content until historical data is loaded |
| **Loading state** | Record card skeletons |
| **Error state** | "Hall of Fame unavailable." |
| **Mobile behaviour** | Category tabs: Players / Clubs / Seasons; record cards |
| **Desktop behaviour** | Timeline or card grid |
| **Accessibility** | Historical figures presented with accessible markup |
| **Current status** | `MISSING_BOTH` — no historical records model or route |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | Historical data ingestion (separate from live data provider); CMS or static data |
| **Acceptance criteria** | Records accurate; sourced from PSL official data; links to existing player/club profiles where possible |

---

### Screen 22 — History

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/history` and `/fantasy/history/[gameweekId]` |
| **Purpose** | Manager's gameweek-by-gameweek points history, chip usage, and rank progression |
| **Primary user goal** | See how rank and points have changed over the season |
| **Entry points** | `/fantasy/team` "Season history" CTA |
| **Exit points** | `/fantasy/history/[gameweekId]` for specific gameweek detail |
| **Required API data** | `GET /api/fantasy/history`; `GET /api/fantasy/history/:gameweekId` |
| **Required authentication** | Required |
| **Empty state** | "History will appear after your first gameweek." |
| **Loading state** | Gameweek row skeletons |
| **Error state** | "History unavailable." |
| **Mobile behaviour** | Gameweek list (GW / Points / Rank / Transfers / Chip); tap row for detail |
| **Desktop behaviour** | Table + line chart of rank over time |
| **Accessibility** | Chart has text equivalent; table headers correct |
| **Current status** | `API_WIRED` in `apps/web` at `/fantasy/history` and `/fantasy/history/[gameweekId]` |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Gameweek scoring settled; FantasyGameweekScore model populated |
| **Acceptance criteria** | All gameweeks shown; rank shown as absolute and movement; chip played shown per gameweek |

---

### Screen 23 — Article Detail

| Field | Value |
|-------|-------|
| **Route** | `/media/[slug]` |
| **Purpose** | Full editorial article — news, analysis, previews, post-match |
| **Primary user goal** | Read an article in full |
| **Entry points** | Homepage editorial grid; `/matches/[fixtureId]` related articles |
| **Exit points** | Related articles; back to source |
| **Required API data** | `GET /api/fan/media/:slug`; `POST /api/fan/media/:id/view` (for view tracking) |
| **Required authentication** | Not required |
| **Empty state** | N/A — 404 if slug not found |
| **Loading state** | Article skeleton: headline, byline, body paragraphs |
| **Error state** | 404 — "Article not found" |
| **Mobile behaviour** | Full-width header image; headline; body text; related articles footer |
| **Desktop behaviour** | Centred column with max-width; sidebar related articles |
| **Accessibility** | Article uses `<article>` semantic element; heading hierarchy preserved |
| **Current status** | `API_WIRED` in `apps/web` at `/media/[slug]` |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Media items published by admin; view tracking API |
| **Acceptance criteria** | Article renders with correct title, body, image; view count increments; related articles shown |

---

### Screen 24 — Watching a Video

| Field | Value |
|-------|-------|
| **Route** | `/media/[slug]` (video type) or `/video/[slug]` |
| **Purpose** | In-app video player for PSL match highlights and features |
| **Primary user goal** | Watch a video without leaving the app |
| **Entry points** | Homepage video rail; article related media |
| **Exit points** | Back to source; next/previous video |
| **Required API data** | `GET /api/fan/media/:slug`; `POST /api/fan/media/:id/complete` (completion tracking) |
| **Required authentication** | Not required; completion tracking requires auth |
| **Empty state** | N/A |
| **Loading state** | Video player skeleton with play button |
| **Error state** | "Video unavailable. Try again later." |
| **Mobile behaviour** | Full-screen video player with native controls; autoplay next on completion |
| **Desktop behaviour** | 16:9 player; description below; related videos sidebar |
| **Accessibility** | Player controls keyboard accessible; captions if available |
| **Current status** | `EXISTS_PARTIAL` in `apps/web` via `/media/[slug]` (same route as articles); no dedicated video player |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Video URLs hosted (CDN or external provider); completion API |
| **Acceptance criteria** | Video plays in-app; completion recorded; related videos shown |

---

### Screen 25 — Taking a Quiz

| Field | Value |
|-------|-------|
| **Route** | `/quiz/[quizId]` (proposed) |
| **Purpose** | Football trivia quizzes that award Fan Value points on completion |
| **Primary user goal** | Test football knowledge and earn Fan Value |
| **Entry points** | Homepage gamification section; notifications; campaigns |
| **Exit points** | Results screen; Fan Value ledger |
| **Required API data** | Quiz model not yet in backend; Fan Value award on completion |
| **Required authentication** | Required (Fan Value requires identity) |
| **Empty state** | No quizzes live — "Quiz coming soon." |
| **Loading state** | Question skeleton |
| **Error state** | "Quiz unavailable." |
| **Mobile behaviour** | Single-question view; progress bar; timer (optional); result celebration on submit |
| **Desktop behaviour** | Centred quiz card |
| **Accessibility** | Questions use `role="group"` with `fieldset/legend`; answer options are radio inputs |
| **Current status** | `MISSING_BOTH` — no quiz model, route, or API anywhere |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | Quiz model in backend; Fan Value award hook; campaign integration |
| **Acceptance criteria** | Answers recorded once per user per quiz; points awarded correctly; quiz cannot be replayed |

---

### Screen 26 — Filtering Managers

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/leagues/[leagueId]` (filter controls on standings) |
| **Purpose** | Filter the league standings list by club supported, country, overall rank band |
| **Primary user goal** | Find specific managers in a large public or global league |
| **Entry points** | `/fantasy/leagues/[leagueId]` filter button |
| **Exit points** | Filtered standings view |
| **Required API data** | `GET /api/fantasy/leagues/:leagueId/standings` with filter params |
| **Required authentication** | Depends on league type |
| **Empty state** | No managers match filter |
| **Loading state** | Filter applying — table dimmed |
| **Error state** | "Filter unavailable." |
| **Mobile behaviour** | Bottom sheet filter panel: club / country / rank band; apply clears sheet and updates list |
| **Desktop behaviour** | Inline filter bar above standings table |
| **Accessibility** | Filter controls labelled; "N results" announced on apply via `aria-live` |
| **Current status** | `MISSING_FRONTEND` — standings API exists but no filter params exposed |
| **Gap classification** | `MISSING_FRONTEND` |
| **Dependencies** | Screen 7 (league detail); standings API filter params |
| **Acceptance criteria** | Filter by club reduces list to managers who support that club; filter count shown |

---

### Screen 27 — Searching Managers

| Field | Value |
|-------|-------|
| **Route** | `/fantasy/search` (proposed) or search within `/fantasy/leagues` |
| **Purpose** | Search for a specific manager by team name to view their squad |
| **Primary user goal** | Find a friend's team to check their squad |
| **Entry points** | `/fantasy/leagues` search icon; global search |
| **Exit points** | `/fantasy/leagues/[leagueId]/teams/[teamId]` |
| **Required API data** | New endpoint needed: `GET /api/fantasy/teams?search=name` |
| **Required authentication** | Required |
| **Empty state** | "Search for a manager name or team name." |
| **Loading state** | Search result skeletons |
| **Error state** | No results — "No managers found. Check the spelling." |
| **Mobile behaviour** | Search input at top; typeahead results list; tap result to view team |
| **Desktop behaviour** | Search in sidebar with results below |
| **Accessibility** | Combobox role with live region for results |
| **Current status** | `MISSING_BOTH` — no search endpoint or UI |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | Screen 8 (team detail); new search API endpoint |
| **Acceptance criteria** | Search returns results within 300ms after 2+ characters typed; only public team info shown |

---

## Phase 3 — Account and Support

---

### Screen 28 — Manage Account

| Field | Value |
|-------|-------|
| **Route** | `/account` |
| **Purpose** | Account hub: personal details, security, team preferences, logout |
| **Primary user goal** | Navigate to the correct account sub-section |
| **Entry points** | Bottom nav Account tab; header avatar |
| **Exit points** | `/account/profile`, `/account/security`, `/account/favourite-team`, `/sign-in` |
| **Required API data** | `GET /api/auth/me`; `GET /api/profile/me` |
| **Required authentication** | Required |
| **Empty state** | N/A |
| **Loading state** | Avatar and name skeleton |
| **Error state** | "Unable to load account. Try again." |
| **Mobile behaviour** | Profile avatar + name at top; menu list of sections; logout at bottom |
| **Desktop behaviour** | Left sidebar nav + main content area |
| **Accessibility** | Nav list with aria-current on active section |
| **Current status** | `API_WIRED` in `apps/web` at `/account` — shows name + logout |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Auth service; profile API |
| **Acceptance criteria** | Correct name and avatar shown; logout clears session and redirects to `/sign-in` |

---

### Screen 29 — Editing Personal Details

| Field | Value |
|-------|-------|
| **Route** | `/account/profile` |
| **Purpose** | Edit display name, bio, and other profile fields |
| **Primary user goal** | Update how their name appears in leagues and on the platform |
| **Entry points** | `/account` "Personal details" CTA |
| **Exit points** | `/account` on save |
| **Required API data** | `GET /api/profile/me`; `PATCH /api/profile/me` |
| **Required authentication** | Required |
| **Empty state** | Form prefilled from profile; no empty state |
| **Loading state** | Form skeleton |
| **Error state** | Save failure — inline error per field |
| **Mobile behaviour** | Form with labelled fields; save button sticky at bottom |
| **Desktop behaviour** | Centred form card |
| **Accessibility** | All inputs labelled; required fields marked; error messages linked to inputs via `aria-describedby` |
| **Current status** | `API_WIRED` in `apps/web` at `/profile/edit` — calls `PATCH /api/profile/me` |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Profile model; `UpdateProfileDto` |
| **Acceptance criteria** | Name update reflected immediately in header; no empty-name save allowed |

---

### Screen 30 — Changing Password

| Field | Value |
|-------|-------|
| **Route** | `/account/security` |
| **Purpose** | Change account password from within an authenticated session |
| **Primary user goal** | Update password without logging out |
| **Entry points** | `/account` "Security" CTA |
| **Exit points** | `/account` on success |
| **Required API data** | New endpoint needed: `POST /api/auth/password/change` (current password + new password) |
| **Required authentication** | Required |
| **Empty state** | Form always shown |
| **Loading state** | Submit spinner |
| **Error state** | Wrong current password — "Incorrect current password"; new password mismatch |
| **Mobile behaviour** | Three fields: current password, new password, confirm new password; save button |
| **Desktop behaviour** | Centred security card |
| **Accessibility** | Password fields use `type="password"`; show/hide toggle with `aria-label` |
| **Current status** | `MISSING_BOTH` — no in-session change-password endpoint or page (only forgot-password flow) |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | Auth service `changePassword` method; bcrypt comparison |
| **Acceptance criteria** | Current password verified before update; password requirements shown; success redirects to `/account` |

---

### Screen 31 — Deleting Account

| Field | Value |
|-------|-------|
| **Route** | `/account/delete` (proposed) |
| **Purpose** | Permanently delete the fan's account and all associated data (POPIA compliance) |
| **Primary user goal** | Remove their account from the platform |
| **Entry points** | `/account` "Delete account" destructive option |
| **Exit points** | Homepage on confirmation (account deleted) |
| **Required API data** | New endpoint: `DELETE /api/auth/account` (requires password re-entry) |
| **Required authentication** | Required + password confirmation |
| **Empty state** | N/A |
| **Loading state** | Deletion in progress — "Deleting your account…" |
| **Error state** | Wrong password — "Incorrect password. Account not deleted." |
| **Mobile behaviour** | Warning screen with consequences; password re-entry; two-step confirm |
| **Desktop behaviour** | Modal warning with consequences; confirm button requires typing "DELETE" |
| **Accessibility** | Warning uses `role="alertdialog"`; destructive button explicitly labelled |
| **Current status** | `MISSING_BOTH` — no delete endpoint or page; POPIA compliance requires this |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | Data retention policy; Kafka event for account-deletion cascade; audit log |
| **Acceptance criteria** | Account deletion is POPIA-compliant; data removed within 30 days; confirmation email sent |

---

### Screen 32 — Changing Favourite Team

| Field | Value |
|-------|-------|
| **Route** | `/account/favourite-team` |
| **Purpose** | Update the club the fan supports — affects personalisation and My Club section |
| **Primary user goal** | Switch to supporting a different club (e.g., after a season starts) |
| **Entry points** | `/account/profile`; onboarding step |
| **Exit points** | `/account` |
| **Required API data** | `GET /api/football/teams`; `PATCH /api/profile/me` (with favouriteClubId) |
| **Required authentication** | Required |
| **Empty state** | No club selected — show all clubs as options |
| **Loading state** | Club badge grid skeleton |
| **Error state** | "Unable to save. Try again." |
| **Mobile behaviour** | Club badge grid (4 columns); selected club has checkmark; save button |
| **Desktop behaviour** | Badge grid with search filter |
| **Accessibility** | Checkboxes or radio buttons with club name label; currently selected club `aria-checked="true"` |
| **Current status** | `EXISTS_PARTIAL` in `apps/web` at `/profile/edit` — club selection included in edit profile form |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | 16 PSL clubs seeded in ClubExperienceModule; `favouriteClubId` on Profile model |
| **Acceptance criteria** | Club selection updates My Club section on homepage; change allowed once per gameweek (or per rules config) |

---

### Screen 33 — Logging Out

| Field | Value |
|-------|-------|
| **Route** | Action within `/account` |
| **Purpose** | End the current session |
| **Primary user goal** | Securely sign out |
| **Entry points** | `/account` "Log out" button |
| **Exit points** | `/sign-in` |
| **Required API data** | `POST /api/auth/logout` |
| **Required authentication** | Required |
| **Empty state** | N/A |
| **Loading state** | Button shows "Logging out…" |
| **Error state** | Silent fail — clear local session regardless |
| **Mobile behaviour** | Logout at bottom of account menu; confirmation not required (low risk) |
| **Desktop behaviour** | Logout in account dropdown or sidebar |
| **Accessibility** | Button labelled "Log out" (not "Logout") for screen reader clarity |
| **Current status** | `API_WIRED` in `apps/web` at `/account` — `POST /api/auth/logout` called |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | JWT invalidation / token blacklist |
| **Acceptance criteria** | All auth cookies cleared; redirect to `/sign-in`; protected routes inaccessible after logout |

---

### Screen 34 — Logging In

| Field | Value |
|-------|-------|
| **Route** | `/sign-in` |
| **Purpose** | Authenticate an existing fan |
| **Primary user goal** | Sign in to access Fantasy, predictions, and personal data |
| **Entry points** | Unauthenticated access to protected routes; header "Sign in" CTA |
| **Exit points** | Previous page (via `?redirect=`) or `/fantasy/team` |
| **Required API data** | `POST /api/auth/login` |
| **Required authentication** | Not required (this is the auth screen) |
| **Empty state** | Form always shown |
| **Loading state** | Submit button shows "Signing in…" with spinner |
| **Error state** | Wrong credentials — "Incorrect email or password"; rate limit — "Too many attempts. Try again in 5 minutes." |
| **Mobile behaviour** | Email + password fields; "Sign in" button; "Forgot password?" link; "Join free" link |
| **Desktop behaviour** | Centred card with same fields |
| **Accessibility** | Inputs with labels; error messages linked via `aria-describedby`; form `aria-live` error region |
| **Current status** | `API_WIRED` in `apps/web` at `/login` — calls `POST /api/auth/login` |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Auth service; JWT cookies |
| **Acceptance criteria** | Valid credentials → redirect; invalid credentials → clear error; 5 failed attempts → rate limit message |

---

### Screen 35 — Resetting Password

| Field | Value |
|-------|-------|
| **Route** | `/forgot-password` and `/reset-password` |
| **Purpose** | Allow a fan who has forgotten their password to receive a reset link and set a new password |
| **Primary user goal** | Regain access to the account |
| **Entry points** | `/sign-in` "Forgot password?" link |
| **Exit points** | `/sign-in` after successful reset |
| **Required API data** | `POST /api/auth/password-reset/request`; `POST /api/auth/password-reset/confirm` |
| **Required authentication** | Not required |
| **Empty state** | N/A |
| **Loading state** | Submit button spinner |
| **Error state** | Email not found — "If an account exists for that email, we've sent a reset link." (deliberately vague for security) |
| **Mobile behaviour** | Two screens: email entry (step 1) and new password + token (step 2) |
| **Desktop behaviour** | Centred card, same flow |
| **Accessibility** | Success message uses `aria-live="polite"` |
| **Current status** | `API_WIRED` in `apps/web` at `/forgot-password` and `/reset-password` |
| **Gap classification** | `EXISTS_PARTIAL` in `apps/web`; `MISSING_FRONTEND` in `apps/experience` |
| **Dependencies** | Email provider (not yet configured for production); token storage in DB |
| **Acceptance criteria** | Reset email sent within 60 seconds; token expires after 24 hours; password updated on confirm |

---

### Screen 36 — FAQs

| Field | Value |
|-------|-------|
| **Route** | `/help` |
| **Purpose** | Frequently asked questions about the platform, Fantasy, predictions, and account |
| **Primary user goal** | Find answer to a question without contacting support |
| **Entry points** | Account menu; Fantasy help link; footer |
| **Exit points** | `/fantasy/help`, `/terms`, `/privacy` |
| **Required API data** | None — static content or CMS |
| **Required authentication** | Not required |
| **Empty state** | N/A |
| **Loading state** | Instant (static) |
| **Error state** | N/A |
| **Mobile behaviour** | Searchable accordion; category filter (Fantasy / Predictions / Account / Technical) |
| **Desktop behaviour** | Left category nav + main accordion |
| **Accessibility** | Accordion with `aria-expanded`; search with `role="search"` |
| **Current status** | `MISSING_BOTH` — no FAQ route or content anywhere |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | FAQ content authored by product/support team; CMS or static JSON |
| **Acceptance criteria** | Search returns matching questions; accordion opens one at a time; links to relevant app sections from answers |

---

### Screen 37 — Terms and Conditions

| Field | Value |
|-------|-------|
| **Route** | `/terms` |
| **Purpose** | Legal terms of service |
| **Primary user goal** | Review the terms before or after registering |
| **Entry points** | Registration form checkbox link; footer; account menu |
| **Exit points** | Back to source |
| **Required API data** | None — static |
| **Required authentication** | Not required |
| **Empty state** | N/A |
| **Loading state** | N/A |
| **Error state** | N/A |
| **Mobile behaviour** | Long-form text with sticky back button; scroll-to-section anchor nav |
| **Desktop behaviour** | Centred column with section anchors |
| **Accessibility** | Document structure with semantic headings |
| **Current status** | `MISSING_BOTH` — no terms route in either frontend |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | Legal team approval; version date |
| **Acceptance criteria** | Version date shown; linked from registration and account; accessible without auth |

---

### Screen 38 — Privacy Policy

| Field | Value |
|-------|-------|
| **Route** | `/privacy` |
| **Purpose** | POPIA-compliant privacy policy |
| **Primary user goal** | Understand how personal data is collected and used |
| **Entry points** | Registration; footer; account menu; cookie banner |
| **Exit points** | Back to source |
| **Required API data** | None — static |
| **Required authentication** | Not required |
| **Empty state** | N/A |
| **Loading state** | N/A |
| **Error state** | N/A |
| **Mobile behaviour** | Long-form text with "Last updated" date prominent |
| **Desktop behaviour** | Centred column |
| **Accessibility** | Document structure; contact information for data subject requests |
| **Current status** | `MISSING_BOTH` — no privacy policy route |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | Legal team approval; POPIA compliance review; Information Officer details |
| **Acceptance criteria** | POPIA sections present (lawful basis, retention, subject rights, Information Officer); accessible without auth |

---

### Screen 39 — About

| Field | Value |
|-------|-------|
| **Route** | `/about` |
| **Purpose** | Platform description, mission, and PSL partnership context |
| **Primary user goal** | Understand who built PSL One and why |
| **Entry points** | Footer; account menu |
| **Exit points** | Back to source |
| **Required API data** | None — static |
| **Required authentication** | Not required |
| **Empty state** | N/A |
| **Loading state** | N/A |
| **Error state** | N/A |
| **Mobile behaviour** | Mission statement; team section; PSL partnership acknowledgement |
| **Desktop behaviour** | Centred full-width sections |
| **Accessibility** | Standard document semantics |
| **Current status** | `MISSING_BOTH` |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | Product owner approval of copy |
| **Acceptance criteria** | No navigation links broken; accessible without auth |

---

### Screen 40 — Scanning a Badge

| Field | Value |
|-------|-------|
| **Route** | `/scan` (proposed) |
| **Purpose** | QR-code or NFC badge scan to award Fan Value at physical events (PSL matchdays, sponsor activations) |
| **Primary user goal** | Scan a badge at a physical event to earn Fan Value points |
| **Entry points** | Physical badge / QR code at event; bottom nav "Scan" action |
| **Exit points** | Fan Value earned confirmation; `/fan-value` |
| **Required API data** | New endpoint: `POST /api/fan-value/scan` (badge token → identity → award); AchievementsService hook; FanValueLedger entry |
| **Required authentication** | Required |
| **Empty state** | Camera permission denied — "Allow camera access to scan badges" |
| **Loading state** | Camera viewfinder + scan animation |
| **Error state** | Invalid badge — "Badge not recognised"; expired badge — "This badge has already been claimed" |
| **Mobile behaviour** | Camera viewfinder (mobile-native); auto-detect QR; haptic on success |
| **Desktop behaviour** | Manual code entry fallback (desktop has no camera) |
| **Accessibility** | Fallback manual entry always available; success/error announced |
| **Current status** | `MISSING_BOTH` — no scan route, no scan API, no badge-token model |
| **Gap classification** | `MISSING_BOTH` |
| **Dependencies** | FanValueLedger (exists, STORY-19); AchievementsService (exists, STORY-20); new BadgeScan model and endpoint; physical badge programme defined by product owner |
| **Acceptance criteria** | Each badge scanned only once per fan per event; points awarded within 3 seconds; one-time use enforced server-side |

---

## End-to-End Journey Flows

### Journey A — First-time Fantasy Player

```
/sign-in (Screen 34) → register
→ /account/favourite-team (Screen 32) — choose club during onboarding
→ /fantasy (Screen 1) — landing with "Get started" CTA
→ /fantasy/onboarding (Screen 2) — pick 15 players, budget 100m
→ /fantasy/onboarding step: name team
→ /fantasy/leagues/join (Screen 9) — optional: join friend's league
→ /fantasy/team (Screen 3) — view completed squad
→ /fantasy/help (Screen 10) — optional: read the rules
```

API sequence: `POST /register` → `PATCH /profile/me` → `GET /fantasy/player-pool` → `POST /fantasy/team` → `POST /fantasy/leagues/join` → `GET /fantasy/team/me`

---

### Journey B — Returning Fantasy Manager

```
/sign-in (Screen 34)
→ /fantasy/team (Screen 3) — view current squad and points
→ /fantasy/fixture-difficulty (Screen 6) — check upcoming fixtures
→ /players/[playerId] (Screen 13) — research target player
→ /players/[playerId]/stats (Screen 14) — check consistency
→ /fantasy/team/transfers (Screen 4) — transfer in target player
→ /fantasy/team/chips (Screen 5) — optionally activate chip
→ /fantasy/team (Screen 3) — confirm squad before deadline
→ /fantasy/history (Screen 22) — view gameweek points
```

API sequence: `POST /auth/login` → `GET /fantasy/team/me` → `GET /football/fixtures` → `GET /player-stats/:id/profile` → `GET /fantasy/transfers/status` → `POST /fantasy/team/me/transfers` → `GET /fantasy/gameweeks/:id/score`

---

### Journey C — League Journey

```
/fantasy (Screen 1)
→ /fantasy/leagues (Screen 9) — hub
→ /fantasy/leagues/join (Screen 9) — join with code
→ /fantasy/leagues/[leagueId] (Screen 7) — league detail + standings
→ /fantasy/leagues/[leagueId]/teams/[teamId] (Screen 8) — rival team detail
→ /stats/compare (Screen 16) — compare own player vs rival's
```

API sequence: `GET /fantasy/leagues/me` → `POST /fantasy/leagues/join` → `GET /fantasy/leagues/:id/standings` → `GET /fantasy/teams/:teamId/public` (new endpoint needed)

---

### Journey D — Player Research Journey

```
/fantasy/team (Screen 3)
→ /fantasy/team/transfers (Screen 4) — open transfer mode
→ /players/[playerId] (Screen 13) — click player name from pool
→ /players/[playerId]/stats (Screen 14) — full stat history
→ /stats/compare (Screen 16) — compare with current squad player
→ /fantasy/team/transfers (Screen 4) — confirm transfer
```

---

### Journey E — Matchday Journey

```
/fantasy/team (Screen 3) — pre-match squad view
→ /matches (Screen 11) — fixtures list, today's matches
→ /matches/[fixtureId] (Screen 12) — live match centre
→ /matches/[fixtureId] fantasy tab — live fantasy points preview
→ /players/[playerId] (Screen 13) — player who scored
→ /fantasy/history/[gameweekId] (Screen 22) — final gameweek points
```

API sequence: `GET /fantasy/team/me` → `GET /football/fixtures` → `GET /football/fixtures/:id/live` → `GET /football/fixtures/:id/live-fantasy-preview` → `GET /fantasy/gameweeks/:id/score`

---

### Journey F — Account Journey

```
/account (Screen 28) — manage account hub
→ /account/profile (Screen 29) — edit personal details
→ /account/favourite-team (Screen 32) — change favourite team
→ /account/security (Screen 30) — change password
→ /forgot-password (Screen 35) — if needed
→ /account (Screen 28) — logout (Screen 33)
→ /sign-in (Screen 34)
```

---

## Authentication Dependency Matrix

| Screen group | Auth requirement |
|-------------|----------------|
| Fantasy landing, Help, Rules, Standings, Results, Player detail, Season stats | None — public |
| Fixture difficulty, Match detail (read-only), Article, Video | None — public |
| Terms, Privacy, About, FAQs | None — public |
| Fantasy team, Transfers, Chips, Leagues, History | Required — fan role |
| Fantasy onboarding (create team) | Required — fan role |
| Compare players, Filtering managers | Optional (personalised features require auth) |
| Account, Profile, Security, Favourite team, Logout | Required — own account |
| Delete account | Required + password confirmation |
| Badge scan | Required — fan role |
| Team detail (rival) | Required — must be in same league |
