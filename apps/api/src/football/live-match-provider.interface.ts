import { FixtureStatus, MatchEventType } from '@prisma/client';

export interface ProviderFixtureState {
  providerFixtureId: string;
  status: FixtureStatus;
  homeScore: number;
  awayScore: number;
  currentMinute: number | null;
  period: string | null;
  startedAt: Date | null;
  halfTimeAt: Date | null;
  resumedAt: Date | null;
  finishedAt: Date | null;
}

export interface ProviderMatchEvent {
  providerEventId: string;
  eventType: MatchEventType;
  minute: number;
  stoppageMinute: number | null;
  period: string | null;
  teamProviderRef: string | null;
  playerProviderRef: string | null;
  relatedPlayerProviderRef: string | null;
  description: string | null;
}

export interface ProviderLineupEntry {
  playerProviderRef: string;
  teamProviderRef: string;
  status: 'STARTING' | 'SUBSTITUTE' | 'UNAVAILABLE';
  shirtNumber: number | null;
  position: string | null;
}

export interface ProviderPlayerStat {
  playerProviderRef: string;
  teamProviderRef: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  goalsConceded: number;
  cleanSheet: boolean;
  started: boolean;
  cameOnMinute: number | null;
  subbedOffMinute: number | null;
}

export interface LiveMatchProviderAdapter {
  readonly providerName: string;
  fetchFixtureState(providerFixtureId: string): Promise<ProviderFixtureState | null>;
  fetchFixtureEvents(providerFixtureId: string): Promise<ProviderMatchEvent[]>;
  fetchFixtureLineups(providerFixtureId: string): Promise<ProviderLineupEntry[]>;
  fetchFixturePlayerStats(providerFixtureId: string): Promise<ProviderPlayerStat[]>;
}

export class ManualLiveMatchProviderAdapter implements LiveMatchProviderAdapter {
  readonly providerName = 'manual';

  async fetchFixtureState(_providerFixtureId: string): Promise<ProviderFixtureState | null> {
    return null;
  }

  async fetchFixtureEvents(_providerFixtureId: string): Promise<ProviderMatchEvent[]> {
    return [];
  }

  async fetchFixtureLineups(_providerFixtureId: string): Promise<ProviderLineupEntry[]> {
    return [];
  }

  async fetchFixturePlayerStats(_providerFixtureId: string): Promise<ProviderPlayerStat[]> {
    return [];
  }
}
