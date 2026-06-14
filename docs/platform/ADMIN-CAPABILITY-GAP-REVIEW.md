# PSL One — Admin Capability Gap Review

> **Historical Implementation Record** — This document was created during Sprint delivery as a working reference. It may be superseded by content in `docs/architecture/`, `docs/engineering/`, `docs/reference/`, or `docs/domain/`. Do not use as the canonical source for system behaviour.


**Sprint:** 2  
**Story:** STORY-36 PSL Squad Import, Player Price Finalisation & Activation Dry Run (latest update)  
**Date:** 2026-06-13  
**Status:** ACTIVE — reviewed at STORY-36 acceptance

---

## Safety Constraints (Always Active)

- Fantasy and Guess the Score are **POINTS-ONLY** — no paid entry, no real-money mechanics
- Peer Challenges are **FAN-POINTS-ONLY** — no monetary stakes
- All commercial provider configs are **production-disabled by default**
- No real-money wallet, no real checkout, no real ticket issuance
- No production live-provider ingestion (stub/mock only)
- No secrets, API keys, or credentials stored in `IntegrationProviderConfig`

---

## A. Core Content & Platform Management

| Capability | Status | Risk if Missing | Next Step |
|---|---|---|---|
| Club/player profiles | BUILT_NOW | LOW | Seed official PSL data at season launch |
| Fixture/results data management | BUILT_NOW | HIGH | Import official PSL fixture schedule |
| Match centre tools | FOUNDATION_READY | MEDIUM | Wire live provider Sprint 3+ |
| News/articles/CMS | FUTURE_IMPLEMENTATION | LOW | Sprint 3+ editorial module |
| Video/highlights/media library | FUTURE_IMPLEMENTATION | LOW | Sprint 3+ media module |
| Localization/multilingual | FUTURE_IMPLEMENTATION | LOW | Sprint 3+ i18n |
| Workflow approvals | FUTURE_IMPLEMENTATION | LOW | Sprint 3+ content workflows |

---

## B. Football Data Operations

| Capability | Status | Risk if Missing | Next Step |
|---|---|---|---|
| Competitions & seasons | BUILT_NOW | CRITICAL | Maintain season lifecycle |
| Teams/clubs/players/squads | BUILT_NOW | HIGH | Import official PSL squads |
| Fixture import/validation/publishing | BUILT_NOW | CRITICAL | Import official PSL fixtures |
| Rounds/gameweeks/deadlines | BUILT_NOW | HIGH | Derive gameweeks from PSL fixtures |
| Live fixture state/match events | FOUNDATION_READY | MEDIUM | Wire real provider Sprint 3+ |
| Lineups/player availability | FOUNDATION_READY | MEDIUM | Live provider ingestion Sprint 3+ |
| Standings/logs | BUILT_NOW | LOW | Confirm PSL standings structure |

---

## C. User & Community Management

| Capability | Status | Risk if Missing | Next Step |
|---|---|---|---|
| Fan identity/profile | BUILT_NOW | CRITICAL | Verify POPIA consent flow |
| Consents/POPIA readiness | PARTIALLY_BUILT | HIGH | POPIA DSAR automation Sprint 3+ |
| Activity feed | BUILT_NOW | LOW | Monitor feed growth at launch |
| Moderation/reporting tools | ADMIN_SHELL_READY | MEDIUM | Build moderation queue Sprint 3+ |
| User bans/suspensions | FUTURE_IMPLEMENTATION | MEDIUM | User management Sprint 3+ |
| Social features/friends | FUTURE_IMPLEMENTATION | LOW | Sprint 3+ social graph |

---

## D. Fantasy, Predictions & Engagement

