# Sprint 20 — Staging Environment Validation

## Tool Used

`tools/staging/sprint-19-staging-env-check.mjs`

---

## Local Run Result

Running the staging env check locally (without staging env vars) produces:

```
Status: STAGING_ENV_DATABASE_URL_MISSING
```

This is **expected** — the tool is designed to run on EC2 where `DATABASE_URL` points at the beta database. Running it locally without the staging DATABASE_URL will always produce this result.

---

## EC2 Environment Requirements

The following must be present on EC2 before deployment proceeds:

| Variable | Required | Source | Status |
|----------|----------|--------|--------|
| `DATABASE_URL` | YES | SSM parameter `/psl-one/beta/database-url` | Set in Sprint S3-INFRA-02G |
| `PARSE_API_KEY` | YES (for ingestion) | SSM parameter `/psl-one/beta/parse-api-key` | Set in Sprint 17 runbook |
| `FOOTBALL_DATA_API_KEY` | NO (optional) | SSM parameter | Set in prior infra |
| `API_FOOTBALL_KEY` | NO (optional) | SSM parameter | Set in prior infra |
| `JWT_SECRET` | YES | SSM parameter | Set during initial EC2 setup |
| `DATA_PROVIDER` | NO (optional) | `.env.beta` | Defaults to NoOpAdapter |
| `NODE_ENV` | NO (optional) | `.env.beta` | Defaults to production |

**Forbidden:**
- `NEXT_PUBLIC_PARSE_API_KEY` — must NOT be set
- `NEXT_PUBLIC_FOOTBALL_DATA_API_KEY` — must NOT be set
- `NEXT_PUBLIC_API_FOOTBALL_KEY` — must NOT be set
- `NEXT_PUBLIC_SPORTMONKS_API_KEY` — must NOT be set

---

## Verification After Deployment

After deployment, run the env check on EC2 via SSM:

```bash
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name AWS-RunShellScript \
  --parameters 'commands=["cd /opt/psl-one && node tools/staging/sprint-19-staging-env-check.mjs"]' \
  --region af-south-1
```

Expected result: `STAGING_ENV_READY` or `STAGING_ENV_SAFE_WITH_WARNINGS`

If `STAGING_ENV_MISSING_PARSE_KEY`, ingestion will return source-empty (WARN, not FAIL).

---

## Security Guarantees

- All secret values are redacted in tool output using the `redact()` helper
- No provider key is printed, logged, or committed
- No NEXT_PUBLIC provider key exists in any codebase file
- PSL activation is NOT triggered by any env var change
