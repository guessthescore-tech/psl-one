# apps/experience — Route Inventory
**Last updated:** 2026-06-19 (STORY-FE-PREMIUM-01A)

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

## Navigation Links (not yet routed)

The header and bottom nav include links to these routes, which do not yet have pages:

| Route | Context |
|-------|---------|
| `/fixtures` | Fixtures list |
| `/predict` | Prediction game |
| `/fantasy` | Fantasy management |
| `/clubs` | Club directory |
| `/clubs/:id` | Club detail |
| `/account` | User account |
| `/login` | Sign in |
| `/register` | Join free |
| `/table` | Full standings |
| `/news` | All stories |
| `/video` | All videos |
| `/players` | All players |
| `/profile/fan-value` | Fan value breakdown |
| `/fantasy/transfers` | Transfer management |
| `/predict?fixture=:id` | Predict specific fixture |

These routes return Next.js 404 currently. They are design placeholders for future story implementation.
