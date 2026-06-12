# PSL One — Admin Capability Gap Review

**Sprint:** 2  
**Story:** STORY-32 Admin Operations QA, Control Plane & Launch Integration Readiness  
**Date:** 2026-06-12  
**Status:** ACTIVE — reviewed at STORY-32 acceptance

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
| Fantasy player pricing | BUILT_NOW | HIGH | 96 provisional prices seeded |
| Fantasy transfer deadlines | BUILT_NOW | HIGH | Derive from PSL fixtures |
| Fantasy leagues/cups | BUILT_NOW | MEDIUM | Create global league at PSL launch |
| Prediction rules config | BUILT_NOW | HIGH | **POINTS-ONLY** — no wagering |
| Prediction lock/settlement | BUILT_NOW | HIGH | Wire to live match results |
| Peer challenges | BUILT_NOW | LOW | **FAN POINTS ONLY** — no stakes |
| Leaderboards | BUILT_NOW | MEDIUM | Confirm PSL leaderboard structure |
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
| Exportable reports | FUTURE_IMPLEMENTATION | LOW | Export builder Sprint 3+ |
| A/B testing | FUTURE_IMPLEMENTATION | LOW | Feature flag service Sprint 3+ |
| AI-assisted insights | FUTURE_IMPLEMENTATION | LOW | Sprint 4+ AI module |

---

## H. Multi-season / Multi-competition Control

| Capability | Status | Risk if Missing | Next Step |
|---|---|---|---|
| Create/prepare/switch/archive seasons | BUILT_NOW | CRITICAL | Activate PSL season when all 9 checks pass |
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
4. **Season switching — resolve all 9 checks** — required to activate PSL season

## Sprint 3+ Required Before Revenue

1. **Live data provider contract** — Opta/Stats Perform/Sportradar
2. **Wallet/payment provider selection + compliance** — legal/compliance review required
3. **Ticketing provider RFP and contract** — stadium access control dependency
4. **POPIA DSAR automation** — compliance obligation

---

*This document is generated and maintained by STORY-32. The live view is available at `/admin/operations/capability-review`.*
