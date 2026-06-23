# Sprint 24 — EC2 RBAC Smoke Execution Log

## Owner Authorisation

Owner authorised beta EC2 re-deployment and authenticated admin smoke for Sprint 24 on 2026-06-23.

**Scope confirmed:**
- Beta EC2 only (`i-0a5f16539c9626f90`)
- No production, no Terraform, no IAM, no PSL activation
- Wallet sandbox-only, no real-money, no scheduled ingestion

---

## Deployment Trigger

**Command executed:**
```bash
gh workflow run deploy-beta-ec2.yml \
  --repo guessthescore-tech/psl-one \
  --field git_sha=c731c494d37bda3679e149f869afb63448091b4f \
  --field run_migrations=true \
  --field confirm=DEPLOY
```

**Parameters:**
- `git_sha`: `c731c494d37bda3679e149f869afb63448091b4f`
- `run_migrations`: `true`
- `confirm`: `DEPLOY`
- `environment`: `beta`
- `instance`: `i-0a5f16539c9626f90`

---

## Workflow Run Results

| Field | Value |
|-------|-------|
| Workflow | `Deploy — Beta EC2` |
| Run ID | `28015195029` |
| SHA deployed | `c731c494d37bda3679e149f869afb63448091b4f` |
| Deployed at | `2026-06-23T09:08:07Z` |
| Completed at | `2026-06-23T09:13:47Z` |
| Validate SHA | success |
| Build and push images | success |
| Deploy to EC2 | success |
| Smoke test | success |
| Release manifest | success |
| Deploy status | success |
| Rollback SHA | `5a0385f5f8b74f179e4ef53420e220cbf709a483` |

---

## Temporary Admin Provisioning

| Step | Result |
|------|--------|
| Email | `sprint24-admin-smoke@psl-one.internal` |
| Role | `PSL_ADMIN` |
| Bcrypt rounds | 12 |
| Password printed | NO |
| JWT printed | NO |
| Token written to | `/tmp/s24-admin-token` inside container (runtime only) |
| SSM Command ID (provision) | `d9cf5f2d-dcf4-4567-9756-377e015d2307` |
| Stdout | `TEMP_ADMIN_UPSERTED`, `LOGIN_SUCCESS_TOKEN_WRITTEN length=277` |

## Safety Constraints During Execution

- ADMIN_TOKEN: PRESENT_REDACTED — never printed to stdout or logs
- Password: random 64-char hex, never stored, unknown post-run
- ALLOW_WRITE_SMOKE: `false`
- DRY_RUN_ONLY: `true`
- PSL NOT activated
- No scheduled ingestion
- No production ingestion
- No real-money functionality
- Wallet: SANDBOX
