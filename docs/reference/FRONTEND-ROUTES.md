# PSL One — Frontend Route Reference

**Purpose:** Accurate frontend route inventory extracted from actual page files  
**Audience:** Frontend engineers, designers, QA  
**Status:** Current as of STORY-FE-UX-01  
**Last verified:** 2026-06-17  
**Total pages:** 350  
**Source:** `find apps/web/src/app -type f -name 'page.tsx' | sort`  
**Authority:** Files are the single source of truth — regenerate this when pages change  

---

## Next.js Route Convention

| Segment | Meaning |
|---------|---------|
| `[id]` | Dynamic string segment — passed as `params.id` |
| `[slug]` | Dynamic slug segment — passed as `params.slug` |
| `[seasonId]`, `[fixtureId]` etc. | Domain-specific dynamic segments |
| `page.tsx` | Route renders this component |

All routes below correspond one-to-one with a `page.tsx` file in `apps/web/src/app/`.

---

## Public Routes (unauthenticated)

| URL | File | Description |
|-----|------|-------------|
| `/` | `page.tsx` | Home / landing page |
| `/login` | `login/page.tsx` | Login form |
| `/register` | `register/page.tsx` | Registration form |
| `/forgot-password` | `forgot-password/page.tsx` | Password reset request |
| `/reset-password` | `reset-password/page.tsx` | Password reset confirm |
| `/beta` | `beta/page.tsx` | Beta programme landing |
| `/health` | `health/page.tsx` | Health status page |

---

## Football Core

| URL | File | Description |
|-----|------|-------------|
| `/football` | `football/page.tsx` | Football hub |
| `/football/competitions` | `football/competitions/page.tsx` | Competitions list |
| `/football/seasons` | `football/seasons/page.tsx` | Seasons list |
| `/football/teams` | `football/teams/page.tsx` | Teams list |
| `/football/teams/[slug]` | `football/teams/[slug]/page.tsx` | Team profile |
| `/football/players` | `football/players/page.tsx` | Players list |
| `/football/fixtures` | `football/fixtures/page.tsx` | Fixtures list |
| `/football/fixtures/[id]` | `football/fixtures/[id]/page.tsx` | Fixture detail |
| `/football/fixtures/[id]/live` | `football/fixtures/[id]/live/page.tsx` | Live fixture |
| `/football/match-centre/[fixtureId]` | `football/match-centre/[fixtureId]/page.tsx` | Match centre |
| `/football/standings` | `football/standings/page.tsx` | League standings |

---

## Match Centre (Fan)

| URL | File | Description |
|-----|------|-------------|
| `/matches` | `matches/page.tsx` | Matches hub |
| `/matches/live` | `matches/live/page.tsx` | Live matches |
| `/matches/[fixtureId]` | `matches/[fixtureId]/page.tsx` | Match overview |
| `/matches/[fixtureId]/lineups` | `matches/[fixtureId]/lineups/page.tsx` | Line-ups |
| `/matches/[fixtureId]/stats` | `matches/[fixtureId]/stats/page.tsx` | Match stats |
| `/matches/[fixtureId]/timeline` | `matches/[fixtureId]/timeline/page.tsx` | Timeline |
| `/matches/[fixtureId]/players` | `matches/[fixtureId]/players/page.tsx` | Player ratings |
| `/matches/[fixtureId]/predictions` | `matches/[fixtureId]/predictions/page.tsx` | Match predictions |
| `/matches/[fixtureId]/social` | `matches/[fixtureId]/social/page.tsx` | Social challenges |
| `/matches/[fixtureId]/fantasy` | `matches/[fixtureId]/fantasy/page.tsx` | Fantasy preview |
| `/match-centre/standings/[seasonId]` | `match-centre/standings/[seasonId]/page.tsx` | Season standings |

---

## Gameweeks

| URL | File | Description |
|-----|------|-------------|
| `/gameweeks` | `gameweeks/page.tsx` | Gameweeks list |
| `/gameweeks/[id]` | `gameweeks/[id]/page.tsx` | Gameweek detail |
| `/gameweeks/[id]/fixtures` | `gameweeks/[id]/fixtures/page.tsx` | Gameweek fixtures |

---

## Clubs

| URL | File | Description |
|-----|------|-------------|
| `/clubs` | `clubs/page.tsx` | All clubs |
| `/clubs/[slug]` | `clubs/[slug]/page.tsx` | Club hub |
| `/clubs/[slug]/overview` | `clubs/[slug]/overview/page.tsx` | Club overview |
| `/clubs/[slug]/squad` | `clubs/[slug]/squad/page.tsx` | Club squad |
| `/clubs/[slug]/fixtures` | `clubs/[slug]/fixtures/page.tsx` | Upcoming fixtures |
| `/clubs/[slug]/results` | `clubs/[slug]/results/page.tsx` | Recent results |
| `/clubs/[slug]/stats` | `clubs/[slug]/stats/page.tsx` | Club stats |
| `/clubs/[slug]/stadium` | `clubs/[slug]/stadium/page.tsx` | Stadium info |
| `/clubs/[slug]/media` | `clubs/[slug]/media/page.tsx` | Club media |
| `/clubs/[slug]/shop` | `clubs/[slug]/shop/page.tsx` | Club shop |
| `/clubs/[slug]/shop/[productSlug]` | `clubs/[slug]/shop/[productSlug]/page.tsx` | Shop product |
| `/clubs/[slug]/tickets` | `clubs/[slug]/tickets/page.tsx` | Tickets (stub) |

---

## Players

