import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSourceType, DataStatus, FreshnessStatus, LineupStatus } from '@prisma/client';
import { MatchCentreService } from './match-centre.service';

function makePrisma() {
  return {
    fixture: { findUnique: vi.fn() },
    fixtureLineup: { findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn() },
    playerMatchStats: { findMany: vi.fn() },
    playerRating: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
    matchEvent: { create: vi.fn() },
    leagueStanding: { findMany: vi.fn(), upsert: vi.fn() },
    teamFormRecord: { findUnique: vi.fn(), upsert: vi.fn() },
    player: { findUnique: vi.fn() },
    dataIngestionLog: { create: vi.fn(), findMany: vi.fn() },
  };
}

const mockFixture = {
  id: 'fixture-1',
  homeTeamId: 'team-home',
  awayTeamId: 'team-away',
  kickoffAt: new Date('2026-07-01T15:00:00Z'),
  status: 'SCHEDULED',
  homeScore: null,
  awayScore: null,
  currentMinute: null,
  period: null,
  startedAt: null,
  finishedAt: null,
  lastUpdatedAt: null,
  lastSyncedAt: null,
  providerSource: null,
  providerFixtureId: null,
  homeTeam: { id: 'team-home', name: 'Pirates', shortName: 'OPR', slug: 'pirates', logoUrl: null },
  awayTeam: { id: 'team-away', name: 'Chiefs', shortName: 'KC', slug: 'chiefs', logoUrl: null },
  venue: null,
  gameweek: null,
  season: { id: 'season-1', name: 'PSL 2025/26', competition: { id: 'comp-1', name: 'PSL' } },
  events: [],
  lineups: [],
  playerMatchStats: [],
  playerRatings: [],
};

function makeCampaignTrigger() {
  return {
    fireLineupConfirmed: vi.fn().mockResolvedValue(undefined),
    fireMatchStarted: vi.fn().mockResolvedValue(undefined),
    fireGoalScored: vi.fn().mockResolvedValue(undefined),
    fireHalfTime: vi.fn().mockResolvedValue(undefined),
    fireFullTime: vi.fn().mockResolvedValue(undefined),
    firePredictionResultAvailable: vi.fn().mockResolvedValue(undefined),
  };
}

