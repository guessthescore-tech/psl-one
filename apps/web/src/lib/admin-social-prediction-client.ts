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

// ── Market Configs ────────────────────────────────────────────────────────────

export function adminListMarketConfigs(token: string, seasonId: string) {
  return authFetch(`/admin/social-predictions/market-configs?seasonId=${seasonId}`, token);
}

export function adminCreateMarketConfig(token: string, data: Record<string, unknown>) {
  return authFetch('/admin/social-predictions/market-configs', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function adminToggleMarketConfig(token: string, id: string, isEnabled: boolean) {
  return authFetch(`/admin/social-predictions/market-configs/${id}/toggle`, token, {
    method: 'PATCH',
    body: JSON.stringify({ isEnabled }),
  });
}

// ── Fixture Markets ───────────────────────────────────────────────────────────

export function adminListFixtureMarkets(token: string, fixtureId: string) {
  return authFetch(`/admin/social-predictions/fixtures/${fixtureId}/markets`, token);
}

export function adminGenerateFixtureMarkets(token: string, fixtureId: string, data: Record<string, unknown>) {
  return authFetch(`/admin/social-predictions/fixtures/${fixtureId}/markets`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function adminOpenMarket(token: string, marketId: string) {
  return authFetch(`/admin/social-predictions/markets/${marketId}/open`, token, { method: 'PATCH' });
}

export function adminLockMarket(token: string, marketId: string) {
  return authFetch(`/admin/social-predictions/markets/${marketId}/lock`, token, { method: 'PATCH' });
}

export function adminSettleMarket(token: string, marketId: string, settledOutcome: string) {
  return authFetch(`/admin/social-predictions/markets/${marketId}/settle`, token, {
    method: 'PATCH',
    body: JSON.stringify({ settledOutcome }),
  });
}

export function adminVoidMarket(token: string, marketId: string, reason: string) {
  return authFetch(`/admin/social-predictions/markets/${marketId}/void`, token, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

// ── Allocations ───────────────────────────────────────────────────────────────

export function adminGrantAllocation(token: string, data: Record<string, unknown>) {
  return authFetch('/admin/social-predictions/allocations/grant', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function adminAdjustAllocation(
  token: string,
  fanUserId: string,
  gameweekId: string,
  data: Record<string, unknown>,
) {
  return authFetch(`/admin/social-predictions/allocations/${fanUserId}/${gameweekId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ── Listings ──────────────────────────────────────────────────────────────────

export function adminListAllListings(
  token: string,
  params?: { fixtureMarketId?: string; status?: string; fanUserId?: string },
) {
  const q = new URLSearchParams();
  if (params?.fixtureMarketId) q.set('fixtureMarketId', params.fixtureMarketId);
  if (params?.status) q.set('status', params.status);
  if (params?.fanUserId) q.set('fanUserId', params.fanUserId);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return authFetch(`/admin/social-predictions/listings${qs}`, token);
}

export function adminGetListing(token: string, id: string) {
  return authFetch(`/admin/social-predictions/listings/${id}`, token);
}

export function adminVoidMatch(token: string, matchId: string, reason: string) {
  return authFetch(`/admin/social-predictions/matches/${matchId}/void`, token, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

// ── Compliance ────────────────────────────────────────────────────────────────

export function adminGetComplianceStatus(token: string) {
  return authFetch('/admin/social-predictions/compliance', token);
}
