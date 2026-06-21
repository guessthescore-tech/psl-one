# Sprint 10 — Known Gaps

| ID | Gap | Impact | Resolution |
|----|-----|--------|------------|
| G1 | ~~Sportmonks key HTTP 401~~ | ~~HIGH~~ | **CLOSED** — Sportmonks REJECTED (Sprint 10 amendment 2026-06-22) |
| G2 | Primary provider UNDECIDED | HIGH — no live fixture data in staging | Review `SPRINT-10-NEW-PROVIDER-SHORTLIST.md`; select provider with PSL coverage |
| G3 | EC2 staging migration not applied | MEDIUM — cannot run EC2 live smoke | Configure EC2 DATABASE_URL + authorize migration apply |
| G4 | No admin JWT for authed smoke checks | LOW — non-auth checks pass | Provide SMOKE_ADMIN_TOKEN for complete smoke run |
| G5 | Commercial terms not reviewed for chosen provider | HIGH (gate before production) | Owner reviews pricing once replacement provider is selected |
| G6 | WC2026 on SportsDataIO unverified | MEDIUM — in list but fixture data blocked on trial | Purchase paid SportsDataIO plan or use replacement primary provider |
| G7 | SportsDataIO not wired to DataProviderService | LOW for now | Intentional — decision deferred pending primary provider selection |
| G8 | Vercel CI deployment blocked | LOW (non-blocking) | Preview URL live at known URL |
