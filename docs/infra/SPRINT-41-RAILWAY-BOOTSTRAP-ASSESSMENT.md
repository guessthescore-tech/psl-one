# Sprint 41 — Railway Bootstrap Assessment

Generated: 2026-06-25 | Status: ASSESSMENT (not deployed)

---

## Summary

Railway.com is a Platform-as-a-Service (PaaS) that can host NestJS APIs, PostgreSQL databases, and Next.js frontends with minimal configuration. This document assesses whether Railway should replace or complement the current EC2 beta setup.

**Recommendation: Use Railway for cost-saving preview/PR environments only. Keep EC2 as the primary beta until full smoke parity is achieved.**

---

## Current EC2 Setup

| Resource | Cost estimate | Notes |
|----------|--------------|-------|
| EC2 t3.medium (af-south-1b) | ~$30-40/month | On-demand; can use Spot for ~70% saving |
| EBS volume (20GB) | ~$2/month | |
| Elastic IP | $0 when attached | |
| Data transfer | ~$1-5/month | af-south-1 egress |
| **Total** | **~$35-50/month** | Comparable to Railway Hobby |

---

## Railway Capabilities Assessment

### What Railway does well

| Capability | Railway | Notes |
|------------|---------|-------|
| Zero-config deployments | YES | GitHub push → auto deploy |
| Managed Postgres | YES | Built-in, automatic backups |
| Custom domains | YES | Free on paid plans |
| TLS / HTTPS | YES | Automatic |
| Environment variables | YES | Per-environment, secrets vault |
| Preview environments | YES | Per-PR deployments |
| Log retention | 7 days (Hobby), 30 days (Pro) | Limited vs EC2 CloudWatch |
| Health checks | YES | Configurable |
| Auto-scaling | Limited | Vertical only on Hobby |
| Private networking | YES | Services share a private network |
| Migration execution | YES | Can run `prisma migrate deploy` as a pre-start command |
| AF-South-1 region | NO | Nearest is `us-west` or EU. Adds latency for ZA users |

### What Railway cannot do

| Limitation | Impact |
|-----------|--------|
| No af-south-1 region | Increased latency for South African users (~200ms vs <10ms on EC2 af-south-1b) |
| Compute region mismatch | Data sovereignty concern if user data leaves ZA |
| Cold starts on Hobby plan | API may take 5-30s to respond after inactivity period |
| Vendor lock-in | Railway-specific config, buildpack, private networking syntax |
| No EC2-compatible Docker Compose | compose.beta.yaml cannot be used directly; needs Railway service config |
| Max 512MB RAM on Hobby | NestJS + Prisma + all modules may exceed this at peak |

---

## Cost Comparison

| Scenario | EC2 t3.medium | Railway Hobby | Railway Pro |
|----------|--------------|---------------|-------------|
| API service | $0 (included) | $5/month | $20/month |
| PostgreSQL | $0 (included) | $5/month | $20/month |
| Web service | $0 (included) | $5/month | $20/month |
| **Total** | **~$35-50/month** | **~$15-25/month** | **~$60+/month** |

Railway Hobby is cheaper but has cold starts and region limitations. Railway Pro is more expensive than EC2 for this use case.

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Cold starts (Hobby) | HIGH for fan UX | Upgrade to Pro or keep EC2 for primary |
| No ZA region | MEDIUM | Acceptable for beta; must resolve for production |
| Data sovereignty | MEDIUM | POPIA compliance review required before using non-ZA hosting |
| Migration sequence | LOW | Railway supports pre-deploy commands |
| Secrets management | LOW | Railway has a secrets vault |

---

## POPIA Data Sovereignty Note

PSL One processes personal data of South African users under POPIA. Hosting user data outside South Africa requires:
- Documented lawful basis for cross-border transfer
- Adequate protection measures
- Notification to users in privacy policy

EC2 in af-south-1 is ZA-resident by default. Railway is not. This is a compliance consideration that must be resolved with the DPO (Data Protection Officer) before migrating user data to Railway.

---

## Recommended Railway Use Cases

### YES: Use Railway for

1. **PR preview environments** — each PR gets a Railway deployment. No user data; safe.
2. **Integration test database** — ephemeral Postgres per CI run, no persistent user data.
3. **Background job services** — future Kafka consumer workers, non-user-data services.
4. **Documentation/static sites** — no data sovereignty concern.

### NO: Do not use Railway for

1. **Primary beta serving ZA users** — latency + cold starts degrade UX.
2. **Production** — no ZA region means POPIA risk.
3. **Replacing EC2 until all smoke tests pass against Railway deployment**.

---

## If Railway Is Added (Future Story)

The following changes would be needed:
1. `railway.toml` — Railway project configuration
2. `railway.json` — service definitions (api, web, postgres)
3. Prisma `binaryTargets` must include `linux-musl` (Railway uses Alpine-based containers)
4. Health check endpoint must respond on `/api/health` within 30s of start
5. `DATABASE_URL` injected from Railway private network
6. `NEXT_PUBLIC_API_BASE_URL` set to Railway API service URL

These are documented in `docs/infra/SPRINT-41-RAILWAY-DEPLOYMENT-CHECKLIST.md`.

---

## Decision

**CONDITIONAL_GO for preview/CI use. NO for primary beta or production until:**
- [ ] ZA region becomes available on Railway, OR
- [ ] POPIA cross-border transfer documentation is complete
- [ ] Full smoke suite passes against a Railway deployment
- [ ] Cold start behaviour is benchmarked and acceptable
