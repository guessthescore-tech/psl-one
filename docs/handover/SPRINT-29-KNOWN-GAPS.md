# Sprint 29 Known Gaps

**Date:** 2026-06-24
**Status:** CONDITIONAL_GO

---

## GAP-29-01: EC2 Deployment Pending

| Field | Value |
|---|---|
| ID | GAP-29-01 |
| Severity | BLOCKER (for live smoke) |
| Description | EC2 beta is running Sprint 24 SHA. Sprint 28 features (ClubMembership, SponsorMembership, PortalScopeService) are not yet live on EC2. |
| Owner action | Trigger `deploy-beta-ec2.yml` with SHA `2605b372df829ea77f76c9c334909d54abdec294` |
| Status | OPEN |

---

## GAP-29-02: Migration 43 Not Applied to EC2

| Field | Value |
|---|---|
| ID | GAP-29-02 |
| Severity | BLOCKER (for live smoke) |
| Description | `20260623000001_club_sponsor_memberships` migration is on `main` but not yet deployed to beta EC2. |
| Owner action | Set `run_migrations=true` in `deploy-beta-ec2.yml` dispatch |
| Status | OPEN |
| Notes | Migration is additive only — 2 × CREATE TABLE — no destructive changes |

---

## GAP-29-03: Cross-Tenant Live Smoke Not Executed

| Field | Value |
|---|---|
| ID | GAP-29-03 |
| Severity | MEDIUM |
| Description | `tools/staging/sprint-29-ec2-cross-tenant-smoke.sh` has been designed and committed but not executed. All 21 checks are pending. |
| Owner action | After GAP-29-01 and GAP-29-02 resolved: run smoke script via SSM |
| Status | OPEN |
| Workaround | Unit tests for `PortalScopeService` cover the same logic in CI |

---

## GAP-29-04: FAN Token Not Available on EC2

| Field | Value |
|---|---|
| ID | GAP-29-04 |
| Severity | LOW |
| Description | Smoke script FAN checks will be SKIPped unless a fan JWT is placed in `/tmp/sprint29/fan_token`. |
| Owner action | Optional: login as a seeded fan user and store token before running smoke |
| Status | OPEN — acceptable skip |

---

## Inherited Gaps (from Sprint 28)

| Gap | Status |
|---|---|
| GAP-28-01: EC2 5 sprints behind | Superseded by GAP-29-01 |
| Sportmonks API key invalid | OPEN — NoOpAdapter is default |
| PSL season not activated | INTENTIONAL — PSL remains inactive |
| SOURCE_EMPTY for PSL ingestion | OPEN — fixtures available July/August |

---

## No-Regression Confirmations

| Feature | Status |
|---|---|
| ClubMembership scoping | Covered by unit tests; live test pending GAP-29-01 |
| SponsorMembership scoping | Covered by unit tests; live test pending GAP-29-01 |
| RBAC for portal controllers | Covered by 1,968 API tests in CI |
| JWT authentication | All portal routes guarded by JwtAuthGuard |
| Wallet sandbox mode | Confirmed — no production wallet adapter active |

---

## Non-Issues (Intentional)

| Item | Why it's intentional |
|---|---|
| PSL remains inactive | Owner has not authorised activation |
| Live smoke PENDING | EC2 deployment not yet triggered |
| No Terraform changes | Infrastructure out of scope for Sprint 29 |
| No new API routes | Sprint 29 is smoke/evidence only; no feature code |
| NON_FINANCIAL scope | No real-money, no billing, no cash rewards — by design |
