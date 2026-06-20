/**
 * PSL One — Football Data Provider Adapter Interface
 *
 * Sprint 4 architecture sketch — TYPE-SAFE STUB ONLY.
 *
 * This file defines TypeScript interfaces, types, and transformation function
 * signatures for the football data provider adapter layer. It contains NO
 * implementation, makes NO API calls, stores NO credentials, and is safe to
 * commit. It is a design contract for the real adapter modules that will be
 * implemented in `apps/api/src/football/providers/`.
 *
 * Recommended provider: Sportmonks (see docs/data/SPRINT-4-PROVIDER-RECOMMENDATION.md)
 * Fallback: API-Football (existing discovery script)
 *
 * Last updated: 2026-06-20 (Sprint 4 data-provider research)
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. INJECTION TOKEN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * NestJS injection token for the active football data provider adapter.
 * Used as: @Inject(FOOTBALL_DATA_PROVIDER_TOKEN)
 */
export const FOOTBALL_DATA_PROVIDER_TOKEN = Symbol('FOOTBALL_DATA_PROVIDER_TOKEN');

// ─────────────────────────────────────────────────────────────────────────────
// 2. SUPPORTED PROVIDERS ENUM
// ─────────────────────────────────────────────────────────────────────────────

export type FootballDataProviderName =
  | 'sportmonks'
  | 'api-football'
  | 'manual';

// ─────────────────────────────────────────────────────────────────────────────
// 3. CACHE KEY STRATEGY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TTL values in seconds for each cache category.
 * Applied by FootballDataProviderCacheService (Redis wrapper).
 * These match the provider terms and platform requirements.
 */
export const PROVIDER_CACHE_TTL = {
  /** Live fixture state (score, status, current minute) — 30 s minimum safe poll interval */
  LIVE_STATE: 30,
  /** Live match events (goals, cards, subs) — refreshed alongside state */
  LIVE_EVENTS: 30,
  /** Live lineup — rarely changes mid-match */
  LIVE_LINEUP: 300, // 5 min
  /** Live player stats — refreshed alongside state */
  LIVE_PLAYER_STATS: 30,
  /** Scheduled/non-live fixture list */
  SCHEDULED_FIXTURES: 300, // 5 min
  /** Standings — updates only after matches complete */
  STANDINGS: 300, // 5 min
  /** Team/squad data — season-stable */
  TEAMS: 86_400, // 24 h
  /** Player data — season-stable */
  PLAYERS: 86_400, // 24 h
  /** Historical/finished fixture — immutable */
  HISTORICAL_FIXTURE: 86_400, // 24 h
  /** Competition/league metadata — season-stable */
  LEAGUE_METADATA: 86_400, // 24 h
} as const;

export type CacheTtlKey = keyof typeof PROVIDER_CACHE_TTL;

/**
 * Cache key factory functions.
 * All keys are namespaced under `football:` to avoid collision with other
 * Redis keys in the PSL One application.
 *
 * Important: providerFixtureId and other IDs are provider-specific strings
 * (e.g., Sportmonks numeric ID as string). They are NOT PSL One internal UUIDs.
 */
