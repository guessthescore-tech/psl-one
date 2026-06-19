/**
 * Fantasy API client for the experience app.
 * Calls the PSL One backend API (LIVE_BETA_DATA mode).
 * In DESIGN_REVIEW_DATA mode, pages use mock data from data.ts instead.
 *
 * Points only — no real money or financial value.
 */

import { getToken } from '@/lib/auth';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000';

export type PlayerPosition = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
export type FantasySquadRole = 'STARTER' | 'SUBSTITUTE';
export type ChipType = 'WILDCARD' | 'BENCH_BOOST' | 'TRIPLE_CAPTAIN' | 'FREE_HIT';
export type ChipStatus = 'AVAILABLE' | 'ACTIVE' | 'USED' | 'EXPIRED';
export type LockReason = 'DEADLINE_PASSED' | 'SEASON_INACTIVE' | 'ADMIN_LOCK';

export interface PlayerSummary {
  id: string;
  name: string;
  position: PlayerPosition;
  club: string;
  clubShort: string;
  price: number;
  points: number;
  form: number;
  ownership: number;
  goalsThisTournament: number;
  assistsThisTournament: number;
  cleanSheetsThisTournament: number;
}

export interface FantasyTeamPlayer extends PlayerSummary {
  isCaptain: boolean;
  isViceCaptain: boolean;
  squadRole: FantasySquadRole;
  benchSlot: number | null;
}

export interface FantasyTeam {
  id: string;
  teamName: string;
  totalPoints: number;
  gameweekPoints: number;
  rank: number;
  transfersRemaining: number;
  budget: number;
  formation: string;
  players: FantasyTeamPlayer[];
  isLocked: boolean;
  lockReason?: LockReason;
}

export interface DeadlineInfo {
  gameweekNumber: number;
  gameweekLabel: string;
  deadlineAt: string;
  isLocked: boolean;
  lockReason?: LockReason;
}

export interface TransferStatus {
  freeTransfers: number;
  additionalTransferCost: number;
  isWildcardActive: boolean;
  isFreeHitActive: boolean;
}

export interface Chip {
  type: ChipType;
  status: ChipStatus;
  usedInGameweek?: number;
}

export interface SquadValidation {
  isValid: boolean;
  errors: string[];
  totalValue: number;
  budgetRemaining: number;
}

export interface FantasyRules {
  budget: number;
  maxFromSameClub: number;
  starterCount: number;
  substituteCount: number;
  formations: string[];
  transferHitCost: number;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function getTeam(): Promise<FantasyTeam> {
  return apiFetch<FantasyTeam>('/fantasy/team');
}

export async function getPlayerPool(position?: PlayerPosition): Promise<PlayerSummary[]> {
  const qs = position ? `?position=${position}` : '';
  return apiFetch<PlayerSummary[]>(`/fantasy/players${qs}`);
}

export interface TransferPayload {
  outPlayerId: string;
  inPlayerId: string;
}

export async function makeTransfers(transfers: TransferPayload[]): Promise<void> {
  await apiFetch('/fantasy/transfers', {
    method: 'POST',
    body: JSON.stringify({ transfers }),
  });
}

export async function validateSquad(playerIds: string[]): Promise<SquadValidation> {
  return apiFetch<SquadValidation>('/fantasy/validate', {
    method: 'POST',
    body: JSON.stringify({ playerIds }),
  });
}

export async function createTeam(payload: {
  teamName: string;
  formation: string;
  playerIds: string[];
  captainId: string;
  viceCaptainId: string;
}): Promise<FantasyTeam> {
  return apiFetch<FantasyTeam>('/fantasy/team', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getDeadline(): Promise<DeadlineInfo> {
  return apiFetch<DeadlineInfo>('/fantasy/deadline');
}

export async function getTransferStatus(): Promise<TransferStatus> {
  return apiFetch<TransferStatus>('/fantasy/transfers/status');
}

export async function getChips(): Promise<Chip[]> {
  return apiFetch<Chip[]>('/fantasy/chips');
}

export async function activateChip(type: ChipType): Promise<void> {
  await apiFetch('/fantasy/chips/activate', {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
}

export async function cancelChip(type: ChipType): Promise<void> {
  await apiFetch('/fantasy/chips/cancel', {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
}

export async function addPlayer(playerId: string, role: FantasySquadRole): Promise<void> {
  await apiFetch('/fantasy/team/players', {
    method: 'POST',
    body: JSON.stringify({ playerId, role }),
  });
}

export async function removePlayer(playerId: string): Promise<void> {
  await apiFetch(`/fantasy/team/players/${playerId}`, { method: 'DELETE' });
}

export async function updatePlayer(playerId: string, updates: {
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  squadRole?: FantasySquadRole;
  benchSlot?: number;
}): Promise<void> {
  await apiFetch(`/fantasy/team/players/${playerId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function getFantasyRules(): Promise<FantasyRules> {
  return apiFetch<FantasyRules>('/fantasy/rules');
}
