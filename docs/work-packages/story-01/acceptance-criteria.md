# STORY-01 — Acceptance Criteria

**Format:** Given / When / Then  
**Coverage:** Registration, login, token lifecycle, POPIA compliance, security, atomicity

---

## Registration

### AC-01-01: Successful registration

```
Given   a valid payload:
          email: "percy@example.com"
          password: "Test1234!"
          displayName: "Percy T"
          dateOfBirth: "1995-06-08"   (30 years old — eligible)
          consentTerms: true
          consentMarketing: false
          consentAnalytics: true
When    POST /api/v1/auth/register
Then    HTTP 201 returned
And     response body contains { fanId: UUID, message: String }
And     one row exists in identity.fans with email "percy@example.com"
And     one row exists in identity.consent_records with fan_id = returned fanId
And     consent_records row has consent_terms=true, consent_marketing=false, consent_analytics=true
And     one row exists in outbox.outbox_events with topic "identity.fan.registered" and status "PENDING"
And     one row exists in audit.audit_log with action "FAN_REGISTERED" and resource_id = fanId
And     a Cognito user exists in the user pool with the same email
```

---

### AC-01-02: Under-age fan rejected

```
Given   a payload with dateOfBirth: "2009-06-09"
          (17 years and 364 days old on 2026-06-08)
When    POST /api/v1/auth/register
Then    HTTP 400 returned
And     response body: { "code": "UNDER_AGE", "message": "..." }
And     NO row inserted in identity.fans
And     NO row inserted in identity.consent_records
And     NO Cognito user created
And     NO outbox event written
```

---

### AC-01-03: Exactly 18 years old — permitted

```
Given   a payload with dateOfBirth: "2008-06-08"
          (exactly 18 years old on 2026-06-08 — registration date)
When    POST /api/v1/auth/register
Then    HTTP 201 returned
```

---

### AC-01-04: consentTerms = false is rejected

```
Given   a payload with consentTerms: false (all other fields valid)
When    POST /api/v1/auth/register
Then    HTTP 400 returned
And     response body: { "code": "CONSENT_REQUIRED" }
And     NO row inserted in identity.fans
And     NO Cognito user created
```

---

### AC-01-05: Duplicate email rejected

```
Given   "percy@example.com" is already registered and verified
When    POST /api/v1/auth/register with email: "percy@example.com"
Then    HTTP 409 returned
And     response body: { "code": "EMAIL_EXISTS" }
And     the existing fan's data is unchanged
```

---

### AC-01-06: Email case-insensitive deduplication

```
Given   "percy@example.com" is already registered (lowercase)
When    POST /api/v1/auth/register with email: "PERCY@EXAMPLE.COM"
Then    HTTP 409 returned with code EMAIL_EXISTS
```

---

### AC-01-07: Email normalised to lowercase on storage

```
Given   a valid payload with email: "Percy.Tau@Chiefs.CO.ZA"
When    POST /api/v1/auth/register
Then    HTTP 201 returned
And     identity.fans row has email = "percy.tau@chiefs.co.za" (lowercase)
And     outbox event payload.email = "percy.tau@chiefs.co.za"
```

---

### AC-01-08: Missing required field rejected

```
Given   a payload missing the "displayName" field
When    POST /api/v1/auth/register
Then    HTTP 400 returned
And     response body: { "code": "VALIDATION_ERROR", "fields": [{ "field": "displayName", ... }] }
```

---

### AC-01-09: Weak password rejected

```
Given   a payload with password: "password"   (no uppercase, no digit, no special char)
When    POST /api/v1/auth/register
Then    HTTP 400 returned
And     response body: { "code": "VALIDATION_ERROR", "fields": [{ "field": "password", ... }] }
```

---

### AC-01-10: Registration atomicity — DB failure after Cognito success

```
Given   Cognito user creation succeeds
And     the DB transaction fails (simulated constraint violation)
When    POST /api/v1/auth/register
Then    HTTP 500 returned with code REGISTRATION_FAILED
And     NO row in identity.fans
And     NO row in identity.consent_records
And     NO outbox event
And     the Cognito user that was created is deleted (compensating action)
And     a second registration attempt with the same email succeeds (no orphaned Cognito user)
```

---

### AC-01-11: consentMarketing and consentAnalytics stored correctly

```
Given   a valid payload with consentMarketing: true, consentAnalytics: false
When    POST /api/v1/auth/register
Then    HTTP 201 returned
And     consent_records row has consent_marketing=true, consent_analytics=false
And     outbox event payload has consentMarketing=true, consentAnalytics=false
```

---

## Login

### AC-01-12: Successful login

```
Given   "percy@example.com" is registered AND email is verified in Cognito
When    POST /api/v1/auth/login with correct email and password
Then    HTTP 200 returned
And     response body contains { accessToken: String, expiresIn: 900 }
And     response Set-Cookie header contains:
          refreshToken (HttpOnly, Secure, SameSite=Lax, Path=/api/v1/auth)
And     audit.audit_log has entry with action "FAN_LOGIN"
```

---

### AC-01-13: Wrong password

```
Given   "percy@example.com" is a registered, verified fan
When    POST /api/v1/auth/login with email "percy@example.com" and wrong password
Then    HTTP 401 returned
And     response body: { "code": "INVALID_CREDENTIALS" }
And     response does NOT indicate whether the email exists
```

---

