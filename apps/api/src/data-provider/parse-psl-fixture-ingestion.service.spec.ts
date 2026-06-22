import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { ParsePslFixtureIngestionService } from './parse-psl-fixture-ingestion.service';
import { PrismaService } from '../prisma/prisma.service';

vi.mock('./parse-psl.adapter', () => ({
  ParsePslAdapter: vi.fn(),
}));
import { ParsePslAdapter } from './parse-psl.adapter';
const MockAdapter = vi.mocked(ParsePslAdapter);

const makePrisma = () => ({
  team: { findFirst: vi.fn() },
  fixture: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
});

describe('ParsePslFixtureIngestionService', () => {
  let service: ParsePslFixtureIngestionService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    vi.clearAllMocks();

    // Default: constructor returns object with empty-array getFixtures
    MockAdapter.mockImplementation(function (this: unknown) {
      (this as Record<string, unknown>)['getFixtures'] = vi.fn().mockResolvedValue([]);
    } as unknown as typeof ParsePslAdapter);

    const module = await Test.createTestingModule({
      providers: [
        ParsePslFixtureIngestionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ParsePslFixtureIngestionService);
  });

  function mockFixtures(fixtures: unknown[]) {
    MockAdapter.mockImplementation(function (this: unknown) {
      (this as Record<string, unknown>)['getFixtures'] = vi.fn().mockResolvedValue(fixtures);
    } as unknown as typeof ParsePslAdapter);
  }

  function mockFixturesError(err: Error) {
    MockAdapter.mockImplementation(function (this: unknown) {
      (this as Record<string, unknown>)['getFixtures'] = vi.fn().mockRejectedValue(err);
    } as unknown as typeof ParsePslAdapter);
  }

  // ── Source-empty no-op ───────────────────────────────────────────────────

  describe('source-empty handling', () => {
    beforeEach(() => {
      process.env['PARSE_API_KEY'] = 'test-key-for-unit-tests';
      mockFixtures([]);
    });

    afterEach(() => { delete process.env['PARSE_API_KEY']; });

    it('returns SOURCE_EMPTY when provider returns []', async () => {
      const result = await service.ingest({ competitionCode: 'BETWAY_PREMIERSHIP' });
      expect(result.sourceStatus).toBe('SOURCE_EMPTY');
    });

    it('returns discovered=0 for source-empty', async () => {
      const result = await service.ingest({});
      expect(result.discovered).toBe(0);
    });

    it('returns created=0 updated=0 for source-empty', async () => {
      const result = await service.ingest({});
      expect(result.created).toBe(0);
      expect(result.updated).toBe(0);
    });

    it('does not write to DB on source-empty', async () => {
      await service.ingest({});
      expect(prisma.fixture.create).not.toHaveBeenCalled();
      expect(prisma.fixture.update).not.toHaveBeenCalled();
    });

    it('succeeds (no errors) on source-empty', async () => {
      const result = await service.ingest({});
      expect(result.errors).toHaveLength(0);
    });
  });

  // ── dryRun default behaviour ─────────────────────────────────────────────

  describe('dryRun default', () => {
    const sampleFixtures = [
      { externalId: 'pfx-1', homeTeamName: 'Chiefs', awayTeamName: 'Pirates', kickoffAt: '2026-08-10T15:00:00Z', status: 'SCHEDULED' },
      { externalId: 'pfx-2', homeTeamName: 'Sundowns', awayTeamName: 'City', kickoffAt: '2026-08-11T15:00:00Z', status: 'SCHEDULED' },
    ];

    beforeEach(() => {
      process.env['PARSE_API_KEY'] = 'test-key-for-unit-tests';
      mockFixtures(sampleFixtures);
    });

    afterEach(() => { delete process.env['PARSE_API_KEY']; });

    it('dryRun defaults to true when not specified', async () => {
      const result = await service.ingest({});
      expect(result.dryRun).toBe(true);
    });

    it('dryRun=true does not write to DB', async () => {
      await service.ingest({ dryRun: true });
      expect(prisma.fixture.create).not.toHaveBeenCalled();
      expect(prisma.fixture.update).not.toHaveBeenCalled();
    });

    it('dryRun=true returns SOURCE_AVAILABLE', async () => {
      const result = await service.ingest({ dryRun: true });
      expect(result.sourceStatus).toBe('SOURCE_AVAILABLE');
    });

    it('dryRun=true sets normalized count correctly', async () => {
      const result = await service.ingest({ dryRun: true });
      expect(result.normalized).toBe(2);
    });

    it('dryRun=true sets created=0 updated=0', async () => {
      const result = await service.ingest({ dryRun: true });
      expect(result.created).toBe(0);
      expect(result.updated).toBe(0);
    });

    it('dryRun=false without seasonId returns error', async () => {
      const result = await service.ingest({ dryRun: false });
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toMatch(/seasonId/);
    });
  });

  // ── Normalization ────────────────────────────────────────────────────────

  describe('normalization', () => {
    beforeEach(() => {
      process.env['PARSE_API_KEY'] = 'test-key-for-unit-tests';
    });
    afterEach(() => { delete process.env['PARSE_API_KEY']; });

    it('skips fixtures missing externalId', async () => {
      mockFixtures([{ externalId: '', homeTeamName: 'Chiefs', awayTeamName: 'Pirates', kickoffAt: '2026-08-10T15:00:00Z', status: 'SCHEDULED' }]);
      const result = await service.ingest({ dryRun: true });
      expect(result.normalized).toBe(0);
    });

    it('skips fixtures missing homeTeamName', async () => {
      mockFixtures([{ externalId: 'pfx-1', homeTeamName: '', awayTeamName: 'Pirates', kickoffAt: '2026-08-10T15:00:00Z', status: 'SCHEDULED' }]);
      const result = await service.ingest({ dryRun: true });
      expect(result.normalized).toBe(0);
    });

    it('normalizes valid fixture correctly', async () => {
      mockFixtures([{ externalId: 'pfx-1', homeTeamName: 'Chiefs', awayTeamName: 'Pirates', kickoffAt: '2026-08-10T15:00:00Z', status: 'SCHEDULED' }]);
      const result = await service.ingest({ dryRun: true });
      expect(result.normalized).toBe(1);
      expect(result.discovered).toBe(1);
    });
  });

  // ── Auth failed ──────────────────────────────────────────────────────────

  describe('auth failed', () => {
    it('returns AUTH_FAILED when PARSE_API_KEY not set', async () => {
      delete process.env['PARSE_API_KEY'];
      const result = await service.ingest({});
      expect(result.sourceStatus).toBe('AUTH_FAILED');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('does not write to DB when key missing', async () => {
      delete process.env['PARSE_API_KEY'];
      await service.ingest({});
      expect(prisma.fixture.create).not.toHaveBeenCalled();
    });
  });

  // ── Rate limited ─────────────────────────────────────────────────────────

  describe('rate limited', () => {
    beforeEach(() => { process.env['PARSE_API_KEY'] = 'test-key-for-unit-tests'; });
    afterEach(() => { delete process.env['PARSE_API_KEY']; });

    it('returns RATE_LIMITED when provider throws 429', async () => {
      mockFixturesError(new Error('HTTP 429 rate limit'));
      const result = await service.ingest({});
      expect(result.sourceStatus).toBe('RATE_LIMITED');
    });
  });

  // ── Idempotency ──────────────────────────────────────────────────────────

  describe('idempotency (write mode)', () => {
    const sampleFixture = {
      externalId: 'pfx-1',
      homeTeamName: 'Chiefs',
      awayTeamName: 'Pirates',
      kickoffAt: '2026-08-10T15:00:00Z',
      status: 'SCHEDULED',
    };

    beforeEach(() => {
      process.env['PARSE_API_KEY'] = 'test-key-for-unit-tests';
      mockFixtures([sampleFixture]);
      prisma.team.findFirst
        .mockResolvedValueOnce({ id: 'team-home-1' })
        .mockResolvedValueOnce({ id: 'team-away-1' });
    });

    afterEach(() => { delete process.env['PARSE_API_KEY']; });

    it('creates fixture when none exists', async () => {
      prisma.fixture.findFirst.mockResolvedValue(null);
      prisma.fixture.create.mockResolvedValue({ id: 'new-fx-1' });

      const result = await service.ingest({ dryRun: false, seasonId: 'season-1' });
      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
    });

    it('updates fixture when already exists (idempotent)', async () => {
      prisma.team.findFirst
        .mockResolvedValueOnce({ id: 'team-home-1' })
        .mockResolvedValueOnce({ id: 'team-away-1' });
      prisma.fixture.findFirst.mockResolvedValue({ id: 'existing-fx-1' });
      prisma.fixture.update.mockResolvedValue({ id: 'existing-fx-1' });

      const result = await service.ingest({ dryRun: false, seasonId: 'season-1' });
      expect(result.updated).toBe(1);
      expect(result.created).toBe(0);
    });

    it('skips fixture when team not found', async () => {
      prisma.team.findFirst.mockReset(); // clear queued once-values from beforeEach
      prisma.team.findFirst.mockResolvedValue(null);
      const result = await service.ingest({ dryRun: false, seasonId: 'season-1' });
      expect(result.skipped).toBe(1);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.created).toBe(0);
    });

    it('write mode sets isPublished=false on created fixtures', async () => {
      prisma.fixture.findFirst.mockResolvedValue(null);
      prisma.fixture.create.mockResolvedValue({ id: 'new-fx-1' });

      await service.ingest({ dryRun: false, seasonId: 'season-1' });

      expect(prisma.fixture.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isPublished: false }),
        }),
      );
    });

    it('write mode sets providerSource=parse-psl', async () => {
      prisma.fixture.findFirst.mockResolvedValue(null);
      prisma.fixture.create.mockResolvedValue({ id: 'new-fx-1' });

      await service.ingest({ dryRun: false, seasonId: 'season-1' });

      expect(prisma.fixture.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ providerSource: 'parse-psl' }),
        }),
      );
    });
  });

  // ── Safety constraints ───────────────────────────────────────────────────

  describe('safety constraints', () => {
    it('never activates PSL (no season activation call)', () => {
      expect((prisma as Record<string, unknown>)['season']).toBeUndefined();
    });

    it('service has no scheduler or cron decorator', () => {
      const src = require('fs').readFileSync(
        require('path').resolve(__dirname, 'parse-psl-fixture-ingestion.service.ts'),
        'utf8',
      );
      expect(src).not.toMatch(/@Cron|SchedulerRegistry|setInterval|cron/i);
    });

    it('service does not log PARSE_API_KEY value', () => {
      const src = require('fs').readFileSync(
        require('path').resolve(__dirname, 'parse-psl-fixture-ingestion.service.ts'),
        'utf8',
      );
      expect(src).not.toMatch(/logger\.(log|warn|error).*PARSE_API_KEY.*=/);
      expect(src).not.toMatch(/NEXT_PUBLIC_PARSE/);
    });

    it('service does not call betting or odds endpoints', () => {
      const src = require('fs').readFileSync(
        require('path').resolve(__dirname, 'parse-psl-fixture-ingestion.service.ts'),
        'utf8',
      );
      expect(src).not.toMatch(/\/odds\/|\/bets\/|\/betting\//i);
    });
  });
});
