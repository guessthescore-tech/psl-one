/**
 * HTTP-level integration test for PredictionsController admin routes.
 *
 * Tests that the guard chain (JwtAuthGuard + RolesGuard) correctly enforces
 * authentication and RBAC at the HTTP layer — not just via metadata reflection.
 *
 * - Unauthenticated → 401
 * - FAN role → 403
 * - PSL_ADMIN → passes guards and reaches service layer (404 since no real DB)
 *
 * Uses Fastify app.inject() — no real HTTP server started.
 */
import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LocalJwtProvider } from '../auth/providers/local-jwt.provider';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import type { TokenPayload } from '../auth/providers/auth.provider.interface';

// ── Stable test tokens ─────────────────────────────────────────────────────

const FAN_TOKEN = 'test-fan-token';
const ADMIN_TOKEN = 'test-admin-token';

const TOKEN_STORE: Record<string, TokenPayload> = {
  [FAN_TOKEN]: { sub: 'fan-uid-1', email: 'fan@test.co.za', role: 'FAN' },
  [ADMIN_TOKEN]: { sub: 'admin-uid-1', email: 'admin@test.co.za', role: 'PSL_ADMIN' },
};

// ── App bootstrap ──────────────────────────────────────────────────────────

let app: NestFastifyApplication;

beforeAll(async () => {
  const mockJwtProvider: Partial<LocalJwtProvider> = {
    verifyToken: async (token: string): Promise<TokenPayload> => {
      const payload = TOKEN_STORE[token];
      if (!payload) throw new Error('invalid token');
      return payload;
    },
  };

  const mockPredictionsService: Partial<PredictionsService> = {
    lockFixture: async (_id: string) => { throw new NotFoundException('fixture not found'); },
    lockGameweekPredictions: async (_id: string) => { throw new NotFoundException('gameweek not found'); },
    settleFixture: async (_id: string) => { throw new NotFoundException('fixture not found'); },
    settleGameweek: async (_id: string) => { throw new NotFoundException('gameweek not found'); },
    voidFixture: async (_id: string) => { throw new NotFoundException('fixture not found'); },
  };

  const module: TestingModule = await Test.createTestingModule({
    controllers: [PredictionsController],
    providers: [
      { provide: PredictionsService, useValue: mockPredictionsService },
      // Provide LocalJwtProvider so JwtAuthGuard can be resolved via DI
      { provide: LocalJwtProvider, useValue: mockJwtProvider },
      JwtAuthGuard,
      RolesGuard,
    ],
  }).compile();

  app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter({ trustProxy: false }));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});

afterAll(async () => {
  await app?.close();
});

// ── POST /predictions/admin/lock-fixture ───────────────────────────────────

describe('POST /predictions/admin/lock-fixture/:fixtureId', () => {
  it('returns 401 with no Authorization header', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/admin/lock-fixture/fixture-1',
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with invalid Bearer token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/admin/lock-fixture/fixture-1',
      headers: { Authorization: 'Bearer bad-token-xyz' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 when authenticated as FAN', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/admin/lock-fixture/fixture-1',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN passes guards and reaches service layer (404)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/admin/lock-fixture/fixture-1',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    // 404 proves guards passed; service threw NotFoundException
    expect(res.statusCode).toBe(404);
  });
});

// ── POST /predictions/admin/lock-gameweek ─────────────────────────────────

describe('POST /predictions/admin/lock-gameweek/:gameweekId', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/admin/lock-gameweek/gw-1',
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/admin/lock-gameweek/gw-1',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN passes guards and reaches service layer (404)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/admin/lock-gameweek/gw-1',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.statusCode).toBe(404);
  });
});
