# Sprint 15 — Provider Routing Status

## Current Routing Table (as of Sprint 15)

| Competition | Primary | Fallback 1 | Fallback 2 | Status |
|-------------|---------|------------|------------|--------|
| WC / WORLD_CUP_2026 / FIFA_WORLD_CUP | FootballDataOrgAdapter | NoOpAdapter | — | WC_BETA_VALIDATED (104 matches) |
| PSL / SOUTH_AFRICA_PSL / 288 / BETWAY_PREMIERSHIP | ParsePslAdapter | ApiFootballAdapter | NoOpAdapter | PARSE_PSL_KEY_MISSING |
| All others | NoOpAdapter | — | — | Safe default |

## Per-Provider Status

### football-data.org (World Cup)
- **Status:** WC_BETA_VALIDATED
- **Last validated:** 2026-06-22 (Sprint 13)
- **Validation:** 104 WC 2026 matches returned; score data available on free tier
- **Key env:** `FOOTBALL_DATA_API_KEY` (set in local `.env`)
- **Activation:** `DATA_PROVIDER=football-data-org` + `FOOTBALL_DATA_API_KEY` set
- **PSL coverage:** Not available on football-data.org

### Parse PSL (PSL official-site)
- **Status:** PARSE_PSL_KEY_MISSING
- **Last validated:** 2026-06-22 (Sprint 15 — key absent)
- **Key env:** `PARSE_API_KEY` (not set in local `.env`)
- **Activation:** `PARSE_API_KEY` set activates PSL route in ProviderRouterService
- **Global activation:** `DATA_PROVIDER=parse-psl` + `PARSE_API_KEY` set
- **Commercial risk:** Unofficial psl.co.za scraper — see SPRINT-14-KNOWN-GAPS.md G7

### API-Football (PSL fallback)
- **Status:** API_FOOTBALL_ACCOUNT_SUSPENDED
- **Last validated:** 2026-06-22 (Sprint 13)
- **Validation:** HTTP 200 with `errors.access: "Your account is suspended"` on all endpoints
- **Key env:** `API_FOOTBALL_KEY` (set in local `.env`)
- **Action:** Owner must reactivate account at dashboard.api-football.com

### Sportmonks
- **Status:** REJECTED
- **Reason:** HTTP 401 on all validation attempts; PSL coverage unconfirmed
- **Action:** Do not re-introduce

### ESPN / SportsDataIO
- **Status:** RESEARCH_ONLY
- **Reason:** No confirmed PSL coverage for daily fixture data

### NoOp
- **Status:** ALWAYS_ACTIVE (safe fallback)
- **Triggers:** Any missing key; any unknown competition code

## ProviderRouterService Routing Logic

```
ProviderRouterService.getProvider(competitionCode):
  WC codes → FootballDataOrgAdapter (if FOOTBALL_DATA_API_KEY set)
             else → NoOpAdapter
  PSL codes → ParsePslAdapter (if PARSE_API_KEY set)
             else → ApiFootballAdapter (if API_FOOTBALL_KEY set)
             else → NoOpAdapter
  other    → NoOpAdapter
```

## Related Documents

- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md` — original routing design
- `docs/data/SPRINT-14-PER-COMPETITION-ROUTING.md` — Sprint 14 PSL→Parse update
- `docs/data/SPRINT-15-PARSE-PSL-LIVE-VALIDATION.md`
- `docs/data/SPRINT-15-PROVIDER-GO-NOGO.md`
