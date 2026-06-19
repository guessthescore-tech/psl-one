# STORY-FE-PREMIUM-01 — Owner Review Evidence

**Product:** PSL One Premium Frontend (`apps/experience`)
**Review date:** 2026-06-19
**Status:** READY FOR OWNER REVIEW — stopped before commit/push/deploy

---

## 1. Validation Gate Results

| Check | Result |
|---|---|
| `pnpm --filter @psl-one/experience typecheck` | PASS (0 errors) |
| `pnpm --filter @psl-one/experience test` | PASS (81/81) |
| `pnpm --filter @psl-one/experience build` | PASS (static, standalone, 154 kB first load JS) |
| `pnpm codex:validate` | PASS (0 errors, 0 warnings) |
| `pnpm docs:validate` | PASS (18/18 checks) |
| `git diff --check HEAD` | PASS (no trailing whitespace) |

---

## 2. Deliverables

### 2.1 Standalone Next.js App

| File | Status |
|---|---|
| `apps/experience/package.json` — name `@psl-one/experience`, port 3002, Next.js 15.5.18 | DONE |
| `apps/experience/tsconfig.json` — extends monorepo base | DONE |
| `apps/experience/next.config.ts` — standalone output, picsum.photos domains | DONE |
| `apps/experience/tailwind.config.ts` — full `exp-*` design token set | DONE |
| `apps/experience/postcss.config.js` | DONE |
| `apps/experience/vitest.config.ts` | DONE |
| `apps/experience/docs/CREATIVE-DIRECTION.md` | DONE |

### 2.2 Design System Tokens (tailwind.config.ts)

| Category | Tokens |
|---|---|
| Colours | void, navy, navy-2, ink, gold, gold-2, green, green-2, blue, live, surface, card, muted, border, border-dk |
| Typography | display-2xl thru display-sm, body-lg/md/sm, label-lg/md/sm, score-xl/lg/md, stat-xl/md |
| Radii | card (14px), card-sm (10px), card-xs (8px), pill (100px) |
| Shadows | card, card-md, card-lg, card-xl, glow-gold, glow-green, inner-top, inner-glow |
| Keyframes | live-pulse, shimmer, slide-up, fade-in, ticker-left |

### 2.3 16 Base Components

| Component | File | Key feature |
|---|---|---|
| AppHeader | `shell/AppHeader.tsx` | Sticky dark, wordmark, desktop nav |
| MobileBottomNav | `shell/MobileBottomNav.tsx` | 5 tabs, spring indicator, pb-safe, useReducedMotion |
| MatchweekNav | `shell/MatchweekNav.tsx` | Prev/Next, direction-aware transition |
| SectionHeader | `ui/SectionHeader.tsx` | title, subtitle, optional link, dark variant |
| FixtureCard | `ui/FixtureCard.tsx` | live/finished/scheduled, dual-colour bar, stagger |
| FixtureCarousel | `sections/FixtureCarouselSection.tsx` | scroll-snap rail with desktop controls |
| TeamIdentity | `ui/TeamIdentity.tsx` | 4 sizes, colour badge, optional name |
| PlayerPortrait | `ui/PlayerPortrait.tsx` | compact + full variants, stats grid |
| LeagueTable | `ui/LeagueTable.tsx` | CSS grid, zone colours, form dots |
| EditorialStory | `ui/EditorialStory.tsx` | featured + compact variants |
| VideoCard | `ui/VideoCard.tsx` | snap-card, play overlay, duration + category badges |
| SponsorMoment | `ui/SponsorMoment.tsx` | picsum bg, transparency label, disclaimer |
| GameEntryCard | `ui/GameEntryCard.tsx` | predict/fantasy/challenge, disclaimer, whileTap |
| ShareAction | `actions/ShareAction.tsx` | AnimatePresence bottom sheet, WhatsApp/X/Copy, role=dialog |
| ChallengeAction | `actions/ChallengeAction.tsx` | compact + full, Sword icon |
| ExperienceShell | `app/layout.tsx` | Outfit+JetBrains fonts, AppHeader+MobileBottomNav |

