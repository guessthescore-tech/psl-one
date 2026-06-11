const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface Gameweek {
  id: string;
  name: string;
  slug: string;
  round: number;
  status: 'UPCOMING' | 'OPEN' | 'LOCKED' | 'LIVE' | 'COMPLETED';
  startsAt: string;
  endsAt: string;
  transferDeadlineAt: string;
  predictionDeadlineAt: string;
  _count: { fixtures: number };
}

export interface LockState {
  gameweekId: string;
  name: string;
  status: string;
  transferLocked: boolean;
  predictionLocked: boolean;
  transferDeadlineAt: string;
  predictionDeadlineAt: string;
}

export interface GameweekFixture {
  id: string;
  kickoffAt: string;
  status: string;
  round: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { id: string; name: string; shortName: string };
  awayTeam: { id: string; name: string; shortName: string };
  venue: { id: string; name: string; city: string } | null;
}

export interface GameweekWithFixtures {
  id: string;
  name: string;
  fixtures: GameweekFixture[];
}

async function handleError(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? res.statusText);
  }
}

export const gameweeksClient = {
  async getAll(): Promise<Gameweek[]> {
    const res = await fetch(`${API}/gameweeks`);
    await handleError(res);
    return res.json();
  },

  async getActive(): Promise<Gameweek> {
    const res = await fetch(`${API}/gameweeks/active`);
    await handleError(res);
    return res.json();
  },

  async getOne(id: string): Promise<Gameweek> {
    const res = await fetch(`${API}/gameweeks/${id}`);
    await handleError(res);
    return res.json();
  },

  async getFixtures(id: string): Promise<GameweekWithFixtures> {
    const res = await fetch(`${API}/gameweeks/${id}/fixtures`);
    await handleError(res);
    return res.json();
  },

  async getLockState(id: string): Promise<LockState> {
    const res = await fetch(`${API}/gameweeks/${id}/lock-state`);
    await handleError(res);
    return res.json();
  },
};
