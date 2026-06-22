# Sprint 19 — Staging Readiness Assessment

## Overview

This document assesses the readiness of the beta EC2 staging environment for Sprint 18/19 features. No deployment is performed by this document.

**PSL remains inactive. Wallet remains sandbox-only. No real-money functionality.**

---

## Current Environment State

| Component | State | Notes |
|-----------|-------|-------|
| EC2 Instance | `i-0a5f16539c9626f90` | `16.28.84.11`, af-south-1b |
| SSM Agent | ONLINE | Session manager accessible |
| App Container | Sprint 17 image (last deployed 2026-06-17) | Sprint 18/19 images not yet pushed |
| Database | PostgreSQL on EC2 | WC2026 active, PSL inactive; seeded as of 2026-06-17 |
| Migrations applied | 42 (through Sprint 7) | Sprint 18/19 add 0 migrations — no apply needed |
| Caddy proxy | Running | http:// on port 80 |
| API | Running on :3000 | Sprint 17 build |
| PSL Season | INACTIVE | By design |
| WC2026 Season | ACTIVE | Beta context |
| Wallet | SANDBOX | No production wallet |

---

## Sprint 18 Image Status

| Image | Status |
|-------|--------|
| `psl-one-api:sprint-18` | Built and pushed to ECR (via CI Container Build) |
| `psl-one-web:sprint-18` | Built and pushed to ECR |
| `psl-one-api-migrator:sprint-18` | Built and pushed to ECR |

EC2 deployment of Sprint 18 images requires **owner authorization**.

---

## Required Server-Side Env Vars (on EC2)

| Variable | Required | Current Status |
|----------|----------|----------------|
| `DATABASE_URL` | Yes | Set via SSM (EC2 local PostgreSQL) |
| `JWT_SECRET` | Yes | Set via SSM |
| `PARSE_API_KEY` | Yes for ingestion | Set via SSM (Sprint 17) |
| `FOOTBALL_DATA_API_KEY` | Optional fallback | Should be set in SSM |
| `API_FOOTBALL_KEY` | Optional fallback | Should be set in SSM |
| `DATA_PROVIDER` | Optional | Defaults to NoOp |
| `NODE_ENV` | Yes | `production` |

No `NEXT_PUBLIC_*` provider keys are used. Provider keys are server-side only.

---

## Migration Status

Sprint 18 adds **zero migrations**. Sprint 19 adds **zero migrations**. The database at migration 42 is current for all Sprint 18/19 features.

**No migration apply is required before deploying Sprint 18/19 images.**

---

## Admin Auth Availability

Admin tokens are issued via `POST /auth/login` with `role: 'ADMIN'`. The beta seed includes an admin user. Token must be obtained before running admin smoke tools.

---

## Parse PSL Source Status

Parse PSL (psl.co.za) has not published the 2026/27 PSL fixture schedule. Expected ~July/August 2026. All ingestion smoke will return source-empty — this is **expected, not an error**.

---

## Readiness Verdict

| Gate | Status |
|------|--------|
| EC2 instance running | PASS |
| Sprint 18/19 images built | PASS |
| Sprint 18/19 images deployed to EC2 | PENDING OWNER AUTHORIZATION |
| Migration apply required | NO (0 new migrations) |
| Admin token available | PENDING (operator must obtain from beta API) |
| Parse PSL fixture data available | PENDING (~July/August 2026) |
| PSL pre-flight would pass | NO_GO (no fixtures yet) |

**Overall: CONDITIONAL_GO** — deployment tooling is ready, deployment itself requires owner authorization.

---

## Owner Actions Required

1. Authorize EC2 image push and deployment
2. Confirm `PARSE_API_KEY` is set in SSM for beta EC2
3. Obtain admin JWT for smoke testing
4. Run smoke suite after deployment
5. Accept source-empty state as expected (no fixtures until ~July/August 2026)
