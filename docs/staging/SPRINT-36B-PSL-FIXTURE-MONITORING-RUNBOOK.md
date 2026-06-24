# Sprint 36B — PSL Fixture Readiness Monitoring Runbook

## Purpose

Operational runbook for monitoring PSL fixture availability on beta EC2.

## Prerequisites

| Requirement | Value |
|-------------|-------|
| EC2 instance | `i-0a5f16539c9626f90` (af-south-1b) |
| API base URL | `http://16.28.84.11:4000` (or internal `http://api:4000`) |
| Auth | PSL_ADMIN JWT |
| Role | PSL_ADMIN |

## Running the Monitor

```bash
BASE_URL=http://16.28.84.11:4000 \
  ADMIN_TOKEN=<psl-admin-jwt> \
  node tools/staging/sprint-36b-psl-fixture-readiness-monitor.mjs
```

Do not print `ADMIN_TOKEN`. Do not commit tokens.

## Expected Outcomes

| readinessStatus | Meaning | Action |
|----------------|---------|--------|
| `SOURCE_EMPTY` | No PSL fixtures from provider yet | Re-run in July/August 2026 |
| `PROVIDER_NOT_CONFIGURED` | `DATA_PROVIDER` env var not set | Owner: configure provider |
| `FIXTURES_AVAILABLE_DRY_RUN_REQUIRED` | Fixtures found — dry-run next | Request owner dry-run approval |
| `READY_FOR_OWNER_IMPORT_REVIEW` | Dry-run complete | Request owner write-import approval |
| `PROVIDER_ERROR` | Provider call failed | Check provider config + network |

## Checking via API Directly

```bash
curl -s -H "Authorization: Bearer <psl-admin-jwt>" \
  http://16.28.84.11:4000/admin/data-provider/psl-fixture-readiness | jq .
```

## Calling the Readiness Endpoint via SSM (no direct network access)

```bash
aws ssm start-session --target i-0a5f16539c9626f90 --region af-south-1
# Inside EC2:
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:4000/admin/data-provider/psl-fixture-readiness | python3 -m json.tool
```

## Admin UI

Log in as PSL_ADMIN at the beta URL, navigate to:

```
/admin/data-provider/psl-fixture-readiness
```

Click "Check Readiness". View provider status, safety flags, and owner action checklist.

## Safety Assertions (run on every check)

The monitoring tool asserts:

- `pslActive = false` — PSL not activated
- `safety.noWrites = true` — no DB writes
- `safety.noPslActivation = true` — no PSL activation
- `fixturePublicationIsActivation = false` — publication ≠ activation

If any assertion fails, the tool exits with code 1 and reports the failure.

## Escalation

| Condition | Action |
|-----------|--------|
| Tool exits 2 (auth failure) | Obtain fresh PSL_ADMIN JWT via Sprint 21 runbook |
| Tool exits 1 (server error) | Check API container health; review API logs via SSM |
| readinessStatus = FIXTURES_AVAILABLE_DRY_RUN_REQUIRED | Notify owner; await dry-run approval |

## Safety Boundaries (non-negotiable)

- Do not import fixtures without owner approval
- Do not publish fixtures without owner approval
- Do not activate PSL without 13-check preflight and owner approval
- Do not enable scheduled ingestion
- Do not enable production ingestion
- Do not expose provider keys to frontend or logs
- Platform is points-only; no real-money functionality
