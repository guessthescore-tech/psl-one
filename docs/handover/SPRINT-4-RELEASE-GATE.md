# Sprint 4 — Release Gate

**Story:** STORY-S4-09  
**Branch:** `feature/sprint-4-premium-activation`  
**Date:** 2026-06-20  
**Starting SHA:** `a58c38b247fe85ad63ce292f5c71dfd0f887284b`

---

## Gate Status

| Gate | Status | Evidence |
|------|--------|---------|
| External preview configuration | ✅ PASS | `vercel.json` + `.env.example` committed |
| External preview deployed | ✅ PASS | https://psl-one-experience-preview-cxb5urftw-guess-the-score.vercel.app (`dpl_W1mvR8gYtbeUhza1ZJAC6s8UoRtJ`); 9/9 smoke checks HTTP 200; noindex confirmed; 34 screenshots at `~/Desktop/psl-one-sprint4-preview-review/` |
| Visual review package complete | ✅ PASS | Screen acceptance matrix + visual defect log created |
| Predict page implemented | ✅ PASS | `/predict` fully implemented (was "Coming soon") |
| Challenge flow implemented | ✅ PASS | `/predict/challenge` + `/predict/challenge/accept` |
| Share: WhatsApp | ✅ PASS | `ShareSheet` in predict page |
| Share: Web Share API | ✅ PASS | `navigator.share` with fallback |
| Share: Copy link | ✅ PASS | `navigator.clipboard.writeText` with fallback |
| Points-only disclaimer visible | ✅ PASS | All game surfaces show disclaimer |
| Account notifications page | ✅ PASS | `/account/notifications` — wired to `/notifications/preferences` |
| API wiring matrix complete | ✅ PASS | 52 routes classified; 1 reclassification + 1 new route added during reconciliation |
| Missing contracts documented | ✅ PASS | 7 missing contracts documented with ADR |
| Provider research complete | ✅ PASS | Recommendation: Sportmonks; licensing gate documented |
| PoC adapter interface | ✅ PASS | `tools/data-provider-spike/adapter-interface.ts` |
| Analytics event catalogue | ✅ PASS | `SPRINT-4-ANALYTICS-EVENT-CATALOGUE.md` |
| Sponsor inventory | ✅ PASS | `SPRINT-4-SPONSOR-INVENTORY.md` |
| Sponsor safe zones | ✅ PASS | `SPRINT-4-SPONSOR-SAFE-ZONES.md` |
| noindex robots meta | ✅ PASS | `layout.tsx` sets `robots: { index: false, follow: false }` in preview mode |
| Security headers in vercel.json | ✅ PASS | X-Robots-Tag, X-Frame-Options, X-Content-Type-Options |
| Dead links | ✅ PASS | No dead links in new pages |
| Typecheck: experience | ✅ PASS | `tsc --noEmit` → 0 errors |
| Tests: experience | ✅ PASS | 434/434 tests pass |
| Build: experience | ✅ PASS | 59 static pages generated; 52 unique routes |
| Tests: API | ✅ PASS | 1,652/1,652 tests pass |
| codex:validate | ✅ PASS | 0 errors, 0 warnings |
| docs:validate | ✅ PASS | All 18 checks pass |
| pnpm audit | ⚠️ NOTE | 3 moderate pre-existing vulns (postcss, uuid, protobufjs) in admin/testing — NOT in experience app; unchanged from before Sprint 4 |
| CI (main) | ✅ PASS | a58c38b — 6/6 checks green |

---

## Non-Negotiable Product State — Confirmed

| Item | State | Evidence |
|------|-------|---------|
| World Cup 2026 | ACTIVE beta competition | DB seed unchanged; no season changes |
| PSL | INACTIVE | No season activation performed |
| Fantasy | Points-only | No financial wiring added |
| Guess the Score | Points-only | "Points only · no real money" in every predict surface |
| Social prediction | Points-only | Challenge pages have disclaimer |
| Fan Value | Non-financial | No wallet interaction added |
| Wallet | Sandbox-only | SiliconEnterpriseSandboxWalletAdapter unchanged |
| STORY-40 | RESERVED | Zero touches to STORY-40 files |

---

## Security Confirmation

| Item | Status |
|------|--------|
| Trivy blocking mode | UNCHANGED — not modified |
| CI security gates | UNCHANGED — not modified |
| IAM guardrails | UNCHANGED — not modified |
| Terraform controls | UNCHANGED — not touched |
| No API keys in NEXT_PUBLIC_* | CONFIRMED |
| No provider browser calls | CONFIRMED |
| No secrets in committed files | CONFIRMED |

---

## Deployment State

| Target | State |
|--------|-------|
| AWS EC2 beta (`16.28.84.11`) | UNCHANGED — operational beta |
| Vercel (apps/experience) | NOT YET DEPLOYED — config complete, credential step pending |
| Vercel (apps/web) | UNCHANGED |
| ECS Fargate staging | UNCHANGED |
| Production | NOT started |

---

## Stopped At (Hard Blocker)

**Vercel project linking** requires owner to authenticate via `vercel login` and run `vercel link` from `apps/experience/`. All configuration is complete and committed. This is the only hard blocker.

**All other Sprint 4 work is complete.**

---

## What is NOT in This Release

Per Sprint 4 spec:
- No PSL activation
- No production deployment
- No production wallet activation
- No real sponsor campaign activation
- No sports data provider ingestion activated
- No STORY-40 work

---

## Recommended Next Action

1. Owner runs: `vercel login && cd apps/experience && vercel link`
2. Sets env vars in Vercel dashboard (see `SPRINT-4-DEPLOY-GUIDE.md`)
3. Runs: `vercel --cwd apps/experience`
4. Reviews the visual acceptance matrix (`SPRINT-4-SCREEN-ACCEPTANCE-MATRIX.md`)
5. Approves or requests corrections
6. PR `feature/sprint-4-premium-activation` → `main` when approved
