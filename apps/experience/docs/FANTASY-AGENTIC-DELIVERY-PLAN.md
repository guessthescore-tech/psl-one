# PSL One — Fantasy Agentic Delivery Plan
**Story:** STORY-FE-FANTASY-AGENTIC-01
**Branch:** `feature/fantasy-complete-experience`
**Base SHA:** `12056c0`
**Date:** 2026-06-19
**Status:** IN PROGRESS

---

## Agent Team

| Agent | Role | Phase | Files owned |
|-------|------|-------|------------|
| Orchestrator | Delivery coordination, integration, QA gates | All | Cross-cutting |
| Agent 2 | Design System & Creative Direction | B | `src/components/fantasy/shared/`, token extensions |
| Agent 3 | Fantasy Core Journey | C | `src/app/fantasy/` (core), `src/components/fantasy/core/` |
| Agent 4 | Fantasy Leagues & Social | C | `src/app/fantasy/leagues/`, `src/app/fantasy/history/`, `src/components/fantasy/leagues/` |
| Agent 5 | Player Research, Stats, Match Context | C | `src/app/matches/`, `src/app/players/`, `src/app/stats/`, `src/app/media/`, `src/components/football/` |
| Agent 6 | Account, Auth & Support | C | `src/app/sign-in/`, `src/app/register/`, `src/app/account/`, `src/app/help/`, `src/app/terms/`, `src/app/privacy/`, `src/app/about/`, `src/app/scan/`, `src/app/quiz/`, `src/components/account/` |
| Agent 7 | Navigation & IA | D | `src/components/shell/` updates, route manifest |
| Agent 8 | Data Contract & Integration | B | `src/lib/` (API clients, data types) |
| Agent 9 | Accessibility & Responsive QA | E | docs only (review pass) |
| Agent 10 | Test & Release Readiness | E | `src/lib/experience.spec.ts` extensions |

---

## Execution Phases

### Phase A — Audit & Planning (Orchestrator) — COMPLETE
- [x] Repository audit complete
- [x] Feature branch created: `feature/fantasy-complete-experience`
- [x] Directory scaffolding created
- [x] Planning documents created
- [x] File ownership assigned

### Phase B — Foundation (Agents 2 & 8, parallel)
- [ ] Agent 2: Fantasy design system primitives
- [ ] Agent 8: API client layer + data type extensions

### Phase C — Parallel Implementation (Agents 3–6)
- [ ] Agent 3: Fantasy core (landing, onboarding, team, transfers, chips, FDR)
- [ ] Agent 4: Leagues, history, search
- [ ] Agent 5: Matches, players, stats
- [ ] Agent 6: Account, auth, support

### Phase D — Navigation Integration (Agent 7)
- [ ] Full navigation wiring
- [ ] Route manifest

### Phase E — QA Passes (Agents 9 & 10)
- [ ] Accessibility review
- [ ] Test coverage

### Phase F — Validation (Orchestrator)
- [ ] typecheck PASS
- [ ] tests PASS
- [ ] build PASS
- [ ] codex:validate PASS
- [ ] docs:validate PASS
- [ ] git diff --check PASS

---

## Non-Negotiable Product Boundaries

```
World Cup 2026 = active competition (do not change)
PSL = inactive (do not activate)
Fantasy = points-only (no real money)
Wallet = sandbox-only
No betting/odds/stakes/wagers
No real-money prizes
No Terraform/AWS/IAM changes
No Prisma schema/migration changes
No seeds modifications
No apps/web changes
No deployment
```

---

## Data Architecture

```
DESIGN_REVIEW_DATA (default):
  - All screens use WC 2026 mock data
  - Interactive actions simulate success (no persistence)
  - Purple banner clearly labels design-review state
  - No external API calls

LIVE_BETA_DATA:
  - Wires to PSL One NestJS API at NEXT_PUBLIC_API_BASE_URL
  - Auth via localStorage psl_access_token
  - Missing endpoints fall back to DESIGN_REVIEW_DATA with clear label
```

---

## Key Technical Decisions (Assumptions)

| Decision | Rationale |
|----------|-----------|
| Duplicate API clients from apps/web pattern (not import) | apps/experience is standalone; no workspace dependency on apps/web |
| WC 2026 mock data extended with fantasy players | Existing 6 players extended to 30+ for realistic pool |
| Fixture difficulty: mock 5-level scale | FDR API endpoint doesn't exist yet; use DESIGN_REVIEW_DATA with explicit label |
| Rival team detail: mock data | Public team endpoint doesn't exist yet |
| Badge scan: camera shell only, no QR decode | Real BadgeScan model not yet in backend |
| Quiz: shell only with mock questions | Quiz model not yet in backend |
| Terms/Privacy: placeholder text | Legal team approval pending |
| Delete account: non-destructive dialog only | API doesn't exist; labelled "coming soon" |
| In-session password change: non-destructive | API doesn't exist; labelled "coming soon" |
| framer-motion already installed | From STORY-FE-PREMIUM-01A |
