# Sprint 9 — Known Gaps

| ID | Gap | Impact | Resolution |
|----|-----|--------|------------|
| G1 | Provider replacement keys absent | Cannot validate Sportmonks or SportsDataIO coverage | Owner generates replacement keys; places in `apps/api/.env` only |
| G2 | Staging migration not applied | Staging DB missing prediction_challenges table and settlement fields | Owner explicitly authorizes migration apply |
| G3 | Vercel CI blocked (non-blocking) | Preview deploy not auto-updating via Vercel CI | Non-blocking; preview URL is live and reachable manually |
| G4 | Live smoke not run against staging | Cannot confirm e2e challenge create/settle/result flow on staging | Unblocked after migration apply + running API server |
| G5 | Provider commercial terms unknown | Cannot confirm licensing rights for PSL data at scale | Owner reviews Sportmonks/SportsDataIO pricing and contracts |
| G6 | SportsDataIO not wired to DataProviderService | Cannot switch to SportsDataIO as primary without code change | Intentional; decision deferred pending provider trial comparison |
