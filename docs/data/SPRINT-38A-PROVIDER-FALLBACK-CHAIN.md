# Sprint 38A — Provider Fallback Chain

## World Cup Competition Routing

```
Competition code: WC | WORLD_CUP_2026 | FIFA_WORLD_CUP

Priority 1: FootballDataOrgAdapter
  Condition: FOOTBALL_DATA_API_KEY set
  Status: VALIDATED (Sprint 13, 104 matches)
  Endpoint: api.football-data.org/v4/competitions/WC/...

Priority 2: SportRadarSoccerAdapter
  Condition: SPORTSRADAR_SOCCER_API_KEY set
  Status: ADAPTER_BUILT (key procurement needed)
  Endpoint: api.sportradar.com/soccer/trial/v4/en/...

Priority 3: NoOpAdapter
  Condition: neither key set
  Status: ALWAYS_AVAILABLE (returns empty/disabled)
```

## PSL Competition Routing (unchanged)

```
Competition code: PSL | SOUTH_AFRICA_PSL | 288 | BETWAY_PREMIERSHIP

Priority 1: ParsePslAdapter
  Condition: PARSE_API_KEY set
  Status: SOURCE_EMPTY (July/August 2026 expected)

Priority 2: ApiFootballAdapter
  Condition: API_FOOTBALL_KEY set (ParsePsl absent)
  Status: ACCOUNT_SUSPENDED

Priority 3: NoOpAdapter
  Condition: no PSL key set
```

## DataProviderService Global Selection

`DATA_PROVIDER` env var selects the global default adapter:
- `football-data-org` → FootballDataOrgAdapter (if key set)
- `api-football` → ApiFootballAdapter (if key set)
- `parse-psl` → ParsePslAdapter (if key set)
- (unset or unknown) → NoOpAdapter

`ProviderRouterService.getAdapterForCompetition()` overrides global
selection for competition-specific routes.

## Key Matrix

| Env Var | Provider | Competition |
|---|---|---|
| `FOOTBALL_DATA_API_KEY` | FootballDataOrgAdapter | WC (primary) |
| `SPORTSRADAR_SOCCER_API_KEY` | SportRadarSoccerAdapter | WC (fallback) |
| `SCOREBAT_WIDGET_TOKEN` | ScoreBatWidgetAdapter | WC (widget only) |
| `PARSE_API_KEY` | ParsePslAdapter | PSL (primary) |
| `API_FOOTBALL_KEY` | ApiFootballAdapter | PSL (fallback) |
| `DATA_PROVIDER` | Global selection | All |

All keys: server-side only, never NEXT_PUBLIC_.
