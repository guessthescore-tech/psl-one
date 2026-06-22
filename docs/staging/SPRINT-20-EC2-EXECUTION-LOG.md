# Sprint 20 — EC2 Execution Log

## Owner Authorisation

Owner authorised beta EC2 deployment for Sprint 20 on 2026-06-22.

**Scope confirmed:**
- Beta EC2 only (`i-0a5f16539c9626f90`)
- No production, no Terraform, no IAM, no PSL activation
- Wallet sandbox-only, no real-money, no scheduled ingestion

---

## Pre-execution Safety Verification

Performed before triggering workflow:

| Check | Result |
|-------|--------|
| Target is beta EC2 only | VERIFIED |
| Not production | VERIFIED |
| Not Terraform | VERIFIED |
| Not IAM | VERIFIED |
| Not PSL activation | VERIFIED |
| Not wallet production | VERIFIED |
| No new migrations added | VERIFIED (count: 42) |
| SHA is ancestor of origin/main | VERIFIED |

---

## Deployment Trigger

**Command executed:**
```bash
gh workflow run deploy-beta-ec2.yml \
  --repo guessthescore-tech/psl-one \
  --field git_sha=81d3c391ffb69b9217caf0847aa9b4402493c83d \
  --field run_migrations=true \
  --field confirm=DEPLOY
```

**Parameters:**
- `git_sha`: `81d3c391ffb69b9217caf0847aa9b4402493c83d`
- `run_migrations`: `true`
- `confirm`: `DEPLOY`
- `environment`: `beta`
- `instance`: `i-0a5f16539c9626f90`

---

## Workflow Run Results

<!-- Results populated after workflow completes -->

| Field | Value |
|-------|-------|
| Workflow | `Deploy — Beta EC2` |
| Run ID | `27977306374` |
| SHA deployed | `81d3c391ffb69b9217caf0847aa9b4402493c83d` |
| Deployed at | `2026-06-22T19:20:28Z` |
| Deployed by | `guessthescore-tech` |
| Migration result | `success` |
| Readiness result | `pass` |
| Smoke result | `pass` |
| Deploy status | `success` |
| Rollback SHA | `1bbd11e348a9a4bc0d8a8e2b5509c003e341346d` |

See `docs/staging/SPRINT-20-STAGING-SMOKE-RESULTS.md` for detailed smoke results.

---

## Constraints Confirmed Active During Execution

- PSL NOT activated
- World Cup 2026 remains active beta context
- Wallet remains sandbox-only
- No scheduled ingestion enabled
- No production ingestion enabled
- No real-money functionality
- No Terraform applied
- No IAM mutated
