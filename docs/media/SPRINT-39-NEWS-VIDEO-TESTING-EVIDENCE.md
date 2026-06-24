# Sprint 39 News & Video Testing Evidence

**WC_BETA · PSL_INACTIVE · NO_REAL_MONEY**
Date: 2026-06-25

---

## /news — Status: EDITORIAL_BETA

| Property | Value |
|----------|-------|
| Status | EDITORIAL_BETA |
| Data source | `lib/data.ts` — WC_STORIES (5 stories) |
| Featured story | "Mbappe fires France into pole position..." (s1, featured: true) |
| Remaining stories | 4 stories in 2-col grid |
| Video section | Top 3 WC_VIDEOS shown |
| Quick links | /fixtures, /guess-the-score, /videos |
| Admin dependency | NONE — fully static editorial data |
| Redirect | NO — standalone news centre (not redirect to /media) |
| Sprint | 38C fix re-applied in Sprint 39 |

### Story List (from lib/data.ts)
| ID | Title | Category | Featured |
|----|-------|----------|----------|
| s1 | Mbappe fires France into pole position... | Match Report | YES |
| s2 | Spain's collective brilliance too much for England | Match Report | NO |
| s3 | Morocco making history: the Atlas Lions roar again | Feature | NO |
| s4 | The rise of African football: what WC 2026 means... | Analysis | NO |
| s5 | Fantasy WC: the midfielders you cannot afford to miss | Fantasy | NO |

---

## /videos — Status: SCOREBAT_WIDGET

| Property | Value |
|----------|-------|
| Status | SCOREBAT_WIDGET |
| Widget endpoint | GET /football/world-cup/scorebat-widget (public, no auth) |
| Widget active | When SCOREBAT_WIDGET_TOKEN env var is set on server |
| Widget fallback | "Highlights Coming Soon" placeholder when token not set |
| Token exposure | NEVER — token embedded in URL only (ScoreBat design); env var name never returned |
| Endpoint fix | Sprint 38C: changed from admin endpoint to public /football/ endpoint |

### Widget Response Shape
```json
{
  "available": true | false,
  "embedUrl": "https://www.scorebat.com/embed/competition/?id=world-cup&token=..." | null,
  "allowedHosts": ["scorebat.com", "www.scorebat.com"],
  "message": "..."
}
```

---

## /world-cup/live — Status: PUBLIC_API_BACKED

| Property | Value |
|----------|-------|
| Status | PUBLIC_API_BACKED |
| Fixture source | GET /football/fixtures?seasonSlug=fifa-world-cup-2026 (public endpoint) |
| Widget source | GET /football/world-cup/scorebat-widget (public endpoint) |
| Admin auth dependency | NONE — Sprint 38C removed getToken() dependency |
| Cache | Fixtures: revalidate 60s; Widget: revalidate 3600s |
| Live filter | status === 'LIVE' OR 'IN_PLAY' OR 'HALF_TIME' |
| Upcoming filter | status === 'SCHEDULED' OR 'not_started' |
| Completed filter | status === 'FINISHED' OR 'closed' OR 'ended' |

---

## Security Evidence

```bash
# grep scan confirms no API keys in frontend
grep -RInE 'SCOREBAT_WIDGET_TOKEN=|SCOREBAT_VIDEO_API_ACCESS_TOKEN' apps/experience/src
# Expected: CLEAN (0 matches)

# grep scan confirms no JWTs in source
grep -RInE 'eyJ[A-Za-z0-9_-]{10,}\.' apps/experience/src
# Expected: CLEAN (0 matches)
```
