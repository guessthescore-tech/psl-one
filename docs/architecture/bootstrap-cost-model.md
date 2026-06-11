# PSL One — Bootstrap Cost Model

**Date:** 2026-06-08  
**Authority:** Architecture Review Board  
**Supersedes:** Cost estimates in ADR-006  
**Constraint:** $0–$100/month hard ceiling until funding secured

---

## Executive Summary

| Phase | Monthly Cost | Annual Cost |
|---|---|---|
| Bootstrap (Free Tier, months 1–12) | **$0** | $0 |
| Post-free-tier (months 13+, pre-funding) | **~$29** | ~$348 |
| Post-funding Phase 2 (partial migration) | ~$400–600 | ~$5,000–7,200 |
| Full scale architecture (ADR-001–010) | ~$1,785 | ~$21,420 |

The bootstrap phase operates entirely within AWS Free Tier for the first 12 months. After free tier expiry, cost is ~$29/month — well within the $100 hard ceiling.

---

## Bootstrap Phase (0–12 months): AWS Free Tier

### Free Tier Limits Applied

| Service | Free Tier Allowance | Projected MVP Usage | Monthly Cost |
|---|---|---|---|
| EC2 t2.micro | 750 hrs/month (1 instance 24/7) | 1 instance × 720 hrs | **$0** |
| RDS db.t3.micro | 750 hrs/month + 20 GB storage | 1 instance, ~5 GB | **$0** |
| RDS automated backups | 20 GB | ~5 GB | **$0** |
| S3 storage | 5 GB | ~500 MB (media, exports) | **$0** |
| S3 requests | 20K GET / 2K PUT per month | Minimal | **$0** |
| CloudFront | 1 TB data transfer / 10M HTTP requests | Minimal | **$0** |
| AWS Cognito | 50K MAU | < 1K MAU (MVP) | **$0** |
| AWS SES | 62K emails/month (when sent from EC2) | < 500/month | **$0** |
| Lambda | 1M requests/month + 400K GB-seconds | Minimal (Cognito triggers only) | **$0** |
| CloudWatch | Basic metrics, 10 custom metrics, 10 alarms | Basic monitoring | **$0** |
| ACM (SSL Certificate) | Free (public certs) | 1 cert (api.pslone.co.za) | **$0** |
| Data Transfer Out | 100 GB/month | < 5 GB/month | **$0** |
| ECR | 500 MB private storage | ~200 MB (API image) | **$0** |
| **Monthly Total** | | | **$0** |

### Non-AWS Services (Free)

| Service | Plan | Usage | Cost |
|---|---|---|---|
| Vercel | Hobby (Free) | Next.js web app deployments | **$0** |
| GitHub | Free | Repos, Actions (2000 min/month) | **$0** |
| Let's Encrypt | Free | TLS cert for API domain | **$0** |
| **Monthly Total** | | | **$0** |

**Bootstrap total: $0/month for 12 months from account creation.**

---

## Post-Free-Tier (Month 13+): Pre-Funding Running Costs

When free tier expires, the same infrastructure costs:

| Service | Pricing (af-south-1 est.) | Monthly Usage | Monthly Cost |
|---|---|---|---|
| EC2 t2.micro | $0.0152/hr | 720 hrs | **$10.94** |
| RDS db.t3.micro | $0.026/hr + $0.133/GB storage | 720 hrs + 5 GB | **$19.38** |
| S3 | $0.025/GB + request fees | ~500 MB | **$0.26** |
| CloudFront | $0.0085/GB (minimal) | ~5 GB | **$0.04** |
| SES | $0.10/1K emails (from EC2: $0) | < 1K emails | **$0** |
| CloudWatch | $0.30/metric/month (10 custom) | 10 metrics | **$3.00** |
| ECR | $0.10/GB/month | ~0.2 GB | **$0.02** |
| **Monthly Total** | | | **~$33.64** |

**Post-free-tier total: ~$34/month.** Comfortably within $100 ceiling.

