# PSL One — Coding Standards

**Purpose:** Code style, naming conventions, and quality rules  
**Audience:** All engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## General Principles

- Code for the reader, not the writer
- Prefer explicit over implicit
- No business logic in frontend
- Always write tests
- Use domain boundaries — no cross-module table access
- Scale to 2 million fans — avoid N+1 queries, avoid full-table scans

---

## TypeScript

- Strict mode enabled — both API and web
- `exactOptionalPropertyTypes: true` on web — use spread pattern, not `undefined` assignment
- `noImplicitAny: true` — no untyped values
- Avoid `any` — use `unknown` and narrow with type guards
- Avoid type assertions (`as X`) unless narrowing from `unknown`
- Always type function return values for public methods

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `beta-launch.service.ts` |
| Classes | PascalCase | `BetaLaunchService` |
| Interfaces | PascalCase | `WalletAdapter` |
| Methods / functions | camelCase | `adminGetReadiness()` |
| Variables | camelCase | `activeSeasonId` |
| Constants | UPPER_SNAKE_CASE | `ACTIVATION_DISABLED_NOTICE` |
| Prisma models | PascalCase | `SeasonActivationApproval` |
| DB table names | snake_case (via `@@map`) | `season_activation_approvals` |
| Enum values | UPPER_SNAKE_CASE | `POINTS_COMMITTED` |
| Route paths | kebab-case | `/admin/beta-launch/:id/readiness` |
| DTO classes | PascalCase + suffix | `CreateBetaCohortDto` |
| Test files | co-located `.spec.ts` | `beta-launch.service.spec.ts` |

---

## File Organisation

- One module per directory
- Controller, service, DTOs, and spec file in same directory
- No barrel index files (`index.ts`) — import by full path
- Client functions grouped by domain: `apps/web/src/lib/<domain>-client.ts`

---

## Comments

Write no comments unless the WHY is non-obvious — a hidden constraint, a subtle invariant, a workaround for a specific bug.

Do not comment WHAT the code does. Well-named identifiers do that. Do not reference the current task or PR in comments.

---

## NestJS Patterns

- `@Injectable()` on every service
- `@Controller('route')` on every controller
- `@UseGuards(JwtAuthGuard)` on every non-public controller
- `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('PSL_ADMIN')` on every admin controller
- Extract admin controller into separate class — do not mix fan and admin routes in one controller

---

## Prisma Patterns

- `PrismaService` injected directly — no repository abstraction
- Never use `$queryRaw` without explicit need and type annotation
- Always `$transaction` for multi-table atomic writes
- Never update or delete from immutable ledger tables (`PredictionPointsLedger`, `SocialPredictionPointsEntry`, `AdminAuditLog`)
- Use `upsert` in seed file — never plain `create` for reference data

---

## Error Handling

- Use NestJS HTTP exceptions for all API errors: `NotFoundException`, `BadRequestException`, `ConflictException`, `ForbiddenException`
- Never throw `new Error()` for HTTP responses
- Services throw exceptions; controllers do not catch them (let NestJS filter handle)
- Do not add error handling for internal invariants that can't fail

---

## Tests

- Always use `vi.clearAllMocks()` in `beforeEach`
- Never share mock state between tests
- Test file lives next to the source file
- Use `getBetaToken()` from `auth/test-helpers` — never manually craft tokens

---

## Not Allowed

- `console.log` in production code
- `debugger` statements
- TODO comments (resolve inline or track in Linear)
- Hardcoded user IDs or emails in application code (seed file excluded)
- `process.exit()` in module code
- `// @ts-ignore` or `// @ts-expect-error` without a documented reason
- Secrets in code files
