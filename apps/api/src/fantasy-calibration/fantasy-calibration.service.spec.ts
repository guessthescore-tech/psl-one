import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { PlayerPosition } from '@prisma/client';
import { FantasyCalibrationService } from './fantasy-calibration.service';

const mockPrisma = {
  season: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  fantasyRulesConfig: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
  fantasyPlayerPrice: {
    count: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
  },
  fantasyPlayerPriceHistory: {
    create: vi.fn(),
  },
  seasonSquadRegistration: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  seasonTeam: {
    findMany: vi.fn(),
  },
  player: {
    findUnique: vi.fn(),
  },
  gameweek: {
    count: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  fixture: {
    count: vi.fn(),
  },
  fantasyTeam: {
    count: vi.fn(),
  },
  scorePrediction: {
    count: vi.fn(),
  },
};

describe('FantasyCalibrationService', () => {
  let service: FantasyCalibrationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FantasyCalibrationService(mockPrisma as any);
  });

  describe('getCalibrationSeasons', () => {
    it('maps seasons with calibration metadata', async () => {
      mockPrisma.season.findMany.mockResolvedValue([
        {
          id: 's1', name: 'PSL 2026', slug: 'psl-2026', isActive: true,
          rulesConfig: { id: 'rc1' },
          _count: { playerPrices: 96, gameweeks: 30 },
          startDate: new Date(),
        },
      ]);

      const result = await service.getCalibrationSeasons();
      expect(result).toHaveLength(1);
      expect(result[0]!.hasRulesConfig).toBe(true);
      expect(result[0]!.playerPriceCount).toBe(96);
    });
  });

  describe('getCalibrationReadiness', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getCalibrationReadiness('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('returns BLOCKED when no gameweeks', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: 's1', name: 'PSL', rulesConfig: { id: 'rc1', seasonGameweekCount: 30, halfwayGameweek: 15 } });
      mockPrisma.fantasyPlayerPrice.count.mockResolvedValue(96);
      mockPrisma.seasonSquadRegistration.count.mockResolvedValue(96);
      // gameweek.count: total=0, gameweeksWithFixtures=0
      mockPrisma.gameweek.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPrisma.fixture.count.mockResolvedValue(30);

      const result = await service.getCalibrationReadiness('s1');
      expect(result.status).toBe('BLOCKED');
      expect(result.blockers.some(b => b.code === 'NO_GAMEWEEKS')).toBe(true);
    });

    it('returns READY_WITH_WARNINGS when rules config missing', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: 's1', name: 'PSL', rulesConfig: null });
      mockPrisma.fantasyPlayerPrice.count.mockResolvedValue(96);
      mockPrisma.seasonSquadRegistration.count.mockResolvedValue(96);
      // gameweek.count: total=30, gameweeksWithFixtures=30
      mockPrisma.gameweek.count
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(30);
      mockPrisma.fixture.count.mockResolvedValue(30);

      const result = await service.getCalibrationReadiness('s1');
      expect(result.status).toBe('READY_WITH_WARNINGS');
      expect(result.warnings.some(w => w.code === 'NO_RULES_CONFIG')).toBe(true);
    });

    it('returns READY when all checks pass', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({
        id: 's1', name: 'PSL',
        rulesConfig: { id: 'rc1', seasonGameweekCount: 30, halfwayGameweek: 15 },
      });
      mockPrisma.fantasyPlayerPrice.count.mockResolvedValue(96);
      mockPrisma.seasonSquadRegistration.count.mockResolvedValue(96);
      // gameweek.count: total=30, gameweeksWithFixtures=30
      mockPrisma.gameweek.count
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(30);
      mockPrisma.fixture.count.mockResolvedValue(30);

      const result = await service.getCalibrationReadiness('s1');
      expect(result.status).toBe('READY');
      expect(result.blockers).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('getFantasyRules', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getFantasyRules('bad')).rejects.toThrow(NotFoundException);
    });

    it('returns null when no config exists', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: 's1', name: 'PSL' });
      mockPrisma.fantasyRulesConfig.findUnique.mockResolvedValue(null);
      const result = await service.getFantasyRules('s1');
      expect(result).toBeNull();
    });

    it('returns config when it exists', async () => {
      const config = { seasonId: 's1', seasonGameweekCount: 30, halfwayGameweek: 15 };
      mockPrisma.season.findUnique.mockResolvedValue({ id: 's1', name: 'PSL' });
      mockPrisma.fantasyRulesConfig.findUnique.mockResolvedValue(config);
      const result = await service.getFantasyRules('s1');
      expect(result).toEqual(config);
    });
  });

  describe('createProvisionalRules', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.createProvisionalRules('bad')).rejects.toThrow(NotFoundException);
    });

    it('upserts rules with PSL provisional overrides', async () => {
      const season = { id: 's1', name: 'PSL' };
      const config = { seasonId: 's1', seasonGameweekCount: 30, halfwayGameweek: 15 };
      mockPrisma.season.findUnique.mockResolvedValue(season);
      mockPrisma.fantasyRulesConfig.upsert.mockResolvedValue(config);

      const result = await service.createProvisionalRules('s1');
      expect(result).toEqual(config);
      expect(mockPrisma.fantasyRulesConfig.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { seasonId: 's1' },
          create: expect.objectContaining({ halfwayGameweek: 15, seasonGameweekCount: 30 }),
          update: {},
        }),
      );
    });
  });

  describe('generateProvisionalPrices', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.generateProvisionalPrices('bad')).rejects.toThrow(NotFoundException);
    });

    it('generates prices only for unpriced players', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: 's1', name: 'PSL' });
      mockPrisma.seasonSquadRegistration.findMany.mockResolvedValue([
        { playerId: 'p1', teamId: 't1', player: { id: 'p1', position: PlayerPosition.GOALKEEPER } },
        { playerId: 'p2', teamId: 't1', player: { id: 'p2', position: PlayerPosition.DEFENDER } },
        { playerId: 'p3', teamId: 't1', player: { id: 'p3', position: PlayerPosition.MIDFIELDER } },
      ]);
      // p1 already priced
      mockPrisma.fantasyPlayerPrice.findMany.mockResolvedValue([{ playerId: 'p1' }]);
      mockPrisma.fantasyPlayerPrice.create.mockResolvedValue({});
      mockPrisma.fantasyPlayerPriceHistory.create.mockResolvedValue({});

      const result = await service.generateProvisionalPrices('s1');
      expect(result.generated).toBe(2);
      expect(result.skipped).toBe(1);
      expect(mockPrisma.fantasyPlayerPrice.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('updatePlayerPrice', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.updatePlayerPrice('bad', 'p1', 60)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for unknown player', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: 's1' });
      mockPrisma.player.findUnique.mockResolvedValue(null);
      await expect(service.updatePlayerPrice('s1', 'bad', 60)).rejects.toThrow(NotFoundException);
    });

    it('upserts price and creates history', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: 's1' });
      mockPrisma.player.findUnique.mockResolvedValue({ id: 'p1', name: 'Player 1' });
      mockPrisma.fantasyPlayerPrice.upsert.mockResolvedValue({ playerId: 'p1', seasonId: 's1', price: 65 });
      mockPrisma.fantasyPlayerPriceHistory.create.mockResolvedValue({});

      const result = await service.updatePlayerPrice('s1', 'p1', 65);
      expect(result.price).toBe(65);
      expect(mockPrisma.fantasyPlayerPriceHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ reason: 'ADMIN_CALIBRATION' }) }),
      );
    });
  });

  describe('deriveGameweekDeadlines', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.deriveGameweekDeadlines('bad')).rejects.toThrow(NotFoundException);
    });

    it('skips gameweeks with no published fixtures', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({ id: 's1' });
      mockPrisma.gameweek.findMany.mockResolvedValue([
        { id: 'gw1', gameweekNumber: 1, fixtures: [] },
        {
          id: 'gw2', gameweekNumber: 2,
          fixtures: [{ kickoffAt: new Date('2026-08-10T15:00:00Z') }],
        },
      ]);
      mockPrisma.gameweek.update.mockResolvedValue({});

      const result = await service.deriveGameweekDeadlines('s1');
      expect(result.updated).toBe(1);
      expect(result.skipped).toBe(1);
      expect(mockPrisma.gameweek.update).toHaveBeenCalledTimes(1);
    });

    it('sets deadline 90 minutes before earliest fixture', async () => {
      const kickoff = new Date('2026-08-10T15:00:00Z');
      mockPrisma.season.findUnique.mockResolvedValue({ id: 's1' });
      mockPrisma.gameweek.findMany.mockResolvedValue([
        { id: 'gw1', gameweekNumber: 1, fixtures: [{ kickoffAt: kickoff }] },
      ]);
      mockPrisma.gameweek.update.mockResolvedValue({});

      await service.deriveGameweekDeadlines('s1');

      const expected = new Date(kickoff.getTime() - 90 * 60 * 1000);
      expect(mockPrisma.gameweek.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            transferDeadlineAt: expected,
            predictionDeadlineAt: expected,
          }),
        }),
      );
    });
  });

  describe('getActivationImpact', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getActivationImpact('bad')).rejects.toThrow(NotFoundException);
    });

    it('includes warnings for unconfigured items', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({
        id: 's1', name: 'PSL 2026', rulesConfig: null,
      });
      mockPrisma.fantasyTeam.count.mockResolvedValue(0);
      mockPrisma.scorePrediction.count.mockResolvedValue(0);
      mockPrisma.fantasyPlayerPrice.count.mockResolvedValue(0);
      mockPrisma.gameweek.count.mockResolvedValue(0);

      const result = await service.getActivationImpact('s1');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.rulesConfigured).toBe(false);
    });

    it('returns full impact summary', async () => {
      mockPrisma.season.findUnique.mockResolvedValue({
        id: 's1', name: 'PSL 2026',
        rulesConfig: { id: 'rc1' },
      });
      mockPrisma.fantasyTeam.count.mockResolvedValue(5);
      mockPrisma.scorePrediction.count.mockResolvedValue(10);
      mockPrisma.fantasyPlayerPrice.count.mockResolvedValue(96);
      mockPrisma.gameweek.count.mockResolvedValue(30);

      const result = await service.getActivationImpact('s1');
      expect(result.fantasyTeamsAffected).toBe(5);
      expect(result.playerPricesSet).toBe(96);
      expect(result.gameweeksConfigured).toBe(30);
      expect(result.rulesConfigured).toBe(true);
    });
  });
});
