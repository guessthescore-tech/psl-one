import { getToken } from './auth-client';

const API = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function authedHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function listPredictionCalibrationSeasons() {
  const res = await fetch(`${API}/predictions/admin/calibration`, { headers: authedHeaders() });
  if (!res.ok) throw new Error('Failed to list prediction calibration seasons');
  return res.json();
}

export async function getPredictionCalibrationReadiness(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/readiness`, { headers: authedHeaders() });
  if (!res.ok) throw new Error('Failed to get prediction calibration readiness');
  return res.json();
}

export async function getPredictionRules(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/rules`, { headers: authedHeaders() });
  if (!res.ok) throw new Error('Failed to get prediction rules');
  return res.json();
}

export async function createProvisionalPredictionRules(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/rules`, {
    method: 'POST',
    headers: authedHeaders(),
  });
  if (!res.ok) throw new Error('Failed to create provisional prediction rules');
  return res.json();
}

export async function updatePredictionRules(seasonId: string, dto: Record<string, unknown>) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/rules`, {
    method: 'PATCH',
    headers: authedHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to update prediction rules');
  return res.json();
}

export async function getPredictionFixtureEligibility(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/fixture-eligibility`, { headers: authedHeaders() });
  if (!res.ok) throw new Error('Failed to get fixture eligibility');
  return res.json();
}

export async function getPredictionLockReadiness(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/lock-readiness`, { headers: authedHeaders() });
  if (!res.ok) throw new Error('Failed to get lock readiness');
  return res.json();
}

export async function getPredictionSettlementReadiness(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/settlement-readiness`, { headers: authedHeaders() });
  if (!res.ok) throw new Error('Failed to get settlement readiness');
  return res.json();
}

export async function getPeerChallengeReadiness(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/peer-challenge-readiness`, { headers: authedHeaders() });
  if (!res.ok) throw new Error('Failed to get peer challenge readiness');
  return res.json();
}

export async function getPredictionActivationImpact(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/activation-impact`, { headers: authedHeaders() });
  if (!res.ok) throw new Error('Failed to get activation impact');
  return res.json();
}

export async function listEligibleFixtures(seasonSlug?: string) {
  const url = seasonSlug
    ? `${API}/predictions/fixtures?seasonSlug=${encodeURIComponent(seasonSlug)}`
    : `${API}/predictions/fixtures`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to list eligible fixtures');
  return res.json();
}

export async function getFixtureEligibility(fixtureId: string) {
  const res = await fetch(`${API}/predictions/fixtures/${fixtureId}/eligibility`);
  if (!res.ok) throw new Error('Failed to get fixture eligibility');
  return res.json();
}
