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
}

export interface PlayerSeasonStats {
  playerId: string;
  seasonId: string;
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

export interface TopPerformer {
  playerId: string;
  playerName: string;
  teamName: string;
  position: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
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

export function getTopPerformers(seasonId: string, limit = 10): Promise<TopPerformer[]> {
  return publicFetch<TopPerformer[]>(
    `/players/season/${encodeURIComponent(seasonId)}/top-performers?limit=${limit}`,
  );
}