---

## Phase 2 Migration Costs (Post-Funding)

When funding is secured, infrastructure scales to match user growth. The migration is incremental — each extracted service adds cost.

### First extraction: Football Data Service

| New Service | Cost Addition |
|---|---|
| ECS Fargate (1 service, 2 tasks, 0.25 vCPU) | +$14/month |
| RDS db.t3.micro (Football schema extracted) | +$20/month |
| Application Load Balancer | +$16/month |
| MSK Basic (shared cluster, not Serverless) | +$190/month |
| **Incremental cost** | **+$240/month** |
| **New total** | **~$274/month** |

### At 5 services extracted

| Infrastructure | Cost |
|---|---|
| ECS Fargate (5 services, 2 tasks each) | $70/month |
| RDS db.t3.micro × 5 | $100/month |
| MSK Basic (still shared) | $190/month |
| ALB | $16/month |
| EC2 for remaining monolith | $11/month |
| Other (S3, CloudFront, CloudWatch, etc.) | $20/month |
| **Total** | **~$407/month** |

### At full scale (ADR-001–010 target)

Refer to ARB-001 cross-cutting finding CROSS-01 for the full scale cost model (~$1,785/month production).

---

## Cost Optimisation Notes

### During Bootstrap

- **Use default VPC** rather than creating a custom VPC. Saves $0 (default VPC is free) but eliminates Terraform complexity for Day 1.
- **Single AZ** for RDS. Multi-AZ doubles RDS cost. Not needed for MVP.
- **EC2 instance type:** t2.micro is the free tier instance. Do NOT upgrade to t3.micro during free tier — t3.micro is not always free-tier eligible.
- **RDS instance type:** `db.t3.micro` qualifies for free tier (db.t2.micro also qualifies — verify with AWS console for the active account's free tier eligibility).
- **No NAT Gateway.** The EC2 instance uses a public IP for outbound internet. No private subnet + NAT Gateway needed for a single-instance setup. Saves ~$32/month.
- **No ElastiCache.** Redis is not required for Phase 1. Saves ~$30–80/month.
- **EBS volume:** The free tier includes 30 GB EBS. The EC2 root volume should be 20 GB, Docker volumes on the remaining 10 GB.

### Budget Alert

Configure an AWS Budget alert at 80% of $100 threshold:
```
AWS Budgets → Create Budget → Cost Budget
Threshold: $80/month
Alert: Email to programme director
```

This fires before any unexpected cost can exceed $100.

---

## Free Tier Eligibility Verification

Before deploying, verify the AWS account's free tier status:
```bash
aws ce get-cost-and-usage \
  --time-period Start=2026-06-01,End=2026-06-08 \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --query 'ResultsByTime[0].Total.BlendedCost'
```

If the account has been active for > 12 months, free tier has expired. In that case:
- Create a new AWS account (dedicated to PSL One)
- Use AWS Organizations to link the new account to existing accounts if needed
- Total cost in a new account: $0 for 12 months

---

## Risk: Unexpected Cost Items

The following services can incur unexpected costs if misconfigured:

| Service | Risk | Mitigation |
|---|---|---|
| Data Transfer Out | EC2 egress > 100 GB/month is charged | Monitor CloudWatch `NetworkOut` metric |
| RDS Storage | Storage auto-scales if not capped | Set `max_allocated_storage = 20` in Terraform |
| CloudWatch Logs | Log retention defaults to never expire | Set retention to 30 days for all log groups |
| S3 Versioning | Versioning multiplies storage cost | Disable versioning on MVP S3 bucket |
| EC2 Elastic IP | Unattached Elastic IP costs $0.005/hr | Release EIP immediately if instance is stopped |

---

## Approval

This cost model was reviewed and accepted by the Architecture Review Board on 2026-06-08 as part of the bootstrap architecture decision (ADR-011).

**Next review trigger:** When any single month's AWS bill exceeds $50, or when funding is secured.
