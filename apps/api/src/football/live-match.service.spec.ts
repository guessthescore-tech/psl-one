import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FixtureStatus, MatchEventType, PlayerPosition } from '@prisma/client';
import { LiveMatchService } from './live-match.service';
import type { LiveMatchProviderAdapter } from './live-match-provider.interface';
import { FootballController } from './football.controller';

const mockPrisma = {
  fixture: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  matchEvent: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  fantasyPlayerMatchStat: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
  adminAuditLog: {
    create: vi.fn(),
  },
  team: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  player: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
};

function makeService(provider?: LiveMatchProviderAdapter) {
  return new LiveMatchService(mockPrisma as any, provider);
}

const FIXTURE_ID = 'fixture-1';
const EVENT_ID = 'event-1';
const PLAYER_ID = 'player-1';
const TEAM_ID = 'team-1';
const PROVIDER_FIXTURE_ID = 'sm-fixture-1';

function makeProvider(overrides: Partial<LiveMatchProviderAdapter> = {}): LiveMatchProviderAdapter {
  return {
    providerName: 'sportmonks',
    fetchFixtureState: vi.fn().mockResolvedValue(null),
    fetchFixtureEvents: vi.fn().mockResolvedValue([]),
    fetchFixtureLineups: vi.fn().mockResolvedValue([]),
    fetchFixturePlayerStats: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

const baseFixture = {
  id: FIXTURE_ID,
  status: FixtureStatus.SCHEDULED,
  homeScore: 0,
  awayScore: 0,
  currentMinute: null,
  period: null,
  lastUpdatedAt: new Date(),
  startedAt: null,
  halfTimeAt: null,
  resumedAt: null,
  finishedAt: null,
  kickoffAt: new Date(),
  homeTeamId: 'home-team',
  awayTeamId: 'away-team',
  homeTeam: { id: 'home-team', name: 'Home', slug: 'home', shortName: 'HOM' },
  awayTeam: { id: 'away-team', name: 'Away', slug: 'away', shortName: 'AWY' },
};

const baseEvent = {
  id: EVENT_ID,
  fixtureId: FIXTURE_ID,
  minute: 10,
  eventType: MatchEventType.GOAL,
  teamId: 'home-team',
  team: null,
  player: null,
  relatedPlayer: null,
};

describe('LiveMatchService', () => {
  let service: LiveMatchService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = makeService();
  });

  // ── getLiveMatchDashboard ─────────────────────────────────────────────────

  describe('getLiveMatchDashboard', () => {
    it('returns dashboard with events, lineups, stats, and preview', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({
        ...baseFixture,
        venue: null,
        group: null,
        stage: null,
        season: { id: 's1', competition: {} },
        gameweek: null,
        events: [],
        lineups: [],
        fantasyMatchStats: [],
      });
      const result = await service.getLiveMatchDashboard(FIXTURE_ID);
      expect(result).toHaveProperty('fixture');
      expect(result).toHaveProperty('events');
      expect(result).toHaveProperty('lineups');
      expect(result).toHaveProperty('playerStats');
      expect(result).toHaveProperty('liveFantasyPreview');
    });

    it('throws NotFoundException for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.getLiveMatchDashboard('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getFixtureLiveState ───────────────────────────────────────────────────

  describe('getFixtureLiveState', () => {
    it('returns live state fields', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(baseFixture);
      const result = await service.getFixtureLiveState(FIXTURE_ID);
      expect(result.id).toBe(FIXTURE_ID);
      expect(result.status).toBe(FixtureStatus.SCHEDULED);
    });

    it('throws for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.getFixtureLiveState('x')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getFixtureTimeline ────────────────────────────────────────────────────

  describe('getFixtureTimeline', () => {
    it('returns events ordered by minute', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.matchEvent.findMany.mockResolvedValueOnce([baseEvent]);
      const result = await service.getFixtureTimeline(FIXTURE_ID);
      expect(result).toHaveLength(1);
    });

    it('throws for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.getFixtureTimeline('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getFixturePlayerStats ─────────────────────────────────────────────────

  describe('getFixturePlayerStats', () => {
    it('returns stats', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fantasyPlayerMatchStat.findMany.mockResolvedValueOnce([]);
      const result = await service.getFixturePlayerStats(FIXTURE_ID);
      expect(Array.isArray(result)).toBe(true);
    });

    it('throws for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.getFixturePlayerStats('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getLiveFantasyPreview ─────────────────────────────────────────────────

  describe('getLiveFantasyPreview', () => {
    it('returns provisional flag and player previews', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fantasyPlayerMatchStat.findMany.mockResolvedValueOnce([
        {
          playerId: PLAYER_ID,
          minutesPlayed: 90,
          goals: 1,
          assists: 0,
          ownGoals: 0,
          yellowCards: 0,
          redCards: 0,
          penaltiesMissed: 0,
          penaltiesSaved: 0,
          saves: 0,
          cleanSheet: false,
          didNotPlay: false,
          player: { name: 'Test Player', position: PlayerPosition.MIDFIELDER },
          team: { name: 'Home' },
        },
      ]);
      const result = await service.getLiveFantasyPreview(FIXTURE_ID);
      expect(result.provisional).toBe(true);
      expect(result.players).toHaveLength(1);
      expect(result.players[0]!.estimatedPoints).toBeGreaterThan(0);
    });

    it('player with 0 minutes gets 0 points', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fantasyPlayerMatchStat.findMany.mockResolvedValueOnce([
        {
          playerId: PLAYER_ID,
          minutesPlayed: 0,
          goals: 0,
          assists: 0,
          ownGoals: 0,
          yellowCards: 0,
          redCards: 0,
          penaltiesMissed: 0,
          penaltiesSaved: 0,
          saves: 0,
          cleanSheet: false,
          didNotPlay: true,
          player: { name: 'Bench Player', position: PlayerPosition.FORWARD },
          team: null,
        },
      ]);
      const result = await service.getLiveFantasyPreview(FIXTURE_ID);
      expect(result.players[0]!.estimatedPoints).toBe(0);
    });
  });

  // ── updateFixtureLiveState ────────────────────────────────────────────────

  describe('updateFixtureLiveState', () => {
    it('updates status and sets startedAt when transitioning to LIVE', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fixture.update.mockResolvedValueOnce({
        id: FIXTURE_ID, status: FixtureStatus.LIVE, homeScore: 0, awayScore: 0,
        currentMinute: null, period: null, lastUpdatedAt: new Date(),
        startedAt: new Date(), halfTimeAt: null, finishedAt: null,
      });
      const result = await service.updateFixtureLiveState(FIXTURE_ID, { status: FixtureStatus.LIVE });
      expect(result.status).toBe(FixtureStatus.LIVE);
      const updateCall = mockPrisma.fixture.update.mock.calls[0]![0];
      expect(updateCall.data).toHaveProperty('startedAt');
    });

    it('sets halfTimeAt when transitioning to HALF_TIME', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fixture.update.mockResolvedValueOnce({ id: FIXTURE_ID, status: FixtureStatus.HALF_TIME });
      await service.updateFixtureLiveState(FIXTURE_ID, { status: FixtureStatus.HALF_TIME });
      const updateCall = mockPrisma.fixture.update.mock.calls[0]![0];
      expect(updateCall.data).toHaveProperty('halfTimeAt');
    });

    it('sets finishedAt when transitioning to FINISHED', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fixture.update.mockResolvedValueOnce({ id: FIXTURE_ID, status: FixtureStatus.FINISHED });
      await service.updateFixtureLiveState(FIXTURE_ID, { status: FixtureStatus.FINISHED });
      const updateCall = mockPrisma.fixture.update.mock.calls[0]![0];
      expect(updateCall.data).toHaveProperty('finishedAt');
    });

    it('throws for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.updateFixtureLiveState('bad', {})).rejects.toThrow(NotFoundException);
    });
  });

  // ── addMatchEvent ─────────────────────────────────────────────────────────

  describe('addMatchEvent', () => {
    it('creates a match event', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.team.findUnique.mockResolvedValueOnce({ id: TEAM_ID });
      mockPrisma.player.findUnique.mockResolvedValueOnce({ id: PLAYER_ID });
      mockPrisma.matchEvent.create.mockResolvedValueOnce(baseEvent);
      const result = await service.addMatchEvent(FIXTURE_ID, {
        eventType: MatchEventType.GOAL,
        minute: 10,
        teamId: TEAM_ID,
        playerId: PLAYER_ID,
      });
      expect(result.id).toBe(EVENT_ID);
    });

    it('is idempotent when providerEventId already exists', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.matchEvent.findFirst.mockResolvedValueOnce(baseEvent);
      const result = await service.addMatchEvent(FIXTURE_ID, {
        eventType: MatchEventType.GOAL,
        minute: 10,
        providerEventId: 'ext-123',
      });
      expect(result.id).toBe(EVENT_ID);
      expect(mockPrisma.matchEvent.create).not.toHaveBeenCalled();
    });

    it('updates score when updateScore=true and event is a goal', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.team.findUnique.mockResolvedValueOnce({ id: TEAM_ID });
      mockPrisma.matchEvent.findFirst.mockResolvedValueOnce(null);
      mockPrisma.matchEvent.create.mockResolvedValueOnce(baseEvent);
      // For the score update call
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({
        homeTeamId: 'home-team', awayTeamId: 'away-team', homeScore: 0, awayScore: 0,
      });
      mockPrisma.fixture.update.mockResolvedValueOnce({});
      await service.addMatchEvent(FIXTURE_ID, {
        eventType: MatchEventType.GOAL,
        minute: 10,
        teamId: TEAM_ID,
        updateScore: true,
      });
      expect(mockPrisma.fixture.update).toHaveBeenCalled();
    });

    it('finalises fixture on FULL_TIME event', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.matchEvent.findFirst.mockResolvedValueOnce(null);
      mockPrisma.matchEvent.create.mockResolvedValueOnce({ ...baseEvent, eventType: MatchEventType.FULL_TIME });
      mockPrisma.fixture.update.mockResolvedValueOnce({});
      await service.addMatchEvent(FIXTURE_ID, { eventType: MatchEventType.FULL_TIME, minute: 90 });
      const updateCall = mockPrisma.fixture.update.mock.calls[0]![0];
      expect(updateCall.data.status).toBe(FixtureStatus.FINISHED);
    });

    it('throws BadRequest when teamId does not exist', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.team.findUnique.mockResolvedValueOnce(null);
      await expect(service.addMatchEvent(FIXTURE_ID, {
        eventType: MatchEventType.GOAL,
        minute: 5,
        teamId: 'bad-team',
      })).rejects.toThrow(BadRequestException);
    });

    it('throws for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.addMatchEvent('bad', {
        eventType: MatchEventType.GOAL,
        minute: 1,
      })).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateMatchEvent ──────────────────────────────────────────────────────

  describe('updateMatchEvent', () => {
    it('updates event fields', async () => {
      mockPrisma.matchEvent.findUnique.mockResolvedValueOnce(baseEvent);
      mockPrisma.matchEvent.update.mockResolvedValueOnce({ ...baseEvent, minute: 25 });
      const result = await service.updateMatchEvent(EVENT_ID, { minute: 25 });
      expect(result.minute).toBe(25);
    });

    it('throws for unknown event', async () => {
      mockPrisma.matchEvent.findUnique.mockResolvedValueOnce(null);
      await expect(service.updateMatchEvent('bad', {})).rejects.toThrow(NotFoundException);
    });
  });

  // ── deleteMatchEvent ──────────────────────────────────────────────────────

  describe('deleteMatchEvent', () => {
    it('deletes event and returns confirmation', async () => {
      mockPrisma.matchEvent.findUnique.mockResolvedValueOnce(baseEvent);
      mockPrisma.matchEvent.delete.mockResolvedValueOnce(baseEvent);
      const result = await service.deleteMatchEvent(EVENT_ID);
      expect(result.deleted).toBe(true);
      expect(result.id).toBe(EVENT_ID);
    });

    it('throws for unknown event', async () => {
      mockPrisma.matchEvent.findUnique.mockResolvedValueOnce(null);
      await expect(service.deleteMatchEvent('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── upsertPlayerStat ──────────────────────────────────────────────────────

  describe('upsertPlayerStat', () => {
    it('creates or updates stat record', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.player.findUnique.mockResolvedValueOnce({ id: PLAYER_ID });
      mockPrisma.fantasyPlayerMatchStat.upsert.mockResolvedValueOnce({
        playerId: PLAYER_ID, fixtureId: FIXTURE_ID, goals: 2,
      });
      const result = await service.upsertPlayerStat(FIXTURE_ID, { playerId: PLAYER_ID, goals: 2 });
      expect(result.goals).toBe(2);
    });

    it('throws BadRequest for unknown player', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.player.findUnique.mockResolvedValueOnce(null);
      await expect(service.upsertPlayerStat(FIXTURE_ID, { playerId: 'bad' })).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.upsertPlayerStat('bad', { playerId: PLAYER_ID })).rejects.toThrow(NotFoundException);
    });
  });

  // ── bulkUpsertPlayerStats ─────────────────────────────────────────────────

  describe('bulkUpsertPlayerStats', () => {
    it('returns succeeded count and empty errors for valid input', async () => {
      // Two stats, both valid
      mockPrisma.fixture.findUnique.mockResolvedValue({ id: FIXTURE_ID });
      mockPrisma.player.findUnique.mockResolvedValue({ id: PLAYER_ID });
      mockPrisma.fantasyPlayerMatchStat.upsert.mockResolvedValue({ playerId: PLAYER_ID });
      const result = await service.bulkUpsertPlayerStats(FIXTURE_ID, {
        stats: [{ playerId: PLAYER_ID }, { playerId: PLAYER_ID }],
      });
      expect(result.succeeded).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('reports errors for failed upserts without throwing', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.player.findUnique.mockResolvedValueOnce(null);
      const result = await service.bulkUpsertPlayerStats(FIXTURE_ID, {
        stats: [{ playerId: 'bad-player' }],
      });
      expect(result.succeeded).toBe(0);
      expect(result.errors).toHaveLength(1);
    });
  });

  // ── recalculateFixtureStateFromEvents ─────────────────────────────────────

  describe('recalculateFixtureStateFromEvents', () => {
    it('recalculates score from goal events', async () => {
      mockPrisma.fixture.findUnique
        .mockResolvedValueOnce({ id: FIXTURE_ID }) // requireFixture
        .mockResolvedValueOnce({ homeTeamId: 'home-team', awayTeamId: 'away-team' }); // score calc
      mockPrisma.matchEvent.findMany.mockResolvedValueOnce([
        { id: 'e1', eventType: MatchEventType.GOAL, teamId: 'home-team', minute: 20, createdAt: new Date() },
        { id: 'e2', eventType: MatchEventType.KICKOFF, teamId: null, minute: 0, createdAt: new Date() },
      ]);
      mockPrisma.fixture.update.mockResolvedValueOnce({
        id: FIXTURE_ID, homeScore: 1, awayScore: 0, status: FixtureStatus.LIVE, currentMinute: 20,
      });
      const result = await service.recalculateFixtureStateFromEvents(FIXTURE_ID);
      expect(result.homeScore).toBe(1);
      expect(result.awayScore).toBe(0);
      expect(result.status).toBe(FixtureStatus.LIVE);
    });

    it('counts OWN_GOAL for opposing team', async () => {
      mockPrisma.fixture.findUnique
        .mockResolvedValueOnce({ id: FIXTURE_ID })
        .mockResolvedValueOnce({ homeTeamId: 'home-team', awayTeamId: 'away-team' });
      mockPrisma.matchEvent.findMany.mockResolvedValueOnce([
        { id: 'e1', eventType: MatchEventType.OWN_GOAL, teamId: 'home-team', minute: 30, createdAt: new Date() },
        { id: 'e2', eventType: MatchEventType.KICKOFF, teamId: null, minute: 0, createdAt: new Date() },
      ]);
      const updateData = { id: FIXTURE_ID, homeScore: 0, awayScore: 1, status: FixtureStatus.LIVE, currentMinute: 30 };
      mockPrisma.fixture.update.mockResolvedValueOnce(updateData);
      const result = await service.recalculateFixtureStateFromEvents(FIXTURE_ID);
      const updateCall = mockPrisma.fixture.update.mock.calls[0]![0];
      expect(updateCall.data.homeScore).toBe(0);
      expect(updateCall.data.awayScore).toBe(1);
    });

    it('sets status FINISHED when FULL_TIME event present', async () => {
      mockPrisma.fixture.findUnique
        .mockResolvedValueOnce({ id: FIXTURE_ID })
        .mockResolvedValueOnce({ homeTeamId: 'home-team', awayTeamId: 'away-team' });
      mockPrisma.matchEvent.findMany.mockResolvedValueOnce([
        { id: 'e1', eventType: MatchEventType.KICKOFF, teamId: null, minute: 0, createdAt: new Date() },
        { id: 'e2', eventType: MatchEventType.FULL_TIME, teamId: null, minute: 90, createdAt: new Date() },
      ]);
      mockPrisma.fixture.update.mockResolvedValueOnce({ id: FIXTURE_ID, status: FixtureStatus.FINISHED });
      await service.recalculateFixtureStateFromEvents(FIXTURE_ID);
      const updateCall = mockPrisma.fixture.update.mock.calls[0]![0];
      expect(updateCall.data.status).toBe(FixtureStatus.FINISHED);
    });

    it('throws for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.recalculateFixtureStateFromEvents('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── finaliseFixture ───────────────────────────────────────────────────────

  describe('finaliseFixture', () => {
    it('marks fixture as FINISHED', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fixture.update.mockResolvedValueOnce({ id: FIXTURE_ID, status: FixtureStatus.FINISHED });
      const result = await service.finaliseFixture(FIXTURE_ID);
      expect(result.status).toBe(FixtureStatus.FINISHED);
      const updateCall = mockPrisma.fixture.update.mock.calls[0]![0];
      expect(updateCall.data.status).toBe(FixtureStatus.FINISHED);
      expect(updateCall.data).toHaveProperty('finishedAt');
    });

    it('throws for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.finaliseFixture('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── reopenFixture ─────────────────────────────────────────────────────────

  describe('reopenFixture', () => {
    it('sets status back to LIVE for FINISHED fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID, status: FixtureStatus.FINISHED });
      mockPrisma.fixture.update.mockResolvedValueOnce({ id: FIXTURE_ID, status: FixtureStatus.LIVE });
      const result = await service.reopenFixture(FIXTURE_ID);
      expect(result.status).toBe(FixtureStatus.LIVE);
      const updateCall = mockPrisma.fixture.update.mock.calls[0]![0];
      expect(updateCall.data.finishedAt).toBeNull();
    });

    it('throws BadRequest if fixture is not FINISHED', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID, status: FixtureStatus.LIVE });
      await expect(service.reopenFixture(FIXTURE_ID)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.reopenFixture('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── syncFixtureFromProvider ───────────────────────────────────────────────

  describe('syncFixtureFromProvider', () => {
    it('returns synced=false when no providerFixtureId configured', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({
        id: FIXTURE_ID, providerSource: null, providerFixtureId: null,
      });
      const result = await service.syncFixtureFromProvider(FIXTURE_ID);
      expect(result.synced).toBe(false);
      expect(result.reason).toMatch(/providerFixtureId/);
    });

    it('returns synced=false when provider returns no data (manual adapter)', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({
        id: FIXTURE_ID, providerSource: 'manual', providerFixtureId: 'ext-abc',
      });
      const result = await service.syncFixtureFromProvider(FIXTURE_ID);
      // ManualLiveMatchProviderAdapter always returns null
      expect(result.synced).toBe(false);
    });

    it('throws NotFoundException for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.syncFixtureFromProvider('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── syncProviderPlayerStats ───────────────────────────────────────────────

  describe('syncProviderPlayerStats', () => {
    const providerStats = [
      {
        playerProviderRef: 'sm-player-1',
        teamProviderRef: 'sm-team-home',
        minutesPlayed: 90,
        goals: 1,
        assists: 0,
        ownGoals: 0,
        yellowCards: 1,
        redCards: 0,
        saves: 0,
        goalsConceded: 0,
        cleanSheet: true,
        started: true,
        cameOnMinute: null,
        subbedOffMinute: null,
      },
    ];

    it('dry-runs by default and does not write FantasyPlayerMatchStat rows', async () => {
      const provider = makeProvider({
        fetchFixturePlayerStats: vi.fn().mockResolvedValue(providerStats),
      });
      service = makeService(provider);
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({
        id: FIXTURE_ID,
        providerFixtureId: PROVIDER_FIXTURE_ID,
        homeTeamId: 'home-team',
        awayTeamId: 'away-team',
      });
      mockPrisma.player.findMany.mockResolvedValueOnce([{ id: PLAYER_ID, externalId: 'sm-player-1' }]);
      mockPrisma.team.findMany.mockResolvedValueOnce([{ id: 'home-team', externalId: 'sm-team-home' }]);

      const result = await service.syncProviderPlayerStats(FIXTURE_ID);

      expect(result.dryRun).toBe(true);
      expect(result.fetched).toBe(1);
      expect(result.mapped).toBe(1);
      expect(result.wouldWrite).toBe(1);
      expect(result.written).toBe(0);
      expect(mockPrisma.fantasyPlayerMatchStat.upsert).not.toHaveBeenCalled();
      expect(mockPrisma.adminAuditLog.create).not.toHaveBeenCalled();
    });

    it('requires explicit confirmation for writes', async () => {
      await expect(
        service.syncProviderPlayerStats(FIXTURE_ID, { dryRun: false, confirm: 'WRONG' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.fixture.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.fantasyPlayerMatchStat.upsert).not.toHaveBeenCalled();
    });

    it('confirmed mode upserts mapped provider stats and writes audit log', async () => {
      const provider = makeProvider({
        fetchFixturePlayerStats: vi.fn().mockResolvedValue(providerStats),
      });
      service = makeService(provider);
      mockPrisma.fixture.findUnique
        .mockResolvedValueOnce({
          id: FIXTURE_ID,
          providerFixtureId: PROVIDER_FIXTURE_ID,
          homeTeamId: 'home-team',
          awayTeamId: 'away-team',
        })
        .mockResolvedValue({ id: FIXTURE_ID });
      mockPrisma.player.findMany.mockResolvedValueOnce([{ id: PLAYER_ID, externalId: 'sm-player-1' }]);
      mockPrisma.team.findMany.mockResolvedValueOnce([{ id: 'home-team', externalId: 'sm-team-home' }]);
      mockPrisma.player.findUnique.mockResolvedValue({ id: PLAYER_ID });
      mockPrisma.fantasyPlayerMatchStat.upsert.mockResolvedValue({ playerId: PLAYER_ID, fixtureId: FIXTURE_ID });
      mockPrisma.fixture.update.mockResolvedValue({});
      mockPrisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.syncProviderPlayerStats(
        FIXTURE_ID,
        { dryRun: false, confirm: 'SYNC_PROVIDER_PLAYER_STATS' },
        'admin-1',
      );

      expect(result.synced).toBe(true);
      expect(result.written).toBe(1);
      expect(mockPrisma.fantasyPlayerMatchStat.upsert).toHaveBeenCalledOnce();
      const upsertCall = mockPrisma.fantasyPlayerMatchStat.upsert.mock.calls[0]![0];
      expect(upsertCall.where).toEqual({ playerId_fixtureId: { playerId: PLAYER_ID, fixtureId: FIXTURE_ID } });
      expect(upsertCall.create).toMatchObject({
        playerId: PLAYER_ID,
        teamId: 'home-team',
        fixtureId: FIXTURE_ID,
        goals: 1,
        yellowCards: 1,
        cleanSheet: true,
        source: 'sportmonks',
        providerStatId: 'sportmonks:sm-fixture-1:sm-player-1',
      });
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actorUserId: 'admin-1',
            action: 'PROVIDER_PLAYER_STATS_SYNCED',
            entityType: 'Fixture',
            entityId: FIXTURE_ID,
          }),
        }),
      );
    });

    it('reports unmapped provider rows and writes only mapped rows', async () => {
      const provider = makeProvider({
        fetchFixturePlayerStats: vi.fn().mockResolvedValue([
          ...providerStats,
          { ...providerStats[0]!, playerProviderRef: 'missing-player' },
        ]),
      });
      service = makeService(provider);
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({
        id: FIXTURE_ID,
        providerFixtureId: PROVIDER_FIXTURE_ID,
        homeTeamId: 'home-team',
        awayTeamId: 'away-team',
      });
      mockPrisma.player.findMany.mockResolvedValueOnce([{ id: PLAYER_ID, externalId: 'sm-player-1' }]);
      mockPrisma.team.findMany.mockResolvedValueOnce([{ id: 'home-team', externalId: 'sm-team-home' }]);

      const result = await service.syncProviderPlayerStats(FIXTURE_ID, { dryRun: true });

      expect(result.fetched).toBe(2);
      expect(result.mapped).toBe(1);
      expect(result.unmapped).toHaveLength(1);
      expect(result.unmapped[0]!.reason).toMatch(/No local player/);
      expect(mockPrisma.fantasyPlayerMatchStat.upsert).not.toHaveBeenCalled();
    });

    it('returns synced=false when fixture has no providerFixtureId', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({
        id: FIXTURE_ID,
        providerFixtureId: null,
        homeTeamId: 'home-team',
        awayTeamId: 'away-team',
      });
      const result = await service.syncProviderPlayerStats(FIXTURE_ID);
      expect(result.synced).toBe(false);
      expect(result.reason).toMatch(/providerFixtureId/);
    });

    it('returns synced=false when provider returns no player stats', async () => {
      const provider = makeProvider({
        fetchFixturePlayerStats: vi.fn().mockResolvedValue([]),
      });
      service = makeService(provider);
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({
        id: FIXTURE_ID,
        providerFixtureId: PROVIDER_FIXTURE_ID,
        homeTeamId: 'home-team',
        awayTeamId: 'away-team',
      });
      const result = await service.syncProviderPlayerStats(FIXTURE_ID);
      expect(result.synced).toBe(false);
      expect(result.reason).toMatch(/Provider returned no player stats/);
    });

    it('throws NotFoundException for unknown fixture', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce(null);
      await expect(service.syncProviderPlayerStats('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── Live fantasy preview scoring ──────────────────────────────────────────

  describe('live fantasy point calculation', () => {
    const baseStatForPreview = (overrides: Record<string, unknown> = {}) => ({
      playerId: PLAYER_ID,
      minutesPlayed: 90,
      goals: 0,
      assists: 0,
      ownGoals: 0,
      yellowCards: 0,
      redCards: 0,
      penaltiesMissed: 0,
      penaltiesSaved: 0,
      saves: 0,
      cleanSheet: false,
      didNotPlay: false,
      player: { name: 'P', position: PlayerPosition.MIDFIELDER },
      team: null,
      ...overrides,
    });

    it('GK gets 10pts per goal', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fantasyPlayerMatchStat.findMany.mockResolvedValueOnce([
        baseStatForPreview({ goals: 1, player: { name: 'GK', position: PlayerPosition.GOALKEEPER } }),
      ]);
      const result = await service.getLiveFantasyPreview(FIXTURE_ID);
      // appearance 2 + goal 10 = 12
      expect(result.players[0]!.estimatedPoints).toBe(12);
    });

    it('DEF gets 6pts per goal', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fantasyPlayerMatchStat.findMany.mockResolvedValueOnce([
        baseStatForPreview({ goals: 1, player: { name: 'D', position: PlayerPosition.DEFENDER } }),
      ]);
      const result = await service.getLiveFantasyPreview(FIXTURE_ID);
      // appearance 2 + goal 6 = 8
      expect(result.players[0]!.estimatedPoints).toBe(8);
    });

    it('MID gets 5pts per goal', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fantasyPlayerMatchStat.findMany.mockResolvedValueOnce([
        baseStatForPreview({ goals: 1 }),
      ]);
      const result = await service.getLiveFantasyPreview(FIXTURE_ID);
      // appearance 2 + goal 5 = 7
      expect(result.players[0]!.estimatedPoints).toBe(7);
    });

    it('FWD gets 4pts per goal', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fantasyPlayerMatchStat.findMany.mockResolvedValueOnce([
        baseStatForPreview({ goals: 1, player: { name: 'F', position: PlayerPosition.FORWARD } }),
      ]);
      const result = await service.getLiveFantasyPreview(FIXTURE_ID);
      // appearance 2 + goal 4 = 6
      expect(result.players[0]!.estimatedPoints).toBe(6);
    });

    it('yellow card deducts 1pt', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fantasyPlayerMatchStat.findMany.mockResolvedValueOnce([
        baseStatForPreview({ yellowCards: 1 }),
      ]);
      const result = await service.getLiveFantasyPreview(FIXTURE_ID);
      // appearance 2 - 1 = 1
      expect(result.players[0]!.estimatedPoints).toBe(1);
    });

    it('red card deducts 3pts', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fantasyPlayerMatchStat.findMany.mockResolvedValueOnce([
        baseStatForPreview({ redCards: 1 }),
      ]);
      const result = await service.getLiveFantasyPreview(FIXTURE_ID);
      // appearance 2 - 3 = -1
      expect(result.players[0]!.estimatedPoints).toBe(-1);
    });

    it('GK clean sheet with 60+ mins = 4pts', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fantasyPlayerMatchStat.findMany.mockResolvedValueOnce([
        baseStatForPreview({ cleanSheet: true, player: { name: 'GK', position: PlayerPosition.GOALKEEPER } }),
      ]);
      const result = await service.getLiveFantasyPreview(FIXTURE_ID);
      // appearance 2 + clean sheet 4 = 6
      expect(result.players[0]!.estimatedPoints).toBe(6);
    });

    it('clean sheet with <60 mins = 0 bonus', async () => {
      mockPrisma.fixture.findUnique.mockResolvedValueOnce({ id: FIXTURE_ID });
      mockPrisma.fantasyPlayerMatchStat.findMany.mockResolvedValueOnce([
        baseStatForPreview({ cleanSheet: true, minutesPlayed: 45, player: { name: 'GK', position: PlayerPosition.GOALKEEPER } }),
      ]);
      const result = await service.getLiveFantasyPreview(FIXTURE_ID);
      // appearance 1 (< 60 mins) + clean sheet 0 = 1
      expect(result.players[0]!.estimatedPoints).toBe(1);
    });
  });
});

// ── RBAC — FootballController admin live routes ───────────────────────────

describe('RBAC — admin live routes require PSL_ADMIN', () => {
  const ROLES_KEY = 'roles';

  const adminMethods = [
    'adminUpdateLiveState',
    'adminAddMatchEvent',
    'adminUpdateMatchEvent',
    'adminDeleteMatchEvent',
    'adminUpsertPlayerStat',
    'adminBulkUpsertPlayerStats',
    'adminSyncProviderPlayerStats',
    'adminRecalculateState',
    'adminFinaliseFixture',
    'adminReopenFixture',
    'adminSyncProvider',
    // pre-existing admin methods
    'adminUpdateStatus',
    'adminUpdateScore',
    'adminCreateEvent',
    'adminAddLineup',
  ];

  it('all admin live methods carry @Roles(PSL_ADMIN) metadata', () => {
    for (const method of adminMethods) {
      const handler = (FootballController.prototype as unknown as Record<string, unknown>)[method] as object | undefined;
      expect(handler, `${method} should exist on controller`).toBeDefined();
      const roles = Reflect.getMetadata(ROLES_KEY, handler!) as string[] | undefined;
      expect(roles, `${method} should carry @Roles metadata`).toBeDefined();
      expect(roles, `${method} should require PSL_ADMIN`).toContain('PSL_ADMIN');
    }
  });

  const fanMethods = [
    'getLiveMatchDashboard',
    'getFixtureLiveState',
    'getFixtureTimeline',
    'getFixturePlayerStats',
    'getLiveFantasyPreview',
    'getFixtureLive',
    'getFixtureEvents',
    'getFixtureLineups',
    'getMatchCentre',
  ];

  it('fan-accessible live routes do NOT carry PSL_ADMIN metadata', () => {
    for (const method of fanMethods) {
      const handler = (FootballController.prototype as unknown as Record<string, unknown>)[method] as object | undefined;
      if (!handler) continue;
      const roles = Reflect.getMetadata(ROLES_KEY, handler) as string[] | undefined;
      if (roles) {
        expect(roles, `${method} should NOT require PSL_ADMIN`).not.toContain('PSL_ADMIN');
      }
    }
  });
});

// ── LiveMatchService.resolveProvider ─────────────────────────────────────────

describe('LiveMatchService.resolveProvider', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns ManualLiveMatchProviderAdapter when WC_LIVE_PROVIDER not set', async () => {
    vi.stubEnv('WC_LIVE_PROVIDER', '');
    vi.stubEnv('SPORTMONKS_API_KEY', '');
    vi.resetModules();
    const { LiveMatchService } = await import('./live-match.service');
    const provider = LiveMatchService.resolveProvider();
    expect(provider.providerName).toBe('manual');
  });

  it('returns ManualLiveMatchProviderAdapter when WC_LIVE_PROVIDER=sportmonks but key absent', async () => {
    vi.stubEnv('WC_LIVE_PROVIDER', 'sportmonks');
    vi.stubEnv('SPORTMONKS_API_KEY', '');
    vi.resetModules();
    const { LiveMatchService } = await import('./live-match.service');
    const provider = LiveMatchService.resolveProvider();
    expect(provider.providerName).toBe('manual');
  });

  it('returns SportmonksLiveMatchAdapter when WC_LIVE_PROVIDER=sportmonks and key present', async () => {
    vi.stubEnv('WC_LIVE_PROVIDER', 'sportmonks');
    vi.stubEnv('SPORTMONKS_API_KEY', 'test-key-sm');
    vi.resetModules();
    const { LiveMatchService } = await import('./live-match.service');
    const provider = LiveMatchService.resolveProvider();
    expect(provider.providerName).toBe('sportmonks');
  });

  it('returns ManualLiveMatchProviderAdapter for unknown WC_LIVE_PROVIDER values', async () => {
    vi.stubEnv('WC_LIVE_PROVIDER', 'opta');
    vi.stubEnv('SPORTMONKS_API_KEY', 'some-key');
    vi.resetModules();
    const { LiveMatchService } = await import('./live-match.service');
    const provider = LiveMatchService.resolveProvider();
    expect(provider.providerName).toBe('manual');
  });
});
