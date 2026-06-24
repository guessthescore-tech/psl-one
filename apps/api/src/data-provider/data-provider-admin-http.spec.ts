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
    getPslFixtureReadiness: () => ({
      competition: 'PSL' as const,
      season: '2026/27',
      pslActive: false as const,
      fixturePublicationIsActivation: false as const,
      readinessStatus: 'SOURCE_EMPTY' as const,
      providerDecision: 'none (PROVIDER_NOT_CONFIGURED)',
      dryRunEligible: false,
      writeImportForbidden: true as const,
      fixturePublicationForbidden: true as const,
      pslActivationForbidden: true as const,
      parsePsl: { configured: false, status: 'NOT_CONFIGURED' as const, candidateFixtureCount: 0, lastCheckedAt: new Date().toISOString() },
      apiFootball: { configured: false, leagueId: 288 as const, status: 'NOT_CONFIGURED' as const },
      ownerActions: ['Monitor until readiness changes'],
      forbiddenActions: ['Do not activate PSL'],
      safety: { noWrites: true as const, noPublication: true as const, noPslActivation: true as const, noScheduledIngestion: true as const, noProductionIngestion: true as const, noRealMoney: true as const },
    }),
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

// ── GET /admin/data-provider/psl-fixture-readiness ────────────────────────

describe('GET /admin/data-provider/psl-fixture-readiness', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/data-provider/psl-fixture-readiness' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: 'Bearer bad-token-readiness' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN gets 200 with readiness payload', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.competition).toBe('PSL');
    expect(body.pslActive).toBe(false);
    expect(body.fixturePublicationIsActivation).toBe(false);
  });

  it('readiness response includes safety flags noWrites=true noPublication=true noPslActivation=true', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(body.safety.noWrites).toBe(true);
    expect(body.safety.noPublication).toBe(true);
    expect(body.safety.noPslActivation).toBe(true);
    expect(body.safety.noScheduledIngestion).toBe(true);
    expect(body.safety.noProductionIngestion).toBe(true);
    expect(body.safety.noRealMoney).toBe(true);
  });

  it('readiness response does not expose provider key values', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.body).not.toMatch(/pmx_[A-Za-z0-9]{10,}/);
    expect(res.body).not.toMatch(/PARSE_API_KEY=\S+/);
    expect(res.body).not.toMatch(/API_FOOTBALL_KEY=\S+/);
  });

  it('readiness response is read-only — no DB writes, no import, no activation triggered', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    // 200 means controller returned successfully; mock never called ingest
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.readinessStatus).toBe('SOURCE_EMPTY');
  });
});

// ── Sprint 37: Enhanced PSL fixture readiness fields ─────────────────────

describe('Sprint 37: GET /admin/data-provider/psl-fixture-readiness enhanced fields', () => {
  it('returns 401 for anonymous', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/data-provider/psl-fixture-readiness' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN: writeImportForbidden=true', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(body.writeImportForbidden).toBe(true);
  });

  it('PSL_ADMIN: fixturePublicationForbidden=true', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(body.fixturePublicationForbidden).toBe(true);
  });

  it('PSL_ADMIN: pslActivationForbidden=true', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(body.pslActivationForbidden).toBe(true);
  });

  it('PSL_ADMIN: providerDecision field present', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(typeof body.providerDecision).toBe('string');
    expect(body.providerDecision.length).toBeGreaterThan(0);
  });

  it('PSL_ADMIN: dryRunEligible field is boolean', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(typeof body.dryRunEligible).toBe('boolean');
  });

  it('no provider key value in enhanced response', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.body).not.toMatch(/PARSE_API_KEY=\S+/);
    expect(res.body).not.toMatch(/API_FOOTBALL_KEY=\S+/);
    expect(res.body).not.toMatch(/FOOTBALL_DATA_API_KEY=\S+/);
  });

  it('no import service called during readiness GET', async () => {
    // ingest mock throws NotFoundException; if it were called the response would be 404
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/psl-fixture-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.statusCode).toBe(200);
  });
});
