# PSL One — Next Execution Plan
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01 complete)

Dependency-ordered. Each item must be completed before the next begins unless marked as parallel.

---

## COMPLETED: STORY-FE-FANTASY-AGENTIC-01

**Status:** COMPLETE — all gates pass, reconciliation done, push/review pending
**Branch:** `feature/fantasy-complete-experience`
**Tests:** 366/366 PASS
**Build:** 56 pages PASS (102 kB first load JS)
**Typecheck:** PASS (0 errors)
**Dead links:** All 10 internal dead links fixed during reconciliation
**Output:** Full 40-screen Fantasy journey in `apps/experience` (56 pages total, 83 components)

---

## 0. Owner Visual Review

**Status:** PENDING — waiting on owner
**Owner:** Product owner
**Prerequisites:** STORY-FE-FANTASY-AGENTIC-01 complete (done)
**Action:**
```bash
git checkout feature/fantasy-complete-experience
pnpm --filter @psl-one/experience dev
# Open http://localhost:3002
```
**Checklist:** See `apps/experience/docs/FANTASY-OWNER-REVIEW-GUIDE.md`
**Acceptance criteria:**
- Owner has reviewed each journey (Fantasy core, Leagues, Matches, Players, Account, Auth)
- Owner explicitly approves OR lists specific changes needed
- Confirmation that DESIGN_REVIEW_DATA mode is understood (all data is mock)
**Blockers:** Requires owner to run app locally
**Output:** Owner approval (verbal or written) OR change requests

---

## 1. Push Feature Branch

**Status:** PENDING — awaiting Step 0 approval
**Owner:** Engineering lead
**Prerequisites:** Step 0 owner approval
**Action:**
```bash
git push origin feature/fantasy-complete-experience
```
**Note:** Pushing this branch does NOT trigger any deployment. GitHub Actions only deploys on push to `main`. Vercel is not yet configured for `apps/experience`. This push is safe.
**Acceptance criteria:**
- Branch visible on `origin/feature/fantasy-complete-experience`
- CI runs and passes (lint, typecheck, test for all apps)

---

## 2. PR to Main

**Status:** PENDING — awaiting Step 1
**Owner:** Engineering lead
**Prerequisites:** Branch pushed (Step 1)
**Action:**
```bash
gh pr create --title "feat(experience): STORY-FE-FANTASY-AGENTIC-01 — complete 56-page Fantasy experience" \
  --body "Full 40-screen Fantasy journey in apps/experience. 366 tests. Build: 56 pages. All gates pass. See apps/experience/docs/STORY-FE-FANTASY-AGENTIC-01-HANDOVER.md for full details."
```
**Acceptance criteria:**
- PR approved by owner or engineering lead
- CI passes on PR
**Do NOT merge until:** Owner has completed visual review (Step 0)

---

## 3. Merge to Main

**Status:** NOT STARTED — awaiting Step 2
**Owner:** Engineering lead
**Prerequisites:** Step 0 + Step 2
**Note:** This merge changes ONLY `apps/experience` and `docs/handover`. It does not change Terraform, AWS, Prisma, or `apps/web`.

---

## 4. Vercel Preview Configuration

**Status:** NOT STARTED — awaiting Step 3
**Owner:** Engineering lead + owner (billing)
**Prerequisites:** Step 3 merge
**Deliverables:**
- Vercel project created for `apps/experience`
- Root directory: `apps/experience`
- Framework preset: Next.js
- `NEXT_PUBLIC_DATA_MODE=DESIGN_REVIEW_DATA` env var
- Preview URL confirmed working
**Acceptance criteria:**
- Vercel deploy succeeds
- Purple DESIGN_REVIEW_DATA banner visible
- No build errors in Vercel logs

---

## 5. Stub Page Completion (Apps/Experience)

**Status:** NOT STARTED — after Step 4
**Owner:** Engineering lead
**Scope:** These 5 stub pages need full UI:

| Route | Blocker |
|-------|---------|
| `/fantasy/points` | Backend gameweek scoring API contract |
| `/fantasy/fixtures` | UX decision: merge with `/matches` or separate? |
| `/fantasy/stats` | Backend fantasy stats API contract |
| `/fantasy/rules` | Rules content from Product team |
| `/predict` | Full prediction game UI story |

---

## 6. Provider Evaluation

**Status:** IN PROGRESS (STORY-FE-PREMIUM-01A Phase 7)
**Owner:** Product owner + engineering lead
**Deliverables:**
- Provider shortlisted
- Budget approved
**Blockers:** Owner decision

---

## 7. Data Licensing Gate

**Owner:** Product owner (must be done by owner — not delegatable)
**Checklist:** `docs/data/PSL-DATA-LICENSING-GATE.md`
**Action:** Owner must engage Stats Perform / API-Football commercial team

---

## 8. PSL Season Activation

**Status:** NOT STARTED — after licensing gate
**Prerequisites:** Provider licensed + squad import + calibration checks pass
**CRITICAL:** PSL is currently INACTIVE. Do not activate until this step.

---

## 9. Production Provider Integration

**Prerequisites:** Step 7 licensing gate SIGNED + Step 8 season readiness
**Owner:** Engineering lead
**Deliverables:**
- Rate limiting, caching, retries, circuit breaker
- Observability: metrics, alerts, dashboards
- Auto-import schedule
- No provider key in browser code
