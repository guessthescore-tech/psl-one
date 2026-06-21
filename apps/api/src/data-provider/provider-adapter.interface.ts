export interface ProviderFixture {
  externalId: string;
  homeTeamName: string;
  awayTeamName: string;
  kickoffAt: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
}

export interface ProviderTeam {
  externalId: string;
  name: string;
  shortName: string;
  countryCode: string;
}

export interface ProviderPlayer {
  externalId: string;
  name: string;
  position: string;
  teamExternalId: string;
}

export interface ProviderSeason {
  externalId: string;
  name: string;
  competitionName: string;
  startDate: string;
  endDate: string;
}

export interface ProviderAdapterHealth {
  available: boolean;
  provider: string;
  message: string;
}

export interface ProviderStandings {
  externalId: string;
  teamName: string;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface ProviderAdapter {
  readonly name: string;
  health(): Promise<ProviderAdapterHealth>;
  getSeasons(): Promise<ProviderSeason[]>;
  getFixtures(seasonExternalId: string): Promise<ProviderFixture[]>;
  getTeams(seasonExternalId: string): Promise<ProviderTeam[]>;
  getPlayers(teamExternalId: string): Promise<ProviderPlayer[]>;
  getStandings(seasonExternalId: string): Promise<ProviderStandings[]>;
}
