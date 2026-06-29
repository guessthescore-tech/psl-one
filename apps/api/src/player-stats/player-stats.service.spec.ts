import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PlayerStatsService } from './player-stats.service';
import type { PrismaService } from '../prisma/prisma.service';
import { PlayerMatchStatsSource, PlayerMatchStatsStatus } from '@prisma/client';

const SEASON = { id: 'season-1', name: 'PSL 2026/27', slug: 'psl-2026-27', status: 'UPCOMING' };
const PLAYER = { id: 'player-1', name: 'Sipho Dlamini', position: 'FORWARD', number: 10, team: { id: 'team-1', name: 'Kaizer Chiefs', slug: 'kaizer-chiefs' } };
const FIXTURE = {
  id: 'fixture-1', seasonId: 'season-1', gameweekId: 'gw-1',
  kickoffAt: new Date('2026-09-01'), homeScore: 2, awayScore: 1, status: 'FINISHED',
  homeTeam: { id: 'team-1', name: 'Kaizer Chiefs', shortName: 'Chiefs' },
  awayTeam: { id: 'team-2', name: 'Orlando Pirates', shortName: 'Pirates' },
};
const TEAM = { id: 'team-1', name: 'Kaizer Chiefs', shortName: 'Chiefs', slug: 'kaizer-chiefs' };
const GAMEWEEK = { id: 'gw-1', name: 'Gameweek 1', round: 1, season: SEASON };

const makeStat = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'stat-1',
  playerId: 'player-1',
  fixtureId: 'fixture-1',
  teamId: 'team-1',
  seasonId: 'season-1',
  gameweekId: 'gw-1',
  status: PlayerMatchStatsStatus.PUBLISHED,
  source: PlayerMatchStatsSource.MANUAL,
  minutesPlayed: 90,
  goals: 1,
  assists: 0,
  ownGoals: 0,
  yellowCards: 0,
  redCards: 0,
  penaltiesMissed: 0,
  penaltiesSaved: 0,
  saves: 0,
  goalsConceded: 0,
  cleanSheet: false,
  started: true,
  cameOnMinute: null,
  subbedOffMinute: null,
  shotsOnTarget: 2,
  shotsTotal: 4,
  keyPasses: 1,
  tacklesWon: 0,
  interceptions: 0,
  blockedShots: 0,
  aerialDuelsWon: 1,
  distanceRun: null,
  passAccuracy: null,
  dribbleSuccess: null,
  rating: 7.5,
  didNotPlay: false,
  providerStatId: null,
  notes: null,
  verifiedAt: null,
  verifiedByUserId: null,
  publishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  player: PLAYER,
  fixture: FIXTURE,
  team: TEAM,
  season: SEASON,
  gameweek: GAMEWEEK,
  ...overrides,
});

const makePrisma = () => ({
  player: {
    findUnique: vi.fn().mockResolvedValue({ ...PLAYER, playerStats: [] }),
  },
  fixture: {
    findUnique: vi.fn().mockResolvedValue(FIXTURE),
    count: vi.fn().mockResolvedValue(5),
  },
  team: {
    findUnique: vi.fn().mockResolvedValue(TEAM),
  },
  season: {
    findFirst: vi.fn().mockResolvedValue(SEASON),
    findUnique: vi.fn().mockResolvedValue(SEASON),
  },
  gameweek: {
    findUnique: vi.fn().mockResolvedValue(GAMEWEEK),
  },
  playerMatchStats: {
    findUnique: vi.fn().mockResolvedValue(makeStat()),
    findMany: vi.fn().mockResolvedValue([makeStat()]),
    count: vi.fn().mockResolvedValue(10),
    create: vi.fn().mockResolvedValue(makeStat()),
    update: vi.fn().mockResolvedValue(makeStat()),
    updateMany: vi.fn().mockResolvedValue({ count: 5 }),
    upsert: vi.fn().mockResolvedValue(makeStat()),
    delete: vi.fn().mockResolvedValue(makeStat()),
  },
  adminAuditLog: {
    create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
  },
});

