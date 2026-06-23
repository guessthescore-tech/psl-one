/**
 * HTTP-level integration tests for PredictionChallengesController admin routes.
 *
 * Verifies JwtAuthGuard + RolesGuard enforce PSL_ADMIN access on:
 * - POST /predictions/challenges/settle-fixture/:fixtureId
 * - POST /predictions/challenges/:token/settle
 *
 * - Unauthenticated → 401
 * - FAN role → 403
 * - PSL_ADMIN → passes guards, reaches service (non-5xx)
 */
import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LocalJwtProvider } from '../auth/providers/local-jwt.provider';
import { PredictionChallengesController } from './prediction-challenges.controller';
import { PredictionChallengesService } from './prediction-challenges.service';
import { ChallengeSettlementService } from './challenge-settlement.service';
import type { TokenPayload } from '../auth/providers/auth.provider.interface';

const FAN_TOKEN = 'test-fan-pc';
const ADMIN_TOKEN = 'test-admin-pc';

const TOKEN_STORE: Record<string, TokenPayload> = {
  [FAN_TOKEN]: { sub: 'fan-uid-pc', email: 'fan@test.co.za', role: 'FAN' },
  [ADMIN_TOKEN]: { sub: 'admin-uid-pc', email: 'admin@test.co.za', role: 'PSL_ADMIN' },
};

let app: NestFastifyApplication;

beforeAll(async () => {
  const mockJwt: Partial<LocalJwtProvider> = {
    verifyToken: async (token: string): Promise<TokenPayload> => {
      const p = TOKEN_STORE[token];
      if (!p) throw new Error('invalid token');
      return p;
    },
  };

  const mockChallengesService: Partial<PredictionChallengesService> = {
    createChallenge: async () => { throw new NotFoundException('fixture not found'); },
    getMyCreatedChallenges: async () => [],
    getChallengeByToken: async () => { throw new NotFoundException('not found'); },
    acceptChallenge: async () => { throw new NotFoundException('not found'); },
    getChallengeStatus: async () => { throw new NotFoundException('not found'); },
  };

  const mockSettlement: Partial<ChallengeSettlementService> = {
    settleAllAcceptedForFixture: async () => { throw new NotFoundException('fixture not found'); },
    settle: async () => { throw new NotFoundException('challenge not found'); },
    getResult: async () => { throw new NotFoundException('not found'); },
  };

  const module: TestingModule = await Test.createTestingModule({
    controllers: [PredictionChallengesController],
    providers: [
      { provide: PredictionChallengesService, useValue: mockChallengesService },
      { provide: ChallengeSettlementService, useValue: mockSettlement },
      { provide: LocalJwtProvider, useValue: mockJwt },
      JwtAuthGuard,
      RolesGuard,
    ],
  }).compile();

  app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter({ trustProxy: false }));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});

afterAll(async () => { await app?.close(); });

// ── POST /predictions/challenges/settle-fixture/:fixtureId ────────────────

describe('POST /predictions/challenges/settle-fixture/:fixtureId', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/challenges/settle-fixture/fixture-1',
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/challenges/settle-fixture/fixture-1',
      headers: { Authorization: 'Bearer bad-token-pc' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/challenges/settle-fixture/fixture-1',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN passes guards and reaches service layer (404)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/challenges/settle-fixture/fixture-1',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    // 404 proves guards passed; service threw NotFoundException
    expect(res.statusCode).toBe(404);
  });
});

// ── POST /predictions/challenges/:token/settle ────────────────────────────

describe('POST /predictions/challenges/:token/settle', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/challenges/challenge-token-abc/settle',
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/challenges/challenge-token-abc/settle',
      headers: { Authorization: 'Bearer invalid-jwt' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/challenges/challenge-token-abc/settle',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN passes guards and reaches service layer (404)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/challenges/challenge-token-abc/settle',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    // 404 proves guards passed; service threw NotFoundException
    expect(res.statusCode).toBe(404);
  });
});

// ── Non-admin routes must NOT require PSL_ADMIN ───────────────────────────

describe('Non-admin prediction challenge routes (fan-accessible)', () => {
  it('GET /predictions/challenges/:token is public (no auth required)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/predictions/challenges/some-token',
    });
    // Public route — 404 from mock service, not 401/403
    expect(res.statusCode).toBe(404);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });

  it('POST /predictions/challenges/:token/accept requires any valid JWT (not PSL_ADMIN)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/predictions/challenges/some-token/accept',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
      payload: { predictedHomeScore: 1, predictedAwayScore: 0 },
    });
    // FAN can access this route — not admin-only
    expect(res.statusCode).not.toBe(403);
  });
});
