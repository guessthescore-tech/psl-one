/**
 * Frontend-only season presentation state model.
 * Derives display mode from live data without modifying backend state.
 * Backend season lifecycle is NOT changed by this module.
 */

export type SeasonPresentationMode =
  | 'OFF_SEASON'
  | 'PRE_SEASON'
  | 'IN_SEASON'
  | 'MATCHDAY_LIVE'
  | 'POST_MATCH';

export interface SeasonPresentationContext {
  seasonStatus: string | null;
  isActive: boolean;
  hasActiveFixture: boolean;
  hasRecentResult: boolean;
  nextFixtureMinutesAway: number | null;
}

/**
 * Pure function — no side effects, no API calls.
 * Derives the current presentation mode from season and fixture state.
 */
export function deriveSeasonMode(ctx: SeasonPresentationContext): SeasonPresentationMode {
  if (!ctx.isActive || !ctx.seasonStatus) return 'OFF_SEASON';
  const s = ctx.seasonStatus.toUpperCase();
  if (s === 'UPCOMING' || s === 'PRE_SEASON') return 'PRE_SEASON';
  if (ctx.hasActiveFixture) return 'MATCHDAY_LIVE';
  if (ctx.hasRecentResult) return 'POST_MATCH';
  return 'IN_SEASON';
}

/** Module render order for each presentation mode */
export const MODULE_ORDER: Record<SeasonPresentationMode, string[]> = {
  OFF_SEASON:    ['news', 'clubs', 'fanValue', 'achievements', 'campaigns'],
  PRE_SEASON:    ['countdown', 'squads', 'fixtures', 'fanValue', 'news'],
  IN_SEASON:     ['fixtures', 'table', 'fantasy', 'predictions', 'topScorers', 'news', 'clubs', 'campaigns'],
  MATCHDAY_LIVE: ['liveMatches', 'livePredictions', 'liveFantasy', 'table', 'news'],
  POST_MATCH:    ['results', 'topPerformers', 'table', 'fantasy', 'predictions', 'news'],
};

export const MODE_LABELS: Record<SeasonPresentationMode, string> = {
  OFF_SEASON:    'Off Season',
  PRE_SEASON:    'Pre-Season',
  IN_SEASON:     'In Season',
  MATCHDAY_LIVE: 'Matchday Live',
  POST_MATCH:    'Post-Match',
};

export const ALL_MODES: SeasonPresentationMode[] = [
  'OFF_SEASON',
  'PRE_SEASON',
  'IN_SEASON',
  'MATCHDAY_LIVE',
  'POST_MATCH',
];
