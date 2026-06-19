# PSL One — Current State
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01)

---

## Repository

| Item | Value |
|------|-------|
| Repository | `~/Projects/psl-one` |
| Branch | `main` |
| Local HEAD | `bbb990c9e3b4d9c377f4a6052d5e7aa1a68d71da` |
| Remote origin/main | `9bbb3e054069dc150f736b26b4480b6eb3d5bf02` |
| Ahead of remote | 1 commit (STORY-FE-VISION-01 — Vision Studio) |
| Behind remote | 0 |

## Operational Beta (`apps/web`)

| Item | Status |
|------|--------|
| Application | LIVE on AWS ECS Fargate (staging via EC2 for beta) |
| EC2 instance | `i-0a5f16539c9626f90`, `16.28.84.11`, `af-south-1b` |
| SSM access | Online (17/17 smoke checks PASS) |
| API tests | 1,560 passing |
| Web pages | 319 routes |
| Database | WC 2026 seeded, idempotent |
| PSL season | INACTIVE (PSL NOT activated) |
| Wallet | SiliconEnterprise sandbox adapter (non-financial) |
| Commit deployed | `4023677` (DB seed), pipeline run `27683700325` |

## AWS Infrastructure

| Item | Status |
|------|--------|
| ECS Fargate (staging) | Authored, not yet applied (S3-INFRA-01) |
| EC2 beta | Applied (S3-INFRA-02F) |
| ECR repos | 3 repos, IMMUTABLE tags (S3-INFRA-02C) |
| OIDC provider | Configured for GitHub Actions deploy role |
| IAM deploy role | Active |
| Terraform state | 10 resources, backed up |
| Next apply | Requires fresh plan + owner authorisation |

## World Cup 2026 Active Beta

- World Cup 2026 season is the ACTIVE season in the operational beta database
- WC2026 seed was applied and confirmed idempotent
- 8 national teams seeded, 5 fixtures, 6 players in `apps/experience` design data
- PSL season NOT activated (intentional — controlled activation deferred)

## Wallet Sandbox

- `SiliconEnterpriseSandboxWalletAdapter` is active
- NON-financial: points-only, no real money, no payouts, no deposits
- All game surfaces carry "Points only - no real money" disclaimer

## Completed Stories (Sprint 1-3)

| Story | Description | Tests |
|-------|-------------|-------|
| STORY-FE-FANTASY-AGENTIC-01 | Full Fantasy experience in apps/experience | 366 |
| STORY-11 | Prediction lock/settle/void | — |
| STORY-12 | Fantasy Deadlines & Transfer Rules | 362 |
| STORY-14 | Fantasy Rules Admin Config | 380 |
| STORY-15 | Fantasy Leagues & Cups | 398 |
| STORY-16 | Gameweek Scoring & History | 441 |
| STORY-17 | Live Match Dashboard | 492 |
| STORY-18 | Fantasy Auto-Substitution | 524 |
| STORY-19 | Fan Value Ledger | 546 |
| STORY-20 | Achievements & Badges | 574 |
| STORY-21 | Rewards Readiness | 650 |
| STORY-22 | Notifications & Alerts | 697 |
| STORY-23 | Social Activity Feed | 746 |
| STORY-24 | Admin Command Centre | 812 |
| STORY-25 | Sprint 1 Final Handover | — |
| STORY-26 | PSL Club Experience | 883 |
| STORY-27 | Fixture Import & Publishing | 922 |
| STORY-28 | Competition Switching | 954 |
| STORY-29 | Fantasy Season Calibration | 975 |
| STORY-30 | Prediction Season Calibration | 998 |
| STORY-31 | Gameweek & Matchday Operations | 1037 |
| STORY-32 | Admin Operations Control Plane | 1088 |
| STORY-33 | Leaderboards & Fan Value Scope | 1170 |
| STORY-34 | Player Stats & Match Performance | 1188 |
| STORY-35 | Beta Feedback & UX Polish | 1216 |
| STORY-36 | Squad Import & Price Calibration | 1293 |
| STORY-37 | Media, Sponsor & Wallet Foundation | 1452 |
| STORY-38 | Live Match Intelligence & Social Prediction | 1528 |
| STORY-39 | Beta Launch Readiness | 1560 |
| S3-INFRA-00 | Security & Performance Hardening | 1645 |
| S3-INFRA-01 | ECS Fargate Staging Infra | 1652 |
| S3-INFRA-02 | EC2+Compose Beta Profile | — |
| S3-INFRA-02C | ECR + OIDC + Deploy Role | — |
| S3-INFRA-02D | Beta EC2 Plan Review | — |
| S3-INFRA-02E | IAM DenyPublicS3 | — |
| S3-INFRA-02F | Beta EC2 Apply | — |
| S3-INFRA-02G | First Green Deploy Pipeline | — |
| S3-INFRA-02G-C | DB Seeded | — |
| STORY-FE-BETA-01 | Full Fan Homepage | — |
| STORY-FE-UX-01 | Design Lab | — |
| STORY-FE-UX-02 | Visual Excellence | — |
| STORY-FE-UX-03 | Responsive Nav & Football Visual System | — |
| STORY-FE-UX-04 | Motion Polish & Social Sharing | — |
| STORY-FE-VISION-01 | Vision Studio (8 gated routes) | 543 |
| STORY-FE-PREMIUM-01 | Premium Experience standalone frontend | 81 |
| STORY-FE-PREMIUM-01A | Integrity review, handover docs, provider research | — |
| STORY-FE-FANTASY-00 | Fantasy journey inventory & gap analysis | — |

