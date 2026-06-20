/**
 * Football data API client for PSL One Experience app.
 *
 * Covers: fixtures, live state, timeline, lineups, teams, standings, and
 * the active-season context object.
 *
 * All calls are unauthenticated (public endpoints). Live state polling
 * should use a short cache/refresh cycle managed by the caller.
 */

import { publicFetch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Competition = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  format?: string;
  teamCount?: number | null;
  hasGroups?: boolean;
  hasKnockouts?: boolean;
  hasHomeAway?: boolean;
  usesNeutralVenues?: boolean;
};

export type Season = {
  id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status?: string;
  competition: Competition;
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number | null;
};

export type Team = {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  logoUrl: string | null;
  country: string;
};

export type Player = {
  id: string;
  teamId: string;
  name: string;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
  nationality: string;
  dateOfBirth: string | null;
  number: number | null;
  team?: Pick<Team, 'id' | 'name' | 'slug'>;
};

export type FixtureStatus =
  | 'SCHEDULED'
  | 'LIVE'
  | 'HALF_TIME'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED';

export type MatchEventType =
  | 'GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUBSTITUTION'
  | 'KICKOFF'
  | 'HALF_TIME'
  | 'FULL_TIME'
  | 'VAR'
  | 'OTHER'
  | 'SECOND_YELLOW'
  | 'PENALTY_SCORED'
  | 'SECOND_HALF'
  | 'INJURY'
  | 'OWN_GOAL'
  | 'PENALTY_MISS'
  | 'PENALTY_SAVE';

export type LineupStatus =
  | 'STARTING'
  | 'SUBSTITUTE'
  | 'UNAVAILABLE'
  | 'INJURED'
  | 'SUSPENDED'
  | 'NOT_IN_SQUAD';

export type Fixture = {
  id: string;
  status: FixtureStatus;
  kickoffAt: string;
  homeScore: number | null;
  awayScore: number | null;
  currentMinute: number | null;
  period: string | null;
  lastUpdatedAt: string | null;
  homeTeam: Pick<Team, 'id' | 'name' | 'slug' | 'shortName'>;
  awayTeam: Pick<Team, 'id' | 'name' | 'slug' | 'shortName'>;
  venue: Venue | null;
  group: { id: string; name: string } | null;
  season: Season;
};

export type MatchEvent = {
  id: string;
  fixtureId: string;
  teamId: string | null;
  playerId: string | null;
  relatedPlayerId: string | null;
  minute: number;
  stoppageMinute: number | null;
  period: string | null;
  eventType: MatchEventType;
  description: string | null;
  providerEventId: string | null;
  createdAt: string;
  team: Pick<Team, 'id' | 'name' | 'slug' | 'shortName'> | null;
  player: Pick<Player, 'id' | 'name' | 'position' | 'number'> | null;
  relatedPlayer: Pick<Player, 'id' | 'name' | 'position' | 'number'> | null;
};

export type FixtureLineup = {
  id: string;
  fixtureId: string;
  teamId: string;
  playerId: string;
  status: LineupStatus;
  shirtNumber: number | null;
  position: string | null;
  team: Pick<Team, 'id' | 'name' | 'slug' | 'shortName'>;
  player: Pick<Player, 'id' | 'name' | 'position' | 'number'>;
};

export type Standing = {
  id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  team: Pick<Team, 'id' | 'name' | 'slug' | 'shortName'>;
  group: { id: string; name: string };
};

export type StandingGroup = {
  groupName: string;
  standings: Standing[];
};

export type LiveFantasyPlayerPreview = {
  playerId: string;
  playerName: string | null;
  teamName: string | null;
  position: string | null;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  cleanSheet: boolean;
  estimatedPoints: number;
  provisional: true;
};

export type LiveFixtureFantasyPreview = {
  provisional: true;
  fixtureId: string;
  players: LiveFantasyPlayerPreview[];
};

// ── Context ───────────────────────────────────────────────────────────────────

/**
 * Returns the active season and competition context. Use this to seed
 * seasonId/competitionId for other calls.
 */
export function getContext(): Promise<Season> {
  return publicFetch<Season>('/football/seasons/active');
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

export function getFixtures(params?: {
  seasonSlug?: string;
  status?: string;
  gameweekId?: string;
  group?: string;
  teamSlug?: string;
}): Promise<Fixture[]> {
  const qs = new URLSearchParams();
  if (params?.seasonSlug) qs.set('seasonSlug', params.seasonSlug);
  if (params?.status) qs.set('status', params.status);
  if (params?.gameweekId) qs.set('gameweekId', params.gameweekId);
  if (params?.group) qs.set('group', params.group);
  if (params?.teamSlug) qs.set('teamSlug', params.teamSlug);
  const q = qs.toString();
  return publicFetch<Fixture[]>(`/football/fixtures${q ? `?${q}` : ''}`);
}

export function getFixture(id: string): Promise<Fixture> {
  return publicFetch<Fixture>(`/football/fixtures/${encodeURIComponent(id)}`);
}

export function getFixtureLive(
  id: string,
): Promise<Pick<Fixture, 'id' | 'status' | 'homeScore' | 'awayScore' | 'currentMinute' | 'period' | 'lastUpdatedAt' | 'kickoffAt' | 'homeTeam' | 'awayTeam'>> {
  return publicFetch(`/football/fixtures/${encodeURIComponent(id)}/live`);
}

export function getFixtureTimeline(id: string): Promise<MatchEvent[]> {
  return publicFetch<MatchEvent[]>(`/football/fixtures/${encodeURIComponent(id)}/timeline`);
}

export function getFixtureLineups(id: string): Promise<FixtureLineup[]> {
  return publicFetch<FixtureLineup[]>(`/football/fixtures/${encodeURIComponent(id)}/lineups`);
}

export function getFixtureLiveFantasyPreview(id: string): Promise<LiveFixtureFantasyPreview> {
  return publicFetch<LiveFixtureFantasyPreview>(
    `/football/fixtures/${encodeURIComponent(id)}/live-fantasy-preview`,
  );
}

// ── Teams ─────────────────────────────────────────────────────────────────────

export function getTeams(params?: { seasonSlug?: string }): Promise<Team[]> {
  const qs = params?.seasonSlug ? `?seasonSlug=${encodeURIComponent(params.seasonSlug)}` : '';
  return publicFetch<Team[]>(`/football/teams${qs}`);
}

export function getTeam(slug: string): Promise<Team> {
  return publicFetch<Team>(`/football/teams/${encodeURIComponent(slug)}`);
}

// ── Standings ─────────────────────────────────────────────────────────────────

export function getStandings(params?: { seasonSlug?: string; group?: string }): Promise<StandingGroup[]> {
  const qs = new URLSearchParams();
  if (params?.seasonSlug) qs.set('seasonSlug', params.seasonSlug);
  if (params?.group) qs.set('group', params.group);
  const q = qs.toString();
  return publicFetch<StandingGroup[]>(`/football/standings${q ? `?${q}` : ''}`);
}
