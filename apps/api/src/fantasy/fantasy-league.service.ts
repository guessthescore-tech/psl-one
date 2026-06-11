import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FantasyHeadToHeadStatus,
  FantasyLeagueMemberRole,
  FantasyLeagueScoringType,
  FantasyLeagueType,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';

const MAX_PRIVATE_LEAGUES = 30;
const MAX_PUBLIC_LEAGUES = 5;

export interface ClassicStandingsRow {
  rank: number;
  fantasyTeamId: string;
  teamName: string;
  managerName: string;
  totalPoints: number;
  transferCount: number;
  joinedAt: Date;
}

export interface H2HStandingsRow {
  rank: number;
  userId: string;
  fantasyTeamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  h2hPoints: number;
  totalFantasyPoints: number;
}

@Injectable()
export class FantasyLeagueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly achievementsService: AchievementsService,
  ) {}

  // ── Private leagues ─────────────────────────────────────────────────────

  async createPrivateLeague(userId: string, seasonId: string, name: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException('Season not found');

    const team = await this.prisma.fantasyTeam.findFirst({ where: { userId, seasonId } });
    if (!team) throw new BadRequestException('You must have a fantasy team to create a league');

    await this.assertPrivateLeagueLimit(team.id);

    const inviteCode = this.generateJoinCode();

    const league = await this.prisma.fantasyLeague.create({
      data: {
        seasonId,
        name,
        type: FantasyLeagueType.PRIVATE,
        scoringType: FantasyLeagueScoringType.CLASSIC,
        inviteCode,
        createdByUserId: userId,
        isJoinable: true,
      },
    });

    await this.prisma.fantasyLeagueMember.create({
      data: {
        leagueId: league.id,
        userId,
        fantasyTeamId: team.id,
        role: FantasyLeagueMemberRole.OWNER,
      },
    });

    this.achievementsService.safeEvaluate(userId, ['joined-first-fantasy-league', 'created-first-fantasy-league']).catch(() => null);
    return league;
  }

  async joinLeagueByCode(userId: string, inviteCode: string) {
    const league = await this.prisma.fantasyLeague.findUnique({ where: { inviteCode } });
    if (!league) throw new NotFoundException('League not found');
    if (!league.isJoinable) throw new BadRequestException('League is not accepting new members');
    if (league.type === FantasyLeagueType.GLOBAL) {
      throw new BadRequestException('Cannot join global league via invite code');
    }

    const team = await this.prisma.fantasyTeam.findFirst({
      where: { userId, seasonId: league.seasonId },
    });
    if (!team) throw new BadRequestException('You must have a fantasy team for this season to join');

    const existing = await this.prisma.fantasyLeagueMember.findUnique({
      where: { leagueId_fantasyTeamId: { leagueId: league.id, fantasyTeamId: team.id } },
    });
    if (existing && !existing.leftAt) throw new BadRequestException('Already a member of this league');

    await this.assertPrivateLeagueLimit(team.id);

    if (existing && existing.leftAt) {
      const membership = await this.prisma.fantasyLeagueMember.update({
        where: { id: existing.id },
        data: { leftAt: null, role: FantasyLeagueMemberRole.MEMBER },
      });
      this.achievementsService.safeEvaluate(userId, ['joined-first-fantasy-league']).catch(() => null);
      return membership;
    }

    const membership = await this.prisma.fantasyLeagueMember.create({
      data: {
        leagueId: league.id,
        userId,
        fantasyTeamId: team.id,
        role: FantasyLeagueMemberRole.MEMBER,
      },
    });
    this.achievementsService.safeEvaluate(userId, ['joined-first-fantasy-league']).catch(() => null);
    return membership;
  }

  async leaveLeague(userId: string, leagueId: string) {
    const league = await this.prisma.fantasyLeague.findUnique({ where: { id: leagueId } });
    if (!league) throw new NotFoundException('League not found');
    if (league.type === FantasyLeagueType.GLOBAL) {
      throw new BadRequestException('Cannot leave global leagues');
    }

    const team = await this.prisma.fantasyTeam.findFirst({
      where: { userId, seasonId: league.seasonId },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const member = await this.prisma.fantasyLeagueMember.findUnique({
      where: { leagueId_fantasyTeamId: { leagueId, fantasyTeamId: team.id } },
    });
    if (!member || member.leftAt) throw new BadRequestException('Not a member of this league');

    return this.prisma.fantasyLeagueMember.update({
      where: { id: member.id },
      data: { leftAt: new Date() },
    });
  }

  // ── Public leagues ──────────────────────────────────────────────────────

  async joinPublicLeague(userId: string, seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException('Season not found');

    const team = await this.prisma.fantasyTeam.findFirst({ where: { userId, seasonId } });
    if (!team) throw new BadRequestException('You must have a fantasy team to join a public league');

    // Check if already in a public league for this season
    const existingPublic = await this.prisma.fantasyLeagueMember.findMany({
      where: {
        userId,
        leftAt: null,
        league: { type: FantasyLeagueType.PUBLIC, seasonId },
      },
    });
    if (existingPublic.length >= MAX_PUBLIC_LEAGUES) {
      throw new BadRequestException(`Maximum of ${MAX_PUBLIC_LEAGUES} public leagues allowed`);
    }

    // Check this team isn't already in a public league for this season
    const teamPublic = await this.prisma.fantasyLeagueMember.findMany({
      where: {
        fantasyTeamId: team.id,
        leftAt: null,
        league: { type: FantasyLeagueType.PUBLIC, seasonId },
      },
    });
    if (teamPublic.length > 0) throw new BadRequestException('Already in a public league for this season');

    // Find first available public league with room, or create one
    let league = await this.prisma.fantasyLeague.findFirst({
      where: { seasonId, type: FantasyLeagueType.PUBLIC, isJoinable: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!league) {
      league = await this.prisma.fantasyLeague.create({
        data: {
          seasonId,
          name: 'Public League',
          type: FantasyLeagueType.PUBLIC,
          scoringType: FantasyLeagueScoringType.CLASSIC,
          isJoinable: true,
        },
      });
    }

    const membership = await this.prisma.fantasyLeagueMember.create({
      data: {
        leagueId: league.id,
        userId,
        fantasyTeamId: team.id,
        role: FantasyLeagueMemberRole.MEMBER,
      },
    });
    this.achievementsService.safeEvaluate(userId, ['joined-first-fantasy-league']).catch(() => null);
    return membership;
  }

  // ── Global leagues ──────────────────────────────────────────────────────

  async ensureGlobalLeagueMemberships(userId: string, fantasyTeamId: string) {
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { id: fantasyTeamId },
      include: { season: true },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const seasonId = team.seasonId;

    const fanProfile = await this.prisma.fanProfile.findUnique({ where: { userId } });

    // Determine starting gameweek
    const startingGw = await this.prisma.gameweek.findFirst({
      where: {
        seasonId,
        startsAt: { lte: team.createdAt },
        endsAt: { gte: team.createdAt },
      },
    }) ?? await this.prisma.gameweek.findFirst({
      where: { seasonId },
      orderBy: { round: 'asc' },
    });

    const rulesConfig = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId } });
    const seasonGwCount = rulesConfig?.seasonGameweekCount ?? 38;
    const gwRound = startingGw?.round ?? 1;

    const memberships: { leagueName: string; joined: boolean }[] = [];

    const globalLeagues = [
      { name: 'Overall', always: true },
      { name: `Country: ${fanProfile?.country ?? ''}`, condition: !!fanProfile?.country },
      { name: `Team: ${await this.getTeamName(fanProfile?.preferredTeamId)}`, condition: !!fanProfile?.preferredTeamId },
      { name: `GW${startingGw?.round ?? 1} Starters`, always: true },
      { name: 'Second Chance', condition: seasonGwCount >= 38 && gwRound >= 21 },
    ];

    for (const def of globalLeagues) {
      if (!('always' in def && def.always) && !('condition' in def && def.condition)) continue;
      if (!def.name.trim() || def.name.endsWith(': ')) continue;

      const league = await this.upsertGlobalLeague(def.name, seasonId);
      const existing = await this.prisma.fantasyLeagueMember.findUnique({
        where: { leagueId_fantasyTeamId: { leagueId: league.id, fantasyTeamId } },
      });

      if (!existing) {
        await this.prisma.fantasyLeagueMember.create({
          data: {
            leagueId: league.id,
            userId,
            fantasyTeamId,
            role: FantasyLeagueMemberRole.MEMBER,
          },
        });
        memberships.push({ leagueName: def.name, joined: true });
      } else {
        memberships.push({ leagueName: def.name, joined: false });
      }
    }

    return memberships;
  }

  async ensureGlobalLeaguesForSeason(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException('Season not found');

    const teams = await this.prisma.fantasyTeam.findMany({
      where: { seasonId },
      select: { id: true, userId: true },
    });

    let total = 0;
    for (const team of teams) {
      const memberships = await this.ensureGlobalLeagueMemberships(team.userId, team.id);
      total += memberships.filter(m => m.joined).length;
    }

    return { seasonId, teamsProcessed: teams.length, membershipsCreated: total };
  }

  // ── Queries ─────────────────────────────────────────────────────────────

  async getMyLeagues(userId: string) {
    return this.prisma.fantasyLeagueMember.findMany({
      where: { userId, leftAt: null },
      include: { league: true },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async getLeague(leagueId: string) {
    const league = await this.prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        members: {
          where: { leftAt: null },
          include: { fantasyTeam: { select: { id: true, name: true } } },
        },
      },
    });
    if (!league) throw new NotFoundException('League not found');
    return league;
  }

  async getLeagueStandings(leagueId: string): Promise<ClassicStandingsRow[]> {
    const league = await this.prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            fantasyTeam: true,
            user: {
              include: { fanProfile: { select: { displayName: true } } },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    if (!league) throw new NotFoundException('League not found');

    if (league.scoringType !== FantasyLeagueScoringType.CLASSIC) {
      throw new BadRequestException('Use H2H standings endpoint for head-to-head leagues');
    }

    const teamIds = league.members.map(m => m.fantasyTeamId);

    // Count only transfers that count toward limit (exclude Wildcard/Free Hit)
    const transferCounts = await this.prisma.fantasyTransfer.groupBy({
      by: ['fantasyTeamId'],
      where: {
        fantasyTeamId: { in: teamIds },
        countsTowardLimit: true,
      },
      _count: { id: true },
    });

    const countMap = new Map(transferCounts.map(r => [r.fantasyTeamId, r._count.id]));

    const rows: ClassicStandingsRow[] = league.members.map(m => ({
      rank: 0,
      fantasyTeamId: m.fantasyTeamId,
      teamName: m.fantasyTeam.name,
      managerName: m.user.fanProfile?.displayName ?? m.user.email,
      totalPoints: m.fantasyTeam.totalPoints,
      transferCount: countMap.get(m.fantasyTeamId) ?? 0,
      joinedAt: m.joinedAt,
    }));

    rows.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (a.transferCount !== b.transferCount) return a.transferCount - b.transferCount;
      return a.fantasyTeamId.localeCompare(b.fantasyTeamId);
    });

    rows.forEach((r, i) => { r.rank = i + 1; });

    return rows;
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  async listLeagues(seasonId?: string, type?: FantasyLeagueType) {
    return this.prisma.fantasyLeague.findMany({
      where: {
        ...(seasonId ? { seasonId } : {}),
        ...(type ? { type } : {}),
      },
      include: {
        _count: { select: { members: { where: { leftAt: null } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async lockLeague(leagueId: string) {
    const league = await this.prisma.fantasyLeague.findUnique({ where: { id: leagueId } });
    if (!league) throw new NotFoundException('League not found');
    return this.prisma.fantasyLeague.update({ where: { id: leagueId }, data: { isJoinable: false } });
  }

  async unlockLeague(leagueId: string) {
    const league = await this.prisma.fantasyLeague.findUnique({ where: { id: leagueId } });
    if (!league) throw new NotFoundException('League not found');
    return this.prisma.fantasyLeague.update({ where: { id: leagueId }, data: { isJoinable: true } });
  }

  // ── H2H (legacy) ─────────────────────────────────────────────────────────

  async getH2HStandings(leagueId: string): Promise<H2HStandingsRow[]> {
    const league = await this.prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: {
        members: { where: { leftAt: null }, include: { fantasyTeam: true } },
        h2hFixtures: { where: { status: FantasyHeadToHeadStatus.COMPLETE } },
      },
    });
    if (!league) throw new NotFoundException('League not found');

    const statsMap = new Map<string, H2HStandingsRow>();
    for (const m of league.members) {
      statsMap.set(m.fantasyTeamId, {
        rank: 0,
        userId: m.userId,
        fantasyTeamId: m.fantasyTeamId,
        teamName: m.fantasyTeam.name,
        played: 0, won: 0, drawn: 0, lost: 0,
        h2hPoints: 0,
        totalFantasyPoints: m.fantasyTeam.totalPoints,
      });
    }

    for (const fix of league.h2hFixtures) {
      const home = statsMap.get(fix.homeTeamId);
      const away = statsMap.get(fix.awayTeamId);
      if (!home || !away || fix.homePoints === null || fix.awayPoints === null) continue;
      home.played++; away.played++;
      if (fix.homePoints > fix.awayPoints) {
        home.won++; home.h2hPoints += 3; away.lost++;
      } else if (fix.homePoints < fix.awayPoints) {
        away.won++; away.h2hPoints += 3; home.lost++;
      } else {
        home.drawn++; home.h2hPoints += 1; away.drawn++; away.h2hPoints += 1;
      }
    }

    const rows = Array.from(statsMap.values());
    rows.sort((a, b) => b.h2hPoints - a.h2hPoints || b.totalFantasyPoints - a.totalFantasyPoints);
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
  }

  async generateH2HFixtures(leagueId: string, gameweekId: string) {
    const league = await this.prisma.fantasyLeague.findUnique({
      where: { id: leagueId },
      include: { members: { where: { leftAt: null } } },
    });
    if (!league) throw new NotFoundException('League not found');
    if (league.scoringType !== FantasyLeagueScoringType.HEAD_TO_HEAD) {
      throw new BadRequestException('League is not head-to-head');
    }

    const teams = league.members.map(m => m.fantasyTeamId);
    if (teams.length < 2) throw new BadRequestException('Need at least 2 teams for H2H');

    const gw = await this.prisma.gameweek.findUnique({ where: { id: gameweekId } });
    if (!gw) throw new NotFoundException('Gameweek not found');

    const fixtures: { leagueId: string; gameweekId: string; homeTeamId: string; awayTeamId: string }[] = [];
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const homeTeamId = shuffled[i];
      const awayTeamId = shuffled[i + 1];
      if (!homeTeamId || !awayTeamId) continue;
      fixtures.push({ leagueId, gameweekId, homeTeamId, awayTeamId });
    }

    await this.prisma.fantasyHeadToHeadFixture.createMany({ data: fixtures, skipDuplicates: true });
    return { leagueId, gameweekId, fixturesCreated: fixtures.length };
  }

  async settleH2HGameweek(leagueId: string, gameweekId: string) {
    const fixtures = await this.prisma.fantasyHeadToHeadFixture.findMany({
      where: { leagueId, gameweekId, status: FantasyHeadToHeadStatus.SCHEDULED },
      include: { homeTeam: true, awayTeam: true },
    });

    let settled = 0;
    for (const fix of fixtures) {
      const homePoints = fix.homeTeam.totalPoints - fix.homeTeam.totalTransferDeductions;
      const awayPoints = fix.awayTeam.totalPoints - fix.awayTeam.totalTransferDeductions;
      const homeLeaguePoints = homePoints > awayPoints ? 3 : homePoints === awayPoints ? 1 : 0;
      const awayLeaguePoints = awayPoints > homePoints ? 3 : homePoints === awayPoints ? 1 : 0;

      await this.prisma.fantasyHeadToHeadFixture.update({
        where: { id: fix.id },
        data: { homePoints, awayPoints, homeLeaguePoints, awayLeaguePoints, status: FantasyHeadToHeadStatus.COMPLETE, settledAt: new Date() },
      });
      settled++;
    }

    return { leagueId, gameweekId, settled };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  generateJoinCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    const bytes = randomBytes(8);
    for (let i = 0; i < 8; i++) {
      code += chars[bytes[i]! % chars.length];
    }
    return code;
  }

  async assertPrivateLeagueLimit(fantasyTeamId: string) {
    const count = await this.prisma.fantasyLeagueMember.count({
      where: {
        fantasyTeamId,
        leftAt: null,
        league: { type: FantasyLeagueType.PRIVATE },
      },
    });
    if (count >= MAX_PRIVATE_LEAGUES) {
      throw new BadRequestException(`Maximum of ${MAX_PRIVATE_LEAGUES} private leagues allowed`);
    }
  }

  async assertPublicLeagueLimit(fantasyTeamId: string) {
    const count = await this.prisma.fantasyLeagueMember.count({
      where: {
        fantasyTeamId,
        leftAt: null,
        league: { type: FantasyLeagueType.PUBLIC },
      },
    });
    if (count >= MAX_PUBLIC_LEAGUES) {
      throw new BadRequestException(`Maximum of ${MAX_PUBLIC_LEAGUES} public leagues allowed`);
    }
  }

  private async upsertGlobalLeague(name: string, seasonId: string) {
    const existing = await this.prisma.fantasyLeague.findFirst({
      where: { name, seasonId, type: FantasyLeagueType.GLOBAL },
    });
    if (existing) return existing;
    return this.prisma.fantasyLeague.create({
      data: {
        name,
        seasonId,
        type: FantasyLeagueType.GLOBAL,
        scoringType: FantasyLeagueScoringType.CLASSIC,
        isJoinable: true,
      },
    });
  }

  private async getTeamName(teamId: string | null | undefined): Promise<string> {
    if (!teamId) return '';
    const team = await this.prisma.team.findUnique({ where: { id: teamId }, select: { name: true } });
    return team?.name ?? '';
  }
}
