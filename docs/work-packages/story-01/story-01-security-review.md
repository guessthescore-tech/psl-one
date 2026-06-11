# STORY-01 — Security Review

**Reviewer role:** Principal Security Engineer  
**Date:** 2026-06-08  
**Artefacts reviewed:** domain-model.md, api-contracts.md, database-schema.md, acceptance-criteria.md, test-scenarios.md  
**Directive:** Review only. Do not modify the existing design.

---

## Executive Position

The design makes the right instincts in several places: append-only consent records with DB-level enforcement, SameSite=Lax over Strict, PII minimisation on GET /auth/me, and atomic registration across Cognito and the database. These are good foundations.

However there are **four issues that would cause the system to fail on deployment or in a legal audit**, and a further set of high-severity problems that would be exploitable within weeks of launch. The design is not yet safe to build against.

Findings are grouped under the ten review areas. Each finding states what the design says, what the problem is, and the consequence. No remediation is proposed — that is for the design revision.

---

## Severity Key

| Severity | Meaning |
|---|---|
| **CRITICAL** | Will fail on deployment, or constitutes an immediate legal violation |
| **HIGH** | Exploitable under realistic attack conditions; must be fixed before launch |
| **MEDIUM** | Meaningful risk under specific conditions; should be fixed before launch |
| **LOW** | Limited impact; address post-launch |
| **INFO** | Observation or gap requiring a documented decision, not necessarily a fix |

---

## 1. POPIA Compliance

### SEC-POPIA-01 — CRITICAL: Consent data itself requires separate consent

**Location:** `database-schema.md` — `consent_records` column notes; `domain-model.md` — ConsentRecord entity

**Finding:** The `consent_records` table stores `ip_address` and `user_agent` as part of the consent capture process. Both are personal information under POPIA. The fan is being asked to consent to the platform's Terms and Privacy Policy, but the very act of recording that consent involves processing two pieces of personal data (`ip_address`, `user_agent`) for which no separate consent or adequate legal basis is articulated in the design.

The design states the purpose of `ip_address` is "POPIA audit evidence." POPIA Section 13 allows processing without consent if it is necessary for compliance with a legal obligation, which may provide a basis. But this legal basis is not stated in the design — it is assumed. If it is not documented in the Privacy Policy that IP addresses and device information are collected at registration for legal compliance purposes, the processing has no stated lawful basis under POPIA Section 11.

**Consequence:** POPIA complaint could be upheld by the Information Regulator on the grounds that IP processing at consent capture has no disclosed legal basis. The consent records themselves may be inadmissible as evidence if the collection process violated the Act.

---

### SEC-POPIA-02 — HIGH: `consentAnalytics` has no defined purpose

**Location:** `domain-model.md` — ConsentRecord entity; `api-contracts.md` — register request body

**Finding:** The registration form collects `consentAnalytics` but the design does not define what "analytics" means, what data is processed under this consent, or which third-party systems receive it. POPIA Section 13(1)(a) requires that consent be "specific" — a general `consentAnalytics` flag is legally insufficient if the fan cannot know what they are consenting to.

**Consequence:** If the platform later uses analytics services (e.g., Google Analytics, Mixpanel, AWS Pinpoint), the legal basis for that processing is a checkbox with an undefined purpose. A POPIA subject access request asking "what analytics data do you hold about me and who receives it" would expose this gap immediately.

---

### SEC-POPIA-03 — HIGH: `dateOfBirth` is not cleared on account erasure

**Location:** `database-schema.md` — Data Lifecycle table

**Finding:** The erasure process sets `email`=`deleted-{id}@pslone.co.za`, `display_name`='Deleted User', and `mobile`=NULL. `date_of_birth` is not included in this list and is left intact after anonymisation.

Date of birth is personal information under POPIA. The design acknowledges this implicitly by excluding it from `GET /auth/me` as a PII minimisation measure. But the same logic is not applied to erasure. A fan who exercises their right to erasure has their date of birth retained permanently in the database.

**Consequence:** Incomplete erasure. If challenged, PSL One cannot demonstrate full POPIA compliance with a right-to-erasure request.

---

### SEC-POPIA-04 — MEDIUM: ConsentRecord retains PII post-erasure with no time limit

**Location:** `database-schema.md` — Data Lifecycle table (erasure row); `domain-model.md` — ConsentRecord immutability invariant

**Finding:** The design states consent records are retained after erasure as a "legal obligation." This may be correct — retaining evidence of consent can be a POPIA-compliant legitimate interest. However:

1. The rows contain `ip_address` and `user_agent` (see SEC-POPIA-01). Retaining PII in consent records after the fan is anonymised keeps personal information attached to an otherwise de-identified record indefinitely.
2. No retention period is defined. POPIA's data minimisation principle requires data to be retained "no longer than necessary."

**Consequence:** An undated, unlimited retention of PII in consent records will fail a POPIA audit unless the specific legal basis and a defined retention period are documented.

---

### SEC-POPIA-05 — MEDIUM: `consentTerms` bundles two legally distinct agreements

**Location:** `domain-model.md` — ConsentRecord entity note; `api-contracts.md` — register request body

**Finding:** A single `consentTerms` boolean covers agreement to both the Terms of Service and the Privacy Policy. These are legally distinct:

- Terms of Service is a contract (governed by contract law).
- Privacy Policy is a consent statement (governed by POPIA).

Bundling them into one boolean means the Privacy Policy consent is conditional on accepting the Terms of Service, which POPIA Section 11(2) prohibits: "Consent is not valid if it is dependent on accepting a contract where processing is not necessary for the performance of that contract."

