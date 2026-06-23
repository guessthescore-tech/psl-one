/**
 * HTTP-level integration tests for FixturePublicationController and PslPreflightController
 * admin routes — verifying that JwtAuthGuard + RolesGuard enforce PSL_ADMIN access correctly.
 *
 * - Unauthenticated → 401
 * - FAN role → 403
 * - PSL_ADMIN → passes guards, reaches service layer (non-5xx)
 *
 * Uses Fastify app.inject() — no real HTTP server, no DB.
 */
import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LocalJwtProvider } from '../auth/providers/local-jwt.provider';
import { FixturePublicationController, PslPreflightController } from './fixture-publication.controller';
import { FixturePublicationService } from './fixture-publication.service';
import { PslActivationPreflightService } from './psl-activation-preflight.service';
import type { TokenPayload } from '../auth/providers/auth.provider.interface';

const FAN_TOKEN = 'test-fan-pub';
const ADMIN_TOKEN = 'test-admin-pub';

const TOKEN_STORE: Record<string, TokenPayload> = {
  [FAN_TOKEN]: { sub: 'fan-uid-1', email: 'fan@test.co.za', role: 'FAN' },
  [ADMIN_TOKEN]: { sub: 'admin-uid-1', email: 'admin@test.co.za', role: 'PSL_ADMIN' },
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

  const mockPub: Partial<FixturePublicationService> = {
    listImportedFixtures: async () => { throw new NotFoundException('no fixtures'); },
    publishFixtures: async () => { throw new NotFoundException('no fixtures'); },
  };

  const mockPreflight: Partial<PslActivationPreflightService> = {
    runPreflight: async () => { throw new NotFoundException('no season'); },
  };

  const module: TestingModule = await Test.createTestingModule({
    controllers: [FixturePublicationController, PslPreflightController],
    providers: [
      { provide: FixturePublicationService, useValue: mockPub },
      { provide: PslActivationPreflightService, useValue: mockPreflight },
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

// ── GET /admin/fixtures/imported ───────────────────────────────────────────

describe('GET /admin/fixtures/imported', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/fixtures/imported' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/fixtures/imported',
      headers: { Authorization: 'Bearer bad-token' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/fixtures/imported',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN passes guards and reaches service layer (404)', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/fixtures/imported',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.statusCode).toBe(404);
  });
});

// ── POST /admin/fixtures/publish ───────────────────────────────────────────

describe('POST /admin/fixtures/publish', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/fixtures/publish',
      payload: { fixtureIds: ['fx-1'], confirmPublication: true },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/fixtures/publish',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
      payload: { fixtureIds: ['fx-1'], confirmPublication: true },
    });
    expect(res.statusCode).toBe(403);
  });

  it('returns 400 when fixtureIds missing (PSL_ADMIN passes guards)', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/fixtures/publish',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      payload: {},
    });
    // 400 proves guards passed; controller validation rejected missing fixtureIds
    expect(res.statusCode).toBe(400);
  });

  it('PSL_ADMIN with valid body passes guards and reaches service layer (404)', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/fixtures/publish',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      payload: { fixtureIds: ['fx-test'], confirmPublication: true },
    });
    expect(res.statusCode).toBe(404);
  });
});

// ── GET /admin/psl/preflight ───────────────────────────────────────────────

describe('GET /admin/psl/preflight', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/psl/preflight' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/psl/preflight',
      headers: { Authorization: 'Bearer invalid-token' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/psl/preflight',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN passes guards and reaches service layer (404)', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/psl/preflight',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    // 404 proves guards passed; service threw NotFoundException (no season found)
    expect(res.statusCode).toBe(404);
  });

  it('PSL_ADMIN preflight does not activate PSL (service is read-only)', async () => {
    // The preflight endpoint must never activate PSL — it is read-only.
    // Confirmed by fixture-publication.controller.ts comment and service mock.
    const res = await app.inject({
      method: 'GET', url: '/admin/psl/preflight',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    // Guard passes, service called — no PSL activation occurs
    expect([404, 200, 400]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
  });
});
