import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PredictionCalibrationService } from './prediction-calibration.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  season: { findUnique: vi.fn(), findMany: vi.fn() },
  fixture: { findMany: vi.fn(), count: vi.fn() },
  scorePrediction: { count: vi.fn() },
  peerChallenge: { count: vi.fn() },
  predictionRulesConfig: { findUnique: vi.fn(), upsert: vi.fn() },
};

const mockSeason = { id: 'season-1', name: 'PSL 2026/27' };

describe('PredictionCalibrationService', () => {
  let service: PredictionCalibrationService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PredictionCalibrationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(PredictionCalibrationService);
  });

  describe('getCalibrationSeasons', () => {
    it('returns season calibration overview', async () => {
      mockPrisma.season.findMany.mockResolvedValue([
        {
          id: 'season-1',
          name: 'PSL 2026/27',
          slug: 'psl-2026',
          status: 'UPCOMING',
          isActive: false,
          startDate: new Date('2026-08-01'),
          predictionRulesConfig: { id: 'cfg-1', status: 'PROVISIONAL' },
          _count: { fixtures: 30 },
        },
      ]);
      const result = await service.getCalibrationSeasons();
      expect(result).toHaveLength(1);
      expect(result[0]!.hasPredictionRulesConfig).toBe(true);
      expect(result[0]!.rulesStatus).toBe('PROVISIONAL');
      expect(result[0]!.totalFixtures).toBe(30);
    });

    it('handles season with no rules config', async () => {
      mockPrisma.season.findMany.mockResolvedValue([
        {
          id: 'season-1',
          name: 'PSL 2026/27',
          slug: 'psl-2026',
          status: 'UPCOMING',
          isActive: false,
          startDate: new Date('2026-08-01'),
          predictionRulesConfig: null,
          _count: { fixtures: 0 },
        },
      ]);
      const result = await service.getCalibrationSeasons();
      expect(result[0]!.hasPredictionRulesConfig).toBe(false);
      expect(result[0]!.rulesStatus).toBeNull();
    });
  });

  describe('getCalibrationReadiness', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getCalibrationReadiness('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('returns READY_WITH_WARNINGS when no rules config', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      mockPrisma.predictionRulesConfig.findUnique.mockResolvedValue(null);
      mockPrisma.fixture.count
        .mockResolvedValueOnce(10)  // total
        .mockResolvedValueOnce(10)  // published
        .mockResolvedValueOnce(0);  // missing kickoff
      mockPrisma.fixture.findMany.mockResolvedValue([{ id: 'f1' }]);
      mockPrisma.scorePrediction.count.mockResolvedValue(0);

      const result = await service.getCalibrationReadiness('season-1');
      expect(result.activationStatus).toBe('READY_WITH_WARNINGS');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('returns READY when all checks pass', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      mockPrisma.predictionRulesConfig.findUnique.mockResolvedValue({
        id: 'cfg-1',
        status: 'PROVISIONAL',
        correctScorePoints: 10,
        correctGoalDifferencePoints: 5,
        correctResultPoints: 3,
      });
      mockPrisma.fixture.count
        .mockResolvedValueOnce(10)  // total
        .mockResolvedValueOnce(10)  // published
        .mockResolvedValueOnce(0);  // missing kickoff
      mockPrisma.fixture.findMany.mockResolvedValue([{ id: 'f1' }]);
      mockPrisma.scorePrediction.count.mockResolvedValue(0);

      const result = await service.getCalibrationReadiness('season-1');
      expect(result.activationStatus).toBe('READY');
    });
  });

  describe('getPredictionRules', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getPredictionRules('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('returns null config when none exists', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      mockPrisma.predictionRulesConfig.findUnique.mockResolvedValue(null);
      const result = await service.getPredictionRules('season-1');
      expect(result.config).toBeNull();
    });

    it('returns existing config', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      const cfg = { id: 'cfg-1', correctScorePoints: 10, status: 'PROVISIONAL' };
      mockPrisma.predictionRulesConfig.findUnique.mockResolvedValue(cfg);
      const result = await service.getPredictionRules('season-1');
      expect(result.config).toEqual(cfg);
    });
  });

  describe('createProvisionalRules', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.createProvisionalRules('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('upserts with PSL defaults', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      const cfg = { id: 'cfg-1', correctScorePoints: 10, status: 'PROVISIONAL' };
      mockPrisma.predictionRulesConfig.upsert.mockResolvedValue(cfg);
      const result = await service.createProvisionalRules('season-1');
      expect(result.provisional).toBe(true);
      expect(result.config).toEqual(cfg);
      expect(mockPrisma.predictionRulesConfig.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { seasonId: 'season-1' },
          update: {},
        }),
      );
    });
  });

  describe('updatePredictionRules', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.updatePredictionRules('bad-id', {})).rejects.toThrow(NotFoundException);
    });

    it('applies updates via upsert', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      mockPrisma.predictionRulesConfig.upsert.mockResolvedValue({ id: 'cfg-1', correctScorePoints: 12 });
      const result = await service.updatePredictionRules('season-1', { correctScorePoints: 12 });
      expect(result.config.correctScorePoints).toBe(12);
    });
  });

  describe('getFixtureEligibility', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getFixtureEligibility('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('marks unpublished fixture as ineligible', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      mockPrisma.fixture.findMany.mockResolvedValue([
        {
          id: 'f1',
          isPublished: false,
          kickoffAt: new Date(Date.now() + 86400000),
          status: 'SCHEDULED',
          round: 'GW1',
          homeTeam: { name: 'Chiefs', shortName: 'KC' },
          awayTeam: { name: 'Pirates', shortName: 'OP' },
          gameweek: null,
          _count: { predictions: 0 },
        },
      ]);
      const result = await service.getFixtureEligibility('season-1');
      expect(result.fixtures[0]!.isEligible).toBe(false);
      expect(result.fixtures[0]!.eligibilityReasons).toContain('Fixture not published');
    });

    it('marks published future fixture as eligible', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      mockPrisma.fixture.findMany.mockResolvedValue([
        {
          id: 'f1',
          isPublished: true,
          kickoffAt: new Date(Date.now() + 86400000),
          status: 'SCHEDULED',
          round: 'GW1',
          homeTeam: { name: 'Chiefs', shortName: 'KC' },
          awayTeam: { name: 'Pirates', shortName: 'OP' },
          gameweek: { id: 'gw1', name: 'GW1', predictionDeadlineAt: new Date(Date.now() + 3600000) },
          _count: { predictions: 5 },
        },
      ]);
      const result = await service.getFixtureEligibility('season-1');
      expect(result.fixtures[0]!.isEligible).toBe(true);
      expect(result.fixtures[0]!.eligibilityReasons).toHaveLength(0);
    });
  });

  describe('getLockReadiness', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getLockReadiness('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('returns lock status summary', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      const kickoffFuture = new Date(Date.now() + 86400000);
      const kickoffPast = new Date(Date.now() - 3600000);
      mockPrisma.fixture.findMany.mockResolvedValue([
        { id: 'f1', kickoffAt: kickoffFuture, status: 'SCHEDULED', gameweek: null, _count: { predictions: 3 } },
        { id: 'f2', kickoffAt: kickoffPast, status: 'SCHEDULED', gameweek: null, _count: { predictions: 2 } },
      ]);
      const result = await service.getLockReadiness('season-1');
      expect(result.totalOpen).toBe(1);
      expect(result.totalLocked).toBe(1);
    });
  });

  describe('getSettlementReadiness', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getSettlementReadiness('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('identifies fixtures ready for settlement', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      mockPrisma.fixture.findMany.mockResolvedValue([
        {
          id: 'f1',
          kickoffAt: new Date(Date.now() - 7200000),
          status: 'FINISHED',
          homeScore: 2,
          awayScore: 1,
          homeTeam: { shortName: 'KC' },
          awayTeam: { shortName: 'OP' },
          gameweek: { name: 'GW1' },
          _count: { predictions: 10 },
        },
      ]);
      const result = await service.getSettlementReadiness('season-1');
      expect(result.readyToSettle).toBe(1);
      expect(result.fixtures[0]!.canSettle).toBe(true);
      expect(result.fixtures[0]!.result).toBe('2-1');
    });
  });

  describe('getPeerChallengeReadiness', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getPeerChallengeReadiness('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('returns challenge counts for season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      mockPrisma.fixture.findMany.mockResolvedValue([{ id: 'f1' }]);
      mockPrisma.peerChallenge.count
        .mockResolvedValueOnce(5)  // pending
        .mockResolvedValueOnce(3)  // accepted
        .mockResolvedValueOnce(12); // settled
      const result = await service.getPeerChallengeReadiness('season-1');
      expect(result.pendingChallenges).toBe(5);
      expect(result.acceptedChallenges).toBe(3);
      expect(result.settledChallenges).toBe(12);
    });
  });

  describe('getActivationImpact', () => {
    it('throws NotFoundException for unknown season', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getActivationImpact('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('returns fixture and prediction summary', async () => {
      mockPrisma.season.findUnique.mockResolvedValue(mockSeason);
      mockPrisma.fixture.count
        .mockResolvedValueOnce(30)  // total
        .mockResolvedValueOnce(20); // published
      mockPrisma.predictionRulesConfig.findUnique.mockResolvedValue({
        status: 'PROVISIONAL',
        correctScorePoints: 10,
        correctGoalDifferencePoints: 5,
        correctResultPoints: 3,
      });
      mockPrisma.fixture.findMany.mockResolvedValue([{ id: 'f1' }]);
      mockPrisma.scorePrediction.count
        .mockResolvedValueOnce(50)  // total
        .mockResolvedValueOnce(10)  // locked
        .mockResolvedValueOnce(5);  // settled

      const result = await service.getActivationImpact('season-1');
      expect(result.fixtures.total).toBe(30);
      expect(result.fixtures.published).toBe(20);
      expect(result.predictions.total).toBe(50);
      expect(result.rulesConfig).not.toBeNull();
    });
  });
});
