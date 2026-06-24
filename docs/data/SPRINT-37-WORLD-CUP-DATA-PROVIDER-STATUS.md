# Sprint 37 — World Cup 2026 Data Provider Status

## Status: ACTIVE (conditional on key)

WC 2026 is the active beta competition. football-data.org is the validated provider.

## Provider Details

| Field | Value |
|-------|-------|
| Provider | football-data.org |
| Adapter | `FootballDataOrgAdapter` |
| Env var | `FOOTBALL_DATA_API_KEY` |
| Competition code | `WC`, `WORLD_CUP_2026`, `FIFA_WORLD_CUP` |
| Validated fixtures | 104 matches (Sprint 13, 2026-06-22) |
| WC season status | ACTIVE (beta) |
| Routing | `ProviderRouterService` WC route |

## Routing Logic

```typescript
// ProviderRouterService
WC_CODES = new Set(['WC', 'WORLD_CUP_2026', 'FIFA_WORLD_CUP'])
// → FootballDataOrgAdapter if FOOTBALL_DATA_API_KEY present
// → NoOpAdapter fallback
```

Note: `DATA_PROVIDER=football-data-org` is for the global `DataProviderService`. The WC route in `ProviderRouterService` works **independently** based on `FOOTBALL_DATA_API_KEY` presence alone.

## Validation History

| Sprint | Result |
|--------|--------|
| Sprint 12 | FootballDataOrgAdapter implemented; WC fixtures fetched |
| Sprint 13 | 104 WC matches validated; football-data.org confirmed as WC provider |

## Current State

```
WC season: ACTIVE
Provider: football-data.org
Key required: FOOTBALL_DATA_API_KEY (server-side only)
Expected beta action: none — WC data is stable
```

## Owner Actions

| Action | Priority |
|--------|----------|
| Confirm `FOOTBALL_DATA_API_KEY` is set in beta `.env` | MEDIUM |
| No additional action needed for WC data | — |

## Safety Boundaries

- No WC fixture import writes (WC is active; existing fixtures used)
- No PSL activation (PSL is separate from WC)
- Provider key is server-side only — never `NEXT_PUBLIC_*`
- No real-money functionality