| Capability | Status | Risk if Missing | Note |
|---|---|---|---|
| Fantasy rules config | BUILT_NOW | HIGH | **POINTS-ONLY** — no paid entry |
| Fantasy player pricing | BUILT_NOW | HIGH | Full price calibration pipeline (STORY-36): bounds validation, bulk defaults, FantasyPriceCalibrationBatch lifecycle, `pricesHaveNoCashValue: true` |
| Squad import pipeline | BUILT_NOW | HIGH | Full batch lifecycle DRAFT→VALIDATED→IMPORTED→PUBLISHED, duplicate detection, PROVISIONAL→CONFIRMED registration (STORY-36) |
| Fantasy transfer deadlines | BUILT_NOW | HIGH | Derive from PSL fixtures |
| Fantasy leagues/cups | BUILT_NOW | MEDIUM | Create global league at PSL launch |
| Prediction rules config | BUILT_NOW | HIGH | **POINTS-ONLY** — no wagering |
| Prediction lock/settlement | BUILT_NOW | HIGH | Wire to live match results |
| Peer challenges | BUILT_NOW | LOW | **FAN POINTS ONLY** — no stakes |
| Leaderboards | BUILT_NOW | LOW | Season-scoped. WC/PSL data isolated. Admin engagement metrics available. STORY-33 complete. |
| Player match stats | BUILT_NOW | HIGH | DRAFT→VERIFIED→PUBLISHED→LOCKED lifecycle. Admin entry + fan views. Source enum ready for live provider. |
| Badges/achievements/fan value | BUILT_NOW | LOW | Review badge definitions for PSL |
| Notifications | BUILT_NOW | MEDIUM | Wire email/push provider Sprint 3+ |

---

## E. Commercial & Revenue Readiness

| Capability | Status | Risk if Missing | Next Step |
|---|---|---|---|
| Club shopfront catalogue shell | ADMIN_SHELL_READY | LOW | Commerce provider Sprint 3+ |
| Sponsor activation readiness | ADMIN_SHELL_READY | MEDIUM | Sponsor activation provider Sprint 3+ |
| Rewards readiness | BUILT_NOW | MEDIUM | Wire redemption provider Sprint 3+ |
| Real-money wallet | PROVIDER_REQUIRED | LOW | Provider contract + compliance Sprint 3+ |
| Payment processing | PROVIDER_REQUIRED | LOW | Payment provider selection Sprint 3+ |
| Checkout/commerce | PRODUCTION_DISABLED | LOW | Enable after provider + compliance Sprint 3+ |
| Ticket inventory/QR ticketing | PROVIDER_REQUIRED | MEDIUM | Ticketing provider contract Sprint 3+ |
| Orders/fulfilment | FUTURE_IMPLEMENTATION | LOW | Commerce provider Sprint 3+ |
| Finance/revenue reporting | FUTURE_IMPLEMENTATION | LOW | Reconciliation engine Sprint 3+ |

---

## F. Operations, Security & Compliance

| Capability | Status | Risk if Missing | Next Step |
|---|---|---|---|
| RBAC — PSL_ADMIN | BUILT_NOW | CRITICAL | Maintain on all new routes |
| Season switch audit | BUILT_NOW | MEDIUM | Monitor audit trail at launch |
| Route smoke testing | BUILT_NOW | MEDIUM | Run before each season activation |
| POPIA consent/export/delete | PARTIALLY_BUILT | HIGH | DSAR automation Sprint 3+ |
| DevOps/monitoring | FUTURE_IMPLEMENTATION | HIGH | AWS CloudWatch/DataDog Sprint 3+ |
| Payment/wallet compliance | COMPLIANCE_REQUIRED | HIGH | Legal/compliance review before enabling |
| Club/sponsor admin roles | FUTURE_IMPLEMENTATION | MEDIUM | Club portal Sprint 3+ |

---

## G. Analytics & Intelligence

| Capability | Status | Risk if Missing | Next Step |
|---|---|---|---|
| Admin dashboard KPIs | BUILT_NOW | LOW | Add Sprint 2 module counts |
| Beta feedback overview | BUILT_NOW | LOW | `/admin/beta-feedback` — STORY-35 |
| Beta known issues tracker | BUILT_NOW | LOW | `/admin/beta-feedback/known-issues` — 15 issues (KI-001 to KI-015) |
| UX readiness checklist | BUILT_NOW | LOW | `/admin/beta-feedback/ux-checklist` — ~45 checks |
| Release notes | BUILT_NOW | LOW | `/admin/beta-feedback/release-notes` — STORY-26 to STORY-36 |
| Admin audit log | BUILT_NOW | MEDIUM | `AdminAuditLog` model; playerStats publish/lock writes; extend to other domains Sprint 3 |
| Exportable reports | FUTURE_IMPLEMENTATION | LOW | Export builder Sprint 3+ |
| A/B testing | FUTURE_IMPLEMENTATION | LOW | Feature flag service Sprint 3+ |
| AI-assisted insights | FUTURE_IMPLEMENTATION | LOW | Sprint 4+ AI module |

