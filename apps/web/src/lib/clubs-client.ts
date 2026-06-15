const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || res.statusText);
  }
  return res.json();
}

async function adminFetch(path: string, token: string, options?: RequestInit) {
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

// ── Fan: public club routes ───────────────────────────────────────────────

export function getClubs(seasonSlug?: string) {
  const q = seasonSlug ? `?season=${encodeURIComponent(seasonSlug)}` : '';
  return apiFetch(`/clubs${q}`);
}

export function getClubBySlug(slug: string) {
  return apiFetch(`/clubs/${slug}`);
}

export function getClubOverview(slug: string) {
  return apiFetch(`/clubs/${slug}/overview`);
}

export function getClubFixtures(slug: string) {
  return apiFetch(`/clubs/${slug}/fixtures`);
}

export function getClubResults(slug: string) {
  return apiFetch(`/clubs/${slug}/results`);
}

export function getClubSquad(slug: string) {
  return apiFetch(`/clubs/${slug}/squad`);
}

export function getClubStats(slug: string) {
  return apiFetch(`/clubs/${slug}/stats`);
}

export function getClubStadium(slug: string) {
  return apiFetch(`/clubs/${slug}/stadium`);
}

export function getClubTickets(slug: string) {
  return apiFetch(`/clubs/${slug}/tickets`);
}

export function getClubShop(slug: string) {
  return apiFetch(`/clubs/${slug}/shop`);
}

export function getClubShopProduct(slug: string, productSlug: string) {
  return apiFetch(`/clubs/${slug}/shop/${productSlug}`);
}

// ── Admin: club management routes ────────────────────────────────────────

export function adminGetClubList(token: string) {
  return adminFetch('/clubs/admin/list', token);
}

export function adminGetClubReadiness(token: string) {
  return adminFetch('/clubs/admin/readiness', token);
}

export function adminGetClubDetail(token: string, id: string) {
  return adminFetch(`/clubs/admin/${id}`, token);
}

export function adminGetClubExperience(token: string, id: string) {
  return adminFetch(`/clubs/admin/${id}/experience`, token);
}

export function adminGetClubPlayers(token: string, id: string) {
  return adminFetch(`/clubs/admin/${id}/players`, token);
}

export function adminGetClubFixtures(token: string, id: string) {
  return adminFetch(`/clubs/admin/${id}/fixtures`, token);
}

export function adminGetClubShopReadiness(token: string, id: string) {
  return adminFetch(`/clubs/admin/${id}/shop/readiness`, token);
}

export function adminValidateClub(token: string, id: string) {
  return adminFetch(`/clubs/admin/${id}/validate`, token, { method: 'POST' });
}

export function adminGetSeasonTeams(token: string, seasonId: string) {
  return adminFetch(`/clubs/admin/seasons/${seasonId}/teams`, token);
}

export function adminAddTeamToSeason(token: string, seasonId: string, teamId: string) {
  return adminFetch(`/clubs/admin/seasons/${seasonId}/teams`, token, {
    method: 'POST',
    body: JSON.stringify({ teamId }),
  });
}

export function adminUpdateSeasonTeamStatus(token: string, seasonId: string, teamId: string, status: string) {
  return adminFetch(`/clubs/admin/seasons/${seasonId}/teams/${teamId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function adminRemoveTeamFromSeason(token: string, seasonId: string, teamId: string) {
  return adminFetch(`/clubs/admin/seasons/${seasonId}/teams/${teamId}`, token, { method: 'DELETE' });
}

export function adminValidateSeasonParticipation(token: string, seasonId: string) {
  return adminFetch(`/clubs/admin/seasons/${seasonId}/validate`, token);
}

export function adminAssignPlayerToClub(token: string, teamId: string, seasonId: string, playerId: string) {
  return adminFetch(`/clubs/admin/${teamId}/seasons/${seasonId}/players`, token, {
    method: 'POST',
    body: JSON.stringify({ playerId }),
  });
}

export function adminGetUnassignedPlayers(token: string, seasonId?: string) {
  const q = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : '';
  return adminFetch(`/clubs/admin/players/unassigned${q}`, token);
}

export function adminGetUnassignedFixtures(token: string) {
  return adminFetch('/clubs/admin/fixtures/unassigned', token);
}