**Consequence:** The consent captured at registration may not be valid under POPIA if challenged, because a fan cannot consent to data processing without also agreeing to Terms of Service.

---

### SEC-POPIA-06 — LOW: RDS backup retention is not disclosed

**Location:** `infrastructure-bootstrap.md` — RDS configuration (`backup_retention_period = 7`)

**Finding:** RDS automated backups retain data for 7 days. A fan who requests account deletion will have their pre-anonymisation data persist in backups for up to 7 additional days. The design's Privacy Policy provisions do not address this. It is standard practice for cloud platforms but must be disclosed.

**Consequence:** Minor non-disclosure gap. Resolvable by adding backup retention disclosure to the Privacy Policy.

---

## 2. Cognito Integration

### SEC-COGNITO-01 — CRITICAL: `custom:pslFanId` is not present in Cognito access tokens by default

**Location:** `api-contracts.md` — JWT Token Structure table; `test-scenarios.md` — UT-01-17, IT-01-14

**Finding:** The design's auth guard extracts `fanId` via `token["custom:pslFanId"]`. Cognito access tokens do **not** include custom attributes (`custom:*`) by default. Custom attributes appear in ID tokens only. For them to appear in access tokens, a Pre-Token-Generation Lambda trigger must be configured to explicitly add the claim to the token.

This trigger is not mentioned anywhere in the design: not in the domain model, not in the API contracts, not in the Cognito setup steps in sprint-0-bootstrap.md, not in the acceptance criteria, and not in the integration tests.

If built as specified, `token["custom:pslFanId"]` will always be `undefined`. Every authenticated request will fail to resolve the fan identity. The platform will be broken on Day 1.

**Consequence:** Complete authentication failure in production. This is a build-blocking issue.

---

### SEC-COGNITO-02 — HIGH: Fan's plaintext password transits through the NestJS backend

**Location:** `domain-model.md` — RegistrationService orchestration (step 2: `adminCreateUser`); `api-contracts.md` — POST /auth/login (password in request body)

**Finding:** The design uses server-side Cognito auth flows (`adminCreateUser` for registration, `initiateAuth` with `USER_PASSWORD_AUTH` for login). Both flows require the fan's plaintext password to be received by the NestJS backend and forwarded to Cognito. This means:

1. The password passes through NestJS application memory.
2. The password is logged if request logging is misconfigured (e.g., a middleware that logs request bodies).
3. A memory dump or debug trace of the NestJS process would expose credentials.

The alternative — using the Cognito client-side SDK (browser calls Cognito directly using `signUp`/`initiateAuth`) — keeps the password solely between the browser and Cognito, never touching application servers.

The design makes the server-side choice explicitly but does not acknowledge the password transit risk.

**Consequence:** Increased blast radius of a backend compromise. Any logging misconfiguration leaks credentials.

---

### SEC-COGNITO-03 — HIGH: Compensating action (adminDeleteUser) failure is unhandled and unmonitored

**Location:** `domain-model.md` — RegistrationService step 8; `acceptance-criteria.md` — AC-01-10; `test-scenarios.md` — IT-01-08

**Finding:** AC-01-10 specifies that on DB failure, the Cognito user is deleted as a compensating action. IT-01-08 tests that this happens. But neither the acceptance criteria nor the test scenarios address what happens if `adminDeleteUser` itself fails:

- Cognito is unavailable during the compensating call.
- `adminDeleteUser` times out.
- IAM permissions for the EC2 instance profile don't include `cognito-idp:AdminDeleteUser`.

In any of these cases, the fan has an orphaned Cognito account with no corresponding DB record. Their next registration attempt with the same email will fail in Cognito (email already taken) even though no fan record exists. The fan is permanently locked out of registering.

There is no monitoring, no alert, and no operational runbook for this state.

**Consequence:** Silent orphaned accounts cause permanent registration failure for affected email addresses. Support has no tooling to detect or remediate this.

---

### SEC-COGNITO-04 — MEDIUM: `adminCreateUser` creates users in FORCE_CHANGE_PASSWORD state

**Location:** `domain-model.md` — RegistrationService steps 2–7

**Finding:** AWS `adminCreateUser` creates users in `FORCE_CHANGE_PASSWORD` status by default. Users in this state cannot use `USER_PASSWORD_AUTH` to log in — Cognito responds with a `NEW_PASSWORD_REQUIRED` challenge. The design's login flow calls `initiateAuth` and expects either a successful token or an error. It does not handle the `NEW_PASSWORD_REQUIRED` challenge.

To avoid this, the implementation must either:
- Call `adminSetUserPassword` with `Permanent: true` immediately after `adminCreateUser`, or
- Handle the `NEW_PASSWORD_REQUIRED` challenge in the login flow.

Neither step is documented in the design.

**Consequence:** All newly registered fans will be unable to log in until the password challenge is handled. This is a Day 1 breakage.

---

### SEC-COGNITO-05 — MEDIUM: Fan RBAC group assignment is not in the registration flow

**Location:** `domain-model.md` — RegistrationService steps 2–7; `api-contracts.md` — JWT claims: `cognito:groups`

**Finding:** The auth guard extracts roles from `cognito:groups`. For `FAN` role access to work, the user must be added to a Cognito group named `FAN` (or equivalent). The registration flow describes `adminCreateUser` and `adminUpdateUserAttributes` (for `pslFanId`) but does not include `adminAddUserToGroup`.

If the group assignment step is missing, `cognito:groups` will be empty for all new fans. The `@Roles(Role.FAN)` guard will deny every authenticated request. Alternatively, if no group check is enforced, all authenticated users — regardless of role — can access FAN-gated endpoints.

