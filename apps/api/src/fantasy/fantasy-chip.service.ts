import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FantasyChipStatus, FantasyChipType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_CHIP_COUNTS: Record<FantasyChipType, number> = {
  [FantasyChipType.WILDCARD]: 1,
  [FantasyChipType.FREE_HIT]: 1,
  [FantasyChipType.BENCH_BOOST]: 1,
  [FantasyChipType.TRIPLE_CAPTAIN]: 1,
};

export interface ChipState {
  id: string;
  type: FantasyChipType;
  status: FantasyChipStatus;
  gameweekId: string | null;
  activatedAt: Date | null;
  usedAt: Date | null;
}

@Injectable()
export class FantasyChipService {
  constructor(private readonly prisma: PrismaService) {}

  async initializeChips(fantasyTeamId: string, seasonId?: string): Promise<void> {
    const rulesConfig = seasonId
      ? await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId } })
      : null;

    const chipCounts: Record<FantasyChipType, number> = {
      [FantasyChipType.WILDCARD]: rulesConfig?.wildcardCount ?? DEFAULT_CHIP_COUNTS[FantasyChipType.WILDCARD],
      [FantasyChipType.FREE_HIT]: rulesConfig?.freeHitCount ?? DEFAULT_CHIP_COUNTS[FantasyChipType.FREE_HIT],
      [FantasyChipType.BENCH_BOOST]: rulesConfig?.benchBoostCount ?? DEFAULT_CHIP_COUNTS[FantasyChipType.BENCH_BOOST],
      [FantasyChipType.TRIPLE_CAPTAIN]: rulesConfig?.tripleCaptainCount ?? DEFAULT_CHIP_COUNTS[FantasyChipType.TRIPLE_CAPTAIN],
    };

    const existing = await this.prisma.fantasyChip.findMany({ where: { fantasyTeamId } });
    const countByType = new Map<FantasyChipType, number>();
    for (const chip of existing) {
      countByType.set(chip.type, (countByType.get(chip.type) ?? 0) + 1);
    }

    const toCreate: { fantasyTeamId: string; type: FantasyChipType }[] = [];
    for (const [type, count] of Object.entries(chipCounts) as [FantasyChipType, number][]) {
      const existing = countByType.get(type) ?? 0;
      for (let i = existing; i < count; i++) {
        toCreate.push({ fantasyTeamId, type });
      }
    }

    if (toCreate.length === 0) return;
    await this.prisma.fantasyChip.createMany({ data: toCreate, skipDuplicates: false });
  }

  async getChips(fantasyTeamId: string): Promise<ChipState[]> {
    const chips = await this.prisma.fantasyChip.findMany({ where: { fantasyTeamId } });
    return chips.map(c => ({
      id: c.id,
      type: c.type,
      status: c.status,
      gameweekId: c.gameweekId,
      activatedAt: c.activatedAt,
      usedAt: c.usedAt,
    }));
  }

  async getChipsForUser(userId: string): Promise<ChipState[]> {
    const season = await this.prisma.season.findFirst({ where: { isActive: true } });
    if (!season) throw new NotFoundException('No active season');

    const team = await this.prisma.fantasyTeam.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
    });
    if (!team) throw new NotFoundException('No fantasy team found');

    return this.getChips(team.id);
  }

  async activateChip(userId: string, chipId: string, gameweekId: string): Promise<ChipState> {
    const chip = await this.prisma.fantasyChip.findUnique({
      where: { id: chipId },
      include: { fantasyTeam: true },
    });
    if (!chip) throw new NotFoundException('Chip not found');
    if (chip.fantasyTeam.userId !== userId) throw new BadRequestException('Not your chip');
    if (chip.status !== FantasyChipStatus.AVAILABLE) {
      throw new BadRequestException(`Chip is ${chip.status}, cannot activate`);
    }

    const gw = await this.prisma.gameweek.findUnique({ where: { id: gameweekId } });
    if (!gw) throw new NotFoundException('Gameweek not found');

    const rulesConfig = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId: gw.seasonId } });

    // Global chips enabled check
    if (rulesConfig && !rulesConfig.chipsEnabled) {
      throw new BadRequestException('Chips are disabled for this season');
    }

    // Per-chip enabled check
    const chipEnabledMap: Record<FantasyChipType, boolean> = {
      [FantasyChipType.WILDCARD]: rulesConfig?.wildcardEnabled ?? true,
      [FantasyChipType.FREE_HIT]: rulesConfig?.freeHitEnabled ?? true,
      [FantasyChipType.BENCH_BOOST]: rulesConfig?.benchBoostEnabled ?? true,
      [FantasyChipType.TRIPLE_CAPTAIN]: rulesConfig?.tripleCaptainEnabled ?? true,
    };
    if (!chipEnabledMap[chip.type]) {
      throw new BadRequestException(`${chip.type} chip is disabled for this season`);
    }

    const now = new Date();
    if (gw.transferDeadlineAt <= now) {
      throw new BadRequestException('Transfer deadline has passed for this gameweek');
    }

    // Only one chip active at a time
    const activeChip = await this.prisma.fantasyChip.findFirst({
      where: {
        fantasyTeamId: chip.fantasyTeamId,
        status: FantasyChipStatus.ACTIVE,
      },
    });
    if (activeChip) {
      throw new BadRequestException('Another chip is already active this gameweek');
    }

    if (chip.type === FantasyChipType.WILDCARD) {
      const halfwayGameweek = rulesConfig?.halfwayGameweek ?? 19;
      await this.validateWildcardWindow(chip.fantasyTeamId, gw.round, gw.seasonId, halfwayGameweek);
    }

    if (chip.type === FantasyChipType.FREE_HIT) {
      const consecutiveBlocked = rulesConfig?.freeHitConsecutiveGameweekBlocked ?? true;
      if (consecutiveBlocked) {
        await this.validateFreeHitConsecutive(chip.fantasyTeamId, gw.round, gw.seasonId);
      }
    }

    const updated = await this.prisma.fantasyChip.update({
      where: { id: chipId },
      data: {
        status: FantasyChipStatus.ACTIVE,
        gameweekId,
        activatedAt: now,
      },
    });

    // FREE_HIT: snapshot current squad so it can be restored after the gameweek
    if (chip.type === FantasyChipType.FREE_HIT) {
      const currentSquad = await this.prisma.fantasyTeamPlayer.findMany({
        where: { fantasyTeamId: chip.fantasyTeamId },
        include: { player: { select: { id: true, position: true } } },
      });
      await this.prisma.fantasyFreeHitSnapshot.upsert({
        where: { fantasyTeamId_gameweekId: { fantasyTeamId: chip.fantasyTeamId, gameweekId } },
        create: {
          fantasyTeamId: chip.fantasyTeamId,
          gameweekId,
          snapshotJson: currentSquad.map(p => ({
            playerId: p.playerId,
            squadRole: p.squadRole,
            benchSlot: p.benchSlot,
            isCaptain: p.isCaptain,
            isViceCaptain: p.isViceCaptain,
            position: p.position,
          })),
        },
        update: {},
      });
    }

    return {
      id: updated.id,
      type: updated.type,
      status: updated.status,
      gameweekId: updated.gameweekId,
      activatedAt: updated.activatedAt,
      usedAt: updated.usedAt,
    };
  }

  async cancelChip(userId: string, chipId: string): Promise<ChipState> {
    const chip = await this.prisma.fantasyChip.findUnique({
      where: { id: chipId },
      include: { fantasyTeam: true, gameweek: true },
    });
    if (!chip) throw new NotFoundException('Chip not found');
    if (chip.fantasyTeam.userId !== userId) throw new BadRequestException('Not your chip');
    if (chip.status !== FantasyChipStatus.ACTIVE) {
      throw new BadRequestException('Chip is not active, cannot cancel');
    }

    const now = new Date();
    if (chip.gameweek && chip.gameweek.transferDeadlineAt <= now) {
      throw new BadRequestException('Cannot cancel chip after deadline');
    }

    // Reset chip to AVAILABLE — cancellation means it can be used again
    const reset = await this.prisma.fantasyChip.update({
      where: { id: chipId },
      data: {
        status: FantasyChipStatus.AVAILABLE,
        gameweekId: null,
        activatedAt: null,
        cancelledAt: now,
      },
    });

    return {
      id: reset.id,
      type: reset.type,
      status: reset.status,
      gameweekId: reset.gameweekId,
      activatedAt: reset.activatedAt,
      usedAt: reset.usedAt,
    };
  }

  async markChipUsed(fantasyTeamId: string, type: FantasyChipType, gameweekId: string): Promise<void> {
    await this.prisma.fantasyChip.updateMany({
      where: { fantasyTeamId, type, status: FantasyChipStatus.ACTIVE },
      data: { status: FantasyChipStatus.USED, usedAt: new Date() },
    });
  }

  async getActiveChip(fantasyTeamId: string): Promise<{ type: FantasyChipType } | null> {
    const chip = await this.prisma.fantasyChip.findFirst({
      where: { fantasyTeamId, status: FantasyChipStatus.ACTIVE },
    });
    return chip ? { type: chip.type } : null;
  }

  private async validateFreeHitConsecutive(
    fantasyTeamId: string,
    currentRound: number,
    seasonId: string,
  ): Promise<void> {
    if (currentRound <= 1) return; // No previous gameweek

    const prevGw = await this.prisma.gameweek.findFirst({
      where: { seasonId, round: currentRound - 1 },
    });
    if (!prevGw) return;

    const usedPrevGw = await this.prisma.fantasyChip.findFirst({
      where: {
        fantasyTeamId,
        type: FantasyChipType.FREE_HIT,
        status: { in: [FantasyChipStatus.USED, FantasyChipStatus.ACTIVE] },
        gameweekId: prevGw.id,
      },
    });
    if (usedPrevGw) {
      throw new BadRequestException('Free Hit cannot be played in consecutive gameweeks');
    }
  }

  private async validateWildcardWindow(
    fantasyTeamId: string,
    currentRound: number,
    seasonId: string,
    halfwayGameweek = 19,
  ): Promise<void> {
    const isFirstHalf = currentRound <= halfwayGameweek;

    // Check if a wildcard was already used in this half
    const usedWildcard = await this.prisma.fantasyChip.findFirst({
      where: { fantasyTeamId, type: FantasyChipType.WILDCARD, status: FantasyChipStatus.USED },
      include: { gameweek: true },
    });

    if (usedWildcard?.gameweek) {
      const usedInFirstHalf = usedWildcard.gameweek.round <= halfwayGameweek;
      if (isFirstHalf && usedInFirstHalf) {
        throw new BadRequestException('Wildcard already used in first half of season');
      }
      if (!isFirstHalf && !usedInFirstHalf) {
        throw new BadRequestException('Wildcard already used in second half of season');
      }
    }
  }
}
