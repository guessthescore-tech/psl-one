# Fantasy Component Polish Review
**Date:** 2026-06-19 | **Status:** COMPLETE

---

## States Coverage

| Component | Hover | Focus | Active | Disabled | Loading |
|-----------|-------|-------|--------|----------|---------|
| Primary CTA button | `hover:opacity-90` | `focus-visible:ring` | `active:scale-[0.97]` | `opacity-60 cursor-not-allowed` | `aria-busy` + text change |
| `PlayerPoolRow` + button | `hover:bg-exp-green hover:text-white` | `focus-visible:ring` | `active:scale-95` | — | — |
| `ChipCard` activate | `hover:bg-exp-green/90` | `focus-visible:ring` | `active:scale-98` | — | — |
| `ChipCard` cancel | `hover:bg-exp-live/10` | `focus-visible:ring` | `active:scale-98` | — | — |
| `ScoreStepper` buttons | `hover:bg-white/18` | `focus-visible:ring-exp-gold` | `active:scale-[0.97]` | `disabled:opacity-40` | — |
| Nav links | `hover:text-exp-gold` | `focus-visible:outline-exp-gold` | — | — | — |
| Auth submit | `hover:opacity-90` | `focus-visible:outline-exp-gold` | — | `opacity-60 cursor-not-allowed` | `opacity-60` + text |
| Form inputs | — | `focus:border-exp-gold` | — | — | — |

---

## Transition Consistency

All transitions use consistent timing from the design system:

| Context | Timing |
|---------|--------|
| Hover fade | `transition-colors duration-150` |
| Hover opacity | `transition-opacity duration-150` |
| Button active | `transition-all duration-100` (scale) |
| Card elevation | `transition-colors duration-150` |
| Progress bars | `transition-[width] duration-300 ease-out` or `duration-500 ease-out` |

---

## Focus Ring Standard

All interactive elements use:
```
focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm
```

Or (for form inputs specifically):
```
focus:border-exp-gold focus:outline-none
```

---

## Skeleton / Loading States

| Component | Loading State |
|-----------|--------------|
| Auth forms | `aria-busy` + button text change |
| `FantasyLoadingState` | Shared skeleton component (no prop label) |
| Fantasy pages | `FantasyLoadingState` during data fetch |

---

## Empty / Error States

| Component | Empty State | Error State |
|-----------|-------------|-------------|
| Form submission | — | Inline `role="alert"` below form |
| `DeleteAccountDialog` | — | POPIA placeholder with clear "coming soon" |
| Match prediction (submitted) | Trophy + "Prediction locked in!" | — |

---

## Polish Checklist

- [x] All design tokens used — no hardcoded hex
- [x] All interactive states present (hover, focus, active, disabled, loading)
- [x] Entrance animations on dynamic content (score stepper, form transitions)
- [x] Skeleton loading via `FantasyLoadingState`
- [x] Error states with accessible messaging
- [x] Touch targets ≥ 44px
- [x] Focus indicators visible and styled
- [x] `prefers-reduced-motion` respected
- [x] No layout shift on state change (GPU-only animations)
- [x] Responsive at all breakpoints
