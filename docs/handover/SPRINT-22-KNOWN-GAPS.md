# Sprint 22 — Known Gaps

## GAP-22-01: PSL_ADMIN Role Returns HTTP 403 on Admin Endpoints

**Severity:** High — authenticated admin smoke routes are unreachable without resolving this

**Finding:** A real `PSL_ADMIN` DB user with a valid JWT returns HTTP 403 on all tested admin endpoints:
- `GET /admin/fixtures/imported`
- `GET /admin/psl/preflight`
- `GET /admin/data-provider/health`
- Ingestion dry-run

**What was confirmed:**
1. JWT signature valid (no 401)
2. User exists in DB with `isActive=true` (no user-not-found 403)
3. User role is `PSL_ADMIN` (set via Prisma upsert)
4. 403 persists — additional RBAC permission check applies

**Hypothesis:** The NestJS RBAC guard may check for `AdminTeam` membership, a separate permissions table, or a `teams` relation on the User model that the smoke user does not satisfy.

**Investigation path:**
1. Read `apps/api/src/auth/guards/roles.guard.ts` — check what properties it validates beyond `user.role`
2. Check `apps/api/src/admin/**/*.controller.ts` decorators — look for `@Roles`, `@Teams`, or custom guards
3. If a `teams` relation is required, update the provision script to create the relation

**Workaround:** This gap does not affect API functionality or security — admin routes are correctly protected. The gap only affects the smoke test's ability to exercise the full admin read path.

**Status:** OPEN — investigation deferred to Sprint 23

---

## GAP-22-02: PSL Fixtures Not Yet Available

PSL fixtures are not expected until ~July/August 2026. Parse PSL ingestion will return `sourceEmpty: true` until then. No action required.

---

## GAP-22-03: EC2 Not Reachable via HTTP (Security Group)

EC2 security group blocks all inbound HTTP. SSM Run Command + Docker exec is the only path. No change required — this is the intended security posture for beta.

---

## Inherited from Sprint 21

- Seed admin (`seed-admin@psl-one.internal`) has placeholder password hash — not usable for login
- Sportmonks API key is invalid — data provider tests return expected errors
- SportsDataIO UCL partial data only
