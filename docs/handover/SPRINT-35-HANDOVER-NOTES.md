# Sprint 35 — Handover Notes

## Sprint Summary (Sprints 30–35)

| Sprint | Deliverable                               | Status         |
|--------|-------------------------------------------|----------------|
| 30     | WC2026 Beta Data Completeness             | CONDITIONAL_GO |
| 31     | News Centre + Video Centre Foundation     | COMPLETE        |
| 32     | Sponsor Audience Segmentation + Assets    | COMPLETE        |
| 33     | Object Storage/CDN Architecture           | SKELETON ONLY  |
| 34     | API Response Caching & Edge Readiness     | COMPLETE        |
| 35     | Launch Readiness / BRD Gap Closure        | CONDITIONAL_GO  |

## Repository State

- **API tests**: 2077 passing (89 spec files)
- **Experience tests**: 1272+ passing
- **Migrations**: 44 applied (last: `20260624120000_audience_segment`)
- **Schema models**: 104
- **ADRs**: 36 documented (ADR-001 through ADR-036)
- **Open PRs**: #31 (Sprint 32), #32 (Sprint 31 — note: merged ahead), #33 (Sprint 32), #34 (Sprint 33), #35 (Sprint 34)

## Key Decisions Made This Sprint Block

1. **ADR-033** — Commerce is CATALOGUE_ONLY at launch (no checkout)
2. **ADR-034** — Sponsor audience segmentation is POPIA-safe (criteria JSON, no fan PII)
3. **ADR-035** — Object storage is interface-abstracted (LocalDisk now, S3 ready)
4. **ADR-036** — In-memory cache now, Redis upgrade path documented

## Hardcoded Safety Constraints (Never Remove)

These constraints are enforced at multiple layers and must never be bypassed:

```
PSL_INACTIVE          — PSL season not activated
WALLET_SANDBOX_ONLY   — No production wallet movements
POINTS_ONLY           — Fantasy, predictions, social predictions
NON_FINANCIAL         — Sponsor rewards, fan value ledger
CATALOGUE_ONLY        — Club shop, ticketing
POPIA_SAFE            — Audience segments store criteria only
NO_BETTING            — No gambling, odds, wagers, stakes
```

## What to Do Next

### Immediate (this week)
1. Merge open PRs #33–#35 after owner review.
2. Obtain live data API key (API-Football or Parse.bot).
3. Configure `DATA_PROVIDER=api_football` in staging SSM.
4. Re-run staging smoke with live data key.

### Short term (next sprint)
1. Implement Redis adapter (`RedisAdapter implements CacheProvider`).
2. Implement `S3CompatibleAdapter.putObject` with AWS SDK v3.
3. Run load test (k6) against staging API.
4. Configure CloudWatch alarms and APM.

### Pre-launch (when PSL data is ready)
1. Seed PSL 2026/27 fixtures.
2. Set player prices and publish player pool.
3. Configure fantasy gameweek deadlines.
4. Run full pre-flight: `PslActivationPreflightService.runAllChecks()`.
5. Pass OG-35-PSL-ACT owner gate.
6. Execute PSL activation sequence (see `SPRINT-35-PSL-ACTIVATION-SEQUENCE.md`).

## Architecture Overview

```
Fan → Vercel (Next.js) → PSL One API (NestJS/ECS)
                              ↓
                      PostgreSQL (RDS)
                      Redis (planned)
                      MediaAsset CDN (planned)
```

The API is a NestJS monolith with 50+ modules. See `docs/architecture/` for full
system design documentation.