**Consequence:** Either all fans are locked out of FAN-gated endpoints, or the RBAC model is silently unenforced from Day 1.

---

### SEC-COGNITO-06 — LOW: Unverified fan accounts accumulate indefinitely

**Location:** `domain-model.md` — Fan lifecycle; `database-schema.md` — Data Lifecycle

**Finding:** After registration, if the fan never verifies their email, they have:
- A Cognito user (unverified)
- A Fan DB record
- A ConsentRecord DB record
- A loyalty account (created by the `identity.fan.registered` event)
- An outbox event (published)

No cleanup mechanism exists. The email address is permanently occupied. If the fan made a typo in their email, they cannot re-register with the correct email (email is unique), and they cannot access the account. No time-based expiry or admin cleanup is defined.

**Consequence:** Accumulation of zombie accounts; legitimate fans locked out of their real email address indefinitely if they made a typo at registration.

---

## 3. Cookie Strategy

### SEC-COOKIE-01 — HIGH: Cookie `Max-Age` is not aligned to Cognito refresh token validity

**Location:** `api-contracts.md` — POST /auth/login response, POST /auth/refresh response

**Finding:** The cookie `Max-Age=2592000` (30 days). Cognito User Pool refresh token validity is a separate configuration setting with a default of **30 days**, but it is configurable and nothing in the design constrains it. If the Cognito refresh token validity is set to, for example, 7 days (a common production hardening choice), the cookie persists for 23 additional days past token expiry.

During those 23 days, fans attempting to refresh get a `INVALID_REFRESH_TOKEN` error from Cognito despite having a "live" cookie. The fan experience is confusing. More importantly: if the design is later hardened by shortening Cognito's refresh token validity, no corresponding change to cookie `Max-Age` is documented as required.

**Consequence:** Token/cookie lifetime mismatch causes phantom sessions and confusing logout-without-logout UX.

---

### SEC-COOKIE-02 — MEDIUM: `Secure` flag is conditionally disabled in development

**Location:** `api-contracts.md` — POST /auth/login cookie notes ("allow HTTP in local dev where NODE_ENV=development")

**Finding:** The design explicitly allows the `Secure` flag to be dropped when `NODE_ENV=development`. This means refresh tokens are transmitted over HTTP in development environments. Risks:

1. On a shared developer Wi-Fi network, refresh tokens are visible in plaintext.
2. Developers using real (non-seed) credentials in development expose those credentials.
3. A developer who accidentally runs with `NODE_ENV=development` in a staging environment (which has real users) exposes all refresh tokens.

**Consequence:** Developer credential exposure risk. Staging environment misconfiguration could expose user refresh tokens over HTTP.

---

### SEC-COOKIE-03 — MEDIUM: Cookie replay after refresh is not detectable at session level

**Location:** `acceptance-criteria.md` — AC-01-21; `api-contracts.md` — POST /auth/refresh

**Finding:** AC-01-21 correctly states that after token rotation, the old refresh token is revoked. This is the correct behaviour. However, the scenario where an attacker possesses a copy of the refresh token and uses it before the legitimate fan does is not considered:

1. Attacker steals refresh token (XSS, network interception, device access).
2. Attacker calls `POST /auth/refresh` first.
3. Legitimate fan's existing cookie now maps to a revoked token.
4. Legitimate fan's next `POST /auth/refresh` returns 401.
5. Legitimate fan is silently logged out with no indication their session was stolen.

Cognito will detect the refresh token reuse (both parties cannot have valid sessions from one token) and revoke the entire refresh token family. This is correct behaviour from Cognito but the design provides no mechanism to notify the fan that a potential session theft occurred.

**Consequence:** Session hijacking goes undetected by the victim until they notice they're logged out. No security alert, no audit log entry, no notification to the fan.

---

### SEC-COOKIE-04 — LOW: Missing `__Host-` cookie prefix

**Location:** `api-contracts.md` — POST /auth/login response Set-Cookie

**Finding:** The cookie is named `refreshToken`. Using the `__Host-` prefix (naming it `__Host-refreshToken`) would cause browsers to enforce three additional constraints: the cookie must have the `Secure` attribute, must not have a `Domain` attribute, and must have `Path=/`. These constraints prevent subdomain cookie injection attacks where a compromised subdomain (e.g., `cdn.pslone.co.za`) attempts to set cookies for the parent domain.

**Consequence:** Without `__Host-` prefix, a compromised subdomain could potentially inject a crafted `refreshToken` cookie for the parent domain if a `Domain` attribute were ever accidentally added.

---

## 4. JWT Claims

### SEC-JWT-01 — CRITICAL: See SEC-COGNITO-01

The `custom:pslFanId` claim absence in access tokens is documented under SEC-COGNITO-01 but its immediate consequence is in the JWT claims section: the auth guard's identity extraction logic is entirely broken on a default Cognito configuration.

---

### SEC-JWT-02 — HIGH: `email_verified` check is not in any acceptance criterion or test

**Location:** `api-contracts.md` — JWT claims table ("Must be `true` for access"); `acceptance-criteria.md`; `test-scenarios.md`

**Finding:** The JWT claims table states `email_verified` "Must be `true` for access." This is a critical security control: it prevents unverified accounts from accessing the platform. However, there is no acceptance criterion that tests the auth guard's enforcement of `email_verified=false`. The test scenario AC-01-15 and IT-01-12 test that the login endpoint rejects unverified users before issuing a token. But there is no test verifying that a token with `email_verified=false` is rejected by the auth guard on downstream endpoints.

