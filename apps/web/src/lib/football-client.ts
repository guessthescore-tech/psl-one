const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function footballUrl(path: string) {
  return `${BASE}/football${path}`;
}

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

export type FixtureStatus = 'SCHEDULED' | 'LIVE' | 'HALF_TIME' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export type MatchEventType =
  | 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION'
  | 'KICKOFF' | 'HALF_TIME' | 'FULL_TIME' | 'VAR' | 'OTHER'
  | 'SECOND_YELLOW' | 'PENALTY_SCORED' | 'SECOND_HALF' | 'INJURY' | 'OWN_GOAL' | 'PENALTY_MISS' | 'PENALTY_SAVE';

export type LineupStatus =
  | 'STARTING' | 'SUBSTITUTE' | 'UNAVAILABLE' | 'INJURED' | 'SUSPENDED' | 'NOT_IN_SQUAD';

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

export type PlayerMatchStat = {
  playerId: string;
  fixtureId: string;
  teamId: string | null;
  minutesPlayed: number;
  goals: number;
  assists: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  penaltiesMissed: number;
  penaltiesSaved: number;
  saves: number;
  goalsConceded: number;
  cleanSheet: boolean;
  started: boolean;
  cameOnMinute: number | null;
  subbedOffMinute: number | null;
  didNotPlay: boolean;
  player: Pick<Player, 'id' | 'name' | 'position' | 'number'> | null;
  team: Pick<Team, 'id' | 'name' | 'slug' | 'shortName'> | null;
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

export type LiveMatchDashboard = {
  fixture: Fixture & {
    startedAt: string | null;
    halfTimeAt: string | null;
    resumedAt: string | null;
    finishedAt: string | null;
  };
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue | null;
  events: MatchEvent[];
  lineups: FixtureLineup[];
  playerStats: PlayerMatchStat[];
  liveFantasyPreview: LiveFantasyPlayerPreview[];
};

export type LiveState = {
  id: string;
  status: FixtureStatus;
  homeScore: number | null;
  awayScore: number | null;
  currentMinute: number | null;
  period: string | null;
  lastUpdatedAt: string | null;
  startedAt: string | null;
  halfTimeAt: string | null;
  resumedAt: string | null;
  finishedAt: string | null;
  kickoffAt: string;
  homeTeam: Pick<Team, 'id' | 'name' | 'slug' | 'shortName'>;
  awayTeam: Pick<Team, 'id' | 'name' | 'slug' | 'shortName'>;
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

export type MatchCentre = {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue | null;
  events: MatchEvent[];
  lineups: FixtureLineup[];
};

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const footballClient = {
  listCompetitions: () => get<Competition[]>(footballUrl('/competitions')),
  getCompetition: (slug: string) => get<Competition & { seasons: Season[] }>(footballUrl(`/competitions/${slug}`)),
  listSeasons: (params?: { competitionSlug?: string }) => {
    const qs = params?.competitionSlug ? `?competitionSlug=${params.competitionSlug}` : '';
    return get<Season[]>(footballUrl(`/seasons${qs}`));
  },
  getActiveSeason: () => get<Season>(footballUrl('/seasons/active')),
  listTeams: (params?: { seasonSlug?: string }) => {
    const qs = params?.seasonSlug ? `?seasonSlug=${params.seasonSlug}` : '';
    return get<Team[]>(footballUrl(`/teams${qs}`));
  },
  getTeam: (slug: string) => get<Team>(footballUrl(`/teams/${slug}`)),
  getTeamPlayers: (slug: string) => get<Player[]>(footballUrl(`/teams/${slug}/players`)),
  listPlayers: (params?: { teamSlug?: string; seasonSlug?: string }) => {
    const qs = new URLSearchParams();
    if (params?.teamSlug) qs.set('teamSlug', params.teamSlug);
    if (params?.seasonSlug) qs.set('seasonSlug', params.seasonSlug);
    const q = qs.toString();
    return get<Player[]>(footballUrl(`/players${q ? `?${q}` : ''}`));
  },
  getPlayer: (id: string) => get<Player>(footballUrl(`/players/${id}`)),
  listFixtures: (params?: { seasonSlug?: string; status?: string; group?: string; teamSlug?: string }) => {
    const qs = new URLSearchParams();
    if (params?.seasonSlug) qs.set('seasonSlug', params.seasonSlug);
    if (params?.status) qs.set('status', params.status);
    if (params?.group) qs.set('group', params.group);
    if (params?.teamSlug) qs.set('teamSlug', params.teamSlug);
    const q = qs.toString();
    return get<Fixture[]>(footballUrl(`/fixtures${q ? `?${q}` : ''}`));
  },
  getFixture: (id: string) => get<Fixture>(footballUrl(`/fixtures/${id}`)),
  getFixtureLive: (id: string) => get<Pick<Fixture, 'id' | 'status' | 'homeScore' | 'awayScore' | 'currentMinute' | 'period' | 'lastUpdatedAt' | 'kickoffAt' | 'homeTeam' | 'awayTeam'>>(footballUrl(`/fixtures/${id}/live`)),
  getFixtureEvents: (id: string) => get<MatchEvent[]>(footballUrl(`/fixtures/${id}/events`)),
  getFixtureLineups: (id: string) => get<FixtureLineup[]>(footballUrl(`/fixtures/${id}/lineups`)),
  getFixtureAvailability: (id: string) => get<FixtureLineup[]>(footballUrl(`/fixtures/${id}/availability`)),
  listStandings: (params?: { seasonSlug?: string; group?: string }) => {
    const qs = new URLSearchParams();
    if (params?.seasonSlug) qs.set('seasonSlug', params.seasonSlug);
    if (params?.group) qs.set('group', params.group);
    const q = qs.toString();
    return get<StandingGroup[]>(footballUrl(`/standings${q ? `?${q}` : ''}`));
  },
  getMatchCentre: (fixtureId: string) => get<MatchCentre>(footballUrl(`/match-centre/${fixtureId}`)),
  getLiveMatchDashboard: (id: string) => get<LiveMatchDashboard>(footballUrl(`/fixtures/${id}/live-dashboard`)),
  getFixtureLiveState: (id: string) => get<LiveState>(footballUrl(`/fixtures/${id}/live-state`)),
  getFixtureTimeline: (id: string) => get<MatchEvent[]>(footballUrl(`/fixtures/${id}/timeline`)),
  getFixturePlayerStats: (id: string) => get<PlayerMatchStat[]>(footballUrl(`/fixtures/${id}/player-stats`)),
  getLiveFantasyPreview: (id: string) => get<{ provisional: true; fixtureId: string; players: LiveFantasyPlayerPreview[] }>(footballUrl(`/fixtures/${id}/live-fantasy-preview`)),
};
