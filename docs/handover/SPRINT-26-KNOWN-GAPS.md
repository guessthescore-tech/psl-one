# Sprint 26 — Known Gaps

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)

PSL remains inactive. Wallet remains sandbox-only. No production ingestion.

---

## Gap Register

### GAP-26-01: Club portal API contracts API_PENDING (6 endpoints)

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| ID          | GAP-26-01                                                             |
| Severity    | API_PENDING                                                           |
| Area        | Club Portal                                                           |
| Description | 6 club portal API endpoints defined in `club-portal-api.ts` have no backend NestJS implementation. Pages render with mock data. |
| Endpoints   | `GET /club/:clubId/profile`, `GET /club/:clubId/squad`, `GET /club/:clubId/fixtures`, `GET /club/:clubId/fans`, `GET /club/:clubId/analytics`, `GET /club/:clubId/content` |
| Impact      | CLUB_ADMIN cannot manage club data end-to-end via the portal.        |
| Resolution  | Sprint 27: Implement `ClubPortalModule` with all 6 endpoint contracts. |
| Status      | OPEN                                                                  |

---

### GAP-26-02: Sponsor portal API contracts API_PENDING (7 endpoints)

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| ID          | GAP-26-02                                                             |
| Severity    | API_PENDING                                                           |
| Area        | Sponsor Portal                                                        |
| Description | 7 sponsor portal API endpoints defined in `sponsor-portal-api.ts` have no backend NestJS implementation. Pages render with mock data. |
| Endpoints   | `GET /sponsors/:id`, `GET /sponsors/:id/campaigns`, `POST /sponsors/:id/campaigns`, `GET /sponsors/:id/rewards`, `GET /sponsors/:id/audiences`, `GET /sponsors/:id/activations`, `GET /sponsors/:id/analytics` |
| Impact      | SPONSOR_ADMIN cannot manage campaigns end-to-end via the portal.     |
| Resolution  | Sprint 27: Implement `SponsorPortalModule` with all 7 endpoint contracts. |
| Status      | OPEN                                                                  |

---

### GAP-26-03: CLUB_ADMIN staging smoke PENDING_TOKEN

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| ID          | GAP-26-03                                                             |
| Severity    | OWNER_GATE                                                            |
| Area        | RBAC — Club Portal                                                    |
| Description | No CLUB_ADMIN JWT has been provisioned on staging. Club portal RBAC smoke (`sprint-26-role-route-smoke.mjs`) cannot be run for the CLUB_ADMIN persona. |
| Impact      | Club portal RBAC is unconfirmed on staging.                          |
| Resolution  | Owner provisions CLUB_ADMIN test account on staging; engineering runs `CLUB_ADMIN_TOKEN=<jwt> node sprint-26-role-route-smoke.mjs` |
| Status      | OPEN — pending owner action                                           |

---

### GAP-26-04: SPONSOR_ADMIN staging smoke PENDING_TOKEN

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| ID          | GAP-26-04                                                             |
| Severity    | OWNER_GATE                                                            |
| Area        | RBAC — Sponsor Portal                                                 |
| Description | No SPONSOR_ADMIN JWT has been provisioned on staging. Sponsor portal RBAC smoke (`sprint-26-role-route-smoke.mjs`) cannot be run for the SPONSOR_ADMIN persona. |
| Impact      | Sponsor portal RBAC is unconfirmed on staging.                       |
| Resolution  | Owner provisions SPONSOR_ADMIN test account on staging; engineering runs `SPONSOR_ADMIN_TOKEN=<jwt> node sprint-26-role-route-smoke.mjs` |
| Status      | OPEN — pending owner action                                           |

---

### GAP-26-05: PSL fixture schedule not yet published (SOURCE_EMPTY, expected ~July/Aug 2026)

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| ID          | GAP-26-05                                                             |
| Severity    | EXTERNAL                                                              |
| Area        | Fixture Ingestion                                                     |
| Description | psl.co.za has not yet published the 2025/26 PSL fixture schedule. Parse.bot scraping returns SOURCE_EMPTY. No PSL fixtures can be ingested until the schedule is available. |
| Impact      | PSL fixture dry-run returns zero candidates. PSL cannot be activated until fixtures are available and published. |
| Resolution  | Monitor psl.co.za. When fixtures appear, run `sprint-25-psl-fixture-availability-check.mjs` and then `sprint-19-psl-preflight-smoke.mjs` to confirm readiness. |
| Status      | OPEN — external dependency (~July/Aug 2026 expected)                 |

---

### GAP-26-06: Sponsor billing ADR not yet written

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| ID          | GAP-26-06                                                             |
| Severity    | MEDIUM                                                                |
| Area        | Sponsor Portal — Billing                                              |
| Description | No Architecture Decision Record exists for sponsor billing. The `/sponsor/billing-placeholder` page is intentionally a placeholder. Implementation cannot begin without a reviewed ADR. |
| Impact      | Sponsor billing functionality unavailable. `createSponsorCampaign` cannot include billing integration. |
| Resolution  | Sprint 27 (or later): Author `docs/adr/ADR-031-sponsor-billing.md`. Review covers: payment provider, compliance, settlement, refunds, sandbox-first approach. Owner approval required. |
| Status      | OPEN                                                                  |

---

### GAP-26-07: moduleResolution=node10 TypeScript deprecation (LOW, deferred)

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| ID          | GAP-26-07                                                             |
| Severity    | LOW                                                                   |
| Area        | TypeScript configuration                                              |
| Description | `moduleResolution: "node10"` is deprecated as of TypeScript 5.x and will stop functioning in TypeScript 7.0. |
| Impact      | None currently. Future risk when TS 7.0 is adopted.                 |
| Resolution  | Dedicated tech-debt sprint: migrate to `moduleResolution: "bundler"` or `"node16"` with full monorepo path validation. |
| Status      | OPEN — deferred (LOW priority)                                        |

---

## Gap Summary

| ID       | Area                          | Severity    | Status  |
|----------|-------------------------------|-------------|---------|
| GAP-26-01 | Club portal API (6 endpoints) | API_PENDING | OPEN    |
| GAP-26-02 | Sponsor portal API (7 endpoints) | API_PENDING | OPEN  |
| GAP-26-03 | CLUB_ADMIN staging smoke      | OWNER_GATE  | OPEN    |
| GAP-26-04 | SPONSOR_ADMIN staging smoke   | OWNER_GATE  | OPEN    |
| GAP-26-05 | PSL fixture schedule          | EXTERNAL    | OPEN    |
| GAP-26-06 | Sponsor billing ADR           | MEDIUM      | OPEN    |
| GAP-26-07 | moduleResolution deprecation  | LOW         | OPEN    |

**No BLOCKER or HIGH gaps. Platform is safe for controlled user testing.**

---

## Persistent Platform Constraints

- PSL remains inactive.
- Wallet remains sandbox-only.
- No production ingestion.
- No scheduled ingestion.
- No real-money functionality.
- No gambling or monetary prize functionality.