export const cacheKey = {
  liveState: (providerFixtureId: string): string =>
    `football:live:${providerFixtureId}:state`,

  liveEvents: (providerFixtureId: string): string =>
    `football:live:${providerFixtureId}:events`,

  liveLineup: (providerFixtureId: string): string =>
    `football:live:${providerFixtureId}:lineup`,

  livePlayerStats: (providerFixtureId: string): string =>
    `football:live:${providerFixtureId}:player-stats`,

  scheduledFixtures: (leagueId: string, season: string): string =>
    `football:fixtures:${leagueId}:${season}`,

  standings: (leagueId: string, season: string): string =>
    `football:standings:${leagueId}:${season}`,

  teams: (leagueId: string, season: string): string =>
    `football:teams:${leagueId}:${season}`,

  players: (teamId: string, season: string): string =>
    `football:players:${teamId}:${season}`,

  historicalFixture: (providerFixtureId: string): string =>
    `football:fixture:${providerFixtureId}:history`,

  leagueMetadata: (leagueId: string): string =>
    `football:league:${leagueId}`,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 4. PROVIDER ADAPTER INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The core adapter interface that all provider implementations must satisfy.
 *
 * This extends the existing LiveMatchProviderAdapter from
 * `apps/api/src/football/live-match-provider.interface.ts` with additional
 * methods needed for import and calibration flows.
 *
 * Each method is cache-aware: implementations are expected to check Redis
 * before making provider HTTP calls (via FootballDataProviderCacheService).
 */
export interface ProviderAdapter {
  /** Identifier string for this provider — used in logging, audit, and attribution */
  readonly providerName: FootballDataProviderName;

  // ── Live match methods (used by LiveMatchService) ──────────────────────────

  /**
   * Fetch the current state of a live or completed fixture.
   * Returns null if the providerFixtureId is not found.
   * Cache TTL: LIVE_STATE (30 s)
   */
  fetchFixtureState(
    providerFixtureId: string,
  ): Promise<ProviderFixtureState | null>;

  /**
   * Fetch all events for a fixture (goals, cards, substitutions, VAR).
   * Returns empty array if no events or fixture not found.
   * Cache TTL: LIVE_EVENTS (30 s)
   */
  fetchFixtureEvents(
    providerFixtureId: string,
  ): Promise<ProviderMatchEvent[]>;

  /**
   * Fetch lineup for both teams for a fixture.
   * Returns empty array if lineup not yet confirmed.
   * Cache TTL: LIVE_LINEUP (5 min)
   */
  fetchFixtureLineup(
    providerFixtureId: string,
  ): Promise<ProviderLineupEntry[]>;

  /**
   * Fetch per-player match statistics for a fixture.
   * Returns empty array if no stats available yet.
   * Cache TTL: LIVE_PLAYER_STATS (30 s)
   */
  fetchFixturePlayerStats(
    providerFixtureId: string,
  ): Promise<ProviderPlayerStat[]>;

  // ── Import methods (used by FixtureImportModule / SquadImportModule) ───────

  /**
   * Fetch all fixtures for a given provider league and season identifier.
   * Note: leagueId and seasonId are provider-specific identifiers, NOT PSL One UUIDs.
   * They are discovered at runtime via discoverLeagueId().
   * Cache TTL: SCHEDULED_FIXTURES (5 min)
   */
  fetchFixturesForSeason(
    leagueId: string,
    seasonId: string,
  ): Promise<ProviderFixture[]>;

  /**
   * Fetch current standings for a provider league and season.
   * Cache TTL: STANDINGS (5 min)
   */
  fetchStandings(
    leagueId: string,
    seasonId: string,
  ): Promise<ProviderStandingRow[]>;

  /**
   * Fetch all teams (clubs) for a provider league and season.
   * Cache TTL: TEAMS (24 h)
   */
  fetchTeams(
    leagueId: string,
    seasonId: string,
  ): Promise<ProviderTeam[]>;

  /**
   * Fetch squad (players) for a provider team identifier.
   * Note: teamId is the provider's numeric team ID as a string — NOT PSL One Club.id.
   * Cache TTL: PLAYERS (24 h)
   */
  fetchSquad(
    teamId: string,
    seasonId: string,
  ): Promise<ProviderPlayer[]>;

  // ── Discovery methods ──────────────────────────────────────────────────────

  /**
   * Discover the provider's numeric league ID for the PSL DStv Premiership.
   * IMPORTANT: Do NOT hard-code league IDs from memory or documentation.
   * Always call this method to discover the ID at runtime.
   * Cache TTL: LEAGUE_METADATA (24 h)
   */
  discoverPslLeagueId(): Promise<ProviderLeagueDiscovery | null>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. RAW PROVIDER RESPONSE TYPES (normalised across providers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalised fixture state — the adapter transforms provider-specific
 * status codes into these canonical values.
 *
 * Corresponds to PSL One's FixtureStatus enum (Prisma).
 */
export type ProviderFixtureStatus =
  | 'SCHEDULED'
  | 'LIVE'
  | 'HALFTIME'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'UNKNOWN';

/**
 * Normalised fixture state returned by fetchFixtureState().
 * The adapter is responsible for translating provider-specific status codes
 * into ProviderFixtureStatus values.
 */
export interface ProviderFixtureState {
  /** Provider-specific fixture identifier (string representation of numeric ID) */
  providerFixtureId: string;

  /** Normalised status — adapter translates provider status codes */
  status: ProviderFixtureStatus;

  /** Current home score — null if match not started */
  homeScore: number | null;

  /** Current away score — null if match not started */
  awayScore: number | null;

  /** Current match minute — null if not live */
  currentMinute: number | null;

  /** Stoppage time additional minutes — null if not applicable */
  stoppageTimeMinute: number | null;

  /** Current period identifier ('1H', '2H', 'ET1', 'ET2', 'PEN', 'HT', 'FT') */
  period: string | null;

  /** ISO datetime of match start — null if not started */
  startedAt: string | null;

  /** ISO datetime of half-time whistle — null if not reached */
  halfTimeAt: string | null;

  /** ISO datetime of second-half kick-off — null if not reached */
  resumedAt: string | null;

  /** ISO datetime of full-time whistle — null if not finished */
  finishedAt: string | null;
}

/**
 * Normalised match event type values.
 * Corresponds to PSL One's MatchEventType enum (Prisma).
 */
export type ProviderMatchEventType =
  | 'GOAL'
  | 'OWN_GOAL'
  | 'PENALTY_SCORED'
  | 'PENALTY_MISSED'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SECOND_YELLOW'
  | 'SUBSTITUTION'
  | 'VAR'
  | 'UNKNOWN';

/**
 * A single match event (goal, card, sub, etc.) returned by fetchFixtureEvents().
 */
export interface ProviderMatchEvent {
  /** Provider-specific event ID — used for idempotent upsert */
  providerEventId: string;

  /** Normalised event type — adapter translates provider event type strings */
  eventType: ProviderMatchEventType;

  /** Minute of the event */
  minute: number;

  /** Stoppage time minute (e.g., 90+3 → minute=90, stoppageMinute=3) */
  stoppageMinute: number | null;

  /** Period identifier ('1H', '2H', 'ET1', 'ET2', 'PEN') */
  period: string | null;

  /** Provider team ID for the team associated with this event */
  teamProviderRef: string | null;

  /** Provider player ID for the primary player */
  playerProviderRef: string | null;

  /** Display name for the primary player — denormalised for fallback display */
  playerName: string | null;

  /** Provider player ID for the secondary player (assist, substituted player) */
  relatedPlayerProviderRef: string | null;

  /** Display name for the related player — denormalised for fallback display */
  relatedPlayerName: string | null;

  /** Provider-specific detail string ('Normal Goal', 'Yellow Card', etc.) */
  detail: string | null;
}

/**
 * Lineup entry for a single player in a fixture.
 * Returned by fetchFixtureLineup().
 */
export interface ProviderLineupEntry {
  /** Provider player ID */
  playerProviderRef: string;

  /** Provider team ID */
  teamProviderRef: string;

  /** Starting XI, bench, or unavailable */
  status: 'STARTING' | 'SUBSTITUTE' | 'UNAVAILABLE';

  /** Shirt number — null if unknown */
  shirtNumber: number | null;

  /** Position string ('GK', 'DEF', 'MID', 'FWD') — normalised by adapter */
  position: string | null;
}

/**
 * Per-player match statistics for a single fixture.
 * Returned by fetchFixturePlayerStats().
 */
export interface ProviderPlayerStat {
  /** Provider player ID */
  playerProviderRef: string;

  /** Provider team ID */
  teamProviderRef: string;

  /** Minutes played in this fixture */
  minutesPlayed: number;

  /** Goals scored (excluding own goals) */
  goals: number;

  /** Goal assists */
  assists: number;

  /** Own goals */
  ownGoals: number;

  /** Yellow cards received */
  yellowCards: number;

  /** Red cards received */
  redCards: number;

  /** Saves (goalkeepers only) */
  saves: number;

  /** Goals conceded (goalkeepers and defenders) */
  goalsConceded: number;

  /** Whether the player kept a clean sheet */
  cleanSheet: boolean;

  /** Whether the player started the match */
  started: boolean;

  /** Minute the player came on as substitute — null if started */
  cameOnMinute: number | null;

  /** Minute the player was substituted off — null if not subbed */
  subbedOffMinute: number | null;

  /** Shots on target */
  shotsOnTarget: number;

  /** Total passes */
  totalPasses: number;

  /** Successful passes */
  accuratePasses: number;

  /** Pass accuracy percentage (0–100) */
  passAccuracy: number | null;

  /** Tackles made */
  tackles: number;
}

/**
 * Full fixture data as returned by fetchFixturesForSeason().
 * Used by FixtureImportModule to populate the Fixture table.
 */
export interface ProviderFixture {
  /** Provider-specific fixture ID */
  providerFixtureId: string;

  /** Provider team ID for home team */
  homeTeamProviderRef: string;

  /** Provider team ID for away team */
  awayTeamProviderRef: string;

  /** ISO datetime of scheduled kick-off (with timezone offset) */
  kickoffAt: string;

  /** Normalised fixture status */
  status: ProviderFixtureStatus;

  /** Current home score — null if match not started */
  homeScore: number | null;

  /** Current away score — null if match not started */
  awayScore: number | null;

  /** Round/matchday label (e.g., 'Matchday 5', 'Regular Season - 5') */
  roundLabel: string | null;

  /** Venue name */
  venueName: string | null;

  /** Venue city */
  venueCity: string | null;
}

/**
 * A single row in the league standings table.
 * Returned by fetchStandings().
 */
export interface ProviderStandingRow {
  /** League position (1-indexed) */
  position: number;

  /** Provider team ID */
  teamProviderRef: string;

  /** Points total */
  points: number;

  /** Matches played */
  played: number;

  /** Matches won */
  won: number;

  /** Matches drawn */
  drawn: number;

  /** Matches lost */
  lost: number;

  /** Goals scored by this team */
  goalsFor: number;

  /** Goals conceded by this team */
  goalsAgainst: number;

  /** Goal difference (goalsFor - goalsAgainst) */
  goalDifference: number;

  /** Recent form string (e.g., 'WWDLW') — may be null if provider does not supply */
  form: string | null;
}

/**
 * Team/club data returned by fetchTeams().
 * Used by ClubExperience module and SquadImportModule.
 */
export interface ProviderTeam {
  /** Provider-specific team ID */
  providerTeamId: string;

  /** Full team name (e.g., 'Mamelodi Sundowns FC') */
  name: string;

  /** Short name or abbreviation (e.g., 'Sundowns') — may be null */
  shortName: string | null;

  /** Year founded — may be null */
  founded: number | null;

  /** Home venue name — may be null */
  venueName: string | null;

  /** Home venue city — may be null */
  venueCity: string | null;

  /** Home venue capacity — may be null */
  venueCapacity: number | null;

  /**
   * Team logo URL from provider.
   * NOTE: Logo redistribution rights must be confirmed before displaying to fans.
   * See docs/data/SPRINT-4-PROVIDER-LICENSING-GATE.md, Section C.
   */
  logoUrl: string | null;
}

/**
 * Player data returned by fetchSquad().
 * Used by SquadImportModule and FantasyCalibrationModule.
 */
export interface ProviderPlayer {
  /** Provider-specific player ID */
  providerPlayerId: string;

  /** Full display name */
  name: string;

  /** Date of birth in YYYY-MM-DD format — may be null */
  dateOfBirth: string | null;

  /** Nationality string (e.g., 'South Africa') — may be null */
  nationality: string | null;

  /** Height string (e.g., '180 cm') — may be null */
  height: string | null;

  /** Weight string (e.g., '75 kg') — may be null */
  weight: string | null;

  /**
   * Normalised position string: 'GK' | 'DEF' | 'MID' | 'FWD'
   * Adapter maps provider position values to these canonical values.
   * Unknown positions map to 'MID' with a warning logged.
   */
  position: 'GK' | 'DEF' | 'MID' | 'FWD' | null;

  /** Shirt/jersey number — may be null */
  squadNumber: number | null;

  /**
   * Player profile image URL from provider.
   * NOTE: Image redistribution rights must be confirmed before displaying to fans.
   * See docs/data/SPRINT-4-PROVIDER-LICENSING-GATE.md, Section C + D.
   */
  photoUrl: string | null;
}

/**
 * Result of discoverPslLeagueId() — the provider's numeric IDs for the PSL.
 * IMPORTANT: These IDs must never be hard-coded. They are discovered at runtime.
 */
export interface ProviderLeagueDiscovery {
  /** Provider's numeric league ID for the PSL DStv Premiership (as string) */
  leagueId: string;

  /** Human-readable league name as returned by the provider */
  leagueName: string;

  /** Provider's numeric season ID for the current/latest season (as string) */
  currentSeasonId: string;

  /** Human-readable season name (e.g., '2025/2026') */
  currentSeasonName: string;

  /** All available season IDs from newest to oldest */
  availableSeasonIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. TRANSFORMATION FUNCTION SIGNATURES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transformation functions convert raw provider responses to normalised
 * ProviderAdapter types. Each provider adapter implements its own set of
 * transformers internally. These signatures define the expected contract.
 *
 * Transformation rules:
 * - Never throw on unknown fields — log a warning and skip/null the field
 * - Never return undefined — use null for absent optional values
 * - Never mutate the input object
 * - Always validate required fields before returning a result
 */

/** Transforms a raw Sportmonks fixture object to ProviderFixture */
export type SportmonksFixtureTransformer = (
  raw: SportmonksRawFixture,
) => ProviderFixture | null; // null if required fields missing

/** Transforms a raw API-Football fixture object to ProviderFixture */
export type ApiFootballFixtureTransformer = (
  raw: ApiFootballRawFixture,
) => ProviderFixture | null;

/** Transforms a raw Sportmonks event to ProviderMatchEvent */
export type SportmonksEventTransformer = (
  raw: SportmonksRawEvent,
) => ProviderMatchEvent | null;

/** Transforms a raw API-Football event to ProviderMatchEvent */
export type ApiFootballEventTransformer = (
  raw: ApiFootballRawEvent,
) => ProviderMatchEvent | null;

// ─────────────────────────────────────────────────────────────────────────────
// 7. RAW PROVIDER RESPONSE SHAPES (approximate — must be verified)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Approximate shape of a Sportmonks v3 fixture response item.
 *
 * IMPORTANT: Field paths shown here are approximate based on public Sportmonks
 * documentation. They MUST be verified against live API responses before
 * implementing the real adapter. Do not treat these as authoritative.
 */
export interface SportmonksRawFixture {
  id: number;
  starting_at: string; // ISO datetime
  state?: {
    id: number;
    state: string;       // e.g., 'NS', 'LIVE', 'FT'
    short_name: string;
  };
  minute?: number | null;
  scores?: {
    current?: {
      home?: number | null;
      away?: number | null;
    };
    ht?: {
      home?: number | null;
      away?: number | null;
    };
  };
  participants?: SportmonksRawParticipant[];
  venue?: {
    name?: string | null;
    city_id?: number | null;
  };
  round?: {
    name?: string | null;
  };
}

export interface SportmonksRawParticipant {
  id: number;
  name: string;
  meta?: {
    location?: 'home' | 'away';
  };
}

/**
 * Approximate shape of a Sportmonks v3 event response item.
 * MUST be verified against live API responses before implementation.
 */
export interface SportmonksRawEvent {
  id: number;
  minute: number;
  extra_minute?: number | null;
  type?: {
    id: number;
    name: string;
    developer_name: string; // e.g., 'goal', 'card', 'substitution'
  };
  detail?: string | null;
  team_id?: number | null;
  player_id?: number | null;
  player_name?: string | null;
  related_player_id?: number | null;
  related_player_name?: string | null;
  period?: {
    name?: string | null;
  };
}

/**
 * Approximate shape of an API-Football v3 fixture response item.
 *
 * IMPORTANT: Field paths shown here are based on the existing PSL-DATA-MAPPING.md
 * documentation and the discovery script. They MUST be verified against live API
 * responses. Do not treat these as authoritative field paths.
 */
export interface ApiFootballRawFixture {
  fixture: {
    id: number;
    date: string; // ISO datetime with offset
    status: {
      long: string;
      short: string;  // 'NS', '1H', 'HT', '2H', 'FT', 'PST', 'CANC'
      elapsed: number | null;
    };
    venue?: {
      name?: string | null;
      city?: string | null;
    };
  };
  league: {
    id: number;
    name: string;
    round: string; // e.g., 'Regular Season - 5'
  };
  teams: {
    home: { id: number; name: string; logo?: string };
    away: { id: number; name: string; logo?: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score?: {
    halftime?: { home: number | null; away: number | null };
  };
}

/**
 * Approximate shape of an API-Football v3 event response item.
 * MUST be verified against live API responses before implementation.
 */
export interface ApiFootballRawEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: { id: number; name: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;    // 'Goal', 'Card', 'subst', 'Var'
  detail: string;  // 'Normal Goal', 'Yellow Card', 'Red Card', etc.
  comments: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. CACHE SERVICE INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Interface for the Redis-backed cache service used by adapters.
 * The real implementation uses the existing RedisService from the NestJS app.
 */
export interface FootballDataProviderCacheServiceInterface {
  /**
   * Attempt to return a cached value; on cache miss, call fetcher and cache the result.
   *
   * @param key       Redis cache key (use cacheKey.* factory functions)
   * @param ttl       TTL in seconds (use PROVIDER_CACHE_TTL.* constants)
   * @param fetcher   Async function that makes the provider HTTP call
   * @returns         { data: T; stale: boolean } — stale=true if returning expired cache on error
   */
  getOrFetch<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>,
  ): Promise<{ data: T; stale: boolean }>;

  /**
   * Manually invalidate a cache key.
   * Used by admin endpoint: POST /admin/football/cache/clear
   */
  invalidate(key: string): Promise<void>;

  /**
   * Invalidate all football cache keys for a given fixture.
   * Useful after manual data correction.
   */
  invalidateFixture(providerFixtureId: string): Promise<void>;

  /**
   * Record a provider call success/failure for circuit-breaker state tracking.
   */
  recordProviderCall(
    providerName: FootballDataProviderName,
    success: boolean,
  ): Promise<void>;

  /**
   * Check whether the circuit breaker is open for a provider.
   * If true: adapter should return null/empty rather than attempting a call.
   */
  isCircuitOpen(providerName: FootballDataProviderName): Promise<boolean>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. ATTRIBUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attribution strings for fan-facing display.
 * The real provider must confirm the exact wording required.
 *
 * These strings are placeholders — do not display to fans until
 * the licensing gate is signed (see docs/data/SPRINT-4-PROVIDER-LICENSING-GATE.md).
 */
export const PROVIDER_ATTRIBUTION: Record<FootballDataProviderName, string> = {
  'sportmonks': 'Match data provided by Sportmonks',
  'api-football': 'Match data provided by API-Football',
  'manual': '', // No attribution for manual/admin-entered data
};

/**
 * Provider home page URLs for attribution links.
 */
export const PROVIDER_ATTRIBUTION_URL: Record<FootballDataProviderName, string | null> = {
  'sportmonks': 'https://www.sportmonks.com',
  'api-football': 'https://www.api-football.com',
  'manual': null,
};
