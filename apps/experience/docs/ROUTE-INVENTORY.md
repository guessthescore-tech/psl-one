# apps/experience — Route Inventory
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-00)

---

## Implemented Routes

| Route | Component | Sections | Status |
|-------|-----------|----------|--------|
| `/` | `src/app/page.tsx` | 13 sections (see below) | COMPLETE |
| `/_not-found` | Next.js default | — | Auto-generated |

---

## Homepage Sections (`/`)

| # | Section | File | Surface | Notes |
|---|---------|------|---------|-------|
| 1 | Matchweek Hero | `sections/MatchweekHeroSection.tsx` | dark void | Full-bleed, picsum bg, live fixture card |
| 2 | Fixture Carousel | `sections/FixtureCarouselSection.tsx` | light surface | Scroll-snap rail, desktop scroll controls |
| 3 | Featured Match | `sections/FeaturedMatchSection.tsx` | dark void | Score, match stats, predict CTA |
| 4 | Guess the Score | `sections/GuessTheScoreSection.tsx` | dark navy | Score steppers, AnimatePresence flip |
| 5 | League Table | `sections/LeagueTableSection.tsx` | light surface | CSS grid, zone legend, form dots |
| 6 | Fantasy Gameweek | `sections/FantasyGameweekSection.tsx` | dark ink | Points, captain, transfers |
| 7 | Player Spotlight | `sections/PlayerSpotlightSection.tsx` | dark void | Featured portrait + ranked list |
| 8 | Editorial Grid | `sections/EditorialGridSection.tsx` | white | Featured 1 + 4 compact |
| 9 | Video Rail | `sections/VideoRailSection.tsx` | dark navy | Scroll-snap video cards |
| 10 | Club Identity | `sections/ClubIdentitySection.tsx` | white | Horizontal badge rail |
| 11 | Sponsor | `sections/SponsorSection.tsx` | light surface | Full-bleed sponsor moment |
| 12 | Fan Value | `sections/FanValueSection.tsx` | dark navy-2 | Progress bars, level badge |
| 13 | My Club | `sections/MyClubSection.tsx` | light surface | Club stats + next fixture |

---

## Proposed Route Map — Full Fantasy Journey Scope

Derived from STORY-FE-FANTASY-00 canonical screen inventory (40 screens).
Routes marked `apps/web ✓` already exist in the operational beta frontend (`apps/web`).
Routes marked `MISSING` need to be built in `apps/experience` in a future story.

### Phase 1 — Fantasy Core

| Route | Screen | apps/web ✓ | API ✓ | Priority |
|-------|--------|-----------|-------|----------|
| `/fantasy` | Fantasy landing | `/fantasy` (link-list only) | `GET /api/fantasy/deadline` | P1 |
| `/fantasy/onboarding` | Fantasy onboarding | None | `POST /api/fantasy/team` | P1 |
| `/fantasy/team` | Team profile | `/fantasy/team` (wired) | `GET /api/fantasy/team/me` | P1 |
| `/fantasy/team/transfers` | Transferring a player | `/fantasy/transfers` (wired) | `POST /api/fantasy/team/me/transfers` | P1 |
| `/fantasy/team/chips` | Activating a chip | `/fantasy/chips` (wired) | `GET /api/fantasy/chips` | P1 |
| `/fantasy/fixture-difficulty` | Fixture difficulty rating | None | None (new) | P1 |
| `/fantasy/leagues` | Join a League (hub) | `/fantasy/leagues` (wired) | `GET /api/fantasy/leagues/me` | P1 |
| `/fantasy/leagues/join` | Join a League (action) | `/fantasy/leagues/join` (wired) | `POST /api/fantasy/leagues/join` | P1 |
| `/fantasy/leagues/[leagueId]` | League detail | `/fantasy/leagues/[id]` (wired) | `GET /api/fantasy/leagues/:id/standings` | P1 |
| `/fantasy/leagues/[leagueId]/teams/[teamId]` | Team detail | None | None (new endpoint needed) | P1 |
| `/fantasy/help` | Help and Rules | `/fantasy/rules` (raw config) | `GET /api/fantasy/rules` | P1 |

### Phase 2 — Research and Match Context

