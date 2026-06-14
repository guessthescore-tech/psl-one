# PSL One — Delivery Timeline

**Purpose:** Sprint-by-sprint delivery record  
**Audience:** Product owners, programme management  
**Status:** Current through STORY-39  
**Source of truth:** git log  

---

## Sprint 0 — Architecture & Bootstrap (June 2026)

**Commit:** `04035d5`  
**Output:** Monorepo structure, Docker Compose, GitHub Actions CI skeleton, ADR-001 through ADR-011, planning documents, AWS IAM planning (not deployed)

---

## Sprint 1 — Fan Platform Foundation (June 2026)

**Primary commit:** `1d48fa8` feat: complete sprint 1 fan platform foundation  
**Supporting commits:** `de2f3fe`, `049e44e`, `19a6620`, `5f4eebb`, `26a4c03`, `354c5d0`, `00f6d63`  
**Stories:** STORY-01 through STORY-25  
**Output:** Full fan engagement foundation — auth, football core, Fantasy, predictions, challenges, Fan Value, achievements, rewards, notifications, activity feed, admin dashboard, ~275 web pages, ~800 tests, 28 migrations

---

## Sprint 2 — PSL Season Readiness (June 2026)

**Stories:** STORY-26 through STORY-39  

| Date | Commit | Story | Output |
|------|--------|-------|--------|
| 2026-06-11 | `94e577d` | STORY-26 | 16 PSL clubs, squad seeding, club experience pages |
| 2026-06-11 | `1f826ea` | STORY-27 | Fixture import pipeline |
| 2026-06-11 | `0e5fc51` | STORY-28 | Season switching, 7-check gate |
| 2026-06-11 | `c207c35` | STORY-29 | Fantasy season calibration |
| 2026-06-12 | `88ffc09` | STORY-30 | Prediction season calibration |
| 2026-06-12 | `a3bedbd` | STORY-31 | Gameweek/matchday operations |
| 2026-06-12 | `f59bf21` | STORY-32 | Admin operations control plane |
| 2026-06-12 | `2f43344` | STORY-33 | Season-scoped leaderboards |
| 2026-06-12 | `1b06a00` | STORY-34 | Player stats and match performance |
| 2026-06-12 | `b5d7f6b` | STORY-35 | Beta feedback, bug fixes, UX polish |
| 2026-06-13 | `6b04435` | STORY-36 | Squad import, price calibration, 13-check gate |
| 2026-06-13 | `b083014` | STORY-37 | Media, campaigns, sandbox wallet |
| 2026-06-14 | `d0cc591` | STORY-38 | Live match intelligence, social prediction |
| 2026-06-14 | `08e3852` | STORY-39 | Beta launch readiness |

**Sprint 2 Final totals:** 1,560 tests · 337 pages · 38 migrations

---

## Sprint 3 — Production Infrastructure & Deployment (Planned)

**Status:** Not started  
**Reserved story:** STORY-40 — Official PSL Data Finalisation  

See [Roadmap](ROADMAP.md) for Sprint 3 planned streams.
