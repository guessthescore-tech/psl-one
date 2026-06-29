import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { WorldCupImportService } from './world-cup-import.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { ProviderFixture } from './provider-adapter.interface';

const makePrismaMock = () => ({
  fixture: {
    findFirst: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({}),
  },
  team: {
    findFirst: vi.fn(),
  },
  season: {
    findFirst: vi.fn(),
  },
  adminAuditLog: {
    create: vi.fn().mockResolvedValue({}),
  },
});

describe('WorldCupImportService — normalizeFixtures', () => {
  let svc: WorldCupImportService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    svc = new WorldCupImportService(prisma as unknown as PrismaService);
  });

  it('passes homeScore and awayScore from provider fixture', () => {
    const raw: ProviderFixture[] = [
      {
        externalId: 'fx-1',
        homeTeamName: 'Brazil',
        awayTeamName: 'France',
        kickoffAt: '2026-06-14T18:00:00Z',
        status: 'FINISHED',
        homeScore: 2,
        awayScore: 1,
      },
    ];
    const result = (svc as unknown as { normalizeFixtures(r: ProviderFixture[]): unknown[] }).normalizeFixtures(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ homeScore: 2, awayScore: 1, status: 'FINISHED' });
  });

  it('omits homeScore/awayScore when provider does not supply them', () => {
    const raw: ProviderFixture[] = [
      {
        externalId: 'fx-2',
        homeTeamName: 'Germany',
        awayTeamName: 'Spain',
        kickoffAt: '2026-06-20T15:00:00Z',
        status: 'SCHEDULED',
      },
    ];
    const result = (svc as unknown as { normalizeFixtures(r: ProviderFixture[]): Record<string, unknown>[] }).normalizeFixtures(raw);
    expect(result).toHaveLength(1);
    expect(result[0]!['homeScore']).toBeUndefined();
    expect(result[0]!['awayScore']).toBeUndefined();
  });

  it('filters fixtures missing required fields', () => {
    const raw = [
      { externalId: 'fx-3', homeTeamName: '', awayTeamName: 'Spain', kickoffAt: '2026-06-20T15:00:00Z' },
      { externalId: '', homeTeamName: 'Germany', awayTeamName: 'Spain', kickoffAt: '2026-06-20T15:00:00Z' },
    ] as ProviderFixture[];
    const result = (svc as unknown as { normalizeFixtures(r: ProviderFixture[]): unknown[] }).normalizeFixtures(raw);
    expect(result).toHaveLength(0);
  });
});

