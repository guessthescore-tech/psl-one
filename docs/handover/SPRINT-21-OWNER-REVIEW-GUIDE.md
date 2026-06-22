# Sprint 21 — Owner Review Guide

## What to Review

Sprint 21 documents the manual staging smoke and admin token runbook. No new API routes or frontend pages were added.

---

### 1. Verify Smoke Results

Review the 5 smoke result documents:

- `docs/staging/SPRINT-21-MANUAL-SMOKE-RESULTS.md` — overall summary
- `docs/staging/SPRINT-21-RBAC-SMOKE-RESULTS.md` — RBAC: 5/5 PASS
- `docs/staging/SPRINT-21-PSL-PREFLIGHT-SMOKE-RESULTS.md` — preflight auth-gated PASS
- `docs/staging/SPRINT-21-PARSE-INGESTION-SMOKE-RESULTS.md` — ingestion write guard PASS
- `docs/staging/SPRINT-21-FIXTURE-PUBLICATION-SMOKE-RESULTS.md` — publication guards 3/3 PASS

Key finding: all unauthenticated paths correctly return HTTP 401. No admin endpoint is accessible without a valid JWT.

---

### 2. Decide on Admin Token Acquisition

To complete authenticated smoke, follow `docs/staging/SPRINT-21-ADMIN-TOKEN-RUNBOOK.md`:

- **Method 1:** Create a temp smoke admin user via bcryptjs + Prisma upsert on EC2
- **Method 2:** Generate JWT directly from `JWT_SECRET` via SSM

After obtaining token: run smoke tools with `ADMIN_TOKEN` set. Do not print or commit the token.

---

### 3. Decide on Write Smoke Authorisation

Default: `ALLOW_WRITE_SMOKE=false`. To test fixture publication:

```bash
export ALLOW_WRITE_SMOKE=true
export TEST_FIXTURE_ID=<a fixture ID from beta DB>
node tools/staging/sprint-19-fixture-publication-smoke.mjs
```

**This does NOT activate PSL.** Fixture publication is separate from Season Switching.

---

### 4. Verify PSL Remains Inactive

```bash
# Via SSM
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name AWS-RunShellScript \
  --parameters '{"commands":["docker exec psl-one-beta-api-1 node -e \"const {PrismaClient}=require('"'"'@prisma/client'"'"'); const p=new PrismaClient(); p.season.findFirst({where:{isActive:true}}).then(s=>{ console.log('"'"'Active season:'"'"', s?.name, s?.competition); p.\$disconnect(); });\""],"executionTimeout":["30"]}' \
  --region af-south-1
```

Expected: `Active season: FIFA World Cup 2026 WORLD_CUP` (not PSL).

---

### 5. Review Test Suite

CI should show 840+ experience tests and 1,932 API tests. Run locally:

```bash
pnpm --filter experience test
```

---

## Owner Decision Points

### Should write smoke be enabled?

This is an opt-in, not a requirement. Write smoke publishes a test fixture to the beta DB (non-destructive, no PSL activation). Choose a `TEST_FIXTURE_ID` from the fixture import list.

### Should PSL be activated on beta?

**Not yet.** PSL activation requires:
1. PSL 2026/27 fixture schedule available (~July/August 2026)
2. Admin ingestion + publication complete
3. Pre-flight returning GO
4. Explicit Season Switching instruction from owner

---

## CI Checks Required

- [ ] build-and-test SUCCESS
- [ ] security-scan SUCCESS
- [ ] event-schema-validation SUCCESS
- [ ] Container Build SUCCESS (all 3)
- [ ] Vercel SUCCESS

---

## No Migrations Added

Sprint 21 adds 0 Prisma migrations. Migration count remains 42.

---

## Points-Only Reminder

The platform is points-only. No gambling language, no real-money mechanics, no third-party gaming integrations. This platform uses fan points only.