describe('PlayerStatsService', () => {
  let service: PlayerStatsService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrisma();
    service = new PlayerStatsService(prisma as unknown as PrismaService);
  });

  // ── getPlayerSeasonStats ──────────────────────────────────────────────

  describe('getPlayerSeasonStats', () => {
    it('returns player with totals and matches', async () => {
      const result = await service.getPlayerSeasonStats('player-1', 'season-1');
      expect(result.player.id).toBe('player-1');
      expect(result.totals).toBeDefined();
      expect(result.matches).toHaveLength(1);
    });

    it('resolves season slug and returns player stats', async () => {
      const result = await service.getPlayerSeasonStats('player-1', 'psl-2026-27');
      expect(result.seasonId).toBe('season-1');
      expect(prisma.season.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ id: 'psl-2026-27' }, { slug: 'psl-2026-27' }] },
        }),
      );
    });

    it('throws NotFoundException for unknown player', async () => {
      prisma.player.findUnique.mockResolvedValue(null);
      await expect(service.getPlayerSeasonStats('bad-id', 'season-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getPlayerMatchStat ────────────────────────────────────────────────

  describe('getPlayerMatchStat', () => {
    it('returns published stat', async () => {
      const result = await service.getPlayerMatchStat('player-1', 'fixture-1');
      expect(result.id).toBe('stat-1');
    });

    it('throws NotFoundException when stat is DRAFT', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.DRAFT }));
      await expect(service.getPlayerMatchStat('player-1', 'fixture-1')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when stat not found', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(null);
      await expect(service.getPlayerMatchStat('player-1', 'fixture-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── listFixtureStats ──────────────────────────────────────────────────

  describe('listFixtureStats', () => {
    it('returns fixture with stats array', async () => {
      const result = await service.listFixtureStats('fixture-1');
      expect(result.fixture.id).toBe('fixture-1');
      expect(result.stats).toHaveLength(1);
    });

    it('throws NotFoundException for unknown fixture', async () => {
      prisma.fixture.findUnique.mockResolvedValue(null);
      await expect(service.listFixtureStats('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── listSeasonTopPerformers ───────────────────────────────────────────

  describe('listSeasonTopPerformers', () => {
    it('returns season with topScorers and topAssists', async () => {
      const result = await service.listSeasonTopPerformers('season-1', 10);
      expect(result.season.id).toBe('season-1');
      expect(result.topScorers).toBeDefined();
      expect(result.topAssists).toBeDefined();
    });

    it('resolves season slug', async () => {
      const result = await service.listSeasonTopPerformers('psl-2026-27', 10);
      expect(result.season.id).toBe('season-1');
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findFirst.mockResolvedValue(null);
      await expect(service.listSeasonTopPerformers('bad', 10)).rejects.toThrow(NotFoundException);
    });
  });

  // ── listGameweekStats ─────────────────────────────────────────────────

  describe('listGameweekStats', () => {
    it('returns gameweek with stats', async () => {
      const result = await service.listGameweekStats('gw-1');
      expect(result.gameweek.id).toBe('gw-1');
      expect(result.stats).toHaveLength(1);
    });

    it('throws NotFoundException for unknown gameweek', async () => {
      prisma.gameweek.findUnique.mockResolvedValue(null);
      await expect(service.listGameweekStats('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getPlayerProfile ──────────────────────────────────────────────────

  describe('getPlayerProfile', () => {
    it('returns player profile with career stats summary', async () => {
      const result = await service.getPlayerProfile('player-1');
      expect(result.id).toBe('player-1');
    });

    it('throws NotFoundException for unknown player', async () => {
      prisma.player.findUnique.mockResolvedValue(null);
      await expect(service.getPlayerProfile('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── listSeasonSquadStats ──────────────────────────────────────────────

  describe('listSeasonSquadStats', () => {
    it('returns team with aggregated squad stats', async () => {
      const result = await service.listSeasonSquadStats('season-1', 'team-1');
      expect(result.team.id).toBe('team-1');
      expect(result.squadStats).toBeDefined();
    });

    it('resolves season slug', async () => {
      const result = await service.listSeasonSquadStats('psl-2026-27', 'team-1');
      expect(result.seasonId).toBe('season-1');
    });

    it('throws NotFoundException for unknown team', async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      await expect(service.listSeasonSquadStats('season-1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminListStats ────────────────────────────────────────────────────

  describe('adminListStats', () => {
    it('returns stats with total count', async () => {
      const result = await service.adminListStats('season-1');
      expect(result.stats).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by status when provided', async () => {
      await service.adminListStats(undefined, undefined, PlayerMatchStatsStatus.DRAFT);
      expect(prisma.playerMatchStats.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: PlayerMatchStatsStatus.DRAFT }) }),
      );
    });
  });

  // ── adminGetStat ──────────────────────────────────────────────────────

  describe('adminGetStat', () => {
    it('returns the stat record', async () => {
      const result = await service.adminGetStat('stat-1');
      expect(result.id).toBe('stat-1');
    });

    it('throws NotFoundException for unknown id', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(null);
      await expect(service.adminGetStat('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminUpsertStat ───────────────────────────────────────────────────

  describe('adminUpsertStat', () => {
    it('upserts a stat and returns it', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(null);
      const result = await service.adminUpsertStat({ playerId: 'player-1', fixtureId: 'fixture-1', goals: 1 });
      expect(result).toBeDefined();
      expect(prisma.playerMatchStats.upsert).toHaveBeenCalled();
    });

    it('throws ForbiddenException when stat is LOCKED', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.LOCKED }));
      await expect(service.adminUpsertStat({ playerId: 'player-1', fixtureId: 'fixture-1' })).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException for unknown fixture', async () => {
      prisma.fixture.findUnique.mockResolvedValue(null);
      await expect(service.adminUpsertStat({ playerId: 'player-1', fixtureId: 'bad' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminVerifyStat ───────────────────────────────────────────────────

  describe('adminVerifyStat', () => {
    it('transitions status to VERIFIED and stamps verifiedAt', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.DRAFT }));
      prisma.playerMatchStats.update.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.VERIFIED }));
      const result = await service.adminVerifyStat('stat-1', 'admin-user');
      expect(prisma.playerMatchStats.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: PlayerMatchStatsStatus.VERIFIED }) }),
      );
      expect(result.status).toBe(PlayerMatchStatsStatus.VERIFIED);
    });

    it('throws ForbiddenException when stat is LOCKED', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.LOCKED }));
      await expect(service.adminVerifyStat('stat-1', 'user')).rejects.toThrow(ForbiddenException);
    });
  });

  // ── adminPublishStat ──────────────────────────────────────────────────

  describe('adminPublishStat', () => {
    it('publishes a VERIFIED stat', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.VERIFIED }));
      prisma.playerMatchStats.update.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.PUBLISHED }));
      await service.adminPublishStat('stat-1');
      expect(prisma.playerMatchStats.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: PlayerMatchStatsStatus.PUBLISHED }) }),
      );
    });

    it('throws ForbiddenException for DRAFT stat', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.DRAFT }));
      await expect(service.adminPublishStat('stat-1')).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException for LOCKED stat', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.LOCKED }));
      await expect(service.adminPublishStat('stat-1')).rejects.toThrow(ForbiddenException);
    });
  });

  // ── adminLockStat ─────────────────────────────────────────────────────

  describe('adminLockStat', () => {
    it('locks a stat', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.PUBLISHED }));
      prisma.playerMatchStats.update.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.LOCKED }));
      await service.adminLockStat('stat-1');
      expect(prisma.playerMatchStats.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: PlayerMatchStatsStatus.LOCKED } }),
      );
    });

    it('throws NotFoundException for unknown id', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(null);
      await expect(service.adminLockStat('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminBulkPublishFixture ───────────────────────────────────────────

  describe('adminBulkPublishFixture', () => {
    it('publishes all VERIFIED stats for a fixture', async () => {
      prisma.playerMatchStats.updateMany.mockResolvedValue({ count: 22 });
      const result = await service.adminBulkPublishFixture('fixture-1');
      expect(result.published).toBe(22);
      expect(result.fixtureId).toBe('fixture-1');
    });

    it('throws NotFoundException for unknown fixture', async () => {
      prisma.fixture.findUnique.mockResolvedValue(null);
      await expect(service.adminBulkPublishFixture('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminDeleteStat ───────────────────────────────────────────────────

  describe('adminDeleteStat', () => {
    it('deletes a DRAFT stat', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.DRAFT }));
      const result = await service.adminDeleteStat('stat-1');
      expect(result.deleted).toBe(true);
    });

    it('throws ForbiddenException for LOCKED stat', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.LOCKED }));
      await expect(service.adminDeleteStat('stat-1')).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException for PUBLISHED stat', async () => {
      prisma.playerMatchStats.findUnique.mockResolvedValue(makeStat({ status: PlayerMatchStatsStatus.PUBLISHED }));
      await expect(service.adminDeleteStat('stat-1')).rejects.toThrow(ForbiddenException);
    });
  });

  // ── adminGetSeasonReadiness ───────────────────────────────────────────

  describe('adminGetSeasonReadiness', () => {
    it('returns NO_DATA when no stats exist', async () => {
      prisma.playerMatchStats.count.mockResolvedValue(0);
      const result = await service.adminGetSeasonReadiness('season-1');
      expect(result.readiness).toBe('NO_DATA');
    });

    it('returns PROVISIONAL when some stats exist', async () => {
      prisma.playerMatchStats.count
        .mockResolvedValueOnce(5)   // total
        .mockResolvedValueOnce(5)   // draft
        .mockResolvedValueOnce(0)   // verified
        .mockResolvedValueOnce(0)   // published
        .mockResolvedValueOnce(0);  // locked
      const result = await service.adminGetSeasonReadiness('season-1');
      expect(result.readiness).toBe('PROVISIONAL');
    });

    it('returns PUBLISHED when all stats are published or locked', async () => {
      prisma.playerMatchStats.count
        .mockResolvedValueOnce(10)  // total
        .mockResolvedValueOnce(0)   // draft
        .mockResolvedValueOnce(0)   // verified
        .mockResolvedValueOnce(8)   // published
        .mockResolvedValueOnce(2);  // locked
      const result = await service.adminGetSeasonReadiness('season-1');
      expect(result.readiness).toBe('PUBLISHED');
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findFirst.mockResolvedValue(null);
      await expect(service.adminGetSeasonReadiness('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── checkPlayerStatsReadiness ─────────────────────────────────────────

  describe('checkPlayerStatsReadiness', () => {
    it('returns OK when no completed fixtures', async () => {
      prisma.fixture.count.mockResolvedValue(0);
      const result = await service.checkPlayerStatsReadiness('season-1');
      expect(result.status).toBe('OK');
    });

    it('returns WARNING when completed fixtures have no stats', async () => {
      prisma.fixture.count.mockResolvedValue(3);
      prisma.playerMatchStats.count.mockResolvedValue(0);
      const result = await service.checkPlayerStatsReadiness('season-1');
      expect(result.status).toBe('WARNING');
    });

    it('returns WARNING when some stats are still DRAFT', async () => {
      prisma.fixture.count.mockResolvedValue(3);
      prisma.playerMatchStats.count
        .mockResolvedValueOnce(30)  // total
        .mockResolvedValueOnce(5);  // draft
      const result = await service.checkPlayerStatsReadiness('season-1');
      expect(result.status).toBe('WARNING');
    });

    it('returns OK when all stats are verified or above', async () => {
      prisma.fixture.count.mockResolvedValue(3);
      prisma.playerMatchStats.count
        .mockResolvedValueOnce(30)  // total
        .mockResolvedValueOnce(0);  // draft
      const result = await service.checkPlayerStatsReadiness('season-1');
      expect(result.status).toBe('OK');
    });
  });
});
