import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { FantasyPriceService } from './fantasy-price.service';
import type { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = () =>
  ({
    season: { findFirst: vi.fn() },
    fantasyPlayerPrice: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    fantasyPlayerPriceHistory: { create: vi.fn() },
    player: { findUnique: vi.fn() },
  }) as unknown as PrismaService;

describe('FantasyPriceService.getPlayerPrices', () => {
  let service: FantasyPriceService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new FantasyPriceService(prisma as unknown as PrismaService);
    (prisma.fantasyPlayerPrice.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it('uses provided seasonId when given', async () => {
    const seasonId = 'explicit-season-id';
    await service.getPlayerPrices(seasonId);
    expect(prisma.fantasyPlayerPrice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { seasonId } }),
    );
    expect(prisma.season.findFirst).not.toHaveBeenCalled();
  });

  it('defaults to active season when seasonId is not provided', async () => {
    const activeSeasonId = 'active-wc-season';
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: activeSeasonId });

    await service.getPlayerPrices();

    expect(prisma.season.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
    expect(prisma.fantasyPlayerPrice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { seasonId: activeSeasonId } }),
    );
  });

  it('defaults to active season when seasonId is undefined', async () => {
    const activeSeasonId = 'wc-season-2026';
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: activeSeasonId });

    await service.getPlayerPrices(undefined);

    expect(prisma.fantasyPlayerPrice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { seasonId: activeSeasonId } }),
    );
  });

  it('throws NotFoundException when no active season and no seasonId provided', async () => {
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(service.getPlayerPrices()).rejects.toThrow(NotFoundException);
  });

  it('returns mapped price info', async () => {
    const seasonId = 'some-season';
    (prisma.fantasyPlayerPrice.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { playerId: 'p1', seasonId, price: 100, player: { id: 'p1', name: 'Ronaldo' } },
    ]);

    const result = await service.getPlayerPrices(seasonId);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ playerId: 'p1', playerName: 'Ronaldo', currentPrice: 100, seasonId });
  });

  it('does not return cross-season prices when seasonId is explicit', async () => {
    const wcSeasonId = 'wc-season';
    (prisma.fantasyPlayerPrice.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { playerId: 'p1', seasonId: wcSeasonId, price: 80, player: { id: 'p1', name: 'Messi' } },
    ]);

    const result = await service.getPlayerPrices(wcSeasonId);

    const call = (prisma.fantasyPlayerPrice.findMany as ReturnType<typeof vi.fn>).mock.calls[0]![0] as {
      where: { seasonId: string };
    };
    expect(call.where.seasonId).toBe(wcSeasonId);
    expect(result).toHaveLength(1);
  });
});
