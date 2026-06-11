# STORY-01 — Test Scenarios

**Test framework:** Vitest (unit), Supertest + Testcontainers (integration)  
**Coverage target:** ≥ 80% line/branch for the `identity` module  
**No mocks for:** database (real PostgreSQL via Testcontainers), Cognito (mock with `jest-mock` or `vitest-mock-extended`)  
**Mocked:** AWS Cognito (all Cognito calls mocked in unit and integration tests; real Cognito only in E2E)

---

## Unit Tests

Pure function tests. No database, no HTTP, no Cognito.  
File: `src/modules/identity/__tests__/identity.unit.spec.ts`

### Age Validation

```
UT-01-01  isEligible(dateOfBirth: "1995-06-08", referenceDate: "2026-06-08")
          → { isEligible: true, ageInYears: 30 }

UT-01-02  isEligible(dateOfBirth: "2008-06-08", referenceDate: "2026-06-08")
          → { isEligible: true, ageInYears: 18 }
          (exactly 18 on reference date = eligible)

UT-01-03  isEligible(dateOfBirth: "2008-06-09", referenceDate: "2026-06-08")
          → { isEligible: false, ageInYears: 17 }
          (one day short of 18 = rejected)

UT-01-04  isEligible(dateOfBirth: "2000-02-29", referenceDate: "2026-06-08")
          → { isEligible: true, ageInYears: 26 }
          (leap year birthdate — no edge case in this direction)

UT-01-05  isEligible(dateOfBirth: "2026-06-08", referenceDate: "2026-06-08")
          → { isEligible: false, ageInYears: 0 }
          (born today = 0 years old)
```

### Email Normalisation

```
UT-01-06  normaliseEmail("PERCY@EXAMPLE.COM")      → "percy@example.com"
UT-01-07  normaliseEmail("  percy@example.com  ")  → "percy@example.com"  (trimmed)
UT-01-08  normaliseEmail("Percy.TAU@Chiefs.CO.ZA") → "percy.tau@chiefs.co.za"
UT-01-09  normaliseEmail("already@lowercase.com")  → "already@lowercase.com"
```

### Password Validation

```
UT-01-10  isValidPassword("Test1234!")   → true   (has upper, lower, digit, special)
UT-01-11  isValidPassword("test1234!")   → false  (no uppercase)
UT-01-12  isValidPassword("TEST1234!")   → false  (no lowercase)
UT-01-13  isValidPassword("TestABCD!")   → false  (no digit)
UT-01-14  isValidPassword("Test12345")   → false  (no special char)
UT-01-15  isValidPassword("T1!")         → false  (under 8 chars)
UT-01-16  isValidPassword("a".repeat(73) + "A1!")  → false  (over 72 chars)
```

### Outcome Determination (used in JWT extraction)

```
UT-01-17  extractFanId(cognitoToken with custom:pslFanId="uuid-123")
          → "uuid-123"

UT-01-18  extractRoles(cognitoToken with cognito:groups=["FAN"])
          → [Role.FAN]

UT-01-19  extractRoles(cognitoToken with cognito:groups=["FAN", "PSL_ADMIN"])
          → [Role.FAN, Role.PSL_ADMIN]
```

### Mobile Validation

```
UT-01-20  isValidMobile("+27821234567")  → true
UT-01-21  isValidMobile("0821234567")    → false  (not E.164)
UT-01-22  isValidMobile("+2782")         → false  (too short)
UT-01-23  isValidMobile(null)            → true   (mobile is optional)
UT-01-24  isValidMobile("")              → false  (empty string is not null)
```

---

## Integration Tests

Real PostgreSQL (Testcontainers). Cognito calls are mocked.  
File: `src/modules/identity/__tests__/identity.integration.spec.ts`

### Registration — Happy Path

```
IT-01-01  Register with all required fields
          Setup:    Empty DB, Cognito mock returns { sub: "cognito-123" }
          Action:   POST /api/v1/auth/register (valid payload)
          Assert:
            - HTTP 201
            - identity.fans: 1 row, email lowercase, display_name trimmed
            - identity.consent_records: 1 row, fan_id matches, consent_terms=true
            - outbox.outbox_events: 1 row, topic="identity.fan.registered", status="PENDING"
            - audit.audit_log: 1 row, action="FAN_REGISTERED"
            - Cognito mock: adminCreateUser called with correct email + password
            - Cognito mock: adminUpdateUserAttributes called with custom:pslFanId

IT-01-02  Register without optional fields (mobile omitted)
          Action:   POST /api/v1/auth/register (no mobile field)
          Assert:
            - HTTP 201
            - identity.fans: mobile = NULL
```

### Registration — Validation Failures

