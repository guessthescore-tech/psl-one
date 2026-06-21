# Sprint 10 — Known Gaps

| ID | Gap | Impact | Resolution |
|----|-----|--------|------------|
| G1 | Sportmonks key HTTP 401 | HIGH — cannot validate PSL/WC2026 coverage | Owner regenerates key at https://app.sportmonks.com/api-tokens |
| G2 | PSL NOT in SportsDataIO competition list | HIGH — SportsDataIO may not cover PSL at any plan tier | Owner verifies PSL availability on Sportmonks once key is fixed |
| G3 | EC2 staging migration not applied | MEDIUM — cannot run EC2 live smoke | Configure EC2 DATABASE_URL + authorize migration apply |
| G4 | No admin JWT for authed smoke checks | LOW — non-auth checks pass | Provide SMOKE_ADMIN_TOKEN for complete smoke run |
| G5 | Commercial terms not reviewed | HIGH (gate before production) | Owner reviews Sportmonks pricing for PSL data rights |
| G6 | WC2026 on SportsDataIO unverified | MEDIUM — in list but fixture data blocked on trial | Purchase paid SportsDataIO plan or validate on Sportmonks |
| G7 | SportsDataIO not wired to DataProviderService | LOW for now | Intentional — decision deferred pending provider validation |
| G8 | Vercel CI deployment blocked | LOW (non-blocking) | Preview URL live at known URL |
