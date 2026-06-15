const API = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

async function apiFetch<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// Batch CRUD
export const listImportBatches = (seasonId?: string, token?: string) =>
  apiFetch<unknown[]>(`/fixtures/admin/imports${seasonId ? `?seasonId=${seasonId}` : ''}`, {}, token);

export const createImportBatch = (body: Record<string, unknown>, token?: string) =>
  apiFetch<unknown>('/fixtures/admin/imports', { method: 'POST', body: JSON.stringify(body) }, token);

export const getImportBatch = (batchId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/imports/${batchId}`, {}, token);

export const deleteImportBatch = (batchId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/imports/${batchId}`, { method: 'DELETE' }, token);

export const getImportBatchSummary = (batchId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/imports/${batchId}/summary`, {}, token);

// Rows
export const getBatchRows = (batchId: string, token?: string) =>
  apiFetch<unknown[]>(`/fixtures/admin/imports/${batchId}/rows`, {}, token);

export const addBatchRow = (batchId: string, body: Record<string, unknown>, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/imports/${batchId}/rows`, { method: 'POST', body: JSON.stringify(body) }, token);

export const updateBatchRow = (batchId: string, rowId: string, body: Record<string, unknown>, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/imports/${batchId}/rows/${rowId}`, { method: 'PATCH', body: JSON.stringify(body) }, token);

export const deleteBatchRow = (batchId: string, rowId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/imports/${batchId}/rows/${rowId}`, { method: 'DELETE' }, token);

// Lifecycle
export const validateBatch = (batchId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/imports/${batchId}/validate`, { method: 'POST' }, token);

export const commitBatch = (batchId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/imports/${batchId}/commit`, { method: 'POST' }, token);

export const publishBatch = (batchId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/imports/${batchId}/publish`, { method: 'POST' }, token);

export const rejectBatch = (batchId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/imports/${batchId}/reject`, { method: 'POST' }, token);

// Batch-level validation results
export const getBatchValidation = (batchId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/imports/${batchId}/validation`, {}, token);

// Season-level
export const getSeasonValidation = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/validation/season/${seasonId}`, {}, token);

export const getSeasonConflicts = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/conflicts/season/${seasonId}`, {}, token);

export const getGameweekReadiness = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/gameweeks/season/${seasonId}/readiness`, {}, token);

export const autoCreateGameweeks = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/gameweeks/season/${seasonId}/auto-create`, { method: 'POST' }, token);

export const assignFixturesByRound = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/gameweeks/season/${seasonId}/assign-by-round`, { method: 'POST' }, token);

export const getPublishingReadiness = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/publishing/season/${seasonId}/readiness`, {}, token);

export const publishProvisionalFixtures = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/publishing/season/${seasonId}/publish-provisional`, { method: 'POST' }, token);

export const unpublishProvisionalFixtures = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/fixtures/admin/publishing/season/${seasonId}/unpublish-provisional`, { method: 'POST' }, token);
