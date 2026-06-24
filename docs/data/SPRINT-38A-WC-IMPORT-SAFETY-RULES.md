# Sprint 38A — World Cup Import Safety Rules

## Non-Negotiable Safety Boundaries

These rules apply to all WC import operations and cannot be bypassed:

### PSL
- PSL season MUST remain INACTIVE
- PSL fixture publication ≠ PSL activation
- No PSL fixture write imports during WC sprints
- PSL activation requires 13-check preflight + separate owner approval

### Data Imports
- Default mode is always `dryRun: true`
- Write mode requires BOTH:
  1. `ALLOW_WORLD_CUP_WRITE=true` (server env var)
  2. `confirmWorldCupWrite: "IMPORT_WORLD_CUP_BETA"` (request body)
- All imported fixtures created with `isPublished: false`
- Publication is a separate admin action

### Providers
- Provider keys are server-side only
- No `NEXT_PUBLIC_` prefix for any provider credential
- No key values in API responses
- No key values in logs
- ScoreBat token in iframe src is by design (attribution token, not API key)

### Financial
- No real money in any feature
- Fantasy = points-only
- GTS (Guess the Score) = points-only
- Social predictions = points-only
- Fan Value = non-financial
- Sponsor rewards = non-financial
- No betting, odds, stakes, wagers, deposits, withdrawals, payouts
- No cash prizes, no bookmaker mechanics
- Wallet = sandbox-only

### Ingestion
- No scheduled ingestion
- No production ingestion
- No automated write imports
- All writes require explicit admin action

## Write-Mode Guard Stack

```
1. Controller: checks confirmWorldCupWrite === 'IMPORT_WORLD_CUP_BETA'
             → 400 if wrong/missing
2. Service:   checks process.env['ALLOW_WORLD_CUP_WRITE'] === 'true'
             → WRITE_BLOCKED_ENV_FLAG if not set
3. Service:   re-checks confirmWorldCupWrite === 'IMPORT_WORLD_CUP_BETA'
             → WRITE_BLOCKED_MISSING_FLAGS if wrong
4. Service:   writes fixtures with isPublished=false
```

## Staging Tool Guard Stack

```
1. Tool: checks ALLOW_WORLD_CUP_WRITE env var before calling --write endpoint
2. Tool: checks CONFIRM_WORLD_CUP_WRITE env var before calling --write endpoint
3. Both must be present or tool exits with error before making API call
```
