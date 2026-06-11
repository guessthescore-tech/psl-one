import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Default EPL-style fantasy rules
export const DEFAULT_RULES = {
  squadSize: 15,
  goalkeeperCount: 2,
  defenderCount: 5,
  midfielderCount: 5,
  forwardCount: 3,
  startingXiSize: 11,
  minStartingGoalkeepers: 1,
  maxStartingGoalkeepers: 1,
  minStartingDefenders: 3,
  minStartingMidfielders: 2,
  minStartingForwards: 1,
  benchSize: 4,
  freeTransfersPerGameweek: 1,
  maxSavedFreeTransfers: 5,
  extraTransferCost: 4,
  maxTransfersPerGameweek: 20,
  deadlineOffsetMinutes: 90,
  wildcardCount: 2,
  freeHitCount: 2,
  benchBoostCount: 2,
  tripleCaptainCount: 2,
  chipsEnabled: true,
  wildcardEnabled: true,
  freeHitEnabled: true,
  benchBoostEnabled: true,
  tripleCaptainEnabled: true,
  freeHitConsecutiveGameweekBlocked: true,
  halfwayGameweek: 19,
  seasonGameweekCount: 38,
} as const;

export interface FantasyRules {
  squadSize: number;
  goalkeeperCount: number;
  defenderCount: number;
  midfielderCount: number;
  forwardCount: number;
  startingXiSize: number;
  minStartingGoalkeepers: number;
  maxStartingGoalkeepers: number;
  minStartingDefenders: number;
  minStartingMidfielders: number;
  minStartingForwards: number;
  benchSize: number;
  freeTransfersPerGameweek: number;
  maxSavedFreeTransfers: number;
  extraTransferCost: number;
  maxTransfersPerGameweek: number;
  deadlineOffsetMinutes: number;
  wildcardCount: number;
  freeHitCount: number;
  benchBoostCount: number;
  tripleCaptainCount: number;
  chipsEnabled: boolean;
  wildcardEnabled: boolean;
  freeHitEnabled: boolean;
  benchBoostEnabled: boolean;
  tripleCaptainEnabled: boolean;
  freeHitConsecutiveGameweekBlocked: boolean;
  halfwayGameweek: number;
  seasonGameweekCount: number;
}

export type PartialRules = Partial<FantasyRules>;

export interface RulesValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface UpdateRulesDto {
  squadSize?: number;
  goalkeeperCount?: number;
  defenderCount?: number;
  midfielderCount?: number;
  forwardCount?: number;
  startingXiSize?: number;
  minStartingGoalkeepers?: number;
  maxStartingGoalkeepers?: number;
  minStartingDefenders?: number;
  minStartingMidfielders?: number;
  minStartingForwards?: number;
  benchSize?: number;
  freeTransfersPerGameweek?: number;
  maxSavedFreeTransfers?: number;
  extraTransferCost?: number;
  maxTransfersPerGameweek?: number;
  deadlineOffsetMinutes?: number;
  wildcardCount?: number;
  freeHitCount?: number;
  benchBoostCount?: number;
  tripleCaptainCount?: number;
  chipsEnabled?: boolean;
  wildcardEnabled?: boolean;
  freeHitEnabled?: boolean;
  benchBoostEnabled?: boolean;
  tripleCaptainEnabled?: boolean;
  freeHitConsecutiveGameweekBlocked?: boolean;
  halfwayGameweek?: number;
  seasonGameweekCount?: number;
}

