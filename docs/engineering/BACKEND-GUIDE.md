# PSL One — Backend Engineering Guide

**Purpose:** NestJS patterns, conventions, and rules for API development  
**Audience:** Backend engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Project Structure

```
apps/api/
  src/
    <domain>/
      <domain>.module.ts       # NestJS @Module
      <domain>.service.ts      # Business logic
      <domain>.service.spec.ts # Tests
      <domain>.controller.ts   # Route handlers
      dto/
        create-<entity>.dto.ts
        update-<entity>.dto.ts
    app.module.ts              # Root module — all domain modules registered here
    main.ts                    # Bootstrap
  prisma/
    schema.prisma              # Database schema
    seed.ts                    # Seed data
    migrations/                # Migration files
```

---

## Module Pattern

Every bounded context follows this structure:

```typescript
// domain.module.ts
@Module({
  imports: [PrismaModule],       // always
  providers: [DomainService],
  controllers: [DomainController],
  exports: [DomainService],      // only if other modules need it
})
export class DomainModule {}
```

Register the module in `app.module.ts`.

---

## Service Pattern

```typescript
@Injectable()
export class DomainService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Domain[]> {
    return this.prisma.domain.findMany({ where: { userId } });
  }

  async create(userId: string, dto: CreateDomainDto): Promise<Domain> {
    await this.writeAdminAuditLog(userId, 'CREATE_DOMAIN', dto); // admin mutations only
    return this.prisma.domain.create({ data: { userId, ...dto } });
  }
}
```

---

## Controller Pattern

```typescript
@Controller('domain')
@UseGuards(JwtAuthGuard)
export class DomainController {
  constructor(private readonly service: DomainService) {}

  @Get()
  findAll(@Req() req: Request) {
    return this.service.findAll(req.user.id);
  }
}

// Admin sub-controller
@Controller('admin/domain')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class AdminDomainController {
  constructor(private readonly service: DomainService) {}

  @Post(':id/settle')
  settle(@Param('id') id: string, @Req() req: Request) {
    return this.service.adminSettle(id, req.user.id);
  }
}
```

---

## DTO Pattern

```typescript
// create-domain.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateDomainDto {
  @IsString()
  name: string;

  @IsNumber()
  value: number;

  @IsString()
  @IsOptional()
  description?: string;
}
```

`ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` is applied globally.

---

## Auth Guards

```typescript
// Fan route
@UseGuards(JwtAuthGuard)

// Admin route
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
```

**Never bypass RBAC.** No `if (isDev)` holes, no `skipAuth` flags.

---

## Admin Audit Log

Every admin mutation must write an `AdminAuditLog`:

```typescript
await this.prisma.adminAuditLog.create({
  data: {
    userId: adminUserId,
    action: 'SETTLE_PREDICTION',
    targetModel: 'Prediction',
    targetId: predictionId,
    payload: JSON.stringify({ result }),
    performedAt: new Date(),
  },
});
```

Actor `userId` always comes from the JWT (`req.user.id`), never from the request body.

---

## Prisma Usage

- Inject `PrismaService` directly — no repository pattern or abstraction layer
- Use transactions for multi-table writes: `prisma.$transaction([...])`
- Use `findFirst` (not `findUnique`) for `Player` by `externalId` — it is non-unique
- Never use raw SQL (`$queryRaw`) unless absolutely necessary and type-safe

---

## Season Context

To resolve the active season:

```typescript
const season = await this.prisma.season.findFirst({
  where: { isActive: true },
});
if (!season) throw new NotFoundException('No active season');
```

For explicit season override (historical data):

```typescript
const seasonId = querySeasonId ?? season.id;
```

---

## Dry Run Pattern

Operations that describe what *would* happen carry these fields:

```typescript
return {
  dryRunOnly: true,
  activationWillNotBePerformed: true,
  checks: [...],
};
```

Never perform writes in dry-run mode. Check for `dryRun` param before any mutation.

---

## Testing Rules

- **Always write tests** — explicit project rule
- Every new service method needs at least one test
- Mock `PrismaService` — never use a real database in unit tests
- Use `@nestjs/testing` `TestingModule` setup
- See [Testing Guide](TESTING-GUIDE.md) for full patterns

---

## Error Handling

Throw NestJS built-in exceptions:

```typescript
throw new NotFoundException('Fixture not found');
throw new BadRequestException('Fantasy window is closed');
throw new ForbiddenException('Insufficient permissions');
throw new ConflictException('Challenge already accepted');
```

These map automatically to HTTP status codes. Do not use `throw new Error()` for HTTP responses.

---

## Kafka Note

Kafka is in `docker-compose.yml` but not wired into the application. The project rule says **always publish Kafka events** — this will be implemented in Sprint 3. For now, side effects are direct synchronous calls.
