# Sprint 14 — Per-Competition Routing

## Routing Table

| Code(s) | Primary Adapter | Key Required | Fallback |
|---|---|---|---|
| `WC`, `WORLD_CUP_2026`, `FIFA_WORLD_CUP` | `FootballDataOrgAdapter` | `FOOTBALL_DATA_API_KEY` | `NoOpAdapter` |
| `PSL`, `SOUTH_AFRICA_PSL`, `BETWAY_PREMIERSHIP`, `288` | `ParsePslAdapter` | `PARSE_API_KEY` | `ApiFootballAdapter` if `API_FOOTBALL_KEY` present, else `NoOpAdapter` |

---

## Backwards Compatibility Note

Competition code `288` (the API-Football internal ID for the PSL) remains in the router for backwards compatibility. In Sprint 14 it routes to `ParsePslAdapter` when `PARSE_API_KEY` is present, rather than to `ApiFootballAdapter`. If `PARSE_API_KEY` is absent, the chain continues: check `API_FOOTBALL_KEY` for `ApiFootballAdapter`, then fall back to `NoOpAdapter`.

---

## Routing Rules

- No DB writes occur during provider routing
- No data ingestion is triggered by routing resolution
- The PSL season must NOT be activated via `ProviderRouterService` — activation is a separate admin action
- Frontend must never call provider endpoints directly; all calls are server-side only
- Keys are server-side env vars only — never `NEXT_PUBLIC_*`
- `NoOpAdapter` is always the last fallback; it returns empty arrays and never throws

---

## How the Router Resolves a Request

1. Inspect the competition code passed to `ProviderRouterService`
2. Match against known codes (case-insensitive, alias-aware)
3. Check whether the primary adapter key is present in the environment
4. If yes: return primary adapter instance
5. If no: check fallback chain in order
6. If no fallback key is present: return `NoOpAdapter`

This resolution is stateless and happens per-request. There is no caching of adapter selection.
