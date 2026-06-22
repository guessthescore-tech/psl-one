# Sprint 13 — Known Gaps

## Gap Register

| ID | Gap | Impact | Resolution |
|---|---|---|---|
| G1 | football-data.org key not in local env | HIGH | Owner sets `FOOTBALL_DATA_API_KEY` in `apps/api/.env`, re-runs `sprint-12-football-data-worldcup.mjs` |
| G2 | API-Football key not in local env | HIGH | Owner sets `API_FOOTBALL_KEY` in `apps/api/.env`, re-runs `sprint-11-provider-coverage.mjs` |
| G3 | Per-competition router not validated against live data | HIGH | Depends on G1 and G2 resolution |
| G4 | PSL not available on football-data.org | KNOWN | PSL uses API-Football path; documented in `SPRINT-13-PER-COMPETITION-ROUTING.md` |
| G5 | EC2 staging migration not applied | MEDIUM | Authorise apply separately; see `docs/infrastructure/` for runbook |
| G6 | No ingestion pipeline scheduled | MEDIUM — data not flowing | Sprint 14: design and implement safe read-only ingestion job |
| G7 | DataProviderService routes to single global provider | LOW — per-competition router solves this | Sprint 14: integrate `ProviderRouterService` into ingestion pipeline |

## Gap Priorities

**Must resolve before full GO:**
- G1 — owner key action
- G2 — owner key action
- G3 — unblocks after G1 + G2

**Known permanent gaps (no action required):**
- G4 — football-data.org does not support PSL; this is by design and already accounted for in routing

**Deferred to Sprint 14:**
- G5 — EC2 migration requires separate authorisation
- G6 — ingestion pipeline design
- G7 — router integration into pipeline

## Closed Gaps From Prior Sprints

| ID | Sprint | Description |
|---|---|---|
| Sportmonks REJECTED | Sprint 7 | Sportmonks trial token revoked; adapter still ships but routes nothing |
| ESPN RESEARCH_ONLY | Sprint 12 | ESPN not suitable as primary; documented |
| SportsDataIO PSL unconfirmed | Sprint 10 | SportsDataIO health returned 200 but PSL not in catalogue |

## Related Documents

- `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md`
- `docs/data/SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md`
- `docs/handover/SPRINT-13-BETA-GO-NOGO.md`
- `docs/handover/SPRINT-13-OWNER-REVIEW-GUIDE.md`
