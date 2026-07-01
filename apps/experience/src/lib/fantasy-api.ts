/**
 * Fantasy API client for PSL One Experience app.
 *
 * Covers: player pool, team management, transfers, chips, leagues, scoring,
 * history, leaderboard, and rules config.
 *
 * All mutations require the fan to be authenticated (Bearer token). Read
 * endpoints are authenticated where the server requires it for personalisation.
 */

import { apiFetch, apiPost, apiPatch, publicFetch } from './api';

// ── Enums ─────────────────────────────────────────────────────────────────────

export type PlayerPosition = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
export type FantasySquadRole = 'STARTER' | 'SUBSTITUTE';
export type ChipType = 'BENCH_BOOST' | 'FREE_HIT' | 'TRIPLE_CAPTAIN' | 'WILDCARD';
export type ChipStatus = 'AVAILABLE' | 'ACTIVE' | 'USED' | 'CANCELLED' | 'EXPIRED';
export type LeagueType = 'PRIVATE' | 'PUBLIC' | 'GLOBAL';
export type LeagueScoringType = 'CLASSIC' | 'HEAD_TO_HEAD';
export type LockReason =
  | 'OPEN'
  | 'TRANSFER_DEADLINE'
  | 'GAMEWEEK_LOCKED'
  | 'GAMEWEEK_LIVE'
  | 'GAMEWEEK_COMPLETED';

// ── Team types ────────────────────────────────────────────────────────────────

export interface FantasyTeamPlayer {
  id: string;
  playerId: string;
  squadRole: FantasySquadRole;
  position: PlayerPosition;
  benchSlot: number | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  player: {
    id: string;
    name: string;
    position: PlayerPosition;
    number: number | null;
    team: { id: string; name: string; shortName: string; externalId: string | null };
  };
}

export interface FantasyTeam {
  id: string;
  name: string;
  formation: string | null;
  totalPoints: number;
  players: FantasyTeamPlayer[];
}

export interface SquadValidation {
  isValid: boolean;
  errors: string[];
  squadCounts: {
    goalkeepers: number;
    defenders: number;
    midfielders: number;
    forwards: number;
  };
  starterCounts: {
    goalkeepers: number;
    defenders: number;
    midfielders: number;
    forwards: number;
  };
  formation: string | null;
  benchSummary: string;
  captainValid: boolean;
  viceCaptainValid: boolean;
  maxPerTeamValid: boolean;
}

