import { apiUrl } from './api';
import { getToken } from './auth-client';

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(apiUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────

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

export interface Chip {
  id: string;
  type: ChipType;
  status: ChipStatus;
  gameweekId: string | null;
  activatedAt: string | null;
  usedAt: string | null;
}

export interface PlayerPriceInfo {
  playerId: string;
  playerName: string;
  seasonId: string;
  currentPrice: number;
}

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

export interface Cup {
  id: string;
  name: string;
  seasonId: string;
  rounds: { id: string; roundName: string; gameweekId: string }[];
}

// ── Deadline ───────────────────────────────────────────────────────────────

export function getDeadline(seasonId: string): Promise<DeadlineInfo> {
  return request<DeadlineInfo>(`/fantasy/deadline?seasonId=${encodeURIComponent(seasonId)}`);
}

export function getGameweekDeadline(gameweekId: string): Promise<DeadlineInfo> {
  return request<DeadlineInfo>(`/fantasy/gameweeks/${gameweekId}/deadline`);
}

// ── Transfers ──────────────────────────────────────────────────────────────

export function getTransferStatus(): Promise<TransferStatus> {
  return request<TransferStatus>('/fantasy/transfers/status');
}

// ── Chips ──────────────────────────────────────────────────────────────────

export function getChips(): Promise<Chip[]> {
  return request<Chip[]>('/fantasy/chips');
}

export function activateChip(chipId: string, gameweekId: string): Promise<Chip> {
  return request<Chip>(`/fantasy/chips/${chipId}/activate`, 'POST', { gameweekId });
}

export function cancelChip(chipId: string): Promise<Chip> {
  return request<Chip>(`/fantasy/chips/${chipId}/cancel`, 'POST');
}

// ── Prices ─────────────────────────────────────────────────────────────────

export function getPlayerPrices(seasonId: string): Promise<PlayerPriceInfo[]> {
  return request<PlayerPriceInfo[]>(`/fantasy/player-prices?seasonId=${encodeURIComponent(seasonId)}`);
}

// ── Leagues ────────────────────────────────────────────────────────────────

export function getMyLeagues(): Promise<LeagueMembership[]> {
  return request<LeagueMembership[]>('/fantasy/leagues/me');
}

export function createPrivateLeague(data: { name: string; seasonId: string }): Promise<League> {
  return request<League>('/fantasy/leagues/private', 'POST', data);
}

export function joinLeagueByCode(inviteCode: string): Promise<LeagueMembership> {
  return request<LeagueMembership>('/fantasy/leagues/join', 'POST', { inviteCode });
}

export function joinPublicLeague(seasonId: string): Promise<LeagueMembership> {
  return request<LeagueMembership>('/fantasy/leagues/public/join', 'POST', { seasonId });
}

export function leaveLeague(leagueId: string): Promise<LeagueMembership> {
  return request<LeagueMembership>(`/fantasy/leagues/${leagueId}/leave`, 'POST');
}

export function getLeague(leagueId: string): Promise<League> {
  return request<League>(`/fantasy/leagues/${leagueId}`);
}

export function getLeagueStandings(leagueId: string): Promise<ClassicStandingsRow[]> {
  return request<ClassicStandingsRow[]>(`/fantasy/leagues/${leagueId}/standings`);
}

export function getH2HStandings(leagueId: string): Promise<H2HStandingsRow[]> {
  return request<H2HStandingsRow[]>(`/fantasy/leagues/${leagueId}/standings?type=h2h`);
}

export function adminListLeagues(params?: { seasonId?: string; type?: string }): Promise<(League & { _count: { members: number } })[]> {
  const qs = params ? new URLSearchParams(Object.entries(params).filter(([, v]) => v).map(([k, v]) => [k, v!])).toString() : '';
  return request<(League & { _count: { members: number } })[]>(`/fantasy/admin/leagues${qs ? '?' + qs : ''}`);
}

export function adminGetLeague(leagueId: string): Promise<League> {
  return request<League>(`/fantasy/admin/leagues/${leagueId}`);
}

export function adminEnsureGlobalLeagues(seasonId: string): Promise<{ teamsProcessed: number; membershipsCreated: number }> {
  return request(`/fantasy/admin/leagues/global/ensure/${encodeURIComponent(seasonId)}`, 'POST');
}

export function adminLockLeague(leagueId: string): Promise<League> {
  return request<League>(`/fantasy/admin/leagues/${leagueId}/lock`, 'POST');
}

export function adminUnlockLeague(leagueId: string): Promise<League> {
  return request<League>(`/fantasy/admin/leagues/${leagueId}/unlock`, 'POST');
}

// ── Gameweek Scoring ──────────────────────────────────────────────────────

export interface GameweekScoreSummary {
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

export interface GameweekScoreDetail extends GameweekScoreSummary {
  playerScores: PlayerGameweekScore[];
}

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

export function getGameweekScore(gameweekId: string): Promise<GameweekScoreDetail> {
  return request<GameweekScoreDetail>(`/fantasy/gameweeks/${gameweekId}/score`);
}

export function getGameweekHistory(): Promise<GameweekScoreSummary[]> {
  return request<GameweekScoreSummary[]>('/fantasy/history');
}

export function getGameweekHistoryDetail(gameweekId: string): Promise<GameweekScoreDetail> {
  return request<GameweekScoreDetail>(`/fantasy/history/${gameweekId}`);
}

export function getGameweekLeaderboard(gameweekId: string): Promise<GameweekLeaderboardRow[]> {
  return request<GameweekLeaderboardRow[]>(`/fantasy/leaderboard/gameweek/${gameweekId}`);
}

export function getSeasonLeaderboard(seasonId: string): Promise<SeasonLeaderboardRow[]> {
  return request<SeasonLeaderboardRow[]>(`/fantasy/leaderboard/season/${seasonId}`);
}

// ── Auto-substitutions ─────────────────────────────────────────────────────

export type AutoSubStatus =
  | 'APPLIED'
  | 'SKIPPED_NO_ELIGIBLE_SUB'
  | 'SKIPPED_FORMATION_INVALID'
  | 'SKIPPED_BENCH_PLAYER_DID_NOT_PLAY'
  | 'SKIPPED_GOALKEEPER_ONLY'
  | 'SKIPPED_STARTER_PLAYED';

export interface AutoSubEntry {
  outPlayerId: string;
  outPlayerName: string;
  inPlayerId: string | null;
  inPlayerName: string | null;
  status: AutoSubStatus;
  reason: string;
  benchPriority: number | null;
  formationBefore: string | null;
  formationAfter: string | null;
}

export interface AutoSubResult {
  fantasyTeamId: string;
  gameweekId: string;
  formationBefore: string;
  formationAfter: string;
  substitutions: AutoSubEntry[];
}

export interface FinalXiPlayer {
  playerId: string;
  playerName: string;
  position: string;
  originalRole: 'STARTER' | 'SUBSTITUTE';
  finalRole: 'STARTER' | 'SUBSTITUTE';
  played: boolean;
  countedInTotal: boolean;
  reason: string;
  benchPriority: number | null;
}

export interface FinalXiResult {
  fantasyTeamId: string;
  gameweekId: string;
  formation: string;
  players: FinalXiPlayer[];
}

export function getAutoSubs(gameweekId: string): Promise<AutoSubResult> {
  return request<AutoSubResult>(`/fantasy/gameweeks/${gameweekId}/auto-subs`);
}

export function getFinalXi(gameweekId: string): Promise<FinalXiResult> {
  return request<FinalXiResult>(`/fantasy/gameweeks/${gameweekId}/final-xi`);
}

export function adminApplyAutoSubsForGameweek(gameweekId: string): Promise<{ gameweekId: string; teamsProcessed: number; totalApplied: number; errors: string[] }> {
  return request(`/fantasy/admin/auto-subs/gameweeks/${gameweekId}/apply`, 'POST');
}

export function adminRecalculateTeamAutoSubs(fantasyTeamId: string, gameweekId: string): Promise<AutoSubResult> {
  return request(`/fantasy/admin/auto-subs/teams/${fantasyTeamId}/gameweeks/${gameweekId}/recalculate`, 'POST');
}

export function adminGetAutoSubsForGameweek(gameweekId: string): Promise<unknown[]> {
  return request(`/fantasy/admin/auto-subs/gameweeks/${gameweekId}`);
}

export function adminSettleGameweek(gameweekId: string): Promise<{ gameweekId: string; teamsSettled: number; errors: string[] }> {
  return request(`/fantasy/admin/scoring/gameweeks/${gameweekId}/settle`, 'POST');
}

export function adminRecalculateGameweek(gameweekId: string): Promise<{ gameweekId: string; teamsSettled: number; errors: string[] }> {
  return request(`/fantasy/admin/scoring/gameweeks/${gameweekId}/recalculate`, 'POST');
}

export function adminRecalculateTeamGameweek(fantasyTeamId: string, gameweekId: string) {
  return request(`/fantasy/admin/scoring/teams/${fantasyTeamId}/gameweeks/${gameweekId}/recalculate`, 'POST');
}

// ── Cups ───────────────────────────────────────────────────────────────────

export function getMyCups(): Promise<Cup[]> {
  return request<Cup[]>('/fantasy/cups/me');
}

export function getCup(cupId: string): Promise<Cup> {
  return request<Cup>(`/fantasy/cups/${cupId}`);
}

// ── Rules config ───────────────────────────────────────────────────────────

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

export interface RulesValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RulesConfigEntry {
  id: string;
  seasonId: string;
  season: { id: string; name: string; isActive: boolean };
}

export function getFantasyRules(): Promise<FantasyRules> {
  return request<FantasyRules>('/fantasy/rules');
}

export function adminListRulesConfigs(): Promise<RulesConfigEntry[]> {
  return request<RulesConfigEntry[]>('/fantasy/admin/rules');
}

export function adminGetRulesForSeason(seasonId: string): Promise<FantasyRules> {
  return request<FantasyRules>(`/fantasy/admin/rules/${encodeURIComponent(seasonId)}`);
}

export function adminCreateDefaultRules(seasonId: string): Promise<FantasyRules> {
  return request<FantasyRules>(`/fantasy/admin/rules/${encodeURIComponent(seasonId)}/default`, 'POST');
}

export function adminUpdateRules(seasonId: string, dto: Partial<FantasyRules>): Promise<FantasyRules> {
  return request<FantasyRules>(`/fantasy/admin/rules/${encodeURIComponent(seasonId)}`, 'PATCH', dto);
}

export function adminResetRules(seasonId: string): Promise<FantasyRules> {
  return request<FantasyRules>(`/fantasy/admin/rules/${encodeURIComponent(seasonId)}/reset-defaults`, 'POST');
}

export function adminValidateRules(dto: Partial<FantasyRules>): Promise<RulesValidationResult> {
  return request<RulesValidationResult>('/fantasy/admin/validate-rules', 'POST', dto);
}
