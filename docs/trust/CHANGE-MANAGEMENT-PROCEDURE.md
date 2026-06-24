# Change Management Procedure

**Status: NOT_SOC2_CERTIFIED — procedure in draft**
Version: 1.0-draft | Date: 2026-06

---

## PR-Based Change Management

All changes to PSL One must be made via a GitHub Pull Request. Direct commits to `main` are prohibited.

---

## CI Gates (Required to Pass Before Merge)

| Gate | Tool | Failure Action |
|------|------|---------------|
| API typecheck | pnpm --filter @psl-one/api typecheck | Block merge |
| API tests | pnpm --filter @psl-one/api test | Block merge |
| Experience typecheck | pnpm --filter @psl-one/experience typecheck | Block merge |
| Experience tests | pnpm --filter @psl-one/experience test | Block merge |
| Experience build | pnpm --filter @psl-one/experience build | Block merge |
| Dependency audit | pnpm audit --audit-level=high | Block on HIGH/CRITICAL |
| Container scan | Trivy on Docker images | Block on HIGH/CRITICAL |

**Total CI gates: 7/7 must be green before merge.**

---

## Security Review Requirements

| Change Type | Review Required | Notes |
|-------------|----------------|-------|
| New API endpoint | RBAC review | Must have auth guard or be documented as public |
| New role/permission | Security Lead review | Update access-control-policy |
| Provider key / secret | DevOps Lead | Never commit; add to SSM |
| Schema migration | Platform Engineer | Verify backward compatibility |
| Auth system change | Security Lead | JWT security tests must pass |
| Infrastructure change | DevOps Lead | Terraform plan review required |

---

## Deployment Process

1. PR created → CI gates run automatically
2. Reviewer approves (at least 1 approval required)
3. PR merged to `main`
4. Vercel auto-deploys experience to preview URL
5. EC2 deploy: manual trigger via `gh workflow run deploy.yml` (owner authorisation required)
6. Post-deploy: smoke tests run (sprint-XX-smoke.mjs)
7. Smoke results documented in sprint completion notes

---

## Emergency Hotfix Process

For SEV-1/SEV-2 incidents:
1. Branch from `main` with prefix `hotfix/`
2. Minimal targeted fix only
3. CI must still pass (no skip)
4. Expedited review (30 min window)
5. Merge and deploy immediately
6. Post-incident review within 48h
