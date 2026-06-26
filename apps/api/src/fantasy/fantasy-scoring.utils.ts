/**
 * Standalone fantasy scoring engine — shared by:
 *   - FantasyGameweekScoringService (NestJS service, gameweek context)
 *   - WcFixtureReplayService (CLI script, no NestJS bootstrap)
 *
 * This is the single authoritative implementation of PSL One fantasy point rules.
 * Do not duplicate this logic elsewhere.
 */

import { PlayerPosition } from '@prisma/client';

export interface StatInput {
  minutesPlayed: number;
  goals: number;
  assists: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  penaltiesMissed: number;
  penaltiesSaved: number;
  saves: number;
  cleanSheet: boolean;
  bonusPoints: number;
  tacklesWon: number;
  interceptions: number;
  blockedShots: number;
  didNotPlay: boolean;
}

export interface PointsBreakdown {
  appearance: number;
  goals: number;
  assists: number;
  cleanSheet: number;
  saves: number;
  penaltySaves: number;
  penaltyMisses: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  goalsConcededDeduction: number;
  bonus: number;
  defensive: number;
  captainMultiplier: number;
  benchBoostCounted: boolean;
}

export interface PlayerPointsResult {
  basePoints: number;
  played: boolean;
  breakdown: PointsBreakdown;
}

const ZERO_BREAKDOWN: PointsBreakdown = {
  appearance: 0, goals: 0, assists: 0, cleanSheet: 0, saves: 0,
  penaltySaves: 0, penaltyMisses: 0, yellowCards: 0, redCards: 0,
  ownGoals: 0, goalsConcededDeduction: 0, bonus: 0, defensive: 0,
  captainMultiplier: 1, benchBoostCounted: false,
};

/**
 * Compute base fantasy points for a player from a single match stat record.
 *
 * Scoring rules (PSL One v1):
 *   Appearance: 1 pt (<60 min), 2 pts (≥60 min)
 *   Goals: GK 10, DEF 6, MID 5, FWD 4
 *   Assists: 3 pts each
 *   Clean sheet (≥60 min): GK/DEF 4, MID 1, FWD 0
 *   Saves: 1 pt per 3 saves
 *   Penalty saves: 5 pts each
 *   Penalty misses: -2 pts each
 *   Yellow card: -1 pt
 *   Red card: -3 pts
 *   Own goal: -2 pts
 *   Defensive actions: 1 pt per 3 (tackles + interceptions + blocked shots)
 *   Goals conceded deduction: not implemented (clean sheet is binary)
 *
 * Captain/chip multipliers are applied by the caller, not here.
 */
export function computePlayerBasePoints(stat: StatInput, position: PlayerPosition): PlayerPointsResult {
  if (stat.didNotPlay || stat.minutesPlayed === 0) {
    return { basePoints: 0, played: false, breakdown: { ...ZERO_BREAKDOWN } };
  }

  const appearance = stat.minutesPlayed >= 60 ? 2 : 1;

  const goals =
    position === PlayerPosition.GOALKEEPER ? stat.goals * 10 :
    position === PlayerPosition.DEFENDER ? stat.goals * 6 :
    position === PlayerPosition.MIDFIELDER ? stat.goals * 5 :
    stat.goals * 4;

  const assists = stat.assists * 3;

  const cleanSheet =
    stat.cleanSheet && stat.minutesPlayed >= 60
      ? (position === PlayerPosition.GOALKEEPER || position === PlayerPosition.DEFENDER ? 4 :
         position === PlayerPosition.MIDFIELDER ? 1 : 0)
      : 0;

  const saves = Math.floor(stat.saves / 3);
  const penaltySaves = stat.penaltiesSaved * 5;
  const penaltyMisses = stat.penaltiesMissed * -2;
  const yellowCards = stat.yellowCards * -1;
  const redCards = stat.redCards * -3;
  const ownGoals = stat.ownGoals * -2;
  const bonus = stat.bonusPoints;
  const defensive = Math.floor((stat.tacklesWon + stat.interceptions + stat.blockedShots) / 3);

  const basePoints =
    appearance + goals + assists + cleanSheet +
    saves + penaltySaves + penaltyMisses +
    yellowCards + redCards + ownGoals + bonus + defensive;

  return {
    basePoints,
    played: true,
    breakdown: {
      appearance,
      goals,
      assists,
      cleanSheet,
      saves: saves + penaltySaves,
      penaltySaves,
      penaltyMisses,
      yellowCards,
      redCards,
      ownGoals,
      goalsConcededDeduction: 0,
      bonus,
      defensive,
      captainMultiplier: 1,
      benchBoostCounted: false,
    },
  };
}
