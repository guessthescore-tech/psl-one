import { Injectable, NotFoundException } from '@nestjs/common';
import { PlayerPosition } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_RULES, UpdateRulesDto } from '../fantasy/fantasy-rules-config.service';

// Provisional PSL-specific overrides on top of DEFAULT_RULES
const PSL_PROVISIONAL_OVERRIDES = {
  halfwayGameweek: 15,
  seasonGameweekCount: 30,
};

// Provisional price bands (integer × 10 = display credit)
const PROVISIONAL_PRICES: Record<PlayerPosition, number> = {
  [PlayerPosition.GOALKEEPER]: 50,
  [PlayerPosition.DEFENDER]: 50,
  [PlayerPosition.MIDFIELDER]: 55,
  [PlayerPosition.FORWARD]: 60,
};

type CalibrationStatus = 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';

interface CalibrationCheck {
  code: string;
  severity: 'BLOCKER' | 'WARNING' | 'INFO';
  message: string;
  detail?: string;
}

export interface CalibrationReadiness {
  seasonId: string;
  seasonName: string;
  status: CalibrationStatus;
  blockers: CalibrationCheck[];
  warnings: CalibrationCheck[];
  info: CalibrationCheck[];
}

export interface PriceReadiness {
  seasonId: string;
  totalPlayers: number;
  pricedPlayers: number;
  unpricedPlayers: number;
  missingByPosition: Record<PlayerPosition, number>;
  isReady: boolean;
}

export interface SquadReadiness {
  seasonId: string;
  clubs: Array<{
    teamId: string;
    teamName: string;
    eligiblePlayers: number;
    byPosition: Record<PlayerPosition, number>;
    isReady: boolean;
  }>;
  totalEligible: number;
  teamsReady: number;
  teamsTotal: number;
}

export interface GameweekReadinessItem {
  gameweekId: string;
  round: number;
  name: string;
  hasTransferDeadline: boolean;
  hasPredictionDeadline: boolean;
  fixtureCount: number;
  earliestKickoff: Date | null;
}

export interface GameweekReadiness {
  seasonId: string;
  gameweeks: GameweekReadinessItem[];
  totalGameweeks: number;
  gameweeksWithDeadlines: number;
  gameweeksWithFixtures: number;
}

export interface ActivationImpact {
  seasonId: string;
  seasonName: string;
  fantasyTeamsAffected: number;
  predictionCountAffected: number;
  rulesConfigured: boolean;
  playerPricesSet: number;
  gameweeksConfigured: number;
  warnings: string[];
}

@Injectable()
export class FantasyCalibrationService {
  constructor(private readonly prisma: PrismaService) {}

