import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PlayerPriceInfo {
  playerId: string;
  playerName: string;
  seasonId: string;
  currentPrice: number;
  purchasePrice?: number;
  sellingPrice?: number;
}

@Injectable()
export class FantasyPriceService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlayerPrices(seasonId?: string): Promise<PlayerPriceInfo[]> {
    const resolvedId = seasonId ?? await this.resolveActiveSeasonId();
    const prices = await this.prisma.fantasyPlayerPrice.findMany({
      where: { seasonId: resolvedId },
      include: { player: { select: { id: true, name: true } } },
      orderBy: { price: 'desc' },
    });

    return prices.map(p => ({
      playerId: p.playerId,
      playerName: p.player.name,
      seasonId: p.seasonId,
      currentPrice: p.price,
    }));
  }

  private async resolveActiveSeasonId(): Promise<string> {
    const season = await this.prisma.season.findFirst({ where: { isActive: true }, select: { id: true } });
    if (!season) throw new NotFoundException('No active season found');
    return season.id;
  }

  async getPlayerPrice(playerId: string, seasonId: string): Promise<PlayerPriceInfo> {
    const price = await this.prisma.fantasyPlayerPrice.findUnique({
      where: { playerId_seasonId: { playerId, seasonId } },
      include: { player: { select: { id: true, name: true } } },
    });
    if (!price) throw new NotFoundException('Player price not found');

    return {
      playerId: price.playerId,
      playerName: price.player.name,
      seasonId: price.seasonId,
      currentPrice: price.price,
    };
  }

  async setPlayerPrice(playerId: string, seasonId: string, price: number, reason?: string): Promise<PlayerPriceInfo> {
    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new NotFoundException('Player not found');

    const record = await this.prisma.fantasyPlayerPrice.upsert({
      where: { playerId_seasonId: { playerId, seasonId } },
      create: { playerId, seasonId, price },
      update: { price },
      include: { player: { select: { id: true, name: true } } },
    });

    await this.prisma.fantasyPlayerPriceHistory.create({
      data: {
        playerId,
        seasonId,
        price,
        ...(reason !== undefined ? { reason } : {}),
      },
    });

    return {
      playerId: record.playerId,
      playerName: record.player.name,
      seasonId: record.seasonId,
      currentPrice: record.price,
    };
  }

  /**
   * Selling price: purchase price + half of profit rounded down to 0.1 (stored as integer 10ths).
   * If current price < purchase price, selling price = purchase price (no loss on selling).
   */
  calculateSellingPrice(purchasePrice: number, currentPrice: number): number {
    if (currentPrice <= purchasePrice) return purchasePrice;
    const profit = currentPrice - purchasePrice;
    const halfProfit = Math.floor(profit / 2);
    return purchasePrice + halfProfit;
  }

  async getPriceHistory(playerId: string, seasonId: string) {
    return this.prisma.fantasyPlayerPriceHistory.findMany({
      where: { playerId, seasonId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
