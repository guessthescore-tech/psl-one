# Sprint 11 — Known Gaps

| ID | Gap | Impact | Resolution |
|----|-----|--------|------------|
| G1 | No live API-Football trial key in Sprint 11 | HIGH — PSL/WC2026 coverage unconfirmed | Owner obtains key from https://api-sports.io; sets in `apps/api/.env` |
| G2 | PSL league 288 not confirmed in API-Football | HIGH — primary candidate unvalidated | Run `sprint-11-provider-coverage.mjs` with live key |
| G3 | WC2026 not confirmed in API-Football | HIGH — WC2026 coverage unconfirmed | Same trial key; verify league ID 1 |
| G4 | Commercial terms not reviewed | HIGH (gate before production) | Owner reviews https://api-sports.io/pricing |
| G5 | EC2 staging migration not applied | MEDIUM — cannot run EC2 live smoke | Configure EC2 DATABASE_URL + authorize migration apply |
| G6 | Field mapping not validated on real response | MEDIUM — simulated only in Sprint 11 | Run `sprint-11-provider-field-map.mjs` with live key |
| G7 | Rate limits for 2M fans not verified | MEDIUM — confirm on paid plan | Review API-Football plan limits for production scale |
| G8 | SportsDataIO PSL gap unresolved | LOW (secondary candidate only) | Unchanged from Sprint 10; API-Football is primary candidate |
| G9 | Vercel CI deployment blocked | LOW (non-blocking) | Pre-existing; preview URL reachable |
