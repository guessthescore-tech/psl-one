import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FantasyAutoSubstitutionStatus, FantasySquadRole, NotificationPriority, NotificationType, PlayerPosition } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FantasyAutoSubService, type ComputedAutoSub } from './fantasy-auto-sub.service';
import { FanValueLedgerService } from '../fan-value/fan-value-ledger.service';
import { AchievementsService } from '../achievements/achievements.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityFeedService } from '../activity-feed/activity-feed.service';
import { computePlayerBasePoints, type PointsBreakdown, type StatInput } from './fantasy-scoring.utils';

// Internal alias — kept for compatibility with private method signature
type BreakdownJson = PointsBreakdown;

interface PlayerScoreResult {
  basePoints: number;
  breakdown: BreakdownJson;
  played: boolean;
}

interface TeamPlayerSlot {
  playerId: string;
  position: PlayerPosition;
  isStarter: boolean;
  isBench: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

export interface PlayerFixturePointsResult {
  basePoints: number;
  played: boolean;
  breakdown: BreakdownJson;
}

export interface GameweekScoreResult {
  fantasyTeamId: string;
  userId: string;
  seasonId: string;
  gameweekId: string;
  grossPoints: number;
  transferCost: number;
  chipPoints: number;
  benchPoints: number;
  captainPoints: number;
  netPoints: number;
  playerScores: {
    playerId: string;
    basePoints: number;
    multiplier: number;
    multipliedPoints: number;
    isStarter: boolean;
    isBench: boolean;
    isCaptain: boolean;
    isViceCaptain: boolean;
    countedInTotal: boolean;
    reason: string | null;
    breakdown: BreakdownJson;
  }[];
}

export interface GameweekLeaderboardRow {
  rank: number;
  fantasyTeamId: string;
  teamName: string;
  managerName: string;
  netPoints: number;
  grossPoints: number;
  transferCost: number;
  gameweekId: string;
}

export interface SeasonLeaderboardRow {
  rank: number;
  fantasyTeamId: string;
  teamName: string;
  managerName: string;
  netPoints: number;
  grossPoints: number;
  transferCost: number;
  seasonId: string;
}

@Injectable()
export class FantasyGameweekScoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly autoSubService: FantasyAutoSubService,
    private readonly fanValueLedgerService: FanValueLedgerService,
    private readonly achievementsService: AchievementsService,
    private readonly notificationsService: NotificationsService,
    private readonly activityFeedService: ActivityFeedService,
  ) {}

  private computeBasePoints(stat: StatInput, position: PlayerPosition): PlayerScoreResult {
    return computePlayerBasePoints(stat, position);
  }

  async calculatePlayerGameweekPoints(playerId: string, gameweekId: string): Promise<number> {
    const fixtures = await this.prisma.fixture.findMany({
      where: { gameweekId },
      include: { fantasyMatchStats: { where: { playerId } } },
    });

    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { position: true },
    });
    if (!player) return 0;

    const allStats = fixtures.flatMap(f => f.fantasyMatchStats);
    if (allStats.length === 0) return 0;

    const aggregate = {
      minutesPlayed: 0, goals: 0, assists: 0, ownGoals: 0,
      yellowCards: 0, redCards: 0, penaltiesMissed: 0, penaltiesSaved: 0,
      saves: 0, cleanSheet: false, bonusPoints: 0, tacklesWon: 0,
      interceptions: 0, blockedShots: 0, didNotPlay: true,
    };
    for (const s of allStats) {
      aggregate.minutesPlayed += s.minutesPlayed;
      aggregate.goals += s.goals;
      aggregate.assists += s.assists;
      aggregate.ownGoals += s.ownGoals;
      aggregate.yellowCards += s.yellowCards;
      aggregate.redCards += s.redCards;
      aggregate.penaltiesMissed += s.penaltiesMissed;
      aggregate.penaltiesSaved += s.penaltiesSaved;
      aggregate.saves += s.saves;
      if (s.cleanSheet) aggregate.cleanSheet = true;
      aggregate.bonusPoints += s.bonusPoints;
      aggregate.tacklesWon += s.tacklesWon;
      aggregate.interceptions += s.interceptions;
      aggregate.blockedShots += s.blockedShots;
      if (!s.didNotPlay) aggregate.didNotPlay = false;
    }

    return this.computeBasePoints(aggregate, player.position).basePoints;
  }

  async computePlayerFixturePoints(
    playerId: string,
    fixtureId: string,
  ): Promise<PlayerFixturePointsResult> {
    const [player, stat] = await Promise.all([
      this.prisma.player.findUnique({ where: { id: playerId }, select: { position: true } }),
      this.prisma.fantasyPlayerMatchStat.findFirst({ where: { playerId, fixtureId } }),
    ]);

    const emptyBreakdown: BreakdownJson = {
      appearance: 0, goals: 0, assists: 0, cleanSheet: 0, saves: 0,
      penaltySaves: 0, penaltyMisses: 0, yellowCards: 0, redCards: 0,
      ownGoals: 0, goalsConcededDeduction: 0, bonus: 0, defensive: 0,
      captainMultiplier: 1, benchBoostCounted: false,
    };

    if (!player || !stat) {
      return { basePoints: 0, played: false, breakdown: emptyBreakdown };
    }

    const result = this.computeBasePoints(stat, player.position);
    return { basePoints: result.basePoints, played: result.played, breakdown: result.breakdown };
  }

  async calculateFantasyTeamGameweekScore(
    fantasyTeamId: string,
    gameweekId: string,
    precomputedAutoSubs?: ComputedAutoSub[],
  ): Promise<GameweekScoreResult> {
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { id: fantasyTeamId },
      include: {
        players: {
          include: { player: { select: { id: true, position: true } } },
        },
      },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const gameweek = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: { id: true, seasonId: true },
    });
    if (!gameweek) throw new NotFoundException('Gameweek not found');

    // Get active chips for this gameweek
    const activeChips = await this.prisma.fantasyChip.findMany({
      where: { fantasyTeamId, status: 'ACTIVE', gameweekId },
    });
    const hasBenchBoost = activeChips.some(c => c.type === 'BENCH_BOOST');
    const hasTripleCaptain = activeChips.some(c => c.type === 'TRIPLE_CAPTAIN');

    // Get fixtures in gameweek
    const fixtures = await this.prisma.fixture.findMany({
      where: { gameweekId },
      include: {
        fantasyMatchStats: true,
      },
    });

    // Build stat lookup: playerId -> aggregated stats
    const statMap = new Map<string, {
      minutesPlayed: number; goals: number; assists: number; ownGoals: number;
      yellowCards: number; redCards: number; penaltiesMissed: number; penaltiesSaved: number;
      saves: number; cleanSheet: boolean; bonusPoints: number; tacklesWon: number;
      interceptions: number; blockedShots: number; didNotPlay: boolean;
    }>();

    for (const fixture of fixtures) {
      for (const s of fixture.fantasyMatchStats) {
        const existing = statMap.get(s.playerId) ?? {
          minutesPlayed: 0, goals: 0, assists: 0, ownGoals: 0,
          yellowCards: 0, redCards: 0, penaltiesMissed: 0, penaltiesSaved: 0,
          saves: 0, cleanSheet: false, bonusPoints: 0, tacklesWon: 0,
          interceptions: 0, blockedShots: 0, didNotPlay: true,
        };
        existing.minutesPlayed += s.minutesPlayed;
        existing.goals += s.goals;
        existing.assists += s.assists;
        existing.ownGoals += s.ownGoals;
        existing.yellowCards += s.yellowCards;
        existing.redCards += s.redCards;
        existing.penaltiesMissed += s.penaltiesMissed;
        existing.penaltiesSaved += s.penaltiesSaved;
        existing.saves += s.saves;
        if (s.cleanSheet) existing.cleanSheet = true;
        existing.bonusPoints += s.bonusPoints;
        existing.tacklesWon += s.tacklesWon;
        existing.interceptions += s.interceptions;
        existing.blockedShots += s.blockedShots;
        if (!s.didNotPlay) existing.didNotPlay = false;
        statMap.set(s.playerId, existing);
      }
    }

    // Build player slots
    const slots: TeamPlayerSlot[] = team.players.map(tp => ({
      playerId: tp.playerId,
      position: tp.player.position,
      isStarter: tp.squadRole === FantasySquadRole.STARTER,
      isBench: tp.squadRole === FantasySquadRole.SUBSTITUTE,
      isCaptain: tp.isCaptain,
      isViceCaptain: tp.isViceCaptain,
    }));

    // Compute base points for each player
    const playerResults = new Map<string, PlayerScoreResult>();
    for (const slot of slots) {
      const stat = statMap.get(slot.playerId);
      if (!stat) {
        playerResults.set(slot.playerId, {
          basePoints: 0,
          breakdown: {
            appearance: 0, goals: 0, assists: 0, cleanSheet: 0, saves: 0,
            penaltySaves: 0, penaltyMisses: 0, yellowCards: 0, redCards: 0,
            ownGoals: 0, goalsConcededDeduction: 0, bonus: 0, defensive: 0,
            captainMultiplier: 1, benchBoostCounted: false,
          },
          played: false,
        });
      } else {
        playerResults.set(slot.playerId, this.computeBasePoints(stat, slot.position));
      }
    }

    // Auto-substitution: compute in-memory (no DB write at this stage)
    const autoSubs = precomputedAutoSubs ?? await this.autoSubService.computeAutoSubsForTeamGameweek(fantasyTeamId, gameweekId);
    const autoSubbedOutSet = new Set(
      autoSubs.filter(s => s.status === FantasyAutoSubstitutionStatus.APPLIED).map(s => s.outPlayerId),
    );
    const autoSubbedInSet = new Set(
      autoSubs
        .filter(s => s.status === FantasyAutoSubstitutionStatus.APPLIED && s.inPlayerId != null)
        .map(s => s.inPlayerId!),
    );

    // Determine captain and vc
    const captainSlot = slots.find(s => s.isCaptain);
    const vcSlot = slots.find(s => s.isViceCaptain);

    const captainPlayed = captainSlot ? (playerResults.get(captainSlot.playerId)?.played ?? false) : false;
    const vcPlayed = vcSlot ? (playerResults.get(vcSlot.playerId)?.played ?? false) : false;
    const captainMultiplier: 1 | 2 | 3 = hasTripleCaptain ? 3 : 2;

    // Who gets the multiplier?
    // captain did not play and was auto-subbed out → vc still eligible for step-up IF vc played
    const captainPlayerId = captainPlayed
      ? captainSlot?.playerId
      : (vcPlayed ? vcSlot?.playerId : undefined);
    const vcSteppedUp = !captainPlayed && vcSlot != null && vcPlayed;

    // Build scored player list
    const playerScores: GameweekScoreResult['playerScores'] = [];
    let grossPoints = 0;
    let benchPoints = 0;
    let captainBonusPoints = 0;

    for (const slot of slots) {
      const result = playerResults.get(slot.playerId)!;
      const isCaptainPlayer = slot.playerId === captainPlayerId && captainPlayerId != null;
      const isAutoSubOut = autoSubbedOutSet.has(slot.playerId);
      const isAutoSubIn = autoSubbedInSet.has(slot.playerId);

      const multiplier = isCaptainPlayer ? captainMultiplier : 1;
      const multipliedPoints = result.basePoints * multiplier;

      // countedInTotal: original starters not auto-subbed out + auto-subbed-in bench players + bench boost bench players
      const countedInTotal =
        (slot.isStarter && !isAutoSubOut) ||
        isAutoSubIn ||
        (slot.isBench && hasBenchBoost && !isAutoSubIn);

      const breakdown = { ...result.breakdown };
      breakdown.captainMultiplier = multiplier;
      breakdown.benchBoostCounted = slot.isBench && hasBenchBoost;

      let reason: string | null = null;
      if (isAutoSubOut) reason = 'auto_sub_out';
      else if (isAutoSubIn) reason = 'auto_sub_in';
      else if (isCaptainPlayer && vcSteppedUp) reason = 'vc_stepped_up';
      else if (isCaptainPlayer && captainSlot?.playerId === slot.playerId) reason = 'captain';
      else if (slot.isBench && hasBenchBoost && !isAutoSubIn) reason = 'bench_boost';
      else if (slot.isStarter && !result.played) reason = 'did_not_play';
      else if (slot.isBench && !isAutoSubIn) reason = 'bench_not_counted';

      if (countedInTotal) {
        grossPoints += multipliedPoints;
        if (isCaptainPlayer) captainBonusPoints += result.basePoints * (multiplier - 1);
      }
      if (slot.isBench) benchPoints += result.basePoints;

      playerScores.push({
        playerId: slot.playerId,
        basePoints: result.basePoints,
        multiplier,
        multipliedPoints,
        isStarter: slot.isStarter,
        isBench: slot.isBench,
        isCaptain: slot.isCaptain,
        isViceCaptain: slot.isViceCaptain,
        countedInTotal,
        reason,
        breakdown,
      });
    }

    // Transfer cost for this gameweek
    const transfers = await this.prisma.fantasyTransfer.findMany({
      where: { fantasyTeamId, gameweekId },
      select: { transferCost: true, chipContext: true },
    });
    const transferCost = transfers.reduce((sum, t) => {
      // Wildcard and Free Hit transfers have 0 cost (chipContext set)
      return sum + (t.transferCost ?? 0);
    }, 0);

    const chipPoints = hasBenchBoost ? benchPoints : 0;
    const netPoints = grossPoints - transferCost;

    return {
      fantasyTeamId,
      userId: team.userId,
      seasonId: team.seasonId,
      gameweekId,
      grossPoints,
      transferCost,
      chipPoints,
      benchPoints,
      captainPoints: captainBonusPoints,
      netPoints,
      playerScores,
    };
  }

  async settleFantasyTeamGameweek(fantasyTeamId: string, gameweekId: string) {
    // Step 1: Apply auto-subs (idempotent DB write) so scoring uses saved rows on re-runs
    const autoSubResult = await this.autoSubService.applyAutoSubsForTeamGameweek(fantasyTeamId, gameweekId);
    const score = await this.calculateFantasyTeamGameweekScore(fantasyTeamId, gameweekId, autoSubResult.substitutions);

    // Upsert gameweek score
    const gwScore = await this.prisma.fantasyGameweekScore.upsert({
      where: { fantasyTeamId_gameweekId: { fantasyTeamId, gameweekId } },
      create: {
        fantasyTeamId,
        userId: score.userId,
        seasonId: score.seasonId,
        gameweekId,
        grossPoints: score.grossPoints,
        transferCost: score.transferCost,
        chipPoints: score.chipPoints,
        benchPoints: score.benchPoints,
        captainPoints: score.captainPoints,
        netPoints: score.netPoints,
        settledAt: new Date(),
      },
      update: {
        grossPoints: score.grossPoints,
        transferCost: score.transferCost,
        chipPoints: score.chipPoints,
        benchPoints: score.benchPoints,
        captainPoints: score.captainPoints,
        netPoints: score.netPoints,
        settledAt: new Date(),
      },
    });

    // Upsert each player score
    for (const ps of score.playerScores) {
      await this.prisma.fantasyPlayerGameweekScore.upsert({
        where: { fantasyTeamId_playerId_gameweekId: { fantasyTeamId, playerId: ps.playerId, gameweekId } },
        create: {
          fantasyTeamId,
          gameweekScoreId: gwScore.id,
          playerId: ps.playerId,
          gameweekId,
          userId: score.userId,
          basePoints: ps.basePoints,
          multiplier: ps.multiplier,
          multipliedPoints: ps.multipliedPoints,
          isStarter: ps.isStarter,
          isBench: ps.isBench,
          isCaptain: ps.isCaptain,
          isViceCaptain: ps.isViceCaptain,
          countedInTotal: ps.countedInTotal,
          ...(ps.reason !== null ? { reason: ps.reason } : {}),
          breakdownJson: ps.breakdown as object,
        },
        update: {
          gameweekScoreId: gwScore.id,
          basePoints: ps.basePoints,
          multiplier: ps.multiplier,
          multipliedPoints: ps.multipliedPoints,
          isStarter: ps.isStarter,
          isBench: ps.isBench,
          isCaptain: ps.isCaptain,
          isViceCaptain: ps.isViceCaptain,
          countedInTotal: ps.countedInTotal,
          reason: ps.reason,
          breakdownJson: ps.breakdown as object,
        },
      });
    }

    // Post fan value ledger entry (idempotent via idempotencyKey)
    await this.fanValueLedgerService.postFantasyGameweekScore(
      gwScore.id,
      score.userId,
      score.netPoints,
      score.grossPoints,
      score.transferCost,
      score.seasonId,
      gameweekId,
      fantasyTeamId,
    );

    // Achievement hooks for gameweek scoring milestones
    this.achievementsService.safeEvaluate(score.userId, [
      'fantasy-gameweek-25', 'fantasy-gameweek-50', 'fantasy-gameweek-75',
      'fantasy-season-100', 'fan-value-100', 'fan-value-250',
    ]).catch(() => null);

    // Sync team totalPoints from sum of all settled gameweek scores
    const { _sum } = await this.prisma.fantasyGameweekScore.aggregate({
      where: { fantasyTeamId, settledAt: { not: null } },
      _sum: { netPoints: true },
    });
    await this.prisma.fantasyTeam.update({
      where: { id: fantasyTeamId },
      data: { totalPoints: _sum.netPoints ?? 0 },
    });

    return gwScore;
  }

  async settleGameweekFantasyScores(gameweekId: string) {
    const gameweek = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: { id: true, seasonId: true },
    });
    if (!gameweek) throw new NotFoundException('Gameweek not found');

    // Preflight: refuse if any FINISHED fixture has no synced FantasyPlayerMatchStat
    // rows. A count-based check is too permissive — one synced fixture passes the
    // guard but leaves every other fixture at zero points. Per-fixture completeness
    // ensures ALL FINISHED fixtures are covered before writing score rows.
    const finishedFixtures = await this.prisma.fixture.findMany({
      where: { gameweekId, status: 'FINISHED' },
      select: { id: true },
    });
    if (finishedFixtures.length === 0) {
      throw new BadRequestException(
        `Gameweek '${gameweekId}' has no FINISHED fixtures — cannot settle before any matches are complete`,
      );
    }
    const coveredRows = await this.prisma.fantasyPlayerMatchStat.findMany({
      where: { fixtureId: { in: finishedFixtures.map(f => f.id) } },
      select: { fixtureId: true },
      distinct: ['fixtureId'],
    });
    const coveredSet = new Set(coveredRows.map(r => r.fixtureId));
    const unsyncedIds = finishedFixtures.map(f => f.id).filter(id => !coveredSet.has(id));
    if (unsyncedIds.length > 0) {
      throw new BadRequestException(
        `${unsyncedIds.length} FINISHED fixture(s) have no FantasyPlayerMatchStat rows: [${unsyncedIds.join(', ')}] — run sync:world-cup-player-stats first`,
      );
    }

    const teams = await this.prisma.fantasyTeam.findMany({
      where: { seasonId: gameweek.seasonId },
      select: { id: true },
    });

    let settled = 0;
    const errors: string[] = [];

    for (const team of teams) {
      try {
        await this.settleFantasyTeamGameweek(team.id, gameweekId);
        settled++;
      } catch (err) {
        errors.push(`${team.id}: ${(err as Error).message}`);
      }
    }

    // Assign ranks
    const scores = await this.prisma.fantasyGameweekScore.findMany({
      where: { gameweekId },
      orderBy: [{ netPoints: 'desc' }, { grossPoints: 'desc' }],
    });

    // Dense rank: same score = same rank
    let rank = 1;
    for (let i = 0; i < scores.length; i++) {
      const prev = scores[i - 1];
      if (i > 0 && prev && (prev.netPoints !== scores[i]!.netPoints || prev.grossPoints !== scores[i]!.grossPoints)) {
        rank = i + 1;
      }
      await this.prisma.fantasyGameweekScore.update({
        where: { id: scores[i]!.id },
        data: { rank },
      });
    }

    // Notify each manager of their gameweek result (safe hook, fire-and-forget)
    for (const score of scores) {
      this.notificationsService.createInAppNotification({
        userId: score.userId,
        type: NotificationType.FANTASY_RESULT,
        title: `Gameweek result: ${score.netPoints} pts`,
        body: `Your fantasy team scored ${score.netPoints} net points this gameweek (rank #${score.rank ?? '?'}).`,
        priority: NotificationPriority.NORMAL,
        sourceType: 'FANTASY_GAMEWEEK_SCORE',
        sourceId: score.id,
        actionUrl: `/fantasy/gameweeks/${gameweekId}/score`,
      }).catch(() => null);

      this.activityFeedService.createFantasyResultActivity(score.userId, {
        id: score.id,
        netPoints: score.netPoints,
        gameweekId,
      }).catch(() => null);
    }

    return { gameweekId, teamsSettled: settled, errors };
  }

  async recalculateFantasyTeamGameweek(fantasyTeamId: string, gameweekId: string) {
    return this.settleFantasyTeamGameweek(fantasyTeamId, gameweekId);
  }

  async getFantasyTeamGameweekHistory(userId: string) {
    const team = await this.prisma.fantasyTeam.findFirst({
      where: { userId },
      select: { id: true, seasonId: true },
    });
    if (!team) return [];

    return this.prisma.fantasyGameweekScore.findMany({
      where: { fantasyTeamId: team.id },
      include: {
        gameweek: { select: { id: true, name: true, round: true } },
      },
      orderBy: { gameweek: { round: 'asc' } },
    });
  }

  async getFantasyTeamGameweekScore(userId: string, gameweekId: string) {
    const team = await this.prisma.fantasyTeam.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const score = await this.prisma.fantasyGameweekScore.findUnique({
      where: { fantasyTeamId_gameweekId: { fantasyTeamId: team.id, gameweekId } },
      include: {
        gameweek: { select: { id: true, name: true, round: true } },
        playerScores: {
          include: {
            player: { select: { id: true, name: true, position: true } },
          },
          orderBy: [{ isStarter: 'desc' }, { multipliedPoints: 'desc' }],
        },
      },
    });
    if (!score) throw new NotFoundException('Gameweek score not found');
    return score;
  }

  async getGameweekFantasyLeaderboard(gameweekId: string): Promise<GameweekLeaderboardRow[]> {
    const gameweek = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: { id: true },
    });
    if (!gameweek) throw new NotFoundException('Gameweek not found');

    const scores = await this.prisma.fantasyGameweekScore.findMany({
      where: { gameweekId },
      include: {
        fantasyTeam: { select: { id: true, name: true } },
        user: {
          select: {
            email: true,
            fanProfile: { select: { displayName: true } },
          },
        },
      },
    });

    const sorted = scores.sort((a, b) => {
      if (b.netPoints !== a.netPoints) return b.netPoints - a.netPoints;
      if (b.grossPoints !== a.grossPoints) return b.grossPoints - a.grossPoints;
      return a.fantasyTeamId.localeCompare(b.fantasyTeamId);
    });

    let rank = 1;
    return sorted.map((s, i) => {
      if (i > 0) {
        const prev = sorted[i - 1]!;
        if (prev.netPoints !== s.netPoints || prev.grossPoints !== s.grossPoints) {
          rank = i + 1;
        }
      }
      return {
        rank,
        fantasyTeamId: s.fantasyTeamId,
        teamName: s.fantasyTeam.name,
        managerName: s.user.fanProfile?.displayName ?? s.user.email,
        netPoints: s.netPoints,
        grossPoints: s.grossPoints,
        transferCost: s.transferCost,
        gameweekId,
      };
    });
  }

  async getSeasonFantasyLeaderboard(seasonId: string): Promise<SeasonLeaderboardRow[]> {
    const scores = await this.prisma.fantasyGameweekScore.findMany({
      where: { seasonId, settledAt: { not: null } },
      select: { fantasyTeamId: true, netPoints: true, grossPoints: true, transferCost: true },
    });

    const teamTotals = new Map<string, { netPoints: number; grossPoints: number; transferCost: number }>();
    for (const s of scores) {
      const existing = teamTotals.get(s.fantasyTeamId) ?? { netPoints: 0, grossPoints: 0, transferCost: 0 };
      teamTotals.set(s.fantasyTeamId, {
        netPoints: existing.netPoints + s.netPoints,
        grossPoints: existing.grossPoints + s.grossPoints,
        transferCost: existing.transferCost + s.transferCost,
      });
    }

    if (teamTotals.size === 0) return [];

    const teams = await this.prisma.fantasyTeam.findMany({
      where: { id: { in: [...teamTotals.keys()] } },
      include: {
        user: {
          select: {
            email: true,
            fanProfile: { select: { displayName: true } },
          },
        },
      },
    });
    const teamMap = new Map(teams.map(t => [t.id, t]));

    const rows = [...teamTotals.entries()]
      .map(([fantasyTeamId, totals]) => {
        const team = teamMap.get(fantasyTeamId);
        return {
          fantasyTeamId,
          teamName: team?.name ?? '',
          managerName: team?.user.fanProfile?.displayName ?? team?.user.email ?? '',
          ...totals,
          seasonId,
        };
      })
      .sort((a, b) => {
        if (b.netPoints !== a.netPoints) return b.netPoints - a.netPoints;
        if (b.grossPoints !== a.grossPoints) return b.grossPoints - a.grossPoints;
        return a.fantasyTeamId.localeCompare(b.fantasyTeamId);
      });

    let rank = 1;
    return rows.map((r, i) => {
      if (i > 0) {
        const prev = rows[i - 1]!;
        if (prev.netPoints !== r.netPoints || prev.grossPoints !== r.grossPoints) {
          rank = i + 1;
        }
      }
      return { ...r, rank };
    });
  }
}

