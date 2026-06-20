# Sprint 4 — File Ownership

**Sprint:** S4 — Premium Experience Activation, Live Data Readiness & Beta Release
**Branch:** `feature/sprint-4-premium-activation`
**Date:** 2026-06-20

---

## Conflict Risk Legend

| Level | Meaning |
|-------|---------|
| NONE | Single owner; no risk of concurrent modification |
| LOW | Multiple agents read; only one writes |
| MEDIUM | Multiple agents may write at different phases; merge coordination needed |
| HIGH | Multiple agents write concurrently or to overlapping scopes; merge must be sequenced |

---

## File Ownership Table

### Sprint Documentation

| File / Domain | Owner Agent | Phase | Stories | Conflict Risk | Notes |
|---------------|-------------|-------|---------|---------------|-------|
| `docs/sprints/SPRINT-4-DELIVERY-PLAN.md` | Agent 1 | A | — | NONE | Created in Phase A; no further edits expected |
| `docs/sprints/SPRINT-4-STORY-MATRIX.md` | Agent 1 | A | — | NONE | Created in Phase A; status column updated only in Phase F |
| `docs/sprints/SPRINT-4-DEPENDENCY-GRAPH.md` | Agent 1 | A | — | NONE | Created in Phase A; read-only thereafter |
| `docs/sprints/SPRINT-4-FILE-OWNERSHIP.md` | Agent 1 | A | — | NONE | This file; created in Phase A |
| `docs/handover/SPRINT-4-HANDOVER.md` | Agent 1 | F | S4-09 | NONE | Written only during Phase F release gate |
| `docs/handover/SPRINT-4-RELEASE-GATE.md` | Agent 1 | F | S4-09 | NONE | Written only during Phase F release gate |

---

### Experience App — Configuration

| File / Domain | Owner Agent | Phase | Stories | Conflict Risk | Notes |
|---------------|-------------|-------|---------|---------------|-------|
| `apps/experience/vercel.json` | Agent 2 | B | S4-01 | NONE | Single owner; stop before committing credentials |
| `apps/experience/.env.example` | Agent 2 | B | S4-01 | LOW | Agent 8 may need to add auth env vars; coordinate with Agent 2 before Phase C |
| `apps/experience/next.config.ts` | Agent 2 | B | S4-01 | LOW | May need rewrites or env var exposure; Agent 2 owns; Agent 8 consults |
| `apps/experience/package.json` | Agent 2 | B | S4-01 | MEDIUM | Agent 6 may add a social-share dependency; Agent 8 may add an auth helper; all additions must go through Agent 2 in Phase B, then merge before Phase C |

---

### Experience App — Documentation

| File / Domain | Owner Agent | Phase | Stories | Conflict Risk | Notes |
|---------------|-------------|-------|---------|---------------|-------|
| `apps/experience/docs/SPRINT-4-DEPLOY-GUIDE.md` | Agent 2 | B | S4-01 | NONE | Deployment guide and preview URL instructions |
| `apps/experience/docs/SPRINT-4-DEPLOY-CHECKLIST.md` | Agent 2 | B | S4-01 | NONE | Pre-deploy checklist; env var verification steps |
| `apps/experience/docs/SPRINT-4-VISUAL-REVIEW.md` | Agent 3 | D | S4-02 | NONE | Screen matrix and acceptance criteria |
| `apps/experience/docs/SPRINT-4-VISUAL-CHECKLIST.md` | Agent 3 | D | S4-02 | NONE | WCAG 2.1 AA accessibility checklist per route |
| `apps/experience/docs/SPRINT-4-API-WIRING.md` | Agent 4 | B | S4-03 | NONE | 49-route classification table |
| `apps/experience/docs/SPRINT-4-DATA-TRUTH.md` | Agent 4 | B | S4-03 | NONE | Source-of-truth mapping per data type |
| `apps/experience/docs/SPRINT-4-ANALYTICS-CATALOGUE.md` | Agent 9 | B | S4-08 | NONE | Analytics event catalogue with payload schemas |
| `apps/experience/docs/SPRINT-4-SPONSOR-INVENTORY.md` | Agent 9 | B | S4-08 | NONE | SponsorMoment placement inventory and fill status |

---

### Experience App — Pages (existing, read-only for most agents)