## Fantasy Journey Coverage (as of STORY-FE-FANTASY-00)

Canonical 40-screen inventory from owner-supplied Premier League reference.

| Phase | Screens | EXISTS_PARTIAL (apps/web) | MISSING_FRONTEND | MISSING_BOTH |
|-------|---------|--------------------------|----------------|-------------|
| Phase 1 — Fantasy Core | 11 | 7 | 1 | 3 |
| Phase 2 — Research & Match | 17 | 9 | 3 | 5 |
| Phase 3 — Account & Support | 12 | 6 | 1 | 5 |
| **Total** | **40** | **22** | **5** | **13** |

**EXISTS_PARTIAL** = Route and API exist in `apps/web` operational beta; functional gaps or not in `apps/experience`.
**MISSING_FRONTEND** = API exists; no fan-facing page built.
**MISSING_BOTH** = Neither page nor API; includes: FDR algorithm, rival team detail endpoint, player comparison, in-session password change, account deletion (POPIA), Awards, Hall of Fame, FAQs/Terms/Privacy/About (static), Quiz, Badge scan.

Full detail: `apps/experience/docs/FANTASY-USER-JOURNEY.md`

## Premium Frontend (`apps/experience`)

| Item | Status |
|------|--------|
| Status | COMMITTED on `feature/fantasy-complete-experience`, not pushed, not deployed |
| Branch | `feature/fantasy-complete-experience` (19 commits ahead of main) |
| Framework | Next.js 15.5.18 standalone |
| Port | 3002 |
| Tests | 366/366 PASS |
| Typecheck | PASS (0 errors) |
| Build | PASS (55 pages, 102 kB first load JS) |
| codex:validate | PASS (0 errors) |
| docs:validate | PASS (18/18 checks) |
| Routes | 55 pages across fantasy, matches, players, account, auth, stats, clubs, quiz, scan, help |
| Data mode | `DESIGN_REVIEW_DATA` (WC 2026 mock) default |
| Picsum | Active placeholder — must be replaced before public launch |
| LIVE_BETA_DATA | Wired but returns WC mock (TODO comment — API integration pending) |
| Vercel config | `vercel.json` ready in `apps/web`, pending port to `apps/experience` |

## Skills Installed

| Skill | Location | Status |
|-------|----------|--------|
| component-polish | `.agents/skills/` + `.claude/skills/` | LOADED |
| framer-motion | `.agents/skills/` + `.claude/skills/` | LOADED |
| review-animations | `.agents/skills/` + `.claude/skills/` | LOADED |
| content-research-writer | `.agents/skills/` + `.claude/skills/` | INSTALLED |
| design-taste-frontend | `.claude/skills/` | LOADED |
| emil-design-eng | `.claude/skills/` | LOADED |
| ui-ux-pro-max | `.claude/skills/` | LOADED |

## Known Risks

| Risk | Severity | Status |
|------|----------|--------|
| Picsum placeholder images in `apps/experience` | HIGH | Deferred to production handoff |
| `LIVE_BETA_DATA` returns mock data | MEDIUM | Documented with TODO |
| No provider data license | HIGH | Research spike in progress |
| PSL season not activated | — | Intentional |
| Vercel deploy not configured for `apps/experience` | MEDIUM | Pending owner approval |
| `MatchweekNav` not used in homepage (unused component) | LOW | Available for future routes |
| Focus trap missing in `ShareAction` bottom sheet | LOW | Deferred |

## Untracked Files (2026-06-19)

```
?? docs/infrastructure/S3-INFRA-02-TERRAFORM-PLAN-REVIEW.md
?? impeccable/                 (local framework install, separate from project)
```

Note: `apps/experience` is now committed and tracked on `feature/fantasy-complete-experience`.

## Current Test Counts

| Scope | Count |
|-------|-------|
| API tests (`apps/api`) | 1,652 |
| Web tests (`apps/web`) | 543 |
| Premium tests (`apps/experience`) | 366 |
| **Total** | **2,561** |

## Deployment Status

| Target | Status |
|--------|--------|
| Beta EC2 (`16.28.84.11`) | LIVE — operational beta with WC 2026 data |
| Vercel (`apps/web`) | Pending owner approval (not yet deployed) |
| Vercel (`apps/experience`) | Not configured — next step |
| ECS Fargate staging | Authored, not applied |
| Production | Not started |

## ADR Status

- 27 ADRs committed (ADR-001 through ADR-027)
- ADR-028: ECS Fargate deployment architecture (S3-INFRA-01)
- ADR-029: EC2+Compose beta profile (S3-INFRA-02)
- **ADR-030**: Sports data provider boundary — DRAFT (this story)
