const API = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

async function authFetch(path: string, token: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || res.statusText);
  }
  return res.json();
}

// ── Fan: reward claim & redemption routes ────────────────────────────────

export function fanListRewards(token: string) {
  return authFetch('/fan/rewards', token);
}

export function fanGetReward(token: string, id: string) {
  return authFetch(`/fan/rewards/${id}`, token);
}

export function fanClaimReward(token: string, rewardId: string, data: { idempotencyKey: string }) {
  return authFetch(`/fan/rewards/${rewardId}/claim`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fanRedeemReward(token: string, rewardId: string) {
  return authFetch(`/fan/rewards/${rewardId}/redeem`, token, { method: 'POST' });
}

// ── Admin: reward definition & issuance routes ───────────────────────────

export function adminListRewardDefinitions(token: string) {
  return authFetch('/admin/reward-definitions', token);
}

export function adminCreateRewardDefinition(token: string, data: Record<string, unknown>) {
  return authFetch('/admin/reward-definitions', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function adminUpdateRewardDefinition(token: string, id: string, data: Record<string, unknown>) {
  return authFetch(`/admin/reward-definitions/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function adminListFanRewards(token: string, params?: { fanUserId?: string; status?: string }) {
  const q = new URLSearchParams();
  if (params?.fanUserId) q.set('fanUserId', params.fanUserId);
  if (params?.status) q.set('status', params.status);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return authFetch(`/admin/rewards${qs}`, token);
}
