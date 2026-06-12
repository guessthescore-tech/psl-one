const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const DEV_TOKEN = 'dev-token';

function headers() {
  return { Authorization: `Bearer ${DEV_TOKEN}`, 'Content-Type': 'application/json' };
}

export async function listPredictionCalibrationSeasons() {
  const res = await fetch(`${API}/predictions/admin/calibration`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to list prediction calibration seasons');
  return res.json();
}

export async function getPredictionCalibrationReadiness(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/readiness`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to get prediction calibration readiness');
  return res.json();
}

export async function getPredictionRules(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/rules`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to get prediction rules');
  return res.json();
}

export async function createProvisionalPredictionRules(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/rules`, {
    method: 'POST',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Failed to create provisional prediction rules');
  return res.json();
}

export async function updatePredictionRules(seasonId: string, dto: Record<string, unknown>) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/rules`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to update prediction rules');
  return res.json();
}

export async function getPredictionFixtureEligibility(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/fixture-eligibility`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to get fixture eligibility');
  return res.json();
}

export async function getPredictionLockReadiness(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/lock-readiness`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to get lock readiness');
  return res.json();
}

export async function getPredictionSettlementReadiness(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/settlement-readiness`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to get settlement readiness');
  return res.json();
}

export async function getPeerChallengeReadiness(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/peer-challenge-readiness`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to get peer challenge readiness');
  return res.json();
}

export async function getPredictionActivationImpact(seasonId: string) {
  const res = await fetch(`${API}/predictions/admin/calibration/${seasonId}/activation-impact`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to get activation impact');
  return res.json();
}

// Fan-facing: list prediction-eligible fixtures
export async function listEligibleFixtures(seasonSlug?: string) {
  const url = seasonSlug
    ? `${API}/predictions/fixtures?seasonSlug=${encodeURIComponent(seasonSlug)}`
    : `${API}/predictions/fixtures`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error('Failed to list eligible fixtures');
  return res.json();
}

// Fan-facing: single fixture eligibility check
export async function getFixtureEligibility(fixtureId: string) {
  const res = await fetch(`${API}/predictions/fixtures/${fixtureId}/eligibility`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to get fixture eligibility');
  return res.json();
}