| URL | File | Description |
|-----|------|-------------|
| `/players` | `players/page.tsx` | Players hub |
| `/players/[playerId]` | `players/[playerId]/page.tsx` | Player profile |
| `/players/[playerId]/season/[seasonId]` | `players/[playerId]/season/[seasonId]/page.tsx` | Player season stats |
| `/players/[playerId]/fixture/[fixtureId]` | `players/[playerId]/fixture/[fixtureId]/page.tsx` | Player match stats |
| `/players/fixtures/[fixtureId]` | `players/fixtures/[fixtureId]/page.tsx` | All player stats for fixture |
| `/players/gameweek/[gameweekId]` | `players/gameweek/[gameweekId]/page.tsx` | Gameweek player stats |
| `/players/season/[seasonId]` | `players/season/[seasonId]/page.tsx` | Season players |
| `/players/season/[seasonId]/top-performers` | `players/season/[seasonId]/top-performers/page.tsx` | Top performers |

---

## Fantasy

| URL | File | Description |
|-----|------|-------------|
| `/fantasy` | `fantasy/page.tsx` | Fantasy hub |
| `/fantasy/team` | `fantasy/team/page.tsx` | My team |
| `/fantasy/team/create` | `fantasy/team/create/page.tsx` | Create team |
| `/fantasy/player-pool` | `fantasy/player-pool/page.tsx` | Player pool |
| `/fantasy/player-pool/[fixtureId]` | `fantasy/player-pool/[fixtureId]/page.tsx` | Fixture player pool |
| `/fantasy/player-prices` | `fantasy/player-prices/page.tsx` | Player prices |
| `/fantasy/transfers` | `fantasy/transfers/page.tsx` | Transfers |
| `/fantasy/deadline` | `fantasy/deadline/page.tsx` | Transfer deadline |
| `/fantasy/chips` | `fantasy/chips/page.tsx` | Chips |
| `/fantasy/rules` | `fantasy/rules/page.tsx` | Rules |
| `/fantasy/history` | `fantasy/history/page.tsx` | Gameweek history |
| `/fantasy/history/[gameweekId]` | `fantasy/history/[gameweekId]/page.tsx` | Specific GW history |
| `/fantasy/gameweeks/[gameweekId]/score` | `fantasy/gameweeks/[gameweekId]/score/page.tsx` | Gameweek score |
| `/fantasy/gameweeks/[gameweekId]/auto-subs` | `fantasy/gameweeks/[gameweekId]/auto-subs/page.tsx` | Auto-sub results |
| `/fantasy/gameweeks/[gameweekId]/final-xi` | `fantasy/gameweeks/[gameweekId]/final-xi/page.tsx` | Final XI |
| `/fantasy/leagues` | `fantasy/leagues/page.tsx` | My leagues |
| `/fantasy/leagues/create` | `fantasy/leagues/create/page.tsx` | Create league |
| `/fantasy/leagues/join` | `fantasy/leagues/join/page.tsx` | Join league |
| `/fantasy/leagues/[id]` | `fantasy/leagues/[id]/page.tsx` | League detail |
| `/fantasy/leagues/[id]/standings` | `fantasy/leagues/[id]/standings/page.tsx` | League standings |
| `/fantasy/cups` | `fantasy/cups/page.tsx` | Cups |
| `/fantasy/leaderboard` | `fantasy/leaderboard/page.tsx` | Fantasy leaderboard |
| `/fantasy/leaderboard/gameweek/[gameweekId]` | `fantasy/leaderboard/gameweek/[gameweekId]/page.tsx` | Gameweek leaderboard |
| `/fantasy/leaderboard/season/[seasonId]` | `fantasy/leaderboard/season/[seasonId]/page.tsx` | Season leaderboard |

---

## Predictions

| URL | File | Description |
|-----|------|-------------|
| `/predictions` | `predictions/page.tsx` | Predictions hub |
| `/predictions/me` | `predictions/me/page.tsx` | My predictions |
| `/predictions/fixtures` | `predictions/fixtures/page.tsx` | Eligible fixtures |
| `/predictions/fixtures/[id]` | `predictions/fixtures/[id]/page.tsx` | Fixture prediction |

---

## Social Predictions (Marketplace)

| URL | File | Description |
|-----|------|-------------|
| `/social-predictions/allocation` | `social-predictions/allocation/page.tsx` | My gameplay allocation |
| `/social-predictions/marketplace/[fixtureId]` | `social-predictions/marketplace/[fixtureId]/page.tsx` | Fixture marketplace |
| `/social-predictions/create/[marketId]` | `social-predictions/create/[marketId]/page.tsx` | Create listing |
| `/social-predictions/[listingId]` | `social-predictions/[listingId]/page.tsx` | Listing detail |
| `/social-predictions/my-listings` | `social-predictions/my-listings/page.tsx` | My listings |
| `/social-predictions/leaderboard` | `social-predictions/leaderboard/page.tsx` | SP leaderboard |

---

## Social Challenges (Direct)

| URL | File | Description |
|-----|------|-------------|
| `/social-challenges` | `social-challenges/page.tsx` | My challenges |
| `/social-challenges/[challengeId]` | `social-challenges/[challengeId]/page.tsx` | Challenge detail |
| `/social-challenges/incoming` | `social-challenges/incoming/page.tsx` | Incoming challenges |
| `/social-challenges/outgoing` | `social-challenges/outgoing/page.tsx` | Outgoing challenges |
| `/social-challenges/new` | `social-challenges/new/page.tsx` | Send challenge |

---

## Challenges (Legacy Peer)

| URL | File | Description |
|-----|------|-------------|
| `/challenges` | `challenges/page.tsx` | Challenges (legacy) |
| `/challenges/[id]` | `challenges/[id]/page.tsx` | Challenge detail (legacy) |

---

## Leaderboards

