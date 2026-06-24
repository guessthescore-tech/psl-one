# Sprint 38C — Beta UX Smoke Results

**Date:** 2026-06-24
**Branch:** feature/sprint-38c-live-refresh-news-video-verification
**Context:** World Cup 2026 beta — PSL INACTIVE, points-only

---

## Bugs Fixed This Sprint

| ID | File | Bug | Fix |
|----|------|-----|-----|
| 38C-01 | `apps/experience/src/app/videos/page.tsx:16` | Called `@PSL_ADMIN` endpoint — widget always unavailable | Changed to `GET /football/world-cup/scorebat-widget` (public) |
| 38C-02 | `apps/experience/src/app/world-cup/live/page.tsx:43` | Same admin endpoint bug for widget config | Changed to public endpoint; removed token dependency |
| 38C-03 | `apps/experience/src/app/world-cup/live/page.tsx:29` | Fixtures from `@PSL_ADMIN` discovery endpoint — empty for fans | Changed to `GET /football/fixtures?seasonSlug=fifa-world-cup-2026` |
| 38C-04 | `apps/experience/src/app/fixtures/page.tsx:25` | Wrong route (`/fixtures`) and invalid param (`competitionCode`) | Changed to `/football/fixtures?seasonSlug=fifa-world-cup-2026` |
| 38C-05 | `apps/experience/src/app/match-centre/page.tsx:26` | Wrong route (`/fixtures?limit=20`) | Changed to `/football/fixtures?seasonSlug=fifa-world-cup-2026` |
| 38C-06 | `apps/experience/src/app/news/page.tsx` | Redirect stub — no WC news content | Rebuilt as WC news centre with WC_STORIES + WC_VIDEOS |

---

## API Additions

| Endpoint | Guard | Description |
|----------|-------|-------------|
| `GET /football/world-cup/scorebat-widget` | None (public) | ScoreBat embed config — no token in response |
| `POST /admin/data-provider/world-cup/fixtures/refresh-status` | PSL_ADMIN | Refresh WC fixture statuses from football-data.org |
| `GET /admin/data-provider/world-cup/gts-status` | PSL_ADMIN | GTS prediction market counts |
| `GET /admin/data-provider/world-cup/media-status` | PSL_ADMIN | ScoreBat provider availability |

---

## Page Verification Checklist

### /videos
- [ ] ScoreBat widget iframe renders when `SCOREBAT_WIDGET_TOKEN` is set
- [ ] Fallback placeholder renders when token absent
- [ ] "Watch Live Scores" link goes to `/world-cup/live`

### /world-cup/live
- [ ] Live fixtures section renders from DB (not admin discovery)
- [ ] SCHEDULED/FINISHED fixtures display correctly
- [ ] ScoreBat widget renders when token set
- [ ] No 401 errors in server logs (no admin token required)

### /fixtures
- [ ] 104 WC fixtures appear (50 FINISHED, 54 SCHEDULED)
- [ ] Each fixture shows kickoffAt in SAST (UTC+2)
- [ ] Status badges: FT / SCHEDULED shown correctly

### /match-centre
- [ ] WC fixtures displayed under "Today" and "Upcoming"
- [ ] Clicking a fixture navigates to `/matches/:id`

### /news
- [ ] 5 WC stories rendered (France/Germany featured)
- [ ] Featured story shown in hero section
- [ ] 3 video tiles rendered with duration
- [ ] Quick links to /fixtures, /guess-the-score, /videos

---

## Safety Attestations

- PSL NOT activated
- No real-money features
- No provider keys exposed in frontend
- ScoreBat widget token in embed URL is ScoreBat's intended design (attribution token, not secret)
- No scheduled ingestion
- No production infrastructure changes
