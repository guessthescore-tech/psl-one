# Sprint 29 Staging Membership Pre-flight

**Date:** 2026-06-24
**Owner authorisation:** GRANTED
**Target:** Beta EC2 only (i-0a5f16539c9626f90, af-south-1)
**Sprint branch:** feature/sprint-29-staging-membership-smoke
**Base SHA (main):** 2605b372df829ea77f76c9c334909d54abdec294

---

## Migration Pre-flight Checks

| Check | Detail | Status |
|---|---|---|
| Migration 43 name | `20260623000001_club_sponsor_memberships` | ADDITIVE ONLY |
| SQL type | 2 × CREATE TABLE (`ClubMembership`, `SponsorMembership`) | NO DESTRUCTIVE SQL |
| Destructive SQL | None — no DROP, no ALTER COLUMN with data loss | CLEAR |
| PSL activation SQL | None present | CLEAR |
| Wallet/billing SQL | None present | CLEAR |
| Rollback safety | Tables can be dropped without affecting existing data | SAFE |

The migration is **additive only** — it creates two new tables (`ClubMembership` and
`SponsorMembership`) with foreign keys to `User`, `Team`, and `Sponsor`. No existing
columns or rows are modified. `prisma migrate deploy` is idempotent.

---

## Safety Checks

| Safety Gate | State | Confirmed |
|---|---|---|
| PSL activation | PSL remains INACTIVE — must remain inactive throughout | YES |
| Wallet mode | SANDBOX only — SiliconEnterpriseSandboxWalletAdapter active | YES |
| Sponsor rewards | NON_FINANCIAL — no real-money, no cash, no billing | YES |
| Fixture import write | NOT executed during smoke | YES |
| Fixture publication | NOT executed during smoke | YES |
| Production ingestion | NOT triggered | YES |
| Scheduled ingestion | NOT enabled — no @Cron decorators active | YES |
| Real-money functionality | None added in Sprint 29 | YES |

---

## EC2 Deploy Status at Sprint 29 Start

| Item | Value |
|---|---|
| Beta EC2 instance | i-0a5f16539c9626f90 |
| Region | af-south-1 |
| Last confirmed deployed SHA | c731c494d37bda3679e149f869afb63448091b4f (Sprint 24) |
| Current main SHA | 2605b372df829ea77f76c9c334909d54abdec294 (Sprint 28 merge) |
| Migration 43 on EC2 | PENDING_DEPLOY — not yet applied |
| Deploy trigger | deploy-beta-ec2.yml (workflow_dispatch — owner must trigger) |

The EC2 deploy workflow (`deploy-beta-ec2.yml`) requires:
1. A full 40-character SHA (must be ancestor of `origin/main`)
2. Confirmation string `DEPLOY`
3. AWS OIDC credentials (beta environment secrets)

Owner must trigger `workflow_dispatch` on `deploy-beta-ec2.yml` with SHA
`2605b372df829ea77f76c9c334909d54abdec294` before Migration 43 can be applied.

---

## Smoke Execution Gating

Smoke execution is **STAGING_SMOKE_PENDING** pending:
1. Owner-triggered EC2 deployment
2. Migration 43 apply via `deploy-beta-ec2.yml` (run_migrations=true)
3. Temp smoke user provisioning on beta EC2
4. Execution of `tools/staging/sprint-29-ec2-cross-tenant-smoke.sh`

All runbooks and evidence templates are committed in this PR. Results will be
populated in `SPRINT-29-CROSS-TENANT-SMOKE-EXECUTION-LOG.md` post-deploy.
