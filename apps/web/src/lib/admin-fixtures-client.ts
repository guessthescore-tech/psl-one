function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('psl_access_token');
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface FixtureAssignmentDto {
  id: string;
  kickoffAt: string;
  status: string;
  round?: string;
  assignmentStatus: string;
  assignmentSource?: string;
  assignedAt?: string;
  gameweekId?: string;
  stageId?: string;
  homeScore?: number;
  awayScore?: number;
  homeTeam: { id: string; name: string; shortName: string; slug: string };
  awayTeam: { id: string; name: string; shortName: string; slug: string };
  gameweek?: { id: string; name: string; slug: string; round: number } | null;
  stage?: { id: string; name: string; slug: string; type: string } | null;
}

export interface AssignmentSummaryDto {
  seasonId: string;
  total: number;
  assigned: number;
  unassigned: number;
  byGameweek: { gameweekId: string; gameweekName: string; fixtureCount: number }[];
  byStage: { stageId: string; stageName: string; fixtureCount: number }[];
}

export interface AutoAssignResult {
  seasonId: string;
  total: number;
  assigned: number;
  skipped: number;
}

export function listUnassignedFixtures(seasonId: string): Promise<FixtureAssignmentDto[]> {
  return apiRequest<FixtureAssignmentDto[]>(`/admin/fixtures/unassigned?seasonId=${encodeURIComponent(seasonId)}`);
}

export function getAssignmentSummary(seasonId: string): Promise<AssignmentSummaryDto> {
  return apiRequest<AssignmentSummaryDto>(`/admin/fixtures/assignment-summary?seasonId=${encodeURIComponent(seasonId)}`);
}

export function assignFixtureToGameweek(fixtureId: string, gameweekId: string): Promise<FixtureAssignmentDto> {
  return apiRequest<FixtureAssignmentDto>(`/admin/fixtures/${fixtureId}/assign-gameweek`, {
    method: 'POST',
    body: JSON.stringify({ gameweekId }),
  });
}

export function assignFixtureToStage(fixtureId: string, stageId: string): Promise<FixtureAssignmentDto> {
  return apiRequest<FixtureAssignmentDto>(`/admin/fixtures/${fixtureId}/assign-stage`, {
    method: 'POST',
    body: JSON.stringify({ stageId }),
  });
}

export function bulkAssignGameweek(fixtureIds: string[], gameweekId: string) {
  return apiRequest<{ gameweekId: string; gameweekName: string; updatedCount: number }>(
    '/admin/fixtures/bulk-assign-gameweek',
    { method: 'POST', body: JSON.stringify({ fixtureIds, gameweekId }) },
  );
}

export function autoAssignFixtures(seasonId: string): Promise<AutoAssignResult> {
  return apiRequest<AutoAssignResult>('/admin/fixtures/auto-assign', {
    method: 'POST',
    body: JSON.stringify({ seasonId }),
  });
}
