# Sprint 4 — Delivery Plan

**Sprint:** S4 — Premium Experience Activation, Live Data Readiness & Beta Release  
**Branch:** `feature/sprint-4-premium-activation`  
**Started:** 2026-06-20  
**Starting SHA:** `a58c38b247fe85ad63ce292f5c71dfd0f887284b`  
**Orchestrator:** Claude Code (Principal Delivery Orchestrator)

---

## Sprint Goal

A stakeholder can open the premium PSL One experience from a secure external preview URL, complete the primary Fantasy and football journeys across mobile and desktop, clearly distinguish live beta data from design-review data, use visible sharing and challenge functions, and review sponsor-ready analytics — without activating PSL, production wallets, betting, or real-money functionality.

---

## Non-Negotiable Product State

| Item | State |
|------|-------|
| World Cup 2026 | ACTIVE beta competition |
| PSL | INACTIVE |
| Fantasy | Points-only |
| Guess the Score | Points-only |
| Social prediction | Points-only |
| Fan Value | Non-financial |
| Wallet | Sandbox-only |
| STORY-40 | RESERVED — do not touch |

**Prohibited:** betting, odds, stakes, wagers, deposits, withdrawals, payouts, cash prizes, bookmaker language, real-money rewards, production wallet activation.

**Must not weaken:** Trivy blocking mode, CI security gates, IAM guardrails, Terraform controls, existing rollback controls, existing season activation gates.

---

## Stories

| ID | Story | Agent | Status | Gate |
|----|-------|-------|--------|------|
| S4-01 | External Premium Experience Preview | Agent 2 | TODO | Vercel config complete; stop at credential step |
| S4-02 | Owner Visual Acceptance System | Agent 3 | TODO | Screen matrix created |
| S4-03 | Real API Wiring Matrix | Agent 4 | TODO | All 49 routes classified |
| S4-04 | Missing Backend Contracts | Agent 5 | TODO | Contracts defined; safe ones implemented |
| S4-05 | Prediction Sharing & Social Challenge Loop | Agent 6 | TODO | Share + challenge + tests |
| S4-06 | Sports Data Provider Discovery Spike | Agent 7 | TODO | Recommendation + PoC adapter |
| S4-07 | Authentication & Account Completion | Agent 8 | TODO | Account flows wired |
| S4-08 | Preview Analytics & Sponsor Readiness | Agent 9 | TODO | Event catalogue + sponsor inventory |
| S4-09 | Beta Release Gate | Agent 1 | TODO | All gates PASS, handover complete |

---

## Execution Phases

### Phase A — Audit and Plan (this document)
- [x] Repository state verified
- [x] Sprint branch created: `feature/sprint-4-premium-activation`
- [x] Starting SHA confirmed: `a58c38b`
- [x] Delivery plan created

### Phase B — Parallel Foundations
- [ ] S4-01: Vercel config + preview docs
- [ ] S4-03: API wiring audit (all 49 routes)
- [ ] S4-06: Provider research docs + PoC adapter
- [ ] S4-08: Analytics catalogue

### Phase C — Product Implementation
- [ ] S4-04: Missing backend contracts
- [ ] S4-05: Prediction sharing + challenge UX
- [ ] S4-07: Account completion

### Phase D — Hosted Review and QA
- [ ] S4-02: Visual acceptance system docs
- [ ] Accessibility review
- [ ] Test coverage expansion

### Phase E — Integration
- [ ] Typecheck: `pnpm --filter @psl-one/experience typecheck`
- [ ] Tests: `pnpm --filter @psl-one/experience test`
- [ ] Build: `pnpm --filter @psl-one/experience build`
- [ ] API tests: `pnpm --filter @psl-one/api test`
- [ ] codex:validate
- [ ] docs:validate
- [ ] audit

### Phase F — Final Release Gate
- [ ] S4-09: Release gate + handover complete

---

## File Ownership

| Domain | Files | Owner |
|--------|-------|-------|
| Sprint docs | `docs/sprints/` | Agent 1 (Orchestrator) |
| Vercel config | `apps/experience/vercel.json`, `.env.example` | Agent 2 |
| Preview docs | `apps/experience/docs/SPRINT-4-DEPLOY-*.md` | Agent 2 |
| Visual review | `apps/experience/docs/SPRINT-4-VISUAL-*.md` | Agent 3 |
| API wiring | `apps/experience/docs/SPRINT-4-API-*.md` | Agent 4 |
| Data truth | `apps/experience/docs/SPRINT-4-DATA-*.md` | Agent 4 |
| Backend contracts | `apps/api/src/` | Agent 5 |
| Predict page | `apps/experience/src/app/predict/` | Agent 6 |
| Challenge route | `apps/experience/src/app/predict/challenge/` | Agent 6 |
| Share components | `apps/experience/src/components/actions/` | Agent 6 |
| Auth/account pages | `apps/experience/src/app/account/` | Agent 8 |
| Analytics | `apps/experience/docs/SPRINT-4-ANALYTICS-*.md` | Agent 9 |
| Sponsor inventory | `apps/experience/docs/SPRINT-4-SPONSOR-*.md` | Agent 9 |
| Provider research | `docs/data/SPRINT-4-PROVIDER-*.md` | Agent 7 |
| PoC adapter | `tools/data-provider-spike/` | Agent 7 |
| Handover | `docs/handover/SPRINT-4-*.md` | Agent 1 |
| Release gate | `docs/handover/SPRINT-4-RELEASE-GATE.md` | Agent 1 |
| Shared arch | Cross-cutting only | Agent 1 |

---

## Merge Order

1. Phase B deliverables (config, docs — no code conflicts)
2. Phase C backend contracts (API only)
3. Phase C predict/challenge UX (experience only)
4. Phase C account completion (experience account/* only)
5. Phase D docs (no code conflicts)
6. Integration validation
7. Phase F handover

---

## Branch Policy

- Work on: `feature/sprint-4-premium-activation`
- Do NOT push to main
- Do NOT merge to main automatically
- Do NOT deploy to production
- Preview deployment allowed for `apps/experience` only
