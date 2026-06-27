import { describe, it, expect } from 'vitest';
import {
  buildLiveWorldCupStories,
  liveStoryToMediaItem,
} from './live-world-cup-feed';
import type { Fixture, MatchCentre, StandingGroup } from './football-api';
import type { TopPerformer } from './players-api';

function makeFixture(overrides: Partial<Fixture> = {}): Fixture {
  return {
    id: 'fixture-1',
    status: 'FINISHED',
    kickoffAt: '2026-06-20T18:00:00Z',
    homeScore: 2,
    awayScore: 1,
    currentMinute: null,
    period: 'FULL_TIME',
    lastUpdatedAt: '2026-06-20T20:00:00Z',
    homeTeam: { id: 'home', name: 'Home FC', slug: 'home-fc', shortName: 'HFC' },
    awayTeam: { id: 'away', name: 'Away FC', slug: 'away-fc', shortName: 'AFC' },
    venue: {
      id: 'venue-1',
      name: 'Test Stadium',
      city: 'Johannesburg',
      country: 'South Africa',
      capacity: 60000,
    },
    group: { id: 'group-1', name: 'Group A' },
    season: {
      id: 'season-1',
      name: 'FIFA World Cup 2026',
      slug: 'fifa-world-cup-2026',
      startDate: '2026-06-01',
      endDate: '2026-07-01',
      isActive: true,
      competition: {
        id: 'comp-1',
        name: 'FIFA World Cup 2026',
        slug: 'fifa-world-cup-2026',
        logoUrl: null,
      },
    },
    ...overrides,
  } as Fixture;
}

function makeMatchCentre(): MatchCentre {
  return {
    fixture: {
      id: 'fixture-1',
      kickoffAt: '2026-06-20T18:00:00Z',
      status: 'LIVE',
      homeScore: 2,
      awayScore: 1,
      currentMinute: 67,
      period: 'SECOND_HALF',
      startedAt: '2026-06-20T18:00:00Z',
      finishedAt: null,
      venue: {
        id: 'venue-1',
        name: 'Test Stadium',
        city: 'Johannesburg',
        country: 'South Africa',
        capacity: 60000,
      },
      gameweek: null,
      season: {
        id: 'season-1',
        name: 'FIFA World Cup 2026',
        competition: { id: 'comp-1', name: 'FIFA World Cup 2026' },
      },
    },
    homeTeam: { id: 'home', name: 'Home FC', slug: 'home-fc', shortName: 'HFC', logoUrl: null },
    awayTeam: { id: 'away', name: 'Away FC', slug: 'away-fc', shortName: 'AFC', logoUrl: null },
    events: [],
    lineups: { home: [], away: [] },
    playerStats: [],
    playerRatings: [
      {
        id: 'rating-1',
        playerId: 'player-1',
        performanceRating: 8.9,
        player: { id: 'player-1', name: 'Test Player', position: 'FORWARD', number: 9 },
      },
    ],
    dataProvenance: {
      sourceType: 'SPORTMONKS',
      dataStatus: 'LIVE',
      freshnessStatus: 'FRESH',
      lastUpdatedAt: '2026-06-20T20:05:00Z',
      providerKey: null,
      officialFeed: 'match-centre',
    },
  };
}

function makeStandings(): StandingGroup[] {
  return [
    {
      groupName: 'Group A',
      standings: [
        {
          id: 'standing-1',
          played: 3,
          won: 2,
          drawn: 1,
          lost: 0,
          goalsFor: 5,
          goalsAgainst: 1,
          points: 7,
          team: { id: 'home', name: 'Home FC', slug: 'home-fc', shortName: 'HFC' },
          group: { id: 'group-1', name: 'Group A' },
        },
      ],
    },
  ];
}

function makeTopPerformers(): TopPerformer[] {
  return [
    {
      playerId: 'player-2',
      playerName: 'Top Performer',
      teamName: 'Home FC',
      position: 'Forward',
      goals: 3,
      assists: 1,
      minutesPlayed: 270,
      fantasyPoints: 21,
      cleanSheets: 0,
    },
  ];
}

describe('buildLiveWorldCupStories', () => {
  it('builds a featured live story first', () => {
    const stories = buildLiveWorldCupStories({
      fixtures: [makeFixture({ status: 'LIVE', homeScore: 1, awayScore: 1, currentMinute: 67, period: 'SECOND_HALF' })],
      standings: makeStandings(),
      topPerformers: makeTopPerformers(),
      matchCentre: makeMatchCentre(),
      now: new Date('2026-06-20T20:10:00Z'),
    });

    expect(stories[0]?.featured).toBe(true);
    expect(stories[0]?.title).toContain('live update');
    expect(stories[0]?.summary).toContain('ratings board');
    expect(stories.some((story) => story.category === 'Standings')).toBe(true);
    expect(stories.some((story) => story.category === 'Player Spotlight')).toBe(true);
    expect(stories.every((story) => /^\d{4}-\d{2}-\d{2}T/.test(story.publishedAt))).toBe(true);
  });

  it('falls back to a finished match report when no live fixture exists', () => {
    const stories = buildLiveWorldCupStories({
      fixtures: [makeFixture()],
      standings: makeStandings(),
      topPerformers: makeTopPerformers(),
      matchCentre: null,
      now: new Date('2026-06-20T20:10:00Z'),
    });

    expect(stories[0]?.title).toContain('match report');
    expect(stories[0]?.category).toBe('Match Report');
  });

  it('maps stories to media items for the media detail route', () => {
    const story = buildLiveWorldCupStories({
      fixtures: [makeFixture()],
      standings: makeStandings(),
      topPerformers: makeTopPerformers(),
      matchCentre: null,
      now: new Date('2026-06-20T20:10:00Z'),
    })[0];

    expect(story).toBeTruthy();
    const mediaItem = liveStoryToMediaItem(story!);
    expect(mediaItem.slug).toBe(story!.id);
    expect(mediaItem.type).toBe('ARTICLE');
    expect(mediaItem.tags[0]).toBe(story!.category);
  });
});