| URL | File | Description |
|-----|------|-------------|
| `/leaderboards` | `leaderboards/page.tsx` | Leaderboard hub |
| `/leaderboards/overall` | `leaderboards/overall/page.tsx` | Overall |
| `/leaderboards/fan-value` | `leaderboards/fan-value/page.tsx` | Fan Value |
| `/leaderboards/fantasy` | `leaderboards/fantasy/page.tsx` | Fantasy |
| `/leaderboards/predictions` | `leaderboards/predictions/page.tsx` | Predictions |
| `/leaderboards/achievements` | `leaderboards/achievements/page.tsx` | Achievements |

---

## Fan Value

| URL | File | Description |
|-----|------|-------------|
| `/fan-value` | `fan-value/page.tsx` | Fan Value hub |
| `/fan-value/ledger` | `fan-value/ledger/page.tsx` | Ledger |
| `/fan-value/by-type` | `fan-value/by-type/page.tsx` | By type |
| `/fan-value/by-source` | `fan-value/by-source/page.tsx` | By source |

---

## Achievements

| URL | File | Description |
|-----|------|-------------|
| `/achievements` | `achievements/page.tsx` | My achievements |
| `/achievements/progress` | `achievements/progress/page.tsx` | Progress |
| `/achievements/badges` | `achievements/badges/page.tsx` | My badges |

---

## Notifications

| URL | File | Description |
|-----|------|-------------|
| `/notifications` | `notifications/page.tsx` | My notifications |
| `/notifications/[id]` | `notifications/[id]/page.tsx` | Notification detail |
| `/notifications/preferences` | `notifications/preferences/page.tsx` | Preferences |

---

## Activity Feed

| URL | File | Description |
|-----|------|-------------|
| `/activity` | `activity/page.tsx` | Public feed |
| `/activity/me` | `activity/me/page.tsx` | My feed |
| `/activity/[id]` | `activity/[id]/page.tsx` | Feed item |

---

## Media

| URL | File | Description |
|-----|------|-------------|
| `/media` | `media/page.tsx` | Media hub |
| `/media/[slug]` | `media/[slug]/page.tsx` | Media item |

---

## Campaigns

| URL | File | Description |
|-----|------|-------------|
| `/campaigns` | `campaigns/page.tsx` | Campaigns |
| `/campaigns/[slug]` | `campaigns/[slug]/page.tsx` | Campaign detail |

---

## Profile & Account

| URL | File | Description |
|-----|------|-------------|
| `/account` | `account/page.tsx` | Account settings |
| `/profile` | `profile/page.tsx` | My profile |
| `/profile/edit` | `profile/edit/page.tsx` | Edit profile |
| `/profile/preferences` | `profile/preferences/page.tsx` | Preferences |
| `/my-rewards` | `my-rewards/page.tsx` | My rewards |
| `/rewards` | `rewards/page.tsx` | Rewards hub |
| `/rewards/eligible` | `rewards/eligible/page.tsx` | Eligible rewards |
| `/rewards/locked` | `rewards/locked/page.tsx` | Locked rewards |
| `/wallet` | `wallet/page.tsx` | Wallet (sandbox) |

---

## Admin — Core

| URL | File | Description |
|-----|------|-------------|
| `/admin` | `admin/page.tsx` | Admin home |
| `/admin/dashboard` | `admin/dashboard/page.tsx` | Dashboard |
| `/admin/dashboard/compliance` | `admin/dashboard/compliance/page.tsx` | Compliance |
| `/admin/dashboard/content-moderation` | `admin/dashboard/content-moderation/page.tsx` | Content moderation |
| `/admin/dashboard/fantasy-league` | `admin/dashboard/fantasy-league/page.tsx` | Fantasy league |
| `/admin/dashboard/fantasy-rules` | `admin/dashboard/fantasy-rules/page.tsx` | Fantasy rules |
| `/admin/dashboard/fixture-management` | `admin/dashboard/fixture-management/page.tsx` | Fixture management |
| `/admin/dashboard/guess-the-score` | `admin/dashboard/guess-the-score/page.tsx` | Guess the Score |
| `/admin/dashboard/league-management` | `admin/dashboard/league-management/page.tsx` | League management |
| `/admin/dashboard/reporting` | `admin/dashboard/reporting/page.tsx` | Reporting |
| `/admin/dashboard/sponsor-management` | `admin/dashboard/sponsor-management/page.tsx` | Sponsor management |
| `/admin/dashboard/system` | `admin/dashboard/system/page.tsx` | System |
| `/admin/dashboard/user-audience` | `admin/dashboard/user-audience/page.tsx` | User audience |

---

## Admin — Football & Competitions

| URL | File | Description |
|-----|------|-------------|
| `/admin/competitions` | `admin/competitions/page.tsx` | Competitions |
| `/admin/competitions/new` | `admin/competitions/new/page.tsx` | New competition |
| `/admin/competitions/[id]` | `admin/competitions/[id]/page.tsx` | Competition detail |
| `/admin/competitions/[id]/seasons` | `admin/competitions/[id]/seasons/page.tsx` | Competition seasons |
| `/admin/seasons/context` | `admin/seasons/context/page.tsx` | Season context |
| `/admin/seasons/[id]` | `admin/seasons/[id]/page.tsx` | Season detail |
| `/admin/seasons/[id]/clubs` | `admin/seasons/[id]/clubs/page.tsx` | Season clubs |

---

## Admin — Fixtures

