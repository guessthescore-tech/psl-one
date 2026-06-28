import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { WorldCupBetaBackfillService } from './world-cup-beta-backfill.service';
import type { PrismaClient } from '@prisma/client';
import type { ProviderAdapter, ProviderPlayer, ProviderSeason, ProviderTeam } from './provider-adapter.interface';

vi.mock('./world-cup-beta-teams', () => ({
  TEAMS: [
    {
      externalId: 'MEX',
      slug: 'mexico',
      name: 'Mexico',
      shortName: 'MEX',
      country: 'Mexico',
      source: 'fifa-wc2026',
    },
    {
      externalId: 'RSA',
      slug: 'south-africa',
      name: 'South Africa',
      shortName: 'RSA',
      country: 'South Africa',
      source: 'fifa-wc2026',
    },
  ],
}));

vi.mock('./world-cup-beta-players', () => ({
  PLAYERS: [
    {
      teamExternalId: 'MEX',
      name: 'Guillermo Ochoa',
      position: 'GOALKEEPER',
      nationality: 'Mexican',
      number: 1,
      source: 'fifa-wc2026',
    },
    {
      teamExternalId: 'MEX',
      name: 'Jorge Sánchez',
      position: 'DEFENDER',
      nationality: 'Mexican',
      number: 2,
      source: 'fifa-wc2026',
    },
    {
      teamExternalId: 'RSA',
      name: 'Ronwen Williams',
      position: 'GOALKEEPER',
      nationality: 'South African',
      number: 1,
      source: 'fifa-wc2026',
    },
  ],
}));

type PrismaMock = {
  competition: {
    findFirst: Mock;
    upsert: Mock;
  };
  season: {
    findFirst: Mock;
    upsert: Mock;
  };
  fantasyRulesConfig: {
    findUnique: Mock;
    upsert: Mock;
  };
  predictionRulesConfig: {
    findUnique: Mock;
    upsert: Mock;
  };
  team: {
    findFirst: Mock;
    update: Mock;
    create: Mock;
  };
  seasonTeam: {
    upsert: Mock;
  };
  player: {
    findFirst: Mock;
    findMany: Mock;
    update: Mock;
    create: Mock;
  };
  seasonSquadRegistration: {
    upsert: Mock;
  };
  fantasyPlayerPrice: {
    upsert: Mock;
  };
};

function makePrismaMock(): PrismaMock {
  return {
    competition: {
      findFirst: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 'competition-1' }),
    },
    season: {
      findFirst: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 'season-1' }),
    },
    fantasyRulesConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
    },
    predictionRulesConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
    },
    team: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      create: vi.fn(),
    },
    seasonTeam: {
      upsert: vi.fn().mockResolvedValue({}),
    },
    player: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
      create: vi.fn(),
    },
    seasonSquadRegistration: {
      upsert: vi.fn().mockResolvedValue({}),
    },
    fantasyPlayerPrice: {
      upsert: vi.fn().mockResolvedValue({}),
    },
  };
}

function makeProviderMock(): ProviderAdapter {
  const seasons: ProviderSeason[] = [
    {
      externalId: 'sm-season-2026',
      name: 'FIFA World Cup 2026',
      competitionName: 'FIFA World Cup',
      startDate: '2026-06-11',
      endDate: '2026-07-19',
    },
  ];

  const teams: ProviderTeam[] = [
    { externalId: 'MEX', name: 'Mexico', shortName: 'MEX', countryCode: 'MX' },
    { externalId: 'RSA', name: 'South Africa', shortName: 'RSA', countryCode: 'ZA' },
  ];

  const playersByTeam: Record<string, ProviderPlayer[]> = {
    MEX: [
      { externalId: 'sm-mex-1', name: 'Guillermo Ochoa', position: 'GK', teamExternalId: 'MEX' },
      { externalId: 'sm-mex-2', name: 'Jorge Sánchez', position: 'RB', teamExternalId: 'MEX' },
    ],
    RSA: [
      { externalId: 'sm-rsa-1', name: 'Ronwen Williams', position: 'GK', teamExternalId: 'RSA' },
    ],
  };

  return {
    name: 'sportmonks',
    health: vi.fn().mockResolvedValue({ available: true, provider: 'sportmonks', message: 'ok' }),
    getSeasons: vi.fn().mockResolvedValue(seasons),
    getFixtures: vi.fn().mockResolvedValue([]),
    getTeams: vi.fn().mockResolvedValue(teams),
    getPlayers: vi.fn().mockImplementation(async (teamExternalId: string) => playersByTeam[teamExternalId] ?? []),
    getStandings: vi.fn().mockResolvedValue([]),
  };
}

