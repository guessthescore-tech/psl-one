# Sprint 26 — UAT Personas

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)

## Overview

Five personas are defined for user acceptance testing. Tokens and passwords are NEVER committed.

---

## Persona 1: PSL_ADMIN

| Field                | Value                                                                 |
|----------------------|-----------------------------------------------------------------------|
| Role                 | `PSL_ADMIN`                                                           |
| Description          | Platform administrator with full admin portal access                  |
| Test Account Status  | CONFIRMED — token provisioned on staging (Sprint 24)                  |
| Staging JWT          | NOT committed — stored in secure handover (owner only)                |

**Accessible routes:**
- All `/admin/*` routes (21 pages)
- Read-only views of all PSL entities

**Blocked routes:**
- PSL activation (`/admin/competitions` — activate button disabled, owner gate)
- Fixture import write (disabled, owner gate)
- `/club/*` — RBAC denied (wrong role)
- `/sponsor/*` — RBAC denied (wrong role)

**Known limitations:**
- PSL activation is owner-gated (not yet authorised)
- Fixture import write is owner-gated (not yet authorised)
- RBAC smoke confirmed 8/0 PASS in Sprint 24 (re-confirmed Sprint 24 EC2 deployment)

**Test data dependencies:**
- World Cup 2026 season active
- 96 provisional PSL players seeded
- 16 clubs seeded
- No PSL fixtures published yet (SOURCE_EMPTY expected until ~July/Aug 2026)

**API_PENDING limitations:** None — admin API contracts exist and are backed by NestJS endpoints.

---

## Persona 2: CLUB_ADMIN

| Field                | Value                                                                 |
|----------------------|-----------------------------------------------------------------------|
| Role                 | `CLUB_ADMIN`                                                          |
| Description          | Club administrator managing club profile, squad, fans, and content    |
| Test Account Status  | PENDING_TOKEN — role not yet provisioned on staging                   |
| Staging JWT          | NOT YET ISSUED — owner gate                                           |

**Accessible routes (intended):**
- All `/club/*` routes (14 pages)

**Blocked routes (intended):**
- All `/admin/*` routes — RBAC denied
- All `/sponsor/*` routes — RBAC denied

**Known limitations:**
- CLUB_ADMIN JWT not yet provisioned for staging smoke (GAP-26-03)
- Club portal API contracts are frontend-only (API_PENDING — GAP-26-01)
- Club portal UI renders with mock data until backend endpoints are implemented

**Test data dependencies:**
- 16 clubs seeded in DB
- Club association to CLUB_ADMIN user requires backend implementation

**API_PENDING limitations:**
- 14 club API endpoints are marked API_PENDING (no backend implementation yet)
- Club portal pages render with static/mock data

---

## Persona 3: SPONSOR_ADMIN

| Field                | Value                                                                 |
|----------------------|-----------------------------------------------------------------------|
| Role                 | `SPONSOR_ADMIN`                                                       |
| Description          | Sponsor managing campaigns, audiences, activations, and analytics     |
| Test Account Status  | PENDING_TOKEN — role not yet provisioned on staging                   |
| Staging JWT          | NOT YET ISSUED — owner gate                                           |

**Accessible routes (intended):**
- All `/sponsor/*` routes (13 pages including `/sponsor/billing-placeholder`)

**Blocked routes (intended):**
- All `/admin/*` routes — RBAC denied
- All `/club/*` routes — RBAC denied

**Known limitations:**
- SPONSOR_ADMIN JWT not yet provisioned for staging smoke (GAP-26-04)
- Sponsor portal API contracts are frontend-only (API_PENDING — GAP-26-02)
- Billing page is explicitly a placeholder pending Sponsor Billing ADR (GAP-26-06)
- All sponsor rewards are NON_FINANCIAL — no cash payouts, no betting language

**Test data dependencies:**
- Sponsor campaigns seeded in DB
- Sponsor association to SPONSOR_ADMIN user requires backend implementation

**API_PENDING limitations:**
- 13 sponsor API endpoints are marked API_PENDING (no backend implementation yet)
- Sponsor portal pages render with static/mock data
- Billing ADR not yet written

---

## Persona 4: FAN

| Field                | Value                                                                 |
|----------------------|-----------------------------------------------------------------------|
| Role                 | `FAN` (authenticated)                                                 |
| Description          | Registered fan using prediction, fantasy, and account features        |
| Test Account Status  | CONFIRMED — testable via Vercel preview with fan registration flow    |

**Accessible routes:**
- `/` — homepage (World Cup beta)
- `/predict` — predict match outcomes (points-only, no betting/odds/cash)
- `/predict/challenge` — direct challenges (points-only)
- `/predict/challenge/accept` — accept challenges (points-only)
- `/fantasy` — fantasy team management (points-only, no real money)
- `/account` — profile, preferences, notification settings

**Blocked routes:**
- All `/admin/*` — RBAC denied
- All `/club/*` — RBAC denied
- All `/sponsor/*` — RBAC denied

**Known limitations:**
- GTS (Guess the Score) is points-only — no real-money prizes
- Fantasy is points-only — no real-money prizes
- World Cup 2026 is active beta context — PSL NOT active
- No betting, odds, wager, or stake language on any fan page

**Test data dependencies:**
- World Cup 2026 active with published fixtures
- Fan registration via experience app

---

## Persona 5: ANONYMOUS

| Field                | Value                                                                 |
|----------------------|-----------------------------------------------------------------------|
| Role                 | Unauthenticated visitor                                               |
| Description          | Public visitor with access to public-facing pages only                |
| Test Account Status  | No account needed                                                     |

**Accessible routes (public):**
- `/` — homepage (World Cup beta, public)

**Blocked routes:**
- `/predict` — redirects to login (or 401/404 without session)
- `/fantasy` — redirects to login
- `/account` — redirects to login
- All `/admin/*` — 404/401 (RBAC guard, no auth)
- All `/club/*` — 404/401 (RBAC guard, no auth)
- All `/sponsor/*` — 404/401 (RBAC guard, no auth)

**Known limitations:**
- Portal routes return 404 without auth (RBAC guard behaviour — accepted, see QA Decision 1)
- No login page in experience app currently (noted as UX_POLISH)

---

## Safety Confirmation

- No passwords or JWTs are committed in this document.
- PSL remains inactive.
- Wallet remains sandbox-only.
- All fan-facing content is points-only with no real-money functionality.
- No betting, odds, or wager language appears on any accessible page.
