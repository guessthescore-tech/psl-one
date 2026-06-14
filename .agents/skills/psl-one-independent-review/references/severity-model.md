# PSL One — Review Severity Model

## Severity Levels

### CRITICAL — Must fix before merge; automatic FAIL

A critical finding represents a security vulnerability, data integrity risk, or safety invariant violation that could:
- Allow unauthorised access to admin functionality
- Expose or corrupt user data
- Trigger real-money movement in a system that must remain points-only
- Activate the PSL season without product approval
- Allow SQL injection, XSS, or CSRF attacks

**Examples:**
- Admin route missing `JwtAuthGuard` or `RolesGuard`
- Password reset raw token written to logs
- `$queryRaw` using string concatenation instead of tagged template
- Real-money path added to wallet module
- PSL season activation endpoint added without ADR approval
- Secret or credential committed to source

### HIGH — Must fix before merge; automatic FAIL

A high-severity finding represents a serious quality, correctness, or architectural violation that:
- Bypasses the audit log for an admin mutation
- Stores business logic in the frontend
- Crosses domain boundaries via direct Prisma access in another module's tables
- Introduces unbounded queries on a high-volume table (N+1, no `take` limit)
- Adds a service method with no corresponding test

**Examples:**
- Admin `POST` handler with no `adminAuditLog.create()` call
- `apps/web/src/lib/` file performing business logic computation
- `UserModule` querying `fantasy_team` table directly
- `findMany()` with no `take` in a production code path
- New `createFanTeam()` method with no test case

### MEDIUM — Should fix before merge; results in PASS WITH COMMENTS

A medium-severity finding represents a correctness or quality issue that doesn't block functionality but degrades maintainability, security posture, or scalability:
- Missing error path test (only happy path tested)
- DTO field using `@IsString()` for a date field instead of `@IsISO8601()`
- In-memory sort on a potentially large (>100 records) dataset
- Missing index for a new query pattern on a high-volume table

### LOW — Nice to fix; results in PASS WITH COMMENTS

A low-severity finding is a style, documentation, or minor quality issue:
- Missing `@IsOptional()` on a DTO field that defaults to optional
- Documentation not updated for a new route
- Test assertion checks mock call count but not return value

### INFORMATIONAL — Noted; no impact on verdict

An informational finding is a positive observation, a suggestion for future improvement, or a question about intent:
- "This pagination pattern is correct and consistent with the rest of the codebase"
- "Consider extracting this logic into a shared helper once it appears in a second place"
- "Why was X chosen over Y? Both would be correct; just curious about the intent."

---

## Verdict Rules

| Findings present | Verdict |
|-----------------|---------|
| Any CRITICAL | FAIL |
| Any HIGH | FAIL |
| MEDIUM or LOW only | PASS WITH COMMENTS |
| None (or INFORMATIONAL only) | PASS |

A reviewer may never upgrade a FAIL to a PASS by "accepting the risk." CRITICAL and HIGH findings require a code change before the verdict changes.
