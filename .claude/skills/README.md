# PSL One — Claude Code Skills

Reusable expert lenses for PSL One development. Invoke a skill at the start of a story to make Claude reason through the correct expert perspective before implementing.

## Available Skills

| Skill | File | When to invoke |
|---|---|---|
| `/enterprise-architect` | `enterprise-architect.md` | Before any new module, model, or federation design |
| `/staff-engineer` | `staff-engineer.md` | Before implementing any service, controller, or Prisma query |
| `/aws-principal-architect` | `aws-principal-architect.md` | Before any infrastructure, deployment, or cloud design work |
| `/ddd-architect` | `ddd-architect.md` | Before adding new domain concepts, aggregates, or events |
| `/event-driven-architect` | `event-driven-architect.md` | Before any cross-context integration or async workflow |
| `/security-engineer` | `security-engineer.md` | Before any auth, RBAC, PII, or compliance-sensitive feature |
| `/product-manager` | `product-manager.md` | Before starting a new story or scoping acceptance criteria |

## Design skills (from earlier sprints)

| Skill | File | When to invoke |
|---|---|---|
| `/psl-design-director` | `psl-design-director.md` | When designing fan-facing UI/UX |
| `/emil-design-eng` | `emil-design-eng.md` | When implementing frontend components |
| `/design-taste-frontend` | `design-taste-frontend.md` | When reviewing frontend design quality |
| `/impeccable` | `impeccable.md` | When reviewing overall quality before acceptance |
| `/sprint-handover` | `sprint-handover.md` | When closing a sprint and creating the handover document |

## How skills work

Each skill file instructs Claude to adopt a specific expert perspective. The skill includes:

- **Purpose** — what problem this lens solves
- **When to use** — the right moment to invoke it
- **What to check before coding** — pre-implementation checklist
- **Required questions** — questions to answer before writing code
- **Implementation guardrails** — hard rules that must not be violated
- **PSL One specific rules** — platform-specific constraints
- **Definition of Done** — checklist for story acceptance
- **Red flags** — signs that something is wrong

## PSL One platform guardrails (apply to all skills)

These constraints cannot be overridden by any skill:

- Never bypass RBAC
- Never bypass audit logs
- Never store business logic in the frontend
- Always publish Kafka events (define the event shape, even if not wired)
- Always write tests
- Always use domain boundaries
- Always create ADRs for architecture decisions
- Always assume scale to 2 million fans
- Local PostgreSQL only during Sprint 1/2 (no AWS, no Terraform, no RDS)
- No Kafka wiring in Sprint 1/2
- No financial mechanics (no money, no fiat, no crypto, no betting, no gambling, no deposits, no withdrawals)
- Fan Value, Prediction Points, and Peer Challenge wagers are non-financial engagement metrics only
