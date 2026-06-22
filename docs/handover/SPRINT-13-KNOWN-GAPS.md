# Sprint 13 — Known Gaps

## Gap Register

| ID | Gap | Impact | Resolution |
|---|---|---|---|
| G1 | football-data.org key — RESOLVED | CLOSED | WC VALIDATED: 104 matches, score data available |
| G2 | API-Football key present but account suspended | HIGH | Log in to dashboard.api-football.com and reactivate account |
| G3 | PSL live validation incomplete (account suspended) | HIGH | Re-run `sprint-13-psl-sample.mjs` after G2 resolved |
| G4 | PSL not available on football-data.org | KNOWN | PSL uses API-Football path; permanent by design |
| G8 | API-Football returns HTTP 200 with body `errors.access` when suspended | FIXED | Adapter updated to check `data.errors` before returning response |
| G5 | EC2 staging migration not applied | MEDIUM | Authorise apply separately; see `docs/infrastructure/` for runbook |
| G6 | No ingestion pipeline scheduled | MEDIUM — data not flowing | Sprint 14: design and implement safe read-only ingestion job |
| G7 | DataProviderService routes to single global provider | LOW — per-competition router solves this | Sprint 14: integrate `ProviderRouterService` into ingestion pipeline |

## Gap Priorities

**Must resolve before full GO:**
- G2 — reactivate API-Football account at dashboard.api-football.com
- G3 — unblocks after G2

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