These are distinct controls. A token with `email_verified=false` could theoretically reach the auth guard if issued outside the normal login flow (e.g., admin-created token, token from a different app client, or a bug in the login flow).

**Consequence:** If the auth guard does not check `email_verified`, unverified fans can access the platform with a manually or externally issued token.

---

### SEC-JWT-03 — MEDIUM: Fan email is in every access token — data minimisation concern

**Location:** `api-contracts.md` — JWT claims table (`email` claim)

**Finding:** The `email` claim is present in every access token. Every API request carries the fan's email address in the token payload, which is transmitted in the `Authorization` header. Any service that logs the raw Authorization header (common in debugging) logs the fan's email.

Services that do not need to know the fan's email (e.g., a football data service, a leaderboard service) receive it anyway because it is in the token. The auth guard maps `token["email"]` into `request.user.email`, and this is available in every controller. There is no mechanism to prevent downstream services from accidentally using it.

POPIA's data minimisation principle requires collecting only what is necessary for the stated purpose.

**Consequence:** Fan email is unnecessarily broadcast to all services on every request. Logging misconfiguration in any service exposes email addresses.

---

### SEC-JWT-04 — MEDIUM: No `jti` claim means access token revocation is impossible

**Location:** `api-contracts.md` — JWT claims table

**Finding:** The design has no `jti` (JWT ID) claim. Without `jti`, there is no mechanism to revoke a specific access token before its 15-minute expiry. Scenarios where this matters:

- A fan changes their password (indicating possible compromise). Their existing access tokens remain valid for up to 15 minutes.
- A `PSL_ADMIN` user's device is stolen. Their admin-privileged access tokens remain valid for up to 15 minutes after logout.
- A fan's account is suspended by an admin (`PSL_ADMIN` action). Their existing access token continues to work until expiry.

15 minutes is short but not zero. For admin-privileged tokens, this window is meaningful.

**Consequence:** No mechanism to immediately revoke specific tokens. All privilege changes, suspensions, and compromises have a 15-minute grace window during which the old access level persists.

---

## 5. User Enumeration Attacks

### SEC-ENUM-01 — HIGH: `EMAIL_NOT_VERIFIED` response reveals account existence

**Location:** `api-contracts.md` — POST /auth/login, 403 response; `acceptance-criteria.md` — AC-01-15

**Finding:** The login endpoint returns HTTP 403 with code `EMAIL_NOT_VERIFIED` for unverified accounts. This response is distinguishable from the HTTP 401 `INVALID_CREDENTIALS` response returned for unknown emails or wrong passwords. An attacker can use this distinction to confirm which emails are registered:

```
POST /login { email: "unknown@test.com", password: "any" }   → 401 INVALID_CREDENTIALS
POST /login { email: "percy@pslone.co.za", password: "any"  → 401 INVALID_CREDENTIALS (wrong pw)
POST /login { email: "newuser@pslone.co.za", password: "any" } → 403 EMAIL_NOT_VERIFIED ← confirms registration
```

The design correctly handles the `INVALID_CREDENTIALS` anti-enumeration case (AC-01-13, AC-01-14) but misses the verified/unverified distinction entirely. There is no test that checks for enumeration via the 403 path.

**Consequence:** Every unverified account is directly enumerable. Attackers can build a list of recently registered (but not yet verified) accounts, which may be used for targeted phishing.

---

### SEC-ENUM-02 — HIGH: `EMAIL_EXISTS` 409 at registration is a direct enumeration vector

**Location:** `api-contracts.md` — POST /auth/register, 409 response; `acceptance-criteria.md` — AC-01-05, AC-01-06

**Finding:** The registration endpoint explicitly returns HTTP 409 with `{ "code": "EMAIL_EXISTS" }` when a duplicate email is submitted. This is a direct, unambiguous confirmation that the email is registered on PSL One.

The rate limit of 5 requests per 15 minutes per IP applies. With a list of 10,000 email addresses to check and 1,000 rotating proxies:
- 5,000 checks per 15 minutes (5 requests × 1,000 proxies)
- 10,000 emails checked in 30 minutes

**Consequence:** Full email list enumeration is feasible using commodity proxy infrastructure. An attacker learns which fans are registered on the platform — a privacy violation and a precursor to targeted credential stuffing or phishing.

---

### SEC-ENUM-03 — MEDIUM: Response timing difference between known and unknown emails at login

**Location:** `test-scenarios.md` — SEC-01-03 ("< 100ms timing difference")

**Finding:** SEC-01-03 specifies that login responses for unknown emails and wrong passwords should differ by less than 100ms. This relies on Cognito providing constant-time responses for both cases. Cognito's handling of `UserNotFoundException` (unknown email) vs `NotAuthorizedException` (wrong password) may differ internally — the latter may require a cryptographic password comparison operation that takes measurably longer.

The test scenario specifies a 100ms tolerance, which is generous. Timing attacks typically operate with microsecond precision. More importantly, the 100ms test is categorised as a "manual or semi-automated check" run before production deploys — it is not a deterministic automated test.

The design has no mechanism to enforce constant-time responses (e.g., adding a minimum response delay to the login endpoint).

**Consequence:** Under precise timing measurement, unknown emails and wrong passwords may produce distinguishable response times, enabling enumeration even when response bodies are identical.

---

## 6. Brute Force Protection

### SEC-BRUTE-01 — HIGH: No per-account rate limiting — distributed brute force is unmitigated

**Location:** `api-contracts.md` — Rate Limiting table (login: 10/15 min per IP)

