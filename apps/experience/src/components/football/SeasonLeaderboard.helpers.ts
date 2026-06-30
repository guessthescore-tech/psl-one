import type { ExpPlayer } from '@/lib/data';

export type LeaderboardCategory = 'goals' | 'assists' | 'ratings' | 'cleanSheets';

export interface LeaderboardEntry {
  rank: number;
  player: ExpPlayer;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'same';
}

// PRODUCT DECISION: the 'ratings' key is an internal category identifier.
// The user-facing label must say "Fantasy Pts" because the sort and displayed
// value come from settled fantasy scoring (FantasyGameweekScoringService), NOT
// from PlayerMatchStats.rating. Displaying fantasyPoints/10 as a match rating
// (0–10 scale) was a mislabeling; the correct display is the raw integer total.
export const CATEGORY_LABELS: Record<LeaderboardCategory, string> = {
  goals:       'Goals',
  assists:     'Assists',
  ratings:     'Fantasy Pts',
  cleanSheets: 'Clean Sheets',
};

export function buildLeaderboard(
  players: ExpPlayer[],
  category: LeaderboardCategory,
): LeaderboardEntry[] {
  let sorted: ExpPlayer[];

  switch (category) {
    case 'goals':
      sorted = [...players].sort((a, b) => b.goalsThisTournament - a.goalsThisTournament);
      return sorted.map((p, i) => ({
        rank: i + 1,
        player: p,
        value: p.goalsThisTournament,
        trend: i < 2 ? 'up' : 'same',
      }));

    case 'assists':
      sorted = [...players].sort((a, b) => b.assistsThisTournament - a.assistsThisTournament);
      return sorted.map((p, i) => ({
        rank: i + 1,
        player: p,
        value: p.assistsThisTournament,
        trend: i < 2 ? 'up' : 'same',
      }));

    case 'ratings':
      // Sorts by settled fantasy points (from FantasyGameweekScoringService).
      // Value is the raw integer point total with unit 'pts'.
      // Zero is the correct empty-state when no gameweeks have been scored yet.
      sorted = [...players].sort((a, b) => b.fantasyPoints - a.fantasyPoints);
      return sorted.map((p, i) => ({
        rank: i + 1,
        player: p,
        value: p.fantasyPoints,
        unit: 'pts',
        trend: i < 2 ? 'up' : 'same',
      }));

    case 'cleanSheets':
      sorted = [...players]
        .filter((p) => p.position === 'GK' || p.position === 'DEF')
        .sort((a, b) => b.cleanSheets - a.cleanSheets);
      return sorted.map((p, i) => ({
        rank: i + 1,
        player: p,
        value: p.cleanSheets,
        trend: 'same',
      }));

    default:
      return [];
  }
}