| URL | File | Description |
|-----|------|-------------|
| `/admin/fixtures/imports` | `admin/fixtures/imports/page.tsx` | Import batches |
| `/admin/fixtures/imports/new` | `admin/fixtures/imports/new/page.tsx` | New import |
| `/admin/fixtures/imports/[batchId]` | `admin/fixtures/imports/[batchId]/page.tsx` | Batch detail |
| `/admin/fixtures/imports/[batchId]/rows` | `admin/fixtures/imports/[batchId]/rows/page.tsx` | Batch rows |
| `/admin/fixtures/imports/[batchId]/validation` | `admin/fixtures/imports/[batchId]/validation/page.tsx` | Validation |
| `/admin/fixtures/imports/[batchId]/publish` | `admin/fixtures/imports/[batchId]/publish/page.tsx` | Publish |
| `/admin/fixtures/validation` | `admin/fixtures/validation/page.tsx` | Validation summary |
| `/admin/fixtures/publishing` | `admin/fixtures/publishing/page.tsx` | Publishing |
| `/admin/fixtures/gameweeks` | `admin/fixtures/gameweeks/page.tsx` | Gameweek assignments |
| `/admin/fixtures/assignments` | `admin/fixtures/assignments/page.tsx` | Assignments |
| `/admin/fixtures/assignment-summary` | `admin/fixtures/assignment-summary/page.tsx` | Assignment summary |
| `/admin/fixtures/unassigned` | `admin/fixtures/unassigned/page.tsx` | Unassigned |
| `/admin/fixtures/conflicts` | `admin/fixtures/conflicts/page.tsx` | Conflicts |
| `/admin/football/fixtures/[fixtureId]/live` | `admin/football/fixtures/[fixtureId]/live/page.tsx` | Live fixture admin |
| `/admin/football/live` | `admin/football/live/page.tsx` | Live hub |

---

## Admin — Gameweeks & Operations

| URL | File | Description |
|-----|------|-------------|
| `/admin/gameweeks/operations` | `admin/gameweeks/operations/page.tsx` | Operations hub |
| `/admin/gameweeks/operations/[seasonId]` | `admin/gameweeks/operations/[seasonId]/page.tsx` | Season operations |
| `/admin/gameweeks/operations/[seasonId]/gameweeks` | `admin/gameweeks/operations/[seasonId]/gameweeks/page.tsx` | Gameweeks |
| `/admin/gameweeks/operations/[seasonId]/gameweeks/[gameweekId]` | `admin/gameweeks/operations/[seasonId]/gameweeks/[gameweekId]/page.tsx` | Gameweek detail |
| `/admin/gameweeks/operations/[seasonId]/deadlines` | `admin/gameweeks/operations/[seasonId]/deadlines/page.tsx` | Deadlines |
| `/admin/gameweeks/operations/[seasonId]/matchday-control` | `admin/gameweeks/operations/[seasonId]/matchday-control/page.tsx` | Matchday control |
| `/admin/gameweeks/operations/[seasonId]/fixture-assignment` | `admin/gameweeks/operations/[seasonId]/fixture-assignment/page.tsx` | Fixture assignment |
| `/admin/gameweeks/operations/[seasonId]/readiness` | `admin/gameweeks/operations/[seasonId]/readiness/page.tsx` | Readiness |
| `/admin/gameweeks/operations/[seasonId]/fantasy-impact` | `admin/gameweeks/operations/[seasonId]/fantasy-impact/page.tsx` | Fantasy impact |
| `/admin/gameweeks/operations/[seasonId]/prediction-impact` | `admin/gameweeks/operations/[seasonId]/prediction-impact/page.tsx` | Prediction impact |
| `/admin/gameweeks/operations/[seasonId]/activation-impact` | `admin/gameweeks/operations/[seasonId]/activation-impact/page.tsx` | Activation impact |
| `/admin/gameweeks/operations/[seasonId]/publication` | `admin/gameweeks/operations/[seasonId]/publication/page.tsx` | Publication |

---

## Admin — Season Switching

| URL | File | Description |
|-----|------|-------------|
| `/admin/seasons/switching` | `admin/seasons/switching/page.tsx` | Switch history |
| `/admin/seasons/switching/[seasonId]` | `admin/seasons/switching/[seasonId]/page.tsx` | Season switch |
| `/admin/seasons/switching/[seasonId]/readiness` | `admin/seasons/switching/[seasonId]/readiness/page.tsx` | 13-check readiness |
| `/admin/seasons/switching/[seasonId]/preview` | `admin/seasons/switching/[seasonId]/preview/page.tsx` | Switch preview |

---

## Admin — Fantasy

| URL | File | Description |
|-----|------|-------------|
| `/admin/fantasy/rules` | `admin/fantasy/rules/page.tsx` | Rules config |
| `/admin/fantasy/scoring` | `admin/fantasy/scoring/page.tsx` | Scoring |
| `/admin/fantasy/deadlines` | `admin/fantasy/deadlines/page.tsx` | Deadlines |
| `/admin/fantasy/leagues` | `admin/fantasy/leagues/page.tsx` | Leagues |
| `/admin/fantasy/cups` | `admin/fantasy/cups/page.tsx` | Cups |
| `/admin/fantasy/prices` | `admin/fantasy/prices/page.tsx` | Player prices |
| `/admin/fantasy/auto-subs` | `admin/fantasy/auto-subs/page.tsx` | Auto-subs |
| `/admin/fantasy/calibration` | `admin/fantasy/calibration/page.tsx` | Calibration hub |
| `/admin/fantasy/calibration/[seasonId]` | `admin/fantasy/calibration/[seasonId]/page.tsx` | Season calibration |
| `/admin/fantasy/calibration/[seasonId]/players` | `admin/fantasy/calibration/[seasonId]/players/page.tsx` | Players |
| `/admin/fantasy/calibration/[seasonId]/gameweeks` | `admin/fantasy/calibration/[seasonId]/gameweeks/page.tsx` | Gameweeks |
| `/admin/fantasy/calibration/[seasonId]/rules` | `admin/fantasy/calibration/[seasonId]/rules/page.tsx` | Rules |
| `/admin/fantasy/calibration/[seasonId]/readiness` | `admin/fantasy/calibration/[seasonId]/readiness/page.tsx` | Readiness |
| `/admin/fantasy/calibration/[seasonId]/activation-impact` | `admin/fantasy/calibration/[seasonId]/activation-impact/page.tsx` | Impact |

