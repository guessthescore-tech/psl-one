const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('psl_access_token');
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ────────────────────────────────────────────────────────────────────

export type AdminCompetition = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  format: string;
  teamCount: number | null;
  hasGroups: boolean;
  hasKnockouts: boolean;
  hasHomeAway: boolean;
  usesNeutralVenues: boolean;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  source: string | null;
  externalId: string | null;
  sourceUrl: string | null;
  _count: { seasons: number; stages: number };
  stages?: { id: string; name: string; type: string; order: number }[];
};

export type AdminSeason = {
  id: string;
  competitionId: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: string;
  source: string | null;
  externalId: string | null;
  sourceUrl: string | null;
  importedAt: string | null;
  _count: { fixtures: number };
};

export type CreateCompetitionPayload = {
  name: string;
  slug: string;
  format: string;
  hasGroups: boolean;
  hasKnockouts: boolean;
  hasHomeAway: boolean;
  usesNeutralVenues: boolean;
  teamCount?: number;
  logoUrl?: string;
};

export type CreateSeasonPayload = {
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
};

// ── Competitions ──────────────────────────────────────────────────────────────

export function listAdminCompetitions() {
  return apiFetch<AdminCompetition[]>('/admin/competitions');
}

export function createCompetition(payload: CreateCompetitionPayload) {
  return apiFetch<AdminCompetition>('/admin/competitions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCompetition(id: string, payload: Partial<CreateCompetitionPayload>) {
  return apiFetch<AdminCompetition>(`/admin/competitions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// ── Seasons ───────────────────────────────────────────────────────────────────

export function listAdminSeasons(competitionId: string) {
  return apiFetch<AdminSeason[]>(`/admin/competitions/${competitionId}/seasons`);
}

export function createSeason(competitionId: string, payload: CreateSeasonPayload) {
  return apiFetch<AdminSeason>(`/admin/competitions/${competitionId}/seasons`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function activateSeason(seasonId: string) {
  return apiFetch<AdminSeason>(`/admin/seasons/${seasonId}/activate`, {
    method: 'POST',
  });
}
