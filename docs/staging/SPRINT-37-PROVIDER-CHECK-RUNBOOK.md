# Sprint 37 — Provider Check Runbook

## Purpose

Operational runbook for running Sprint 37 provider checks against the beta EC2 instance.

## Prerequisites

| Requirement | Value |
|-------------|-------|
| EC2 instance | `i-0a5f16539c9626f90` (af-south-1b) |
| API base URL | `http://16.28.84.11:4000` (or internal `http://api:4000`) |
| Auth | PSL_ADMIN JWT |
| Tools | `tools/staging/sprint-37-*.mjs` |

## 1. Provider Environment Check

Checks env var presence (no API calls, no token needed):

```bash
DATA_PROVIDER=parse-psl \
  node tools/staging/sprint-37-provider-env-check.mjs
```

Expected output (beta without key configured):
```json
{
  "dataProvider": "not_set",
  "parsePslConfigured": false,
  "safe": true
}
```

## 2. PSL Provider Availability Check

Calls the readiness endpoint (read-only, admin token required):

```bash
BASE_URL=http://16.28.84.11:4000 \
  ADMIN_TOKEN=<psl-admin-jwt> \
  node tools/staging/sprint-37-psl-provider-availability-check.mjs
```

Expected result until July/August 2026:
```
readinessStatus: SOURCE_EMPTY
dryRunEligible: false (if no provider configured)
```

## 3. World Cup Provider Availability Check

```bash
BASE_URL=http://16.28.84.11:4000 \
  ADMIN_TOKEN=<psl-admin-jwt> \
  node tools/staging/sprint-37-world-cup-provider-availability-check.mjs
```

## 4. Fixture Import Dry-Run Readiness

Readiness precheck only (no dry-run call):

```bash
BASE_URL=http://16.28.84.11:4000 \
  ADMIN_TOKEN=<psl-admin-jwt> \
  node tools/staging/sprint-37-fixture-import-dry-run-readiness.mjs
```

With dry-run call (only when `readinessStatus` is NOT `SOURCE_EMPTY`):

```bash
BASE_URL=http://16.28.84.11:4000 \
  ADMIN_TOKEN=<psl-admin-jwt> \
  RUN_DRY_RUN=true \
  node tools/staging/sprint-37-fixture-import-dry-run-readiness.mjs
```

## 5. PSL Fixture Readiness Monitor (Sprint 36B)

```bash
BASE_URL=http://16.28.84.11:4000 \
  ADMIN_TOKEN=<psl-admin-jwt> \
  node tools/staging/sprint-36b-psl-fixture-readiness-monitor.mjs
```

## Expected States (Sprint 37 / Current)

| Tool | Expected exit | Expected status |
|------|---------------|-----------------|
| provider-env-check | 0 | safe=true, anyProviderConfigured=false |
| psl-provider-availability-check | 0 | SOURCE_EMPTY |
| world-cup-provider-availability-check | 0 | WC checks pass |
| fixture-import-dry-run-readiness | 0 | PROVIDER_NOT_CONFIGURED or SOURCE_EMPTY |

## Escalation

| Condition | Action |
|-----------|--------|
| Tool exits 2 (auth) | Obtain fresh PSL_ADMIN JWT via Sprint 21 runbook |
| Tool exits 1 (server error) | Check API container health via SSM |
| `NEXT_PUBLIC_*` key detected | Immediately remove from frontend env |
| `readinessStatus=FIXTURES_AVAILABLE_DRY_RUN_REQUIRED` | Notify owner; do not proceed without approval |
| `ACCOUNT_SUSPENDED` in API-Football check | Notify owner; procure new account |

## Safety Boundaries

- Do not run `RUN_DRY_RUN=true` when `readinessStatus=SOURCE_EMPTY`
- Do not run write import without owner approval pack sign-off
- Do not publish fixtures without separate owner approval
- Do not activate PSL without 13-check preflight
- Do not print `ADMIN_TOKEN`
- Do not print provider key values
