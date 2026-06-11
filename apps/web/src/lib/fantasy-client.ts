import { apiUrl } from './api';
import { getToken } from './auth-client';

export type FantasySquadRole = 'STARTER' | 'SUBSTITUTE';
export type PlayerPosition = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

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

export interface FantasyTeamPlayer {
  id: string;
  playerId: string;
  squadRole: FantasySquadRole;
  position: PlayerPosition;
  benchSlot: number | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  player: PlayerSummary & { team: { id: string; name: string; shortName: string } };
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
  squadCounts: { goalkeepers: number; defenders: number; midfielders: number; forwards: number };
  starterCounts: { goalkeepers: number; defenders: number; midfielders: number; forwards: number };
  formation: string | null;
  benchSummary: string;
  captainValid: boolean;
  viceCaptainValid: boolean;
  maxPerTeamValid: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  totalPoints: number;
  user: { id: string };
  _count: { players: number };
}

export interface FixturePlayerPool {
  source: 'CONFIRMED_LINEUP' | 'PROVISIONAL';
  players: (PlayerSummary & { lineupStatus?: string })[];
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}

async function handleError(res: Response) {
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string; errors?: string[] };
    const msg = Array.isArray(body.errors) ? body.errors.join(', ') : (body.message ?? `HTTP ${res.status}`);
    throw new Error(msg);
  }
}

export const fantasyClient = {
  // ── Player pool ────────────────────────────────────────────────────────────

  async getPlayerPool(position?: PlayerPosition): Promise<PlayerSummary[]> {
    const url = apiUrl('/fantasy/player-pool') + (position ? `?position=${position}` : '');
    const res = await fetch(url);
    await handleError(res);
    return res.json() as Promise<PlayerSummary[]>;
  },

  async getPlayerPoolForFixture(fixtureId: string): Promise<FixturePlayerPool> {
    const res = await fetch(apiUrl(`/fantasy/player-pool/${fixtureId}`));
    await handleError(res);
    return res.json() as Promise<FixturePlayerPool>;
  },

  // ── My team ────────────────────────────────────────────────────────────────

  async getMyTeam(): Promise<FantasyTeam> {
    const res = await authFetch(apiUrl('/fantasy/team/me'));
    await handleError(res);
    return res.json() as Promise<FantasyTeam>;
  },

  async createTeam(name: string, players: FantasyPlayerSlot[]): Promise<FantasyTeam> {
    const res = await authFetch(apiUrl('/fantasy/team/me'), {
      method: 'POST',
      body: JSON.stringify({ name, players }),
    });
    await handleError(res);
    return res.json() as Promise<FantasyTeam>;
  },

  async updateTeam(data: { name?: string; formation?: string }): Promise<FantasyTeam> {
    const res = await authFetch(apiUrl('/fantasy/team/me'), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    await handleError(res);
    return res.json() as Promise<FantasyTeam>;
  },

  // ── Granular player management ─────────────────────────────────────────────

  async addPlayer(slot: FantasyPlayerSlot): Promise<FantasyTeam> {
    const res = await authFetch(apiUrl('/fantasy/team/me/players'), {
      method: 'POST',
      body: JSON.stringify(slot),
    });
    await handleError(res);
    return res.json() as Promise<FantasyTeam>;
  },

  async removePlayer(playerId: string): Promise<FantasyTeam> {
    const res = await authFetch(apiUrl(`/fantasy/team/me/players/${playerId}`), {
      method: 'DELETE',
    });
    await handleError(res);
    return res.json() as Promise<FantasyTeam>;
  },

  async updatePlayer(
    playerId: string,
    data: { squadRole?: FantasySquadRole; benchSlot?: number; isCaptain?: boolean; isViceCaptain?: boolean },
  ): Promise<FantasyTeam> {
    const res = await authFetch(apiUrl(`/fantasy/team/me/players/${playerId}`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    await handleError(res);
    return res.json() as Promise<FantasyTeam>;
  },

  // ── Transfers ──────────────────────────────────────────────────────────────

  async makeTransfer(removePlayerId: string, addPlayerId: string): Promise<FantasyTeam> {
    const res = await authFetch(apiUrl('/fantasy/team/me/transfers'), {
      method: 'POST',
      body: JSON.stringify({ removePlayerId, addPlayerId }),
    });
    await handleError(res);
    return res.json() as Promise<FantasyTeam>;
  },

  // ── Validation ─────────────────────────────────────────────────────────────

  async validateMySquad(): Promise<SquadValidation> {
    const res = await authFetch(apiUrl('/fantasy/team/me/validate'), { method: 'POST' });
    await handleError(res);
    return res.json() as Promise<SquadValidation>;
  },

  // ── Leaderboard ────────────────────────────────────────────────────────────

  async getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const res = await fetch(apiUrl(`/fantasy/leaderboard?limit=${limit}`));
    await handleError(res);
    return res.json() as Promise<LeaderboardEntry[]>;
  },
};