describe('WorldCupImportService — upsertFixtures score persistence', () => {
  let svc: WorldCupImportService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    svc = new WorldCupImportService(prisma as unknown as PrismaService);
  });

  it('writes homeScore and awayScore on update when provider supplies them', async () => {
    const homeId = 'team-home-1';
    const awayId = 'team-away-1';
    const existingId = 'fixture-existing-1';

    (prisma.team.findFirst as Mock)
      .mockResolvedValueOnce({ id: homeId })
      .mockResolvedValueOnce({ id: awayId });
    (prisma.fixture.findFirst as Mock).mockResolvedValueOnce({ id: existingId });

    const fixtures = [
      {
        externalId: 'fx-1',
        homeTeamName: 'Brazil',
        awayTeamName: 'France',
        kickoffAt: '2026-06-14T18:00:00Z',
        status: 'FINISHED',
        homeScore: 3,
        awayScore: 0,
      },
    ];

    await (svc as unknown as { upsertFixtures(f: typeof fixtures, s: string, p: string): Promise<unknown> }).upsertFixtures(
      fixtures, 'season-1', 'football-data-org',
    );

    expect(prisma.fixture.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: existingId },
        data: expect.objectContaining({ homeScore: 3, awayScore: 0, status: 'FINISHED' }),
      }),
    );
  });

  it('does not include homeScore/awayScore in update when provider omits them', async () => {
    (prisma.team.findFirst as Mock)
      .mockResolvedValueOnce({ id: 'h' })
      .mockResolvedValueOnce({ id: 'a' });
    (prisma.fixture.findFirst as Mock).mockResolvedValueOnce({ id: 'fx-existing' });

    const fixtures = [
      {
        externalId: 'fx-2',
        homeTeamName: 'Germany',
        awayTeamName: 'Spain',
        kickoffAt: '2026-06-20T15:00:00Z',
        status: 'SCHEDULED',
      },
    ];

    await (svc as unknown as { upsertFixtures(f: typeof fixtures, s: string, p: string): Promise<unknown> }).upsertFixtures(
      fixtures, 'season-1', 'football-data-org',
    );

    const updateCall = (prisma.fixture.update as Mock).mock.calls[0]![0] as { data: Record<string, unknown> };
    expect(Object.keys(updateCall.data)).not.toContain('homeScore');
    expect(Object.keys(updateCall.data)).not.toContain('awayScore');
  });

  it('writes homeScore and awayScore on create when provider supplies them', async () => {
    (prisma.team.findFirst as Mock)
      .mockResolvedValueOnce({ id: 'team-h' })
      .mockResolvedValueOnce({ id: 'team-a' });
    (prisma.fixture.findFirst as Mock).mockResolvedValueOnce(null);

    const fixtures = [
      {
        externalId: 'fx-new',
        homeTeamName: 'Argentina',
        awayTeamName: 'Italy',
        kickoffAt: '2026-07-01T18:00:00Z',
        status: 'FINISHED',
        homeScore: 1,
        awayScore: 1,
      },
    ];

    await (svc as unknown as { upsertFixtures(f: typeof fixtures, s: string, p: string): Promise<unknown> }).upsertFixtures(
      fixtures, 'season-1', 'football-data-org',
    );

    expect(prisma.fixture.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ homeScore: 1, awayScore: 1, status: 'FINISHED' }),
      }),
    );
  });

  it('uses provider status on create (not hardcoded SCHEDULED)', async () => {
    (prisma.team.findFirst as Mock)
      .mockResolvedValueOnce({ id: 'team-h' })
      .mockResolvedValueOnce({ id: 'team-a' });
    (prisma.fixture.findFirst as Mock).mockResolvedValueOnce(null);

    const fixtures = [
      {
        externalId: 'fx-live',
        homeTeamName: 'Brazil',
        awayTeamName: 'Germany',
        kickoffAt: '2026-07-05T18:00:00Z',
        status: 'LIVE',
      },
    ];

    await (svc as unknown as { upsertFixtures(f: typeof fixtures, s: string, p: string): Promise<unknown> }).upsertFixtures(
      fixtures, 'season-1', 'football-data-org',
    );

    expect(prisma.fixture.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'LIVE' }),
      }),
    );
  });
});

