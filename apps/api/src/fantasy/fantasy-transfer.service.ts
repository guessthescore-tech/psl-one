import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FantasyChipType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FantasyService } from './fantasy.service';
import { TransferDto } from './dto/transfer.dto';

export interface TransferStatus {
  fantasyTeamId: string;
  freeTransfersAvailable: number;
  hasPassedFirstDeadline: boolean;
  totalTransferDeductions: number;
  isDeadlineLocked: boolean;
  lockReason: string;
  gameweekId: string | null;
  activeChipType: FantasyChipType | null;
  gameweekTransferCount: number;
  nextTransferCost: number;
  maxTransfersPerGameweek: number;
}

export interface ExecuteTransferResult {
  isFreeTransfer: boolean;
  transferCost: number;
  freeTransfersRemaining: number;
  gameweekId: string | null;
  team: unknown;
}

export interface RolloverResult {
  gameweekId: string;
  teamsUpdated: number;
  newFreeTransferCounts: { teamId: string; freeTransfers: number }[];
}

const DEFAULT_MAX_TRANSFERS_PER_GW = 20;
const DEFAULT_EXTRA_TRANSFER_COST = 4;
const DEFAULT_MAX_SAVED_FT = 5;

@Injectable()
export class FantasyTransferService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fantasyService: FantasyService,
  ) {}

  async getTransferStatus(userId: string): Promise<TransferStatus> {
    const season = await this.prisma.season.findFirst({ where: { isActive: true } });
    if (!season) throw new NotFoundException('No active season');

    const team = await this.prisma.fantasyTeam.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
    });
    if (!team) throw new NotFoundException('No fantasy team found');

    const gw = await this.prisma.gameweek.findFirst({
      where: { seasonId: season.id, status: { in: ['UPCOMING', 'OPEN', 'LOCKED', 'LIVE'] } },
      orderBy: { round: 'asc' },
    });

    const now = new Date();
    const isLocked = gw ? (gw.status !== 'UPCOMING' && gw.status !== 'OPEN') || gw.transferDeadlineAt <= now : true;
    const lockReason = isLocked
      ? gw?.status === 'COMPLETED' ? 'GAMEWEEK_COMPLETED'
        : gw?.status === 'LIVE' ? 'GAMEWEEK_LIVE'
        : gw?.status === 'LOCKED' ? 'GAMEWEEK_LOCKED'
        : 'TRANSFER_DEADLINE'
      : 'OPEN';

    const activeChip = gw
      ? await this.prisma.fantasyChip.findFirst({
          where: { fantasyTeamId: team.id, status: 'ACTIVE' },
        })
      : null;

    const gwTransferCount = gw
      ? await this.prisma.fantasyTransfer.count({
          where: { fantasyTeamId: team.id, gameweekId: gw.id, countsTowardLimit: true },
        })
      : 0;

    const rulesConfig = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId: season.id } });
    const maxTransfersPerGameweek = rulesConfig?.maxTransfersPerGameweek ?? DEFAULT_MAX_TRANSFERS_PER_GW;
    const extraTransferCost = rulesConfig?.extraTransferCost ?? DEFAULT_EXTRA_TRANSFER_COST;

    const isChipBypass =
      activeChip?.type === FantasyChipType.WILDCARD ||
      activeChip?.type === FantasyChipType.FREE_HIT;
    const nextTransferCost =
      !team.hasPassedFirstDeadline || isChipBypass || team.freeTransfersAvailable > 0 ? 0 : extraTransferCost;

    return {
      fantasyTeamId: team.id,
      freeTransfersAvailable: team.freeTransfersAvailable,
      hasPassedFirstDeadline: team.hasPassedFirstDeadline,
      totalTransferDeductions: team.totalTransferDeductions,
      isDeadlineLocked: isLocked,
      lockReason,
      gameweekId: gw?.id ?? null,
      activeChipType: activeChip ? activeChip.type : null,
      gameweekTransferCount: gwTransferCount,
      nextTransferCost,
      maxTransfersPerGameweek,
    };
  }

  async executeTransfer(userId: string, dto: TransferDto): Promise<ExecuteTransferResult> {
    const season = await this.prisma.season.findFirst({ where: { isActive: true } });
    if (!season) throw new NotFoundException('No active season');

    const team = await this.prisma.fantasyTeam.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
    });
    if (!team) throw new NotFoundException('No fantasy team found');

    const gw = await this.prisma.gameweek.findFirst({
      where: { seasonId: season.id, status: { in: ['UPCOMING', 'OPEN', 'LOCKED', 'LIVE'] } },
      orderBy: { round: 'asc' },
    });

    const rulesConfig = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId: season.id } });
    const maxTransfersPerGameweek = rulesConfig?.maxTransfersPerGameweek ?? DEFAULT_MAX_TRANSFERS_PER_GW;
    const extraTransferCost = rulesConfig?.extraTransferCost ?? DEFAULT_EXTRA_TRANSFER_COST;

    // Determine active chip
    const activeChip = gw
      ? await this.prisma.fantasyChip.findFirst({
          where: { fantasyTeamId: team.id, status: 'ACTIVE' },
        })
      : null;

    const isChipBypass =
      activeChip?.type === FantasyChipType.WILDCARD ||
      activeChip?.type === FantasyChipType.FREE_HIT;

    // Max transfers/GW check (bypassed by WILDCARD and FREE_HIT)
    if (!isChipBypass && gw) {
      const gwTransfers = await this.prisma.fantasyTransfer.count({
        where: { fantasyTeamId: team.id, gameweekId: gw.id, countsTowardLimit: true },
      });
      if (gwTransfers >= maxTransfersPerGameweek) {
        throw new BadRequestException(`Maximum ${maxTransfersPerGameweek} transfers per gameweek`);
      }
    }

    // Determine if this transfer is free
    let isFreeTransfer = true;
    let freeTransfersRemaining = team.freeTransfersAvailable;

    if (!team.hasPassedFirstDeadline) {
      isFreeTransfer = true;
    } else if (isChipBypass) {
      isFreeTransfer = true;
    } else if (team.freeTransfersAvailable > 0) {
      isFreeTransfer = true;
      freeTransfersRemaining = team.freeTransfersAvailable - 1;
    } else {
      isFreeTransfer = false;
      freeTransfersRemaining = 0;
    }

    const updatedTeam = await this.fantasyService.makeTransfer(userId, dto);

    const latestTransfer = await this.prisma.fantasyTransfer.findFirst({
      where: { fantasyTeamId: team.id },
      orderBy: { transferredAt: 'desc' },
    });

    if (latestTransfer) {
      await this.prisma.fantasyTransfer.update({
        where: { id: latestTransfer.id },
        data: {
          ...(gw ? { gameweekId: gw.id } : {}),
          transferCost: isFreeTransfer ? 0 : extraTransferCost,
          isFreeTransfer,
          countsTowardLimit: !isChipBypass,
          ...(activeChip ? { chipContext: activeChip.type } : {}),
        },
      });
    }

    if (team.hasPassedFirstDeadline && !isChipBypass && isFreeTransfer) {
      await this.prisma.fantasyTeam.update({
        where: { id: team.id },
        data: { freeTransfersAvailable: freeTransfersRemaining },
      });
    }

    const transferCost = isFreeTransfer ? 0 : extraTransferCost;
    if (transferCost > 0) {
      await this.prisma.fantasyTeam.update({
        where: { id: team.id },
        data: { totalTransferDeductions: { increment: transferCost } },
      });
    }

    return {
      isFreeTransfer,
      transferCost,
      freeTransfersRemaining,
      gameweekId: gw?.id ?? null,
      team: updatedTeam,
    };
  }

  async rolloverTransfers(gameweekId: string): Promise<RolloverResult> {
    const gw = await this.prisma.gameweek.findUnique({ where: { id: gameweekId } });
    if (!gw) throw new NotFoundException('Gameweek not found');

    const rulesConfig = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId: gw.seasonId } });
    const freeTransfersPerGameweek = rulesConfig?.freeTransfersPerGameweek ?? 1;
    const maxSavedFreeTransfers = rulesConfig?.maxSavedFreeTransfers ?? DEFAULT_MAX_SAVED_FT;

    const teams = await this.prisma.fantasyTeam.findMany({
      where: { seasonId: gw.seasonId },
    });

    const updates: { teamId: string; freeTransfers: number }[] = [];

    for (const team of teams) {
      let newCount: number;
      if (!team.hasPassedFirstDeadline) {
        newCount = freeTransfersPerGameweek;
      } else {
        newCount = Math.min(team.freeTransfersAvailable + freeTransfersPerGameweek, maxSavedFreeTransfers);
      }

      await this.prisma.fantasyTeam.update({
        where: { id: team.id },
        data: {
          freeTransfersAvailable: newCount,
          hasPassedFirstDeadline: true,
        },
      });
      updates.push({ teamId: team.id, freeTransfers: newCount });
    }

    return {
      gameweekId,
      teamsUpdated: updates.length,
      newFreeTransferCounts: updates,
    };
  }

  async recordTransferCost(fantasyTeamId: string, extraTransfers: number, costPerTransfer?: number): Promise<number> {
    if (extraTransfers <= 0) return 0;
    const cost = extraTransfers * (costPerTransfer ?? DEFAULT_EXTRA_TRANSFER_COST);
    await this.prisma.fantasyTeam.update({
      where: { id: fantasyTeamId },
      data: { totalTransferDeductions: { increment: cost } },
    });
    return cost;
  }

  async countGameweekTransfers(fantasyTeamId: string, gameweekId: string): Promise<number> {
    return this.prisma.fantasyTransfer.count({
      where: { fantasyTeamId, gameweekId, countsTowardLimit: true },
    });
  }
}