---

## H. Multi-season / Multi-competition Control

| Capability | Status | Risk if Missing | Next Step |
|---|---|---|---|
| Create/prepare/switch/archive seasons | BUILT_NOW | CRITICAL | Activate PSL season when all 13 checks pass (STORY-36 added checks 12 + 13) |
| World Cup historical preservation | BUILT_NOW | HIGH | Do not delete WC data before WC ends |
| Module readiness per season | BUILT_NOW | MEDIUM | Review before each season activation |
| Season-scoped gameplay economy | BUILT_NOW | HIGH | Validate PSL season slug in all fan routes |

---

## I. Launch Integration Readiness

| Capability | Status | Risk if Missing | Next Step |
|---|---|---|---|
| Wallet/payment providers | PROVIDER_REQUIRED | LOW | Provider selection + contract Sprint 3+ |
| Checkout provider | PRODUCTION_DISABLED | LOW | Enable post-contract Sprint 3+ |
| Ticket inventory provider | PROVIDER_REQUIRED | MEDIUM | Ticketing provider RFP Sprint 3+ |
| Live sports data provider | PROVIDER_REQUIRED | HIGH | Opta/Stats Perform/Sportradar contract Sprint 3+ |
| Sponsor activation system | INTEGRATION_READY | LOW | Sponsor platform integration Sprint 3+ |
| Rewards redemption provider | COMPLIANCE_REQUIRED | MEDIUM | Compliance review + provider selection Sprint 3+ |
| Notifications provider | SANDBOX_READY | MEDIUM | Wire email/push provider Sprint 3+ |
| Analytics provider | SANDBOX_READY | LOW | DataDog/Amplitude integration Sprint 3+ |

---

## Capability Status Legend

| Status | Meaning |
|---|---|
| BUILT_NOW | Fully built, tested, seeded, accessible |
| PARTIALLY_BUILT | Core is built; edge cases or admin automation missing |
| ADMIN_SHELL_READY | Admin UI/routes exist; backend service not fully built |
| FOUNDATION_READY | Data model, interface, and stubs exist; not production-wired |
| INTEGRATION_READY | Architecture ready to accept provider integration |
| SANDBOX_READY | Sandbox/mock mode available; production disabled |
| PROVIDER_REQUIRED | Architecture complete; no provider contract in place |
| COMPLIANCE_REQUIRED | Technical build complete; legal/compliance approval needed |
| CONTRACT_REQUIRED | Technical build complete; commercial contract needed |
| PRODUCTION_DISABLED | Explicitly disabled for production; sandbox/mock only |
| ENABLED | Fully enabled in production |
| FUTURE_IMPLEMENTATION | Not yet started; planned for Sprint 3+ |
| NOT_ALLOWED_IN_CURRENT_STORY | Out of scope by design (e.g. real-money gameplay) |

---

## Sprint 2 Critical Gaps Before Beta Launch

1. **Import official PSL 2026/27 fixture schedule** — required to derive gameweeks and activate fantasy/prediction
2. **Promote fantasy rules from PROVISIONAL to ACTIVE** — required for fan squad selection
3. **Promote prediction rules from PROVISIONAL to ACTIVE** — required for fan predictions
4. **Season switching — resolve all 13 checks** — required to activate PSL season (12th: squad import, 13th: price calibration — STORY-36)
5. **Populate player match stats for finished fixtures** — PUBLISHED stats required to satisfy 11th season-switching readiness check (PLAYER_STATS WARNING)
6. **Publish squad import batch** — PROVISIONAL registrations require PUBLISHED batch for 12th check to pass
7. **Publish price calibration batch** — FantasyPriceCalibrationBatch PUBLISHED required for 13th check to pass

