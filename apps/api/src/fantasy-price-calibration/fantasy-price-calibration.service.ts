import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FantasyPriceCalibrationBatchStatus,
  PlayerPosition,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_MIN_PRICE = 40;
const DEFAULT_MAX_PRICE = 200;
const DEFAULT_PRICE_BY_POSITION: Record<PlayerPosition, number> = {
  [PlayerPosition.GOALKEEPER]: 50,
  [PlayerPosition.DEFENDER]: 50,
  [PlayerPosition.MIDFIELDER]: 55,
  [PlayerPosition.FORWARD]: 60,
};

@Injectable()
export class FantasyPriceCalibrationService {
  constructor(private readonly prisma: PrismaService) {}

  async getSeasons() {
    const seasons = await this.prisma.season.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        rulesConfig: { select: { id: true, minPrice: true, maxPrice: true, defaultPrice: true } },
        _count: { select: { playerPrices: true, squadRegistrations: true, fantasyPriceCalibrationBatches: true } },
      },
    });

    return seasons.map(s => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      isActive: s.isActive,
      status: s.status,
      rulesConfigured: !!s.rulesConfig,
      minPrice: s.rulesConfig?.minPrice ?? DEFAULT_MIN_PRICE,
      maxPrice: s.rulesConfig?.maxPrice ?? DEFAULT_MAX_PRICE,
      defaultPrice: s.rulesConfig?.defaultPrice ?? 55,
      playerPriceCount: s._count.playerPrices,
      squadRegistrationCount: s._count.squadRegistrations,
      calibrationBatchCount: s._count.fantasyPriceCalibrationBatches,
    }));
  }

  async getOverview(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { rulesConfig: { select: { minPrice: true, maxPrice: true, defaultPrice: true } } },
    });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const minPrice = season.rulesConfig?.minPrice ?? DEFAULT_MIN_PRICE;
    const maxPrice = season.rulesConfig?.maxPrice ?? DEFAULT_MAX_PRICE;

    const [registrations, pricesSet, latestBatch] = await Promise.all([
      this.prisma.seasonSquadRegistration.count({ where: { seasonId } }),
      this.prisma.fantasyPlayerPrice.count({ where: { seasonId } }),
      this.prisma.fantasyPriceCalibrationBatch.findFirst({
        where: { seasonId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, missingPriceCount: true, invalidPriceCount: true, publishedPlayerCount: true },
      }),
    ]);

    const missing = registrations - pricesSet;
    const [belowMin, aboveMax] = await Promise.all([
      this.prisma.fantasyPlayerPrice.count({ where: { seasonId, price: { lt: minPrice } } }),
      this.prisma.fantasyPlayerPrice.count({ where: { seasonId, price: { gt: maxPrice } } }),
    ]);

    return {
      seasonId,
      seasonName: season.name,
      minPrice,
      maxPrice,
      registeredPlayerCount: registrations,
      pricedPlayerCount: pricesSet,
      missingPriceCount: Math.max(0, missing),
      invalidPriceCount: belowMin + aboveMax,
      latestBatch: latestBatch ?? null,
    };
  }

  async listPlayers(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { rulesConfig: { select: { minPrice: true, maxPrice: true } } },
    });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const minPrice = season.rulesConfig?.minPrice ?? DEFAULT_MIN_PRICE;
    const maxPrice = season.rulesConfig?.maxPrice ?? DEFAULT_MAX_PRICE;

    const registrations = await this.prisma.seasonSquadRegistration.findMany({
      where: { seasonId },
      include: {
        player: { select: { id: true, name: true, position: true } },
        team: { select: { id: true, name: true } },
      },
      orderBy: { player: { name: 'asc' } },
    });

    const prices = await this.prisma.fantasyPlayerPrice.findMany({
      where: { seasonId },
      select: { playerId: true, price: true },
    });
    const priceMap = new Map(prices.map(p => [p.playerId, p.price]));

    return registrations.map(reg => {
      const price = priceMap.get(reg.playerId) ?? null;
      return {
        playerId: reg.playerId,
        playerName: reg.player.name,
        position: reg.player.position,
        teamId: reg.teamId,
        teamName: reg.team.name,
        registrationStatus: reg.status,
        fantasyPrice: price,
        hasPrice: price !== null,
        isPriceValid: price !== null ? price >= minPrice && price <= maxPrice : null,
      };
    });
  }

  async listMissingPrices(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const registrations = await this.prisma.seasonSquadRegistration.findMany({
      where: { seasonId },
      include: { player: { select: { id: true, name: true, position: true } } },
    });

    const prices = await this.prisma.fantasyPlayerPrice.findMany({
      where: { seasonId },
      select: { playerId: true },
    });
    const pricedSet = new Set(prices.map(p => p.playerId));

    return registrations
      .filter(reg => !pricedSet.has(reg.playerId))
      .map(reg => ({
        playerId: reg.playerId,
        playerName: reg.player.name,
        position: reg.player.position,
        teamId: reg.teamId,
        registrationStatus: reg.status,
      }));
  }

  async listInvalidPrices(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { rulesConfig: { select: { minPrice: true, maxPrice: true } } },
    });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const minPrice = season.rulesConfig?.minPrice ?? DEFAULT_MIN_PRICE;
    const maxPrice = season.rulesConfig?.maxPrice ?? DEFAULT_MAX_PRICE;

    const invalid = await this.prisma.fantasyPlayerPrice.findMany({
      where: { seasonId, OR: [{ price: { lt: minPrice } }, { price: { gt: maxPrice } }] },
      include: { player: { select: { id: true, name: true, position: true } } },
    });

    return invalid.map(p => ({
      playerId: p.playerId,
      playerName: p.player.name,
      position: p.player.position,
      currentPrice: p.price,
      minPrice,
      maxPrice,
      violation: p.price < minPrice ? 'BELOW_MINIMUM' : 'ABOVE_MAXIMUM',
    }));
  }

  async updatePlayerPrice(seasonId: string, playerId: string, price: number, actorUserId?: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { rulesConfig: { select: { minPrice: true, maxPrice: true } } },
    });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new NotFoundException(`Player ${playerId} not found`);

    const minPrice = season.rulesConfig?.minPrice ?? DEFAULT_MIN_PRICE;
    const maxPrice = season.rulesConfig?.maxPrice ?? DEFAULT_MAX_PRICE;

    if (price < minPrice || price > maxPrice) {
      throw new BadRequestException(`Price ${price} must be between ${minPrice} and ${maxPrice} (fantasy points only — no cash value)`);
    }

    const record = await this.prisma.fantasyPlayerPrice.upsert({
      where: { playerId_seasonId: { playerId, seasonId } },
      create: { playerId, seasonId, price },
      update: { price },
    });

    await this.prisma.fantasyPlayerPriceHistory.create({
      data: { playerId, seasonId, price, reason: 'ADMIN_PRICE_CALIBRATION' },
    });

    await this.writeAuditLog('FANTASY_PLAYER_PRICE_UPDATED', 'FantasyPlayerPrice', `${playerId}:${seasonId}`, actorUserId, {
      seasonId,
      playerId,
      price,
    });

    return { playerId: record.playerId, seasonId: record.seasonId, price: record.price };
  }

  async bulkApplyDefaults(seasonId: string, actorUserId?: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { rulesConfig: { select: { minPrice: true, maxPrice: true, defaultPrice: true } } },
    });
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

    let applied = 0;
    let skipped = 0;

    for (const reg of registrations) {
      if (existingSet.has(reg.playerId)) { skipped++; continue; }

      const defaultPrice =
        season.rulesConfig?.defaultPrice ??
        DEFAULT_PRICE_BY_POSITION[reg.player.position];

      await this.prisma.fantasyPlayerPrice.create({
        data: { playerId: reg.playerId, seasonId, price: defaultPrice },
      });
      await this.prisma.fantasyPlayerPriceHistory.create({
        data: { playerId: reg.playerId, seasonId, price: defaultPrice, reason: 'BULK_DEFAULT_CALIBRATION' },
      });
      applied++;
    }

    await this.writeAuditLog('FANTASY_DEFAULT_PRICES_BULK_APPLIED', 'FantasyPriceCalibration', seasonId, actorUserId, {
      seasonId,
      applied,
      skipped,
    });

    return { applied, skipped };
  }

  async validateCalibration(seasonId: string, actorUserId?: string) {
    const overview = await this.getOverview(seasonId);

    const minPrice = overview.minPrice;
    const maxPrice = overview.maxPrice;

    const batchStatus: FantasyPriceCalibrationBatchStatus =
      overview.missingPriceCount > 0 || overview.invalidPriceCount > 0
        ? FantasyPriceCalibrationBatchStatus.HAS_WARNINGS
        : FantasyPriceCalibrationBatchStatus.VALIDATED;

    const batch = await this.prisma.fantasyPriceCalibrationBatch.create({
      data: {
        seasonId,
        status: batchStatus,
        minPrice,
        maxPrice,
        defaultPrice: 55,
        missingPriceCount: overview.missingPriceCount,
        invalidPriceCount: overview.invalidPriceCount,
        calibratedPlayerCount: overview.pricedPlayerCount,
        publishedPlayerCount: 0,
        createdByUserId: actorUserId ?? null,
        validatedAt: new Date(),
      },
    });

    await this.writeAuditLog('FANTASY_PRICE_CALIBRATION_VALIDATED', 'FantasyPriceCalibrationBatch', batch.id, actorUserId, {
      seasonId,
      missingPriceCount: overview.missingPriceCount,
      invalidPriceCount: overview.invalidPriceCount,
      status: batchStatus,
    });

    return batch;
  }

  async publishCalibration(seasonId: string, actorUserId?: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const latestBatch = await this.prisma.fantasyPriceCalibrationBatch.findFirst({
      where: { seasonId, status: { in: [FantasyPriceCalibrationBatchStatus.VALIDATED, FantasyPriceCalibrationBatchStatus.HAS_WARNINGS] } },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestBatch) {
      throw new BadRequestException('Run validateCalibration first before publishing');
    }

    const priceCount = await this.prisma.fantasyPlayerPrice.count({ where: { seasonId } });

    const published = await this.prisma.fantasyPriceCalibrationBatch.update({
      where: { id: latestBatch.id },
      data: {
        status: FantasyPriceCalibrationBatchStatus.PUBLISHED,
        publishedPlayerCount: priceCount,
        publishedAt: new Date(),
      },
    });

    await this.writeAuditLog('FANTASY_PRICE_CALIBRATION_PUBLISHED', 'FantasyPriceCalibrationBatch', latestBatch.id, actorUserId, {
      seasonId,
      publishedPlayerCount: priceCount,
    });

    return published;
  }

  async getReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { rulesConfig: { select: { id: true, minPrice: true, maxPrice: true } } },
    });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const minPrice = season.rulesConfig?.minPrice ?? DEFAULT_MIN_PRICE;
    const maxPrice = season.rulesConfig?.maxPrice ?? DEFAULT_MAX_PRICE;

    const checks = [];

    if (!season.rulesConfig) {
      checks.push({ code: 'NO_RULES_CONFIG', severity: 'BLOCKER' as const, passed: false, message: 'No FantasyRulesConfig — create rules config before price calibration' });
    } else {
      checks.push({ code: 'RULES_CONFIG_OK', severity: 'INFO' as const, passed: true, message: `Rules configured (minPrice=${minPrice}, maxPrice=${maxPrice})` });
    }

    const registrations = await this.prisma.seasonSquadRegistration.count({ where: { seasonId } });
    const pricesSet = await this.prisma.fantasyPlayerPrice.count({ where: { seasonId } });
    const missingCount = Math.max(0, registrations - pricesSet);

    checks.push({
      code: missingCount > 0 ? 'MISSING_PRICES' : 'PRICES_COMPLETE',
      severity: missingCount > 0 ? 'WARNING' as const : 'INFO' as const,
      passed: missingCount === 0,
      message: missingCount > 0 ? `${missingCount} registered players have no fantasy price` : `All ${registrations} registered players have prices`,
    });

    const invalidCount = await this.prisma.fantasyPlayerPrice.count({
      where: { seasonId, OR: [{ price: { lt: minPrice } }, { price: { gt: maxPrice } }] },
    });

    checks.push({
      code: invalidCount > 0 ? 'INVALID_PRICES' : 'PRICES_VALID',
      severity: invalidCount > 0 ? 'WARNING' as const : 'INFO' as const,
      passed: invalidCount === 0,
      message: invalidCount > 0 ? `${invalidCount} prices outside allowed range [${minPrice}–${maxPrice}]` : 'All prices within valid range',
    });

    const latestBatch = await this.prisma.fantasyPriceCalibrationBatch.findFirst({
      where: { seasonId },
      orderBy: { createdAt: 'desc' },
      select: { status: true },
    });

    const isPublished = latestBatch?.status === FantasyPriceCalibrationBatchStatus.PUBLISHED;
    checks.push({
      code: isPublished ? 'CALIBRATION_PUBLISHED' : 'CALIBRATION_NOT_PUBLISHED',
      severity: 'WARNING' as const,
      passed: isPublished,
      message: isPublished ? 'Latest calibration batch is PUBLISHED' : 'No published price calibration batch — run validate + publish',
    });

    const blockers = checks.filter(c => c.severity === 'BLOCKER' && !c.passed);
    const warnings = checks.filter(c => c.severity === 'WARNING' && !c.passed);

    return {
      seasonId,
      seasonName: season.name,
      readinessStatus: blockers.length > 0 ? 'BLOCKED' : warnings.length > 0 ? 'READY_WITH_WARNINGS' : 'READY',
      checks,
      blockerCount: blockers.length,
      warningCount: warnings.length,
    };
  }

  async getActivationImpact(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { rulesConfig: { select: { minPrice: true, maxPrice: true, defaultPrice: true } } },
    });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const minPrice = season.rulesConfig?.minPrice ?? DEFAULT_MIN_PRICE;
    const maxPrice = season.rulesConfig?.maxPrice ?? DEFAULT_MAX_PRICE;

    const [registrations, pricesSet, invalidPrices, latestBatch] = await Promise.all([
      this.prisma.seasonSquadRegistration.count({ where: { seasonId } }),
      this.prisma.fantasyPlayerPrice.count({ where: { seasonId } }),
      this.prisma.fantasyPlayerPrice.count({
        where: { seasonId, OR: [{ price: { lt: minPrice } }, { price: { gt: maxPrice } }] },
      }),
      this.prisma.fantasyPriceCalibrationBatch.findFirst({
        where: { seasonId },
        orderBy: { createdAt: 'desc' },
        select: { status: true, publishedAt: true },
      }),
    ]);

    const missing = Math.max(0, registrations - pricesSet);

    return {
      seasonId,
      seasonName: season.name,
      registeredPlayerCount: registrations,
      pricedPlayerCount: pricesSet,
      missingPriceCount: missing,
      invalidPriceCount: invalidPrices,
      minPrice,
      maxPrice,
      latestCalibrationStatus: latestBatch?.status ?? null,
      lastPublishedAt: latestBatch?.publishedAt ?? null,
      warnings: [
        ...(missing > 0 ? [`${missing} players have no fantasy price — fans cannot build complete squads`] : []),
        ...(invalidPrices > 0 ? [`${invalidPrices} prices outside allowed range [${minPrice}–${maxPrice}]`] : []),
        'Fantasy prices are points-only. They have no cash value, market value, or monetary meaning.',
      ],
    };
  }

  async getActivationDryRun(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season ${seasonId} not found`);

    const readiness = await this.getReadiness(seasonId);
    const impact = await this.getActivationImpact(seasonId);

    return {
      seasonId,
      seasonName: season.name,
      dryRunOnly: true,
      activationWillNotBePerformed: true,
      readinessStatus: readiness.readinessStatus,
      blockerCount: readiness.blockerCount,
      warningCount: readiness.warningCount,
      passedCheckCount: readiness.checks.filter(c => c.passed).length,
      failedCheckCount: readiness.checks.filter(c => !c.passed).length,
      domainChecks: [
        {
          domain: 'fantasy_price_calibration',
          status: readiness.readinessStatus,
          pricedPlayers: impact.pricedPlayerCount,
          missingPrices: impact.missingPriceCount,
          invalidPrices: impact.invalidPriceCount,
          latestCalibrationStatus: impact.latestCalibrationStatus,
        },
      ],
      nextActions: [
        ...(impact.missingPriceCount > 0 ? [`Apply default prices to ${impact.missingPriceCount} unpriced players via bulk-apply-defaults`] : []),
        ...(impact.invalidPriceCount > 0 ? [`Fix ${impact.invalidPriceCount} prices outside range [${impact.minPrice}–${impact.maxPrice}]`] : []),
        ...(impact.latestCalibrationStatus !== 'PUBLISHED' ? ['Run validate + publish calibration'] : []),
      ],
      safetyConfirmations: {
        worldCupHistoryPreserved: true,
        pslActivationNotPerformed: true,
        productionMoneyMovementDisabled: true,
        checkoutTicketingLiveProviderDisabled: true,
        fantasyPointsOnly: true,
        fanValueNonFinancial: true,
        pricesHaveNoCashValue: true,
      },
    };
  }

  // ── Audit ─────────────────────────────────────────────────────────────────

  private async writeAuditLog(
    action: string,
    entityType: string,
    entityId: string,
    actorUserId?: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action,
        entityType,
        entityId,
        route: `/admin/fantasy-price-calibration`,
        metadata: metadata as unknown as Prisma.InputJsonValue ?? Prisma.JsonNull,
      },
    });
  }
}
