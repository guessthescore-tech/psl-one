# Sprint 18 — Story Matrix

## Sprint: Fixture Publishing Admin Workflow & PSL Activation Pre-Flight

**Branch:** `feature/sprint-18-fixture-publishing-preflight`
**Status:** CONDITIONAL_GO
**Sprint Goal:** Build the fixture publishing admin workflow and PSL activation pre-flight checklist. Do NOT activate PSL.

---

## Story Matrix

| Story ID | Story | Scope | Status |
|----------|-------|-------|--------|
| S18-01 | Fixture Publication Service | API | DONE |
| S18-02 | PSL Activation Pre-Flight Service | API | DONE |
| S18-03 | Fixture Publication Controller | API | DONE |
| S18-04 | PSL Pre-Flight Controller | API | DONE |
| S18-05 | Fixture Import Module Update | API | DONE |
| S18-06 | Fixture Publication API Helpers | Frontend | DONE |
| S18-07 | Admin: Imported Fixtures Page | Frontend | DONE |
| S18-08 | Admin: PSL Pre-Flight Page | Frontend | DONE |
| S18-09 | Discovery Tool: Fixture Publication Smoke | Tools | DONE |
| S18-10 | Discovery Tool: PSL Pre-Flight Check | Tools | DONE |
| S18-11 | Docs: Fixture Publishing Workflow | Docs | DONE |
| S18-12 | Docs: PSL Activation Pre-Flight | Docs | DONE |
| S18-13 | Docs: Fixture Publication Audit | Docs | DONE |
| S18-14 | Docs: Admin Smoke Runbook | Docs | DONE |
| S18-15 | Docs: Beta Go/No-Go | Docs | DONE |
| S18-16 | Docs: Handover | Docs | DONE |
| S18-17 | Docs: Known Gaps | Docs | DONE |
| S18-18 | Docs: Owner Review Guide | Docs | DONE |
| S18-19 | Docs: Rollback Plan | Docs | DONE |
| S18-20 | Docs: Sprint Matrix | Docs | DONE |

---

## API Route Inventory (Sprint 18 additions)

| Method | Path | Role | Service |
|--------|------|------|---------|
| GET | `/admin/fixtures/imported` | ADMIN | FixturePublicationService.listImportedFixtures |
| POST | `/admin/fixtures/publish` | ADMIN | FixturePublicationService.publishFixtures |
| GET | `/admin/psl/preflight` | ADMIN | PslActivationPreflightService.runPreflight |

**Cumulative route count:** 545 + 3 = 548 API routes

---

## Frontend Page Inventory (Sprint 18 additions)

| Path | Title | Type |
|------|-------|------|
| `/admin/fixtures/imported` | Imported Fixtures | Admin |
| `/admin/psl/preflight` | PSL Activation Pre-Flight | Admin |

**Cumulative page count:** 351 + 2 = 353 total pages

---

## Test Coverage

| Suite | Tests Added | Total |
|-------|-------------|-------|
| fixture-publication.service.spec.ts | 28 | 28 |
| psl-activation-preflight.service.spec.ts | 15 | 15 |
| experience.spec.ts (Sprint 18 block) | 25 | ~766 |
| Total API | 43 | ~1,932 |

---

## Pre-Flight Check Coverage

| Check | Tests |
|-------|-------|
| psl_season_exists FAIL → NO_GO | ✓ |
| fixtures_exist FAIL → NO_GO | ✓ |
| fixtures_published WARN → CONDITIONAL_GO | ✓ |
| wallet_sandbox_only FAIL → NO_GO | ✓ |
| explicit seasonId accepted | ✓ |
| no_real_money_flags always PASS | ✓ |
| no DB mutations | ✓ |
| audit log written | ✓ |
| audit failure safe | ✓ |
| no PSL activation in source | ✓ |
| no scheduler in source | ✓ |

---

## Hard Constraints Check

| Constraint | Status |
|-----------|--------|
| PSL NOT activated | PASS |
| Scheduled ingestion NOT enabled | PASS |
| Production ingestion NOT enabled | PASS |
| Wallet in SANDBOX only | PASS |
| No betting/odds/wager language | PASS |
| PARSE_API_KEY not in frontend | PASS |
| NEXT_PUBLIC_PARSE_API_KEY forbidden | PASS |
| No .env committed | PASS |
| No AWS/Terraform/EC2 mutations | PASS |
| No real-money wallet activation | PASS |

---

## Migration Count

**Sprint 18 migrations added: 0**

Cumulative migration count: 42 (unchanged from Sprint 17)

---

## Known Gaps / Owner Gates

See [SPRINT-18-KNOWN-GAPS.md](../handover/SPRINT-18-KNOWN-GAPS.md) and [SPRINT-18-BETA-GO-NOGO.md](../handover/SPRINT-18-BETA-GO-NOGO.md) for the 6 owner gates and 8 known gaps.
