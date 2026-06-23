# Sprint 26 — Story Matrix

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)
**Overall Status:** CONDITIONAL_GO

PSL remains inactive. Wallet remains sandbox-only.

---

## Story Matrix

| Story ID | Title                                  | Type         | Status           | Deliverable                                              |
|----------|----------------------------------------|--------------|------------------|----------------------------------------------------------|
| S26-01   | Local IDE Typecheck Status             | QA           | COMPLETE         | `docs/qa/SPRINT-26-LOCAL-IDE-TYPECHECK-STATUS.md`        |
| S26-02   | UAT Personas Definition                | QA           | COMPLETE         | `docs/qa/SPRINT-26-UAT-PERSONAS.md`                      |
| S26-03   | Admin Portal UAT                       | QA           | CONDITIONAL_PASS | `docs/qa/SPRINT-26-ADMIN-PORTAL-UAT.md`                  |
| S26-04   | Club Portal UAT                        | QA           | CONDITIONAL_PASS | `docs/qa/SPRINT-26-CLUB-PORTAL-UAT.md`                   |
| S26-05   | Sponsor Portal UAT                     | QA           | CONDITIONAL_PASS | `docs/qa/SPRINT-26-SPONSOR-PORTAL-UAT.md`                |
| S26-06   | Fan Experience UAT                     | QA           | PASS             | `docs/qa/SPRINT-26-FAN-EXPERIENCE-UAT.md`                |
| S26-07   | RBAC Smoke Results                     | QA           | CONDITIONAL_PASS | `docs/qa/SPRINT-26-RBAC-SMOKE-RESULTS.md`                |
| S26-08   | Portal Route Smoke Tool                | TOOLING      | COMPLETE         | `tools/staging/sprint-26-portal-route-smoke.mjs`         |
| S26-09   | Role Route Smoke Tool                  | TOOLING      | COMPLETE         | `tools/staging/sprint-26-role-route-smoke.mjs`           |
| S26-10   | UAT Issue Log                          | QA           | COMPLETE         | `docs/qa/SPRINT-26-UAT-ISSUE-LOG.md`                     |
| S26-11   | QA Decision Register                   | QA           | COMPLETE         | `docs/qa/SPRINT-26-QA-DECISION-REGISTER.md`              |
| S26-12   | API Contract Closure Plan              | PLANNING     | COMPLETE         | `docs/qa/SPRINT-26-API-CONTRACT-CLOSURE-PLAN.md`         |
| S26-13   | Sprint 26 Handover Docs                | HANDOVER     | COMPLETE         | `docs/handover/SPRINT-26-*.md`, `docs/sprints/` matrix   |

---

## Test Evidence

| Metric                       | Value        |
|------------------------------|--------------|
| API tests passing            | 1,968        |
| Experience tests passing     | 1,063+       |
| Spec test additions (S26)    | ~60 new tests|
| Typecheck (API)              | PASS         |
| Typecheck (Experience)       | PASS         |
| Experience build             | PASS         |

---

## Issue Summary

| Severity    | Count |
|-------------|-------|
| BLOCKER     | 0     |
| HIGH        | 0     |
| MEDIUM      | 0     |
| LOW         | 1     |
| UX_POLISH   | 1     |
| API_PENDING | 2     |
| OWNER_GATE  | 5     |
| **Total**   | **9** |

---

## RBAC Smoke Summary

| Persona        | Status        |
|----------------|---------------|
| PSL_ADMIN      | 8/0 PASS      |
| CLUB_ADMIN     | PENDING_TOKEN |
| SPONSOR_ADMIN  | PENDING_TOKEN |
| FAN            | PASS          |
| ANONYMOUS      | PASS          |

---

## Portal Route Smoke Summary

| Category  | Routes | 5xx | 404 (RBAC) | Status |
|-----------|--------|-----|------------|--------|
| Fan       | 4      | 0   | 0          | PASS   |
| Admin     | 22     | 0   | 22         | PASS   |
| Club      | 14     | 0   | 14         | PASS   |
| Sponsor   | 13     | 0   | 13         | PASS   |
| **Total** | **53** | **0** | **49**  | **PASS** |

---

## Known Gaps

| ID        | Description                                | Severity    |
|-----------|--------------------------------------------|-------------|
| GAP-26-01 | Club portal API (6 endpoints)              | API_PENDING |
| GAP-26-02 | Sponsor portal API (7 endpoints)           | API_PENDING |
| GAP-26-03 | CLUB_ADMIN staging smoke                   | OWNER_GATE  |
| GAP-26-04 | SPONSOR_ADMIN staging smoke                | OWNER_GATE  |
| GAP-26-05 | PSL fixture schedule SOURCE_EMPTY          | EXTERNAL    |
| GAP-26-06 | Sponsor billing ADR not written            | MEDIUM      |
| GAP-26-07 | moduleResolution=node10 deprecation        | LOW         |

---

## Sprint 27 Recommended Focus

1. Provision CLUB_ADMIN JWT + run RBAC smoke
2. Provision SPONSOR_ADMIN JWT + run RBAC smoke
3. Build ClubPortalModule (6 endpoints)
4. Build SponsorPortalModule (7 endpoints)
5. Author Sponsor Billing ADR
6. Monitor psl.co.za for PSL fixture schedule

---

## Safety Confirmations

- PSL remains inactive.
- Wallet remains sandbox-only.
- No production ingestion.
- No scheduled ingestion.
- No real-money functionality.
- No admin JWT token values committed.
- No provider API keys committed or exposed to frontend.
- No fixture import write performed.
- No PSL activation performed.
