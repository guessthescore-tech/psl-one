# apps/experience — Handover Document
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01 — final reconciliation)

---

## What This App Is

`apps/experience` is the **premium creative frontend** for PSL One. It is a standalone Next.js 15 application at port 3002, separate from the engineering beta at `apps/web`.

It exists to allow visual direction to be prototyped, reviewed, and approved without risking the operational beta.

This app is committed on `feature/fantasy-complete-experience`. It has not been pushed or deployed.

---

## How to Run Locally

```bash
git checkout feature/fantasy-complete-experience
pnpm --filter @psl-one/experience dev
# Open http://localhost:3002
```

Or from within `apps/experience`:
```bash
pnpm dev
```

---

## Data Mode

| Mode | Data source | Trigger |
|------|-------------|---------|
| `DESIGN_REVIEW_DATA` (default) | WC 2026 mock (8 teams, 5 fixtures, 6 players) | Default — always active unless overridden |
| `LIVE_BETA_DATA` | Same WC 2026 mock + TODO comment for real API | `NEXT_PUBLIC_DATA_MODE=LIVE_BETA_DATA` |

A purple sticky banner appears in `DESIGN_REVIEW_DATA` mode to prevent confusion during reviews.

**`LIVE_BETA_DATA` still returns mock data.** The TODO comment in `src/lib/data.ts` marks where real API calls must be wired in the provider integration story.

---

## Validation Gates (all pass)

```bash
pnpm --filter @psl-one/experience typecheck   # 0 TypeScript errors
pnpm --filter @psl-one/experience test        # 366/366 vitest specs
pnpm --filter @psl-one/experience build       # 56 pages, 102 kB first load JS
node scripts/validate-codex-project.mjs       # PASS (0 errors)
node scripts/validate-docs.mjs               # PASS (18/18 checks)
git diff --check apps/experience/            # 0 whitespace errors
```

---

## Coverage: 56 Pages Built

### Route Classification

| Code | Meaning |
|------|---------|
| `STATIC` | Prerendered, no dynamic params |
| `DYNAMIC` | Server-rendered on demand (`ƒ`) |
| `SSG` | Prerendered via `generateStaticParams` |
| `STUB` | Exists as shell; content pending |

### Homepage

| Route | Type | Notes |
|-------|------|-------|
| `/` | STATIC | 13 homepage sections — WC 2026 mock data |

### Fantasy Core

| Route | Type | Notes |
|-------|------|-------|
| `/fantasy` | STATIC | Gameweek hub; points, captain, transfers card |
| `/fantasy/team` | STATIC | 15-player pitch view; captain/VC badges |
| `/fantasy/team/transfers` | STATIC | Transfer market with budget indicator |
| `/fantasy/team/chips` | STATIC | 4 chip types with Phosphor icons |
| `/fantasy/fixture-difficulty` | STATIC | FDR colour grid |
| `/fantasy/onboarding` | STATIC | 4-step first-time setup wizard |
| `/fantasy/history` | STATIC | Gameweek history list |
| `/fantasy/history/[gameweekId]` | DYNAMIC | Gameweek detail |
| `/fantasy/search` | STATIC | Manager/player search |
| `/fantasy/points` | STATIC | STUB |
| `/fantasy/fixtures` | STATIC | STUB |
| `/fantasy/stats` | STATIC | STUB |
| `/fantasy/rules` | STATIC | STUB |

### Leagues

| Route | Type | Notes |
|-------|------|-------|
| `/fantasy/leagues` | STATIC | All leagues listing |
| `/fantasy/leagues/[leagueId]` | DYNAMIC | League detail + standings |
| `/fantasy/leagues/[leagueId]/teams/[teamId]` | DYNAMIC | Rival manager pitch view |
| `/fantasy/leagues/create` | STATIC | Create league form |
| `/fantasy/leagues/join` | STATIC | Join by code |

### Matches & Live

| Route | Type | Notes |
|-------|------|-------|
| `/matches` | STATIC | Fixture calendar |
| `/matches/[fixtureId]` | DYNAMIC | Match detail + timeline + lineups |
| `/matches/[fixtureId]/motm` | DYNAMIC | Man of the Match vote |

### Players

| Route | Type | Notes |
|-------|------|-------|
| `/players` | STATIC | Player pool browser with filters |
| `/players/[playerId]` | DYNAMIC | Player profile hero + stats |
| `/players/[playerId]/stats` | DYNAMIC | Full player gameweek stats table |

### Stats

