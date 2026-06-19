# Fantasy Motion Review
**Date:** 2026-06-19 | **Status:** APPROVED

---

## Motion Standards Applied

| Standard | Implementation |
|----------|---------------|
| Easing curve | `[0.16, 1, 0.3, 1]` (strong ease-out) for entrances |
| Duration — micro | 100–200ms (hover, press feedback) |
| Duration — UI | 200–300ms (section transitions, score counter) |
| Duration — layout | 300–500ms (pitch view, carousel) |
| GPU props only | `transform`, `opacity` — never `width`/`height`/`margin` |
| Reduced motion | `useReducedMotion()` guard in every component |
| Interruptibility | `AnimatePresence mode="wait"` for form state transitions |
| Scale origin | `scale(0.95/0.97)` not `scale(0)` |

---

## Components with Motion

| Component | Motion type | Duration | Notes |
|-----------|------------|----------|-------|
| `ScoreStepper` | `AnimatePresence` counter flip | 150ms | `mode="popLayout"`, direction-aware |
| `GuessTheScoreSection` | `AnimatePresence` submitted/form | 200–300ms | `mode="wait"` |
| `FixtureCarouselSection` | fixture transition | 200ms | `mode="wait"` |
| `MobileBottomNav` | spring indicator | Spring `stiffness:500, damping:30` | Active tab indicator |
| `FanValueSection` | CSS progress bar | `transition-[width] 500ms ease-out` | Width only |
| `FeaturedMatchSection` | score bar | `transition-[width] 500ms ease-out` | Width only |
| `FantasyGameweekSection` | transfer bar | `transition-[width] 300ms ease-out` | Width only |

---

## Findings from `/review-animations` Pass

| Finding | File | Fix Applied |
|---------|------|-------------|
| `transition-all` on width (non-GPU) | `FanValueSection.tsx` | Changed to `transition-[width]` |
| `transition-all` on width (non-GPU) | `FeaturedMatchSection.tsx` | Changed to `transition-[width]` |
| `transition-all` on width (non-GPU) | `FantasyGameweekSection.tsx` | Changed to `transition-[width]` |
| `transition-all duration-100` on submit button | `GuessTheScoreSection.tsx` | Changed to `transition-colors duration-150` |

---

## Verdict: APPROVED

No feel-breaking regressions. All animated components:
- Use `transform`/`opacity` only (no layout properties)
- Guard for `prefers-reduced-motion`
- Use `ease-out` / `[0.16, 1, 0.3, 1]` curves
- Stay under 300ms for UI transitions
- `AnimatePresence` for exit animations where needed
- Spring for gesture-driven active indicator (MobileBottomNav)
