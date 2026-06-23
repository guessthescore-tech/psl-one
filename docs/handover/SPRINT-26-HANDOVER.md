# Sprint 26 — Handover

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)
**Status:** CONDITIONAL_GO

PSL: INACTIVE | Wallet: SANDBOX | GTS: POINTS_ONLY | Fantasy: POINTS_ONLY

---

## Summary of Sprint 26 Deliverables

Sprint 26 adds controlled user testing evidence, portal route smoke tooling, role-based QA
documentation, UAT issue tracking, and API contract closure planning for Sprint 27.

No schema changes, no new migrations, no new API endpoints.

### Deliverables

| Story   | Deliverable                              | Status           |
|---------|------------------------------------------|------------------|
| S26-01  | Local IDE typecheck status               | COMPLETE         |
| S26-02  | UAT personas definition (5 personas)     | COMPLETE         |
| S26-03  | Admin portal UAT (22 routes)             | CONDITIONAL_PASS |
| S26-04  | Club portal UAT (14 routes)              | CONDITIONAL_PASS |
| S26-05  | Sponsor portal UAT (13 routes)           | CONDITIONAL_PASS |
| S26-06  | Fan experience UAT (6 routes)            | PASS             |
| S26-07  | RBAC smoke results                       | CONDITIONAL_PASS |
| S26-08  | Portal route smoke tool                  | COMPLETE         |
| S26-09  | Role route smoke tool                    | COMPLETE         |
| S26-10  | UAT issue log (9 issues tracked)         | COMPLETE         |
| S26-11  | QA decision register (5 decisions)       | COMPLETE         |
| S26-12  | API contract closure plan                | COMPLETE         |
| S26-13  | Handover documentation                   | COMPLETE         |

---

## What Was Tested

- **Admin portal:** 22 routes reviewed. PSL INACTIVE badge, SANDBOX badge, POINTS_ONLY copy,
  SOURCE_EMPTY state, owner-gated action controls all confirmed.
- **Club portal:** 14 routes reviewed visually. No league activation, no fixture import controls,
  fan engagement cards, campaign placeholders confirmed. API_PENDING for 6 backend endpoints.
- **Sponsor portal:** 13 routes reviewed visually. NON_FINANCIAL rewards confirmed, no cash payout
  language, billing explicitly placeholdered. API_PENDING for 7 backend endpoints.
- **Fan experience:** 6 routes confirmed working with World Cup 2026 beta context. Points-only
  copy confirmed on predict and fantasy pages. No betting/odds/cash language.
- **RBAC:** PSL_ADMIN smoke 8/0 PASS (Sprint 24 EC2). CLUB_ADMIN and SPONSOR_ADMIN PENDING_TOKEN.
- **Portal route smoke:** 53 routes tested. 0 5xx failures. 404s on portal routes are
  expected RBAC guard behaviour.
- **Typecheck:** Both packages PASS.

---

## What Passed

- Fan experience UAT: PASS
- PSL_ADMIN RBAC smoke: 8/0 PASS
- Portal route smoke: 0 5xx
- API typecheck: PASS
- Experience typecheck: PASS
- API tests: 1,968 PASS
- Experience tests: 1,063+ PASS
- Admin portal UAT: CONDITIONAL_PASS
- Club portal UAT: CONDITIONAL_PASS (pending CLUB_ADMIN smoke)
- Sponsor portal UAT: CONDITIONAL_PASS (pending SPONSOR_ADMIN smoke)

---

## What Is Pending

| Item                                    | Blocker                  | Sprint 27 Action          |
|-----------------------------------------|--------------------------|---------------------------|
| CLUB_ADMIN staging RBAC smoke           | PENDING_TOKEN (owner)    | Provision JWT + run smoke |
| SPONSOR_ADMIN staging RBAC smoke        | PENDING_TOKEN (owner)    | Provision JWT + run smoke |
| Club portal backend endpoints (6)       | API_PENDING              | Build ClubPortalModule    |
| Sponsor portal backend endpoints (7)    | API_PENDING              | Build SponsorPortalModule |
| Sponsor Billing ADR                     | Not yet authored         | Author ADR-031            |
| PSL fixture availability                | SOURCE_EMPTY (~Jul/Aug)  | Monitor psl.co.za         |

---

## Sprint 27 Recommended Actions

1. **HIGH:** Provision CLUB_ADMIN JWT on staging and run RBAC smoke
2. **HIGH:** Provision SPONSOR_ADMIN JWT on staging and run RBAC smoke
3. **HIGH:** Build ClubPortalModule — 6 GET endpoints
4. **HIGH:** Build SponsorPortalModule — 6 GET + 1 POST endpoint
5. **MEDIUM:** Author Sponsor Billing ADR (ADR-031)
6. **LOW:** Monitor psl.co.za for PSL 2025/26 fixture schedule publication
7. **LOW:** Resolve moduleResolution=node10 TypeScript deprecation in tech-debt sprint

---

## Safety Confirmations

- PSL remains inactive.
- Wallet remains sandbox-only.
- No admin JWT token values were committed.
- No provider API keys were committed.
- No provider API keys are exposed in the frontend.
- No fixture import write was performed.
- No fixture publication was performed.
- No PSL activation was performed.
- No wallet production activation was performed.
- No real-money functionality was added.
- No betting, odds, wager, or cash prize language was added.
