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

// ── Allocation ────────────────────────────────────────────────────────────────

export function fanGetAllocation(token: string, gameweekId: string) {
  return authFetch(`/social-predictions/allocation?gameweekId=${gameweekId}`, token);
}

// ── Marketplace ───────────────────────────────────────────────────────────────

export function fanGetMarketplace(token: string, fixtureId: string) {
  return authFetch(`/social-predictions/marketplace/${fixtureId}`, token);
}

export function fanGetFixtureMarket(token: string, marketId: string) {
  return authFetch(`/social-predictions/markets/${marketId}`, token);
}

export function fanGetMarketplaceListings(token: string, marketId: string) {
  return authFetch(`/social-predictions/markets/${marketId}/listings`, token);
}

// ── My Listings ───────────────────────────────────────────────────────────────

export function fanGetMyListings(token: string) {
  return authFetch('/social-predictions/listings', token);
}

export function fanGetListing(token: string, id: string) {
  return authFetch(`/social-predictions/listings/${id}`, token);
}

export function fanCreateListing(token: string, data: Record<string, unknown>) {
  return authFetch('/social-predictions/listings', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fanWithdrawListing(token: string, id: string) {
  return authFetch(`/social-predictions/listings/${id}`, token, { method: 'DELETE' });
}

export function fanAcceptListing(token: string, id: string, data: Record<string, unknown>) {
  return authFetch(`/social-predictions/listings/${id}/accept`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Direct Friend Challenges ──────────────────────────────────────────────────

export function fanGetIncomingChallenges(token: string) {
  return authFetch('/social-predictions/challenges/incoming', token);
}

export function fanGetOutgoingChallenges(token: string) {
  return authFetch('/social-predictions/challenges/outgoing', token);
}

export function fanCreateDirectChallenge(token: string, listingId: string, challengedUserId: string) {
  return authFetch(`/social-predictions/listings/${listingId}/challenge`, token, {
    method: 'POST',
    body: JSON.stringify({ challengedUserId }),
  });
}

export function fanAcceptDirectChallenge(token: string, listingId: string) {
  return authFetch(`/social-predictions/listings/${listingId}/challenge/accept`, token, { method: 'POST' });
}

export function fanDeclineDirectChallenge(token: string, listingId: string) {
  return authFetch(`/social-predictions/listings/${listingId}/challenge/decline`, token, { method: 'POST' });
}

export function fanWithdrawDirectChallenge(token: string, listingId: string) {
  return authFetch(`/social-predictions/listings/${listingId}/challenge/withdraw`, token, { method: 'POST' });
}

export function fanGetShareLink(token: string, listingId: string) {
  return authFetch(`/social-predictions/listings/${listingId}/share-link`, token);
}

// ── Leaderboard & Ledger ─────────────────────────────────────────────────────

export function fanGetSocialLeaderboard(token: string, params: { seasonId: string; gameweekId?: string }) {
  const q = new URLSearchParams({ seasonId: params.seasonId });
  if (params.gameweekId) q.set('gameweekId', params.gameweekId);
  return authFetch(`/social-predictions/leaderboard?${q.toString()}`, token);
}

export function fanGetMyLedger(token: string, seasonId?: string) {
  const qs = seasonId ? `?seasonId=${seasonId}` : '';
  return authFetch(`/social-predictions/ledger${qs}`, token);
}
