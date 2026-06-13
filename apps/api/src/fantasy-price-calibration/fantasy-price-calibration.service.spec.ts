import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FantasyPriceCalibrationService } from './fantasy-price-calibration.service';
import type { PrismaService } from '../prisma/prisma.service';
import { FantasyPriceCalibrationBatchStatus } from '@prisma/client';

const SEASON = { id: 'season-1', name: 'PSL 2026/27', slug: 'psl-2026-27', isActive: false, status: 'UPCOMING' };
const PLAYER_ID = 'player-1';

const makeCalibBatch = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'calib-1',
  seasonId: 'season-1',
  status: FantasyPriceCalibrationBatchStatus.VALIDATED,
  minPrice: 40,
  maxPrice: 200,
  defaultPrice: 55,
  missingPriceCount: 0,
  invalidPriceCount: 0,
  calibratedPlayerCount: 96,
  publishedPlayerCount: 0,
  createdByUserId: null,
  validatedAt: new Date(),
  publishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePrisma = () => ({
  season: {
    findUnique: vi.fn().mockResolvedValue({ ...SEASON, rulesConfig: { minPrice: 40, maxPrice: 200, defaultPrice: 55 } }),
    findMany: vi.fn().mockResolvedValue([{
      ...SEASON,
      rulesConfig: { id: 'rc-1', minPrice: 40, maxPrice: 200, defaultPrice: 55 },
      _count: { playerPrices: 96, squadRegistrations: 96, fantasyPriceCalibrationBatches: 0 },
    }]),
  },
  seasonSquadRegistration: {
    count: vi.fn().mockResolvedValue(96),
    findMany: vi.fn().mockResolvedValue([
      {
        playerId: PLAYER_ID,
        teamId: 'team-1',
        status: 'CONFIRMED',
        player: { id: PLAYER_ID, name: 'Sipho Dlamini', position: 'FORWARD' },
        team: { id: 'team-1', name: 'Kaizer Chiefs' },
      },
    ]),
  },
  fantasyPlayerPrice: {
    count: vi.fn().mockResolvedValue(96),
    findMany: vi.fn().mockResolvedValue([{ playerId: PLAYER_ID, price: 60 }]),
    create: vi.fn().mockResolvedValue({ playerId: PLAYER_ID, seasonId: 'season-1', price: 55 }),
    upsert: vi.fn().mockResolvedValue({ playerId: PLAYER_ID, seasonId: 'season-1', price: 75 }),
  },
  fantasyPlayerPriceHistory: {
    create: vi.fn().mockResolvedValue({ id: 'hist-1' }),
  },
  fantasyPriceCalibrationBatch: {
    findFirst: vi.fn().mockResolvedValue(makeCalibBatch()),
    create: vi.fn().mockResolvedValue(makeCalibBatch()),
    update: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => Promise.resolve(makeCalibBatch(data))),
  },
  player: {
    findUnique: vi.fn().mockResolvedValue({ id: PLAYER_ID, name: 'Sipho Dlamini', position: 'FORWARD' }),
  },
  adminAuditLog: {
    create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
  },
});