describe('MatchCentreService', () => {
  let svc: MatchCentreService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    const campaignTrigger = makeCampaignTrigger();
    svc = new MatchCentreService(prisma as never, campaignTrigger as never);
  });

  // ── Match Centre ──────────────────────────────────────────────────────────

  describe('getFixtureMatchCentre', () => {
    it('returns combined fixture data with provenance', async () => {
      prisma.fixture.findUnique.mockResolvedValue(mockFixture);
      const result = await svc.getFixtureMatchCentre('fixture-1');
      expect(result.fixture.id).toBe('fixture-1');
      expect(result.homeTeam.shortName).toBe('OPR');
      expect(result.dataProvenance).toBeDefined();
      expect(result.lineups.home).toEqual([]);
      expect(result.lineups.away).toEqual([]);
    });

    it('throws NotFound when fixture missing', async () => {
      prisma.fixture.findUnique.mockResolvedValue(null);
      await expect(svc.getFixtureMatchCentre('no-fixture')).rejects.toThrow(NotFoundException);
    });
  });

  // ── Lineups ───────────────────────────────────────────────────────────────

  describe('getFixtureLineups', () => {
    it('groups lineups by team', async () => {
      prisma.fixture.findUnique.mockResolvedValue({ id: 'fixture-1', homeTeamId: 'team-home', awayTeamId: 'team-away', status: 'SCHEDULED' });
      const mockLineup = [
        { id: 'l1', fixtureId: 'fixture-1', teamId: 'team-home', playerId: 'p1', status: LineupStatus.STARTING, shirtNumber: 1, position: 'GK', player: { id: 'p1', name: 'GK Player', position: 'GOALKEEPER', number: 1 }, team: { id: 'team-home', name: 'Pirates', shortName: 'OPR' } },
        { id: 'l2', fixtureId: 'fixture-1', teamId: 'team-away', playerId: 'p2', status: LineupStatus.STARTING, shirtNumber: 2, position: 'GK', player: { id: 'p2', name: 'Away GK', position: 'GOALKEEPER', number: 2 }, team: { id: 'team-away', name: 'Chiefs', shortName: 'KC' } },
      ];
      prisma.fixtureLineup.findMany.mockResolvedValue(mockLineup);
      const result = await svc.getFixtureLineups('fixture-1');
      expect(result.home).toHaveLength(1);
      expect(result.away).toHaveLength(1);
      expect(result.dataProvenance).toBeDefined();
    });
  });

  // ── Standings ─────────────────────────────────────────────────────────────

  describe('getSeasonStandings', () => {
    it('returns standings ordered by position with club info', async () => {
      const mockStandings = [
        { id: 's1', seasonId: 'season-1', position: 1, points: 30, won: 10, drawn: 0, lost: 0, played: 10, goalsFor: 25, goalsAgainst: 5, goalDifference: 20, form: 'WWWWW', sourceType: DataSourceType.MANUAL, dataStatus: DataStatus.PROVISIONAL, freshnessStatus: FreshnessStatus.MANUAL, lastUpdatedAt: new Date(), providerKey: null, club: { id: 'team-home', name: 'Pirates', shortName: 'OPR', slug: 'pirates', logoUrl: null } },
      ];
      prisma.leagueStanding.findMany.mockResolvedValue(mockStandings);
      const result = await svc.getSeasonStandings('season-1');
      expect(result.standings).toHaveLength(1);
      expect(result.standings[0]!.position).toBe(1);
      expect(result.dataProvenance.sourceType).toBe(DataSourceType.MANUAL);
    });

    it('returns empty with default provenance', async () => {
      prisma.leagueStanding.findMany.mockResolvedValue([]);
      const result = await svc.getSeasonStandings('season-1');
      expect(result.standings).toHaveLength(0);
      expect(result.dataProvenance.sourceType).toBe(DataSourceType.MANUAL);
    });
  });

  // ── Team Form ─────────────────────────────────────────────────────────────

  describe('getTeamForm', () => {
    it('returns form record with provenance', async () => {
      const mockForm = {
        id: 'form-1', clubId: 'team-home', seasonId: 'season-1', formString: 'WWDLW',
        recentFixtures: [], sourceType: DataSourceType.MANUAL, dataStatus: DataStatus.PROVISIONAL,
        lastUpdatedAt: new Date(), club: { id: 'team-home', name: 'Pirates', shortName: 'OPR' },
      };
      prisma.teamFormRecord.findUnique.mockResolvedValue(mockForm);
      const result = await svc.getTeamForm('team-home', 'season-1');
      expect(result.form?.formString).toBe('WWDLW');
    });

    it('returns null form when none exists', async () => {
      prisma.teamFormRecord.findUnique.mockResolvedValue(null);
      const result = await svc.getTeamForm('team-home', 'season-1');
      expect(result.form).toBeNull();
    });
  });

  // ── Player Profile ────────────────────────────────────────────────────────

  describe('getPlayerProfile', () => {
    it('returns aggregated player profile', async () => {
      prisma.player.findUnique.mockResolvedValue({ id: 'p1', name: 'Striker', position: 'FORWARD', nationality: 'ZA', dateOfBirth: null, number: 9, team: { id: 'team-home', name: 'Pirates', shortName: 'OPR', slug: 'pirates' } });
      prisma.playerMatchStats.findMany.mockResolvedValue([
        { goals: 2, assists: 1, minutesPlayed: 90, yellowCards: 0, redCards: 0, saves: 0, cleanSheet: false, createdAt: new Date() },
        { goals: 1, assists: 0, minutesPlayed: 75, yellowCards: 1, redCards: 0, saves: 0, cleanSheet: false, createdAt: new Date() },
      ]);
      prisma.playerRating.findMany.mockResolvedValue([]);

      const result = await svc.getPlayerProfile('p1', 'season-1');
      expect(result.player.name).toBe('Striker');
      expect(result.seasonAggregate.goals).toBe(3);
      expect(result.seasonAggregate.assists).toBe(1);
      expect(result.seasonAggregate.appearances).toBe(2);
    });
  });

  // ── Admin: Upsert Standings ───────────────────────────────────────────────

  describe('adminUpsertStandings', () => {
    it('upserts all standing entries and logs ingestion', async () => {
      prisma.leagueStanding.upsert.mockResolvedValue({});
      prisma.dataIngestionLog.create.mockResolvedValue({});

      const result = await svc.adminUpsertStandings('admin-1', {
        seasonId: 'season-1',
        entries: [
          { clubId: 'team-home', position: 1, played: 5, won: 4, drawn: 1, lost: 0, goalsFor: 10, goalsAgainst: 3, goalDifference: 7, points: 13 },
        ],
      });

      expect(result.updated).toBe(1);
      expect(prisma.leagueStanding.upsert).toHaveBeenCalledOnce();
      expect(prisma.dataIngestionLog.create).toHaveBeenCalledOnce();
    });
  });

  // ── Admin: Player Rating ──────────────────────────────────────────────────

  describe('adminUpsertPlayerRating', () => {
    it('creates player rating and logs ingestion', async () => {
      prisma.playerRating.findUnique.mockResolvedValue(null);
      prisma.playerRating.upsert.mockResolvedValue({ id: 'rating-1', performanceRating: 7.5 });
      prisma.dataIngestionLog.create.mockResolvedValue({});

      const result = await svc.adminUpsertPlayerRating('admin-1', {
        playerId: 'p1',
        fixtureId: 'fixture-1',
        performanceRating: 7.5,
        minutesPlayed: 90,
        goals: 1,
        assists: 0,
      });

      expect(result.performanceRating).toBe(7.5);
      expect(prisma.dataIngestionLog.create).toHaveBeenCalledOnce();
    });
  });

  // ── Admin: Sandbox Ingest ─────────────────────────────────────────────────

  describe('adminIngestSandboxData', () => {
    it('routes LINEUP entity type and returns processed true', async () => {
      prisma.fixtureLineup.findFirst.mockResolvedValue(null);
      prisma.fixtureLineup.create.mockResolvedValue({});
      prisma.dataIngestionLog.create.mockResolvedValue({});

      const result = await svc.adminIngestSandboxData('admin-1', {
        fixtureId: 'fixture-1',
        entityType: 'LINEUP',
        data: { players: [{ playerId: 'p1', teamId: 'team-home', shirtNumber: 9, status: 'STARTING' }] },
      });

      expect(result.processed).toBe(true);
      expect(result.entityType).toBe('LINEUP');
    });

    it('routes MATCH_EVENT entity type', async () => {
      prisma.matchEvent.create.mockResolvedValue({});
      prisma.dataIngestionLog.create.mockResolvedValue({});

      const result = await svc.adminIngestSandboxData('admin-1', {
        fixtureId: 'fixture-1',
        entityType: 'MATCH_EVENT',
        data: { minute: 23, eventType: 'GOAL', playerId: 'p1', teamId: 'team-home' },
      });

      expect(result.processed).toBe(true);
      expect(prisma.matchEvent.create).toHaveBeenCalledOnce();
    });
  });

  // ── Capability Status ─────────────────────────────────────────────────────

  describe('adminGetCapabilityStatus', () => {
    it('returns capability overview with provider swap strategy', async () => {
      const result = await svc.adminGetCapabilityStatus();
      expect(result.richUI).toBe('ENABLED');
      expect(result.productionIngestion).toBe('DISABLED');
      expect(result.officialProviderFeed).toBe('PROVIDER_REQUIRED');
      expect(result.officialProviderSwapStrategy).toContain('Do NOT change fan route contracts');
    });
  });
});
