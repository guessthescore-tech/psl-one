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

The app runs in `DESIGN_REVIEW_DATA` mode by default — a purple banner confirms this. All data is mock WC 2026 data. Authentication is simulated (any credentials work).

---

## Review Checklist by Phase

### Phase 1 — Fantasy Core

| Screen | URL | What to Check |
|--------|-----|---------------|
| Fantasy Hub | `/fantasy` | Gameweek summary, points display, captain, transfers remaining |
| My Team / Pitch View | `/fantasy/team` | 15-player pitch layout, captain badge (C), position rows |
| Transfer Market | `/fantasy/team/transfers` | Budget display, position filter, player pool rows, add button |
| Chips | `/fantasy/team/chips` | 4 chip types, icons, activate/cancel buttons |
| FDR | `/fantasy/team/fdr` | Fixture difficulty colour grid |
| Onboarding | `/fantasy/onboarding` | 4-step first-time setup wizard |
| History | `/fantasy/history` | Gameweek history list |
| Leagues | `/fantasy/leagues` | League list with standings |
| League Detail | `/fantasy/leagues/[id]` | Manager ranking, standing table |

### Phase 2 — Research & Football Context

| Screen | URL | What to Check |
|--------|-----|---------------|
| Fixtures | `/matches` | Full fixture calendar |
| Live Match | `/matches/[id]` | Match detail, commentary feed |
| Player Browser | `/players` | Position-filtered player pool |
| Player Profile | `/players/[id]` | Stats, club crest, position |
| Club List | `/clubs` | All 8 WC 2026 clubs |
| Club Detail | `/clubs/[id]` | Squad, stats |
| Media Hub | `/media` | Articles, video thumbnails |
| Stats: Standings | `/stats/standings` | Group/league table |
| Stats: Season | `/stats/season` | Season-level stats |

### Phase 3 — Account & Support

| Screen | URL | What to Check |
|--------|-----|---------------|
| Sign In | `/sign-in` | Form, error state, show/hide password |
| Register | `/register` | Form, POPIA disclaimer |
| Account Dashboard | `/account` | Navigation links, profile summary |
| Edit Profile | `/account/profile` | Name/avatar fields |
| Notifications | `/account/notifications` | Toggle preferences |
| Favourite Team | `/account/favourite-team` | Team selector grid |
| Achievements | `/account/achievements` | Badge grid |
| Wallet | `/account/wallet` | Fan Value balance (non-financial disclaimer) |
| Privacy | `/account/privacy` | POPIA rights summary |
| Delete Account | `/account/delete` | POPIA deletion placeholder |
| Help | `/help` | Help category list |
| Terms | `/terms` | Terms and conditions |
| Privacy Policy | `/privacy` | Privacy policy |

---

## Design Review Checklist

### Motion
- [ ] Page transitions feel intentional (not jarring)
- [ ] Score stepper counter animates smoothly
- [ ] Prediction submission state transition
- [ ] FantasyTabs scrolls smoothly on mobile-width viewport

### Touch & Interaction
- [ ] All buttons are at least 44px tall (confirmed)
- [ ] Bottom nav active indicator animates to new tab
- [ ] Transfer market row shows + icon with hover state
- [ ] Chip card active state visually distinct

### Accessibility
- [ ] Tab through sign-in form — all fields focusable, focus ring visible
- [ ] Score stepper announces value changes (aria-live)
- [ ] Tab through fixture selector dots

### Responsive
- [ ] Homepage renders correctly at 390px (iPhone 14 Pro)
- [ ] `/fantasy/team` pitch view at 390px
- [ ] FantasyTabs scrolls horizontally at 390px
- [ ] MobileBottomNav appears at mobile widths

---

## Non-Financial Compliance Spots

Every gambling-adjacent surface carries a disclaimer. Verify:
- Homepage `GuessTheScoreSection` footer: "Points only - no real money - no financial value"
- `/fantasy/*` pages: same disclaimer
- `/account/wallet`: "Fan value is a non-financial points score"
- `/register` page: no betting/odds/wagering language

---

## What Is Intentionally Incomplete

| Item | Status | Why |
|------|--------|-----|
| `/fantasy/points` | Stub page | Backend contract pending |
| `/fantasy/fixtures` | Stub page | Duplicate of `/matches` until design confirmed |
| `/fantasy/stats` | Stub page | Backend contract pending |
| `/fantasy/rules` | Stub page | Content from Product pending |
| `/predict` | Stub page | Full prediction game UI in next story |
| Images | `picsum.photos` | Licensed photography required before public launch |
| Live data | WC 2026 mock | Provider licensing gate not yet cleared |

---

## Owner Sign-Off

Once satisfied with the visual review:

1. Confirm: **APPROVED for push and PR creation** — or — list specific changes needed
2. The branch will be pushed and a PR opened against `main`
3. No merge until owner explicitly approves
