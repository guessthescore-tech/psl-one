/**
 * HTTP-level integration tests for DataProviderController admin routes.
 *
 * Verifies JwtAuthGuard + RolesGuard enforce PSL_ADMIN access:
 * - Unauthenticated → 401
 * - FAN role → 403
 * - PSL_ADMIN → passes guards, reaches service (non-5xx)
 *
 * No real provider calls. No DB. No provider keys printed.
 */
import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LocalJwtProvider } from '../auth/providers/local-jwt.provider';
import { DataProviderController } from './data-provider.controller';
import { DataProviderService } from './data-provider.service';
import { ParsePslFixtureIngestionService } from './parse-psl-fixture-ingestion.service';
import type { TokenPayload } from '../auth/providers/auth.provider.interface';

const FAN_TOKEN = 'test-fan-dp';
const ADMIN_TOKEN = 'test-admin-dp';

const TOKEN_STORE: Record<string, TokenPayload> = {
  [FAN_TOKEN]: { sub: 'fan-uid-dp', email: 'fan@test.co.za', role: 'FAN' },
  [ADMIN_TOKEN]: { sub: 'admin-uid-dp', email: 'admin@test.co.za', role: 'PSL_ADMIN' },
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

  const mockDataProvider: Partial<DataProviderService> = {
    health: async () => { throw new NotFoundException('no provider'); },
    getSeasons: async () => { throw new NotFoundException('no seasons'); },
    getFixtures: async () => { throw new NotFoundException('no fixtures'); },
  };

  const mockIngestion: Partial<ParsePslFixtureIngestionService> = {
    ingest: async () => { throw new NotFoundException('no provider config'); },
  };

  const module: TestingModule = await Test.createTestingModule({
    controllers: [DataProviderController],
    providers: [
      { provide: DataProviderService, useValue: mockDataProvider },
      { provide: ParsePslFixtureIngestionService, useValue: mockIngestion },
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

// ── GET /admin/data-provider/health ───────────────────────────────────────

describe('GET /admin/data-provider/health', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/data-provider/health' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/health',
      headers: { Authorization: 'Bearer bad-token-dp' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/health',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN passes guards and reaches service layer (404)', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/health',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.statusCode).toBe(404);
  });
});

// ── GET /admin/data-provider/discovery/seasons ────────────────────────────

describe('GET /admin/data-provider/discovery/seasons', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/data-provider/discovery/seasons' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/discovery/seasons',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN passes guards and reaches service layer (404)', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/discovery/seasons',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.statusCode).toBe(404);
  });
});

// ── POST /admin/data-provider/parse-psl/fixtures/ingest ───────────────────

describe('POST /admin/data-provider/parse-psl/fixtures/ingest', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/parse-psl/fixtures/ingest',
      payload: { dryRun: true },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/parse-psl/fixtures/ingest',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
      payload: { dryRun: true },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN dry-run passes guards and reaches service layer (404)', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/parse-psl/fixtures/ingest',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      payload: { dryRun: true },
    });
    // 404 proves guards passed; service threw NotFoundException
    expect(res.statusCode).toBe(404);
  });

  it('PSL_ADMIN write-mode without seasonId returns 400 (controller validation)', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/parse-psl/fixtures/ingest',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      payload: { dryRun: false },
    });
    // 400 proves guards passed; controller rejected missing seasonId
    expect(res.statusCode).toBe(400);
  });

  it('PSL_ADMIN write-mode without confirmWrite returns 400 (controller validation)', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/parse-psl/fixtures/ingest',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      payload: { dryRun: false, seasonId: 'season-test' },
    });
    // 400 proves guards passed; controller rejected missing confirmWrite
    expect(res.statusCode).toBe(400);
  });

  it('does not expose provider key in response', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/parse-psl/fixtures/ingest',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      payload: { dryRun: true },
    });
    // Response body must not leak any provider key value
    expect(res.body).not.toMatch(/PARSE_API_KEY=\S+/);
    expect(res.body).not.toMatch(/pmx_[A-Za-z0-9]{10,}/);
  });
});
