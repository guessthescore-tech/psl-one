# Sprint 10 — Provider Decision

Date: 2026-06-21

## Current Recommendation: Sportmonks (PENDING key fix)

The recommendation from Sprint 9 is unchanged: **Sportmonks as primary provider**.

This is an operational recommendation, not a final binding decision. The owner must confirm after resolving the Sportmonks key issue.

---

## Decision Rationale

| Factor | Weight | Sportmonks | SportsDataIO |
|--------|--------|-----------|--------------|
| Adapter maturity | HIGH | Fully implemented, 20 tests ✅ | Skeleton only ⚠️ |
| DataProviderService integration | HIGH | Wired ✅ | Not wired ⚠️ |
| Trial key validates | MEDIUM | ❌ HTTP 401 (fixable) | ✅ HTTP 200 |
| PSL coverage | HIGH | UNKNOWN | UNKNOWN |
| WC2026 coverage | HIGH | UNKNOWN | UNKNOWN |
| Field mapping (teams) | MEDIUM | UNKNOWN | Partial ✅ |
| Time-to-production | HIGH | Ready after key fix | Needs wiring + paid plan |

## What Unblocks Sportmonks

1. Owner regenerates key at https://app.sportmonks.com/api-tokens
2. Owner verifies plan tier includes `/v3/football/*` endpoints
3. Owner updates `apps/api/.env`: `SPORTMONKS_API_KEY=<new_value>`
4. Run: `node --env-file=apps/api/.env tools/discovery/provider-health-check.mjs`
5. If healthy: run coverage + field mapping checks
6. Record PSL/WC2026 fixture availability
7. Review commercial terms at https://sportmonks.com/pricing

## What Would Change to SportsDataIO

Only if both of these are true:
1. Sportmonks cannot be fixed or lacks PSL coverage even with valid key
2. SportsDataIO paid plan confirms PSL/WC2026 fixture coverage + commercial terms acceptable

## Owner Decision Gates (UNCHANGED)

Before activating any provider in production:
- [ ] PSL fixture availability confirmed
- [ ] WC2026 fixture availability confirmed
- [ ] Field mapping verified (all required fields: externalId, homeTeamName, awayTeamName, kickoffAt, status)
- [ ] Commercial terms reviewed by owner
- [ ] Rate limits understood for 2M fan load
- [ ] EC2 staging migration applied
- [ ] Staging smoke passes against EC2

## What This Document Does NOT Authorize

- Production provider ingestion is NOT enabled
- PSL season is NOT activated
- No provider key is committed or exposed to frontend
