---
name: psl-one-release-readiness
description: Release readiness checklist for PSL One — acceptance gate commands, non-negotiable rule verification, and staging deployment prerequisites.
---

# Skill: PSL One Release Readiness

**Skill ID:** psl-one-release-readiness  
**Purpose:** Provides an agent with the release readiness checklist for PSL One, covering acceptance gate, staging deployment prerequisites, and safety constraints.  
**Audience:** Release readiness agents, implementation engineers before handover

---

## What this skill provides

1. The release readiness checklist
2. Staging deployment prerequisites
3. Beta launch safety invariants

---

## Release readiness quick reference

A story is ready for handover when:

1. All 6 acceptance gate commands pass
2. Test count has increased over baseline
3. No type errors in API or web
4. Migration is applied and schema is valid
5. Seed is idempotent
6. All non-negotiable rules satisfied (RBAC, audit log, no frontend logic, domain boundaries, tests)
7. Documentation updated
8. No PSL season activated
9. No real money moved

---

## Staging prerequisites (S3-INFRA-01 and beyond)

These are not yet applicable (infrastructure not deployed), but should be verified when staging exists:

- [ ] AWS ECS service updated with new image
- [ ] `prisma migrate deploy` run against staging database
- [ ] Seed run against staging database (idempotency verified)
- [ ] Smoke test plan executed (see `docs/platform/PSL-BETA-SMOKE-TEST-PLAN.md`)
- [ ] All 13 season-switching readiness checks pass
- [ ] Security headers verified via curl
- [ ] CORS verified with actual browser

---

## References

- [Release readiness checklist](references/release-readiness-checklist.md) — full checklist
