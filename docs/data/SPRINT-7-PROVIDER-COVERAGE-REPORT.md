# Sprint 7 — Sportmonks Provider Coverage Report

**Provider:** Sportmonks v3 Football API  
**Plan:** Trial (free tier)  
**Base URL:** `https://api.sportmonks.com/v3/football`  
**Auth:** `Authorization: Bearer <API_KEY>` header

---

## Trial Tier Endpoint Coverage

| Endpoint | Trial Available | Notes |
|----------|----------------|-------|
| `GET /leagues?per_page=1` | YES | Used for health check |
| `GET /seasons?per_page=25` | YES | Returns all seasons |
| `GET /fixtures/seasons/:id?per_page=50` | YES (limited) | May require includes for scores/participants |
| `GET /teams/seasons/:id?per_page=50` | YES | Basic team data |
| `GET /players/teams/:id?per_page=50` | PARTIAL | Trial may restrict player data |
| `GET /standings/seasons/:id` | PARTIAL | May require paid plan for full standings |

---

## PSL Coverage

| Data | Available via Sportmonks | Notes |
|------|--------------------------|-------|
| PSL league/season discovery | YES | League ID needs to be configured |
| PSL fixture schedule | YES (limited) | Trial tier limited to recent data |
| PSL team rosters | PARTIAL | Player details may need paid plan |
| PSL live scores | REQUIRES PAID PLAN | Real-time not on trial |
| PSL standings | PARTIAL | Historical only on trial |

---

## WC 2026 Coverage

| Data | Available via Sportmonks | Notes |
|------|--------------------------|-------|
| Tournament fixture schedule | YES | FIFA World Cup 2026 included |
| Team data | YES | All 32 qualifying teams |
| Live scores | REQUIRES PAID PLAN | Real-time not on trial |
| Group standings | PARTIAL | Available after matches are played |

---

## Rate Limits (Trial)

- Trial tier: typically 200 calls/hour
- 429 status handled gracefully — returns empty array, logs warning
- No retry logic implemented in Sprint 7 (deferred to Sprint 8)

---

## Recommendation

For production use, the Sportmonks **Football Standard** or **PSL-specific plan** is required to access:
- Live/real-time scores
- Full player statistics
- Unlimited historical data

The current trial implementation is safe for discovery and planning purposes.

---

## Security Note

`SPORTMONKS_API_KEY` is server-side only:
- Never in `NEXT_PUBLIC_*` env vars
- Never in frontend code
- Auth header used (not query param — changed from original skeleton that used `api_token=`)
