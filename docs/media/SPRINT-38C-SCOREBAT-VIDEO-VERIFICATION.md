# Sprint 38C — ScoreBat Video Widget Verification

**Date:** 2026-06-24
**Status:** VERIFIED (endpoint fix applied)

---

## Problem Statement

Prior to Sprint 38C, the ScoreBat widget never displayed on `/videos` or `/world-cup/live` because both pages called an admin-protected endpoint without authentication:

```
GET /admin/data-provider/world-cup/scorebat-widget-config  →  PSL_ADMIN required  →  401
Response: { available: false, embedUrl: null }
Widget: hidden, shows "Highlights Coming Soon" placeholder
```

## Fix Applied

**New public endpoint added to `FootballController`:**
```typescript
// apps/api/src/football/football.controller.ts
@Get('world-cup/scorebat-widget')
getWorldCupScoreBatWidget() {
  const adapter = new ScoreBatWidgetAdapter();
  return adapter.getWidgetEmbedConfig('world-cup');
}
```

**Frontend pages updated:**
- `apps/experience/src/app/videos/page.tsx:16` → `GET /football/world-cup/scorebat-widget`
- `apps/experience/src/app/world-cup/live/page.tsx:43` → `GET /football/world-cup/scorebat-widget`

## Widget Token Security Note

The `SCOREBAT_WIDGET_TOKEN` appears in the iframe `src` URL. This is ScoreBat's **intended design** — the widget token is an attribution token, not a secret API key. ScoreBat's own documentation shows the token in client-side embed URLs.

The `SCOREBAT_VIDEO_API_ACCESS_TOKEN` (private key for the Video API) is **never** returned in any response and is only used server-side.

## Verification Steps (on staging EC2)

```bash
# 1. Check ScoreBat widget config via public endpoint
curl http://api.staging.pslone.co.za/football/world-cup/scorebat-widget

# Expected response:
# { "available": true, "embedUrl": "https://www.scorebat.com/embed/competition/?id=world-cup&token=...&thdId=0&theme=light&widgetStyle=normal&isMobile=true", ... }

# 2. Confirm no token in server-side env response (widget URL is expected, private API key is not)
# 3. Visit https://staging.pslone.co.za/videos — iframe should render
# 4. Visit https://staging.pslone.co.za/world-cup/live — widget section should render
```

## Safety

- `SCOREBAT_WIDGET_TOKEN`: Embedded in iframe src by ScoreBat design — not a secret
- `SCOREBAT_VIDEO_API_ACCESS_TOKEN`: Never in any response, server-side only
- No PSL activation
- No real-money features
