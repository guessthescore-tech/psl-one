import { getBetaToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function adminHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getBetaToken()}` };
}

export async function getPriceCalibrationSeasons() {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/seasons`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPriceCalibrationOverview(seasonId: string) {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/${seasonId}/overview`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listPricedPlayers(seasonId: string) {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/${seasonId}/players`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listMissingPrices(seasonId: string) {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/${seasonId}/missing-prices`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listInvalidPrices(seasonId: string) {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/${seasonId}/invalid-prices`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updatePlayerPrice(seasonId: string, playerId: string, price: number) {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/${seasonId}/players/${playerId}`, {
    method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ price }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function bulkApplyDefaults(seasonId: string) {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/${seasonId}/bulk-apply-defaults`, {
    method: 'POST', headers: adminHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function validateCalibration(seasonId: string) {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/${seasonId}/validate`, {
    method: 'POST', headers: adminHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function publishCalibration(seasonId: string) {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/${seasonId}/publish`, {
    method: 'POST', headers: adminHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPriceCalibrationReadiness(seasonId: string) {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/${seasonId}/readiness`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPriceCalibrationActivationImpact(seasonId: string) {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/${seasonId}/activation-impact`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPriceCalibrationActivationDryRun(seasonId: string) {
  const res = await fetch(`${BASE}/admin/fantasy-price-calibration/${seasonId}/activation-dry-run`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
