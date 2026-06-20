# STORY-FE-FANTASY-AGENTIC-01 — Handover
**Status:** COMPLETE — visual corrections applied, ready for owner re-review
**Date:** 2026-06-20 (updated: STORY-FE-EXPERIENCE-CORRECTIONS-01)
**Branch:** `feature/fantasy-complete-experience`

---

## What Was Built

Full 40-screen Fantasy journey implemented in `apps/experience` using a 10-agent parallel agentic delivery plan. The complete fan experience now exists as a premium standalone Next.js 15 application.

---

## Final Gate Checks (STORY-FE-EXPERIENCE-CORRECTIONS-01)

| Gate | Result | Notes |
|------|--------|-------|
| `typecheck` | PASS (0 errors) | — |
| `test` | PASS (384/384) | +18 tests for correction coverage |
| `build` | PASS (56 pages, 102 kB first load JS) | No new pages |
| `codex:validate` | PASS (0 errors) | — |
| `docs:validate` | PASS (18/18) | — |
| `git diff --check` | PASS (0 whitespace errors) | — |

## Key Fixes Applied (STORY-FE-EXPERIENCE-CORRECTIONS-01)

| Fix | Files |
|-----|-------|
| `expImg` — SVG data URI placeholder (removed picsum.photos) | `src/lib/data.ts`, `next.config.ts` |
| `FantasyShell.hideFantasyTabs` prop — suppress tabs on wizard/account | `FantasyShell.tsx` |
| Onboarding step-1 coaching content | `fantasy/onboarding/page.tsx` |
| Account pages: `hideFantasyTabs` on all 5 routes | 5 files |
| `/players` responsive grid — `md:grid-cols-2 xl:grid-cols-3` | `players/page.tsx` |
| `FantasyShell` content wrapper `max-w-7xl` cap | `FantasyShell.tsx` |
| `AuthLayout` football tagline | `AuthLayout.tsx` |
| `TeamIdentity` shield badge shape | `TeamIdentity.tsx` |
| `FantasyPitchView` animation timing (0.35→0.25s, 0.07→0.04s stagger) | `FantasyPitchView.tsx` |
| Test suite: 7 new describe blocks, +18 tests | `experience.spec.ts` |

---

## Route Count

| Category | Pages |
|----------|-------|
| Homepage | 1 |
| Fantasy Core + Leagues | 14 |
| Matches | 3 |
| Players | 3 |
| Stats | 5 |
| Media | 2 |
| Account & Auth | 9 |
| Help & Support (SSG) | 14 (11 help + 3 quiz) |
| Static & Legal | 5 |
| **Total prerendered** | **56** |

Dynamic routes (server-rendered on demand, ƒ): `fantasy/history/[gameweekId]`, `fantasy/leagues/[leagueId]`, `fantasy/leagues/[leagueId]/teams/[teamId]`, `matches/[fixtureId]`, `matches/[fixtureId]/motm`, `media/[slug]`, `players/[playerId]`, `players/[playerId]/stats`.

---

## Key Fixes Applied

| Fix | Commit | Files |
|-----|--------|-------|
| Bulk `@phosphor-icons/react` → `/dist/ssr` (DEC-011) | `a40526d` | 28 files |
| `useSearchParams()` in `<Suspense>` for `/sign-in` and `/reset-password` (DEC-012) | `a40526d` | 2 files |
| Dead internal links fixed in homepage sections | reconciliation | 7 sections |
| `/media/page.tsx` added (was missing) | reconciliation | 1 file |
| AppHeader nav fixed: `/fixtures`→`/matches`, `/clubs`→`/players`, `/login`→`/sign-in` | reconciliation | 1 file |
| Dynamic club hrefs fixed: `/clubs/${id}`→`/players` | reconciliation | 2 files |

---

## Components Delivered

### Fantasy Core (Phase 1)
- `FantasyPitchView` — 15-slot pitch with GK/DEF/MID/FWD rows, captain/VC badge overlay
- `TransferPanel` + `PlayerPool` + `PlayerPoolRow` — transfer market with budget indicator
- `ChipSelector` / `ChipCard` — Wildcard, Bench Boost, Triple Captain, Free Hit
- `FixtureDifficultyMatrix` / `FixtureDifficultyCell` — FDR colour grid
- `OnboardingStep` — first-time setup wizard step
- `FormationSelector` — formation picker
- `DeadlineCountdown` — deadline timer display

### Fantasy Leagues
- `LeagueCard`, `LeagueStandingsTable`, `LeagueCreateForm`, `LeagueCodeInput`
- `InviteLeagueSheet`, `ManagerSearch`, `ManagerRow`, `ManagerFilters`
- `RankMovement`, `GameweekHistoryCard`, `FantasyHistoryTimeline`
- `RivalTeamPitchView` — read-only rival manager pitch

### Navigation (Phase 1)
- `FantasyTabs` — 9-tab horizontal scroll bar with `usePathname()` active detection
- `MobileBottomNav` (`nav/MobileBottomNav.tsx`) — framer-motion spring active indicator, 5 destinations
- `FantasyShell` — top-level layout wrapping all `/fantasy/*` pages

### Fantasy Shared Primitives
- `FantasyModal`, `FantasyBottomSheet`, `FantasyActionBar`, `FantasyPageHero`
- `FantasyLoadingState`, `FantasyEmptyState`, `FantasyErrorState`
- `SkeletonCard`, `SkeletonText`, `DesignReviewBanner`

### Football Context (Phase 2)
- `MatchHeader`, `MatchTimeline`, `MatchStatsPanel`, `MatchStateBadge`, `LineupPitch`
- `ManOfTheMatchCard`
- `PlayerProfileHero`, `PlayerStatGrid`, `PlayerGameweekTable`, `PlayerComparison`, `ComparisonMetric`
- `StandingsTable`, `SeasonLeaderboard`, `AwardCard`, `HallOfFameCard`
- `ArticleDetail`, `VideoPlayerShell`

### Account & Auth (Phase 3)
- `AuthLayout`, `AuthTabs` — auth page wrapper
- `AccountNav` — sidebar nav (profile, security, favourite team, delete)
- `ProfileForm`, `PasswordForm`, `FavouriteTeamSelector`, `DeleteAccountDialog`
- `HelpCategoryList`, `HelpArticle`, `LegalDocument`
- `BadgeScannerShell`, `QuizShell`
- `ShareAction`, `ChallengeAction`

**Total: 83 components** across 8 component directories.

---

## Design Decisions

| Decision | ID | Summary |
|----------|----|---------|
| All Phosphor icons use `/dist/ssr` | DEC-011 | Non-SSR package crashes Next.js 15 build |
| `useSearchParams()` must be in `<Suspense>` | DEC-012 | Next.js 15 static pre-rendering requirement |
| WC 2026 mock data | DEC-010 | PSL data not yet licensed |
| Picsum placeholders for all images | DEC-008 | Licensed photography not yet procured |

---

## Scope Not Touched

This story made zero changes to:
- `apps/web` (operational beta)
- `apps/api` (NestJS backend)
- Prisma schema or migrations
- Terraform / AWS / IAM
- Seeds or database state

---

## Owner Review

See `apps/experience/docs/FANTASY-OWNER-REVIEW-GUIDE.md` for the route-by-route review checklist and acceptance criteria.
