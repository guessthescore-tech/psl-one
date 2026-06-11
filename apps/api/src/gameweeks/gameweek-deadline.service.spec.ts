import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { GameweekDeadlineService } from './gameweek-deadline.service';
import type { PrismaService } from '../prisma/prisma.service';

const FUTURE = new Date(Date.now() + 86_400_000);
const PAST = new Date(Date.now() - 86_400_000);

const makePrismaMock = () => ({
  gameweek: { findUnique: vi.fn(), findFirst: vi.fn() },
  fixture: { findUnique: vi.fn() },
});

describe('GameweekDeadlineService', () => {
  let service: GameweekDeadlineService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new GameweekDeadlineService(prisma as unknown as PrismaService);
  });

  describe('isTransferLocked', () => {
    it('returns false when deadline is in the future', async () => {
      prisma.gameweek.findUnique.mockResolvedValue({ transferDeadlineAt: FUTURE });
      expect(await service.isTransferLocked('gw-1')).toBe(false);
    });

    it('returns true when deadline has passed', async () => {
      prisma.gameweek.findUnique.mockResolvedValue({ transferDeadlineAt: PAST });
      expect(await service.isTransferLocked('gw-1')).toBe(true);
    });

    it('throws NotFoundException for unknown gameweek', async () => {
      prisma.gameweek.findUnique.mockResolvedValue(null);
      await expect(service.isTransferLocked('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('isPredictionLocked', () => {
    it('returns false when prediction deadline is in the future', async () => {
      prisma.gameweek.findUnique.mockResolvedValue({ predictionDeadlineAt: FUTURE });
      expect(await service.isPredictionLocked('gw-1')).toBe(false);
    });

    it('returns true when prediction deadline has passed', async () => {
      prisma.gameweek.findUnique.mockResolvedValue({ predictionDeadlineAt: PAST });
      expect(await service.isPredictionLocked('gw-1')).toBe(true);
    });
  });

  describe('isFixtureLocked', () => {
    it('returns true when kickoff has passed', async () => {
      prisma.fixture.findUnique.mockResolvedValue({ kickoffAt: PAST, gameweek: null });
      expect(await service.isFixtureLocked('f-1')).toBe(true);
    });

    it('returns true when gameweek prediction deadline has passed', async () => {
      prisma.fixture.findUnique.mockResolvedValue({
        kickoffAt: FUTURE,
        gameweek: { predictionDeadlineAt: PAST },
      });
      expect(await service.isFixtureLocked('f-1')).toBe(true);
    });

    it('returns false when kickoff is future and no deadline exceeded', async () => {
      prisma.fixture.findUnique.mockResolvedValue({
        kickoffAt: FUTURE,
        gameweek: { predictionDeadlineAt: FUTURE },
      });
      expect(await service.isFixtureLocked('f-1')).toBe(false);
    });

    it('throws NotFoundException for unknown fixture', async () => {
      prisma.fixture.findUnique.mockResolvedValue(null);
      await expect(service.isFixtureLocked('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('isGameweekOpen', () => {
    it('returns true when status is OPEN', async () => {
      prisma.gameweek.findUnique.mockResolvedValue({ status: 'OPEN' });
      expect(await service.isGameweekOpen('gw-1')).toBe(true);
    });

    it('returns false when status is UPCOMING', async () => {
      prisma.gameweek.findUnique.mockResolvedValue({ status: 'UPCOMING' });
      expect(await service.isGameweekOpen('gw-1')).toBe(false);
    });
  });
});