**Finding:** The login rate limit is IP-scoped only. There is no per-account (per-email) rate limiting. A distributed brute force attack using N IP addresses can attempt N × 10 passwords per 15 minutes against a single account:

- 100 IPs: 1,000 attempts per 15 minutes = 4,000 attempts per hour
- 1,000 IPs: 10,000 attempts per 15 minutes = 40,000 attempts per hour

A 10-character password with an 8-character lowercase+digit search space has ~2.8 trillion combinations, but targeted attacks against a known user with common passwords (RockYou2024 list: ~10 billion entries) need far fewer attempts. At 40,000 attempts per hour, a top-10,000 password list is exhausted in under 15 minutes.

There is no Cognito Advanced Security feature mentioned, no CAPTCHA on login, and no step-up challenge after N failures per account.

**Consequence:** A fan's account is vulnerable to distributed password spray/brute force attacks. Common or weak passwords (which pass the format validator but are dictionary entries) will be compromised.

---

### SEC-BRUTE-02 — HIGH: Failed authentication events are not logged — brute force is invisible

**Location:** `database-schema.md` — AuditLog Entries table; `test-scenarios.md` — IT-01-11

**Finding:** The audit log captures `FAN_LOGIN` on successful login. Failed login attempts produce no audit log entry. IT-01-11 explicitly verifies "No audit log entry" on wrong password.

This design decision makes active brute force and credential stuffing attacks entirely invisible in the audit logs. There is no way to:
- Detect that an account received 10,000 failed login attempts
- Alert on suspicious login failure patterns
- Produce evidence for a POPIA breach notification investigation

**Consequence:** The platform is blind to the most common account compromise attack vectors. Brute force attacks will succeed without triggering any alert or leaving any evidence.

---

### SEC-BRUTE-03 — MEDIUM: Registration has no bot protection

**Location:** `api-contracts.md` — POST /auth/register, Rate Limiting table (5/15 min per IP)

**Finding:** The registration endpoint has a rate limit of 5 requests per 15 minutes per IP with no CAPTCHA or proof-of-work requirement. This is insufficient to prevent:

- Mass account creation for spam or credential abuse
- Registration flooding to occupy all popular email addresses
- Synthetic account creation for leaderboard manipulation

**Consequence:** Automated bulk registration is feasible. This affects platform integrity (fake accounts on leaderboards) and is a precursor to abuse at every layer of the system.

---

### SEC-BRUTE-04 — LOW: Password policy is enforced in two places that can diverge

**Location:** `api-contracts.md` — POST /auth/register request body (8–72 chars, complexity rules); `domain-model.md` — Value Objects: Password validation

**Finding:** Password complexity requirements are validated by the application layer. Cognito User Pool also has its own password policy configuration. If Cognito's configured policy is less strict than the application's policy (e.g., Cognito defaults to minimum 8 characters, no complexity requirement), a password rejected by the application could theoretically be accepted by Cognito directly if ever reached through another path.

More likely: if the Cognito policy is misconfigured to be stricter than the application policy, users are presented with a vague Cognito error rather than the application's structured `VALIDATION_ERROR` response.

**Consequence:** Policy divergence creates inconsistent enforcement and confusing user errors.

---

## 7. Audit Logging

### SEC-AUDIT-01 — HIGH: Audit log is non-transactional — POPIA compliance evidence can be silently lost

**Location:** `database-schema.md` — AuditLog Entries section ("not in a transaction — best-effort, separate write")

**Finding:** The audit log write is explicitly designed as best-effort and not transactional. This is a deliberate choice to prevent audit log failures from blocking domain operations. However, the consequence is that audit log entries may be silently dropped under any of these conditions:

- DB connection pool exhaustion
- Transient DB error after the domain transaction commits
- Application crash between the domain commit and the audit write
- Network partition between the application and RDS

For a POPIA-regulated platform, the audit log is evidence. "Evidence recorded on a best-effort basis" is not evidence. If PSL One is required to demonstrate to the Information Regulator that it can account for all access to personal data (POPIA Section 55 accountability principle), a best-effort audit log fails this requirement.

**Consequence:** POPIA accountability principle cannot be fully satisfied with a best-effort audit log. In an incident investigation, gaps in the audit log cannot be distinguished from "this event did not happen."

---

### SEC-AUDIT-02 — HIGH: Audit log has no immutability protection

**Location:** `database-schema.md` — AuditLog Entries section vs. consent_records RULE definitions

**Finding:** The `consent_records` table has PostgreSQL RULE-based immutability enforcement. The `audit.audit_log` table has no such protection. A database administrator with write access can UPDATE or DELETE audit log entries without any application or database-level barrier.

The design explicitly enforces immutability on consent records and financial transactions (wallet ledger in STORY-09) but applies no equivalent protection to the audit log.

**Consequence:** The audit log can be tampered with by anyone with database access. In a POPIA investigation or breach inquiry, an audit trail that can be modified by insiders has limited evidential value. This is particularly significant given the platform stores sensitive personal data.

---

### SEC-AUDIT-03 — MEDIUM: Failed authentication events are not logged

(Cross-reference: SEC-BRUTE-02)

**Location:** `database-schema.md` — AuditLog entries; `test-scenarios.md` — IT-01-11

**Finding:** The design explicitly verifies that failed login attempts produce no audit log entry (IT-01-11: "No audit log entry"). This is the correct behaviour for the domain's success-only audit perspective, but it means there is no security-oriented event log.

