import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FootballService } from './football.service';
import { FixtureEventPublisher } from './fixture-event.publisher';
import type { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = () => ({
  competition: { findMany: vi.fn(), findUnique: vi.fn() },
  competitionStage: { findMany: vi.fn(), findUnique: vi.fn() },
  season: { findMany: vi.fn(), findFirst: vi.fn() },
  team: { findMany: vi.fn(), findUnique: vi.fn() },
  player: { findMany: vi.fn(), findUnique: vi.fn() },
  fixture: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  groupStanding: { findMany: vi.fn() },
  matchEvent: { findMany: vi.fn(), create: vi.fn() },
  fixtureLineup: { findMany: vi.fn(), upsert: vi.fn() },
});

const makePublisherMock = () => ({
  publishFixtureStatusChanged: vi.fn(),
  publishFixtureScoreChanged: vi.fn(),
  publishMatchEventCreated: vi.fn(),
});

const makeSettlementMock = () => ({
  settleAllAcceptedForFixture: vi.fn().mockResolvedValue({ settled: 0, skipped: 0, errors: 0 }),
  settle: vi.fn(),
  getResult: vi.fn(),
});

const MOCK_COMPETITION = {
  id: 'comp-1', name: 'FIFA World Cup', slug: 'fifa-world-cup', logoUrl: null,
  format: 'HYBRID', teamCount: 48, hasGroups: true, hasKnockouts: true,
  hasHomeAway: true, usesNeutralVenues: true,
  pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0,
};
const MOCK_SEASON = {
  id: 'season-1', competitionId: 'comp-1', name: '2026', slug: '2026',
  startDate: new Date('2026-06-11'), endDate: new Date('2026-07-19'), isActive: true,
  competition: MOCK_COMPETITION,
};
const MOCK_TEAM = { id: 'team-1', name: 'South Africa', slug: 'south-africa', shortName: 'RSA', logoUrl: null, country: 'South Africa' };
const MOCK_TEAM_2 = { id: 'team-2', name: 'Canada', slug: 'canada', shortName: 'CAN', logoUrl: null, country: 'Canada' };
const MOCK_PLAYER = { id: 'player-1', teamId: 'team-1', name: 'Ronwen Williams', position: 'GOALKEEPER', nationality: 'South African', dateOfBirth: null, number: 1 };
const MOCK_VENUE = { id: 'venue-1', name: 'MetLife Stadium', city: 'East Rutherford', country: 'USA', capacity: 82500 };
const MOCK_GROUP = { id: 'group-1', seasonId: 'season-1', name: 'A' };
const MOCK_STAGE = { id: 'stage-1', name: 'Group Stage', slug: 'group-stage', type: 'GROUP', order: 1 };
const MOCK_FIXTURE = {
  id: 'fixture-1', seasonId: 'season-1', homeTeamId: 'team-1', awayTeamId: 'team-2',
  venueId: 'venue-1', groupId: 'group-1', stageId: 'stage-1', status: 'FINISHED',
  isNeutralVenue: true, legNumber: null,
  kickoffAt: new Date('2026-06-15T18:00:00Z'), homeScore: 2, awayScore: 0,
  currentMinute: 90, period: 'FULL_TIME', lastUpdatedAt: new Date(),
  homeTeam: MOCK_TEAM, awayTeam: MOCK_TEAM_2, venue: MOCK_VENUE, group: MOCK_GROUP,
  stage: MOCK_STAGE, season: MOCK_SEASON, events: [], lineups: [],
};
const MOCK_EVENT = {
  id: 'event-1', fixtureId: 'fixture-1', teamId: 'team-1', playerId: 'player-1',
  minute: 23, eventType: 'GOAL', description: null, metadata: null,
  createdAt: new Date(), team: MOCK_TEAM, player: MOCK_PLAYER,
};
const MOCK_LINEUP = {
  id: 'lineup-1', fixtureId: 'fixture-1', teamId: 'team-1', playerId: 'player-1',
  status: 'STARTING', shirtNumber: 1, position: 'GK', createdAt: new Date(),
  team: MOCK_TEAM, player: MOCK_PLAYER,
};

describe('FootballService', () => {
  let service: FootballService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let publisher: ReturnType<typeof makePublisherMock>;
  let settlement: ReturnType<typeof makeSettlementMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    publisher = makePublisherMock();
    settlement = makeSettlementMock();
    service = new FootballService(
      prisma as unknown as PrismaService,
      publisher as unknown as FixtureEventPublisher,
      settlement as unknown as import('../prediction-challenges/challenge-settlement.service').ChallengeSettlementService,
    );
  });

  // ── 1. List competitions ───────────────────────────────────────────────────
  it('listCompetitions returns all competitions', async () => {
    (prisma.competition.findMany as Mock).mockResolvedValue([MOCK_COMPETITION]);
    const result = await service.listCompetitions();
    expect(result).toHaveLength(1);
    expect(result[0]!.slug).toBe('fifa-world-cup');
  });

  // ── 2. Get competition by slug ────────────────────────────────────────────
  it('getCompetition throws 404 for unknown slug', async () => {
    (prisma.competition.findUnique as Mock).mockResolvedValue(null);
    await expect(service.getCompetition('unknown')).rejects.toThrow(NotFoundException);
  });

  // ── 3. Active season ──────────────────────────────────────────────────────
  it('getActiveSeason returns the active season', async () => {
    (prisma.season.findFirst as Mock).mockResolvedValue(MOCK_SEASON);
    const result = await service.getActiveSeason();
    expect(result.isActive).toBe(true);
    expect(result.slug).toBe('2026');
  });

  it('getActiveSeason throws 404 when no active season', async () => {
    (prisma.season.findFirst as Mock).mockResolvedValue(null);
    await expect(service.getActiveSeason()).rejects.toThrow(NotFoundException);
  });

  // ── 4. List teams ──────────────────────────────────────────────────────────
  it('listTeams returns teams', async () => {
    (prisma.team.findMany as Mock).mockResolvedValue([MOCK_TEAM]);
    const result = await service.listTeams({});
    expect(result).toHaveLength(1);
    expect(result[0]!.slug).toBe('south-africa');
  });

  // ── 5. Get team by slug ───────────────────────────────────────────────────
  it('getTeam returns a team by slug', async () => {
    (prisma.team.findUnique as Mock).mockResolvedValue(MOCK_TEAM);
    const result = await service.getTeam('south-africa');
    expect(result.name).toBe('South Africa');
  });

  it('getTeam throws 404 for unknown slug', async () => {
    (prisma.team.findUnique as Mock).mockResolvedValue(null);
    await expect(service.getTeam('unknown')).rejects.toThrow(NotFoundException);
  });

  // ── 6. Team players ───────────────────────────────────────────────────────
  it('getTeamPlayers returns players for a team', async () => {
    (prisma.team.findUnique as Mock).mockResolvedValue({ ...MOCK_TEAM, players: [MOCK_PLAYER] });
    const result = await service.getTeamPlayers('south-africa');
    expect(result).toHaveLength(1);
    expect(result[0]!.position).toBe('GOALKEEPER');
  });

  it('getTeamPlayers throws 404 for unknown team', async () => {
    (prisma.team.findUnique as Mock).mockResolvedValue(null);
    await expect(service.getTeamPlayers('unknown')).rejects.toThrow(NotFoundException);
  });

  // ── 7. List fixtures ──────────────────────────────────────────────────────
  it('listFixtures returns fixtures', async () => {
    (prisma.fixture.findMany as Mock).mockResolvedValue([MOCK_FIXTURE]);
    const result = await service.listFixtures({});
    expect(result).toHaveLength(1);
    expect(result[0]!.status).toBe('FINISHED');
  });

  it('listFixtures applies status filter', async () => {
    (prisma.fixture.findMany as Mock).mockResolvedValue([]);
    await service.listFixtures({ status: 'LIVE' });
    expect(prisma.fixture.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'LIVE' }) }),
    );
  });

  // ── 8. Fixture detail ─────────────────────────────────────────────────────
  it('getFixture returns fixture by id', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_FIXTURE);
    const result = await service.getFixture('fixture-1');
    expect(result.id).toBe('fixture-1');
    expect(result.homeScore).toBe(2);
  });

  it('getFixture throws 404 for unknown id', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(null);
    await expect(service.getFixture('unknown')).rejects.toThrow(NotFoundException);
  });

  // ── 9. Standings ──────────────────────────────────────────────────────────
  it('listStandings groups rows by group name', async () => {
    const standingA = { id: 's-1', groupId: 'group-1', teamId: 'team-1', played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 2, goalsAgainst: 0, points: 3, group: MOCK_GROUP, team: MOCK_TEAM };
    (prisma.groupStanding.findMany as Mock).mockResolvedValue([standingA]);
    const result = await service.listStandings({});
    expect(result).toHaveLength(1);
    expect(result[0]!.groupName).toBe('A');
    expect(result[0]!.standings[0]!.points).toBe(3);
  });

  // ── 10. Match centre ─────────────────────────────────────────────────────
  it('getMatchCentre returns fixture with events and lineups', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_FIXTURE);
    const result = await service.getMatchCentre('fixture-1');
    expect(result.fixture.id).toBe('fixture-1');
    expect(result.homeTeam.slug).toBe('south-africa');
    expect(result.awayTeam.slug).toBe('canada');
    expect(result.venue!.name).toBe('MetLife Stadium');
    expect(Array.isArray(result.events)).toBe(true);
    expect(Array.isArray(result.lineups)).toBe(true);
  });

  it('getMatchCentre throws 404 for unknown fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(null);
    await expect(service.getMatchCentre('unknown')).rejects.toThrow(NotFoundException);
  });

  // ── 11. Fixture live state ────────────────────────────────────────────────
  it('getFixtureLive returns live state fields', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({
      id: 'fixture-1', status: 'LIVE', homeScore: 1, awayScore: 0,
      currentMinute: 67, period: 'SECOND_HALF', lastUpdatedAt: new Date(),
      kickoffAt: new Date(), homeTeam: MOCK_TEAM, awayTeam: MOCK_TEAM_2,
    });
    const result = await service.getFixtureLive('fixture-1');
    expect(result.status).toBe('LIVE');
    expect(result.currentMinute).toBe(67);
    expect(result.period).toBe('SECOND_HALF');
  });

  it('getFixtureLive throws 404 for unknown fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(null);
    await expect(service.getFixtureLive('unknown')).rejects.toThrow(NotFoundException);
  });

  // ── 12. Fixture events ────────────────────────────────────────────────────
  it('getFixtureEvents returns ordered events', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'fixture-1' });
    (prisma.matchEvent.findMany as Mock).mockResolvedValue([MOCK_EVENT]);
    const result = await service.getFixtureEvents('fixture-1');
    expect(result).toHaveLength(1);
    expect(result[0]!.eventType).toBe('GOAL');
  });

  it('getFixtureEvents throws 404 for unknown fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(null);
    await expect(service.getFixtureEvents('unknown')).rejects.toThrow(NotFoundException);
  });

  // ── 13. Fixture lineups ───────────────────────────────────────────────────
  it('getFixtureLineups returns lineup entries', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'fixture-1' });
    (prisma.fixtureLineup.findMany as Mock).mockResolvedValue([MOCK_LINEUP]);
    const result = await service.getFixtureLineups('fixture-1');
    expect(result).toHaveLength(1);
    expect(result[0]!.status).toBe('STARTING');
  });

  // ── 14. Admin: update status ──────────────────────────────────────────────
  it('adminUpdateFixtureStatus updates status and publishes event', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'fixture-1' });
    (prisma.fixture.update as Mock).mockResolvedValue({ ...MOCK_FIXTURE, status: 'LIVE', currentMinute: 0 });
    const result = await service.adminUpdateFixtureStatus('fixture-1', {
      status: 'LIVE' as never,
      currentMinute: 0,
      period: 'FIRST_HALF',
    });
    expect(result.status).toBe('LIVE');
    expect(publisher.publishFixtureStatusChanged).toHaveBeenCalledWith('fixture-1', 'LIVE');
  });

  it('adminUpdateFixtureStatus throws 404 for unknown fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(null);
    await expect(
      service.adminUpdateFixtureStatus('unknown', { status: 'LIVE' as never }),
    ).rejects.toThrow(NotFoundException);
  });

  // ── 15. Admin: update score ───────────────────────────────────────────────
  it('adminUpdateFixtureScore updates score and publishes event', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'fixture-1' });
    (prisma.fixture.update as Mock).mockResolvedValue({ ...MOCK_FIXTURE, homeScore: 1, awayScore: 0 });
    const result = await service.adminUpdateFixtureScore('fixture-1', { homeScore: 1, awayScore: 0 });
    expect(result.homeScore).toBe(1);
    expect(publisher.publishFixtureScoreChanged).toHaveBeenCalledWith('fixture-1', 1, 0);
  });

  // ── 16. Admin: create match event ─────────────────────────────────────────
  it('adminCreateMatchEvent creates event and publishes', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'fixture-1' });
    (prisma.team.findUnique as Mock).mockResolvedValue({ id: 'team-1' });
    (prisma.player.findUnique as Mock).mockResolvedValue({ id: 'player-1' });
    (prisma.matchEvent.create as Mock).mockResolvedValue(MOCK_EVENT);
    const result = await service.adminCreateMatchEvent('fixture-1', {
      teamId: 'team-1',
      playerId: 'player-1',
      minute: 23,
      eventType: 'GOAL' as never,
    });
    expect(result.eventType).toBe('GOAL');
    expect(publisher.publishMatchEventCreated).toHaveBeenCalledWith('fixture-1', 'GOAL', 23);
  });

  it('adminCreateMatchEvent throws 400 for invalid teamId', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'fixture-1' });
    (prisma.team.findUnique as Mock).mockResolvedValue(null);
    await expect(
      service.adminCreateMatchEvent('fixture-1', { teamId: 'bad', minute: 1, eventType: 'GOAL' as never }),
    ).rejects.toThrow(BadRequestException);
  });

  it('adminCreateMatchEvent throws 400 for invalid playerId', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'fixture-1' });
    (prisma.team.findUnique as Mock).mockResolvedValue({ id: 'team-1' });
    (prisma.player.findUnique as Mock).mockResolvedValue(null);
    await expect(
      service.adminCreateMatchEvent('fixture-1', { teamId: 'team-1', playerId: 'bad', minute: 1, eventType: 'GOAL' as never }),
    ).rejects.toThrow(BadRequestException);
  });

  // ── Competition Format tests ───────────────────────────────────────────────

  it('listCompetitions returns format metadata', async () => {
    (prisma.competition.findMany as Mock).mockResolvedValue([MOCK_COMPETITION]);
    const [comp] = await service.listCompetitions();
    expect(comp).toBeDefined();
    expect((comp as typeof MOCK_COMPETITION).format).toBe('HYBRID');
    expect((comp as typeof MOCK_COMPETITION).hasGroups).toBe(true);
    expect((comp as typeof MOCK_COMPETITION).hasKnockouts).toBe(true);
    expect((comp as typeof MOCK_COMPETITION).hasHomeAway).toBe(true);
    expect((comp as typeof MOCK_COMPETITION).usesNeutralVenues).toBe(true);
    expect((comp as typeof MOCK_COMPETITION).teamCount).toBe(48);
  });

  it('listCompetitions supports LEAGUE format', async () => {
    const leagueComp = {
      ...MOCK_COMPETITION, slug: 'psl-premiership', format: 'LEAGUE' as const,
      teamCount: 16, hasGroups: false, hasKnockouts: false, usesNeutralVenues: false,
    };
    (prisma.competition.findMany as Mock).mockResolvedValue([leagueComp]);
    const [comp] = await service.listCompetitions();
    expect(comp).toBeDefined();
    expect((comp as typeof leagueComp).format).toBe('LEAGUE');
    expect((comp as typeof leagueComp).hasGroups).toBe(false);
  });

  it('listCompetitions supports CUP format', async () => {
    const cupComp = {
      ...MOCK_COMPETITION, slug: 'nedbank-cup', format: 'CUP' as const,
      teamCount: 32, hasGroups: false, hasKnockouts: true, usesNeutralVenues: false,
    };
    (prisma.competition.findMany as Mock).mockResolvedValue([cupComp]);
    const [comp] = await service.listCompetitions();
    expect(comp).toBeDefined();
    expect((comp as typeof cupComp).format).toBe('CUP');
    expect((comp as typeof cupComp).hasKnockouts).toBe(true);
  });

  it('listCompetitions supports TOURNAMENT format', async () => {
    const tournComp = {
      ...MOCK_COMPETITION, slug: 'afcon', format: 'TOURNAMENT' as const,
      teamCount: 24, hasGroups: true, hasKnockouts: true, usesNeutralVenues: true,
    };
    (prisma.competition.findMany as Mock).mockResolvedValue([tournComp]);
    const [comp] = await service.listCompetitions();
    expect(comp).toBeDefined();
    expect((comp as typeof tournComp).format).toBe('TOURNAMENT');
  });

  it('getCompetition includes stages', async () => {
    const compWithStages = {
      ...MOCK_COMPETITION,
      seasons: [],
      stages: [
        { id: 'stage-1', name: 'Group Stage', slug: 'group-stage', type: 'GROUP', order: 1 },
        { id: 'stage-2', name: 'Final', slug: 'final', type: 'FINAL', order: 2 },
      ],
    };
    (prisma.competition.findUnique as Mock).mockResolvedValue(compWithStages);
    const result = await service.getCompetition('fifa-world-cup');
    const stages = result.stages as typeof compWithStages.stages;
    expect(stages).toHaveLength(2);
    expect(stages[0]!.type).toBe('GROUP');
    expect(stages[1]!.type).toBe('FINAL');
  });

  it('listFixtures includes stage info', async () => {
    const fixtureWithStage = {
      ...MOCK_FIXTURE,
      stage: MOCK_STAGE,
    };
    (prisma.fixture.findMany as Mock).mockResolvedValue([fixtureWithStage]);
    const result = await service.listFixtures({});
    expect(result).toHaveLength(1);
    // stage is included but typed as nullable — cast through unknown for test assertion
    const stage = ((result[0] as unknown) as typeof fixtureWithStage).stage;
    expect(stage).toBeDefined();
    expect(stage.type).toBe('GROUP');
  });

  it('fixture has isNeutralVenue flag', async () => {
    const neutralFixture = { ...MOCK_FIXTURE, isNeutralVenue: true };
    (prisma.fixture.findUnique as Mock).mockResolvedValue(neutralFixture);
    const result = await service.getFixture('fixture-1');
    expect(result.isNeutralVenue).toBe(true);
  });

  it('isNeutralVenue is independent of hasHomeAway — both can be true', async () => {
    // A World Cup fixture has home/away team structure AND is at a neutral venue
    const wcFixture = { ...MOCK_FIXTURE, isNeutralVenue: true };
    (prisma.fixture.findUnique as Mock).mockResolvedValue(wcFixture);
    const result = await service.getFixture('fixture-1');
    expect(result.homeTeamId).toBeDefined();
    expect(result.awayTeamId).toBeDefined();
    expect(result.isNeutralVenue).toBe(true);
  });
});