### AC-01-14: Unknown email

```
Given   "unknown@example.com" does not exist in the system
When    POST /api/v1/auth/login
Then    HTTP 401 returned
And     response body: { "code": "INVALID_CREDENTIALS" }
And     response is indistinguishable from wrong-password response (anti-enumeration)
```

---

### AC-01-15: Unverified email blocked

```
Given   "new@example.com" registered but email NOT yet verified in Cognito
When    POST /api/v1/auth/login with correct password
Then    HTTP 403 returned
And     response body: { "code": "EMAIL_NOT_VERIFIED" }
```

---

### AC-01-16: Login rate limiting

```
Given   IP address 1.2.3.4 has submitted 10 failed login attempts in the last 15 minutes
When    POST /api/v1/auth/login from IP 1.2.3.4 (11th attempt)
Then    HTTP 429 returned
And     response body contains { "code": "RATE_LIMITED", "retryAfterSeconds": N }
And     response header Retry-After is present
```

---

## Token Lifecycle

### AC-01-17: Access token is valid JWT

```
Given   a successful login response
When    the accessToken is decoded
Then    it is a valid RS256 JWT
And     claims include: sub, email, custom:pslFanId, cognito:groups, exp, iss
And     exp is approximately 15 minutes from now (within 5 seconds)
And     iss matches the Cognito User Pool URL for af-south-1
```

---

### AC-01-18: GET /auth/me with valid token

```
Given   a fan with a valid access token
When    GET /api/v1/auth/me with Authorization: Bearer <accessToken>
Then    HTTP 200 returned
And     response body contains { fanId, email, displayName, registeredAt }
And     response does NOT contain dateOfBirth or mobile (PII minimisation)
```

---

### AC-01-19: GET /auth/me with no token

```
Given   no Authorization header is sent
When    GET /api/v1/auth/me
Then    HTTP 401 returned
And     response body: { "code": "UNAUTHORISED" }
```

---

### AC-01-20: GET /auth/me with expired token

```
Given   an access token that expired 5 minutes ago
When    GET /api/v1/auth/me with that token
Then    HTTP 401 returned
And     response body: { "code": "UNAUTHORISED" }
```

---

### AC-01-21: Refresh token — valid rotation

```
Given   a fan is logged in and holds a valid refreshToken cookie
And     the access token has expired
When    POST /api/v1/auth/refresh
Then    HTTP 200 returned
And     response body contains a new accessToken
And     response Set-Cookie contains a new refreshToken (replacing the old one)
And     the old refreshToken is revoked (if replayed immediately, it returns 401)
```

---

### AC-01-22: Refresh with invalid or missing cookie

```
Given   no refreshToken cookie is present
When    POST /api/v1/auth/refresh
Then    HTTP 401 returned
And     response body: { "code": "INVALID_REFRESH_TOKEN" }
```

---

### AC-01-23: Logout clears cookie

```
Given   a fan is logged in with a valid refreshToken cookie
When    POST /api/v1/auth/logout
Then    HTTP 204 returned
And     response Set-Cookie clears the refreshToken
          (Max-Age=0, Expires past date)
And     subsequent POST /api/v1/auth/refresh returns 401
```

---

### AC-01-24: Logout is idempotent

```
Given   no refreshToken cookie exists (fan already logged out or never logged in)
When    POST /api/v1/auth/logout
Then    HTTP 204 returned (not an error)
```

---

## POPIA Compliance

### AC-01-25: ConsentRecord is immutable — UPDATE has no effect

```
Given   a consent_records row exists with consent_marketing=false
When    a direct SQL UPDATE is attempted:
          UPDATE identity.consent_records SET consent_marketing=true WHERE id=...
Then    The UPDATE executes without error (RULE discards silently)
And     the row is UNCHANGED — consent_marketing is still false
```

---

### AC-01-26: ConsentRecord is immutable — DELETE has no effect

```
Given   a consent_records row exists
When    a direct SQL DELETE is attempted
Then    The DELETE executes without error
And     the row STILL EXISTS
```

---

### AC-01-27: Consent change creates new row

```
Given   a fan's current consent has consentMarketing=false
When    POST /api/v1/me/consent with consentMarketing=true
Then    HTTP 200 returned
And     a NEW row exists in consent_records with consentMarketing=true
And     the ORIGINAL row is unchanged (consentMarketing still false)
And     the fan now has 2 consent_records rows
And     AuditLog entry written with action CONSENT_UPDATED
```

---

## Security

### AC-01-28: Refresh cookie is HttpOnly

```
Given   a fan logs in via POST /api/v1/auth/login
When    the Set-Cookie response header is inspected
Then    the refreshToken cookie has the HttpOnly flag
And     the cookie has SameSite=Lax (NOT Strict)
And     the cookie has Secure flag
And     the cookie Path is /api/v1/auth
```

---

### AC-01-29: dateOfBirth not returned on GET /me

```
Given   a fan is authenticated
When    GET /api/v1/auth/me
Then    the response body does NOT contain dateOfBirth
And     the response body does NOT contain mobile
And     the response body does NOT contain cognitoId
```

---

### AC-01-30: Unauthenticated access to protected endpoint blocked

```
Given   a request with no Authorization header
When    GET /api/v1/auth/me
Then    HTTP 401 returned
And     no fan data is returned
And     no AuditLog entry written (failed auth, not data access)
```