The audit log conflates two concerns: POPIA accountability logging (data access, consent changes) and security event logging (authentication failures, anomalous activity). Neither function is served well: POPIA logging is incomplete (see SEC-AUDIT-01, SEC-AUDIT-02) and security event logging doesn't exist.

**Consequence:** No detection capability for credential stuffing, brute force, or account takeover attempts.

---

### SEC-AUDIT-04 — MEDIUM: `GET /auth/me` is not logged

**Location:** `database-schema.md` — AuditLog entries table; `api-contracts.md` — GET /auth/me

**Finding:** `GET /api/v1/auth/me` returns `fanId`, `email`, `displayName`, and `registeredAt`. The design logs `DATA_ACCESS` only for `GET /api/v1/me/data`. `GET /auth/me` is not in the audit log trigger list. Under POPIA's accountability principle, access to personal data should be loggable regardless of the endpoint path.

**Consequence:** Legitimate and illegitimate access to fan personal data via `GET /auth/me` leaves no audit trail.

---

### SEC-AUDIT-05 — LOW: `changes` field is NULL for all creation events

**Location:** `database-schema.md` — AuditLog row shape example (`changes: NULL`)

**Finding:** For `FAN_REGISTERED` events, `changes` is NULL. A complete audit record for entity creation should include the initial state of the created entity (sanitised — no passwords). Without it, the audit log shows that a fan registered but not what data was captured at registration. If a POPIA data subject access request disputes the accuracy of their registration data, the audit log cannot confirm the original state.

**Consequence:** Incomplete audit records for creation events limit forensic and compliance reconstruction capability.

---

## 8. Account Recovery

### SEC-RECOVERY-01 — HIGH: No account recovery path exists for Sprint 1

**Location:** `README.md` — Out of scope: "Password reset"; `domain-model.md` — TokenService (mentions `respondToAuthChallenge` as "future: MFA, new password")

**Finding:** Password reset is explicitly deferred to Sprint 2. This means:

- A fan who forgets their password after registering has no recovery path.
- A fan whose password is compromised and changed by an attacker has no recovery path.
- A fan who registers with a typo in their email has no recovery path (typo occupies the email slot; correct email is unavailable; password reset requires email access).

The platform will onboard real users in Sprint 1 (the sprint goal is user validation). Users who cannot recover their accounts will contact support. Support has no tooling to help them. These fans are permanently locked out.

**Consequence:** Support burden from Day 1. Users permanently locked out of their accounts with no remediation path. Risk that locked-out fans — if influential — become vocal critics before the platform has proven itself.

---

### SEC-RECOVERY-02 — HIGH: No resend verification email mechanism

**Location:** `domain-model.md` — Fan lifecycle; `api-contracts.md` (no resend endpoint defined)

**Finding:** Cognito sends a verification email on `adminCreateUser`. If this email is not received (spam filter, temporary mailbox issue, transient delivery failure), the fan is permanently unable to verify their account. No API endpoint exists to request a resend. No timeframe is defined after which the verification link expires.

**Consequence:** Fans with deliverability issues are permanently unverifiable. Combined with SEC-COGNITO-06 (no zombie account cleanup), these fans permanently occupy their email address.

---

### SEC-RECOVERY-03 — INFO: Support has no admin tooling for account issues

**Location:** Entire STORY-01 design

**Finding:** The design defines no admin-accessible endpoints for account recovery operations: no resend verification, no forced password reset, no account unlocking, no email correction. Customer support agents have no tools to help fans who cannot log in.

This is not a security vulnerability in the narrow sense, but it is a security operations gap. Support staff handling account issues without tooling will resort to direct database operations, which bypasses all audit controls.

---

## 9. Under-18 Registration Handling

### SEC-MINOR-01 — CRITICAL: Age gate is application-layer only — has no database enforcement

**Location:** `domain-model.md` — INV-01 ("Enforced by: Application + API validation"); `database-schema.md` — `identity.fans` DDL (no CHECK on `date_of_birth`)

**Finding:** INV-01 states the 18+ requirement is enforced by "Application (age check before Cognito call) + API validation." The `identity.fans` table has no `CHECK` constraint on `date_of_birth`. An under-18 record can be inserted by:

- A direct database INSERT by a developer or DBA
- An admin API endpoint that bypasses the registration flow
- A future migration or data import script
- A bug in the application layer

POPIA Section 35 is the highest-risk provision in the entire Act in terms of penalty exposure. Under-18 data processing without guardian consent is a serious legal violation. The enforcement mechanism for the most legally critical rule in the system is entirely at the application layer with no backup.

**Consequence:** POPIA Section 35 violation. Illegal processing of a minor's personal data is possible through any path that bypasses the application layer. Regulatory penalties under POPIA can reach R10 million or 10 years imprisonment.

---

### SEC-MINOR-02 — HIGH: Self-declaration of age provides no actual age verification

**Location:** `domain-model.md` — INV-01; `api-contracts.md` — register request body `dateOfBirth`

**Finding:** The age gate accepts a date of birth field in a registration form. There is no mechanism to verify the stated date of birth is accurate. A 14-year-old can enter `2008-01-01` (making themselves appear 18) and pass all validation checks.

POPIA Section 35 does not accept "we asked them and they said they were 18" as a defence for processing a minor's personal data without guardian consent. The standard required is taking "reasonable measures" to verify age.

Self-declaration of age is the minimum viable approach, but the design does not acknowledge its limitation or document it as a known risk that requires mitigation (e.g., a legal disclaimer, a terms clause, a reporting mechanism for discovered minors).

**Consequence:** POPIA Section 35 liability exists regardless of the gate's existence if the age gate is trivially circumventable.

---