```
IT-01-03  Under-age registration
          Action:   POST with dateOfBirth indicating age 17
          Assert:
            - HTTP 400, code=UNDER_AGE
            - 0 rows in identity.fans
            - Cognito mock: adminCreateUser NOT called

IT-01-04  Duplicate email (same case)
          Setup:    Fan with "percy@example.com" already exists
          Action:   POST with email "percy@example.com"
          Assert:
            - HTTP 409, code=EMAIL_EXISTS
            - Still only 1 row in identity.fans

IT-01-05  Duplicate email (different case)
          Setup:    Fan with "percy@example.com" already exists
          Action:   POST with email "PERCY@EXAMPLE.COM"
          Assert:
            - HTTP 409, code=EMAIL_EXISTS

IT-01-06  consentTerms = false
          Action:   POST with consentTerms: false
          Assert:
            - HTTP 400, code=CONSENT_REQUIRED
            - Cognito mock: NOT called

IT-01-07  Missing required field
          Action:   POST with body omitting displayName
          Assert:
            - HTTP 400, code=VALIDATION_ERROR
            - fields array contains entry for "displayName"
```

### Registration — Atomicity

```
IT-01-08  DB transaction fails after Cognito success
          Setup:    Cognito mock succeeds
                    DB mock/constraint forces transaction failure on fans INSERT
          Action:   POST /api/v1/auth/register
          Assert:
            - HTTP 500, code=REGISTRATION_FAILED
            - 0 rows in identity.fans
            - 0 rows in identity.consent_records
            - 0 rows in outbox.outbox_events
            - Cognito mock: adminDeleteUser called with the sub from step 1
              (compensating action executed)

IT-01-09  Second registration attempt after failed first
          Setup:    First attempt failed (IT-01-08 scenario)
          Action:   POST /api/v1/auth/register again with same email
          Assert:
            - HTTP 201 (succeeds — no orphaned state from first attempt)
```

### Login

```
IT-01-10  Successful login
          Setup:    Fan registered and email verified (Cognito mock returns tokens)
          Action:   POST /api/v1/auth/login with correct credentials
          Assert:
            - HTTP 200
            - accessToken present in body
            - refreshToken in Set-Cookie, HttpOnly=true, SameSite=Lax, Path=/api/v1/auth
            - expiresIn = 900
            - audit.audit_log: action=FAN_LOGIN, fan_id matches

IT-01-11  Wrong password
          Setup:    Cognito mock raises NotAuthorizedException
          Action:   POST /api/v1/auth/login with wrong password
          Assert:
            - HTTP 401, code=INVALID_CREDENTIALS
            - No audit log entry

IT-01-12  Email not verified
          Setup:    Cognito mock raises UserNotConfirmedException
          Action:   POST /api/v1/auth/login
          Assert:
            - HTTP 403, code=EMAIL_NOT_VERIFIED

IT-01-13  Login rate limit
          Setup:    10 POST /api/v1/auth/login from same IP in < 15 minutes
          Action:   11th attempt
          Assert:
            - HTTP 429, code=RATE_LIMITED
            - Retry-After header present
```

### Token Lifecycle

```
IT-01-14  GET /auth/me with valid token
          Setup:    Cognito mock JWKS endpoint returns correct public key
          Action:   GET /api/v1/auth/me with valid Bearer token
          Assert:
            - HTTP 200
            - fanId, email, displayName, registeredAt present
            - dateOfBirth, mobile, cognitoId NOT present

IT-01-15  GET /auth/me with no token
          Action:   GET /api/v1/auth/me (no Authorization header)
          Assert:
            - HTTP 401, code=UNAUTHORISED

IT-01-16  GET /auth/me with expired token
          Setup:    Token with exp = NOW() - 1 hour
          Action:   GET /api/v1/auth/me
          Assert:
            - HTTP 401

IT-01-17  Refresh token flow
          Setup:    Valid refreshToken cookie set
                    Cognito mock returns new token pair on REFRESH_TOKEN_AUTH
          Action:   POST /api/v1/auth/refresh
          Assert:
            - HTTP 200
            - New accessToken in body
            - New refreshToken in Set-Cookie

IT-01-18  Refresh with missing cookie
          Action:   POST /api/v1/auth/refresh (no cookie)
          Assert:
            - HTTP 401, code=INVALID_REFRESH_TOKEN

IT-01-19  Logout
          Setup:    Fan logged in, refreshToken cookie set
          Action:   POST /api/v1/auth/logout
          Assert:
            - HTTP 204
            - Set-Cookie clears refreshToken (Max-Age=0 or Expires in past)
            - audit.audit_log: action=FAN_LOGOUT
```

