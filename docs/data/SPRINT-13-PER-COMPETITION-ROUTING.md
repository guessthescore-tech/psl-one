# Sprint 13 — Per-Competition Provider Routing Design

## Overview

`ProviderRouterService` provides opt-in per-competition routing that selects a provider adapter based on a competition code string. It does **not** replace or modify `DataProviderService`, which continues to manage the single global provider selection. The router is additive and not referenced by any active request path until explicitly wired into an ingestion pipeline (Sprint 14+).

## Service Definition

```typescript
// apps/api/src/data-provider/provider-router.service.ts

@Injectable()
export class ProviderRouterService {
  getAdapterForCompetition(competitionCode: string): ProviderAdapter;
  getRouteStatus(): { wc: string; psl: string; default: string };
}
```

### `getAdapterForCompetition(competitionCode: string): ProviderAdapter`

Returns the appropriate adapter for the given competition code. Matching is case-insensitive. If the required API key is absent or empty the method falls back to `NoOpAdapter` for that competition — it never throws.

### `getRouteStatus(): { wc: string; psl: string; default: string }`

Returns the current routing status for the three routing slots. Useful for health checks and owner review.

## Routing Table

| Competition Code(s) | Adapter | Key Required | Fallback |
|---|---|---|---|
| `WC`, `WORLD_CUP_2026`, `FIFA_WORLD_CUP` | `FootballDataOrgAdapter` | `FOOTBALL_DATA_API_KEY` | `NoOpAdapter` |
| `PSL`, `SOUTH_AFRICA_PSL`, `288` | `ApiFootballAdapter` | `API_FOOTBALL_KEY` | `NoOpAdapter` |
| All others | `NoOpAdapter` | none | `NoOpAdapter` |

## Matching Rules

- Matching is **case-insensitive**: `wc`, `WC`, and `Wc` all resolve to `FootballDataOrgAdapter`.
- The key check runs at call time — if a key is later added to the environment the router picks it up without restart (NestJS env injection permitting).
- A valid key alone does not activate a provider — both a code match **and** a non-empty key are required.
- Unknown competition codes always return `NoOpAdapter`. This is safe by design.

## What This Service Does NOT Do

- Does not replace `DataProviderService` global selection.
- Does not trigger DB writes or data ingestion.
- Does not expose HTTP endpoints or frontend calls.
- Does not route to Sportmonks (REJECTED in Sprint 7).
- Does not route to ESPN (RESEARCH_ONLY status).
- Does not use SportsDataIO as a primary provider.
- Per-competition routing is **opt-in only** — it must be explicitly called by an ingestion pipeline to have any effect.

## Provider Status Reference

| Provider | Status | Competition |
|---|---|---|
| API-Football | SELECTED — pending key validation | PSL (league 288) |
| football-data.org | SELECTED — pending key validation | World Cup 2026 |
| NoOpAdapter | ACTIVE DEFAULT | All competitions |
| Sportmonks | REJECTED | N/A |
| ESPN | RESEARCH_ONLY | N/A |
| SportsDataIO | CANDIDATE (not primary) | N/A |

## Related Documents

- `docs/data/SPRINT-13-FOOTBALL-DATA-LIVE-VALIDATION.md`
- `docs/data/SPRINT-13-API-FOOTBALL-LIVE-VALIDATION.md`
- `docs/data/SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md`
- `docs/handover/SPRINT-13-ROLLBACK-PLAN.md`
- `docs/data/SPRINT-11-PROVIDER-DECISION.md`
- `docs/data/SPRINT-12-PROVIDER-STRATEGY.md`