### SEC-MINOR-03 — HIGH: No process for post-registration discovery of a minor

**Location:** Entire STORY-01 design

**Finding:** If it is discovered after registration that a fan is under 18 — through a guardian complaint, a support disclosure, or a suspicious registration pattern — there is no defined process in the design:

- No flag for age-disputed accounts
- No account suspension mechanism
- No admin endpoint to quarantine the account
- No notification workflow to the guardian
- No POPIA incident reporting procedure for unlawful minor processing

**Consequence:** A discovered minor's account cannot be acted upon through any designed mechanism. Manual DB operations would be required, bypassing all audit controls.

---

### SEC-MINOR-04 — MEDIUM: `dateOfBirth` is retained after account anonymisation

(Cross-reference with SEC-POPIA-03)

**Location:** `database-schema.md` — Data Lifecycle table

**Finding:** `date_of_birth` is not cleared on POPIA erasure. If a minor successfully registered (via SEC-MINOR-02) and later requests erasure, their date of birth — which proves they were underage — is retained indefinitely. This creates a forensic evidence risk: the retained data demonstrates the platform processed a minor's information, but the platform may no longer be able to demonstrate the proper response was taken.

**Consequence:** Retained minor DOB post-erasure complicates POPIA audit defence.

---

## 10. Data Deletion Requests

### SEC-DELETE-01 — HIGH: Anonymisation replacement email contains the fan's UUID

**Location:** `database-schema.md` — Data Lifecycle table ("email = `deleted-{id}@pslone.co.za`")

