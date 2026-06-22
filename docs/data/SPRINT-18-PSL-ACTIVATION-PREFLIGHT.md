# Sprint 18 — PSL Activation Pre-Flight Check

## Overview

The PSL Activation Pre-Flight check is a **read-only diagnostic** that evaluates whether a PSL season is ready to be activated. It does NOT activate anything. All activation decisions remain owner-gated via the Season Switching admin action.

All gameplay is points-only. No real-money functionality exists.

---

## Architecture

**Service:** `PslActivationPreflightService` (`apps/api/src/fixture-import/psl-activation-preflight.service.ts`)

**Controller:** `PslPreflightController` (`apps/api/src/fixture-import/fixture-publication.controller.ts`)

**Route:**

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/admin/psl/preflight` | JWT + ADMIN | Run 10-check pre-flight evaluation |

---

## The 10 Checks

| # | Check Name | Fail Condition | Outcome |
|---|-----------|----------------|---------|
| 1 | `psl_season_exists` | No PSL season in DB | FAIL (early return) |
| 2 | `psl_season_inactive` | Season already `isActive = true` | WARN |
| 3 | `fixtures_exist` | No fixtures for season | FAIL |
| 4 | `fixtures_have_teams` | Any fixture missing homeTeamId/awayTeamId | FAIL |
| 5 | `fixtures_have_kickoff` | N/A — schema required field | Always PASS |
| 6 | `fixtures_published` | All fixtures unpublished (zero published) | WARN |
| 7 | `provider_provenance` | Fixtures have no `providerSource` set | WARN |
| 8 | `wallet_sandbox_only` | Any WalletProviderDetail not in SANDBOX status | FAIL |
| 9 | `no_real_money_flags` | N/A — platform is points-only | Always PASS |
| 10 | `activation_approval` | No SeasonActivationApproval record, or status ≠ APPROVED | WARN |

---

## Overall Status Derivation

| Condition | Status |
|-----------|--------|
| Any FAIL checks | `NO_GO` |
| No FAIL, at least one WARN | `CONDITIONAL_GO` |
| No FAIL, no WARN | `GO` |

---

## Response Shape

```json
{
  "status": "CONDITIONAL_GO",
  "blockers": [
    "No fixtures exist for the PSL season — run Parse PSL ingestion first"
  ],
  "warnings": [
    "240 fixture(s) are unpublished — publish them first if fan visibility is required"
  ],
  "checks": [
    { "name": "psl_season_exists", "status": "PASS", "detail": "PSL season found: clu... (PSL 2026/27)" },
    { "name": "wallet_sandbox_only", "status": "PASS", "detail": "All wallet providers are in SANDBOX mode" }
  ]
}
```

---

## PSL Season Resolution

If no `seasonId` query parameter is provided, the service finds the most recent inactive PSL season by looking up:

```prisma
Season.findFirst({
  where: {
    isActive: false,
    competition: {
      slug: { in: ['psl', 'betway-premiership', 'betway_premiership', 'south-africa-psl'] }
    }
  },
  orderBy: { startDate: 'desc' }
})
```

An explicit `seasonId` can be passed as a query parameter to target a specific season.

---

## Wallet Sandbox Check

The `wallet_sandbox_only` check counts all `WalletProviderDetail` records where `status != 'SANDBOX'`. If any non-sandbox wallet providers are found, the check is FAIL. This prevents accidental real-money activation.

The PSL One platform is points-only. No real-money wallet providers should be active.

---

## Audit Log

After each pre-flight run, the service writes an `AdminAuditLog` entry:

```json
{
  "action": "PSL_PREFLIGHT_CHECK_RUN",
  "entityType": "Season",
  "entityId": "<seasonId>",
  "route": "/admin/psl/preflight",
  "metadata": {
    "seasonId": "...",
    "checks": 10,
    "blockers": 0,
    "warnings": 2
  }
}
```

Audit log failure is wrapped in try/catch and never blocks the pre-flight check.

---

## Frontend

**Page:** `/admin/psl/preflight`

**File:** `apps/experience/src/app/admin/psl/preflight/page.tsx`

Features:
- Optional season ID input field
- "Run Pre-Flight Check" button
- GO / CONDITIONAL_GO / NO_GO status banner
- Blockers list (red) and Warnings list (yellow)
- Individual checks table with PASS/WARN/FAIL status
- Reminder: "Activation must be performed via Season Switching admin action"

---

## What This Page Does NOT Do

- Does NOT activate the PSL season
- Does NOT write any database records (other than the audit log via the API)
- Does NOT enable ingestion
- Does NOT publish fixtures
- Does NOT touch wallet configuration

---

## Related Documents

- [SPRINT-18-FIXTURE-PUBLISHING-WORKFLOW.md](./SPRINT-18-FIXTURE-PUBLISHING-WORKFLOW.md)
- [SPRINT-18-FIXTURE-PUBLICATION-AUDIT.md](./SPRINT-18-FIXTURE-PUBLICATION-AUDIT.md)
- [SPRINT-18-BETA-GO-NOGO.md](../handover/SPRINT-18-BETA-GO-NOGO.md)
