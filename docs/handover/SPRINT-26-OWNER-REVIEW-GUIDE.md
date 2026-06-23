# Sprint 26 — Owner Review Guide

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)

PSL remains inactive. Wallet remains sandbox-only.

---

## What to Review This Sprint

Sprint 26 is a QA and controlled testing sprint. No new features, no schema changes, no new
API endpoints. The deliverables are:

- QA documentation (`docs/qa/`)
- Handover documentation (`docs/handover/`)
- Smoke tools (`tools/staging/`)
- Experience spec additions (doc existence + safety assertions)

---

## How to Review the Admin Portal

### Step 1: Read the Admin UAT doc
`docs/qa/SPRINT-26-ADMIN-PORTAL-UAT.md`

Verify:
- PSL INACTIVE badge is listed as PASS
- SANDBOX wallet badge is listed as PASS
- POINTS_ONLY copy is listed as PASS
- Fixture import write is listed as OWNER_GATE (disabled — correct)
- PSL activation is listed as OWNER_GATE (disabled — correct)

### Step 2: Open the admin portal on staging
URL: `https://staging.psl-one.app/admin/overview` (requires PSL_ADMIN JWT)

Confirm:
- "PSL: INACTIVE" appears in the overview
- "SANDBOX" wallet badge is visible
- "Points only" copy appears on GTS and Fantasy rules pages
- "SOURCE_EMPTY" state appears on the readiness/fixture pages

### Step 3: Run the admin portal route smoke
```bash
BASE_URL=https://staging.psl-one.app node tools/staging/sprint-26-portal-route-smoke.mjs
```
Expected: 0 5xx failures.

---

## How to Test the Fan Experience

### On Vercel preview:
URL: `https://psl-one-experience-preview-cxb5urftw-guess-the-score.vercel.app`

Check:
1. Homepage `/` loads with World Cup 2026 content — no auth required
2. `/predict` shows points-only prediction for World Cup matches
3. `/fantasy` shows points-only fantasy management
4. `/account` accessible after fan login
5. No gambling or monetary prize language anywhere

### What you should NOT see:
- "Bet now" or any betting call to action
- Odds (e.g. 2.5, 1/2, 3.00)
- "Win money" or any monetary prize
- Gambling or third-party sportsbook language
- PSL fixtures (PSL is INACTIVE — only World Cup matches visible)

---

## What to Approve Next

### Approve: CLUB_ADMIN JWT for staging smoke (GAP-26-03)
1. Create a test user account on staging
2. Assign `CLUB_ADMIN` role to the account
3. Issue a JWT (or share login credentials via secure channel — NOT via git)
4. Engineering will run: `CLUB_ADMIN_TOKEN=<jwt> node tools/staging/sprint-26-role-route-smoke.mjs`

### Approve: SPONSOR_ADMIN JWT for staging smoke (GAP-26-04)
1. Create a test user account on staging
2. Assign `SPONSOR_ADMIN` role to the account
3. Issue a JWT (or share login credentials via secure channel — NOT via git)
4. Engineering will run: `SPONSOR_ADMIN_TOKEN=<jwt> node tools/staging/sprint-26-role-route-smoke.mjs`

### Review: Sprint 27 scope
- Club portal backend implementation (6 endpoints) — HIGH priority
- Sponsor portal backend implementation (7 endpoints) — HIGH priority
- Sponsor Billing ADR authoring — MEDIUM priority

---

## What NOT to Do

**Do NOT activate PSL season.** PSL remains inactive until:
- PSL fixture schedule is published by psl.co.za (~July/Aug 2026)
- Fixture dry-run confirms candidates
- Team resolution is reviewed
- Owner explicitly approves activation

**Do NOT run fixture import write.** Dry-run only is permitted.

**Do NOT switch wallet to production.** Wallet remains sandbox-only.

**Do NOT commit JWTs or API keys.** Share via secure channel only.

**Do NOT enable scheduled ingestion.** Manual-only ingestion when authorised.

---

## Key Files for Owner Review

| File                                              | Purpose                                      |
|---------------------------------------------------|----------------------------------------------|
| `docs/qa/SPRINT-26-ADMIN-PORTAL-UAT.md`          | Admin portal UAT results                     |
| `docs/qa/SPRINT-26-FAN-EXPERIENCE-UAT.md`        | Fan experience UAT results                   |
| `docs/qa/SPRINT-26-RBAC-SMOKE-RESULTS.md`        | RBAC smoke results by persona                |
| `docs/qa/SPRINT-26-UAT-ISSUE-LOG.md`             | 9 tracked issues by severity                 |
| `docs/handover/SPRINT-26-BETA-GO-NOGO.md`        | CONDITIONAL_GO with all conditions listed    |
| `docs/handover/SPRINT-26-KNOWN-GAPS.md`          | 7 gaps tracked, none are blockers            |
| `tools/staging/sprint-26-portal-route-smoke.mjs` | Run to verify portal routes return non-5xx   |
| `tools/staging/sprint-26-role-route-smoke.mjs`   | Run with tokens to verify RBAC               |

---

## Safety Confirmation

- PSL remains inactive.
- Wallet remains sandbox-only.
- No admin JWT token values are committed anywhere.
- No provider API keys are committed or exposed to frontend.
- No real-money functionality exists.
