# Session Handover — 2026-06-27
## WC Beta Live Story Feed and Sitewide Story Rails

**Date:** 2026-06-27  
**Status:** COMPLETE — verified locally, ready for commit/push/deploy  
**Scope:** Replace static/mock story surfaces with live World Cup beta story rails while preserving design-review fallback mode

---

## What Was Wrong

1. The experience app still mixed live and mock story sources. Some pages used `WC_STORIES` directly, and story cards linked to `/news/:id` style routes that did not exist as the canonical detail surface.
2. The live story flow had no shared feed helper, so each page handled editorial content differently.
3. The live story helper initially depended on the wrong season context and needed a cleanup pass so it would derive its live context from fixture data.
4. The public web homepage did not lead with a story rail, so the beta felt inconsistent between apps.
5. Several pages still rendered mock content by design-review intent, but that needed to stay clearly separated from live beta behavior.

---

## What Was Resolved

### Experience App

- Added `apps/experience/src/lib/live-world-cup-feed.ts`.
- Built a derived live story feed from existing public football data:
  - fixtures
  - standings
  - match-centre data
  - top performers
- Wired the experience home page to render live stories first in beta mode while keeping design-review content separate.
- Updated `apps/experience/src/app/news/page.tsx`, `apps/experience/src/app/media/page.tsx`, `apps/experience/src/app/media/[slug]/page.tsx`, and `apps/experience/src/app/world-cup/live/page.tsx` to use the live story feed.
- Changed `EditorialStory` so it resolves to `/media/:slug`, which is the actual story detail route.
- Updated `EditorialGridSection` to accept an explicit story list instead of depending on the old data bundle shape.

### Web App

- Added a top-of-home story rail to `apps/web/src/app/page.tsx`.
- Kept the rail separate from fixture loading so story visibility does not collapse when the fixture request is still loading.

### Feed Helper Fixes

- Removed the season-context coupling from the live feed logic.
- Fixed the player-story nullability bug that TypeScript caught.
- Kept the preview story as a fallback only when no live or finished match story is available.

---

## Root Cause

The sitewide inconsistency came from two things:

1. The beta had multiple presentation surfaces, but only some of them were wired to a live story source.
2. Design-review mode still intentionally exposes mock content, so it was easy to mistake the fallback path for the live path.

The fix was not to invent a separate RSS pipeline. It was to derive a live editorial stream from the data providers already available and then keep design-review fallback content isolated.

---

## Data Sources Used

- Fixtures and scores from the football API surface
- Standings for group context
- Match-centre data for live update and player-rating stories
- Top performers for player-led story generation
- Public media catalogue for the public web story rail

This session did not add a new provider contract or a separate ingestion backend. It only changed how the beta surfaces render the content already available.

---

## What Remains Intentional

- `DESIGN_REVIEW_DATA` still uses mock data on purpose for review-only screens.
- If the football provider returns no live data, the story rail degrades gracefully instead of inventing content.
- Safe ingestion of Sportmonks fixture/player statistics into `FantasyPlayerMatchStat` remains a separate path and is not solved by the story-feed work.

---

## Validation

- `pnpm --filter @psl-one/experience typecheck` — PASS
- `pnpm --filter @psl-one/experience test` — PASS, 1658 / 1658
- `pnpm --filter @psl-one/experience build` — PASS
- `pnpm --filter @psl-one/web typecheck` — PASS
- `pnpm --filter @psl-one/web test` — PASS, 543 / 543
- `pnpm --filter @psl-one/web build` — PASS

---

## Deployment Notes

- The live story rails are safe to deploy with the current beta configuration.
- The design-review routes remain unchanged where they are meant to stay mock-driven.
- Commit/push/deploy can proceed once the intended files are staged and the protected paths remain excluded.

