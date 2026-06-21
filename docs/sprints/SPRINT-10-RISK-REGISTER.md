# Sprint 10 — Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|------------|
| R1 | Sportmonks key invalid for sprint duration | HIGH | HIGH | Document 401 clearly; owner regenerates key at https://app.sportmonks.com/api-tokens |
| R2 | SportsDataIO trial does not cover PSL/WC2026 | HIGH | MEDIUM | Document as known trial limitation; paid plan required for full validation |
| R3 | EC2 staging DB URL not configured | HIGH | MEDIUM | Gate documented; apply only when DATABASE_URL updated and owner authorizes |
| R4 | No admin token for authed smoke checks | MEDIUM | LOW | Authed smoke checks skipped; non-authed checks pass; operator can re-run with token |
| R5 | Commercial terms not reviewed | HIGH | HIGH | Blocked gate before any production ingestion; owner must review Sportmonks pricing |
| R6 | PSL fixture coverage unknown | HIGH | HIGH | Cannot validate without valid provider key; rate limits and fixture scope unconfirmed |
| R7 | Live smoke only run against local dev | MEDIUM | MEDIUM | Staging EC2 smoke requires EC2 migration apply + EC2 DATABASE_URL |