### Database Constraint Tests

```
IT-01-20  consent_records UPDATE is silently ignored
          Setup:    consent_records row with consent_marketing=false
          Action:   Direct SQL: UPDATE identity.consent_records
                    SET consent_marketing=true WHERE id=<id>
          Assert:
            - SQL executes without error
            - Row value is UNCHANGED (consent_marketing still false)

IT-01-21  consent_records DELETE is silently ignored
          Setup:    consent_records row exists
          Action:   Direct SQL: DELETE FROM identity.consent_records WHERE id=<id>
          Assert:
            - SQL executes without error
            - Row STILL EXISTS

IT-01-22  Two fans cannot share an email
          Setup:    Fan A with email "shared@example.com" exists
          Action:   Direct SQL INSERT of Fan B with same email
          Assert:
            - Unique constraint violation raised (unique_violation PG error code 23505)

IT-01-23  consent_terms CHECK constraint
          Action:   Direct SQL INSERT into consent_records with consent_terms=false
          Assert:
            - Check constraint violation raised (check_violation PG error code 23514)
```

---

## Security Scenarios

Manual or semi-automated checks. Run before every production deploy.

```
SEC-01-01  Refresh cookie flags
           Verify: HttpOnly, Secure, SameSite=Lax are set on login response cookie.
           Tool: browser devtools or curl -v.

SEC-01-02  dateOfBirth not in any response
           Verify: No endpoint in the Identity module returns dateOfBirth in the response body.
           Tool: grep the response body of GET /auth/me, GET /me/data for "dateOfBirth" or "date_of_birth".

SEC-01-03  User enumeration prevention
           Action: POST /login with unknown email vs correct email + wrong password.
           Verify: Both return identical HTTP 401 response body and response time is similar
                   (< 100ms timing difference — constant-time comparison enforced).

SEC-01-04  Rate limiting is IP-scoped
           Action: 10 failed login attempts from IP A, then attempt from IP B.
           Verify: IP B is NOT rate-limited.

SEC-01-05  SQL injection in email field
           Action: POST /register with email: "' OR '1'='1"
           Verify: HTTP 400 (validation error, not a 500 or unexpected result).
                   DB has 0 new rows.

SEC-01-06  Access token cannot be used for refresh
           Action: POST /api/v1/auth/refresh with Authorization: Bearer <accessToken>
                   (no cookie, but trying to misuse the access token)
           Verify: HTTP 401.

SEC-01-07  Tampered JWT is rejected
           Action: Modify one character in the JWT signature.
           Verify: HTTP 401 from GET /auth/me.

SEC-01-08  Logout on all devices (refresh token revocation)
           Action: Login → save refreshToken. Logout. Attempt refresh with saved token.
           Verify: HTTP 401 (token is revoked in Cognito).
```

---

## E2E Test (Playwright)

File: `apps/web/e2e/auth.spec.ts`  
Targets: real running stack (local Docker Compose)

```
E2E-01-01  Full registration and login journey
           Step 1: Navigate to /register
           Step 2: Fill form (email, password, displayName, dateOfBirth, 
                   tick consentTerms, submit)
           Step 3: Assert "check your email" message is shown
           Step 4: (Skip email verification — use admin Cognito confirm)
           Step 5: Navigate to /login
           Step 6: Enter credentials, submit
           Step 7: Assert redirect to / (home page)
           Step 8: Assert display name appears in navigation

E2E-01-02  Under-age fan sees clear error
           Step 1: Navigate to /register
           Step 2: Enter dateOfBirth for 16-year-old, submit
           Step 3: Assert error message visible on page (not a browser alert)
           Step 4: Assert form is NOT cleared (user can correct and resubmit)

E2E-01-03  Protected route redirects to login
           Step 1: Navigate directly to /profile (protected)
           Step 2: Assert redirect to /login
           Step 3: Assert /login?redirect=/profile in URL

E2E-01-04  Session persists across page refresh
           Step 1: Login successfully
           Step 2: Refresh the page (F5)
           Step 3: Assert fan is still logged in (display name visible, no redirect)

E2E-01-05  Logout clears session
           Step 1: Login successfully
           Step 2: Click logout
           Step 3: Assert redirect to /
           Step 4: Navigate to /profile
           Step 5: Assert redirect to /login (session cleared)
```

---

## Coverage Requirements

| Area | Minimum |
|---|---|
| `identity.service.ts` (registration, login logic) | 90% |
| `identity.controller.ts` (HTTP layer) | 85% |
| Age validation function | 100% |
| Email normalisation function | 100% |
| Overall `identity` module | 80% |

Coverage measured by Vitest. CI blocks merge if any threshold is breached.