### 2.4 Data Modes

| Mode | Source | Trigger |
|---|---|---|
| `DESIGN_REVIEW_DATA` | WC 2026 mock (8 teams, 5 fixtures, 6 players, 5 stories, 5 videos) | Default |
| `LIVE_BETA_DATA` | Same WC mock with TODO comment for API wiring | `NEXT_PUBLIC_DATA_MODE=LIVE_BETA_DATA` |

Purple sticky banner appears in DESIGN_REVIEW_DATA mode.

### 2.5 Flagship Homepage at `/` - 13 Sections

| # | Section | Layout | Surface |
|---|---|---|---|
| 1 | MatchweekHeroSection | Full-bleed immersive, asymmetric 2-col | dark void |
| 2 | FixtureCarouselSection | Horizontal scroll-snap rail | light surface |
| 3 | FeaturedMatchSection | Centred dark, stat bars, CTAs | dark void |
| 4 | GuessTheScoreSection | Narrow card, score steppers with AnimatePresence flip | dark navy |
| 5 | LeagueTableSection | Data table, zone legend | light surface |
| 6 | FantasyGameweekSection | 3-col card grid | dark ink |
| 7 | PlayerSpotlightSection | Asymmetric portrait + ranked list | dark void |
| 8 | EditorialGridSection | Featured 1+4 grid | white |
| 9 | VideoRailSection | Horizontal scroll-snap video rail | dark navy |
| 10 | ClubIdentitySection | Horizontal scroll badge rail | white |
| 11 | SponsorSection | Full-bleed sponsor moment | light surface |
| 12 | FanValueSection | Progress bars, level badge | dark navy-2 |
| 13 | MyClubSection | Club stats card + next fixture | light surface |

---

## 3. Test Coverage (81 tests)

- package.json config (4)
- Shell components exist (3)
- UI components exist (9)
- Action components exist (2)
- Homepage sections exist (13)
- App files exist (3)
- data.ts exports (11)
- Non-financial disclaimers on game surfaces (6)
- No gambling language (3)
- Touch target compliance min-h-[44px] (4)
- aria-labels on icon-only buttons (2)
- safe-area-inset usage (2)
- min-h-[100dvh] not h-screen (2)
- useReducedMotion on animated components (4)
- tailwind.config.ts token presence (10)
- CREATIVE-DIRECTION.md exists (1)
- next.config.ts standalone + picsum (2)

---

## 4. Security & Compliance

| Constraint | Status |
|---|---|
| No real-money references | PASS - disclaimers on all 6 game surfaces |
| No gambling language | PASS - verified by test |
| apps/api not modified | PASS |
| apps/web not modified | PASS |
| Terraform/IAM not modified | PASS |
| Schema/migrations not touched | PASS |
| PSL season not activated | PASS |

---

## 5. Design Quality

**Design Dials:** DESIGN_VARIANCE: 8 / MOTION_INTENSITY: 7 / VISUAL_DENSITY: 6

**Design Read:** Premium football product homepage for SA fans and international audience, football-first immersive editorial language

**Key choices:**
- Outfit (not Inter) per design-taste-frontend anti-default rule
- `exp-*` colour prefix to avoid conflicts with apps/web
- Asymmetric hero (anti-center-bias) - data left, featured fixture right
- 8 distinct layout families across 13 sections
- Emil Kowalski motion: scale(0.95) not scale(0), ease-out enter, springs for nav indicator
- active:scale-[0.97] on all CTAs
- Africa represented in WC 2026 data (Morocco, including Hakimi in top players)

---

## 6. Constraints Respected

- No deployment
- No commit or push
- No apps/web modifications
- No API changes
- No Terraform or IAM changes
- No schema or migration changes
- No PSL activation
- No real-money functionality
- LIVE_BETA_DATA API wiring deferred (TODO comment in data.ts)

---

## 7. To Preview Locally

```bash
cd apps/experience
pnpm dev
# Open http://localhost:3002
```
