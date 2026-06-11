# STORY-01 — API Contracts

**Base path:** `/api/v1/auth`  
**Auth:** All endpoints in this story are unauthenticated **except** `GET /api/v1/auth/me`  
**Content-Type:** `application/json` (all requests and responses)  
**Correlation:** Every request should include `x-correlation-id: <UUID>`. If absent, the server generates one and includes it in the response headers.

---

## Endpoints

### POST /api/v1/auth/register

Register a new fan account.

**Auth required:** No

#### Request

```
Headers:
  Content-Type: application/json
  x-correlation-id: UUID (optional)

Body:
  email             String   required  Max 254 chars. Stored lowercase.
  password          String   required  8–72 chars. Must contain: uppercase, lowercase,
                                       digit, and special character (!@#$%^&*).
  displayName       String   required  2–50 chars. Trimmed. No leading/trailing spaces.
  dateOfBirth       String   required  ISO 8601 date: "YYYY-MM-DD". Fan must be ≥18 years
                                       old on the date of registration.
  mobile            String   optional  E.164 format. e.g. "+27821234567".
  consentTerms      Boolean  required  Must be true. Registration rejected if false.
  consentMarketing  Boolean  required  Fan's choice. Can be false.
  consentAnalytics  Boolean  required  Fan's choice. Can be false.
```

#### Responses

**201 Created — Registration successful**
```json
{
  "fanId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Registration successful. Please check your email to verify your account."
}
```

**400 Bad Request — Validation failure**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "One or more fields failed validation.",
  "fields": [
    {
      "field": "email",
      "message": "Must be a valid email address."
    },
    {
      "field": "password",
      "message": "Must contain at least one uppercase letter, one digit, and one special character."
    }
  ]
}
```

**400 Bad Request — Under age**
```json
{
  "code": "UNDER_AGE",
  "message": "You must be 18 years or older to register for PSL One."
}
```
*Note: Do not reveal the exact age or date in the message — avoid information disclosure.*

**400 Bad Request — Terms not accepted**
```json
{
  "code": "CONSENT_REQUIRED",
  "message": "You must accept the Terms of Service and Privacy Policy to register."
}
```

**409 Conflict — Email already registered**
```json
{
  "code": "EMAIL_EXISTS",
  "message": "An account with this email address already exists."
}
```

**500 Internal Server Error — Registration failed after partial success**
```json
{
  "code": "REGISTRATION_FAILED",
  "message": "Registration could not be completed. Please try again.",
  "correlationId": "UUID"
}
```
*Note: This fires if the Cognito user was created but the DB transaction failed. The compensating action (Cognito user deletion) runs internally. The correlationId allows support to trace the incident.*

---

### POST /api/v1/auth/login

Authenticate a registered, verified fan.

**Auth required:** No

#### Request

```
Headers:
  Content-Type: application/json

Body:
  email     String  required
  password  String  required
```

#### Responses

**200 OK — Login successful**
```
Headers:
  Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Lax;
              Path=/api/v1/auth; Max-Age=2592000
              (Max-Age = 30 days in seconds)

Body:
{
  "accessToken": "<JWT>",
  "expiresIn": 900
}
```

*`expiresIn` is in seconds. Access token lifetime: 15 minutes (900 seconds).*

*Cookie notes:*
- *`HttpOnly` — not accessible from JavaScript*
- *`Secure` — HTTPS only (allow HTTP in local dev where NODE_ENV=development)*
- *`SameSite=Lax` — sent on top-level navigation (email links work); blocks CSRF on non-GET requests*
- *`Path=/api/v1/auth` — scoped to auth endpoints only*

**401 Unauthorised — Invalid credentials**
```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "The email or password you entered is incorrect."
}
```
*Note: Never distinguish between "email not found" and "wrong password" — prevents user enumeration.*

**403 Forbidden — Email not verified**
```json
{
  "code": "EMAIL_NOT_VERIFIED",
  "message": "Please verify your email address before logging in. Check your inbox for the verification link."
}
```

**429 Too Many Requests — Rate limit exceeded**
```
Headers:
  Retry-After: 900

Body:
{
  "code": "RATE_LIMITED",
  "message": "Too many login attempts. Please try again in 15 minutes.",
  "retryAfterSeconds": 900
}
```
*Rate limit: 10 attempts per 15 minutes per IP address.*

---

### POST /api/v1/auth/refresh

Exchange a valid refresh token for a new access token.

**Auth required:** No (but requires a valid `refreshToken` cookie)

#### Request

```
Headers:
  Cookie: refreshToken=<token>
  (no request body)
