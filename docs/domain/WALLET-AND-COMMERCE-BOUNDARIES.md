# PSL One — Wallet and Commerce Boundaries

**Purpose:** Definitive statement of what PSL One does and does not do with money  
**Audience:** All engineers, legal, compliance, product  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Executive Summary

PSL One is a fan engagement platform. It is **not** a betting product, gambling platform, or money transfer service. No route in PSL One moves, holds, or creates obligations to pay real money.

---

## What PSL One Does

| Activity | Mechanism | Financial? |
|---------|-----------|-----------|
| Awards Fan Value loyalty points | `FanValueLedger` | NO — no monetary value |
| Issues gameplay points for social challenges | `SocialPredictionGameplayPointsAllocation` | NO — platform currency only |
| Records prediction scores | `PredictionPointsLedger` | NO — leaderboard only |
| Scores Fantasy points | `FantasyGameweekScore` | NO — leaderboard only |
| Links a wallet account reference | `WalletLink.externalRef` | NO — stores ID only |
| Shows wallet balance | `SandboxWalletAdapter.getBalance()` | NO — sandbox mock only |

---

## What PSL One Does NOT Do

| Prohibited Activity | Status |
|--------------------|--------|
| Hold customer funds | NEVER |
| Move real money | NEVER |
| Create financial obligations | NEVER |
| Process payments | NEVER |
| Issue refunds in real money | NEVER |
| Convert points to cash | NEVER |
| Accept deposits | NEVER |
| Process withdrawals | NEVER |
| Debit/credit a real wallet | NEVER (sandbox only) |
| Call a production wallet API | NEVER (sandbox adapter only) |

---

## Point Systems

Three distinct non-financial point systems exist. They are separate, non-interchangeable:

| System | Model | Meaning |
|--------|-------|---------|
| Fan Value | `FanValueLedger` | Loyalty score — engagement tracking |
| Prediction Points | `PredictionPointsLedger` | Guess the Score leaderboard score |
| Gameplay Points | `SocialPredictionPointsEntry` | Social challenge stake/award |
| Fantasy Points | `FantasyGameweekScore` | Fantasy league score |

None of these systems interact. A fan cannot convert Fan Value to Gameplay Points or vice versa.

---

## Wallet Adapter Design

The wallet adapter pattern is built for future optionality only:

```
WalletAdapter (interface)
  └── SiliconEnterpriseSandboxWalletAdapter (ACTIVE — sandbox, no real calls)
  └── ProductionWalletAdapter (NOT IMPLEMENTED)
```

`SiliconEnterpriseSandboxWalletAdapter` makes zero outbound HTTP calls. It is the only active adapter in all deployed configurations.

---

## Production Wallet Requirements

If PSL One ever integrates a real wallet provider:

1. **Signed contract** with a South African regulated financial services provider
2. **FSCA compliance** — Financial Sector Conduct Authority registration where applicable
3. **KYC/AML** — Customer identity verification and anti-money-laundering processes
4. **POPIA audit** — South African data protection compliance review
5. **Legal opinion** — Confirming PSL One is not a gambling or betting operator under South African law
6. **Explicit platform decision** — Architecture Decision Record (ADR) required
7. **Separate Sprint** — New wallet sprint with dedicated compliance review gate

No engineer should wire a production wallet adapter without all of the above being completed and documented.

---

## Campaign Rewards

`CampaignTriggerService` supports a `WALLET_CREDIT` reward type in its model. This is NOT active:

- No production wallet adapter exists
- `CampaignTriggerLog` is written, reward delivery is PROVIDER_REQUIRED
- Wallet credit reward will remain disabled until provider is contracted

---

## Regulatory Position

PSL One's current position:
- Fan engagement platform — points-based, non-financial
- Not a gambling operator
- Not a financial services provider
- Not a payment institution

This position must be reviewed by legal counsel before any production wallet integration.
