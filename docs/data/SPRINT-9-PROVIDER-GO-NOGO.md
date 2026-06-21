# Sprint 9 — Provider Go/No-Go

## Go Criteria for Provider Selection

A provider is ready for production activation when ALL of the following are confirmed:

| Criterion | Sportmonks | SportsDataIO | Required |
|-----------|-----------|--------------|---------|
| Replacement key generated and stored server-side | ❌ PENDING | ❌ PENDING | Both |
| Health check passes (HTTP 200) | ❌ BLOCKED | ❌ BLOCKED | Both |
| Fixtures endpoint returns PSL fixtures | ❌ PENDING | ❌ PENDING | Primary |
| Fixtures endpoint returns WC2026 fixtures | ❌ PENDING | ❌ PENDING | Primary |
| Standings endpoint returns data | ❌ PENDING | ❌ PENDING | Primary |
| Field mapping verified (all required fields present) | ❌ PENDING | ❌ PENDING | Primary |
| Rate limits understood | ❌ PENDING | ❌ PENDING | Both |
| Commercial terms reviewed by owner | ❌ PENDING | ❌ PENDING | Before activation |
| Staging migration applied (provides settlement fields) | ❌ PENDING | ❌ PENDING | Both |
| Betting/odds endpoints confirmed not used | ✅ CONFIRMED | ✅ CONFIRMED | Both |
| No frontend key exposure | ✅ CONFIRMED | ✅ CONFIRMED | Both |

## Current Status

**Both providers: BLOCKED_BY_REPLACEMENT_TOKEN**

Neither provider can be validated until replacement keys are available.

## What Unblocks Each Gate

1. **Replacement key**: Owner generates new key at provider portal, places in `apps/api/.env`
2. **Health check**: Run `node tools/discovery/provider-health-check.mjs`
3. **Coverage**: Run `PROVIDER=sportmonks node tools/discovery/provider-coverage-check.mjs`
4. **Field mapping**: Run `PROVIDER=sportmonks node tools/discovery/provider-field-mapping-check.mjs`
5. **Commercial terms**: Owner reviews Sportmonks/SportsDataIO pricing pages
6. **Staging migration**: Owner explicitly authorizes `pnpm --filter @psl-one/api exec prisma migrate deploy`

## No-Go Conditions

Do NOT activate provider ingestion if:
- Key value would be exposed in frontend code or NEXT_PUBLIC_* vars
- PSL fixture coverage is not confirmed
- Commercial terms have not been reviewed
- Betting/odds endpoints would be called
- Staging migration has not been applied