## Sprint 3+ Required Before Revenue

1. **Live data provider contract** — Opta/Stats Perform/Sportradar
2. **Wallet/payment provider selection + compliance** — legal/compliance review required
3. **Ticketing provider RFP and contract** — stadium access control dependency
4. **POPIA DSAR automation** — compliance obligation

---

*This document is generated and maintained by STORY-32. The live view is available at `/admin/operations/capability-review`.*

---

## STORY-38 Update

**New admin capabilities added:**

| Capability | Page | Status |
|-----------|------|--------|
| Live match operations hub | `/admin/live-match` | BETA_READY |
| Match lifecycle actions (kick off, half time, full time, reopen) | `/admin/live-match/[fixtureId]` | BETA_READY |
| Player availability + provider capability readiness | `/admin/live-match/[fixtureId]/readiness` | BETA_READY |
| Lineup view + confirm | `/admin/live-match/[fixtureId]/lineups` | BETA_READY |
| Match event add/delete | `/admin/live-match/[fixtureId]/events` | BETA_READY |
| Team-level aggregated stats view | `/admin/live-match/[fixtureId]/team-stats` | BETA_READY |
| Per-player stat upsert | `/admin/live-match/[fixtureId]/player-stats` | BETA_READY |
| Live fantasy impact (provisional) | `/admin/live-match/[fixtureId]/fantasy-impact` | BETA_READY |
| Prediction settlement status | `/admin/live-match/[fixtureId]/prediction-impact` | BETA_READY |
| Provider readiness dashboard | `/admin/live-match/provider-readiness` | STUB_MODE |
| Ingestion batch log + sandbox ingest | `/admin/live-match/ingestion-batches` | BETA_READY |
| Campaign trigger engine | `CampaignTriggerService` | BETA_READY |

**Remaining gaps (Sprint 3+):**
- Live provider wiring (Opta/Stats Perform/Sportradar) — `PROVIDER_REQUIRED`
- Real-time event push (WebSocket/SSE) — polling is current mechanism
- Player of the match voting UI — trigger exists, no UI yet

## STORY-39 — Beta Launch Control Capabilities

| Capability | Page | Status |
|-----------|------|--------|
| Beta launch hub | `/admin/beta-launch` | BETA_READY |
| Season detail + sub-page links | `/admin/beta-launch/[seasonId]` | BETA_READY |
| 13-check readiness gate | `/admin/beta-launch/[seasonId]/readiness` | BETA_READY |
| Blockers view | `/admin/beta-launch/[seasonId]/blockers` | BETA_READY |
| Warnings view | `/admin/beta-launch/[seasonId]/warnings` | BETA_READY |
| Frontend readiness | `/admin/beta-launch/[seasonId]/frontend` | BETA_READY |
| Data readiness | `/admin/beta-launch/[seasonId]/data` | BETA_READY |
| Security & RBAC | `/admin/beta-launch/[seasonId]/security` | BETA_READY |
| Operations & infra | `/admin/beta-launch/[seasonId]/operations` | BETA_READY |
| Beta cohort management | `/admin/beta-launch/[seasonId]/cohort` | BETA_READY |
| Activation preview (read-only) | `/admin/beta-launch/[seasonId]/activation-preview` | BETA_READY |
| Dry run (dryRunOnly:true) | `/admin/beta-launch/[seasonId]/dry-run` | BETA_READY |
| Rollback dry run | `/admin/beta-launch/[seasonId]/rollback-dry-run` | BETA_READY |
| Approval record (APPROVED not ACTIVATED) | `/admin/beta-launch/[seasonId]/approval` | BETA_READY |
| Frontend walkthrough | `/admin/beta-launch/[seasonId]/walkthrough` | BETA_READY |
| Launch runbook | `/admin/beta-launch/[seasonId]/runbook` | BETA_READY |
| Smoke test registry | `/admin/beta-launch/smoke-tests` | BETA_READY |

**Gap:** Actual season activation endpoint is NOT implemented in STORY-39. Activation requires a separate controlled operation in a future deployment window.
