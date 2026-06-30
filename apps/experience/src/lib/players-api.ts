/**
 * Player stats API client for PSL One Experience app.
 *
 * Maps to the PlayerStatsModule controller in the PSL One NestJS backend.
 * Paths are under /players (not /player-stats) as per the web app reference.
 */

import { publicFetch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PlayerProfile {
  id: string;
  name: string;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
  nationality: string;
  dateOfBirth: string | null;
  number: number | null;
  team: {
    id: string;
    name: string;
    slug: string;
    shortName: string;
    logoUrl: string | null;
    country: string;
  };
  playerStats?: Array<{
    seasonId: string;
    goals: number;
    assists: number;
    minutesPlayed: number;
    yellowCards: number;
    redCards: number;
  }>;
}

export interface PlayerSeasonStats {
  player: {
    id: string;
    name: string;
    position: string;
    number: number | null;
    team: {
      id: string;
      name: string;
      shortName: string;
      slug: string;
    };
  };
  seasonId: string;
  totals: {
    appearances: number;
    minutesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    cleanSheets: number;
    saves: number;
    ownGoals: number;
    penaltiesMissed: number;
    penaltiesSaved: number;
    fantasyPoints: number;
  };
  matches: Array<{
    fixture: {
      id: string;
      kickoffAt: string;
      homeScore: number | null;
      awayScore: number | null;
      status: string;
      homeTeam: { id: string; name: string; shortName: string };
      awayTeam: { id: string; name: string; shortName: string };
    };
    minutesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    saves: number;
    cleanSheet: boolean;
    fantasyPoints: number;
  }>;
}

export interface PlayerMatchStats {
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
}

export interface BatchPlayerSeasonStats {
  seasonId: string;
  players: Array<{
    playerId: string;
    goals: number;
    assists: number;
    fantasyPoints: number;
  }>;
}

export interface TopPerformer {
  playerId: string;
  playerName: string;
  teamName: string;
  position: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  /**
   * Fantasy points from settled gameweeks via FantasyGameweekScoringService
   * (sum of FantasyPlayerGameweekScore.basePoints for settled gameweeks).
   * Zero is the explicit empty-state when no gameweeks have been scored yet.
   * This value is NOT computed from PlayerMatchStats.
   */
  fantasyPoints: number;
  cleanSheets: number;
}

// ── Functions ─────────────────────────────────────────────────────────────────

export function getPlayerProfile(playerId: string): Promise<PlayerProfile> {
  return publicFetch<PlayerProfile>(`/players/${encodeURIComponent(playerId)}/profile`);
}

export function getPlayerSeasonStats(playerId: string, seasonId: string): Promise<PlayerSeasonStats> {
  return publicFetch<PlayerSeasonStats>(
    `/players/${encodeURIComponent(playerId)}/season/${encodeURIComponent(seasonId)}/stats`,
  );
}

export function getBatchPlayerSeasonStats(
  playerIds: string[],
  seasonId: string,
): Promise<BatchPlayerSeasonStats> {
  const qs = `playerIds=${encodeURIComponent(playerIds.join(','))}`;
  return publicFetch<BatchPlayerSeasonStats>(
    `/players/season/${encodeURIComponent(seasonId)}/stats/batch?${qs}`,
  );
}

export function getTopPerformers(seasonId: string, limit = 10): Promise<TopPerformer[]> {
  return publicFetch<TopPerformer[]>(
    `/players/season/${encodeURIComponent(seasonId)}/top-performers?limit=${limit}`,
  );
}