describe('WorldCupImportService — cascade lookup for seeded fixtures', () => {
  let svc: WorldCupImportService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    svc = new WorldCupImportService(prisma as unknown as PrismaService);
  });

  it('falls back to team+kickoff window when providerFixtureId not found', async () => {
    // Simulate seeded fixture: providerFixtureId lookup returns null, team+window returns existing
    (prisma.team.findFirst as Mock)
      .mockResolvedValueOnce({ id: 'team-mx' })
      .mockResolvedValueOnce({ id: 'team-sa' });
    // First findFirst (by providerFixtureId) returns null — seeded fixture has no providerFixtureId
    (prisma.fixture.findFirst as Mock)
      .mockResolvedValueOnce(null)
      // Second findFirst (by team+kickoff) finds the seeded fixture
      .mockResolvedValueOnce({ id: 'seeded-fixture-1', providerSource: null, providerFixtureId: null, importedAt: null, homeScore: null, awayScore: null });

    const fixtures = [
      {
        externalId: 'external-123',
        homeTeamName: 'Mexico',
        awayTeamName: 'South Africa',
        kickoffAt: '2026-06-11T19:00:00Z',
        status: 'FINISHED',
        homeScore: 2,
        awayScore: 1,
      },
    ];

    await (svc as unknown as { upsertFixtures(f: typeof fixtures, s: string, p: string): Promise<unknown> }).upsertFixtures(
      fixtures, 'season-1', 'football-data-org',
    );

    // Should update (not create) the seeded fixture
    expect(prisma.fixture.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'seeded-fixture-1' },
        data: expect.objectContaining({
          homeScore: 2,
          awayScore: 1,
          status: 'FINISHED',
          providerSource: 'football-data-org',
          providerFixtureId: 'external-123',
        }),
      }),
    );
    expect(prisma.fixture.create).not.toHaveBeenCalled();
  });

  it('backfills importedAt on seeded fixture when null', async () => {
    (prisma.team.findFirst as Mock)
      .mockResolvedValueOnce({ id: 'team-h' })
      .mockResolvedValueOnce({ id: 'team-a' });
    (prisma.fixture.findFirst as Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'seeded-2', providerSource: null, providerFixtureId: null, importedAt: null, homeScore: null, awayScore: null });

    const fixtures = [
      { externalId: 'ext-456', homeTeamName: 'France', awayTeamName: 'Germany', kickoffAt: '2026-06-15T18:00:00Z', status: 'SCHEDULED' },
    ];

    await (svc as unknown as { upsertFixtures(f: typeof fixtures, s: string, p: string): Promise<unknown> }).upsertFixtures(
      fixtures, 'season-1', 'football-data-org',
    );

    const updateArg = (prisma.fixture.update as Mock).mock.calls[0]![0] as { data: Record<string, unknown> };
    expect(updateArg.data['importedAt']).toBeDefined();
  });

  it('does not overwrite existing valid score with null from provider', async () => {
    (prisma.team.findFirst as Mock)
      .mockResolvedValueOnce({ id: 'team-h' })
      .mockResolvedValueOnce({ id: 'team-a' });
    // Fixture has existing valid scores
    (prisma.fixture.findFirst as Mock)
      .mockResolvedValueOnce({ id: 'fx-with-scores', providerSource: 'football-data-org', providerFixtureId: 'ext-789', importedAt: new Date(), homeScore: 3, awayScore: 1 });

    const fixtures = [
      // Provider sends null for scores this time (no score data)
      { externalId: 'ext-789', homeTeamName: 'Spain', awayTeamName: 'Italy', kickoffAt: '2026-06-20T18:00:00Z', status: 'FINISHED' },
    ];

    await (svc as unknown as { upsertFixtures(f: typeof fixtures, s: string, p: string): Promise<unknown> }).upsertFixtures(
      fixtures, 'season-1', 'football-data-org',
    );

    const updateArg = (prisma.fixture.update as Mock).mock.calls[0]![0] as { data: Record<string, unknown> };
    // scores should not be in update data (preserved as-is in DB)
    expect(Object.keys(updateArg.data)).not.toContain('homeScore');
    expect(Object.keys(updateArg.data)).not.toContain('awayScore');
  });
});

describe('WorldCupImportService — wheniskickoff schedule feed', () => {
  let svc: WorldCupImportService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    svc = new WorldCupImportService(prisma as unknown as PrismaService);
    vi.stubGlobal('fetch', async () => ({
      ok: true,
      json: async () => ({
        matches: [
          {
            id: 9001,
            homeTeam: { name: 'Brazil' },
            awayTeam: { name: 'France' },
            utcDate: '2026-06-14T18:00:00Z',
            status: 'SCHEDULED',
          },
        ],
      }),
    }));
  });

  it('uses wheniskickoff as the default public schedule source', async () => {
    (prisma.team.findFirst as Mock)
      .mockResolvedValueOnce({ id: 'team-bra' })
      .mockResolvedValueOnce({ id: 'team-fra' });

    const result = await svc.importFixtures({ dryRun: true });

    expect(result.provider).toBe('wheniskickoff');
    expect(result.sourceStatus).toBe('SOURCE_AVAILABLE');
    expect(result.discovered).toBe(1);
    expect(result.normalized).toBe(1);
    expect(result.candidates).toHaveLength(1);
    expect(prisma.adminAuditLog.create).toHaveBeenCalled();
  });
});

