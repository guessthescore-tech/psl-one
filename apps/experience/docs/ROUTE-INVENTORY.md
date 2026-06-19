# apps/experience — Route Inventory
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01 final)
**Total pages:** 56

---

## Homepage

| Route | File | Notes |
|-------|------|-------|
| `/` | `src/app/page.tsx` | 13 sections — see Homepage Sections below |

## Fantasy Core

| Route | File | Notes |
|-------|------|-------|
| `/fantasy` | `src/app/fantasy/page.tsx` | Gameweek hub |
| `/fantasy/team` | `src/app/fantasy/team/page.tsx` | Pitch view + captain |
| `/fantasy/team/transfers` | `src/app/fantasy/team/transfers/page.tsx` | Transfer market |
| `/fantasy/team/chips` | `src/app/fantasy/team/chips/page.tsx` | Chip selector |
| `/fantasy/fixture-difficulty` | `src/app/fantasy/fixture-difficulty/page.tsx` | FDR grid |
| `/fantasy/onboarding` | `src/app/fantasy/onboarding/page.tsx` | 4-step wizard |
| `/fantasy/search` | `src/app/fantasy/search/page.tsx` | Manager/player search |
| `/fantasy/history` | `src/app/fantasy/history/page.tsx` | GW history list |
| `/fantasy/history/[gameweekId]` | `src/app/fantasy/history/[gameweekId]/page.tsx` | GW detail |
| `/fantasy/points` | `src/app/fantasy/points/page.tsx` | STUB |
| `/fantasy/fixtures` | `src/app/fantasy/fixtures/page.tsx` | STUB |
| `/fantasy/stats` | `src/app/fantasy/stats/page.tsx` | STUB |
| `/fantasy/rules` | `src/app/fantasy/rules/page.tsx` | STUB |

## Fantasy Leagues

| Route | File | Notes |
|-------|------|-------|
| `/fantasy/leagues` | `src/app/fantasy/leagues/page.tsx` | League list |
| `/fantasy/leagues/[leagueId]` | `src/app/fantasy/leagues/[leagueId]/page.tsx` | League detail |
| `/fantasy/leagues/[leagueId]/teams/[teamId]` | `src/app/fantasy/leagues/[leagueId]/teams/[teamId]/page.tsx` | Rival team |
| `/fantasy/leagues/create` | `src/app/fantasy/leagues/create/page.tsx` | Create form |
| `/fantasy/leagues/join` | `src/app/fantasy/leagues/join/page.tsx` | Join by code |

## Matches

| Route | File | Notes |
|-------|------|-------|
| `/matches` | `src/app/matches/page.tsx` | All fixtures |
| `/matches/[fixtureId]` | `src/app/matches/[fixtureId]/page.tsx` | Live detail |
| `/matches/[fixtureId]/motm` | `src/app/matches/[fixtureId]/motm/page.tsx` | Man of the Match |

## Players

| Route | File | Notes |
|-------|------|-------|
| `/players` | `src/app/players/page.tsx` | Player pool |
| `/players/[playerId]` | `src/app/players/[playerId]/page.tsx` | Player profile |
| `/players/[playerId]/stats` | `src/app/players/[playerId]/stats/page.tsx` | Player stats |

## Media

| Route | File | Notes |
|-------|------|-------|
| `/media` | `src/app/media/page.tsx` | Stories + video list |
| `/media/[slug]` | `src/app/media/[slug]/page.tsx` | Article or video detail |

## Stats

| Route | File | Notes |
|-------|------|-------|
| `/stats/standings` | `src/app/stats/standings/page.tsx` | Standings table |
| `/stats/season` | `src/app/stats/season/page.tsx` | Season stats |
| `/stats/awards` | `src/app/stats/awards/page.tsx` | Awards |
| `/stats/hall-of-fame` | `src/app/stats/hall-of-fame/page.tsx` | Hall of Fame |
| `/stats/compare` | `src/app/stats/compare/page.tsx` | Player comparison |

## Prediction

| Route | File | Notes |
|-------|------|-------|
| `/predict` | `src/app/predict/page.tsx` | STUB |

## Account & Auth

| Route | File | Notes |
|-------|------|-------|
| `/sign-in` | `src/app/sign-in/page.tsx` | Login form |
| `/register` | `src/app/register/page.tsx` | Registration |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | Request reset |
| `/reset-password` | `src/app/reset-password/page.tsx` | Set new password |
| `/account` | `src/app/account/page.tsx` | Account dashboard |
| `/account/profile` | `src/app/account/profile/page.tsx` | Edit profile |
| `/account/security` | `src/app/account/security/page.tsx` | Change password |
| `/account/favourite-team` | `src/app/account/favourite-team/page.tsx` | Team selector |
| `/account/delete` | `src/app/account/delete/page.tsx` | POPIA placeholder |

## Help & Legal

| Route | File | Notes |
|-------|------|-------|
| `/help` | `src/app/help/page.tsx` | Help categories |
| `/help/[slug]` | `src/app/help/[slug]/page.tsx` | Help article |
| `/terms` | `src/app/terms/page.tsx` | Terms & Conditions |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy Policy |
| `/about` | `src/app/about/page.tsx` | About PSL One |

## Engagement

| Route | File | Notes |
|-------|------|-------|
| `/quiz/[quizId]` | `src/app/quiz/[quizId]/page.tsx` | Football quiz (3 seeded) |
| `/scan` | `src/app/scan/page.tsx` | Badge scanner |

---

## Homepage Sections (`/`)

| # | Section | File | Surface |
|---|---------|------|---------|
| 1 | Matchweek Hero | `sections/MatchweekHeroSection.tsx` | dark void |
| 2 | Fixture Carousel | `sections/FixtureCarouselSection.tsx` | light surface |
| 3 | Featured Match | `sections/FeaturedMatchSection.tsx` | dark void |
| 4 | Guess the Score | `sections/GuessTheScoreSection.tsx` | dark navy |
| 5 | League Table | `sections/LeagueTableSection.tsx` | light surface |
| 6 | Fantasy Gameweek | `sections/FantasyGameweekSection.tsx` | dark ink |
| 7 | Player Spotlight | `sections/PlayerSpotlightSection.tsx` | dark void |
| 8 | Editorial Grid | `sections/EditorialGridSection.tsx` | white |
| 9 | Video Rail | `sections/VideoRailSection.tsx` | dark navy |
| 10 | Club Identity | `sections/ClubIdentitySection.tsx` | white |
| 11 | Sponsor | `sections/SponsorSection.tsx` | light surface |
| 12 | Fan Value | `sections/FanValueSection.tsx` | dark navy-2 |
| 13 | My Club | `sections/MyClubSection.tsx` | dark void |
