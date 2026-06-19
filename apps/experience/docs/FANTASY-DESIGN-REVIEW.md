# Fantasy Design Review
**Date:** 2026-06-19 | **Status:** PASS — design polish complete

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

## What Needs Owner Sign-Off

- Photography: `picsum.photos` placeholder — needs licensed football photography
- Typography: `Geist` (default) — confirm this is the right brand font choice
- `exp-gold` hue: double-check against PSL One brand guidelines
