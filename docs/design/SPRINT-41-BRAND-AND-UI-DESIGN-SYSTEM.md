# Sprint 41 — PSL One Brand & UI Design System

## Vision

PSL One should feel like the **premium digital home of South African football** — confident, modern, and distinctly local. Not a generic sports dashboard. Not a clone of EPL or La Liga apps. Something that reflects the passion, colour, and pride of South African football culture.

---

## Brand Principles

| Principle | Expression |
|-----------|-----------|
| **Bold** | Large type, strong contrast, confident colour |
| **Alive** | Animations, live data, pulse effects for live moments |
| **South African** | Warm gold, deep green, township-vibrant energy |
| **Premium** | Glassmorphism surfaces, refined spacing, no clutter |
| **Trustworthy** | Clear RBAC labels, data provenance, non-financial clarity |

---

## Colour System

### Primary palette

| Token | Hex | Use |
|-------|-----|-----|
| `exp-void` | `#060d19` | Deepest dark backgrounds |
| `exp-navy` | `#0d1b2e` | Primary dark surface, nav |
| `exp-navy-2` | `#1b3a6b` | Lighter navy, elevated surfaces |
| `exp-gold` | `#e6aa00` | Primary brand accent, CTAs, highlights |
| `exp-gold-2` | `#ffd700` | Bright gold for large display only |
| `exp-green` | `#00843d` | Football green, positive states |

### Status and semantic

| Token | Hex | Use |
|-------|-----|-----|
| `exp-live` | `#ef4444` | Live match indicator, urgent states |
| `exp-success` | `#16a34a` | Confirmed, complete |
| `exp-warning` | `#d97706` | Caution, pending |
| `exp-muted` | `#6b7280` | Secondary text |

### Surface system

| Token | Use |
|-------|-----|
| `exp-surface` | Editorial, table backgrounds (off-white) |
| `exp-card` | White card background |
| `exp-border` | Light border for cards |
| `exp-border-dk` | Dark-mode border (8% white) |

---

## Typography

| Scale | Size | Weight | Use |
|-------|------|--------|-----|
| `display-2xl` | 4rem | 900 | Hero headlines, splash |
| `display-xl` | 3rem | 900 | Section heroes |
| `display-lg` | 2.25rem | 800 | Card heroes, key numbers |
| `display-md` | 1.75rem | 800 | Section titles |
| `display-sm` | 1.375rem | 700 | Card titles, sidebar headers |
| `body-lg` | 1.0625rem | 400 | Feature body text |
| `body-md` | 0.9375rem | 400 | Standard body |
| `body-sm` | 0.8125rem | 400 | Captions, metadata |
| `label-lg` | 0.8125rem | 600 | Status chips (uppercase) |
| `label-md` | 0.6875rem | 700 | Small labels |
| `score-xl` | 5rem | 900 | Live score display |
| `score-md` | 2.25rem | 900 | Match card scores |

---

## Component System

### Layer 1 — Atoms (design primitives)
- `ClubCrest` — shield-shaped placeholder crest with team colours
- `StatusChip` — live/finished/scheduled badge
- `ScoreDisplay` — large tabular numeral score
- `PositionBadge` — fantasy position chip (GK, DEF, MID, FWD)
- `PriceTag` — player price in fantasy points
- `VerificationBadge` — email verified/unverified indicator

### Layer 2 — Molecules (composed units)
- `TeamIdentity` — club crest + name
- `FixtureCard` — full match card with score/status/CTA
- `PlayerCard` — fantasy player card with stats
- `VideoTile` — video content tile
- `NewsHeroCard` — editorial hero card
- `SponsorBanner` — campaign banner (non-financial)
- `SponsorMoment` — inline sponsor mention

### Layer 3 — Organisms (sections)
- `PslOneHero` — full-width hero section
- `PslOneSection` — consistent section wrapper
- `MatchdayBanner` — pre-match/live/post-match hero
- `FixtureRail` — horizontal scroll rail of FixtureCards
- `LeagueTable` — standings table
- `PlayerRail` — horizontal scroll rail of PlayerCards

### Layer 4 — Templates (page layouts)
- `FantasyShell` — authenticated fantasy layout
- `PublicLayout` — public page with nav/footer

---

## Motion System

| Pattern | Duration | Easing | Use |
|---------|----------|--------|-----|
| Card entrance | 350ms | [0.16, 1, 0.3, 1] | Cards appearing on scroll |
| Stagger delay | 60ms × index | — | Rail item cascade |
| Live pulse | 1.2s loop | ease-in-out | Live indicator dot |
| Shimmer | 1.5s loop | linear | Skeleton loaders |
| Score update | 200ms | ease-out | Score number change |
| Button press | 100ms scale 0.97 | — | All interactive elements |

Respect `prefers-reduced-motion`: all animations should be gated with `useReducedMotion()`.

---

## Card Variants

| Variant | Background | Border | Shadow | Use |
|---------|-----------|--------|--------|-----|
| Dark | `exp-navy` | `exp-border-dk` | `card-md` | Match cards, game modules |
| Light | `exp-card` | `exp-border` | `card` | Editorial, tables |
| Live | `exp-navy` + live accent | `exp-live/30` | `card-md` | Active match |
| Glass | `white/10` blur | `white/20` | `card-lg` | Overlay cards |
| Gold | `exp-gold/10` | `exp-gold/20` | `glow-gold` | Highlighted features |

---

## Spacing Scale

Use Tailwind's default spacing scale. Common patterns:
- Section padding: `py-16 md:py-24`
- Card padding: `p-4 md:p-5`
- Section gap: `gap-4 md:gap-6`
- Rail gap: `gap-3`

---

## Beta Asset Guidelines

| Asset type | Beta approach | Production approach |
|------------|--------------|-------------------|
| Club crests | Shield placeholder with abbr + club colours | Licensed SVG crests |
| Player photos | Gradient silhouette or initials | Licensed photography |
| Match banners | Programmatic gradient with team colours | Designed artwork |
| Sponsor logos | Placeholder rectangle with sponsor name | Provided by sponsor |
| PSL logo | Not used (unlicensed) | Licensed from PSL |

All beta placeholder assets must include the comment: `{/* Beta placeholder — replace with licensed artwork */}`

---

## Accessibility

- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text
- All interactive elements: minimum 44×44px touch target
- Focus rings: 2px `exp-gold` outline, `focus-visible` only
- Keyboard navigation: all interactive elements reachable
- Screen readers: `aria-label` on icon-only buttons, score displays, and status indicators
- `prefers-reduced-motion` respected for all animations
