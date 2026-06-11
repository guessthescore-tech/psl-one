import { Injectable, NotFoundException } from '@nestjs/common';
import { ClubContentStatus, FixtureStatus, ShopProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const TEAM_INCLUDE = {
  clubProfile: true,
  experienceStatus: true,
} as const;

@Injectable()
export class ClubExperienceService {
  constructor(private prisma: PrismaService) {}

  async getClubs(seasonSlug?: string) {
    if (seasonSlug) {
      const season = await this.prisma.season.findUnique({
        where: { slug: seasonSlug },
        include: {
          seasonTeams: {
            where: { status: { in: ['ACTIVE', 'PROVISIONAL'] } },
            include: {
              team: { include: TEAM_INCLUDE },
            },
            orderBy: { team: { name: 'asc' } },
          },
        },
      });
      if (!season) throw new NotFoundException(`Season '${seasonSlug}' not found`);
      return season.seasonTeams.map((st) => ({
        ...st.team,
        participationStatus: st.status,
        participationSource: st.source,
      }));
    }

    // Without a season filter, return only teams that have a ClubProfile
    // (i.e. PSL clubs). WC2026 teams are not part of the club experience.
    return this.prisma.team.findMany({
      where: { clubProfile: { isNot: null } },
      include: TEAM_INCLUDE,
      orderBy: { name: 'asc' },
    });
  }

  async getClubBySlug(slug: string) {
    const team = await this.prisma.team.findUnique({
      where: { slug },
      include: TEAM_INCLUDE,
    });
    if (!team) throw new NotFoundException(`Club '${slug}' not found`);
    return team;
  }

  async getClubOverview(slug: string) {
    const team = await this.prisma.team.findUnique({
      where: { slug },
      include: {
        clubProfile: true,
        experienceStatus: true,
        players: {
          select: { id: true, name: true, position: true, number: true, nationality: true },
          take: 6,
          orderBy: { name: 'asc' },
        },
        contentItems: {
          where: { status: ClubContentStatus.PUBLISHED },
          orderBy: { publishedAt: 'desc' },
          take: 3,
        },
      },
    });
    if (!team) throw new NotFoundException(`Club '${slug}' not found`);

    const [nextFixture, recentResult] = await Promise.all([
      this.prisma.fixture.findFirst({
        where: {
          OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
          status: FixtureStatus.SCHEDULED,
        },
        include: {
          homeTeam: { select: { name: true, slug: true, shortName: true } },
          awayTeam: { select: { name: true, slug: true, shortName: true } },
          venue: { select: { name: true, city: true } },
          gameweek: { select: { name: true } },
        },
        orderBy: { kickoffAt: 'asc' },
      }),
      this.prisma.fixture.findFirst({
        where: {
          OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
          status: FixtureStatus.FINISHED,
        },
        include: {
          homeTeam: { select: { name: true, slug: true, shortName: true } },
          awayTeam: { select: { name: true, slug: true, shortName: true } },
        },
        orderBy: { kickoffAt: 'desc' },
      }),
    ]);

    return { ...team, nextFixture, recentResult };
  }

  async getClubFixtures(slug: string) {
    const team = await this._requireTeamBySlug(slug);
    return this.prisma.fixture.findMany({
      where: {
        OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
        status: { in: [FixtureStatus.SCHEDULED, FixtureStatus.LIVE] },
      },
      include: {
        homeTeam: { select: { name: true, slug: true, shortName: true, logoUrl: true } },
        awayTeam: { select: { name: true, slug: true, shortName: true, logoUrl: true } },
        venue: { select: { name: true, city: true } },
        gameweek: { select: { name: true, transferDeadlineAt: true } },
      },
      orderBy: { kickoffAt: 'asc' },
    });
  }

  async getClubResults(slug: string) {
    const team = await this._requireTeamBySlug(slug);
    return this.prisma.fixture.findMany({
      where: {
        OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
        status: FixtureStatus.FINISHED,
      },
      include: {
        homeTeam: { select: { name: true, slug: true, shortName: true, logoUrl: true } },
        awayTeam: { select: { name: true, slug: true, shortName: true, logoUrl: true } },
        venue: { select: { name: true, city: true } },
      },
      orderBy: { kickoffAt: 'desc' },
      take: 20,
    });
  }

  async getClubSquad(slug: string) {
    const team = await this._requireTeamBySlug(slug);
    const players = await this.prisma.player.findMany({
      where: { teamId: team.id },
      select: {
        id: true, name: true, position: true, number: true,
        nationality: true, dateOfBirth: true,
        prices: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { price: true },
        },
      },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    });

    const grouped: Record<string, typeof players> = {
      GOALKEEPER: [], DEFENDER: [], MIDFIELDER: [], FORWARD: [],
    };
    for (const p of players) {
      const pos = p.position as string;
      if (pos in grouped) grouped[pos]!.push(p);
    }
    return { teamId: team.id, teamName: team.name, slug: team.slug, grouped };
  }

  async getClubStats(slug: string) {
    const team = await this._requireTeamBySlug(slug);
    const [played, won, drawn, lost, players] = await Promise.all([
      this.prisma.fixture.count({
        where: {
          OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
          status: FixtureStatus.FINISHED,
        },
      }),
      this.prisma.fixture.count({
        where: {
          status: FixtureStatus.FINISHED,
          OR: [
            { homeTeamId: team.id, homeScore: { gt: 0 } },
            { awayTeamId: team.id, awayScore: { gt: 0 } },
          ],
        },
      }),
      this.prisma.fixture.count({
        where: {
          status: FixtureStatus.FINISHED,
          OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
          AND: [
            { homeScore: { not: null } },
            { awayScore: { not: null } },
          ],
        },
      }),
      this.prisma.fixture.count({
        where: {
          status: FixtureStatus.FINISHED,
          OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
        },
      }),
      this.prisma.player.count({ where: { teamId: team.id } }),
    ]);

    return {
      teamId: team.id,
      name: team.name,
      slug: team.slug,
      matchesPlayed: played,
      squadSize: players,
      note: 'Win/draw/loss stats require match-specific scoring data. Full stats available after PSL fixtures are imported.',
    };
  }

  async getClubStadium(slug: string) {
    const team = await this._requireTeamBySlug(slug);
    const fixture = await this.prisma.fixture.findFirst({
      where: { homeTeamId: team.id, venue: { isNot: null } },
      include: { venue: true },
      orderBy: { kickoffAt: 'desc' },
    });

    return {
      teamId: team.id,
      name: team.name,
      venue: fixture?.venue ?? null,
      note: fixture ? undefined : 'No venue linked to this club yet. Venue will be confirmed when PSL fixtures are imported.',
    };
  }

  async getClubTickets(slug: string) {
    const team = await this._requireTeamBySlug(slug);
    const profile = await this.prisma.clubProfile.findUnique({ where: { teamId: team.id } });
    return {
      teamId: team.id,
      name: team.name,
      ticketingUrl: profile?.ticketingUrl ?? null,
      status: 'NOT_ENABLED',
      message: 'Ticketing integration not enabled in MVP. Ready for future ticketing partner integration.',
      commerceNote: 'Checkout not enabled in MVP. Commerce integration planned for Sprint 3.',
    };
  }

  async getClubShop(slug: string) {
    const team = await this._requireTeamBySlug(slug);
    const products = await this.prisma.clubShopProduct.findMany({
      where: { teamId: team.id, status: ShopProductStatus.PUBLISHED },
      orderBy: [{ featured: 'desc' }, { category: 'asc' }, { name: 'asc' }],
    });

    const categories = [...new Set(products.map((p) => p.category))];
    return {
      teamId: team.id,
      name: team.name,
      commerceStatus: 'CATALOGUE_ONLY',
      checkoutEnabled: false,
      commerceNote: 'Checkout not enabled in MVP. Club shopfront ready for Sprint 3 commerce integration.',
      categories,
      products,
    };
  }

  async getClubShopProduct(slug: string, productSlug: string) {
    const team = await this._requireTeamBySlug(slug);
    const product = await this.prisma.clubShopProduct.findUnique({
      where: { teamId_slug: { teamId: team.id, slug: productSlug } },
    });
    if (!product) throw new NotFoundException(`Product '${productSlug}' not found`);
    return {
      ...product,
      checkoutEnabled: false,
      commerceNote: 'Checkout not enabled in MVP. Club shopfront ready for Sprint 3 commerce integration.',
    };
  }

  private async _requireTeamBySlug(slug: string) {
    const team = await this.prisma.team.findUnique({ where: { slug } });
    if (!team) throw new NotFoundException(`Club '${slug}' not found`);
    return team;
  }
}
