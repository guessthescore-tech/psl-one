# Sprint 35 — Commerce Boundary

## Overview

PSL One's commerce boundary at launch is strictly NON-FINANCIAL:

| Feature              | Status           | Notes                                         |
|----------------------|------------------|-----------------------------------------------|
| Club merchandise     | CATALOGUE_ONLY   | Browse only, no checkout                      |
| Match tickets        | INFORMATIONAL    | No booking, no payment                        |
| Fantasy points       | POINTS_ONLY      | Non-financial, no cash value                  |
| Prediction rewards   | POINTS_ONLY      | Non-financial, no cash value                  |
| Sponsor rewards      | NON_FINANCIAL    | Digital badges, fan points, no cash           |
| Fan Value Ledger     | NON_FINANCIAL    | Engagement score, not a monetary balance      |
| Wallet               | SANDBOX_ONLY     | SiliconEnterpriseSandboxWalletAdapter only     |

## What "Non-Financial" Means

- No real money changes hands on the platform.
- No deposits, withdrawals, or real-money balances.
- No betting, gambling, wagers, stakes, or odds.
- No cash prizes, payouts, or monetary rewards.
- Fan points, badges, and ranks are engagement metrics only.

## Explicit Exclusions

The following are OUTSIDE scope until owner gates are passed:

- Online checkout for merchandise or tickets
- Wallet top-up or withdrawal
- Fantasy prize pools with cash
- Sports betting or gambling features
- Real-money prize competitions

## Compliance References

- POPIA: data privacy for fan data — see ADR-034
- NCA (National Credit Act): no credit facilities offered
- ECT Act (Electronic Communications and Transactions Act): required for any future commerce
- SARS: VAT considerations when commerce is enabled

## ADR Reference

See **ADR-033** for the formal commerce boundary decision and owner gates required
before any live checkout activation.
