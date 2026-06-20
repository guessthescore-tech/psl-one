# Sprint 4 — Dependency Graph

**Sprint:** S4 — Premium Experience Activation, Live Data Readiness & Beta Release
**Branch:** `feature/sprint-4-premium-activation`
**Date:** 2026-06-20

---

## Legend

```
──────────────────── ▶   Feeds into (produces output consumed by)
═══════════════════ ▶   Blocks (target cannot start until source completes)
  (parallel)           Stories in the same phase can run concurrently
  [GATE]               Phase boundary — all items above must pass before proceeding
  * critical path      Story is on the longest chain to release
```

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase A — Audit & Plan (COMPLETE)                                          │
│                                                                             │
│  Delivery Plan (this sprint) ─────────────────────────────────── ▶ Phase B │
│  Story Matrix                ─────────────────────────────────── ▶ Phase B │
│  Dependency Graph            ─────────────────────────────────── ▶ Phase B │
│  File Ownership              ─────────────────────────────────── ▶ Phase B │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                 [GATE: Phase A docs committed]
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase B — Parallel Foundations  (all 4 run concurrently)                  │
│                                                                             │
│  S4-01  External Preview Hosting *  ──────────────────────────── ▶ S4-02  │
│         (Agent 2)                                                           │
│         vercel.json, .env.example                                           │
│         SPRINT-4-DEPLOY-GUIDE.md                                            │
│                                                                             │
│  S4-03  Real API Wiring Audit *     ══════════════════════════ ▶ S4-04    │
│         (Agent 4)                   ══════════════════════════ ▶ S4-05    │
│         SPRINT-4-API-WIRING.md      ══════════════════════════ ▶ S4-07    │
│         SPRINT-4-DATA-TRUTH.md                                              │
│                                                                             │
│  S4-06  Provider Research           ──────────────────────────── ▶ S4-03  │
│         (Agent 7)                   (informs wiring audit)                  │
│         SPRINT-4-PROVIDER-*.md                                              │
│         tools/data-provider-spike/                                          │
│                                                                             │
│  S4-08  Analytics & Sponsor         ──────────────────────────── ▶ Phase E │
│         (Agent 9)                                                           │
│         SPRINT-4-ANALYTICS-*.md                                             │
│         SPRINT-4-SPONSOR-*.md                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                           [GATE: S4-03 audit complete]
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase C — Product Implementation  (S4-04, S4-05, S4-07 run concurrently)  │
│                                                                             │
│  S4-04  Missing Backend Contracts * ──────────────────────────── ▶ S4-05  │
│         (Agent 5)                   ──────────────────────────── ▶ S4-07  │
│         apps/api/src/               ──────────────────────────── ▶ Phase E │
│         New NestJS controllers/DTOs                                         │
│                                                                             │
│  S4-05  Prediction Sharing &        ──────────────────────────── ▶ Phase E │
│         Social Challenge Loop *                                             │
│         (Agent 6)                                                           │
│         predict/challenge/page.tsx                                          │
│         components/actions/*                                                │
│                                                                             │
│  S4-07  Auth & Account Completion * ──────────────────────────── ▶ Phase E │
│         (Agent 8)                                                           │
│         account/*/page.tsx                                                  │
│         sign-in, register, forgot-password pages                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                     [GATE: S4-04 backend available; S4-05 + S4-07 complete]
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase D — Hosted Review & QA  (run concurrently)                           │
│                                                                             │
│  S4-02  Owner Visual Acceptance *   ──────────────────────────── ▶ S4-09  │
│         (Agent 3)                                                           │
│         Requires: S4-01 preview URL                                         │
│         SPRINT-4-VISUAL-*.md                                                │
│                                                                             │
│  Accessibility Review               ──────────────────────────── ▶ S4-09  │
│         (Agent 3, piggyback on S4-02)                                       │
│         WCAG 2.1 AA checklist per route                                     │
│                                                                             │
│  Test Coverage Expansion            ──────────────────────────── ▶ Phase E │
│         (Agent 11 / S4-09 pre-work)                                         │
│         experience.spec.ts new assertions                                   │
│         New action component tests                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                        [GATE: All Phase C code merged cleanly]
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase E — Integration Validation                                           │
│                                                                             │
│  pnpm --filter @psl-one/experience typecheck ───────────────────── ▶ Phase F│
│  pnpm --filter @psl-one/experience test      ───────────────────── ▶ Phase F│
│  pnpm --filter @psl-one/experience build     ───────────────────── ▶ Phase F│
│  pnpm --filter @psl-one/api test             ───────────────────── ▶ Phase F│
│  pnpm codex:validate                         ───────────────────── ▶ Phase F│
│  pnpm docs:validate (must be 18/18)          ───────────────────── ▶ Phase F│
│  Trivy blocking scan (0 new HIGH/CRITICAL)   ───────────────────── ▶ Phase F│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                          [GATE: ALL Phase E checks exit 0]
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase F — Final Release Gate                                               │
│                                                                             │
│  S4-09  Beta Release Gate *         (depends on ALL stories above)         │
│         (Agent 1 — Orchestrator)                                            │
│         SPRINT-4-RELEASE-GATE.md                                            │
│         SPRINT-4-HANDOVER.md                                                │
│         Branch ready for owner PR review                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Critical Path

