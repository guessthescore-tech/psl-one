# Sprint 38C — World Cup News Centre Verification

**Date:** 2026-06-24
**Status:** IMPLEMENTED

---

## Problem Statement

`/news` was a redirect stub with only quick links to `/media`. It contained no WC news content, despite `WC_STORIES` (5 stories) and `WC_VIDEOS` (5 videos) existing in `apps/experience/src/lib/data.ts`.

## Fix Applied

`apps/experience/src/app/news/page.tsx` was rebuilt as a full WC news centre.

## Content Rendered

### Stories (from `WC_STORIES`)

| ID | Title | Category | Featured |
|----|-------|----------|---------|
| s1 | Mbappe fires France into pole position with brace against Germany | Match Report | Yes |
| s2 | Spain's collective brilliance too much for England in Group A | Match Report | No |
| s3 | Morocco making history: the Atlas Lions roar again | Feature | No |
| s4 | The rise of African football: what WC 2026 means for the continent | Analysis | No |
| s5 | Fantasy WC: the midfielders you cannot afford to miss | Fantasy | No |

### Videos (from `WC_VIDEOS`, first 3 shown)

| ID | Title | Category | Duration |
|----|-------|----------|---------|
| v1 | Mbappe's stunning brace vs Germany — full goals | Goals | 2:22 |
| v2 | Spain 3-1 England — match highlights | Highlights | 5:18 |
| v3 | Morocco's defensive masterclass — tactical breakdown | Analysis | 8:07 |

## Page Structure

```
/news
├── Beta banner
├── Hero — "World Cup News Centre"
├── Featured story (s1 — Mbappe/Germany, editor's pick)
├── Latest Stories grid (s2–s5, 2-column)
├── Video Highlights (v1–v3, 3-column) + "All videos →" link
└── Quick links → /fixtures, /guess-the-score, /videos
```

## User Questions Answered

**"Can users view latest FIFA WC 2026 themed news?"**
YES — 5 editorial WC stories are rendered on `/news`, covering match reports, feature analysis, and fantasy content.

## Note on Content Source

Current content is editorial/curated data in `lib/data.ts`. A future sprint can wire up a CMS or `GET /football/news` API when backend news ingestion is implemented.

## Safety

- No real-money features
- No PSL activation
- Content is WC 2026 editorial only