  async getCalibrationSeasons() {
    const seasons = await this.prisma.season.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        rulesConfig: { select: { id: true } },
        _count: { select: { playerPrices: true, gameweeks: true } },
      },
    });

    return seasons.map(s => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      isActive: s.isActive,
      hasRulesConfig: !!s.rulesConfig,
      playerPriceCount: s._count.playerPrices,
      gameweekCount: s._count.gameweeks,
    }));
  }

  async getCalibrationReadiness(seasonId: string): Promise<CalibrationReadiness> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { rulesConfig: true },
    });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const blockers: CalibrationCheck[] = [];
    const warnings: CalibrationCheck[] = [];
    const info: CalibrationCheck[] = [];

    // Check 1: fantasy rules config
    if (!season.rulesConfig) {
      warnings.push({
        code: 'NO_RULES_CONFIG',
        severity: 'WARNING',
        message: 'No fantasy rules config for this season',
        detail: 'POST /fantasy/admin/calibration/:seasonId/rules to create provisional PSL rules',
      });
    } else {
      info.push({
        code: 'RULES_CONFIG_OK',
        severity: 'INFO',
        message: `Fantasy rules configured (seasonGameweekCount=${season.rulesConfig.seasonGameweekCount}, halfwayGameweek=${season.rulesConfig.halfwayGameweek})`,
      });
    }

    // Check 2: player prices
    const priceCount = await this.prisma.fantasyPlayerPrice.count({ where: { seasonId } });
    if (priceCount === 0) {
      warnings.push({
        code: 'NO_PLAYER_PRICES',
        severity: 'WARNING',
        message: 'No player prices set for this season',
        detail: 'POST /fantasy/admin/calibration/:seasonId/players/generate-prices to generate provisional prices',
      });
    } else if (priceCount < 11) {
      warnings.push({
        code: 'INSUFFICIENT_PLAYER_PRICES',
        severity: 'WARNING',
        message: `Only ${priceCount} player prices set — need at least 11 for a valid squad`,
      });
    } else {
      info.push({
        code: 'PLAYER_PRICES_OK',
        severity: 'INFO',
        message: `${priceCount} player prices configured`,
      });
    }

    // Check 3: squad registrations
    const squadCount = await this.prisma.seasonSquadRegistration.count({ where: { seasonId } });
    if (squadCount === 0) {
      warnings.push({
        code: 'NO_SQUAD_REGISTRATIONS',
        severity: 'WARNING',
        message: 'No squad registrations for this season',
        detail: 'Players must be registered to a season for fantasy squad selection',
      });
    } else {
      info.push({
        code: 'SQUAD_REGISTRATIONS_OK',
        severity: 'INFO',
        message: `${squadCount} squad registrations`,
      });
    }

    // Check 4: gameweeks with linked fixtures (indicates deadlines can be derived)
    const gameweekCount = await this.prisma.gameweek.count({ where: { seasonId } });
    const gameweeksWithFixtures = await this.prisma.gameweek.count({
      where: { seasonId, fixtures: { some: { isPublished: true } } },
    });
    if (gameweekCount === 0) {
      blockers.push({
        code: 'NO_GAMEWEEKS',
        severity: 'BLOCKER',
        message: 'No gameweeks exist for this season',
        detail: 'Create gameweeks via the fixture import pipeline before activating fantasy',
      });
    } else if (gameweeksWithFixtures === 0) {
      warnings.push({
        code: 'NO_GAMEWEEK_FIXTURES',
        severity: 'WARNING',
        message: `${gameweekCount} gameweeks exist but none have published fixtures`,
        detail: 'POST /fantasy/admin/calibration/:seasonId/gameweeks/derive-deadlines after publishing fixtures',
      });
    } else {
      info.push({
        code: 'GAMEWEEK_FIXTURES_OK',
        severity: 'INFO',
        message: `${gameweeksWithFixtures}/${gameweekCount} gameweeks have published fixtures`,
      });
    }

    // Check 5: fixtures
    const fixtureCount = await this.prisma.fixture.count({ where: { seasonId, isPublished: true } });
    if (fixtureCount === 0) {
      warnings.push({
        code: 'NO_PUBLISHED_FIXTURES',
        severity: 'WARNING',
        message: 'No published fixtures for this season',
        detail: 'Publish fixtures via /admin/fixtures/imports before activating',
      });
    } else {
      info.push({
        code: 'FIXTURES_OK',
        severity: 'INFO',
        message: `${fixtureCount} published fixtures`,
      });
    }

    const status: CalibrationStatus =
      blockers.length > 0 ? 'BLOCKED' : warnings.length > 0 ? 'READY_WITH_WARNINGS' : 'READY';

    return { seasonId, seasonName: season.name, status, blockers, warnings, info };
  }

  async getFantasyRules(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const config = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId } });
    return config ?? null;
  }

  async createProvisionalRules(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    // Upsert with PSL-specific overrides; never overwrite if already exists
    const config = await this.prisma.fantasyRulesConfig.upsert({
      where: { seasonId },
      create: {
        seasonId,
        ...DEFAULT_RULES,
        ...PSL_PROVISIONAL_OVERRIDES,
      },
      update: {},
    });
    return config;
  }

  async updateFantasyRules(seasonId: string, dto: UpdateRulesDto) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const existing = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId } });
    const filtered = this.filterUndefined(dto);

    const config = await this.prisma.fantasyRulesConfig.upsert({
      where: { seasonId },
      create: { seasonId, ...DEFAULT_RULES, ...PSL_PROVISIONAL_OVERRIDES, ...filtered },
      update: filtered,
    });
    return config;
  }

  async getPlayerPriceReadiness(seasonId: string): Promise<PriceReadiness> {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const registrations = await this.prisma.seasonSquadRegistration.findMany({
      where: { seasonId },
      include: {
        player: { select: { id: true, position: true } },
      },
    });

    const totalPlayers = registrations.length;
    const playerIds = registrations.map(r => r.playerId);

    const prices = await this.prisma.fantasyPlayerPrice.findMany({
      where: { seasonId, playerId: { in: playerIds } },
      select: { playerId: true },
    });
    const pricedSet = new Set(prices.map(p => p.playerId));

    const missingByPosition: Record<PlayerPosition, number> = {
      [PlayerPosition.GOALKEEPER]: 0,
      [PlayerPosition.DEFENDER]: 0,
      [PlayerPosition.MIDFIELDER]: 0,
      [PlayerPosition.FORWARD]: 0,
    };

    for (const reg of registrations) {
      if (!pricedSet.has(reg.playerId)) {
        missingByPosition[reg.player.position]++;
      }
    }

    const pricedPlayers = pricedSet.size;
    const unpricedPlayers = totalPlayers - pricedPlayers;

    return {
      seasonId,
      totalPlayers,
      pricedPlayers,
      unpricedPlayers,
      missingByPosition,
      isReady: unpricedPlayers === 0 && totalPlayers >= 11,
    };
  }

  async generateProvisionalPrices(seasonId: string): Promise<{ generated: number; skipped: number }> {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const registrations = await this.prisma.seasonSquadRegistration.findMany({
      where: { seasonId },
      include: { player: { select: { id: true, position: true } } },
    });

    const existing = await this.prisma.fantasyPlayerPrice.findMany({
      where: { seasonId },
      select: { playerId: true },
    });
    const existingSet = new Set(existing.map(p => p.playerId));

    let generated = 0;
    let skipped = 0;

    for (const reg of registrations) {
      if (existingSet.has(reg.playerId)) {
        skipped++;
        continue;
      }
      const price = PROVISIONAL_PRICES[reg.player.position];
      await this.prisma.fantasyPlayerPrice.create({
        data: { playerId: reg.playerId, seasonId, price },
      });
      await this.prisma.fantasyPlayerPriceHistory.create({
        data: {
          playerId: reg.playerId,
          seasonId,
          price,
          reason: 'PROVISIONAL_CALIBRATION',
        },
      });
      generated++;
    }

    return { generated, skipped };
  }

  async updatePlayerPrice(seasonId: string, playerId: string, price: number): Promise<{ playerId: string; seasonId: string; price: number }> {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new NotFoundException(`Player ${playerId} not found`);

    const record = await this.prisma.fantasyPlayerPrice.upsert({
      where: { playerId_seasonId: { playerId, seasonId } },
      create: { playerId, seasonId, price },
      update: { price },
    });

    await this.prisma.fantasyPlayerPriceHistory.create({
      data: { playerId, seasonId, price, reason: 'ADMIN_CALIBRATION' },
    });

    return { playerId: record.playerId, seasonId: record.seasonId, price: record.price };
  }

  async getSquadReadiness(seasonId: string): Promise<SquadReadiness> {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const seasonTeams = await this.prisma.seasonTeam.findMany({
      where: { seasonId },
      include: { team: { select: { id: true, name: true } } },
    });

    const registrations = await this.prisma.seasonSquadRegistration.findMany({
      where: { seasonId },
      include: { player: { select: { id: true, position: true } } },
    });

    const byTeam = new Map<string, { name: string; counts: Record<PlayerPosition, number> }>();
    for (const st of seasonTeams) {
      byTeam.set(st.team.id, {
        name: st.team.name,
        counts: {
          [PlayerPosition.GOALKEEPER]: 0,
          [PlayerPosition.DEFENDER]: 0,
          [PlayerPosition.MIDFIELDER]: 0,
          [PlayerPosition.FORWARD]: 0,
        },
      });
    }

    for (const reg of registrations) {
      const entry = byTeam.get(reg.teamId);
      if (entry) entry.counts[reg.player.position]++;
    }

    let teamsReady = 0;
    let totalEligible = 0;

    const clubs = Array.from(byTeam.entries()).map(([teamId, data]) => {
      const eligiblePlayers = Object.values(data.counts).reduce((a, b) => a + b, 0);
      totalEligible += eligiblePlayers;
      const isReady = eligiblePlayers >= 11 &&
        data.counts[PlayerPosition.GOALKEEPER] >= 1 &&
        data.counts[PlayerPosition.DEFENDER] >= 3 &&
        data.counts[PlayerPosition.MIDFIELDER] >= 2 &&
        data.counts[PlayerPosition.FORWARD] >= 1;
      if (isReady) teamsReady++;
      return {
        teamId,
        teamName: data.name,
        eligiblePlayers,
        byPosition: data.counts,
        isReady,
      };
    });

    return {
      seasonId,
      clubs,
      totalEligible,
      teamsReady,
      teamsTotal: clubs.length,
    };
  }

  async getGameweekReadiness(seasonId: string): Promise<GameweekReadiness> {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const gameweeks = await this.prisma.gameweek.findMany({
      where: { seasonId },
      orderBy: { round: 'asc' },
      include: {
        _count: { select: { fixtures: true } },
        fixtures: {
          where: { isPublished: true },
          select: { kickoffAt: true },
          orderBy: { kickoffAt: 'asc' },
          take: 1,
        },
      },
    });

    let gameweeksWithDeadlines = 0;
    let gameweeksWithFixtures = 0;

    const items: GameweekReadinessItem[] = gameweeks.map(gw => {
      const hasTransferDeadline = true; // field is non-nullable
      const hasPredictionDeadline = true; // field is non-nullable
      const fixtureCount = gw._count.fixtures;
      const earliestKickoff = gw.fixtures[0]?.kickoffAt ?? null;

      gameweeksWithDeadlines++;
      if (fixtureCount > 0) gameweeksWithFixtures++;

      return {
        gameweekId: gw.id,
        round: gw.round,
        name: gw.name,
        hasTransferDeadline,
        hasPredictionDeadline,
        fixtureCount,
        earliestKickoff,
      };
    });

    return {
      seasonId,
      gameweeks: items,
      totalGameweeks: gameweeks.length,
      gameweeksWithDeadlines,
      gameweeksWithFixtures,
    };
  }

  async deriveGameweekDeadlines(seasonId: string): Promise<{ updated: number; skipped: number }> {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const gameweeks = await this.prisma.gameweek.findMany({
      where: { seasonId },
      include: {
        fixtures: {
          where: { isPublished: true },
          select: { kickoffAt: true },
          orderBy: { kickoffAt: 'asc' },
          take: 1,
        },
      },
    });

    let updated = 0;
    let skipped = 0;

    for (const gw of gameweeks) {
      const firstFixture = gw.fixtures[0];
      if (!firstFixture) {
        skipped++;
        continue;
      }
      const earliest = firstFixture.kickoffAt;
      const deadline = new Date(earliest.getTime() - 90 * 60 * 1000);

      await this.prisma.gameweek.update({
        where: { id: gw.id },
        data: {
          transferDeadlineAt: deadline,
          predictionDeadlineAt: deadline,
        },
      });
      updated++;
    }

    return { updated, skipped };
  }

  async getActivationImpact(seasonId: string): Promise<ActivationImpact> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { rulesConfig: true },
    });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const [fantasyTeamCount, predictionCount, priceCount, gameweekCount] = await Promise.all([
      this.prisma.fantasyTeam.count({ where: { seasonId } }),
      this.prisma.scorePrediction.count({
        where: { fixture: { seasonId } },
      }),
      this.prisma.fantasyPlayerPrice.count({ where: { seasonId } }),
      this.prisma.gameweek.count({ where: { seasonId, fixtures: { some: { isPublished: true } } } }),
    ]);

    const warnings: string[] = [];

    if (fantasyTeamCount === 0) {
      warnings.push('No fantasy teams yet — fans will need to create squads after activation');
    }
    if (!season.rulesConfig) {
      warnings.push('No fantasy rules config — provisional PSL rules will be applied on first activation');
    }
    if (priceCount === 0) {
      warnings.push('No player prices — generate provisional prices before activation');
    }
    if (gameweekCount === 0) {
      warnings.push('No gameweeks with deadlines — fans cannot make transfers until deadlines are set');
    }

    return {
      seasonId,
      seasonName: season.name,
      fantasyTeamsAffected: fantasyTeamCount,
      predictionCountAffected: predictionCount,
      rulesConfigured: !!season.rulesConfig,
      playerPricesSet: priceCount,
      gameweeksConfigured: gameweekCount,
      warnings,
    };
  }

  private filterUndefined<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined),
    ) as Partial<T>;
  }
}
