# Sprint 8 — Owner Review Guide

## What to review

### 1. Challenge settlement automation
- Code: apps/api/src/prediction-challenges/challenge-settlement.service.ts
- Code: apps/api/src/football/football.service.ts (look for FINISHED trigger)
- Test: apps/api/src/prediction-challenges/challenge-settlement-fixture.service.spec.ts
- When a fixture's status is updated to FINISHED, all ACCEPTED challenges for that fixture are settled automatically (fire-and-forget)

### 2. Admin manual re-settle endpoint
- POST /predictions/challenges/settle-fixture/:fixtureId (admin-only)
- Useful for re-running if settlement failed silently

### 3. Challenge result UX
- /predict/challenge/accept?token=<token> — now shows SETTLED state with points breakdown
- /predict/challenge/result?token=<token> — new route, redirects to accept

### 4. Staging migration readiness
- See docs/handover/SPRINT-8-STAGING-MIGRATION-RUNBOOK.md
- Migrations 41–43 are ready for staging (additive only)

### 5. Sportmonks replacement token
- Previous token must be revoked immediately (see security note in SPRINT-8-SPORTMONKS-TRIAL-VALIDATION.md)
- Place replacement token in .env as SPORTMONKS_API_KEY to activate provider trial

## What has NOT changed
- PSL: INACTIVE
- Wallet: Sandbox-only
- World Cup 2026: ACTIVE
- Production ingestion: DISABLED
- No real-money functionality added
- No AWS/Terraform/IAM changes
- STORY-40: RESERVED
