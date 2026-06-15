const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('psl_access_token') : null;
}

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface GameweekLockResult {
  gameweekId: string;
  gameweekName: string;
  locked: number;
}

export interface FixtureLockResult {
  fixtureId: string;
  predictionsLocked: number;
  skippedAlreadyLocked: number;
}

export interface FixtureVoidResult {
  fixtureId: string;
  predictionsVoided: number;
  skippedAlreadySettledOrVoid: number;
}

export interface FixtureSettleResult {
  fixtureId: string;
  predictionsSettled: number;
  challengesSettled: number;
  summary: { predictionId: string; userId: string; points: number }[];
}

export interface GameweekSettleResult {
  gameweekId: string;
  gameweekName: string;
  fixturesSettled: number;
  fixturesSkipped: number;
  totalPredictionsSettled: number;
  totalChallengesSettled: number;
  fixtures: { fixtureId: string; predictionsSettled: number; challengesSettled: number }[];
}

export interface FixtureLockState {
  fixtureId: string;
  isLocked: boolean;
  lockReason: 'GAMEWEEK_DEADLINE' | 'KICKOFF_PASSED' | 'FIXTURE_STARTED' | 'FIXTURE_FINISHED' | 'OPEN';
  fixtureKickoffAt: string;
  gameweekPredictionDeadlineAt: string | null;
  deadlineAt: string;
  serverTime: string;
}

export function getFixtureLockState(fixtureId: string): Promise<FixtureLockState> {
  return request<FixtureLockState>(`/predictions/fixtures/${fixtureId}/lock-state`);
}

export function lockFixture(fixtureId: string): Promise<FixtureLockResult> {
  return request<FixtureLockResult>(`/predictions/admin/lock-fixture/${fixtureId}`, 'POST');
}

export function voidFixture(fixtureId: string): Promise<FixtureVoidResult> {
  return request<FixtureVoidResult>(`/predictions/admin/void-fixture/${fixtureId}`, 'POST');
}

export function settleFixture(fixtureId: string): Promise<FixtureSettleResult> {
  return request<FixtureSettleResult>(`/predictions/admin/settle-fixture/${fixtureId}`, 'POST');
}

export function lockGameweek(gameweekId: string, force = false): Promise<GameweekLockResult> {
  const path = force
    ? `/predictions/admin/lock-gameweek/${gameweekId}/force`
    : `/predictions/admin/lock-gameweek/${gameweekId}`;
  return request<GameweekLockResult>(path, 'POST');
}

export function settleGameweek(gameweekId: string): Promise<GameweekSettleResult> {
  return request<GameweekSettleResult>(`/predictions/admin/settle-gameweek/${gameweekId}`, 'POST');
}
