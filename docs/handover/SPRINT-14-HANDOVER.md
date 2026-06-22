# Sprint 14 — Handover

## Sprint Goal

Implement `ParsePslAdapter` as the PSL primary data provider, wire it into `ProviderRouterService` and `DataProviderService`, provide discovery tooling, and document the provider strategy including source-empty fixture handling.

---

## Deliverables

| Deliverable | Path | Status |
|---|---|---|
| `ParsePslAdapter` | `apps/api/src/data-provider/parse-psl.adapter.ts` | DONE |
| `ProviderRouterService` PSL route updated | `apps/api/src/data-provider/provider-router.service.ts` | DONE |
| `DataProviderService` `parse-psl` option | `apps/api/src/data-provider/data-provider.service.ts` | DONE |
| Discovery tool: health check | `tools/discovery/sprint-14-parse-psl-health.mjs` | DONE |
| Discovery tool: fixtures | `tools/discovery/sprint-14-parse-psl-fixtures.mjs` | DONE |
| Discovery tool: results | `tools/discovery/sprint-14-parse-psl-results.mjs` | DONE |
| Discovery tool: standings | `tools/discovery/sprint-14-parse-psl-standings.mjs` | DONE |
| Sprint 14 docs (10 files) | `docs/data/` and `docs/handover/` and `docs/sprints/` | DONE |

---

## Live Validation Status

**PENDING_LIVE_KEY**

`PARSE_API_KEY` must be set in `apps/api/.env` before live validation can run. See Sprint 14 Owner Review Guide for exact steps.

---

## Test Counts

- API tests: 1,845+ (exact count after integration)
- Experience tests: 634+ (exact count after integration)

No new migrations. No schema changes.

---

## Sprint 13 Carried-Over Blockers

| Blocker | Status |
|---|---|
| API-Football account suspended | Still unresolved — now demoted to PSL fallback only |
| EC2 staging migration pending authorisation | Still pending |

---

## What Is NOT Active

The following are not enabled and must not be enabled without explicit owner authorisation:

- Production PSL data ingestion
- PSL season activation
- EC2 staging migration
- Wallet production flows
- Real-money transactions
- Sportmonks (rejected)
- Betting or odds endpoints

---

## Sprint 15 Recommended Focus

1. Provision `PARSE_API_KEY` and run discovery tools to complete live validation
2. Wire `ParsePslAdapter` into a read-only ingestion job (no DB activation)
3. EC2 staging migration — apply after owner authorisation
4. Staging smoke suite with live provider keys
5. Review Parse.bot and football-data.org commercial terms