export interface FantasyPlayerSlot {
  playerId: string;
  squadRole: FantasySquadRole;
  benchSlot?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

export interface PlayerSummary {
  id: string;
  name: string;
  position: PlayerPosition;
  number: number | null;
  team: { id: string; name: string; shortName: string; externalId: string | null };
}

// ── Deadline / Transfer types ─────────────────────────────────────────────────

export interface DeadlineInfo {
  gameweekId: string;
  gameweekName: string;
  transferDeadlineAt: string;
  isLocked: boolean;
  lockReason: LockReason;
  serverTime: string;
  firstFixtureKickoffAt: string | null;
}

export interface TransferStatus {
  fantasyTeamId: string;
  freeTransfersAvailable: number;
  hasPassedFirstDeadline: boolean;
  totalTransferDeductions: number;
  isDeadlineLocked: boolean;
  lockReason: string;
  gameweekId: string | null;
  gameweekTransferCount: number;
  nextTransferCost: number;
  maxTransfersPerGameweek: number;
}

// ── Chip types ────────────────────────────────────────────────────────────────

export interface Chip {
  id: string;
  type: ChipType;
  status: ChipStatus;
  gameweekId: string | null;
  activatedAt: string | null;
  usedAt: string | null;
}

// ── Price types ───────────────────────────────────────────────────────────────

export interface PlayerPriceInfo {
  playerId: string;
  playerName: string;
  seasonId: string;
  /** Current fantasy price in millions, normalized from the API's integer tenths. */
  currentPrice: number;
}

// ── League types ──────────────────────────────────────────────────────────────

export interface League {
  id: string;
  name: string;
  type: LeagueType;
  scoringType: LeagueScoringType;
  seasonId: string;
  inviteCode: string | null;
  isJoinable: boolean;
  createdByUserId: string | null;
  createdAt: string;
  memberCount?: number;
}

export interface LeagueMembership {
  id: string;
  leagueId: string;
  userId: string;
  fantasyTeamId: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
  leftAt: string | null;
  league: League;
}

export interface ClassicStandingsRow {
  rank: number;
  fantasyTeamId: string;
  teamName: string;
  managerName: string;
  totalPoints: number;
  transferCount: number;
  joinedAt: string;
}

export interface H2HStandingsRow {
  rank: number;
  userId: string;
  fantasyTeamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  h2hPoints: number;
  totalFantasyPoints: number;
}

// ── Rules types ───────────────────────────────────────────────────────────────

export interface FantasyRules {
  squadSize: number;
  goalkeeperCount: number;
  defenderCount: number;
  midfielderCount: number;
  forwardCount: number;
  startingXiSize: number;
  minStartingGoalkeepers: number;
  maxStartingGoalkeepers: number;
  minStartingDefenders: number;
  minStartingMidfielders: number;
  minStartingForwards: number;
  benchSize: number;
  freeTransfersPerGameweek: number;
  maxSavedFreeTransfers: number;
  extraTransferCost: number;
  maxTransfersPerGameweek: number;
  deadlineOffsetMinutes: number;
  wildcardCount: number;
  freeHitCount: number;
  benchBoostCount: number;
  tripleCaptainCount: number;
  chipsEnabled: boolean;
  wildcardEnabled: boolean;
  freeHitEnabled: boolean;
  benchBoostEnabled: boolean;
  tripleCaptainEnabled: boolean;
  freeHitConsecutiveGameweekBlocked: boolean;
  halfwayGameweek: number;
  seasonGameweekCount: number;
}

// ── Scoring / History types ───────────────────────────────────────────────────

export interface PlayerGameweekScore {
  id: string;
  playerId: string;
  basePoints: number;
  multiplier: number;
  multipliedPoints: number;
  isStarter: boolean;
  isBench: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  countedInTotal: boolean;
  reason: string | null;
  breakdownJson: Record<string, unknown> | null;
  player: { id: string; name: string; position: string };
}

export interface FantasyGameweekScore {
  id: string;
  fantasyTeamId: string;
  gameweekId: string;
  grossPoints: number;
  transferCost: number;
  chipPoints: number;
  benchPoints: number;
  captainPoints: number;
  netPoints: number;
  rank: number | null;
  settledAt: string | null;
  gameweek: { id: string; name: string; round: number };
  playerScores: PlayerGameweekScore[];
}

export interface FantasyHistoryEntry {
  id: string;
  fantasyTeamId: string;
  gameweekId: string;
  grossPoints: number;
  transferCost: number;
  chipPoints: number;
  benchPoints: number;
  captainPoints: number;
  netPoints: number;
  rank: number | null;
  settledAt: string | null;
  gameweek: { id: string; name: string; round: number };
}

// ── Leaderboard types ─────────────────────────────────────────────────────────

export interface GameweekLeaderboardRow {
  rank: number;
  fantasyTeamId: string;
  teamName: string;
  managerName: string;
  netPoints: number;
  grossPoints: number;
  transferCost: number;
  gameweekId: string;
}

export interface SeasonLeaderboardRow {
  rank: number;
  fantasyTeamId: string;
  teamName: string;
  managerName: string;
  netPoints: number;
  grossPoints: number;
  transferCost: number;
  seasonId: string;
}

// ── Player pool ───────────────────────────────────────────────────────────────

export function getPlayerPool(position?: PlayerPosition, seasonId?: string): Promise<PlayerSummary[]> {
  const params = new URLSearchParams();
  if (position) params.set('position', position);
  if (seasonId) params.set('seasonId', seasonId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return publicFetch<PlayerSummary[]>(`/fantasy/player-pool${qs}`);
}

export function getPlayerPrices(seasonId?: string): Promise<PlayerPriceInfo[]> {
  const qs = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : '';
  return publicFetch<PlayerPriceInfo[]>(`/fantasy/player-prices${qs}`).then((prices) =>
    prices.map((price) => ({
      ...price,
      currentPrice: price.currentPrice / 10,
    })),
  );
}

// ── My team ───────────────────────────────────────────────────────────────────

export function getTeam(): Promise<FantasyTeam> {
  return apiFetch<FantasyTeam>('/fantasy/team/me');
}

export function createTeam(dto: { name?: string; players?: FantasyPlayerSlot[] }): Promise<FantasyTeam> {
  return apiPost<FantasyTeam>('/fantasy/team/me', dto);
}

export function updateTeam(dto: { name?: string; formation?: string }): Promise<FantasyTeam> {
  return apiPatch<FantasyTeam>('/fantasy/team/me', dto);
}

export function addPlayer(slot: FantasyPlayerSlot): Promise<FantasyTeam> {
  return apiPost<FantasyTeam>('/fantasy/team/me/players', slot);
}

export function removePlayer(playerId: string): Promise<FantasyTeam> {
  return apiFetch<FantasyTeam>(`/fantasy/team/me/players/${encodeURIComponent(playerId)}`, {
    method: 'DELETE',
  });
}

export function updatePlayer(
  playerId: string,
  dto: {
    squadRole?: FantasySquadRole;
    benchSlot?: number;
    isCaptain?: boolean;
    isViceCaptain?: boolean;
  },
): Promise<FantasyTeam> {
  return apiPatch<FantasyTeam>(`/fantasy/team/me/players/${encodeURIComponent(playerId)}`, dto);
}

// ── Transfers ─────────────────────────────────────────────────────────────────

export function makeTransfers(dto: {
  removePlayerId: string;
  addPlayerId: string;
}): Promise<FantasyTeam> {
  return apiPost<FantasyTeam>('/fantasy/team/me/transfers', dto);
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateSquad(): Promise<SquadValidation> {
  return apiFetch<SquadValidation>('/fantasy/team/me/validate', { method: 'POST' });
}

// ── Deadline ──────────────────────────────────────────────────────────────────

export function getDeadline(seasonId?: string): Promise<DeadlineInfo> {
  const qs = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : '';
  return apiFetch<DeadlineInfo>(`/fantasy/deadline${qs}`);
}

// ── Transfer status ───────────────────────────────────────────────────────────

export function getTransferStatus(): Promise<TransferStatus> {
  return apiFetch<TransferStatus>('/fantasy/transfers/status');
}

// ── Chips ─────────────────────────────────────────────────────────────────────

export function getChips(): Promise<Chip[]> {
  return apiFetch<Chip[]>('/fantasy/chips');
}

export function activateChip(chipId: string, gameweekId: string): Promise<Chip> {
  return apiPost<Chip>(`/fantasy/chips/${encodeURIComponent(chipId)}/activate`, { gameweekId });
}

export function cancelChip(chipId: string): Promise<Chip> {
  return apiPost<Chip>(`/fantasy/chips/${encodeURIComponent(chipId)}/cancel`, {});
}

// ── Leagues ───────────────────────────────────────────────────────────────────

export function getMyLeagues(): Promise<LeagueMembership[]> {
  return apiFetch<LeagueMembership[]>('/fantasy/leagues/me');
}

export function getLeague(leagueId: string): Promise<League> {
  return apiFetch<League>(`/fantasy/leagues/${encodeURIComponent(leagueId)}`);
}

export function getLeagueStandings(
  leagueId: string,
  type?: 'classic' | 'h2h',
): Promise<ClassicStandingsRow[] | H2HStandingsRow[]> {
  const qs = type ? `?type=${encodeURIComponent(type)}` : '';
  return apiFetch<ClassicStandingsRow[] | H2HStandingsRow[]>(
    `/fantasy/leagues/${encodeURIComponent(leagueId)}/standings${qs}`,
  );
}

export function joinLeagueByCode(inviteCode: string): Promise<LeagueMembership> {
  return apiPost<LeagueMembership>('/fantasy/leagues/join', { inviteCode });
}

export function getPublicLeagues(seasonId: string): Promise<League[]> {
  return apiFetch<League[]>(`/fantasy/leagues/public?seasonId=${encodeURIComponent(seasonId)}`);
}

export function joinPublicLeague(seasonId: string, leagueId?: string): Promise<LeagueMembership> {
  return apiPost<LeagueMembership>('/fantasy/leagues/public/join', { seasonId, leagueId });
}

export function createLeague(dto: { name: string; seasonId: string }): Promise<League> {
  return apiPost<League>('/fantasy/leagues/private', dto);
}

export function leaveLeague(leagueId: string): Promise<LeagueMembership> {
  return apiPost<LeagueMembership>(`/fantasy/leagues/${encodeURIComponent(leagueId)}/leave`, {});
}

// ── Rules ─────────────────────────────────────────────────────────────────────

export function getFantasyRules(): Promise<FantasyRules> {
  return publicFetch<FantasyRules>('/fantasy/rules');
}

// ── Gameweek scoring ──────────────────────────────────────────────────────────

export function getGameweekScore(gameweekId: string): Promise<FantasyGameweekScore> {
  return apiFetch<FantasyGameweekScore>(
    `/fantasy/gameweeks/${encodeURIComponent(gameweekId)}/score`,
  );
}

// ── History ───────────────────────────────────────────────────────────────────

export function getHistory(): Promise<FantasyHistoryEntry[]> {
  return apiFetch<FantasyHistoryEntry[]>('/fantasy/history');
}

export function getGameweekHistory(gameweekId: string): Promise<FantasyGameweekScore> {
  return apiFetch<FantasyGameweekScore>(
    `/fantasy/history/${encodeURIComponent(gameweekId)}`,
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export function getLeaderboard(seasonId?: string): Promise<SeasonLeaderboardRow[]> {
  const qs = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : '';
  return publicFetch<SeasonLeaderboardRow[]>(`/fantasy/leaderboard${qs}`);
}

export function getGameweekLeaderboard(gameweekId: string): Promise<GameweekLeaderboardRow[]> {
  return publicFetch<GameweekLeaderboardRow[]>(
    `/fantasy/leaderboard/gameweek/${encodeURIComponent(gameweekId)}`,
  );
}