@Injectable()
export class FantasyRulesConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getRulesForSeason(seasonId: string): Promise<FantasyRules> {
    const config = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId } });
    if (!config) throw new NotFoundException(`No rules config found for season ${seasonId}`);
    return this.toFantasyRules(config);
  }

  async getRulesForActiveSeason(): Promise<FantasyRules> {
    const season = await this.prisma.season.findFirst({
      where: { isActive: true },
      include: { rulesConfig: true },
    });
    if (!season) throw new NotFoundException('No active season');
    if (!season.rulesConfig) return { ...DEFAULT_RULES };
    return this.toFantasyRules(season.rulesConfig);
  }

  async getOrDefaultRulesForSeason(seasonId: string): Promise<FantasyRules> {
    const config = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId } });
    return config ? this.toFantasyRules(config) : { ...DEFAULT_RULES };
  }

  async createDefaultRulesForSeason(seasonId: string): Promise<FantasyRules> {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException('Season not found');

    const config = await this.prisma.fantasyRulesConfig.upsert({
      where: { seasonId },
      create: { seasonId },
      update: {},
    });
    return this.toFantasyRules(config);
  }

  async updateRulesForSeason(seasonId: string, dto: UpdateRulesDto): Promise<FantasyRules> {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException('Season not found');

    const existing = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId } });
    const merged: FantasyRules = existing
      ? { ...this.toFantasyRules(existing), ...this.filterUndefined(dto) }
      : { ...DEFAULT_RULES, ...this.filterUndefined(dto) };

    const validation = this.validateRules(merged);
    if (!validation.isValid) {
      throw new BadRequestException({ message: 'Invalid fantasy rules', errors: validation.errors });
    }

    const config = await this.prisma.fantasyRulesConfig.upsert({
      where: { seasonId },
      create: { seasonId, ...this.filterUndefined(dto) },
      update: this.filterUndefined(dto),
    });
    return this.toFantasyRules(config);
  }

  validateRules(rules: FantasyRules | PartialRules): RulesValidationResult {
    const r = { ...DEFAULT_RULES, ...this.filterUndefined(rules) } as FantasyRules;
    const errors: string[] = [];

    // Squad composition must sum correctly
    const positionSum = r.goalkeeperCount + r.defenderCount + r.midfielderCount + r.forwardCount;
    if (positionSum !== r.squadSize) {
      errors.push(
        `Squad position counts (${r.goalkeeperCount}+${r.defenderCount}+${r.midfielderCount}+${r.forwardCount}=${positionSum}) must equal squadSize (${r.squadSize})`,
      );
    }

    if (r.startingXiSize >= r.squadSize) {
      errors.push(`startingXiSize (${r.startingXiSize}) must be less than squadSize (${r.squadSize})`);
    }

    if (r.benchSize !== r.squadSize - r.startingXiSize) {
      errors.push(
        `benchSize (${r.benchSize}) must equal squadSize (${r.squadSize}) - startingXiSize (${r.startingXiSize})`,
      );
    }

    if (r.minStartingGoalkeepers !== 1) errors.push('minStartingGoalkeepers must be 1');
    if (r.maxStartingGoalkeepers !== 1) errors.push('maxStartingGoalkeepers must be 1');
    if (r.minStartingDefenders < 3) errors.push('minStartingDefenders must be at least 3');
    if (r.minStartingForwards < 1) errors.push('minStartingForwards must be at least 1');

    if (r.freeTransfersPerGameweek < 0) errors.push('freeTransfersPerGameweek must be 0 or greater');
    if (r.maxSavedFreeTransfers < r.freeTransfersPerGameweek) {
      errors.push('maxSavedFreeTransfers must be >= freeTransfersPerGameweek');
    }
    if (r.extraTransferCost < 0) errors.push('extraTransferCost must be 0 or greater');
    if (r.maxTransfersPerGameweek <= 0) errors.push('maxTransfersPerGameweek must be greater than 0');
    if (r.deadlineOffsetMinutes < 0) errors.push('deadlineOffsetMinutes must be 0 or greater');
    if (r.halfwayGameweek <= 0) errors.push('halfwayGameweek must be greater than 0');
    if (r.seasonGameweekCount < r.halfwayGameweek) {
      errors.push('seasonGameweekCount must be >= halfwayGameweek');
    }
    for (const [key, val] of [
      ['wildcardCount', r.wildcardCount],
      ['freeHitCount', r.freeHitCount],
      ['benchBoostCount', r.benchBoostCount],
      ['tripleCaptainCount', r.tripleCaptainCount],
    ] as const) {
      if (val < 0) errors.push(`${key} must be 0 or greater`);
    }

    return { isValid: errors.length === 0, errors };
  }

  async resetRulesToDefault(seasonId: string): Promise<FantasyRules> {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException('Season not found');

    await this.prisma.fantasyRulesConfig.deleteMany({ where: { seasonId } });
    return this.createDefaultRulesForSeason(seasonId);
  }

  async listAllConfigs() {
    return this.prisma.fantasyRulesConfig.findMany({
      include: { season: { select: { id: true, name: true, isActive: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private toFantasyRules(config: {
    squadSize: number; goalkeeperCount: number; defenderCount: number;
    midfielderCount: number; forwardCount: number; startingXiSize: number;
    minStartingGoalkeepers: number; maxStartingGoalkeepers: number;
    minStartingDefenders: number; minStartingMidfielders: number; minStartingForwards: number;
    benchSize: number; freeTransfersPerGameweek: number; maxSavedFreeTransfers: number;
    extraTransferCost: number; maxTransfersPerGameweek: number; deadlineOffsetMinutes: number;
    wildcardCount: number; freeHitCount: number; benchBoostCount: number; tripleCaptainCount: number;
    chipsEnabled: boolean; wildcardEnabled: boolean; freeHitEnabled: boolean;
    benchBoostEnabled: boolean; tripleCaptainEnabled: boolean;
    freeHitConsecutiveGameweekBlocked: boolean; halfwayGameweek: number; seasonGameweekCount: number;
  }): FantasyRules {
    return {
      squadSize: config.squadSize,
      goalkeeperCount: config.goalkeeperCount,
      defenderCount: config.defenderCount,
      midfielderCount: config.midfielderCount,
      forwardCount: config.forwardCount,
      startingXiSize: config.startingXiSize,
      minStartingGoalkeepers: config.minStartingGoalkeepers,
      maxStartingGoalkeepers: config.maxStartingGoalkeepers,
      minStartingDefenders: config.minStartingDefenders,
      minStartingMidfielders: config.minStartingMidfielders,
      minStartingForwards: config.minStartingForwards,
      benchSize: config.benchSize,
      freeTransfersPerGameweek: config.freeTransfersPerGameweek,
      maxSavedFreeTransfers: config.maxSavedFreeTransfers,
      extraTransferCost: config.extraTransferCost,
      maxTransfersPerGameweek: config.maxTransfersPerGameweek,
      deadlineOffsetMinutes: config.deadlineOffsetMinutes,
      wildcardCount: config.wildcardCount,
      freeHitCount: config.freeHitCount,
      benchBoostCount: config.benchBoostCount,
      tripleCaptainCount: config.tripleCaptainCount,
      chipsEnabled: config.chipsEnabled,
      wildcardEnabled: config.wildcardEnabled,
      freeHitEnabled: config.freeHitEnabled,
      benchBoostEnabled: config.benchBoostEnabled,
      tripleCaptainEnabled: config.tripleCaptainEnabled,
      freeHitConsecutiveGameweekBlocked: config.freeHitConsecutiveGameweekBlocked,
      halfwayGameweek: config.halfwayGameweek,
      seasonGameweekCount: config.seasonGameweekCount,
    };
  }

  private filterUndefined<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined),
    ) as Partial<T>;
  }
}