---

## Admin — Fantasy Price Calibration

| URL | File | Description |
|-----|------|-------------|
| `/admin/fantasy-price-calibration` | `admin/fantasy-price-calibration/page.tsx` | Calibration hub |
| `/admin/fantasy-price-calibration/[seasonId]` | `admin/fantasy-price-calibration/[seasonId]/page.tsx` | Season |
| `/admin/fantasy-price-calibration/[seasonId]/players` | `admin/fantasy-price-calibration/[seasonId]/players/page.tsx` | Players |
| `/admin/fantasy-price-calibration/[seasonId]/readiness` | `admin/fantasy-price-calibration/[seasonId]/readiness/page.tsx` | Readiness |
| `/admin/fantasy-price-calibration/[seasonId]/invalid-prices` | `admin/fantasy-price-calibration/[seasonId]/invalid-prices/page.tsx` | Invalid prices |
| `/admin/fantasy-price-calibration/[seasonId]/missing-prices` | `admin/fantasy-price-calibration/[seasonId]/missing-prices/page.tsx` | Missing prices |
| `/admin/fantasy-price-calibration/[seasonId]/activation-impact` | `admin/fantasy-price-calibration/[seasonId]/activation-impact/page.tsx` | Activation impact |
| `/admin/fantasy-price-calibration/[seasonId]/activation-dry-run` | `admin/fantasy-price-calibration/[seasonId]/activation-dry-run/page.tsx` | Dry run |

---

## Admin — Predictions & Calibration

| URL | File | Description |
|-----|------|-------------|
| `/admin/predictions` | `admin/predictions/page.tsx` | Predictions hub |
| `/admin/predictions/settlement` | `admin/predictions/settlement/page.tsx` | Settlement |
| `/admin/predictions/calibration` | `admin/predictions/calibration/page.tsx` | Calibration hub |
| `/admin/predictions/calibration/[seasonId]` | `admin/predictions/calibration/[seasonId]/page.tsx` | Season |
| `/admin/predictions/calibration/[seasonId]/rules` | `admin/predictions/calibration/[seasonId]/rules/page.tsx` | Rules |
| `/admin/predictions/calibration/[seasonId]/fixtures` | `admin/predictions/calibration/[seasonId]/fixtures/page.tsx` | Fixtures |
| `/admin/predictions/calibration/[seasonId]/locks` | `admin/predictions/calibration/[seasonId]/locks/page.tsx` | Locks |
| `/admin/predictions/calibration/[seasonId]/lock-readiness` | `admin/predictions/calibration/[seasonId]/lock-readiness/page.tsx` | Lock readiness |
| `/admin/predictions/calibration/[seasonId]/settlement` | `admin/predictions/calibration/[seasonId]/settlement/page.tsx` | Settlement |
| `/admin/predictions/calibration/[seasonId]/readiness` | `admin/predictions/calibration/[seasonId]/readiness/page.tsx` | Readiness |
| `/admin/predictions/calibration/[seasonId]/challenges` | `admin/predictions/calibration/[seasonId]/challenges/page.tsx` | Challenges |
| `/admin/predictions/calibration/[seasonId]/peer-challenges` | `admin/predictions/calibration/[seasonId]/peer-challenges/page.tsx` | Peer challenges |
| `/admin/predictions/calibration/[seasonId]/activation-impact` | `admin/predictions/calibration/[seasonId]/activation-impact/page.tsx` | Activation impact |

---

## Admin — Social Predictions

| URL | File | Description |
|-----|------|-------------|
| `/admin/social-predictions/markets` | `admin/social-predictions/markets/page.tsx` | Markets |
| `/admin/social-predictions/markets/new` | `admin/social-predictions/markets/new/page.tsx` | New market |
| `/admin/social-predictions/markets/[id]` | `admin/social-predictions/markets/[id]/page.tsx` | Market detail |
| `/admin/social-predictions/listings` | `admin/social-predictions/listings/page.tsx` | All listings |
| `/admin/social-predictions/allocations` | `admin/social-predictions/allocations/page.tsx` | Allocations |
| `/admin/social-predictions/compliance` | `admin/social-predictions/compliance/page.tsx` | Compliance |
| `/admin/social-predictions/settlements` | `admin/social-predictions/settlements/page.tsx` | Settlements |

---

## Admin — Live Match

| URL | File | Description |
|-----|------|-------------|
| `/admin/live-match` | `admin/live-match/page.tsx` | Live match hub |
| `/admin/live-match/provider-readiness` | `admin/live-match/provider-readiness/page.tsx` | Provider readiness |
| `/admin/live-match/ingestion-batches` | `admin/live-match/ingestion-batches/page.tsx` | Ingestion batches |
| `/admin/live-match/[fixtureId]` | `admin/live-match/[fixtureId]/page.tsx` | Fixture live |
| `/admin/live-match/[fixtureId]/lineups` | `admin/live-match/[fixtureId]/lineups/page.tsx` | Line-ups |
| `/admin/live-match/[fixtureId]/events` | `admin/live-match/[fixtureId]/events/page.tsx` | Events |
| `/admin/live-match/[fixtureId]/team-stats` | `admin/live-match/[fixtureId]/team-stats/page.tsx` | Team stats |
| `/admin/live-match/[fixtureId]/player-stats` | `admin/live-match/[fixtureId]/player-stats/page.tsx` | Player stats |
| `/admin/live-match/[fixtureId]/prediction-impact` | `admin/live-match/[fixtureId]/prediction-impact/page.tsx` | Prediction impact |
| `/admin/live-match/[fixtureId]/fantasy-impact` | `admin/live-match/[fixtureId]/fantasy-impact/page.tsx` | Fantasy impact |
| `/admin/live-match/[fixtureId]/readiness` | `admin/live-match/[fixtureId]/readiness/page.tsx` | Readiness |

