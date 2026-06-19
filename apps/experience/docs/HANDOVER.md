# apps/experience — Handover Document
**Last updated:** 2026-06-19 (STORY-FE-PREMIUM-01A)

---

## What This App Is

`apps/experience` is the **premium creative frontend** for PSL One. It is a standalone Next.js 15 application at port 3002, separate from the engineering beta at `apps/web`.

It exists to allow visual direction to be prototyped, reviewed, and approved without risking the operational beta.

This app is **not deployed** and **not committed** as of this handover. It has been built and validated locally only.

---

## How to Run Locally

```bash
cd apps/experience
pnpm install
pnpm dev
# Open http://localhost:3002
```

Or from the monorepo root:
```bash
pnpm --filter @psl-one/experience dev
```

---

## Data Mode

The app has two modes controlled by `NEXT_PUBLIC_DATA_MODE`:

| Mode | Data source | Trigger |
|------|-------------|---------|
| `DESIGN_REVIEW_DATA` (default) | WC 2026 mock data (8 teams, 5 fixtures, 6 players) | Default, always |
| `LIVE_BETA_DATA` | Same WC 2026 mock + TODO comment for real API | Set env var |

A purple sticky banner appears at the top of the page in `DESIGN_REVIEW_DATA` mode to prevent confusion.

**`LIVE_BETA_DATA` currently still returns mock data.** The TODO comment at `src/lib/data.ts:352` marks where real API calls must be wired in the provider integration story.

---

## Validation Commands

```bash
pnpm --filter @psl-one/experience typecheck   # TypeScript — must exit 0
pnpm --filter @psl-one/experience test        # 81/81 vitest specs
pnpm --filter @psl-one/experience build       # Next.js build — 154 kB first load JS
```

---

## Known Placeholders

| Placeholder | Location | Required action before launch |
|-------------|----------|-------------------------------|
| `picsum.photos` images | `src/lib/data.ts` `expImg()` | Replace with licensed football photography |
| WC 2026 mock data | `src/lib/data.ts` | Replace with PSL provider data after licensing gate |
| Hardcoded match stats in FeaturedMatchSection | `src/sections/FeaturedMatchSection.tsx:95-100` | Connect to live provider stats endpoint |
| `FanValueSection` category `streaks` | `src/sections/FanValueSection.tsx:12-24` | Align with `ExpFanValue.breakdown` keys |

---

## Deferred Issues

| Issue | Priority | Notes |
|-------|----------|-------|
| `ShareAction` bottom sheet no focus trap | LOW | Needs `focus-trap-react` or native `inert` |
| Carousel scroll buttons < 44px | LOW | Desktop-only, acceptable for current phase |
| `MatchweekNav` unused in homepage | LOW | Available for gameweek detail pages |

---

## Architecture Decisions

- See `docs/CREATIVE-DIRECTION.md` for full design principles
- See `docs/handover/PSL-ONE-DECISION-LOG.md` for platform decisions
- `apps/web` must remain untouched — all creative changes go here