describe('FantasyPriceCalibrationService', () => {
  let service: FantasyPriceCalibrationService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new FantasyPriceCalibrationService(prisma as unknown as PrismaService);
  });

  // ── getSeasons ───────────────────────────────────────────────────────────────

  describe('getSeasons', () => {
    it('returns seasons with price config and counts', async () => {
      const result = await service.getSeasons();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 'season-1', minPrice: 40, maxPrice: 200, rulesConfigured: true });
    });

    it('falls back to defaults when no rulesConfig', async () => {
      prisma.season.findMany.mockResolvedValue([{
        ...SEASON,
        rulesConfig: null,
        _count: { playerPrices: 0, squadRegistrations: 0, fantasyPriceCalibrationBatches: 0 },
      }]);

      const result = await service.getSeasons();
      expect(result[0]).toMatchObject({ minPrice: 40, maxPrice: 200, rulesConfigured: false });
    });
  });

  // ── getOverview ──────────────────────────────────────────────────────────────

  describe('getOverview', () => {
    it('returns overview with price summary', async () => {
      prisma.seasonSquadRegistration.count.mockResolvedValue(96);
      prisma.fantasyPlayerPrice.count.mockResolvedValueOnce(90).mockResolvedValueOnce(0).mockResolvedValueOnce(0);

      const result = await service.getOverview('season-1');
      expect(result.seasonId).toBe('season-1');
      expect(result.missingPriceCount).toBe(6);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getOverview('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── listPlayers ──────────────────────────────────────────────────────────────

  describe('listPlayers', () => {
    it('returns players with price status', async () => {
      const result = await service.listPlayers('season-1');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ playerId: PLAYER_ID, hasPrice: true });
    });

    it('marks player with no price as hasPrice: false', async () => {
      prisma.fantasyPlayerPrice.findMany.mockResolvedValue([]);
      const result = await service.listPlayers('season-1');
      expect(result[0]!.hasPrice).toBe(false);
      expect(result[0]!.fantasyPrice).toBeNull();
      expect(result[0]!.isPriceValid).toBeNull();
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.listPlayers('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── listMissingPrices ────────────────────────────────────────────────────────

  describe('listMissingPrices', () => {
    it('returns empty when all players have prices', async () => {
      prisma.fantasyPlayerPrice.findMany.mockResolvedValue([{ playerId: PLAYER_ID }]);
      const result = await service.listMissingPrices('season-1');
      expect(result).toHaveLength(0);
    });

    it('returns player when no price is set', async () => {
      prisma.fantasyPlayerPrice.findMany.mockResolvedValue([]);
      const result = await service.listMissingPrices('season-1');
      expect(result).toHaveLength(1);
      expect(result[0]!.playerId).toBe(PLAYER_ID);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.listMissingPrices('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── listInvalidPrices ────────────────────────────────────────────────────────

  describe('listInvalidPrices', () => {
    it('returns prices outside bounds with violation type', async () => {
      prisma.fantasyPlayerPrice.findMany.mockResolvedValue([
        { playerId: PLAYER_ID, price: 10, player: { id: PLAYER_ID, name: 'Sipho', position: 'FORWARD' } },
      ]);

      const result = await service.listInvalidPrices('season-1');
      expect(result).toHaveLength(1);
      expect(result[0]!.violation).toBe('BELOW_MINIMUM');
    });

    it('returns ABOVE_MAXIMUM for prices over maxPrice', async () => {
      prisma.fantasyPlayerPrice.findMany.mockResolvedValue([
        { playerId: PLAYER_ID, price: 500, player: { id: PLAYER_ID, name: 'Sipho', position: 'FORWARD' } },
      ]);

      const result = await service.listInvalidPrices('season-1');
      expect(result[0]!.violation).toBe('ABOVE_MAXIMUM');
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.listInvalidPrices('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── updatePlayerPrice ────────────────────────────────────────────────────────

  describe('updatePlayerPrice', () => {
    it('upserts a valid price and writes history + audit log', async () => {
      const result = await service.updatePlayerPrice('season-1', PLAYER_ID, 75);
      expect(result.price).toBe(75);
      expect(prisma.fantasyPlayerPriceHistory.create).toHaveBeenCalled();
      expect(prisma.adminAuditLog.create).toHaveBeenCalled();
    });

    it('throws BadRequestException when price is below minimum', async () => {
      await expect(service.updatePlayerPrice('season-1', PLAYER_ID, 5)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when price is above maximum', async () => {
      await expect(service.updatePlayerPrice('season-1', PLAYER_ID, 500)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.updatePlayerPrice('bad-id', PLAYER_ID, 60)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for unknown player', async () => {
      prisma.player.findUnique.mockResolvedValue(null);
      await expect(service.updatePlayerPrice('season-1', 'bad-player', 60)).rejects.toThrow(NotFoundException);
    });
  });

  // ── bulkApplyDefaults ────────────────────────────────────────────────────────

  describe('bulkApplyDefaults', () => {
    it('applies default prices to unpriced players', async () => {
      prisma.fantasyPlayerPrice.findMany.mockResolvedValue([]);

      const result = await service.bulkApplyDefaults('season-1');
      expect(result.applied).toBe(1);
      expect(result.skipped).toBe(0);
      expect(prisma.fantasyPlayerPrice.create).toHaveBeenCalled();
      expect(prisma.adminAuditLog.create).toHaveBeenCalled();
    });

    it('skips already-priced players (idempotent)', async () => {
      prisma.fantasyPlayerPrice.findMany.mockResolvedValue([{ playerId: PLAYER_ID }]);

      const result = await service.bulkApplyDefaults('season-1');
      expect(result.applied).toBe(0);
      expect(result.skipped).toBe(1);
      expect(prisma.fantasyPlayerPrice.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.bulkApplyDefaults('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── validateCalibration ──────────────────────────────────────────────────────

  describe('validateCalibration', () => {
    it('creates VALIDATED batch when all prices are valid', async () => {
      prisma.seasonSquadRegistration.count.mockResolvedValue(10);
      prisma.fantasyPlayerPrice.count.mockResolvedValueOnce(10).mockResolvedValueOnce(0).mockResolvedValueOnce(0);

      const result = await service.validateCalibration('season-1');
      expect(result.status).toBe(FantasyPriceCalibrationBatchStatus.VALIDATED);
      expect(prisma.adminAuditLog.create).toHaveBeenCalled();
    });

    it('creates HAS_WARNINGS batch when missing prices', async () => {
      prisma.seasonSquadRegistration.count.mockResolvedValue(10);
      prisma.fantasyPlayerPrice.count.mockResolvedValueOnce(5).mockResolvedValueOnce(0).mockResolvedValueOnce(0);

      prisma.fantasyPriceCalibrationBatch.create.mockResolvedValue(
        makeCalibBatch({ status: FantasyPriceCalibrationBatchStatus.HAS_WARNINGS }),
      );

      const result = await service.validateCalibration('season-1');
      expect(result.status).toBe(FantasyPriceCalibrationBatchStatus.HAS_WARNINGS);
    });
  });

  // ── publishCalibration ───────────────────────────────────────────────────────

  describe('publishCalibration', () => {
    it('publishes a VALIDATED calibration batch', async () => {
      prisma.fantasyPlayerPrice.count.mockResolvedValue(96);

      const result = await service.publishCalibration('season-1');
      expect(result.status).toBe(FantasyPriceCalibrationBatchStatus.PUBLISHED);
      expect(prisma.adminAuditLog.create).toHaveBeenCalled();
    });

    it('throws BadRequestException when no validated batch exists', async () => {
      prisma.fantasyPriceCalibrationBatch.findFirst.mockResolvedValue(null);
      await expect(service.publishCalibration('season-1')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.publishCalibration('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getReadiness ─────────────────────────────────────────────────────────────

  describe('getReadiness', () => {
    it('returns READY when all prices are valid and batch is published', async () => {
      prisma.seasonSquadRegistration.count.mockResolvedValue(10);
      prisma.fantasyPlayerPrice.count.mockResolvedValueOnce(10).mockResolvedValueOnce(0);
      prisma.fantasyPriceCalibrationBatch.findFirst.mockResolvedValue(
        makeCalibBatch({ status: FantasyPriceCalibrationBatchStatus.PUBLISHED }),
      );

      const result = await service.getReadiness('season-1');
      expect(result.readinessStatus).toBe('READY');
      expect(result.blockerCount).toBe(0);
    });

    it('returns READY_WITH_WARNINGS when no published batch', async () => {
      prisma.seasonSquadRegistration.count.mockResolvedValue(10);
      prisma.fantasyPlayerPrice.count.mockResolvedValueOnce(10).mockResolvedValueOnce(0);
      prisma.fantasyPriceCalibrationBatch.findFirst.mockResolvedValue(null);

      const result = await service.getReadiness('season-1');
      expect(result.readinessStatus).toBe('READY_WITH_WARNINGS');
    });

    it('returns BLOCKED when no rules config', async () => {
      prisma.season.findUnique.mockResolvedValue({ ...SEASON, rulesConfig: null });
      prisma.seasonSquadRegistration.count.mockResolvedValue(10);
      prisma.fantasyPlayerPrice.count.mockResolvedValue(0);
      prisma.fantasyPriceCalibrationBatch.findFirst.mockResolvedValue(null);

      const result = await service.getReadiness('season-1');
      expect(result.readinessStatus).toBe('BLOCKED');
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getReadiness('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getActivationDryRun ──────────────────────────────────────────────────────

  describe('getActivationDryRun', () => {
    it('returns dryRunOnly: true, pricesHaveNoCashValue: true', async () => {
      prisma.seasonSquadRegistration.count.mockResolvedValue(96);
      prisma.fantasyPlayerPrice.count.mockResolvedValue(96);
      prisma.fantasyPriceCalibrationBatch.findFirst.mockResolvedValue(
        makeCalibBatch({ status: FantasyPriceCalibrationBatchStatus.PUBLISHED }),
      );

      const result = await service.getActivationDryRun('season-1');
      expect(result.dryRunOnly).toBe(true);
      expect(result.activationWillNotBePerformed).toBe(true);
      expect(result.safetyConfirmations.pricesHaveNoCashValue).toBe(true);
      expect(result.safetyConfirmations.fantasyPointsOnly).toBe(true);
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getActivationDryRun('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
