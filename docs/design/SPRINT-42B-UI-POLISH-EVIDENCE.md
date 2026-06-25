# Sprint 42B — UI Polish Evidence

**Date:** 2026-06-26  
**Branch:** feature/sprint-42b-remove-fallback-polish-ui  
**Status:** COMPLETE

---

## Changes Made

### 1. `WcFixtureCard` shared component (`components/world-cup/WcFixtureCard.tsx`)

New shared component used across all WC fixture pages:
- **Flag emoji system**: 40+ WC 2026 nations mapped to Unicode flag emojis (South Africa, France, Brazil, England, Argentina, Germany, Spain, Portugal, Morocco, USA, etc.)
- **Centred scoreline layout**: Home flag | Name ... Score/Time ... Name | Away flag
- **Status badges**: LIVE (with red pulse dot) · HT · FT · OPEN — consistent cross-page
- **Gold/emerald accent system**: consistent with design tokens
- **Hover transitions**: emerald team names, border highlight
- **Link navigation**: every card links to `/matches/{id}`
- **Variants**: `default`, `live` (red border/bg), `predict` (for GTS/prediction context)

Used on: `/fixtures`, `/world-cup`, `/world-cup/live`, `/match-centre`

### 2. Fixture pages upgraded

| Page | Before | After |
|------|--------|-------|
| `/fixtures` | Inline text card, no flags, status badge | `WcFixtureCard` with flags, centred score |
| `/world-cup` | Inline text card, no flags | `WcFixtureCard` with flags |
| `/world-cup/live` | Local `FixtureCard` component (inline, duplicated) | `WcFixtureCard`, no duplication |
| `/match-centre` | Inline card with separate status function | `WcFixtureCard` |

### 3. News page upgraded (`app/news/page.tsx`)

- **Featured story**: Replaced inline `<div>` card with `NewsHeroCard` component — full-bleed gradient background, gold category pill, large heading, `Read more →` CTA
- **Video highlights**: Replaced `<div>` grid with `VideoTile` component — play button overlay, hover scale, duration chip, gold category label, horizontal scroll on mobile
- **Images**: Uses `expImg()` for SVG placeholder thumbnails (editorial palette, consistent with design system)

### 4. GTS page (`app/guess-the-score/page.tsx`)

- Removed `STATIC_MARKETS` module-level constant
- Open markets now derived from real fixture data (SCHEDULED fixtures)
- `· Live from API` label shown when API returns data
- `📡 Fixture data unavailable` amber panel when API fails

---

## Design System Components Used

All components from `apps/experience/src/components/design/`:

| Component | Used On | Notes |
|-----------|---------|-------|
| `PslOneHero` | Standalone pages (pre-existing) | framer-motion, gold accent, grain overlay |
| `NewsHeroCard` | `/news` | Full-bleed card, gradient scrim |
| `VideoTile` | `/news` | Play button, hover animation |
| `PlayerCard` | Homepage fantasy section | Price + points display |
| `ClubCrest` | Homepage sections (pre-existing) | Shield shape, color-coded |
| `SponsorBanner` | Homepage sponsor section | — |

New component:
| `WcFixtureCard` | `/fixtures` `/world-cup` `/world-cup/live` `/match-centre` | Flag emojis, centred score |

---

## Non-changes (Intentional)

- **Homepage sections** (`MatchweekHeroSection`, `FixtureCarouselSection`, etc.) — already premium quality with framer-motion, `TeamIdentity` shields, etc. Not touched.
- **`/news` editorial content** — `WC_STORIES` and `WC_VIDEOS` remain static (correct for editorial content)
- **PSL inactive** — not activated, not changed
- **No betting/real-money language** added
