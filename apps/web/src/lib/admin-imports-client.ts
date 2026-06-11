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

export type ImportJob = {
  id: string;
  source: string;
  sourceType: string;
  status: string;
  competitionId: string | null;
  seasonId: string | null;
  fileName: string | null;
  totalRecords: number;
  importedRecords: number;
  skippedRecords: number;
  failedRecords: number;
  errorsJson: unknown;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  previewCounts: {
    competitions: number;
    seasons: number;
    teams: number;
    venues: number;
    players: number;
    fixtures: number;
    groups: number;
    gameweeks: number;
  };
  detectedFormat: string;
  willActivateSeason: boolean;
  replaceMode: boolean;
};

export type CommitResult = {
  jobId: string;
  counts: ValidationResult['previewCounts'];
  errors: string[];
  status: string;
};

export function listImportJobs() {
  return apiFetch<ImportJob[]>('/admin/imports');
}

export function getImportJob(id: string) {
  return apiFetch<ImportJob>(`/admin/imports/${id}`);
}

export function validateImportPayload(payload: unknown) {
  return apiFetch<ValidationResult>('/admin/imports/validate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function commitImport(payload: unknown) {
  return apiFetch<CommitResult>('/admin/imports/commit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createDraftJob(payload: unknown) {
  return apiFetch<ImportJob>('/admin/imports/manual', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function retryJob(id: string) {
  return apiFetch<CommitResult>(`/admin/imports/${id}/retry`, { method: 'POST' });
}

export function cancelJob(id: string) {
  return apiFetch<ImportJob>(`/admin/imports/${id}/cancel`, { method: 'POST' });
}