---

## Admin — Match Centre (Ingestion)

| URL | File | Description |
|-----|------|-------------|
| `/admin/match-centre/ingestion` | `admin/match-centre/ingestion/page.tsx` | Ingestion |
| `/admin/match-centre/ratings` | `admin/match-centre/ratings/page.tsx` | Player ratings |
| `/admin/match-centre/standings` | `admin/match-centre/standings/page.tsx` | Standings |
| `/admin/match-centre/fixtures/[fixtureId]/ingest` | `admin/match-centre/fixtures/[fixtureId]/ingest/page.tsx` | Ingest fixture |

---

## Admin — Player Stats

| URL | File | Description |
|-----|------|-------------|
| `/admin/player-stats` | `admin/player-stats/page.tsx` | Player stats hub |
| `/admin/player-stats/new` | `admin/player-stats/new/page.tsx` | New stats entry |
| `/admin/player-stats/[statId]` | `admin/player-stats/[statId]/page.tsx` | Stats detail |
| `/admin/player-stats/fixture/[fixtureId]` | `admin/player-stats/fixture/[fixtureId]/page.tsx` | Fixture stats |
| `/admin/player-stats/season/[seasonId]` | `admin/player-stats/season/[seasonId]/page.tsx` | Season stats |
| `/admin/player-stats/season/[seasonId]/readiness` | `admin/player-stats/season/[seasonId]/readiness/page.tsx` | Readiness |

---

## Admin — Squad Import

| URL | File | Description |
|-----|------|-------------|
| `/admin/squad-import` | `admin/squad-import/page.tsx` | Import hub |
| `/admin/squad-import/[seasonId]` | `admin/squad-import/[seasonId]/page.tsx` | Season import |
| `/admin/squad-import/[seasonId]/batches` | `admin/squad-import/[seasonId]/batches/page.tsx` | Batches |
| `/admin/squad-import/[seasonId]/batches/[batchId]` | `admin/squad-import/[seasonId]/batches/[batchId]/page.tsx` | Batch detail |
| `/admin/squad-import/[seasonId]/batches/[batchId]/rows` | `admin/squad-import/[seasonId]/batches/[batchId]/rows/page.tsx` | Batch rows |
| `/admin/squad-import/[seasonId]/duplicates` | `admin/squad-import/[seasonId]/duplicates/page.tsx` | Duplicates |
| `/admin/squad-import/[seasonId]/readiness` | `admin/squad-import/[seasonId]/readiness/page.tsx` | Readiness |
| `/admin/squad-import/[seasonId]/activation-impact` | `admin/squad-import/[seasonId]/activation-impact/page.tsx` | Activation impact |
| `/admin/squad-import/[seasonId]/activation-dry-run` | `admin/squad-import/[seasonId]/activation-dry-run/page.tsx` | Dry run |

---

## Admin — Clubs

| URL | File | Description |
|-----|------|-------------|
| `/admin/clubs` | `admin/clubs/page.tsx` | Clubs list |
| `/admin/clubs/readiness` | `admin/clubs/readiness/page.tsx` | Club readiness |
| `/admin/clubs/[id]` | `admin/clubs/[id]/page.tsx` | Club admin |
| `/admin/clubs/[id]/players` | `admin/clubs/[id]/players/page.tsx` | Players |
| `/admin/clubs/[id]/experience` | `admin/clubs/[id]/experience/page.tsx` | Experience |
| `/admin/clubs/[id]/fixtures` | `admin/clubs/[id]/fixtures/page.tsx` | Fixtures |
| `/admin/clubs/[id]/shop` | `admin/clubs/[id]/shop/page.tsx` | Shop |

---

## Admin — Engagement

| URL | File | Description |
|-----|------|-------------|
| `/admin/engagement` | `admin/engagement/page.tsx` | Engagement hub |
| `/admin/engagement/[seasonId]` | `admin/engagement/[seasonId]/page.tsx` | Season overview |
| `/admin/engagement/[seasonId]/fan-value` | `admin/engagement/[seasonId]/fan-value/page.tsx` | Fan Value |
| `/admin/engagement/[seasonId]/fantasy` | `admin/engagement/[seasonId]/fantasy/page.tsx` | Fantasy |
| `/admin/engagement/[seasonId]/predictions` | `admin/engagement/[seasonId]/predictions/page.tsx` | Predictions |
| `/admin/engagement/[seasonId]/achievements` | `admin/engagement/[seasonId]/achievements/page.tsx` | Achievements |
| `/admin/engagement/[seasonId]/leaderboards` | `admin/engagement/[seasonId]/leaderboards/page.tsx` | Leaderboards |
| `/admin/engagement/[seasonId]/activation-impact` | `admin/engagement/[seasonId]/activation-impact/page.tsx` | Activation impact |
| `/admin/engagement/[seasonId]/season-scope-audit` | `admin/engagement/[seasonId]/season-scope-audit/page.tsx` | Season scope audit |
| `/admin/engagement/[seasonId]/unscoped-ledger` | `admin/engagement/[seasonId]/unscoped-ledger/page.tsx` | Unscoped ledger |

---

## Admin — Fan Value