// ── Team alias resolution ────────────────────────────────────────────────────

describe('WorldCupImportService — team alias resolution', () => {
  let svc: WorldCupImportService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    svc = new WorldCupImportService(prisma as unknown as PrismaService);
  });

  const ALIAS_CASES = [
    { providerName: 'Bosnia-Herzegovina', dbName: 'Bosnia and Herzegovina', label: 'Bosnia-Herzegovina → Bosnia and Herzegovina' },
    { providerName: 'Turkey', dbName: 'Türkiye', label: 'Turkey → Türkiye' },
    { providerName: 'Turkiye', dbName: 'Türkiye', label: 'Turkiye → Türkiye' },
    { providerName: 'Cape Verde Islands', dbName: 'Cape Verde', label: 'Cape Verde Islands → Cape Verde' },
    { providerName: 'Cabo Verde', dbName: 'Cape Verde', label: 'Cabo Verde → Cape Verde' },
    { providerName: 'Congo DR', dbName: 'DR Congo', label: 'Congo DR → DR Congo' },
    { providerName: 'Democratic Republic of Congo', dbName: 'DR Congo', label: 'Democratic Republic of Congo → DR Congo' },
    { providerName: 'Korea Republic', dbName: 'South Korea', label: 'Korea Republic → South Korea' },
    { providerName: "Ivory Coast", dbName: "Côte d'Ivoire", label: "Ivory Coast → Côte d'Ivoire" },
    { providerName: "Cote d'Ivoire", dbName: "Côte d'Ivoire", label: "Cote d'Ivoire → Côte d'Ivoire" },
  ];

  for (const { providerName, dbName, label } of ALIAS_CASES) {
    it(`alias: ${label}`, async () => {
      // First findFirst (exact by providerName) returns null — provider name not in DB
      (prisma.team.findFirst as Mock)
        .mockResolvedValueOnce(null)
        // Second findFirst (by aliased DB name) finds the team
        .mockResolvedValueOnce({ id: 'team-id' })
        // awayTeam exact + alias
        .mockResolvedValueOnce({ id: 'away-id' });
      // Fixture lookup — cascade returns existing seeded fixture
      (prisma.fixture.findFirst as Mock)
        .mockResolvedValueOnce({ id: 'fx-1', providerSource: null, providerFixtureId: null, importedAt: null, homeScore: null, awayScore: null });

      const fixtures = [
        {
          externalId: 'ext-test',
          homeTeamName: providerName,
          awayTeamName: 'Germany',
          kickoffAt: '2026-06-20T18:00:00Z',
          status: 'FINISHED',
          homeScore: 2,
          awayScore: 1,
        },
      ];

      await (svc as unknown as { upsertFixtures(f: typeof fixtures, s: string, p: string): Promise<unknown> }).upsertFixtures(
        fixtures, 'season-1', 'football-data-org',
      );

      // Should have tried the alias query with the DB-canonical name
      const allCalls = (prisma.team.findFirst as Mock).mock.calls;
      const queriedNames = allCalls.map((c: unknown[]) => {
        const arg = c[0] as { where: { name?: string } };
        return arg?.where?.name;
      }).filter(Boolean);
      expect(queriedNames).toContain(dbName);

      // Should not have created a new fixture (alias resolved correctly)
      expect(prisma.fixture.create).not.toHaveBeenCalled();
    });
  }
});
