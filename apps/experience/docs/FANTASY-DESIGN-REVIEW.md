# Fantasy Design Review
**Date:** 2026-06-20 | **Status:** PASS — visual corrections applied (STORY-FE-EXPERIENCE-CORRECTIONS-01)

---

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `exp-void` | `#060d19` | Page background |
| `exp-navy` | `#0d1b2e` | Section alternating background |
| `exp-navy-2` | `#1b3a6b` | Card / elevated surface |
| `exp-ink` | Card backgrounds | Form / panel backgrounds |
| `exp-gold` | `#e6aa00` | Primary accent — active states, CTAs |
| `exp-green` | `#00843d` | Submit actions, success, active pill |
| `exp-live` | `#ef4444` | Live match indicator, warnings |
| `exp-muted` | — | Secondary text |
| `exp-border-dk` | — | Subtle borders |

---

## Polish Applied (STORY-FE-FANTASY-AGENTIC-01)

### Em-dash elimination
- `title="PSL One — Terms..."` → `title="PSL One: Terms..."`
- `title="PSL One — Privacy..."` → `title="PSL One: Privacy..."`
- `MatchweekHeroSection` separator: `—` → `·`

### Emoji icon replacement
- `ChipCard` CHIP_META: emoji fields → Phosphor icons (`ArrowsCounterClockwise`, `ArrowFatLineUp`, `Star`, `Crosshair`)
- `PlayerPoolRow`: `⚽ {goals} 🅰 {assists}` → `G {goals} · A {assists}`; `+` text → `<Plus>` icon

### GPU-safe transitions (no layout props)
- `FixtureCarouselSection.tsx`: `transition-all` → `transition-[width]`
- `FanValueSection.tsx`: `transition-all` → `transition-[width]`
- `FantasyGameweekSection.tsx`: `transition-all` → `transition-[width]`
- `GuessTheScoreSection.tsx`: `transition-all` → `transition-colors`

### Hover / active states
- `PlayerPoolRow` + button: `hover:bg-exp-green hover:text-white active:scale-95`
- `ChipCard` cancel: `hover:bg-exp-live/10 active:scale-98`
- `ChipCard` activate: `hover:bg-exp-green/90 active:scale-98`

---

## Anti-Slop Checks

- No AI-purple gradients — uses gold/green/void system
- No centered hero — homepage uses asymmetric split layouts
- No emoji as icons in final code (all replaced with Phosphor)
- One accent color per section (gold for engagement, green for actions, live-red for active match)
- Corner radius consistent: `rounded-card` (cards), `rounded-pill` (badges/chips), `rounded-card-sm` (inputs/buttons)
- Phosphor icons at consistent weight: `bold` for action icons, `fill` for decorative

---

## Corrections Applied (STORY-FE-EXPERIENCE-CORRECTIONS-01)

| Correction | Detail |
|-----------|--------|
| Image placeholders | `picsum.photos` replaced with football-branded SVG data URIs; 6 category types (player, stadium, video, editorial, club, generic) with deterministic club-color gradients |
| `FantasyTabs` on onboarding | Hidden via `hideFantasyTabs` prop on `FantasyShell`; was appearing mid-wizard |
| `FantasyTabs` on account pages | Hidden on all 5 account pages (`/account`, `/profile`, `/security`, `/favourite-team`, `/delete`) |
| Onboarding step-1 coaching | 4-card coaching panel added: Pick 15 players / Earn points / Compete / Manage transfers |
| Desktop multi-column layout | `/players` upgraded to `md:grid-cols-2 xl:grid-cols-3`; `FantasyShell` wrapper gets `max-w-7xl` |
| Sign-in football tagline | `"The digital home of South African football"` subtitle added below PSL One logo |
| Club badge shape | `TeamIdentity` uses CSS shield border-radius `rounded-[28%_28%_50%_50%/20%_20%_40%_40%]` |
| Pitch animation timing | Stagger reduced: `0.35s/0.07s` → `0.25s/0.04s`; last row at ~370ms (was ~560ms) |

---

## What Needs Owner Sign-Off

- Photography: SVG data URIs are structural placeholders — needs licensed football photography
- Typography: `Geist` (default) — confirm this is the right brand font choice
- `exp-gold` hue: double-check against PSL One brand guidelines
