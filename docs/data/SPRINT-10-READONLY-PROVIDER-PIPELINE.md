# Sprint 10 — Read-Only Provider Pipeline

## Design

The read-only provider pipeline is a discovery and audit capability only.

| Property | Value |
|----------|-------|
| Type | Read-only discovery |
| No scheduled import | Confirmed — no `@Cron` on DataProviderService |
| No DB writes from discovery | Confirmed — tools make HTTP requests only |
| No fan-facing mutations | Confirmed — admin/tooling only |
| Provider data authoritative | Never — requires explicit owner decision and Sprint gate |
| PSL activation | NEVER triggered by pipeline tools |
| Wallet interaction | NONE — settlement is points-only |
| Betting/odds endpoints | PROHIBITED — both adapters confirmed clean |

## Tools

| Tool | Command | Purpose |
|------|---------|---------|
| `provider-readonly-pipeline-check.mjs` | `node tools/discovery/provider-readonly-pipeline-check.mjs` | Validate pipeline is read-only safe (11 checks) |
| `staging-provider-discovery.mjs` | `node --env-file=apps/api/.env tools/discovery/staging-provider-discovery.mjs` | Read-only sample fetch from providers |
| `provider-health-check.mjs` | `node --env-file=apps/api/.env tools/discovery/provider-health-check.mjs` | Check provider health |
| `provider-coverage-check.mjs` | `PROVIDER=sportmonks node --env-file=apps/api/.env tools/discovery/provider-coverage-check.mjs` | Coverage per endpoint |
| `provider-field-mapping-check.mjs` | `PROVIDER=sportmonks node --env-file=apps/api/.env tools/discovery/provider-field-mapping-check.mjs` | Field mapping validation |

## Sprint 10 Discovery Results

Running `staging-provider-discovery.mjs` (2026-06-21):

```
Sportmonks:
  seasons → HTTP 401 (key invalid)
  Cannot discover competition list

SportsDataIO:
  competitions → HTTP 200 — 93 competitions
  PSL Premier Soccer League: NOT FOUND in competition list
  WC2026 World Cup: YES — CompetitionId=21
  NOTE: Presence in list ≠ fixture data available on trial tier
```

## Pipeline Safety Check Results (2026-06-21)

```
PASS: 11  FAIL: 0  TOTAL: 11
Pipeline is read-only safe.
No scheduled ingestion, no betting endpoints, no PSL activation, no wallet interaction.
```

## What Would Make Pipeline Data "Official"

Provider data becomes authoritative only after:
1. Owner reviews commercial terms
2. Owner confirms fixture coverage for PSL and WC2026
3. Owner explicitly authorizes DataProviderService ingestion
4. EC2 staging migration applied
5. Separate Sprint gate passed

See `docs/data/SPRINT-10-PROVIDER-DECISION.md` for full gate list.