| File / Domain | Owner Agent | Phase | Stories | Conflict Risk | Notes |
|---------------|-------------|-------|---------|---------------|-------|
| `apps/experience/src/app/page.tsx` | (no change) | — | — | NONE | Homepage; no Sprint 4 modifications planned |
| `apps/experience/src/app/predict/page.tsx` | Agent 6 | C | S4-05 | LOW | Agent 4 reads for audit; Agent 6 writes |
| `apps/experience/src/app/predict/challenge/page.tsx` | Agent 6 | C | S4-05 | NONE | New file; Agent 6 creates |
| `apps/experience/src/app/account/page.tsx` | Agent 8 | C | S4-07 | NONE | Agent 8 wires to real profile API |
| `apps/experience/src/app/account/profile/page.tsx` | Agent 8 | C | S4-07 | NONE | Display name update; Agent 8 owns |
| `apps/experience/src/app/account/security/page.tsx` | Agent 8 | C | S4-07 | NONE | Password change flow; Agent 8 owns |
| `apps/experience/src/app/account/favourite-team/page.tsx` | Agent 8 | C | S4-07 | NONE | Team selection persistence; Agent 8 owns |
| `apps/experience/src/app/account/delete/page.tsx` | Agent 8 | C | S4-07 | NONE | Account deletion with two-step confirmation; Agent 8 owns |
| `apps/experience/src/app/sign-in/page.tsx` | Agent 8 | C | S4-07 | NONE | Post-auth redirect; Agent 8 adjusts |
| `apps/experience/src/app/register/page.tsx` | Agent 8 | C | S4-07 | NONE | Post-register redirect; Agent 8 adjusts |
| `apps/experience/src/app/forgot-password/page.tsx` | Agent 8 | C | S4-07 | NONE | Password reset flow; Agent 8 owns |
| `apps/experience/src/app/reset-password/page.tsx` | Agent 8 | C | S4-07 | NONE | Password reset confirmation; Agent 8 owns |
| `apps/experience/src/app/fantasy/**/page.tsx` (all 14) | (no change) | — | — | NONE | Fantasy pages not in Sprint 4 scope unless S4-04 exposes new endpoints |
| `apps/experience/src/app/matches/**/page.tsx` (all 3) | (no change) | — | — | NONE | Read by Agent 4 in audit only |
| `apps/experience/src/app/players/**/page.tsx` (all 3) | (no change) | — | — | NONE | Read by Agent 4 in audit only |
| `apps/experience/src/app/stats/**/page.tsx` (all 5) | (no change) | — | — | NONE | Read by Agent 4 in audit only |
| `apps/experience/src/app/media/**/page.tsx` (all 2) | (no change) | — | — | NONE | Read by Agent 4 in audit only |

---

### Experience App — Components

| File / Domain | Owner Agent | Phase | Stories | Conflict Risk | Notes |
|---------------|-------------|-------|---------|---------------|-------|
| `apps/experience/src/components/actions/ShareAction.tsx` | Agent 6 | C | S4-05 | NONE | Exists (per spec file); Agent 6 wires to real data |
| `apps/experience/src/components/actions/ChallengeAction.tsx` | Agent 6 | C | S4-05 | NONE | Exists (per spec file); Agent 6 wires to challenge endpoint |
| `apps/experience/src/components/actions/` (new files) | Agent 6 | C | S4-05 | NONE | Additional sharing UI components (share card, sheet) |
| `apps/experience/src/components/shell/AppHeader.tsx` | (no change) | — | — | NONE | Exists; not in Sprint 4 scope |
| `apps/experience/src/components/shell/MobileBottomNav.tsx` | (no change) | — | — | NONE | Exists; not in Sprint 4 scope |
| `apps/experience/src/components/shell/MatchweekNav.tsx` | (no change) | — | — | NONE | Exists; not in Sprint 4 scope |
| `apps/experience/src/components/ui/` (all existing) | (no change) | — | — | NONE | Read by Agent 3 for visual review; no writes planned |
| `apps/experience/src/sections/` (all existing) | (no change) | — | — | NONE | Read by Agent 3 for visual review; no writes planned |

---

### Experience App — Library / Data Layer

| File / Domain | Owner Agent | Phase | Stories | Conflict Risk | Notes |
|---------------|-------------|-------|---------|---------------|-------|
| `apps/experience/src/lib/experience.ts` | Agent 4 (audit), Agent 6 + Agent 8 (additions) | B/C | S4-03, S4-05, S4-07 | HIGH | Central data client; Agent 4 audits in Phase B; Agents 6 and 8 add fetch functions in Phase C. Agents 6 and 8 must NOT edit this file simultaneously. Merge order: Agent 6 additions first, Agent 8 additions second, both after Agent 4 audit. |
| `apps/experience/src/lib/experience.spec.ts` | Agent 4 (audit read), Agent 11 / Phase D (expansion) | B/D | S4-03, S4-09 | MEDIUM | Expanded in Phase D to cover new action components and account routes added by Agents 6 and 8; must not be edited until Phase C code is stable |
| `apps/experience/src/lib/` (any new utility files) | Agent 6 or Agent 8 (respective) | C | S4-05, S4-07 | LOW | New files only; no collision risk as long as names are agreed in advance |

---

### API App — Backend

