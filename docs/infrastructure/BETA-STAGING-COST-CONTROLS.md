# Beta Staging Cost Controls

Account: `Guess__The_Score` (844513166932)
Cash-spend target: R0
AWS credits may be consumed.
Guaranteed zero cost: No.
Actual charges depend on Free Plan eligibility, remaining credits, service usage, and plan expiry.
BUDGET_STATUS=OWNER_APPROVAL_REQUIRED
Date: 2026-06-16

---

## 1. Estimated Resource Costs

All services below are metered at standard AWS pricing. Charges depend on Free Plan
eligibility, remaining credits, plan expiry, region, service usage, and current AWS pricing.
No service is guaranteed free.

| Resource | Cost classification | Estimated charge | Notes |
|---|---|---|---|
| EC2 t3.micro | Metered; credit-funded while credits last | ~USD 0.0136/hr (af-south-1, live rate 2026-06-16) | t2.micro not offered in af-south-1 |
| EBS 20 GB gp3 | Metered; continues while instance is stopped | ~$0.08/GB-month in af-south-1 | EBS charges apply even when EC2 is stopped |
| ECR storage | Metered after any applicable allowance | Accumulates as images are pushed | Review regularly; delete unused images |
| ECR data transfer | Metered after any applicable allowance | Per-GB charges for pull volume | Low for restricted-CIDR beta review |
| SSM Parameter Store | No separate charge for standard params | ~$0 (standard params, ~12 used) | Advanced params would incur charges |
| SSM Session Manager | No separate per-session charge for EC2 | ~$0 | Standard EC2 pricing applies |
| SSM Run Command | No separate charge | ~$0 | |
| Public IPv4 address | Metered since Feb 2024 | ~$0.005/hr (~$3.60/month) when running | Applies to ephemeral IPs and Elastic IPs |
| Elastic IP (disabled) | Metered when unattached | $0 (disabled by default) | `create_elastic_ip = false` |
| NAT Gateway | Not used | $0 | ECS path avoided for this reason |
| ALB | Not used | $0 | Caddy handles routing |
| RDS | Not used | $0 | Postgres runs in Docker |
| Secrets Manager | Not used | $0 | SSM Parameter Store used instead |
| CloudWatch Logs | Metered (ingest + storage) | ~$0 for low volume; no CW agent configured | Docker logs to stderr only |
| Snapshots/backups | Metered at EBS snapshot rates | $0 if no snapshots taken (pg_dump only) | Charges apply if EBS snapshots are created |
| Data transfer out | Metered after any applicable allowance | Depends on tester traffic | Low for internal beta review |
| Route 53 | Blocked by guardrail | $0 | Cannot create records with current identity |

**Cash-spend target: R0. AWS credits may be consumed. Guaranteed zero cost: No.**
**Charges depend on Free Plan eligibility, remaining credits, plan expiry, region, service usage and current AWS pricing.**
**The $100 credit balance should cover the beta review period if usage remains low — verify in Billing console.**

---

## 2. Public IPv4 Charge (Feb 2024 Change)

AWS began charging $0.005/hr for all public IPv4 addresses (including ephemeral addresses
assigned to EC2 instances) from 1 February 2024. This applies even with the Free Plan.

For a t3.micro running 24/7: ~$10.12 EC2 + ~$3.72 IPv4 + ~$2.09 EBS = ~$15.93/month (live rates 2026-06-16).
Credits will cover this while balance remains.

To minimise: stop the instance between review sessions. Note that stopping the instance
releases the ephemeral IP — testers using Mode A must update /etc/hosts with the new IP
after restart.

An Elastic IP (`create_elastic_ip = true`) also incurs this charge and additionally
charges when unattached to a running instance.

---

## 3. Continuing Charges When Instance Is Stopped

Stopping the instance does NOT remove all charges:

| Resource | Charge when stopped |
|---|---|
| EBS root volume (20 GB gp3) | Continues at EBS rate (~$0.08/GB-month = ~$1.60/month) |
| EBS snapshots | Charged if snapshots taken |
| ECR image storage | Continues regardless of instance state |
| Elastic IP (if enabled) | Charges for unattached EIP |
| SSM Parameter Store | Not charged for reads; standard params are free |

---

## 4. Guardrails in Effect

Sprint 0 deny guardrails (`PSLOneSprint0DenyGuardrails`) currently enforce:

| Guardrail | Effect on Beta Profile |
|---|---|
| `DenyNonFreeTierEC2` — allows only `t2.micro` | **EFFECTIVELY ATTACHED** to `psl-one-admin` via `PSLOneSprint0Infra` group. t3.micro is blocked. t2.micro is not offered in af-south-1. **Apply blocked** until guardrail amended (S3-INFRA-02E-IAM). |
| `DenyRDSNonFreeTier` | Postgres runs in Docker; no RDS resource created. No conflict. |
| `DenyRoute53` | DNS for Mode B managed externally (Cloudflare or registrar). |
| `DenyIAMEscalation` | Blocks user/group/policy creation. IAM role creation permitted. EC2 role created by Terraform. |

See ADR-029 for full guardrail conflict analysis.

---

## 5. Cost Controls in Place

- **No NAT Gateway** — saves ~$45–65/month vs ECS Fargate path
- **No ALB** — saves ~$18/month
- **No RDS** — Postgres in Docker on the same instance
- **No Secrets Manager** — SSM Parameter Store (standard params, free tier)
- **Elastic IP disabled** by default (`create_elastic_ip = false`)
- **Security group** — only Caddy ports exposed; no internal port exposure
- **Scoped ECR IAM** — pull-only for three specific repositories

---

## 6. Instance Stop/Start Policy

Stop the instance between review sessions to reduce credit consumption.

When stopped:
- EBS volume data (PostgreSQL) is retained
- Ephemeral public IP is released (update /etc/hosts for Mode A testers)
- t3.micro is stopped; no CPU or network charges
- EBS and ECR charges continue

Optional nightly stop cron is in `infra/beta/bootstrap-ec2.sh` (commented out).
Uncomment and run `systemctl restart crond` to enable automatic nightly stop at 22:00 SAST.

---

## 7. Image Build Cost (Docker Build Cloud)

Trial: 7 days, 200 build minutes, amd64 cloud builder.

After trial expiry, use GitHub Actions standard runners (Ubuntu):
- Public repo: unlimited minutes
- Private repo: 2,000 min/month on GitHub Free

Estimated build time per deploy:
- API image: ~3–5 min
- Migrator image: ~3–5 min (same Dockerfile as API)
- Web image: ~4–6 min
- Total: ~10–16 min/deploy

---

## 8. Budget Alert

No AWS Budgets alert is configured (Budgets API costs apply on some account types).

Manual review: AWS Console → Billing → Cost Explorer → filter by service.

Recommended alert threshold: $5 USD equivalent in credits.

---

## 9. Clean-up Checklist

Before decommissioning beta:

- [ ] Run `backup-postgres.sh` and copy backup off-instance to S3
- [ ] `terraform destroy` in `infra/terraform/environments/beta-ec2`
- [ ] Delete ECR images: `aws ecr list-images --repository-name psl-one-beta-api`
- [ ] Delete SSM parameters: `aws ssm delete-parameters --names /psl-one/beta/...`
- [ ] Verify no Elastic IP remains unattached
- [ ] Verify no EBS snapshots remain
- [ ] Check Cost Explorer for any unexpected charges