```

#### Responses

**200 OK — Token refreshed**
```
Headers:
  Set-Cookie: refreshToken=<new-token>; HttpOnly; Secure; SameSite=Lax;
              Path=/api/v1/auth; Max-Age=2592000

Body:
{
  "accessToken": "<new-JWT>",
  "expiresIn": 900
}
```
*The old refresh token is rotated — a new one is issued and the old one is revoked.*

**401 Unauthorised — Refresh token missing or invalid**
```json
{
  "code": "INVALID_REFRESH_TOKEN",
  "message": "Your session has expired. Please log in again."
}
```

---

### POST /api/v1/auth/logout

Revoke the refresh token and clear the cookie.

**Auth required:** No (operates on the cookie alone)

#### Request

```
Headers:
  Cookie: refreshToken=<token>
  (no request body)
```

#### Responses

**204 No Content — Logout successful**
```
Headers:
  Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Lax;
              Path=/api/v1/auth; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT
(no body)
```

**204 No Content — No cookie present**

*Always returns 204 regardless of whether a valid cookie was present. Logout is idempotent.*

---

### GET /api/v1/auth/me

Return the authenticated fan's identity record.

**Auth required:** Yes — `Authorization: Bearer <accessToken>`

#### Request

```
Headers:
  Authorization: Bearer <JWT>
```

#### Responses

**200 OK**
```json
{
  "fanId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "percy@example.com",
  "displayName": "Percy T",
  "registeredAt": "2026-06-16T08:30:00Z"
}
```
*Note: `dateOfBirth` and `mobile` are intentionally excluded from this response — PII minimisation. Full data available via `GET /api/v1/me/data` (POPIA endpoint).*

**401 Unauthorised — No or invalid token**
```json
{
  "code": "UNAUTHORISED",
  "message": "Authentication required."
}
```

---

## Error Code Reference

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | One or more fields failed format/type validation |
| `UNDER_AGE` | 400 | Fan is under 18 years old |
| `CONSENT_REQUIRED` | 400 | consentTerms was false |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `REGISTRATION_FAILED` | 500 | Partial failure during registration; safe to retry |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `EMAIL_NOT_VERIFIED` | 403 | Cognito email not confirmed |
| `RATE_LIMITED` | 429 | Too many attempts from this IP |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token missing, expired, or revoked |
| `UNAUTHORISED` | 401 | Missing or invalid access token on protected endpoint |

---

## Rate Limiting

| Endpoint | Limit | Window | Scope |
|---|---|---|---|
| `POST /register` | 5 requests | 15 minutes | Per IP |
| `POST /login` | 10 requests | 15 minutes | Per IP |
| `POST /refresh` | 60 requests | 15 minutes | Per IP |
| `GET /me` | 300 requests | 1 minute | Per fan (JWT sub) |

Rate limit response always includes `Retry-After` header (seconds until reset).

---

## Security Headers

All responses from `/api/v1/auth/*` include:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Cache-Control: no-store
Pragma: no-cache
```

The `Cache-Control: no-store` header is critical — auth responses must never be cached by browsers or proxies.

---

## JWT Token Structure

Access tokens are issued by AWS Cognito (RS256). The server does not issue its own tokens.

**Claims present in the Cognito access token:**

| Claim | Value | Notes |
|---|---|---|
| `sub` | UUID | Cognito user ID (= `Fan.cognitoId`) |
| `email` | String | Fan's email |
| `email_verified` | Boolean | Must be `true` for access |
| `custom:pslFanId` | UUID | `Fan.id` from our DB — set via Cognito custom attribute |
| `cognito:groups` | String[] | RBAC roles (e.g. `["FAN"]`) |
| `iss` | String | `https://cognito-idp.af-south-1.amazonaws.com/<POOL_ID>` |
| `aud` | String | Cognito App Client ID |
| `exp` | Unix timestamp | 15 minutes from issue |
| `iat` | Unix timestamp | Issue time |

**How the auth guard extracts the fan:**
```
request.user = {
  fanId:  token["custom:pslFanId"],
  email:  token["email"],
  roles:  token["cognito:groups"],
}
```

The `custom:pslFanId` attribute must be set in Cognito when the user is created via `adminCreateUser`.

---

## POPIA Endpoints (out of scope for STORY-01 code — spec only)

These endpoints are in the Identity bounded context but are not part of the registration/login flow. They are recorded here for completeness; implementation is part of the Identity module's full build.

```
GET  /api/v1/me/data          Returns all personal data (POPIA right of access)
GET  /api/v1/me/data/export   Downloadable JSON export
POST /api/v1/me/consent       Update marketing/analytics consent (creates new ConsentRecord)
DELETE /api/v1/me/account     Anonymise account (POPIA right to erasure)
```

These endpoints write an `AuditLog` entry on every access.
