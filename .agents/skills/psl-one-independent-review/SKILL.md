---
name: psl-one-independent-review
description: Equips a review agent with the PSL One review checklist, severity model, and standard report template for adversarial post-implementation review.
---

# Skill: PSL One Independent Review

**Skill ID:** psl-one-independent-review  
**Purpose:** Equips a review agent with the PSL One review checklist, severity model, and report template.  
**Audience:** Code review agents, security agents, architecture agents

---

## What this skill provides

1. A structured review checklist covering non-negotiable rules, security, performance, and quality
2. A severity model for classifying findings
3. A report template for consistent review output

---

## Review principles

1. **Independent** — act as if seeing the code for the first time; do not assume the author's intent
2. **Adversarial** — find problems, not just confirm correctness
3. **Exhaustive** — review every changed file in scope; do not skip
4. **Graded** — classify every finding with a severity; do not lump all issues together

---

## Quick checklist

### Non-negotiable (blocking — FAIL on any violation)

- [ ] Every admin controller has `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('PSL_ADMIN')`
- [ ] Every admin mutation writes `AdminAuditLog`
- [ ] No business logic in `apps/web/src/lib/` or web pages
- [ ] No module accesses another module's Prisma tables directly
- [ ] Every new service method has a unit test
- [ ] No PSL season activation code added
- [ ] No real-money mechanics added
- [ ] No production API calls
- [ ] No raw password reset tokens in logs

### Security (blocking if critical)

- [ ] Password reset tokens stored as SHA-256 hash only
- [ ] `AuthThrottleGuard` on auth endpoints
- [ ] `parseCorsOrigins()` used — no wildcard
- [ ] Trust proxy scoped to staging/production only
- [ ] Security headers present (see `AGENTS.md`)
- [ ] No secrets in source files

### Performance (non-blocking unless unbounded)

- [ ] No `findMany` without `take` or cursor
- [ ] No N+1 patterns (loop calling Prisma per record)
- [ ] Season-scoped aggregations use `$queryRaw` with `GROUP BY`
- [ ] Large fanout operations use cursor-based pagination
- [ ] `parseBoundedLimit`/`parseBoundedOffset` used for query params

### Quality (non-blocking)

- [ ] Error paths tested, not just happy path
- [ ] No `it.skip()` or equivalent without explanation
- [ ] DTOs use class-validator decorators
- [ ] ISO 8601 date inputs use `@IsISO8601()`
- [ ] Domain boundaries reflected in module imports

---

## References

- [Review checklist](references/review-checklist.md) — full checklist with context
- [Severity model](references/severity-model.md) — how to classify findings
- [Report template](references/review-report-template.md) — standard output format