| Route | Type | Notes |
|-------|------|-------|
| `/stats/standings` | STATIC | League/group standings |
| `/stats/season` | STATIC | Season-level stats |
| `/stats/awards` | STATIC | Awards page |
| `/stats/hall-of-fame` | STATIC | Hall of Fame |
| `/stats/compare` | STATIC | Two-player comparison |

### Media

| Route | Type | Notes |
|-------|------|-------|
| `/media` | STATIC | Media hub — articles + video grid |
| `/media/[slug]` | DYNAMIC | Article or video detail |

### Prediction

| Route | Type | Notes |
|-------|------|-------|
| `/predict` | STATIC | STUB — prediction game entry |

### Account & Auth

| Route | Type | Notes |
|-------|------|-------|
| `/sign-in` | STATIC | Auth form; `useSearchParams` in `<Suspense>` |
| `/register` | STATIC | Registration form |
| `/forgot-password` | STATIC | Password reset request |
| `/reset-password` | STATIC | Set new password; `useSearchParams` in `<Suspense>` |
| `/account` | STATIC | Account dashboard |
| `/account/profile` | STATIC | Edit display name |
| `/account/security` | STATIC | Change password |
| `/account/favourite-team` | STATIC | Favourite team selector |
| `/account/delete` | STATIC | POPIA deletion placeholder (MISSING_BACKEND) |

### Help & Support

| Route | Type | Notes |
|-------|------|-------|
| `/help` | STATIC | Help category list |
| `/help/[slug]` | SSG (11 paths) | Help article detail |
| `/quiz/[quizId]` | SSG (3 paths) | Football quiz |
| `/scan` | STATIC | Badge scanner shell |

### Legal & About

| Route | Type | Notes |
|-------|------|-------|
| `/terms` | STATIC | Terms & Conditions |
| `/privacy` | STATIC | Privacy Policy |
| `/about` | STATIC | About PSL One |

---

## Routes NOT Built (documented gaps)

The following routes were in scope per FANTASY-USER-JOURNEY.md but are not built in this story:

| Route | Reason not built |
|-------|-----------------|
| `/clubs` | No club detail pages — users directed to `/players` |
| `/clubs/[clubId]` | No club detail API contract |
| `/social` | Social feed requires backend social module API |
| `/account/notifications` | No notification preferences API |
| `/account/achievements` | No achievements API wired |
| `/account/wallet` | Fan Value is non-financial; wallet UI deferred |

---

## Navigation System

### Shell: `FantasyShell`
Wraps all `/fantasy/*` pages and non-homepage pages that use the standard layout. Contains `AppHeader`, `FantasyTabs` (9-tab), and `MobileBottomNav`.

### AppHeader (desktop nav)
5 destinations: Home `/`, Matches `/matches`, Fantasy `/fantasy`, Players `/players`, Account `/account`.

### FantasyTabs
9-tab horizontal scroll: Overview, My Team, Points, Transfers, Leagues, Fixtures, Stats, History, Rules.
- `usePathname()` active detection, `min-h-[44px]`, gold active state.

### MobileBottomNav
5-destination bottom nav with framer-motion spring active indicator:
Home, Matches, Fantasy, Predict, Profile.

---

## Design Constraints

- **Phosphor icons**: ALL imports use `@phosphor-icons/react/dist/ssr` (bare package crashes Next.js 15 SSR)
- **`useSearchParams()`**: wrapped in `<Suspense>` at all call sites (Next.js 15 requirement)
- **`useReducedMotion()`**: guard in ALL animated components
- **Touch targets**: `min-h-[44px]` on ALL interactive elements
- **Focus ring**: `focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2`
- **GPU animations**: only `transform` / `opacity` — no layout properties
- **Easing**: `[0.16, 1, 0.3, 1]` for all entrance transitions

---

## Known Placeholders

| Placeholder | Location | Required action before launch |
|-------------|----------|-------------------------------|
| `picsum.photos` images | `src/lib/data.ts:expImg()` | Replace with licensed football photography |
| WC 2026 mock data | `src/lib/data.ts` | Replace with PSL provider data after licensing gate |
| `LIVE_BETA_DATA` returns mock | `src/lib/data.ts` (TODO) | Wire real API calls in provider integration story |

---

## Owner Review

See `apps/experience/docs/FANTASY-OWNER-REVIEW-GUIDE.md` for the route-by-route review checklist.

See `apps/experience/docs/FANTASY-ROUTE-MATRIX.md` for the authoritative route truth table.