describe('WorldCupBetaBackfillService', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env['ALLOW_WORLD_CUP_WRITE'];
    delete process.env['SPORTMONKS_API_KEY'];
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('dry-run uses seed data and does not write anything', async () => {
    const prisma = makePrismaMock();
    const svc = new WorldCupBetaBackfillService(prisma as unknown as PrismaClient, null);

    const result = await svc.run({ dryRun: true });

    expect(result.provider).toBe('seed-only');
    expect(result.fallbackToSeedData).toBe(true);
    expect(result.teamsPlanned).toBe(2);
    expect(result.playersPlanned).toBe(3);
    expect(result.fantasyRulesUpserted).toBe(1);
    expect(result.predictionRulesUpserted).toBe(1);
    expect(result.seasonTeamsUpserted).toBe(0);
    expect(result.fantasyPricesUpserted).toBe(3);
    expect(result.squadRegistrationsUpserted).toBe(3);

    expect(prisma.competition.upsert).not.toHaveBeenCalled();
    expect(prisma.season.upsert).not.toHaveBeenCalled();
    expect(prisma.team.create).not.toHaveBeenCalled();
    expect(prisma.player.create).not.toHaveBeenCalled();
    expect(prisma.fantasyPlayerPrice.upsert).not.toHaveBeenCalled();
    expect(prisma.seasonSquadRegistration.upsert).not.toHaveBeenCalled();
  });

  it('requires the confirm token for non-dry-run execution', async () => {
    const prisma = makePrismaMock();
    const svc = new WorldCupBetaBackfillService(prisma as unknown as PrismaClient, null);

    await expect(svc.run({ dryRun: false, confirm: 'WRONG' })).rejects.toThrow(
      'Confirmed backfill requires --confirm=BACKFILL_WORLD_CUP_BETA',
    );
  });

  it('requires ALLOW_WORLD_CUP_WRITE=true for non-dry-run execution', async () => {
    const prisma = makePrismaMock();
    const svc = new WorldCupBetaBackfillService(prisma as unknown as PrismaClient, null);

    await expect(
      svc.run({ dryRun: false, confirm: 'BACKFILL_WORLD_CUP_BETA' }),
    ).rejects.toThrow('ALLOW_WORLD_CUP_WRITE=true is required for World Cup beta backfill');
  });

  it('confirmed mode upserts the beta dataset and backfills provider ids', async () => {
    vi.stubEnv('ALLOW_WORLD_CUP_WRITE', 'true');

    const prisma = makePrismaMock();
    const provider = makeProviderMock();
    let teamCreateCount = 0;
    let playerCreateCount = 0;

    (prisma.team.create as Mock).mockImplementation(async (args: any) => {
      teamCreateCount += 1;
      const data = args.data as { slug: string };
      return { id: teamCreateCount === 1 ? 'team-mex' : 'team-rsa', slug: data.slug };
    });
    (prisma.player.create as Mock).mockImplementation(async (args: any) => {
      playerCreateCount += 1;
      const data = args.data as { name: string };
      return { id: `player-${playerCreateCount}`, name: data.name };
    });
    (prisma.player.findMany as Mock).mockImplementation(async (args: any) => {
      const where = args.where as { id: { in: string[] } };
      const byId = new Map([
        ['player-1', { id: 'player-1', position: 'GOALKEEPER' }],
        ['player-2', { id: 'player-2', position: 'DEFENDER' }],
        ['player-3', { id: 'player-3', position: 'GOALKEEPER' }],
      ]);
      return where.id.in
        .map((id) => byId.get(id))
        .filter((value): value is { id: string; position: string } => Boolean(value));
    });

    const svc = new WorldCupBetaBackfillService(prisma as unknown as PrismaClient, provider);
    const result = await svc.run({ dryRun: false, confirm: 'BACKFILL_WORLD_CUP_BETA' });

    expect(result.provider).toBe('sportmonks');
    expect(result.fallbackToSeedData).toBe(false);
    expect(result.teamsMatchedToProvider).toBe(2);
    expect(result.playersMatchedToProvider).toBe(3);
    expect(result.playersExternalIdsBackfilled).toBe(3);
    expect(result.seasonTeamsUpserted).toBe(2);
    expect(result.fantasyRulesUpserted).toBe(1);
    expect(result.predictionRulesUpserted).toBe(1);
    expect(result.squadRegistrationsUpserted).toBe(3);
    expect(result.fantasyPricesUpserted).toBe(3);
    expect(result.unmappedTeams).toEqual([]);
    expect(result.unmappedPlayers).toEqual([]);

    expect(prisma.fantasyRulesConfig.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { seasonId: 'season-1' },
        create: expect.objectContaining({ seasonId: 'season-1', halfwayGameweek: 5, seasonGameweekCount: 9 }),
      }),
    );
    expect(prisma.predictionRulesConfig.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { seasonId: 'season-1' },
        create: expect.objectContaining({ seasonId: 'season-1', correctScorePoints: 10, status: 'PROVISIONAL' }),
      }),
    );
    expect(prisma.seasonSquadRegistration.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          seasonId: 'season-1',
          status: 'PROVISIONAL',
          source: 'IMPORT',
        }),
        update: expect.objectContaining({
          teamId: expect.any(String),
        }),
      }),
    );
    expect(prisma.fantasyPlayerPrice.upsert).toHaveBeenCalledTimes(3);
    expect(prisma.competition.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.season.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.team.create).toHaveBeenCalledTimes(2);
    expect(prisma.player.create).toHaveBeenCalledTimes(3);
  });
});
