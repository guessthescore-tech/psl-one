# apps/experience — Handover Document
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01)

---

## What This App Is

`apps/experience` is the **premium creative frontend** for PSL One. It is a standalone Next.js 15 application at port 3002, separate from the engineering beta at `apps/web`.

It exists to allow visual direction to be prototyped, reviewed, and approved without risking the operational beta.

This app is committed on `feature/fantasy-complete-experience`. It has not been pushed or deployed.

---

## How to Run Locally

```bash
cd apps/experience
pnpm install
pnpm dev
# Open http://localhost:3002
```

Or from the monorepo root:
```bash
pnpm --filter @psl-one/experience dev
```

---

## Data Mode

The app has two modes controlled by `NEXT_PUBLIC_DATA_MODE`:

| Mode | Data source | Trigger |
|------|-------------|---------|
| `DESIGN_REVIEW_DATA` (default) | WC 2026 mock data (8 teams, 5 fixtures, 6 players) | Default, always |
| `LIVE_BETA_DATA` | Same WC 2026 mock + TODO comment for real API | Set env var |

A purple sticky banner appears at the top of the page in `DESIGN_REVIEW_DATA` mode to prevent confusion.

**`LIVE_BETA_DATA` currently still returns mock data.** The TODO comment at `src/lib/data.ts` marks where real API calls must be wired in the provider integration story.

---

## Validation Gates

All gates pass as of the final commit on this branch:

```bash
pnpm --filter @psl-one/experience typecheck   # TypeScript — 0 errors
pnpm --filter @psl-one/experience test        # 366/366 vitest specs
pnpm --filter @psl-one/experience build       # 55 pages, 102 kB first load JS
node scripts/validate-codex-project.mjs       # PASS (0 errors)
node scripts/validate-docs.mjs               # PASS (18/18 checks)
git diff --check apps/experience/            # 0 whitespace errors
```

---

## Coverage: 55 Pages Built

### Fantasy (core journey)
- `/fantasy` — Gameweek hub overview
- `/fantasy/team` — My team, pitch view, captain selector
- `/fantasy/team/transfers` — Transfer market with budget
- `/fantasy/team/chips` — Active chips panel
- `/fantasy/team/fdr` — Fixture difficulty rating table
- `/fantasy/onboarding` — First-time setup flow
- `/fantasy/points` — Gameweek points breakdown (stub)
- `/fantasy/fixtures` — Fantasy fixtures (stub)
- `/fantasy/stats` — Fantasy stats (stub)
- `/fantasy/rules` — Rules page (stub)
- `/fantasy/history` — Gameweek history list
- `/fantasy/history/[gameweekId]` — Individual gameweek detail
- `/fantasy/leagues` — All leagues listing
- `/fantasy/leagues/[leagueId]` — League detail + standings
- `/fantasy/leagues/join` — Join by code
- `/fantasy/leagues/create` — Create a new league

### Matches & Live
- `/matches` — All fixtures calendar
- `/matches/[matchId]` — Live match detail + commentary

### Players
- `/players` — Player pool browser
- `/players/[playerId]` — Player profile
- `/players/[playerId]/stats` — Player stats

### Clubs
- `/clubs` — All clubs grid
- `/clubs/[clubId]` — Club detail

### Media
- `/media` — Media hub
- `/media/[slug]` — Article/video detail

### Account & Auth
- `/account` — Account dashboard
- `/account/profile` — Edit profile
- `/account/notifications` — Notification preferences
- `/account/privacy` — Privacy settings
- `/account/favourite-team` — Favourite team selector
- `/account/delete` — Account deletion (POPIA placeholder)
- `/account/achievements` — Badges and achievements
- `/account/wallet` — Fan Value / points wallet
- `/account/fan-value` — Fan value breakdown
- `/sign-in` — Login
- `/register` — Registration
- `/forgot-password` — Request reset
- `/reset-password` — Set new password

### Social & Prediction
- `/predict` — Prediction game hub (stub)
- `/social` — Social activity feed

### Help & Info
- `/help` — Help centre
- `/help/[slug]` — Help article
- `/quiz/[quizId]` — Football quiz (3 seeded)
- `/scan` — Badge scanner
- `/terms` — Terms & Conditions
- `/privacy` — Privacy Policy

### Stats
- `/stats/standings` — League standings
- `/stats/season` — Season stats
- `/stats/awards` — Awards
- `/stats/hall-of-fame` — Hall of Fame
- `/stats/compare` — Player comparison

---

## Navigation System

### Shell: `FantasyShell`
Wraps all `/fantasy/*` pages. Contains `AppHeader`, `FantasyTabs` (9-tab horizontal nav), and `MobileBottomNav`.

### FantasyTabs (`src/components/fantasy/nav/FantasyTabs.tsx`)
9-tab horizontal scroll bar: Overview, My Team, Points, Transfers, Leagues, Fixtures, Stats, History, Rules.
- `usePathname()` active detection
- `min-h-[44px]` touch target
- Gold active state with focus-visible ring

### MobileBottomNav (`src/components/nav/MobileBottomNav.tsx`)
5-destination bottom nav (framer-motion spring indicator):
- Home `/`, Matches `/matches`, Fantasy `/fantasy`, Predict `/predict`, Profile `/account`

---

## Design Constraints

- All Phosphor icons: `@phosphor-icons/react/dist/ssr` (non-SSR package causes build failures in Next.js 15 static pre-rendering)
- All `useSearchParams()` calls wrapped in `<Suspense>` per Next.js 15 requirement
- `useReducedMotion()` guard in ALL animated components
- `min-h-[44px]` on ALL interactive elements (touch targets)
- `focus-visible:outline-2 focus-visible:outline-exp-gold` focus ring
- Only `transform` / `opacity` animated (no layout props)
- Easing: `[0.16, 1, 0.3, 1]` for entrances

---

## Known Placeholders

| Placeholder | Location | Required action before launch |
|-------------|----------|-------------------------------|
| `picsum.photos` images | `src/lib/data.ts` `expImg()` | Replace with licensed football photography |
| WC 2026 mock data | `src/lib/data.ts` | Replace with PSL provider data after licensing gate |
| `/fantasy/points`, `/fantasy/fixtures`, `/fantasy/stats`, `/fantasy/rules` | stub pages | Build full UI once backend contracts confirmed |
| `/predict` | stub page | Prediction game full UI |

---

## Deferred Issues

| Issue | Priority | Notes |
|-------|----------|-------|
| `ShareAction` bottom sheet no focus trap | LOW | Needs `focus-trap-react` or native `inert` |
| `LIVE_BETA_DATA` returns mock | MEDIUM | TODO comment in `data.ts` — API integration story |
| Vercel deploy not configured for `apps/experience` | MEDIUM | Pending owner approval |
| Focus trap missing in `ShareAction` bottom sheet | LOW | Deferred |

---

## Architecture Decisions

- See `docs/CREATIVE-DIRECTION.md` for full design principles
- See `docs/handover/PSL-ONE-DECISION-LOG.md` for platform decisions
- `apps/web` must remain untouched — all creative changes go here
- This app NEVER imports from `apps/web` — complete isolation is a hard constraint
