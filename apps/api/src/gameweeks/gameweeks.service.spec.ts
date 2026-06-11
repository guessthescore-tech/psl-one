import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { GameweeksService } from './gameweeks.service';
import type { PrismaService } from '../prisma/prisma.service';

const FUTURE = new Date(Date.now() + 86_400_000);
const PAST = new Date(Date.now() - 86_400_000);

const makePrismaMock = () => ({
  season: { findFirst: vi.fn() },
  gameweek: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  fixture: { findMany: vi.fn() },
});

const MOCK_SEASON = { id: 'season-1' };
const MOCK_GW = {
  id: 'gw-1',
  name: 'Group Stage – Matchday 1',
  slug: 'group-matchday-1',
  round: 1,
  status: 'UPCOMING',
  startsAt: FUTURE,
  endsAt: new Date(FUTURE.getTime() + 3 * 86_400_000),
  transferDeadlineAt: new Date(FUTURE.getTime() - 3_600_000),
  predictionDeadlineAt: new Date(FUTURE.getTime() - 1_800_000),
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { fixtures: 24 },
};

describe('GameweeksService', () => {
  let service: GameweeksService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new GameweeksService(prisma as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('returns all gameweeks for active season', async () => {
      prisma.season.findFirst.mockResolvedValue(MOCK_SEASON);
      prisma.gameweek.findMany.mockResolvedValue([MOCK_GW]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(prisma.gameweek.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { seasonId: 'season-1' } }),
      );
    });

    it('throws if no active season', async () => {
      prisma.season.findFirst.mockResolvedValue(null);
      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('returns gameweek by id', async () => {
      prisma.gameweek.findUnique.mockResolvedValue(MOCK_GW);
      const result = await service.findOne('gw-1');
      expect(result.id).toBe('gw-1');
    });

    it('throws NotFoundException for unknown id', async () => {
      prisma.gameweek.findUnique.mockResolvedValue(null);
      await expect(service.findOne('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLockState', () => {
    it('returns transferLocked=false when deadline is in the future', async () => {
      prisma.gameweek.findUnique.mockResolvedValue({
        id: 'gw-1',
        name: 'Matchday 1',
        status: 'UPCOMING',
        transferDeadlineAt: FUTURE,
        predictionDeadlineAt: FUTURE,
      });
      const state = await service.getLockState('gw-1');
      expect(state.transferLocked).toBe(false);
      expect(state.predictionLocked).toBe(false);
    });

    it('returns transferLocked=true when deadline has passed', async () => {
      prisma.gameweek.findUnique.mockResolvedValue({
        id: 'gw-1',
        name: 'Matchday 1',
        status: 'LOCKED',
        transferDeadlineAt: PAST,
        predictionDeadlineAt: PAST,
      });
      const state = await service.getLockState('gw-1');
      expect(state.transferLocked).toBe(true);
      expect(state.predictionLocked).toBe(true);
    });

    it('throws NotFoundException for unknown gameweek', async () => {
      prisma.gameweek.findUnique.mockResolvedValue(null);
      await expect(service.getLockState('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('updates gameweek status', async () => {
      prisma.gameweek.findUnique.mockResolvedValue({ id: 'gw-1' });
      prisma.gameweek.update.mockResolvedValue({ ...MOCK_GW, status: 'OPEN' });
      const result = await service.updateStatus('gw-1', { status: 'OPEN' as any });
      expect(prisma.gameweek.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'OPEN' } }),
      );
      expect(result.status).toBe('OPEN');
    });
  });

  describe('updateDeadlines', () => {
    it('updates transfer and prediction deadlines', async () => {
      const newDeadline = new Date(FUTURE.getTime() - 7_200_000).toISOString();
      prisma.gameweek.findUnique.mockResolvedValue({ id: 'gw-1' });
      prisma.gameweek.update.mockResolvedValue({ ...MOCK_GW, transferDeadlineAt: new Date(newDeadline) });
      await service.updateDeadlines('gw-1', { transferDeadlineAt: newDeadline });
      expect(prisma.gameweek.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ transferDeadlineAt: new Date(newDeadline) }),
        }),
      );
    });
  });
});
