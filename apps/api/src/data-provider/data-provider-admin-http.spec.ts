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
import { WorldCupImportService } from './world-cup-import.service';
import { WorldCupDbStatusService } from './world-cup-db-status.service';
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
    getWorldCupLiveReadiness: () => ({
      competition: 'WC2026' as const,
      worldCupActive: true as const,
      activeProviders: {
        whenIsKickoff: { configured: true, envVar: 'PUBLIC_SCHEDULE_FEED', status: 'CONNECTED' },
        footballDataOrg: { configured: true, envVar: 'FOOTBALL_DATA_API_KEY', status: 'CONFIGURED' },
        sportRadar: { configured: false, envVar: 'SPORTSRADAR_SOCCER_API_KEY', status: 'NOT_CONFIGURED' },
        scoreBat: { configured: false, envVar: 'SCOREBAT_WIDGET_TOKEN', status: 'NOT_CONFIGURED' },
      },
      primaryProvider: 'football-data-org',
      fallbackChain: ['football-data-org', 'sportradar-soccer', 'noop'],
      importReadiness: {
        dryRunEligible: true,
        writeImportAllowedByEnvFlag: false,
        writeImportRequiresFlags: ['ALLOW_WORLD_CUP_WRITE=true', 'confirmWorldCupWrite=IMPORT_WORLD_CUP_BETA'],
      },
      ownerActions: ['Run dry-run at POST /admin/data-provider/world-cup/fixtures/import'],
      forbiddenActions: ['Do not activate PSL season'],
      safety: {
        noRealMoney: true as const,
        noPslActivation: true as const,
        worldCupBetaContext: true as const,
        noScheduledIngestion: true as const,
        noProductionIngestion: true as const,
      },
    }),
    getPslFixtureReadiness: () => ({
      competition: 'PSL' as const,
      season: '2026/27',
      pslActive: false as const,
      fixturePublicationIsActivation: false as const,
      readinessStatus: 'SOURCE_EMPTY' as const,
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

  const mockWcImport: Partial<WorldCupImportService> = {
    importFixtures: async () => ({
      provider: 'football-data-org',
      competitionCode: 'WC2026',
      dryRun: true,
      sourceStatus: 'SOURCE_AVAILABLE',
      discovered: 104,
      normalized: 104,
      created: 0,
      updated: 0,
      skipped: 104,
      candidates: [],
      errors: [],
      warnings: [],
      safety: {
        noRealMoney: true,
        noPslActivation: true,
        worldCupBetaContext: true,
        writeRequiresFlags: ['ALLOW_WORLD_CUP_WRITE=true', 'confirmWorldCupWrite=IMPORT_WORLD_CUP_BETA'],
      },
    }),
  };

  const mockWcDbStatus: Partial<WorldCupDbStatusService> = {
    getPlayerPoolStatus: async () => ({
      competition: 'WC2026' as const,
      season: { id: 'wc-season-1', name: 'FIFA World Cup 2026', isActive: true },
      playerPool: {
        totalPlayers: 1200,
        teamCount: 48,
        byPosition: { GOALKEEPER: 144, DEFENDER: 384, MIDFIELDER: 384, FORWARD: 288 },
        playersWithPrice: 1200,
        priceSeeded: true,
        priceNote: 'Fantasy points only — no cash value, no real-money wallet',
      },
      safety: {
        noRealMoney: true as const,
        noPslActivation: true as const,
        pointsOnlyContext: true as const,
        noWrites: true as const,
      },
    }),
    getFixtureStatus: async () => ({
      competition: 'WC2026' as const,
      season: { id: 'wc-season-1', name: 'FIFA World Cup 2026', isActive: true },
      fixtures: {
        total: 104,
        published: 104,
        byRound: { GROUP: 72, ROUND_OF_32: 16, ROUND_OF_16: 8, QUARTER_FINAL: 4, SEMI_FINAL: 2, THIRD_PLACE: 1, FINAL: 1 },
      },
      predictionMarkets: {
        total: 104,
        open: 104,
        locked: 0,
        settled: 0,
        note: 'Points-based GTS prediction markets — no wagering, no cash value',
      },
      safety: {
        noRealMoney: true as const,
        noPslActivation: true as const,
        pointsOnlyContext: true as const,
        noWrites: true as const,
      },
    }),
  };

  const module: TestingModule = await Test.createTestingModule({
    controllers: [DataProviderController],
    providers: [
      { provide: DataProviderService, useValue: mockDataProvider },
      { provide: ParsePslFixtureIngestionService, useValue: mockIngestion },
      { provide: WorldCupImportService, useValue: mockWcImport },
      { provide: WorldCupDbStatusService, useValue: mockWcDbStatus },
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

// ── Sprint 38A: GET /admin/data-provider/world-cup-live-readiness ─────────

describe('Sprint 38A — GET /admin/data-provider/world-cup-live-readiness', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/data-provider/world-cup-live-readiness' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup-live-readiness',
      headers: { Authorization: 'Bearer bad-token-wc' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup-live-readiness',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN gets 200 with WC readiness payload', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup-live-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.competition).toBe('WC2026');
    expect(body.worldCupActive).toBe(true);
  });

  it('WC readiness response includes safety flags', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup-live-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(body.safety.noRealMoney).toBe(true);
    expect(body.safety.noPslActivation).toBe(true);
    expect(body.safety.worldCupBetaContext).toBe(true);
    expect(body.safety.noScheduledIngestion).toBe(true);
    expect(body.safety.noProductionIngestion).toBe(true);
  });

  it('WC readiness response does not expose provider key values', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup-live-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.body).not.toMatch(/FOOTBALL_DATA_API_KEY=\S+/);
    expect(res.body).not.toMatch(/SPORTSRADAR_SOCCER_API_KEY=\S+/);
    expect(res.body).not.toMatch(/SCOREBAT_WIDGET_TOKEN=\S+/);
  });

  it('WC readiness includes activeProviders block with footballDataOrg, sportRadar, scoreBat', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup-live-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(body.activeProviders.footballDataOrg).toBeDefined();
    expect(body.activeProviders.sportRadar).toBeDefined();
    expect(body.activeProviders.scoreBat).toBeDefined();
  });

  it('WC readiness includes importReadiness with writeImportRequiresFlags', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup-live-readiness',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(body.importReadiness.writeImportRequiresFlags).toBeDefined();
    expect(Array.isArray(body.importReadiness.writeImportRequiresFlags)).toBe(true);
    expect(body.importReadiness.writeImportRequiresFlags.length).toBeGreaterThan(0);
  });
});

