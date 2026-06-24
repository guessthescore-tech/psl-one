# Sprint 35 — Production Launch Owner Gates

These gates must be explicitly authorised by the platform owner before each action.
No gate is passed automatically. Each requires a deliberate decision.

## Gate Index

| Gate ID         | Action                                    | Status    | Risk    |
|-----------------|-------------------------------------------|-----------|---------|
| OG-35-PSL-ACT   | Activate PSL 2026/27 season               | BLOCKED   | HIGH    |
| OG-35-DATA      | Enable live fixture data ingestion        | BLOCKED   | MEDIUM  |
| OG-35-FANTASY   | Open fantasy team selection to fans       | BLOCKED   | MEDIUM  |
| OG-35-PREDICT   | Open prediction submissions to fans       | BLOCKED   | LOW     |
| OG-35-EC2-PROD  | Promote EC2 beta to production-grade      | BLOCKED   | HIGH    |
| OG-35-DNS       | Point psl.co.za DNS to platform           | BLOCKED   | HIGH    |
| OG-35-COMMERCE  | Activate live checkout (club shop)        | BLOCKED   | VERY HIGH |
| OG-35-TICKET    | Activate match ticketing                  | BLOCKED   | VERY HIGH |
| OG-35-WALLET    | Activate production wallet movements      | BLOCKED   | VERY HIGH |

## Gate Requirements

### OG-35-PSL-ACT — PSL Season Activation
**Pre-conditions:**
- 13+ season-switching checks pass (verified by `PslActivationPreflightService`)
- At least 10 fixtures published and validated
- Fantasy player pool ≥ 500 published players with prices set
- At least one fantasy gameweek defined
- SponsorMembership records created for active sponsors

### OG-35-DATA — Live Data Ingestion
**Pre-conditions:**
- Valid data provider API key obtained (API-Football, Parse.bot, or approved alternative)
- `DATA_PROVIDER` env var set in production SSM
- Dry-run ingestion test passes with > 0 match results returned
- Source-empty guard confirmed active (no silent failures)

### OG-35-FANTASY — Fantasy Open
**Pre-conditions:**
- OG-35-PSL-ACT passed
- FantasyRulesConfig set with correct budget and transfer rules
- Fantasy deadline configured for first gameweek
- Fan onboarding flow tested end-to-end

### OG-35-EC2-PROD — EC2 Production Promotion
**Pre-conditions:**
- Staging smoke: 21/21 PASS (re-run after last deploy)
- RBAC smoke: 8/8 PASS
- DB seeded and migration status confirmed
- Backup and recovery plan documented
- AWS billing controls active

### OG-35-DNS — DNS Cutover
**Pre-conditions:**
- OG-35-EC2-PROD passed
- SSL certificate provisioned for psl.co.za
- CloudFront distribution active (or direct EC2 with Caddy HTTPS)
- Zero-downtime deployment strategy confirmed

### OG-35-COMMERCE — Commerce Activation
**Pre-conditions:** See ADR-033. PCI DSS, payment gateway contract, legal review.