| URL | File | Description |
|-----|------|-------------|
| `/admin/fan-value` | `admin/fan-value/page.tsx` | Fan Value admin |
| `/admin/fan-value/post-entry` | `admin/fan-value/post-entry/page.tsx` | Post entry |
| `/admin/fan-value/users/[userId]` | `admin/fan-value/users/[userId]/page.tsx` | Fan ledger |

---

## Admin — Achievements

| URL | File | Description |
|-----|------|-------------|
| `/admin/achievements` | `admin/achievements/page.tsx` | Achievements |
| `/admin/achievements/definitions` | `admin/achievements/definitions/page.tsx` | Definitions |
| `/admin/achievements/badges` | `admin/achievements/badges/page.tsx` | Badges |
| `/admin/achievements/users/[userId]` | `admin/achievements/users/[userId]/page.tsx` | Fan achievements |

---

## Admin — Notifications

| URL | File | Description |
|-----|------|-------------|
| `/admin/notifications` | `admin/notifications/page.tsx` | Notifications |
| `/admin/notifications/send` | `admin/notifications/send/page.tsx` | Send notification |
| `/admin/notifications/broadcast` | `admin/notifications/broadcast/page.tsx` | Broadcast |

---

## Admin — Activity Feed

| URL | File | Description |
|-----|------|-------------|
| `/admin/activity` | `admin/activity/page.tsx` | Activity feed |
| `/admin/activity/moderation` | `admin/activity/moderation/page.tsx` | Moderation |
| `/admin/activity/system` | `admin/activity/system/page.tsx` | System posts |

---

## Admin — Media, Campaigns & Sponsors

| URL | File | Description |
|-----|------|-------------|
| `/admin/media` | `admin/media/page.tsx` | Media |
| `/admin/media/new` | `admin/media/new/page.tsx` | New media |
| `/admin/media/[mediaId]` | `admin/media/[mediaId]/page.tsx` | Media detail |
| `/admin/campaigns` | `admin/campaigns/page.tsx` | Campaigns |
| `/admin/campaigns/new` | `admin/campaigns/new/page.tsx` | New campaign |
| `/admin/campaigns/[campaignId]` | `admin/campaigns/[campaignId]/page.tsx` | Campaign detail |
| `/admin/campaigns/[campaignId]/actions` | `admin/campaigns/[campaignId]/actions/page.tsx` | Actions |
| `/admin/campaigns/[campaignId]/analytics` | `admin/campaigns/[campaignId]/analytics/page.tsx` | Analytics |
| `/admin/campaigns/[campaignId]/rewards` | `admin/campaigns/[campaignId]/rewards/page.tsx` | Rewards |
| `/admin/campaign-rewards` | `admin/campaign-rewards/page.tsx` | Campaign rewards |
| `/admin/sponsors` | `admin/sponsors/page.tsx` | Sponsors |
| `/admin/sponsors/new` | `admin/sponsors/new/page.tsx` | New sponsor |
| `/admin/sponsors/[sponsorId]` | `admin/sponsors/[sponsorId]/page.tsx` | Sponsor detail |

---

## Admin — Rewards

| URL | File | Description |
|-----|------|-------------|
| `/admin/rewards` | `admin/rewards/page.tsx` | Rewards |
| `/admin/rewards/definitions` | `admin/rewards/definitions/page.tsx` | Definitions |
| `/admin/rewards/definitions/[id]` | `admin/rewards/definitions/[id]/page.tsx` | Definition detail |
| `/admin/reward-definitions` | `admin/reward-definitions/page.tsx` | Reward definitions (legacy) |

---

## Admin — Wallet

| URL | File | Description |
|-----|------|-------------|
| `/admin/wallet` | `admin/wallet/page.tsx` | Wallet admin |
| `/admin/wallet/providers` | `admin/wallet/providers/page.tsx` | Providers |
| `/admin/wallet/links` | `admin/wallet/links/page.tsx` | Fan links |
| `/admin/wallet/transactions` | `admin/wallet/transactions/page.tsx` | Transactions |

---

## Admin — Operations

| URL | File | Description |
|-----|------|-------------|
| `/admin/operations` | `admin/operations/page.tsx` | Control plane |
| `/admin/operations/capability-review` | `admin/operations/capability-review/page.tsx` | Capability review |
| `/admin/operations/launch-readiness` | `admin/operations/launch-readiness/page.tsx` | Launch readiness |
| `/admin/operations/smoke-tests` | `admin/operations/smoke-tests/page.tsx` | Smoke tests |
| `/admin/operations/module-readiness/[seasonId]` | `admin/operations/module-readiness/[seasonId]/page.tsx` | Module readiness |
| `/admin/operations/integrations` | `admin/operations/integrations/page.tsx` | Integrations |
| `/admin/operations/integrations/live-data` | `admin/operations/integrations/live-data/page.tsx` | Live data |
| `/admin/operations/integrations/wallet-payments` | `admin/operations/integrations/wallet-payments/page.tsx` | Wallet payments |
| `/admin/operations/integrations/checkout-commerce` | `admin/operations/integrations/checkout-commerce/page.tsx` | Commerce |
| `/admin/operations/integrations/rewards-redemption` | `admin/operations/integrations/rewards-redemption/page.tsx` | Rewards |
| `/admin/operations/integrations/sponsor-activation` | `admin/operations/integrations/sponsor-activation/page.tsx` | Sponsor activation |
| `/admin/operations/integrations/ticketing` | `admin/operations/integrations/ticketing/page.tsx` | Ticketing |

---

## Admin — Beta Launch