| File / Domain | Owner Agent | Phase | Stories | Conflict Risk | Notes |
|---------------|-------------|-------|---------|---------------|-------|
| `apps/api/src/` (all existing modules) | Agent 4 (read), Agent 5 (write) | B/C | S4-03, S4-04 | MEDIUM | Agent 4 reads all controllers in Phase B audit; Agent 5 writes new controllers/DTOs in Phase C only |
| `apps/api/src/predict/` | Agent 5 | C | S4-04 | NONE | New or extended prediction module; Agent 5 owns; Agent 6 consumes |
| `apps/api/src/account/` | Agent 5 | C | S4-04 | NONE | New or extended account endpoints; Agent 5 owns; Agent 8 consumes |
| `apps/api/src/auth/` | Agent 5 | C | S4-04 | NONE | Auth guard extensions only; no new mechanism; Agent 8 consulted on requirements |
| `apps/api/src/**/*.spec.ts` (new test files) | Agent 5 | C | S4-04 | NONE | Unit tests for all new controllers; Agent 5 owns |
| `apps/api/prisma/schema.prisma` | LOCKED | — | — | HIGH | No schema changes in Sprint 4; migrations reserved for Sprint 5. Any agent attempting schema changes must raise a blocker to Agent 1 |

---

### Data Provider Spike (isolated)

| File / Domain | Owner Agent | Phase | Stories | Conflict Risk | Notes |
|---------------|-------------|-------|---------|---------------|-------|
| `tools/data-provider-spike/` (entire directory, new) | Agent 7 | B | S4-06 | NONE | Isolated spike directory; never imported by apps/api or apps/experience |
| `tools/data-provider-spike/.env.example` | Agent 7 | B | S4-06 | NONE | Documents required provider API key vars; no real keys committed |
| `tools/data-provider-spike/**/*.spec.ts` | Agent 7 | B | S4-06 | NONE | Mock HTTP response unit tests for PoC adapter |

---

### Research & Data Documentation

| File / Domain | Owner Agent | Phase | Stories | Conflict Risk | Notes |
|---------------|-------------|-------|---------|---------------|-------|
| `docs/data/SPRINT-4-PROVIDER-RECOMMENDATION.md` | Agent 7 | B | S4-06 | NONE | Vendor evaluation matrix and recommendation |
| `docs/data/SPRINT-4-PROVIDER-EVALUATION.md` | Agent 7 | B | S4-06 | NONE | Detailed per-provider scoring |
| `docs/adr/ADR-030.md` | Agent 7 | B | S4-06 | LOW | ADR-030 is currently a DRAFT (from STORY-FE-PREMIUM-01A); Agent 7 updates or confirms it; Agent 1 reviews before Phase F |
| `docs/adr/ADR-031.md` | Agent 7 (if needed) | B/C | S4-06 | NONE | New ADR if provider decision constitutes a new architectural commitment |

---

## Merge Sequencing Rules

The following rules prevent conflicts and ensure gates remain meaningful:

1. **Phase B deliverables first.** All Phase B outputs (S4-01, S4-03, S4-06, S4-08) are documentation and configuration only. They can be committed in any order.

2. **S4-03 must be committed before any Phase C code begins.** Agents 5, 6, and 8 must read the wiring audit before writing.

3. **`apps/experience/src/lib/experience.ts` merge order.** Agent 6 commits additions, then Agent 8 commits additions on top. Never simultaneous.

4. **`apps/experience/.env.example` merge order.** Agent 2 creates the file in Phase B. Agent 8 adds auth env vars in Phase C as an appended block, not a rewrite.

5. **`apps/api/prisma/schema.prisma` is frozen.** No agent may modify it in Sprint 4. A migration in Sprint 4 would invalidate the existing seed state and break the WC2026 active competition.

6. **`apps/experience/src/lib/experience.spec.ts` is expanded last.** Phase D test expansion happens after Phase C code is committed and passing. Editing the spec file before the new components exist will cause spec failures.

7. **`docs/adr/ADR-030.md` is owned by Agent 7** but must be approved by Agent 1 before Phase F. If Agent 7 promotes ADR-030 from DRAFT to ACCEPTED, Agent 1 records this in the release gate doc.

---

## Files That Must Not Be Modified

| File | Reason |
|------|--------|
| `apps/api/prisma/schema.prisma` | No schema migrations in Sprint 4; frozen |
| `.github/workflows/security.yml` | Trivy blocking mode must not be weakened |
| `.github/workflows/ci.yml` | CI gates must not be weakened |
| `apps/api/src/season/season.service.ts` (activation gate) | PSL must remain INACTIVE |
| Any file under `apps/web/` | Sprint 4 scope is `apps/experience` and `apps/api` only |
| `STORY-40` related files | RESERVED; do not touch |
| `terraform/` | Infrastructure frozen for Sprint 4; no Terraform changes |
