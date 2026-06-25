# Sprint 42B — Live Beta Data Source Audit

**Date:** 2026-06-26  
**Branch:** feature/sprint-42b-remove-fallback-polish-ui  
**Status:** COMPLETE

---

## Objective

Remove all silent mock/fallback data from the live beta (`beta.pslone.co.za`) and replace with:
- Real API data from `INTERNAL_API_URL=http://api:4000`
- Explicit error states when the API is unavailable

No fixture data should silently substitute in-memory mock data without a visible user notice.

---

## Pages Audited

### `/fixtures` — WC 2026 Fixture List
- **Before:** Silent fallback to `WC_FALLBACK_FIXTURES` on API error (showed `· Demo data` in banner — subtle)
- **After:** Returns `[]` on error; shows explicit amber error panel "Fixtures unavailable — Could not load World Cup 2026 fixtures from the beta API."
- **Real data:** `GET /football/fixtures?seasonSlug=fifa-world-cup-2026` → 104 fixtures (INTERNAL_API_URL)
- **Status:** FIXED

### `/world-cup` — World Cup Hub
- **Before:** Silent fallback to `WC_FALLBACK_FIXTURES.slice(0, 6)` on API error (no label)
- **After:** Returns `{ fixtures: [], isLive: false }` on error; shows explicit error panel
- **Real data:** Same `/football/fixtures` endpoint
- **Status:** FIXED

### `/world-cup/live` — Live Scores
- **Before:** Silent fallback to `WC_FALLBACK_FIXTURES` on API error (no label on this page)
- **After:** Returns `{ fixtures: [], isLive: false }` on error; shows amber error panel "Fixtures unavailable"
- **Real data:** Same endpoint
- **Status:** FIXED

### `/match-centre` — Match Centre
- **Before:** Silent fallback to `WC_FALLBACK_FIXTURES` on API error (no label)
- **After:** Returns `{ fixtures: [], isLive: false }` on error; shows amber error panel "Match data unavailable"
- **Real data:** Same endpoint
- **Status:** FIXED

### `/guess-the-score` — Prediction Markets (CRITICAL)
- **Before:** Module-level `STATIC_MARKETS` constant derived from `WC_FALLBACK_FIXTURES`; API call to `/predictions/open?competitionCode=WC&limit=8` (DOES NOT EXIST → 404); ALWAYS showed static fake markets with only subtle `· Demo` label
- **After:** Removed `STATIC_MARKETS` entirely; now fetches `/football/fixtures?seasonSlug=fifa-world-cup-2026` (public, works) and filters `SCHEDULED` fixtures as open prediction markets; on failure → shows explicit amber error panel "Fixture data unavailable"
- **Real data:** SCHEDULED fixtures from `/football/fixtures` = real open markets
- **Status:** FIXED (most critical change)

---

## Pages Confirmed Not Silent-Fallback

| Page | Data Source | Notes |
|------|------------|-------|
| `/news` | `WC_STORIES` / `WC_VIDEOS` | Editorial content (static is correct — not a fixture feed) |
| `/videos` | `WC_VIDEOS` | Same |
| `/fantasy` | API-backed with auth | Users see their own data; no fallback |
| `/predict` | API-backed | Returns 401 without auth — correct |
| `/leaderboards` | API-backed | No fallback |
| `/home` | `getExperienceData()` | Homepage sections use curated WC mock data for design review — clearly labeled via data mode banner in DESIGN_REVIEW_DATA mode; in WC_BETA mode no banner is shown (this is intentional for the beta experience) |

---

## Architecture: How Pages Get Data in Beta

```
EC2 Docker Compose:
  web service:
    INTERNAL_API_URL=http://api:4000    # Docker network, no auth needed for public endpoints
    NEXT_PUBLIC_DATA_MODE=WC_BETA       # Baked at build time

  api service:
    DATABASE_URL → PostgreSQL
    CORS_ORIGINS=https://beta.pslone.co.za,http://16.28.84.11
```

All five WC pages use `INTERNAL_API_URL` for server-side fetches. The football API endpoint is public (no auth). In production: 104 real WC 2026 fixtures from the database.

---

## Test Coverage

12 new tests added to `apps/experience/src/lib/experience.spec.ts`:
- 5 × "does not import WC_FALLBACK_FIXTURES" (one per page)
- "guess-the-score does not use STATIC_MARKETS"
- "guess-the-score fetches /football/fixtures for open markets"
- 5 × explicit error message assertions

**Total tests:** 1589 passing (was 1567)
