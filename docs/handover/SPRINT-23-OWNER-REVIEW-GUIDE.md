# Sprint 23 — Owner Review Guide

## What Happened This Sprint

Sprint 23 identified and fixed the RBAC gap where PSL_ADMIN JWT was accepted but all admin endpoints returned 403. Root cause: `@Roles('ADMIN')` string mismatch — `ADMIN` is not in the `UserRole` enum.

Fix: 3 files, 5 decorators changed from `@Roles('ADMIN')` to `@Roles('PSL_ADMIN')`. No guard logic changed.

Also confirmed: `apps/api/.env` is NOT tracked in git (was a false alarm in Sprint 22 security scan).

## Code Change to Review

**Security-relevant change:** `apps/api/src/fixture-import/fixture-publication.controller.ts`, `apps/api/src/data-provider/data-provider.controller.ts`, `apps/api/src/prediction-challenges/prediction-challenges.controller.ts`

Each change is a single string: `'ADMIN'` → `'PSL_ADMIN'`. No guard bypasses, no public routes.

## Testing Added

36 new HTTP-level integration tests verifying 401/403/PSL_ADMIN behavior for all affected endpoints. These use Fastify app.inject() — no real HTTP server or DB.

## Owner Gates

1. **Review RBAC fix** — confirm `@Roles('PSL_ADMIN')` is the correct scope for these endpoints
2. **Authorise beta EC2 re-deployment** — deploy Sprint 23 branch to beta EC2 in Sprint 24
3. **Authorise authenticated admin smoke** — re-run Sprint 22 smoke tools after deployment to verify 200s
4. **Provider key rotation** — rotate `apps/api/.env` keys if any were shared outside local dev

## Platform Status

Points-only. No real-money functionality. No third-party gaming integrations.  
WC2026 ACTIVE, PSL INACTIVE. Wallet SANDBOX. No scheduled ingestion.

## Documents to Review

| Document | Purpose |
|----------|---------|
| `docs/security/SPRINT-23-RBAC-INVESTIGATION.md` | Root cause analysis |
| `docs/security/SPRINT-23-RBAC-FIX.md` | Fix details and test coverage |
| `docs/security/SPRINT-23-ENV-HYGIENE.md` | `.env` file hygiene confirmation |
| `docs/handover/SPRINT-23-BETA-GO-NOGO.md` | CONDITIONAL_GO checklist |
| `docs/handover/SPRINT-23-KNOWN-GAPS.md` | Outstanding items |