The longest chain from start to release — any delay here delays the sprint.

```
Phase A
  └─▶ S4-03 API Wiring Audit (Phase B)
        └═▶ S4-04 Missing Backend Contracts (Phase C)
              ├─▶ S4-05 Prediction Sharing (Phase C)
              │     └─▶ Phase E Integration
              │           └─▶ S4-09 Release Gate (Phase F)
              └─▶ S4-07 Auth & Account (Phase C)
                    └─▶ Phase E Integration
                          └─▶ S4-09 Release Gate (Phase F)
```

**Critical path stories in order:** S4-03 → S4-04 → S4-05/S4-07 → Phase E → S4-09

S4-03 is the single earliest bottleneck. Agents 5, 6, and 8 cannot begin their code work until it completes.

---

## Parallel Execution Map

```
TIME ──────────────────────────────────────────────────────────────────────▶

Phase A   [██████ Plan]

Phase B   [S4-01 Agent 2 ████████████████████████]
          [S4-03 Agent 4 ████████████████████████] ← critical
          [S4-06 Agent 7 ████████████████████████]
          [S4-08 Agent 9 ████████████████████████]
                                    │
                             [GATE S4-03]
Phase C                              [S4-04 Agent 5 ██████████████] ← critical
                                     [S4-05 Agent 6 ██████████████]
                                     [S4-07 Agent 8 ██████████████]

Phase D                   [S4-02 Agent 3 ████████████████████████]
                          (can start as soon as S4-01 preview available)

Phase E                                              [████ Integration ████]

Phase F                                                           [S4-09 Gate]
```

---

## Story-to-Story Dependency Summary

| Story | Blocked By | Blocks |
|-------|-----------|--------|
| S4-01 | Phase A | S4-02 |
| S4-02 | S4-01 (preview URL) | S4-09 |
| S4-03 | Phase A | S4-04, S4-05, S4-07 |
| S4-04 | S4-03 | S4-05 (challenge endpoint), S4-07 (account endpoints), Phase E |
| S4-05 | S4-03, S4-04 (challenge endpoint) | Phase E |
| S4-06 | Phase A | S4-03 (informs wiring audit) |
| S4-07 | S4-03, S4-04 (account endpoints) | Phase E |
| S4-08 | Phase A | Phase E |
| S4-09 | ALL | Release |

---

## Notes

- S4-06 (Provider Research) informs S4-03 but does not hard-block it. Agent 4 may begin the wiring audit and mark provider-dependent routes as "EXTERNAL-PENDING" while Agent 7 researches.
- S4-02 (Visual Acceptance) depends on a working preview URL from S4-01 but is otherwise independent of the Phase C code work. Agent 3 may draft the screen matrix document during Phase B and complete acceptance testing in Phase D after code is deployed.
- Phase E integration must be run sequentially in the listed order. A typecheck failure must be fixed before running tests; a test failure must be fixed before running build.
- S4-09 does not merge the branch — it prepares the branch for owner PR review only.
