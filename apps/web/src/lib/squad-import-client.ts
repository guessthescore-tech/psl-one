import { getBetaToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function adminHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getBetaToken()}` };
}

export async function getImportSeasons() {
  const res = await fetch(`${BASE}/admin/squad-import/seasons`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getImportOverview(seasonId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/overview`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listBatches(seasonId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/batches`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getBatch(seasonId: string, batchId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/batches/${batchId}`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listRows(seasonId: string, batchId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/batches/${batchId}/rows`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createManualBatch(seasonId: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/batches`, {
    method: 'POST', headers: adminHeaders(), body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function validateBatch(seasonId: string, batchId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/batches/${batchId}/validate`, {
    method: 'POST', headers: adminHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function importBatch(seasonId: string, batchId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/batches/${batchId}/import`, {
    method: 'POST', headers: adminHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function publishBatch(seasonId: string, batchId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/batches/${batchId}/publish`, {
    method: 'POST', headers: adminHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function cancelBatch(seasonId: string, batchId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/batches/${batchId}/cancel`, {
    method: 'POST', headers: adminHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getDuplicates(seasonId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/duplicates`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getImportReadiness(seasonId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/readiness`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getActivationImpact(seasonId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/activation-impact`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getActivationDryRun(seasonId: string) {
  const res = await fetch(`${BASE}/admin/squad-import/${seasonId}/activation-dry-run`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
