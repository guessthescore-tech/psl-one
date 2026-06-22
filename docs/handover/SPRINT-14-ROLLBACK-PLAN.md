# Sprint 14 — Rollback Plan

## No DB Migrations

Sprint 14 introduced no database migrations. There is no schema change to roll back. A rollback to any prior commit leaves the database state fully intact.

---

## ParsePslAdapter Is Additive

`ParsePslAdapter` is a new file in `apps/api/src/data-provider/`. Removing it has no impact on any other service. If it is removed:

- `ProviderRouterService` falls back to the existing chain: `ApiFootballAdapter` (if `API_FOOTBALL_KEY` is set) then `NoOpAdapter`
- `DataProviderService` falls back to `NoOpAdapter` when `DATA_PROVIDER=parse-psl` is set but the adapter is absent
- No fan-facing or admin-facing features are affected

---

## ProviderRouterService PSL Route Rollback

The PSL route was updated to check for `PARSE_API_KEY` first. If `PARSE_API_KEY` is absent (the default state in any environment where it has not been provisioned), the router behaves identically to Sprint 13:

1. Check `API_FOOTBALL_KEY` → `ApiFootballAdapter`
2. No key → `NoOpAdapter`

No environment changes are needed to restore Sprint 13 routing behaviour. Simply do not set `PARSE_API_KEY`.

---

## DataProviderService Rollback

The `DATA_PROVIDER=parse-psl` path is new. If `DATA_PROVIDER` is not set to `parse-psl`, the Sprint 14 code path is never entered. All prior `DATA_PROVIDER` values continue to work unchanged.

---

## Discovery Tools Rollback

Discovery tools in `tools/discovery/` are fire-and-forget scripts. They have no runtime impact on the API or frontend. They can be deleted with no consequence.

---

## Summary

Sprint 14 is fully safe to ship and fully reversible. No persistent state was modified. All new code is behind environment variable guards that are off by default.
