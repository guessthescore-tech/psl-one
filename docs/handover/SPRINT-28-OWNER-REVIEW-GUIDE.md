# Sprint 28: Owner Review Guide

**Date:** 2026-06-23
**Sprint:** 28

PSL remains INACTIVE. PSL not activated. Wallet SANDBOX. NON-FINANCIAL. No real-money.

---

## Review Checklist

### Code Review

- [ ] `apps/api/prisma/schema.prisma` — ClubMembership and SponsorMembership models added
- [ ] `apps/api/prisma/migrations/20260623000001_club_sponsor_memberships/migration.sql` — SQL looks correct
- [ ] `apps/api/src/portal-scope/portal-scope.service.ts` — scope logic reads from DB, not query params
- [ ] `apps/api/src/club-portal/club-portal.service.ts` — no `API_SCOPE_PENDING` response; throws on denial
- [ ] `apps/api/src/sponsor-portal/sponsor-portal.service.ts` — `INVOICE_ONLY` and `isFinancial: false` preserved

### Security Verification

- [ ] `resolveClubScope` queries `clubMembership` for `isActive: true`
- [ ] `CROSS_CLUB_ACCESS_DENIED` fires when CLUB_ADMIN passes mismatched teamId
- [ ] `CROSS_SPONSOR_ACCESS_DENIED` fires when SPONSOR passes mismatched sponsorId
- [ ] FAN role blocked by `@Roles('CLUB_ADMIN', 'PSL_ADMIN')` decorator
- [ ] PSL_ADMIN must provide explicit teamId/sponsorId
- [ ] No JWT tokens in any code file

### Tests

- [ ] `portal-scope.service.spec.ts` — 15+ test cases covering all scenarios
- [ ] `club-portal.service.spec.ts` — updated to use PortalScopeService mock
- [ ] `club-portal.controller.spec.ts` — verifies req.user.sub/role passed to service
- [ ] `sponsor-portal.service.spec.ts` — updated with cross-tenant tests

### Documentation

- [ ] ADR-032 explains membership table decision
- [ ] ADR-032 confirms PSL INACTIVE and wallet sandbox
- [ ] 13 docs created under docs/security/, docs/portals/, docs/handover/, docs/sprints/, docs/data/

### Smoke Tools

- [ ] 3 smoke tools exist in `tools/staging/sprint-28-*.mjs`
- [ ] No token values printed to console in any smoke tool

---

## Owner Actions Required

### Before Merge

1. Run CI — verify all checks green
2. Review ADR-032 and confirm scoping decision acceptable

### After Merge (Before Staging Smoke)

1. Authorize EC2 deployment: trigger GitHub Actions deploy workflow pointing to `feature/sprint-28...` (or merge to main then deploy)
2. Run staging migration: `prisma migrate deploy` on EC2 (via SSM or docker exec)
3. Create test memberships via SQL:
   ```sql
   -- For CLUB_ADMIN test user:
   INSERT INTO club_memberships (id, user_id, team_id, role, is_active, created_at, updated_at)
   VALUES (gen_random_uuid(), '<user-id>', '<team-id>', 'CLUB_ADMIN', true, now(), now());
   
   -- For SPONSOR test user:
   INSERT INTO sponsor_memberships (id, user_id, sponsor_id, role, is_active, created_at, updated_at)
   VALUES (gen_random_uuid(), '<user-id>', '<sponsor-id>', 'SPONSOR', true, now(), now());
   ```
4. Run 3 smoke tools (see docs/portals/SPRINT-28-ROLE-SMOKE-RUNBOOK.md)
5. Confirm all PASS

---

## Safety Confirmation

No action that would:
- Activate PSL season (PSL remains INACTIVE)
- Trigger wallet production (sandbox only, non-financial)
- Process real-money (no billing, INVOICE_ONLY)
- Publish fixtures (no publication in this sprint)
- Expose admin credentials (no tokens in code)
