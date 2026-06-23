# Sprint 26 — UAT Issue Log

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)

---

## Issue Severity Key

| Severity     | Meaning                                                          |
|--------------|------------------------------------------------------------------|
| BLOCKER      | Prevents launch — must fix before any release                    |
| HIGH         | Significant impact — must fix before controlled user testing     |
| MEDIUM       | Reduces quality — should fix before public launch                |
| LOW          | Minor — can be deferred                                          |
| UX_POLISH    | Visual/interaction improvement, no functional impact             |
| API_PENDING  | Frontend contract exists; backend not yet implemented            |
| OWNER_GATE   | Requires explicit owner approval before action can proceed       |

---

## Issue Register

### ISS-26-01 — API_PENDING: Club portal API contracts not yet backed by backend endpoints

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| Severity    | API_PENDING                                                         |
| GAP ref     | GAP-26-01                                                           |
| Area        | Club Portal (`/club/*`)                                             |
| Description | 14 club portal API endpoints are defined in `club-portal-api.ts` but have no backend NestJS implementation. Pages render with mock/static data. |
| Impact      | Club portal is functionally incomplete. CLUB_ADMIN cannot manage club data end-to-end. |
| Resolution  | Implement ClubPortalModule in Sprint 27 with all 14 endpoint contracts. |
| Status      | OPEN — Sprint 27 backlog                                            |

---

### ISS-26-02 — API_PENDING: Sponsor portal API contracts not yet backed by backend endpoints

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| Severity    | API_PENDING                                                         |
| GAP ref     | GAP-26-02                                                           |
| Area        | Sponsor Portal (`/sponsor/*`)                                       |
| Description | 13 sponsor portal API endpoints are defined in `sponsor-portal-api.ts` but have no backend NestJS implementation. Pages render with mock/static data. |
| Impact      | Sponsor portal is functionally incomplete. SPONSOR_ADMIN cannot manage campaigns end-to-end. |
| Resolution  | Implement SponsorPortalModule in Sprint 27 with all 13 endpoint contracts. |
| Status      | OPEN — Sprint 27 backlog                                            |

---

### ISS-26-03 — OWNER_GATE: PSL activation not yet authorised

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| Severity    | OWNER_GATE                                                          |
| GAP ref     | (no GAP number — ongoing gate)                                      |
| Area        | Admin Portal — Competition Activation                               |
| Description | PSL 2025/26 season activation requires explicit owner approval. The activate button is disabled. PSL INACTIVE state must be maintained until authorisation. |
| Impact      | PSL fan content is unavailable. World Cup beta is the active context. |
| Resolution  | Owner approves activation after: fixtures published, dry-run reviewed, pre-flight reaches GO. |
| Status      | OPEN — pending owner authorisation                                  |

---

### ISS-26-04 — OWNER_GATE: Fixture import write not yet authorised

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| Severity    | OWNER_GATE                                                          |
| Area        | Admin Portal — Fixture Import                                       |
| Description | Fixture import write (publishing fixtures from psl.co.za) requires owner approval. Dry-run only is permitted. PSL fixtures not yet available from source (~July/Aug 2026). |
| Impact      | No PSL fixtures can be published until source and owner gate are cleared. |
| Resolution  | Owner approves write after: dry-run candidates reviewed, team resolution approved. |
| Status      | OPEN — pending owner authorisation + SOURCE availability            |

---

### ISS-26-05 — OWNER_GATE: Wallet production not yet authorised

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| Severity    | OWNER_GATE                                                          |
| Area        | Wallet — Production Adapter                                         |
| Description | Wallet is on `SiliconEnterpriseSandboxWalletAdapter`. Production wallet requires owner approval and compliance review. |
| Impact      | No real-money transactions possible. All wallet operations are sandboxed. |
| Resolution  | Owner approves after compliance review, production adapter tested. |
| Status      | OPEN — pending owner authorisation                                  |

---

### ISS-26-06 — OWNER_GATE: CLUB_ADMIN JWT not yet provisioned for staging smoke

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| Severity    | OWNER_GATE                                                          |
| GAP ref     | GAP-26-03                                                           |
| Area        | RBAC — Club Portal                                                  |
| Description | No CLUB_ADMIN JWT has been issued for staging. Club portal RBAC smoke cannot be completed. |
| Impact      | Club portal RBAC cannot be verified on staging.                    |
| Resolution  | Owner provisions CLUB_ADMIN test account on staging. |
| Status      | OPEN — pending owner action                                         |

---

### ISS-26-07 — OWNER_GATE: SPONSOR_ADMIN JWT not yet provisioned for staging smoke

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| Severity    | OWNER_GATE                                                          |
| GAP ref     | GAP-26-04                                                           |
| Area        | RBAC — Sponsor Portal                                               |
| Description | No SPONSOR_ADMIN JWT has been issued for staging. Sponsor portal RBAC smoke cannot be completed. |
| Impact      | Sponsor portal RBAC cannot be verified on staging.                 |
| Resolution  | Owner provisions SPONSOR_ADMIN test account on staging. |
| Status      | OPEN — pending owner action                                         |

---

### ISS-26-08 — UX_POLISH: Portal routes return 404 without auth (expected, but could redirect to login)

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| Severity    | UX_POLISH                                                           |
| Area        | All portals — unauthenticated access                                |
| Description | Accessing `/admin`, `/club`, or `/sponsor` without authentication returns 404 from the RBAC guard. This is correct behaviour but the UX could be improved with a redirect to a login page. |
| Impact      | Low — testers need to know to authenticate first. No functional issue. |
| Resolution  | Add middleware redirect to login page (low priority). |
| Status      | OPEN — UX polish backlog                                            |

---

### ISS-26-09 — LOW: moduleResolution=node10 TypeScript deprecation warning

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| Severity    | LOW                                                                 |
| GAP ref     | GAP-26-07                                                           |
| Area        | TypeScript configuration                                            |
| Description | `moduleResolution: "node10"` in tsconfig is deprecated. TypeScript warns it will stop functioning in TS 7.0. Does not block builds or tests currently. |
| Impact      | None now. Future risk when TypeScript 7.0 is adopted.             |
| Resolution  | Migrate to `moduleResolution: "bundler"` or `"node16"` in a dedicated tech-debt sprint with full path validation. |
| Status      | OPEN — deferred (LOW, GAP-26-07)                                   |

---

## Issue Count by Severity

| Severity     | Count |
|--------------|-------|
| BLOCKER      | 0     |
| HIGH         | 0     |
| MEDIUM       | 0     |
| LOW          | 1     |
| UX_POLISH    | 1     |
| API_PENDING  | 2     |
| OWNER_GATE   | 5     |
| **Total**    | **9** |

**No BLOCKER or HIGH issues. Sprint 26 is CONDITIONAL_GO.**

---

## Safety Confirmation

- No JWT token values appear in this document.
- No provider API key values appear in this document.
- PSL remains inactive.
- Wallet remains sandbox-only.
- No real-money functionality is referenced.
