# ADR-029: Free-Plan Beta Staging Profile — EC2 + Docker Compose

**Date:** 2026-06-16
**Status:** Accepted
**Story:** S3-INFRA-02A

---

## Context

PSL One's accepted staging target (ADR-028, S3-INFRA-01) is ECS Fargate with an ALB, ECR, RDS, and a NAT gateway. That architecture is sound for production. However, the current AWS account is on the Free Plan with $100 in credits and a cash-spend target of R0.

The estimated monthly cost of the ECS staging stack (S3-INFRA-02 plan review) is $83–147/month. The dominant cost item is the NAT gateway at $45–65/month — a resource needed for private ECS task egress even when no traffic is flowing. Running this continuously would exhaust the $100 credit balance in approximately 60–90 days, leaving no runway for the production funding phase.

The owner is also operating under:
- Docker Personal plan with Docker Build Cloud trial (7 days, 200 build minutes)
- No local Docker Desktop (older Mac)
- No paid Docker subscription

S3-INFRA-01 Terraform authoring is preserved exactly as authored. This ADR does not modify or remove it.

## Decision

Author a parallel beta staging profile using:

- One EC2 t2.micro instance in the default VPC (guardrail-compatible default)
- Docker Compose to orchestrate API, web, migration, PostgreSQL, and Caddy
- Caddy as a reverse proxy for TLS termination and host-based routing
- Systems Manager Session Manager for operator access (no SSH port 22)
- Amazon ECR for image storage (preferred over Docker Hub for AWS-native operations)
- GitHub Actions for image builds and deployment via SSM Run Command

The ECS Fargate infrastructure (S3-INFRA-01) is preserved as the future funded production target. The beta EC2 profile is explicitly temporary and scoped to the free-plan credit window.

### Why not ECS Fargate for beta

| Item | ECS Fargate | EC2 + Compose |
|------|------------|---------------|
| NAT gateway | Required ($45–65/month) | Not required |
| ALB | Required ($18–25/month) | Caddy replaces |
| Minimum monthly | $83–125 | $0–15 (see cost section) |
| Provisioning time | Multi-step Terraform apply | Single EC2 launch |
| Recovery time | ECS rollback | docker compose restart |
| Suitable for production | Yes | No |

### Instance type

**Accepted default: `t2.micro`** (1 vCPU, 1 GiB RAM, x86_64, burstable, ~$0.0116/hour in af-south-1).

Guardrail-compatible with Sprint 0 `DenyNonFreeTierEC2`. EC2 compute is metered at standard AWS pricing; charges depend on remaining credits, Free Tier eligibility (if applicable), and actual usage. Not guaranteed to be credit-funded.

Optional future: `t3.micro` (1 vCPU, 1 GiB, better CPU burst baseline, ~$0.0133/hour). Requires guardrail amendment (`DenyNonFreeTierEC2` currently blocks it) and owner cost approval before use. Memory is the same as t2.micro; only the CPU burst model differs.

### Architecture compatibility

Current Dockerfiles target `node:22-alpine` which builds amd64 images on GitHub Actions (`ubuntu-latest`) and Docker Build Cloud (x86_64 builder). Both t3.micro and t2.micro are x86_64. No ARM compatibility work required.

If the instance type is changed to t4g.micro or t4g.small (arm64/Graviton2), all three images must be rebuilt with `--platform linux/arm64` or as multi-arch manifests before deployment.

### Reverse proxy

Caddy 2 (Docker image `caddy:2.9.1-alpine` — pinned to a reviewed release; pin to full digest before production) provides:
- Automatic TLS via Let's Encrypt when a valid domain is configured (Mode B)
- Plain HTTP when configured with an IP address or local hostname (Mode A)
- Host-based virtual routing to `api:4000` and `web:3001`

Mode A is for restricted-CIDR testing before DNS is approved. Mode B activates when DNS records point to the EC2 instance.

### Database

PostgreSQL 16 runs as a container in the same Docker Compose stack. Named volume `psl-one-beta-postgres` persists data across restarts and deploys. No RDS.

### Registry

Amazon ECR (preferred). Three repositories:
- `psl-one-beta-api`
- `psl-one-beta-api-migrator`
- `psl-one-beta-web`

Immutable SHA tags. 30-image lifecycle policy.

Docker Hub Personal (temporary fallback): limited to one private repository. Requires three separate tag pushes to the same repo distinguished by image name prefix.

### Security posture

- Port 22 not exposed. SSM Session Manager for all operator shell access.
- Ports 80 and 443 both restricted to `allowed_beta_cidrs` (Mode A: reviewer IPs; Mode B: `0.0.0.0/0` after owner approval).
- PostgreSQL (5432), API (4000), web (3001) not exposed to host network.
- EC2 instance profile: SSM core (managed policy) + scoped ECR pull (inline policy, three beta repos only) + SSM Parameter Store read (`/psl-one/beta/*`).
- IMDSv2 required (`http_tokens = "required"`) — prevents SSRF-based metadata credential theft.
- Secrets sourced from SSM Parameter Store at instance boot. Not committed.
- SSM parameter names use kebab-case: `/psl-one/beta/postgres-password`, `/psl-one/beta/api-image-uri`, etc.

## Consequences

### Positive

- Zero NAT gateway cost — saves $45–65/month versus ECS staging.
- Single instance is simpler to reason about, stop, start, and restore.
- Docker Compose startup order provides the same migration-first guarantees as the ECS deployment.
- Caddy handles TLS automatically, eliminating ACM provisioning complexity for initial beta.
- ECS Fargate target (S3-INFRA-01) is fully preserved for the production funding phase.
- Data on the EBS volume survives EC2 stop/start, reducing re-seeding effort.

### Negative

- Single point of failure — no ECS circuit breaker or rolling deployment.
- Compose restarts on the same instance rather than shifting traffic to a healthy task.
- t2.micro has 1 GiB RAM. Running postgres + api + web simultaneously may require careful memory tuning (swap recommended).
- Stopping the instance to reduce credit consumption makes the application unavailable.
- Images must be rebuilt when `NEXT_PUBLIC_API_BASE_URL` changes (Mode A → Mode B).
- t3.micro (better burst) is blocked by `DenyNonFreeTierEC2` until guardrail is amended.
- Not a production-grade deployment model.

## Guardrail Conflicts

| Conflict | Detail | Resolution |
|----------|--------|------------|
| `DenyNonFreeTierEC2` | Blocks all instance types except t2.micro | Default `instance_type = "t2.micro"` is guardrail-compatible. Amend guardrail before using t3.micro. |
| `DenyRoute53` | Blocks DNS configuration for custom domain | Use external DNS (Cloudflare or registrar) for Mode B. Not needed for Mode A. |

## Scope

This profile is for beta testing only and must not:
- handle real-money transactions
- use production provider credentials
- store authentic fan PII at scale
- be presented as production infrastructure

## Related

- ADR-028: ECS Fargate runtime and immutable container image strategy (production target)
- S3-INFRA-01: ECS Fargate Terraform authoring (preserved)
- S3-INFRA-02: Terraform plan review for ECS staging (on hold pending credits)
- S3-INFRA-02A: EC2 beta staging implementation (this story)