**Finding:** The anonymisation approach uses `deleted-{id}@pslone.co.za` where `{id}` is `Fan.id` (the fan's UUID). This means anyone with read access to the `identity.fans` table can determine:
1. That the fan associated with a specific UUID deleted their account.
2. The UUID of any deleted fan (directly from the placeholder email).

The fan's UUID persists as a foreign key throughout the platform (`gts.predictions`, `loyalty.loyalty_accounts`, etc.). The placeholder email pattern actively links the anonymised identity record back to all that historical data. This is a re-identification vector.

**Consequence:** The anonymisation approach is not full de-identification — it preserves the link between a "deleted" identity and all platform activity under that UUID.

---

### SEC-DELETE-02 — HIGH: Cross-domain deletion is entirely unaddressed

**Location:** `database-schema.md` — Data Lifecycle table; `domain-model.md` — Aggregate Boundaries

**Finding:** The erasure process modifies `identity.fans`. It does not address:

- `fan.profiles` — FanProfile records in the fan schema
- `gts.predictions` — all predictions with `fan_id` and `display_name` references
- `loyalty.loyalty_accounts` and `loyalty.points_transactions` — financial ledger with `fan_id`
- `outbox.outbox_events` — historical events containing `email`, `displayName`, `fanId` in the payload JSON

The `identity.fan.registered` event payload (stored in `outbox.outbox_events.payload` as JSONB) contains `email` and `displayName`. These values persist in the outbox table indefinitely after account erasure. The outbox table has no defined data retention or purge policy.

There is no `identity.fan.deleted` OutboxEvent defined in the domain events, which means no downstream module receives a deletion signal.

**Consequence:** POPIA right of erasure cannot be fully honoured. Fan PII persists in at least 4 database schemas and the outbox event log after "anonymisation" of the identity record.

---

### SEC-DELETE-03 — HIGH: No cooling-off period or confirmation step for account deletion

**Location:** `api-contracts.md` — POPIA endpoints section (`DELETE /api/v1/me/account`)

**Finding:** The design specifies `DELETE /api/v1/me/account` as a direct anonymisation call. There is no confirmation step (e.g., confirmation email, re-authentication requirement, confirmation code), no cooling-off period, and no undo mechanism.

A fan who accidentally calls this endpoint (e.g., a UI bug, a misclick, a malicious link that makes a cross-site request), or whose access token is compromised, loses access to their account immediately and irreversibly.

**Consequence:** Irreversible account destruction without confirmation. Account takeover via compromised access token leads to immediate, permanent loss of fan account data.

---

### SEC-DELETE-04 — MEDIUM: Audit trail is self-referentially compromised by the deletion

**Location:** `database-schema.md` — AuditLog Entries table (`ACCOUNT_ANONYMISED` entry)

**Finding:** The `ACCOUNT_ANONYMISED` audit log entry stores `fan_id` as `resource_id`. After anonymisation, the fan record in `identity.fans` is modified (email/name replaced with placeholders). The audit log entry's `fan_id` now references an anonymised record. A compliance investigator reviewing the audit log cannot reconstruct the original identity of the deleted fan from the audit log alone.

For POPIA accountability purposes, the platform must be able to demonstrate it received and honoured a deletion request. If the audit record cannot be linked to a specific individual, this demonstration is incomplete.

**Consequence:** The audit log for deletion requests fails to serve its evidential purpose post-anonymisation.

---

## Summary Risk Register

| ID | Area | Severity | Short Description |
|---|---|---|---|
| SEC-COGNITO-01 | Cognito | **CRITICAL** | `custom:pslFanId` not in access tokens by default — auth guard broken |
| SEC-MINOR-01 | Under-18 | **CRITICAL** | Age gate has no DB constraint — bypassed by any non-API insert |
| SEC-POPIA-01 | POPIA | **CRITICAL** | IP collection at consent has no disclosed legal basis |
| SEC-COGNITO-04 | Cognito | **HIGH** | `adminCreateUser` creates FORCE_CHANGE_PASSWORD state — login broken |
| SEC-COGNITO-02 | Cognito | **HIGH** | Plaintext password transits through NestJS backend |
| SEC-COGNITO-03 | Cognito | **HIGH** | Compensating adminDeleteUser failure is silent and unmonitored |
| SEC-COGNITO-05 | Cognito | **HIGH** | Fan not added to FAN Cognito group — RBAC unenforced or all fans locked out |
| SEC-ENUM-01 | Enumeration | **HIGH** | `EMAIL_NOT_VERIFIED` 403 confirms account existence — enumeration vector |
| SEC-ENUM-02 | Enumeration | **HIGH** | `EMAIL_EXISTS` 409 on registration is a direct enumeration vector |
| SEC-BRUTE-01 | Brute force | **HIGH** | No per-account rate limiting — distributed brute force unmitigated |
| SEC-BRUTE-02 | Brute force | **HIGH** | Failed auth events not logged — attacks are invisible |
| SEC-AUDIT-01 | Audit | **HIGH** | Audit log is best-effort, non-transactional — POPIA evidence unreliable |
| SEC-AUDIT-02 | Audit | **HIGH** | Audit log has no immutability protection — tamperable by DB admin |
| SEC-RECOVERY-01 | Recovery | **HIGH** | No password reset path in Sprint 1 — users permanently locked out |
| SEC-RECOVERY-02 | Recovery | **HIGH** | No resend verification email — unverifiable accounts are permanent |
| SEC-MINOR-02 | Under-18 | **HIGH** | Self-declaration is not age verification — trivially circumvented |
| SEC-MINOR-03 | Under-18 | **HIGH** | No process for post-registration discovery of a minor |
| SEC-DELETE-01 | Deletion | **HIGH** | Anonymisation placeholder email contains fan UUID — re-identification possible |
| SEC-DELETE-02 | Deletion | **HIGH** | Cross-domain deletion not designed — PII persists in 4+ schemas post-erasure |
| SEC-DELETE-03 | Deletion | **HIGH** | No confirmation or cooling-off for account deletion — irreversible on misclick |
| SEC-JWT-02 | JWT | **HIGH** | `email_verified` check is not tested in any acceptance criterion |
| SEC-POPIA-02 | POPIA | **HIGH** | `consentAnalytics` has no defined purpose — invalid consent |
| SEC-POPIA-03 | POPIA | **HIGH** | `dateOfBirth` not cleared on erasure |
| SEC-COOKIE-01 | Cookies | **HIGH** | Cookie Max-Age not aligned to Cognito refresh token validity |
| SEC-POPIA-04 | POPIA | **MEDIUM** | ConsentRecord PII retained post-erasure with no time limit |
| SEC-POPIA-05 | POPIA | **MEDIUM** | `consentTerms` bundles Terms and Privacy Policy — consent may be invalid |
| SEC-COOKIE-02 | Cookies | **MEDIUM** | `Secure` flag dropped in dev — refresh tokens over HTTP |
| SEC-COOKIE-03 | Cookies | **MEDIUM** | Refresh token replay after theft not detected or reported to fan |
| SEC-JWT-03 | JWT | **MEDIUM** | `email` in every token — PII broadcast to all services |
| SEC-JWT-04 | JWT | **MEDIUM** | No `jti` — access token revocation impossible |
| SEC-ENUM-03 | Enumeration | **MEDIUM** | Response timing may distinguish known/unknown emails |
| SEC-BRUTE-03 | Brute force | **MEDIUM** | No bot protection on registration |
| SEC-AUDIT-03 | Audit | **MEDIUM** | No security event log for failed auth |
| SEC-AUDIT-04 | Audit | **MEDIUM** | `GET /auth/me` accesses PII but is not logged |
| SEC-MINOR-04 | Under-18 | **MEDIUM** | `dateOfBirth` retained post-erasure proves underage processing |
| SEC-DELETE-04 | Deletion | **MEDIUM** | Deletion audit record self-referentially broken post-anonymisation |
| SEC-COGNITO-06 | Cognito | **LOW** | Unverified accounts accumulate indefinitely — no cleanup |
| SEC-BRUTE-04 | Brute force | **LOW** | Password policy can diverge between app and Cognito config |
| SEC-AUDIT-05 | Audit | **LOW** | `changes` NULL for creation events — incomplete audit records |
| SEC-COOKIE-04 | Cookies | **LOW** | Missing `__Host-` cookie prefix |
| SEC-POPIA-06 | POPIA | **LOW** | RDS backup retention not disclosed in Privacy Policy |
| SEC-RECOVERY-03 | Recovery | **INFO** | No admin tooling for account recovery — support will use direct DB |
| SEC-JWT-01 | JWT | **INFO** | Duplicate of SEC-COGNITO-01 — see above |

---

## Findings Requiring Pre-Build Resolution

The following CRITICAL findings will cause the system to be non-functional or in immediate legal violation on Day 1. These must be resolved in the design before any code is generated:

1. **SEC-COGNITO-01** — The Pre-Token-Generation Lambda trigger must be designed and included in the Cognito setup.
2. **SEC-COGNITO-04** — The `adminSetUserPassword(Permanent: true)` step must be added to the registration flow.
3. **SEC-COGNITO-05** — `adminAddUserToGroup("FAN")` must be added to the registration flow.
4. **SEC-MINOR-01** — A DB-level CHECK constraint on `date_of_birth` must be added.
5. **SEC-POPIA-01** — The legal basis for processing `ip_address` and `user_agent` at consent capture must be documented.

The HIGH findings collectively represent unacceptable risk for a platform handling personal data under POPIA. They should be addressed in the revised design before Sprint 1 code is written.
