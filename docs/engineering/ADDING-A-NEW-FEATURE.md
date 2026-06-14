# PSL One — Adding a New Feature

**Purpose:** Step-by-step guide for adding a new bounded context  
**Audience:** Backend and frontend engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Overview

Adding a new feature in PSL One means:

1. Schema change + migration
2. New NestJS module (service + controller + DTOs + tests)
3. Register module in `AppModule`
4. New Next.js pages with client functions
5. Seed updates if needed

---

## Step 1: Schema Change

Edit `apps/api/prisma/schema.prisma`:

```prisma
model NewEntity {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  name      String
  status    String   @default("PENDING")
  user      User     @relation(fields: [userId], references: [id])

  @@map("new_entities")
}
```

Run migration:

```bash
pnpm --filter @psl-one/api db:migrate
# Enter name when prompted: add_new_entity
```

---

## Step 2: Create the Module

Create directory `apps/api/src/new-feature/`.

### Module

```typescript
// new-feature.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NewFeatureService } from './new-feature.service';
import { NewFeatureController } from './new-feature.controller';
import { AdminNewFeatureController } from './admin-new-feature.controller';

@Module({
  imports: [PrismaModule],
  providers: [NewFeatureService],
  controllers: [NewFeatureController, AdminNewFeatureController],
  exports: [NewFeatureService],
})
export class NewFeatureModule {}
```

### Service

```typescript
// new-feature.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewFeatureService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.newEntity.findMany({ where: { userId } });
  }

  async create(userId: string, dto: CreateNewEntityDto) {
    return this.prisma.newEntity.create({ data: { userId, ...dto } });
  }

  async adminList() {
    return this.prisma.newEntity.findMany({ include: { user: true } });
  }

  async adminUpdate(id: string, adminUserId: string, dto: UpdateNewEntityDto) {
    await this.prisma.adminAuditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_NEW_ENTITY',
        targetModel: 'NewEntity',
        targetId: id,
        payload: JSON.stringify(dto),
        performedAt: new Date(),
      },
    });
    return this.prisma.newEntity.update({ where: { id }, data: dto });
  }
}
```

### Fan Controller

```typescript
// new-feature.controller.ts
import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NewFeatureService } from './new-feature.service';
import { CreateNewEntityDto } from './dto/create-new-entity.dto';

@Controller('new-feature')
@UseGuards(JwtAuthGuard)
export class NewFeatureController {
  constructor(private readonly service: NewFeatureService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateNewEntityDto) {
    return this.service.create(req.user.id, dto);
  }
}
```

### Admin Controller

```typescript
// admin-new-feature.controller.ts
import { Controller, Get, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NewFeatureService } from './new-feature.service';

@Controller('admin/new-feature')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class AdminNewFeatureController {
  constructor(private readonly service: NewFeatureService) {}

  @Get()
  list() {
    return this.service.adminList();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() dto: any) {
    return this.service.adminUpdate(id, req.user.id, dto);
  }
}
```

---

## Step 3: Register in AppModule

Add to `apps/api/src/app.module.ts`:

```typescript
import { NewFeatureModule } from './new-feature/new-feature.module';

@Module({
  imports: [
    // ... existing modules
    NewFeatureModule,
  ],
})
export class AppModule {}
```

---

## Step 4: Write Tests

Create `apps/api/src/new-feature/new-feature.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NewFeatureService } from './new-feature.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  newEntity: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  adminAuditLog: { create: vi.fn() },
};

describe('NewFeatureService', () => {
  let service: NewFeatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewFeatureService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<NewFeatureService>(NewFeatureService);
    vi.clearAllMocks();
  });

  it('should return entities for user', async () => {
    mockPrisma.newEntity.findMany.mockResolvedValue([{ id: '1' }]);
    const result = await service.findAll('user-1');
    expect(result).toHaveLength(1);
  });

  it('should write audit log on admin update', async () => {
    mockPrisma.newEntity.update.mockResolvedValue({ id: '1' });
    await service.adminUpdate('1', 'admin-1', { name: 'updated' });
    expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'admin-1' }) })
    );
  });
});
```

Run tests:

```bash
pnpm --filter @psl-one/api test new-feature
```

---

## Step 5: Add Web Pages

Create client functions in `apps/web/src/lib/new-feature-client.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export async function getMyEntities(token: string) {
  const res = await fetch(`${API_BASE}/new-feature`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

Create `apps/web/src/app/new-feature/page.tsx`:

```typescript
'use client';
import { useState, useEffect } from 'react';
import { getMyEntities } from '@/lib/new-feature-client';

export default function NewFeaturePage() {
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') ?? '';
    getMyEntities(token).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">New Feature</h1>
      {/* render data */}
    </div>
  );
}
```

---

## Step 6: Update Seed if Needed

If the feature requires reference data, add to `apps/api/prisma/seed.ts` and use `upsert` to make it idempotent.

---

## Checklist

- [ ] Schema updated and migration created
- [ ] Service with all methods
- [ ] Fan controller with `JwtAuthGuard`
- [ ] Admin controller with `JwtAuthGuard + RolesGuard + @Roles('PSL_ADMIN')`
- [ ] Admin mutations write `AdminAuditLog`
- [ ] Module registered in `AppModule`
- [ ] Tests written — all service methods covered
- [ ] Tests passing: `pnpm --filter @psl-one/api test <module>`
- [ ] Web client functions in `lib/<domain>-client.ts`
- [ ] Web pages created
- [ ] No business logic in frontend
- [ ] TypeCheck passes: `pnpm --filter @psl-one/api typecheck`
- [ ] Build passes: `pnpm --filter @psl-one/web build`
