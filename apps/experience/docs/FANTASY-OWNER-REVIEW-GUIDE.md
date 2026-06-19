# Fantasy Experience — Owner Review Guide
**Date:** 2026-06-19
**Branch:** `feature/fantasy-complete-experience`

---

## Setup

```bash
git checkout feature/fantasy-complete-experience
pnpm --filter @psl-one/experience dev
# Open http://localhost:3002
```

The app runs in `DESIGN_REVIEW_DATA` mode by default — a **purple banner at the top** confirms this. All data is mock WC 2026 data. Authentication is simulated (any credentials are accepted).

---

## What You Are Reviewing

This is a visual and UX design review. You are NOT reviewing:
- Backend functionality (all data is mock)
- Authentication (all forms work with any input)
- Real PSL data (WC 2026 placeholder data is used)

You ARE reviewing:
- Does each page render correctly?
- Does navigation feel intuitive?
- Are the design language and visual hierarchy correct?
- Are touch targets large enough on mobile?
- Does the Fantasy journey flow make sense end-to-end?

---

## Review Checklist by Phase

### Phase 1 — Fantasy Core

| Screen | URL | What to Check |
|--------|-----|---------------|
| Fantasy Hub | `/fantasy` | Gameweek summary card, points display, captain name, transfers remaining counter |
| My Team — Pitch View | `/fantasy/team` | 15-player pitch layout, captain badge (C), vice-captain badge (VC), position rows (GK/DEF/MID/FWD), bench row |
| Transfer Market | `/fantasy/team/transfers` | Budget display, position filter tabs, player pool rows (G·A stats), add button |
| Chips Panel | `/fantasy/team/chips` | 4 chip types (Wildcard, Bench Boost, Triple Captain, Free Hit), icons, activate state |
| Fixture Difficulty | `/fantasy/fixture-difficulty` | Colour grid, team names, difficulty scale |
| Onboarding | `/fantasy/onboarding` | 4-step wizard flow, progress indicator |
| History | `/fantasy/history` | Gameweek history list |
| League List | `/fantasy/leagues` | My leagues listing |
| League Detail | `/fantasy/leagues/[id]` | Manager ranking, standings table, rank movement arrows |
| Join League | `/fantasy/leagues/join` | Code entry input, join button |
| Create League | `/fantasy/leagues/create` | Name field, public/private toggle, create button |

### Phase 2 — Research & Football Context

| Screen | URL | What to Check |
|--------|-----|---------------|
| Fixtures Calendar | `/matches` | Match cards, status badges (LIVE/FT/Scheduled), scores |
| Match Detail | `/matches/mock-1` | Score header, timeline events, lineups pitch, match stats panel |
| Player Browser | `/players` | Position filter tabs, player cards, photo, position badge |
| Player Profile | `/players/p1` | Hero section, career stats grid, club crest |
| Player Stats Detail | `/players/p1/stats` | GW-by-GW stats table, back navigation |
| Player Compare | `/stats/compare` | Side-by-side metric comparison |
| Media Hub | `/media` | Article grid, video rail, thumbnails |
| Media Article | `/media/s1` | Article content, headline, body |
| Video Detail | `/media/v1` | Video player shell, title |
| Stats: Standings | `/stats/standings` | Standings table with form dots |
| Stats: Season | `/stats/season` | Season-level aggregate stats |
| Stats: Awards | `/stats/awards` | Award display cards |
| Stats: Hall of Fame | `/stats/hall-of-fame` | Hall of fame entries |

### Phase 3 — Account & Support

| Screen | URL | What to Check |
|--------|-----|---------------|
| Sign In | `/sign-in` | Form layout, show/hide password, sign-in link |
| Register | `/register` | Form fields, POPIA disclaimer, terms link |
| Forgot Password | `/forgot-password` | Email field, submit feedback |
| Account Dashboard | `/account` | Nav links to profile/security/team/delete, profile summary |
| Edit Profile | `/account/profile` | Display name field, save button |
| Change Password | `/account/security` | Old/new/confirm fields |
| Favourite Team | `/account/favourite-team` | Team selector grid with crests |
| Delete Account | `/account/delete` | POPIA message, placeholder (backend not built) |
| Help Centre | `/help` | Category cards grid |
| Help Article | `/help/fixture-locked` | Article content, navigation back |
| Badge Scanner | `/scan` | Scanner UI shell |
| Quiz | `/quiz/wc2026-group-stage` | Question + answer options |
| Terms | `/terms` | Legal document layout |
| Privacy | `/privacy` | Legal document layout |
| About | `/about` | About page |

### Navigation & Shell

| Element | Where to Find | What to Check |
|---------|--------------|---------------|
| `AppHeader` (desktop) | Any page, wide viewport | Wordmark, 5 nav items (Home/Matches/Fantasy/Players/Account), Sign in + Join links |
| `MobileBottomNav` | Any page, narrow viewport | 5 tabs (Home/Matches/Fantasy/Predict/Profile), spring active indicator |
| `FantasyTabs` | Any `/fantasy/*` page | 9 tabs horizontally scrollable, gold active state |
| Design Review Banner | Top of all pages | Purple banner confirming DESIGN_REVIEW_DATA mode |

---

## Stub Pages (Intentionally Incomplete)

These pages exist but show "coming soon" content. They are NOT bugs:

| Route | Why it's a stub |
|-------|----------------|
| `/fantasy/points` | Awaiting backend Gameweek scoring API contract |
| `/fantasy/fixtures` | UX decision pending: merge with `/matches` or separate page? |
| `/fantasy/stats` | Awaiting backend fantasy stats API contract |
| `/fantasy/rules` | Awaiting rules content from Product team |
| `/predict` | Full prediction game UI is a separate story |

---

## Routes NOT Built in This Story

| Route | Status | Why |
|-------|--------|-----|
| `/clubs` | Not built | No club detail API contract; users go to `/players` |
| `/social` | Not built | Requires backend social activity feed module |
| `/account/notifications` | Not built | No notification preferences API |
| `/account/achievements` | Not built | Achievements API not wired in experience layer |
| `/account/wallet` | Not built | Fan Value wallet UI deferred to separate story |

---

## Acceptance Criteria

Before approving this story for push/merge, the owner should confirm:

- [ ] Fantasy pitch layout is visually correct (formation rows, captain/VC badges, bench)
- [ ] Transfer market player cards are readable on mobile
- [ ] Navigation tabs (desktop header + mobile bottom nav + fantasy tabs) work correctly
- [ ] Auth forms (sign-in, register) render cleanly and have no layout issues
- [ ] DESIGN_REVIEW_DATA purple banner is visible and not obstructive
- [ ] Stub pages are clearly labelled ("coming soon") — not blank or broken
- [ ] Match detail page renders with score header, timeline, and lineup pitch
- [ ] Player profile renders with hero image, stats grid, and back navigation
- [ ] Media hub shows articles and video thumbnails

---

## After Review

If changes are needed: list specific routes and what to change. Engineering will implement before push.

If approved:
```bash
git push -u origin feature/fantasy-complete-experience
# Then create PR via: gh pr create
```

Pushing the branch does NOT deploy anything. Vercel is not configured for `apps/experience`. No deployment occurs until the owner approves a merge to `main`.
