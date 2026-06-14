# PSL One — Story Implementation Workflow

## Step 1: Understand the scope

Before writing anything:
- Identify the bounded context (which NestJS module)
- Identify whether the schema changes (requires migration)
- Identify whether new reference data is needed (requires seed update)
- Check if an ADR is required (new module, external integration, security boundary, non-trivial schema)

## Step 2: Create the migration (if schema changes needed)

```bash
cd apps/api
pnpm --filter @psl-one/api prisma migrate dev --name <descriptive_name>
```

Rules:
- Migrations must be additive (no DROP COLUMN on populated tables)
- New required columns must have a DEFAULT or be nullable initially
- Use `IF NOT EXISTS` in index creation
- Add indexes for new query patterns on high-volume tables
- Validate after writing: `pnpm --filter @psl-one/api prisma validate`

Migration filename pattern: `YYYYMMDD000001_<descriptive_name>/migration.sql`

## Step 3: Update seed.ts (if reference data needed)

All seed entries use idempotent `upsert` patterns:

```typescript
await prisma.myModel.upsert({
  where: { uniqueField: value },
  update: {},
  create: { uniqueField: value, ...otherFields },
});
```

Verify seed idempotency by running it twice:
```bash
pnpm --filter @psl-one/api db:seed
pnpm --filter @psl-one/api db:seed
```

## Step 4: Create the service

File: `apps/api/src/<domain>/<domain>.service.ts`

Pattern:
```typescript
@Injectable()
export class MyDomainService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(seasonId: number): Promise<MyModel[]> {
    return this.prisma.myModel.findMany({
      where: { seasonId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
```

Rules:
- Inject only `PrismaService` and services from the same module (or explicitly imported modules)
- Throw `NotFoundException` / `BadRequestException` / `ConflictException` — not raw `Error`
- All admin mutations accept `adminUserId: string` and write audit log

## Step 5: Create the service tests

File: `apps/api/src/<domain>/<domain>.service.spec.ts`

```typescript
describe('MyDomainService', () => {
  let service: MyDomainService;
  let prisma: { myModel: { findMany: jest.Mock; create: jest.Mock } };

  beforeEach(async () => {
    prisma = { myModel: { findMany: jest.fn(), create: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [
        MyDomainService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(MyDomainService);
  });

  it('should return all records for a season', async () => {
    prisma.myModel.findMany.mockResolvedValue([{ id: 1 }]);
    const result = await service.findAll(1);
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException when record missing', async () => {
    prisma.myModel.findMany.mockResolvedValue([]);
    // test the throw
  });
});
```

Minimum: one happy path + one error path per public method.

## Step 6: Create the controller

File: `apps/api/src/<domain>/<domain>.controller.ts`

Admin controller pattern:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
@Controller('admin/<domain>')
export class MyDomainAdminController {
  constructor(private readonly service: MyDomainService) {}

  @Post()
  create(@CurrentUser() user: TokenPayload, @Body() dto: CreateDto) {
    return this.service.create(user.sub, dto);
  }
}
```

Fan controller pattern:
```typescript
@UseGuards(JwtAuthGuard)
@Controller('<domain>')
export class MyDomainController {
  @Get()
  findAll(@CurrentUser() user: TokenPayload, @Query('seasonId') seasonId: string) {
    return this.service.findAll(user.sub, parseInt(seasonId));
  }
}
```

## Step 7: Create DTOs

File: `apps/api/src/<domain>/dto/<action>.dto.ts`

```typescript
import { IsString, IsOptional, IsISO8601, IsInt, Min } from 'class-validator';

export class CreateMyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;

  @IsInt()
  @Min(1)
  seasonId: number;
}
```

Rules:
- Date fields: `@IsISO8601()`, not `@IsString()`
- Optional fields: `@IsOptional()` before the type decorator
- Integer fields: `@IsInt()` + `@Min(1)` for IDs

## Step 8: Register the module

File: `apps/api/src/app.module.ts`

```typescript
imports: [
  // ...existing modules...
  MyDomainModule,
]
```

Module file: `apps/api/src/<domain>/<domain>.module.ts`

```typescript
@Module({
  imports: [PrismaModule, AuthModule],
  providers: [MyDomainService],
  controllers: [MyDomainController, MyDomainAdminController],
})
export class MyDomainModule {}
```

## Step 9: Create web client functions

File: `apps/web/src/lib/<domain>-client.ts`

```typescript
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function getMyDomainItems(seasonId: number): Promise<MyItem[]> {
  const token = getBetaToken();
  const res = await fetch(`${API}/<domain>?seasonId=${seasonId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

Rules:
- No business logic — HTTP call and return only
- Use `getBetaToken()` from `apps/web/src/lib/auth.ts`
- Throw on non-OK responses

## Step 10: Create web pages

Fan pages: `apps/web/src/app/(fan)/<domain>/page.tsx`  
Admin pages: `apps/web/src/app/admin/<domain>/page.tsx`

```typescript
export default async function MyPage() {
  const items = await getMyDomainItems(1);
  return (
    <main>
      <h1>My Domain</h1>
      {items.map(item => <div key={item.id}>{item.name}</div>)}
    </main>
  );
}
```

## Step 11: Write any required ADR

If the story introduces:
- A new module or significant architectural pattern → ADR required
- An external provider integration → ADR required
- A change to a security boundary → ADR required
- A non-trivial schema design choice → ADR required

ADR format: copy from `docs/adr/ADR-001.md`; number sequentially (next: ADR-028).
Link in `docs/adr/README.md`.

## Step 12: Update documentation

- `docs/reference/API-ROUTES.md` — new routes
- `docs/reference/DATABASE-MODELS.md` — new models
- `docs/reference/MIGRATIONS.md` — new migration
- `docs/project/CURRENT-STATE.md` — updated counts
- Domain-specific doc in `docs/domain/` if concept is new

## Step 13: Run the acceptance gate

```bash
pnpm --filter @psl-one/api db:seed         # first seed run
pnpm --filter @psl-one/api db:seed         # second seed run — confirms idempotency
pnpm --filter @psl-one/api prisma validate # valid schema
pnpm --filter @psl-one/api typecheck       # zero type errors
pnpm --filter @psl-one/api test            # all tests pass; count increases
pnpm --filter @psl-one/api build           # clean build
pnpm --filter @psl-one/web typecheck       # zero type errors
pnpm --filter @psl-one/web test            # all web tests pass
pnpm --filter @psl-one/web build           # clean build
```

All nine must pass. Zero tolerance for type errors or test failures.

## Step 14: Verify seed idempotency

```bash
pnpm --filter @psl-one/api db:seed
pnpm --filter @psl-one/api db:seed
```

Second run must complete with no errors.

## After the gate passes

Do NOT commit. Report the gate results and wait for "commit this" instruction.