| URL | File | Description |
|-----|------|-------------|
| `/admin/beta-launch` | `admin/beta-launch/page.tsx` | Beta launch hub |
| `/admin/beta-launch/smoke-tests` | `admin/beta-launch/smoke-tests/page.tsx` | Smoke tests |
| `/admin/beta-launch/[seasonId]` | `admin/beta-launch/[seasonId]/page.tsx` | Season overview |
| `/admin/beta-launch/[seasonId]/readiness` | `admin/beta-launch/[seasonId]/readiness/page.tsx` | Readiness |
| `/admin/beta-launch/[seasonId]/blockers` | `admin/beta-launch/[seasonId]/blockers/page.tsx` | Blockers |
| `/admin/beta-launch/[seasonId]/warnings` | `admin/beta-launch/[seasonId]/warnings/page.tsx` | Warnings |
| `/admin/beta-launch/[seasonId]/frontend` | `admin/beta-launch/[seasonId]/frontend/page.tsx` | Frontend readiness |
| `/admin/beta-launch/[seasonId]/data` | `admin/beta-launch/[seasonId]/data/page.tsx` | Data readiness |
| `/admin/beta-launch/[seasonId]/security` | `admin/beta-launch/[seasonId]/security/page.tsx` | Security readiness |
| `/admin/beta-launch/[seasonId]/operations` | `admin/beta-launch/[seasonId]/operations/page.tsx` | Operations readiness |
| `/admin/beta-launch/[seasonId]/cohort` | `admin/beta-launch/[seasonId]/cohort/page.tsx` | Cohort readiness |
| `/admin/beta-launch/[seasonId]/activation-preview` | `admin/beta-launch/[seasonId]/activation-preview/page.tsx` | Activation preview |
| `/admin/beta-launch/[seasonId]/dry-run` | `admin/beta-launch/[seasonId]/dry-run/page.tsx` | Dry run |
| `/admin/beta-launch/[seasonId]/rollback-dry-run` | `admin/beta-launch/[seasonId]/rollback-dry-run/page.tsx` | Rollback dry run |
| `/admin/beta-launch/[seasonId]/approval` | `admin/beta-launch/[seasonId]/approval/page.tsx` | Approval |
| `/admin/beta-launch/[seasonId]/walkthrough` | `admin/beta-launch/[seasonId]/walkthrough/page.tsx` | Walkthrough |
| `/admin/beta-launch/[seasonId]/runbook` | `admin/beta-launch/[seasonId]/runbook/page.tsx` | Runbook |

---

## Admin — Beta Feedback

| URL | File | Description |
|-----|------|-------------|
| `/admin/beta-feedback` | `admin/beta-feedback/page.tsx` | Beta feedback |
| `/admin/beta-feedback/known-issues` | `admin/beta-feedback/known-issues/page.tsx` | Known issues |
| `/admin/beta-feedback/ux-checklist` | `admin/beta-feedback/ux-checklist/page.tsx` | UX checklist |
| `/admin/beta-feedback/release-notes` | `admin/beta-feedback/release-notes/page.tsx` | Release notes |

---

## Admin — Imports (Legacy)

| URL | File | Description |
|-----|------|-------------|
| `/admin/imports` | `admin/imports/page.tsx` | Imports hub |
| `/admin/imports/new` | `admin/imports/new/page.tsx` | New import |
| `/admin/imports/manual` | `admin/imports/manual/page.tsx` | Manual import |
| `/admin/imports/preview` | `admin/imports/preview/page.tsx` | Import preview |
| `/admin/imports/[id]` | `admin/imports/[id]/page.tsx` | Import detail |

---

## Internal — Design Lab (STORY-FE-UX-01)

> Design lab is hidden from public navigation. Requires `NEXT_PUBLIC_DESIGN_LAB_ENABLED=true`.

| URL | File | Description |
|-----|------|-------------|
| `/design-lab` | `design-lab/page.tsx` | Design lab index — 4 demo cards |
| `/design-lab/in-season-home` | `design-lab/in-season-home/page.tsx` | Demo A: In-season league home |
| `/design-lab/prediction-carousel` | `design-lab/prediction-carousel/page.tsx` | Demo B: Fixture prediction carousel |
| `/design-lab/fantasy-hub` | `design-lab/fantasy-hub/page.tsx` | Demo C: Fantasy in-season hub |
| `/design-lab/account` | `design-lab/account/page.tsx` | Demo D: Account and fan identity |

---

## Vision Studio (8 pages)

> Vision studio is hidden from public navigation. Requires `NEXT_PUBLIC_VISION_STUDIO_ENABLED=true`.

| URL | File | Description |
|-----|------|-------------|
| `/vision` | `vision/page.tsx` | Vision studio hub — destination cards and design token reference |
| `/vision/in-season` | `vision/in-season/page.tsx` | Flagship in-season layout — all 15 components composed |
| `/vision/matchday` | `vision/matchday/page.tsx` | Live matchday dashboard — live scoreline, match stats, top scorer |
| `/vision/predict` | `vision/predict/page.tsx` | Guess the score flow — score steppers, prediction card, share sheet |
| `/vision/fantasy` | `vision/fantasy/page.tsx` | Fantasy squad pitch view — formation, gameweek panel, performers |
| `/vision/clubs` | `vision/clubs/page.tsx` | Club identity browser — 16 clubs, sticky detail panel |
| `/vision/player` | `vision/player/page.tsx` | Player spotlight — selector rail, season stats, upcoming fixture |
| `/vision/account` | `vision/account/page.tsx` | Fan identity — profile header, fan value, fantasy, achievements |

---

## Notes

- All admin routes (`/admin/*`) require a valid JWT with `PSL_ADMIN` role
- All fan routes that create or update data require a valid JWT
- Public routes (`/login`, `/register`, etc.) require no authentication
- Pages fetch data via client functions in `apps/web/src/lib/*-client.ts`
- No business logic is stored in frontend components — all decisions are in the API
- Web dev server runs on port `3001` (`pnpm --filter @psl-one/web dev`)