| Route | Screen | apps/web ✓ | API ✓ | Priority |
|-------|--------|-----------|-------|----------|
| `/matches` | Results | `/matches` (wired) | `GET /api/football/fixtures` | P2 |
| `/matches/[fixtureId]` | Match detail | `/matches/[fixtureId]` (wired, 7 tabs) | `GET /api/football/fixtures/:id/live` + 5 others | P2 |
| `/matches/[fixtureId]/motm` | Man of the Match | None | `GET /api/match-centre/fixture/:id` (ratings) | P2 |
| `/players/[playerId]` | Player detail | `/players/[playerId]` (wired) | `GET /api/player-stats/:id/profile` | P2 |
| `/players/[playerId]/stats` | Player stats | `/players/[playerId]/season/[seasonId]` (wired) | `GET /api/player-stats/:id/season/:seasonId/stats` | P2 |
| `/stats/season` | Season stats | `/players/season/[seasonId]/top-performers` (wired) | `GET /api/player-stats/season/:id/top-performers` | P2 |
| `/stats/compare` | Comparing players | None | None (new aggregation needed) | P2 |
| `/stats/standings` | Sorting/filtering tables | `/football/standings` (wired) | `GET /api/football/standings` | P2 |
| `/stats/awards` | Awards | None | None (new) | P2 |
| `/stats/hall-of-fame` | Hall of Fame | None | None (historical data) | P2 |
| `/fantasy/history` | History | `/fantasy/history` (wired) | `GET /api/fantasy/history` | P2 |
| `/fantasy/history/[gameweekId]` | History detail | `/fantasy/history/[gameweekId]` (wired) | `GET /api/fantasy/history/:gameweekId` | P2 |
| `/fantasy/team/transfers?tab=history` | Transfer history | None | `GET /api/fantasy/history` (contains transfers) | P2 |
| `/media/[slug]` | Article detail + Video | `/media/[slug]` (wired) | `GET /api/fan/media/:slug` | P2 |
| `/fantasy/search` | Searching managers | None | None (new endpoint needed) | P2 |

### Phase 3 — Account and Support

| Route | Screen | apps/web ✓ | API ✓ | Priority |
|-------|--------|-----------|-------|----------|
| `/sign-in` | Logging in | `/login` (wired) | `POST /api/auth/login` | P3 |
| `/forgot-password` | Resetting password (step 1) | `/forgot-password` (wired) | `POST /api/auth/password-reset/request` | P3 |
| `/reset-password` | Resetting password (step 2) | `/reset-password` (wired) | `POST /api/auth/password-reset/confirm` | P3 |
| `/account` | Manage account | `/account` (wired, basic) | `GET /api/auth/me` | P3 |
| `/account/profile` | Editing personal details | `/profile/edit` (wired) | `PATCH /api/profile/me` | P3 |
| `/account/security` | Changing password | None | None (new `POST /api/auth/password/change`) | P3 |
| `/account/favourite-team` | Changing favourite team | `/profile/edit` (partial, in form) | `GET /api/football/teams` + `PATCH /api/profile/me` | P3 |
| `/account` (logout action) | Logging out | `/account` (wired) | `POST /api/auth/logout` | P3 |
| `/account/delete` | Deleting account | None | None (new `DELETE /api/auth/account`) | P3 |
| `/help` | FAQs | None | None (static) | P3 |
| `/terms` | Terms and conditions | None | None (static) | P3 |
| `/privacy` | Privacy policy | None | None (static) | P3 |
| `/about` | About | None | None (static) | P3 |
| `/scan` | Scanning a badge | None | None (new `POST /api/fan-value/scan`) | P3 |

---

## Missing Routes Summary

Routes that exist in neither `apps/web` nor `apps/experience`:

| Route | Screen | Blocker |
|-------|--------|---------|
| `/fantasy/onboarding` | Fantasy onboarding | Page + UX design |
| `/fantasy/fixture-difficulty` | Fixture difficulty | FDR algorithm + API endpoint |
| `/fantasy/leagues/[leagueId]/teams/[teamId]` | Team detail | New API endpoint |
| `/stats/compare` | Player comparison | New API aggregation |
| `/stats/awards` | Awards | No awards model in backend |
| `/stats/hall-of-fame` | Hall of Fame | Historical data not ingested |
| `/matches/[fixtureId]/motm` | Man of the Match | MOTM derivation not built |
| `/fantasy/search` | Manager search | New search API endpoint |
| `/account/security` | Change password | New in-session endpoint |
| `/account/delete` | Delete account | POPIA compliance work |
| `/help` | FAQs | Static content not authored |
| `/terms` | T&C | Legal review pending |
| `/privacy` | Privacy policy | Legal review pending |
| `/about` | About | Copy not authored |
| `/scan` | Badge scan | BadgeScan model not built |
| `/quiz/[quizId]` | Quiz | Quiz model not built |

---

## Navigation Links Carried Forward

The existing header and bottom nav in `apps/experience` link to these routes (were placeholders; now mapped to canonical screens above):

| Nav Link | Canonical Route | Phase |
|----------|----------------|-------|
| Fixtures | `/matches` | P2 |
| Fantasy | `/fantasy` | P1 |
| Clubs | `/clubs/[slug]` | Outside scope (Club Experience) |
| Account | `/account` | P3 |
| Sign in | `/sign-in` | P3 |
| Join free | `/fantasy/onboarding` | P1 |
| Table | `/stats/standings` | P2 |
| News | `/media` (list) | P2 |
| Video | `/media` (video filter) | P2 |
| Players | `/players` | P2 |
| Fan Value | `/fan-value` | Outside Phase 1-3 |
