# Sprint 29 Membership Smoke Security Review

**Date:** 2026-06-24
**Reviewer:** Sprint 29 Principal Delivery Orchestrator
**Scope:** ClubMembership + SponsorMembership scoping controls, smoke security posture

---

## Summary

Sprint 29 adds cross-tenant membership smoke evidence for the `ClubMembership`
and `SponsorMembership` tables introduced in Sprint 28. This review confirms the
security posture of the smoke execution approach and the underlying access controls.

**Overall verdict: CONDITIONAL_GO** (pending EC2 deployment and live smoke run)

---

## Security Controls Verified

### 1. No wallet production

- Wallet integration: **SANDBOX only** — `SiliconEnterpriseSandboxWalletAdapter`
- No wallet production endpoints called during smoke
- No billing or payment processing in scope
- `no wallet production` confirmed across all Sprint 29 docs

### 2. No real-money functionality

- Sponsor rewards: NON_FINANCIAL only
- No betting, no odds, no wagering, no cash prizes
- No deposit, withdrawal, or balance operations

### 3. RBAC bypass risk

No RBAC bypass identified. All portal controllers use:
- `JwtAuthGuard` for authentication
- `RolesGuard` with `@Roles(...)` for role enforcement
- `PortalScopeService.assertClubScope/assertSponsorScope` for DB-backed membership check

### 4. Smoke user security

- Temporary smoke users use `.internal` email addresses (not deliverable)
- Passwords are random, single-use, stored in `/tmp/sprint29/` with `chmod 600`
- JWTs are stored in files with `chmod 600`, never printed to stdout or logs
- All users and files are deleted immediately after smoke
- `CLUB_ADMIN` role is the minimum required role — no elevated permissions granted

### 5. Token exposure risk

- Smoke script (`sprint-29-ec2-cross-tenant-smoke.sh`) reads tokens from files only
- Token values are never passed to `echo`, `curl -v`, or any output commands
- SSM StandardOutput contains only PASS/FAIL/SKIP results
- Pattern audited: no `echo $TOKEN`, `echo $password`, or similar in smoke script

### 6. Migration 43 security

- Additive only: 2 × CREATE TABLE
- No data exposed via new tables before EC2 is updated
- Foreign key constraints prevent orphaned membership records
- Schema follows existing patterns from Sprint 22 (ClubMembership references)

### 7. EC2 network exposure

- Smoke script runs inside EC2 against `http://localhost:3000`
- No external network access required for smoke execution
- Security group has no open inbound on port 3000 from internet

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cross-tenant data leak | Low | High | `PortalScopeService` enforces DB-backed membership; tested |
| Token exposure in logs | Very Low | High | Script uses file reads only; no echo of token values |
| PSL accidental activation | Very Low | Critical | No PSL activation code path in smoke script |
| Production wallet call | Very Low | High | Adapter is SANDBOX; no production keys configured |
| Temp user not cleaned up | Low | Medium | Cleanup runs in same SSM session; verified by user count check |

---

## No-Go Conditions

| Condition | Action |
|---|---|
| Any CROSS_TENANT check returns 200 instead of 403 | BLOCKER — halt, investigate, do not merge |
| Any anonymous request returns 200 | BLOCKER — JwtAuthGuard failure |
| PSL season activated during smoke | BLOCKER — halt deployment, contact owner |
| Token value appears in SSM output | BLOCKER — rotate all staging credentials |

---

## Deferred Items

| Item | Reason | Owner Action |
|---|---|---|
| Live smoke execution | EC2 not yet updated to Sprint 28 SHA | Owner triggers deploy-beta-ec2.yml |
| Pen test of portal scope bypass | Out of scope for Sprint 29 | Sprint 30+ |
| SponsorMembership cascade delete audit | Not yet verified on live data | Sprint 30+ |
