# Sprint 9 — Provider Go/No-Go

## Go Criteria for Provider Selection

A provider is ready for production activation when ALL of the following are confirmed:

| Criterion | Sportmonks | SportsDataIO | Required |
|-----------|-----------|--------------|---------|
| Replacement key generated and stored server-side | ✅ PRESENT (length 60) | ✅ PRESENT (length 32) | Both |
| Health check passes (HTTP 200) | ❌ HTTP 401 (key invalid) | ✅ HTTP 200 (93 competitions) | Both |
| Fixtures endpoint returns PSL fixtures | ❌ BLOCKED by 401 | ❌ UCL trial only | Primary |
| Fixtures endpoint returns WC2026 fixtures | ❌ BLOCKED by 401 | ❌ UCL trial only | Primary |
| Standings endpoint returns data | ❌ BLOCKED by 401 | ❌ HTTP 401 (trial tier) | Primary |
| Field mapping verified (all required fields present) | ❌ BLOCKED by 401 | ❌ Trial insufficient | Primary |
| Rate limits understood | ❌ PENDING | ❌ PENDING | Both |
| Commercial terms reviewed by owner | ❌ PENDING | ❌ PENDING | Before activation |
| Local dev migration applied (migrations 40-42) | ✅ APPLIED 2026-06-21 | ✅ APPLIED 2026-06-21 | Both |
| Staging EC2 migration applied | ❌ PENDING_EC2_DB_URL | ❌ PENDING_EC2_DB_URL | Before staging live |
| Betting/odds endpoints confirmed not used | ✅ CONFIRMED | ✅ CONFIRMED | Both |
| No frontend key exposure | ✅ CONFIRMED | ✅ CONFIRMED | Both |

## Current Status (2026-06-21)

**Sportmonks: HTTP_401 — key present but API rejects it.** Adapter is fully implemented and wired. Key must be regenerated or verified at https://app.sportmonks.com/api-tokens before coverage can be validated.

**SportsDataIO: PARTIAL — trial key valid but UCL-only scope.** Competitions (93) and teams (258) confirmed OK. Schedules, players, and standings require a paid plan. PSL/WC2026 coverage cannot be validated on trial.

**Local dev DB:** Migrations 40, 41, and 42 applied successfully (2026-06-21). Staging EC2 DB still requires separate DB URL and explicit authorization.

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
