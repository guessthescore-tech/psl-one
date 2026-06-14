# Contributing to PSL One

## Before You Start

Read the following in order:

1. [README](README.md) — platform overview and quick start
2. [Local Development](docs/engineering/LOCAL-DEVELOPMENT.md) — get your environment running
3. [Coding Standards](docs/engineering/CODING-STANDARDS.md) — non-negotiable rules
4. [Adding a New Feature](docs/engineering/ADDING-A-NEW-FEATURE.md) — step-by-step guide

---

## Non-Negotiable Rules

These are encoded in `CLAUDE.md` and apply to all contributions:

- **Never bypass RBAC** — all admin routes require `JwtAuthGuard + RolesGuard + @Roles('PSL_ADMIN')`
- **Never bypass audit logs** — every admin mutation writes `AdminAuditLog`
- **Never store business logic in frontend** — API is authoritative
- **Always consider eventing** — no event-bus technology is selected by default; transactional outbox, SQS, SNS, EventBridge, and Kafka must be evaluated against demonstrated needs (see ADR-027)
- **Always write tests** — new service methods need tests
- **Always use domain boundaries** — no cross-module table access
- **Always create ADRs for architecture decisions** — see `docs/adr/`
- **Always assume scale to 2 million fans** — no full-table scans, no N+1 queries

---

## Critical Safety Rules

- **Do not activate the PSL season** without explicit product instruction
- **Do not move real money** — wallet is sandbox-only
- **Do not call production APIs** — all external adapters are sandbox-only
- **Do not delete World Cup historical data**
- **Do not add a season activation API endpoint** without a new ADR and explicit approval (see [ADR-026](docs/adr/ADR-026.md))

---

## Story Delivery Checklist

Before marking a story complete:

- [ ] New service methods have tests
- [ ] `pnpm --filter @psl-one/api db:seed` passes — first run
- [ ] `pnpm --filter @psl-one/api db:seed` passes — second run (confirms idempotency)
- [ ] `pnpm --filter @psl-one/api prisma validate` passes
- [ ] `pnpm --filter @psl-one/api typecheck` passes
- [ ] `pnpm --filter @psl-one/api test` passes
- [ ] `pnpm --filter @psl-one/api build` passes
- [ ] `pnpm --filter @psl-one/web typecheck` passes
- [ ] `pnpm --filter @psl-one/web test` passes
- [ ] `pnpm --filter @psl-one/web build` passes
- [ ] Admin mutations write `AdminAuditLog`
- [ ] All admin routes have RBAC guards
- [ ] No business logic in frontend
- [ ] Relevant documentation updated
- [ ] PSL season not activated
- [ ] No real money moved

---

## Architecture Decisions

Any decision that affects:
- A module's dependency graph
- The database schema in a non-trivial way
- An external provider integration
- A cross-domain interaction pattern
- A security boundary

...requires an ADR in `docs/adr/`. Copy the format from an existing ADR-000X.md.

---

## Commit Messages

```
feat: <short description of what was delivered>
fix: <short description of what was fixed>
```

No tickets, no task IDs, no co-author prefixes needed.

---

## AI Agent Tooling

This repository supports Claude Code and Codex CLI as coding agent adapters.

Both adapters share the same non-negotiable rules and safety constraints.

| Adapter | Instructions file | Config |
|---------|-----------------|--------|
| Claude Code | `CLAUDE.md` | `.claude/` |
| Codex | `AGENTS.md` | `.codex/` |

Validate the Codex configuration:
```bash
pnpm codex:validate
```

See [AI Agent Workflow](docs/engineering/AI-AGENT-WORKFLOW.md) for the full guide.

---

## Getting Help

- Architecture: see `docs/architecture/`
- Domain: see `docs/domain/`
- Operations: see `docs/operations/`
- Reference: see `docs/reference/`
- Engineering guides: see `docs/engineering/`
- Story index: see `docs/project/STORY-INDEX.md`
- AI agent workflow: see `docs/engineering/AI-AGENT-WORKFLOW.md`
