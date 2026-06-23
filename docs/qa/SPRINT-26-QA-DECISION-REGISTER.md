# Sprint 26 — QA Decision Register

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)

---

## Decision 1: Accept 404 on portal routes without auth

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| ID          | QA-DEC-26-01                                                        |
| Date        | 2026-06-23                                                          |
| Decision    | Accept HTTP 404 responses on `/admin/*`, `/club/*`, `/sponsor/*` when accessed without authentication. |
| Rationale   | The RBAC guard correctly denies unauthenticated requests. 404 is not a server error (not 5xx). The application is healthy. This is the expected behaviour of the guard, not missing pages. |
| Alternatives considered | (a) Return 401 Unauthorized — requires auth middleware change; (b) Redirect to login — UX improvement but not a correctness issue. |
| Impact      | Testers must authenticate before testing portal routes. Portal route smoke tool counts 404 as non-failure. |
| Status      | ACCEPTED                                                            |

---

## Decision 2: Accept API_PENDING states for club/sponsor portals — backend contracts to be built in Sprint 27

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| ID          | QA-DEC-26-02                                                        |
| Date        | 2026-06-23                                                          |
| Decision    | Accept that 14 club portal and 13 sponsor portal API endpoints are frontend-only (API_PENDING). Pages render with mock/static data. This is acceptable for Sprint 26 controlled testing. |
| Rationale   | The portals were introduced in Sprint 25 as frontend shells with defined API contracts. Backend implementation is Sprint 27 scope. Controlled testing of the admin and fan experience is not blocked by this gap. |
| Alternatives considered | (a) Implement backend now — scope creep, risks stability; (b) Block portals from testing — unnecessary, visual review is valuable. |
| Impact      | Club and sponsor portals show mock data. CLUB_ADMIN and SPONSOR_ADMIN personas cannot complete end-to-end flows. |
| Status      | ACCEPTED — Sprint 27 closure plan in `SPRINT-26-API-CONTRACT-CLOSURE-PLAN.md` |

---

## Decision 3: Accept CLUB_ADMIN/SPONSOR_ADMIN PENDING_TOKEN — provisioning is owner gate

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| ID          | QA-DEC-26-03                                                        |
| Date        | 2026-06-23                                                          |
| Decision    | Accept PENDING_TOKEN status for CLUB_ADMIN and SPONSOR_ADMIN on staging. RBAC smoke for these personas cannot be completed in Sprint 26. |
| Rationale   | JWT provisioning for new roles requires owner action (creating test accounts, assigning roles, issuing JWTs). The RBAC implementation is correct (confirmed by Sprint 23 fix + 36 guard tests). The PENDING_TOKEN is an operational gap, not a code defect. |
| Alternatives considered | (a) Provision tokens now — requires owner action, cannot be done by engineering unilaterally; (b) Use PSL_ADMIN token for all roles — would bypass RBAC testing intent. |
| Impact      | Club and sponsor portal RBAC cannot be confirmed on staging until tokens are provisioned. Sprint 26 RBAC smoke is CONDITIONAL for these personas. |
| Status      | ACCEPTED — Sprint 27 action: owner provisions tokens, engineering runs smoke |

---

## Decision 4: moduleResolution=node10 deprecation flagged as LOW tech debt, safe to defer

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| ID          | QA-DEC-26-04                                                        |
| Date        | 2026-06-23                                                          |
| Decision    | Do NOT change `moduleResolution` in `tsconfig.json` in Sprint 26. Flag as LOW tech debt and defer to a dedicated tech-debt sprint. |
| Rationale   | The deprecation warning does not affect current builds, tests, or deployment. Changing `moduleResolution` affects all TypeScript path resolution across NestJS and Next.js packages and requires careful validation. Making this change without dedicated testing risks breaking imports across the monorepo. TypeScript 7.0 is not yet released. |
| Alternatives considered | (a) Fix now — risky, scope creep; (b) Suppress warning — masks a real issue; (c) Defer — safe, no immediate impact. |
| Impact      | Deprecation warning may appear in build output. No functional impact. |
| Status      | ACCEPTED — tracked as GAP-26-07 |

---

## Decision 5: Sponsor billing ADR required before implementation

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| ID          | QA-DEC-26-05                                                        |
| Date        | 2026-06-23                                                          |
| Decision    | The `/sponsor/billing-placeholder` page must remain a placeholder until a Sponsor Billing ADR is authored, reviewed, and approved. No billing implementation proceeds without an ADR. |
| Rationale   | Billing systems involve financial, legal, and compliance requirements. These must be documented as architecture decisions before implementation begins. The explicit `/billing-placeholder` URL communicates this to all stakeholders. |
| Alternatives considered | (a) Implement billing without ADR — compliance and legal risk; (b) Remove billing page — hides the requirement; (c) Placeholder with ADR gate — correct approach. |
| Impact      | Sponsor billing is not functional in Sprint 26 or Sprint 27 (unless ADR is completed). |
| Status      | ACCEPTED — tracked as GAP-26-06 |

---

## Register Summary

| ID              | Topic                                          | Status   |
|-----------------|------------------------------------------------|----------|
| QA-DEC-26-01   | 404 on portal routes without auth              | ACCEPTED |
| QA-DEC-26-02   | API_PENDING states accepted for Sprint 26      | ACCEPTED |
| QA-DEC-26-03   | PENDING_TOKEN accepted for CLUB/SPONSOR roles  | ACCEPTED |
| QA-DEC-26-04   | moduleResolution deferral                      | ACCEPTED |
| QA-DEC-26-05   | Sponsor billing ADR gate                       | ACCEPTED |
