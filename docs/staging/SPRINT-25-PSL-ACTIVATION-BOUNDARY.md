# Sprint 25 — PSL Activation Boundary

## What This Document Defines

This document draws the explicit boundary between Sprint 25 work and PSL season activation. It exists to prevent scope creep and accidental activation.

---

## What Sprint 25 Does

| Action | In Sprint 25? |
|--------|---------------|
| Check Parse PSL fixture availability (dryRun=true) | YES — read-only |
| Check team resolution readiness | YES — read-only |
| Create docs for monitoring workflow | YES — docs only |
| Create runbooks for future import/publication | YES — docs only, NOT executed |
| Deploy new code to beta EC2 | NO |
| Import PSL fixtures (`dryRun:false`) | NO |
| Publish PSL fixtures | NO |
| Activate PSL season | NO |
| Enable scheduled ingestion | NO |
| Enable production ingestion | NO |
| Activate wallet production | NO |

---

## PSL Activation Prerequisites

PSL season activation requires **all 13+ preflight checks** to pass. Current state:

| Check | Status |
|-------|--------|
| Active season exists | PASS (WC2026 active) |
| Activation target season set | FAIL — PSL 2026/27 season not created |
| Published fixtures for season | FAIL — no fixtures yet |
| Player prices calibrated | PASS (96 players seeded) |
| Fantasy rules configured | PASS |
| Prediction rules configured | PASS |
| Provider integration configured | PASS |
| No active draft in progress | PASS |
| Squad import complete | PASS (96 provisional players) |
| Gameweeks created | FAIL — no gameweeks for PSL 2026/27 |
| Integration provider health | CONDITIONAL |
| Season switch readiness | BLOCKED by above |

**Minimum remaining work before PSL activation:**
1. Fixtures imported and published (Sprint 25+)
2. Gameweeks created for PSL 2026/27
3. PSL 2026/27 season record created
4. Season switch preflight all-green
5. Owner explicit activation authorisation

---

## Why PSL Is Not Activated in Sprint 25

- No fixture data available from psl.co.za yet
- No gameweeks defined for PSL 2026/27
- PSL 2026/27 season record not yet created
- Platform focus is WC2026 (currently active season)
- Owner has not authorised activation

---

## Current Platform State

```
PSL:                    INACTIVE
WC2026:                 ACTIVE (seed data)
Wallet:                 SANDBOX (SiliconEnterpriseSandboxWalletAdapter)
Scheduled ingestion:    DISABLED
Production ingestion:   DISABLED
Real-money:             NONE
```