// ── Sprint 38A: POST /admin/data-provider/world-cup/fixtures/import ────────

describe('Sprint 38A — POST /admin/data-provider/world-cup/fixtures/import', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/world-cup/fixtures/import',
      payload: { dryRun: true },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/world-cup/fixtures/import',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
      payload: { dryRun: true },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN dry-run gets 200 with import result', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/world-cup/fixtures/import',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      payload: { dryRun: true },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.dryRun).toBe(true);
    expect(body.competitionCode).toBe('WC2026');
  });

  it('write-mode without confirmWorldCupWrite returns 400', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/world-cup/fixtures/import',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      payload: { dryRun: false },
    });
    expect(res.statusCode).toBe(400);
  });

  it('write-mode with wrong confirmWorldCupWrite returns 400', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/world-cup/fixtures/import',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      payload: { dryRun: false, confirmWorldCupWrite: 'WRONG_VALUE' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('import result always includes safety block with noPslActivation=true', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/world-cup/fixtures/import',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      payload: { dryRun: true },
    });
    const body = JSON.parse(res.body);
    expect(body.safety.noPslActivation).toBe(true);
    expect(body.safety.noRealMoney).toBe(true);
  });

  it('dry-run import result does not expose provider key values', async () => {
    const res = await app.inject({
      method: 'POST', url: '/admin/data-provider/world-cup/fixtures/import',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      payload: { dryRun: true },
    });
    expect(res.body).not.toMatch(/FOOTBALL_DATA_API_KEY=\S+/);
    expect(res.body).not.toMatch(/SPORTSRADAR_SOCCER_API_KEY=\S+/);
  });
});

// ── Sprint 38B: GET /admin/data-provider/world-cup/player-pool-status ───────

describe('Sprint 38B — GET /admin/data-provider/world-cup/player-pool-status', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/data-provider/world-cup/player-pool-status' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/player-pool-status',
      headers: { Authorization: 'Bearer bad-token-pool' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/player-pool-status',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN gets 200 with player pool payload', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/player-pool-status',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.competition).toBe('WC2026');
    expect(body.playerPool.totalPlayers).toBe(1200);
    expect(body.playerPool.priceSeeded).toBe(true);
  });

  it('player pool response includes safety flags (noRealMoney, pointsOnlyContext)', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/player-pool-status',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(body.safety.noRealMoney).toBe(true);
    expect(body.safety.noPslActivation).toBe(true);
    expect(body.safety.pointsOnlyContext).toBe(true);
    expect(body.safety.noWrites).toBe(true);
  });

  it('player pool response does not expose provider key values', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/player-pool-status',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.body).not.toMatch(/FOOTBALL_DATA_API_KEY=\S+/);
    expect(res.body).not.toMatch(/SPORTSRADAR_SOCCER_API_KEY=\S+/);
  });
});

// ── Sprint 38B: GET /admin/data-provider/world-cup/fixture-status ────────────

describe('Sprint 38B — GET /admin/data-provider/world-cup/fixture-status', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/data-provider/world-cup/fixture-status' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/fixture-status',
      headers: { Authorization: 'Bearer bad-token-fixture-status' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/fixture-status',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN gets 200 with fixture status payload', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/fixture-status',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.competition).toBe('WC2026');
    expect(body.fixtures.total).toBe(104);
    expect(body.fixtures.published).toBe(104);
    expect(body.predictionMarkets.open).toBe(104);
  });

  it('fixture status response includes safety flags (noRealMoney, pointsOnlyContext)', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/fixture-status',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(body.safety.noRealMoney).toBe(true);
    expect(body.safety.noPslActivation).toBe(true);
    expect(body.safety.pointsOnlyContext).toBe(true);
    expect(body.safety.noWrites).toBe(true);
  });

  it('fixture status shows prediction markets are points-only (note field)', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/fixture-status',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const body = JSON.parse(res.body);
    expect(body.predictionMarkets.note).toMatch(/points|no wagering|no cash/i);
  });
});

// ── Sprint 38A: GET /admin/data-provider/world-cup/scorebat-widget-config ──

describe('Sprint 38A — GET /admin/data-provider/world-cup/scorebat-widget-config', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({ method: 'GET', url: '/admin/data-provider/world-cup/scorebat-widget-config' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for FAN role', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/scorebat-widget-config',
      headers: { Authorization: `Bearer ${FAN_TOKEN}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('PSL_ADMIN gets 200 with embed config', async () => {
    const res = await app.inject({
      method: 'GET', url: '/admin/data-provider/world-cup/scorebat-widget-config',
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.allowedHosts).toContain('www.scorebat.com');
  });
});
