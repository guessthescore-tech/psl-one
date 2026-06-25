# Sprint 40 — Beta Test Users

Generated: 2026-06-25

**SECURITY NOTE:** No passwords or JWT tokens are stored in this document. Obtain tokens via login or SSM.

## How to Get a JWT

```bash
# From any machine with internet access (EC2 port 80 is open):
curl -s -X POST http://16.28.84.11/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<email>","password":"<password>"}' | jq .accessToken
```

Or via SSM (no credentials needed):
```bash
aws ssm start-session --target i-0a5f16539c9626f90 --region af-south-1
# Then inside the session:
curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<email>","password":"<password>"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])"
```

## Test Accounts

### Role: FAN (standard tester)

| Field | Value |
|-------|-------|
| Email | guessthescore2@gmail.com |
| Role | FAN |
| Capabilities | Predict scores, view fixtures, access fantasy, leaderboards, profile |
| Provisioned | DB seed (Sprint 5) |

To verify account exists:
```bash
curl -s http://16.28.84.11/api/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"guessthescore2@gmail.com","password":"<password>"}' | jq .user.role
# Expected: "FAN"
```

### Role: PSL_ADMIN

| Field | Value |
|-------|-------|
| Email | guessthescore2+admin@gmail.com |
| Role | PSL_ADMIN |
| Capabilities | All admin routes, player pool, fixture management, data provider, season operations |
| Provisioned | Sprint 22 via SSM admin script |

To verify and get JWT:
```bash
curl -s http://16.28.84.11/api/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"guessthescore2+admin@gmail.com","password":"<password>"}' | jq '{role: .user.role, token: .accessToken}'
# Expected role: "PSL_ADMIN"
```

Use JWT to test admin endpoint:
```bash
TOKEN="<jwt-from-above>"
curl -s http://16.28.84.11/api/admin/data-provider/psl-fixture-readiness \
  -H "Authorization: Bearer $TOKEN" | jq .status
```

### Role: CLUB_ADMIN

| Field | Value |
|-------|-------|
| Email | guessthescore2+club@gmail.com |
| Role | CLUB_ADMIN |
| Capabilities | Club portal (/club/*), club member management, club content |
| Provisioned | Sprint 28 via SSM |

To verify:
```bash
curl -s http://16.28.84.11/api/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"guessthescore2+club@gmail.com","password":"<password>"}' | jq .user.role
# Expected: "CLUB_ADMIN"
```

Use JWT to test club endpoint:
```bash
TOKEN="<jwt-from-above>"
curl -s http://16.28.84.11/api/club/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Role: SPONSOR

| Field | Value |
|-------|-------|
| Email | guessthescore2+sponsor@gmail.com |
| Role | SPONSOR |
| Capabilities | Sponsor portal (/sponsor/*), campaign management, audience segments |
| Provisioned | Sprint 28 via SSM |

To verify:
```bash
curl -s http://16.28.84.11/api/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"guessthescore2+sponsor@gmail.com","password":"<password>"}' | jq .user.role
# Expected: "SPONSOR"
```

## If an Account Is Missing

If a role-specific account is missing from the DB, provision via SSM:

```bash
aws ssm start-session --target i-0a5f16539c9626f90 --region af-south-1
# Inside SSM session:
docker exec psl-one-beta-api-1 curl -s -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"guessthescore2+newrole@gmail.com","password":"<secure-password>","displayName":"Beta Tester"}'

# Then update role (requires DB access):
docker exec psl-one-beta-postgres-1 psql -U psl_admin -d psl_beta \
  -c "UPDATE \"User\" SET role='CLUB_ADMIN' WHERE email='guessthescore2+newrole@gmail.com';"
```

## RBAC Test Matrix

| Route | FAN | PSL_ADMIN | CLUB_ADMIN | SPONSOR | Public |
|-------|-----|-----------|------------|---------|--------|
| /health | ✓ | ✓ | ✓ | ✓ | ✓ |
| /football/fixtures | ✓ | ✓ | ✓ | ✓ | ✓ |
| /predictions/open | ✓ | ✓ | ✓ | ✓ | ✓ |
| /fantasy/my-team | ✓ | ✓ | ✓ | ✓ | 401 |
| /admin/* | 403 | ✓ | 403 | 403 | 401 |
| /club/* | 403 | ✓ | ✓ (own) | 403 | 401 |
| /sponsor/* | 403 | ✓ | 403 | ✓ (own) | 401 |

## Security Boundaries

- No passwords stored in source code or git history
- JWTs are ephemeral (7-day expiry by default, configured in JWT_EXPIRES_IN)
- Test accounts use `+` email aliases (guessthescore2+role@gmail.com) so all emails go to the same mailbox
- DB is only accessible via SSM or from within Docker network
- .env.beta is on EC2 only, never committed
