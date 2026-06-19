/**
 * Media API client for PSL One Experience app.
 *
 * Covers: article/video listing, single item fetch, and engagement tracking
 * (view and completion events). Browse endpoints are public; tracking events
 * require a Bearer token.
 */

import { publicFetch, apiFetch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MediaType = 'ARTICLE' | 'VIDEO' | 'GALLERY' | 'PODCAST';

export interface MediaItem {
  id: string;
  slug: string;
  title: string;
  type: MediaType;
  summary: string | null;
  body: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  durationSeconds: number | null;
  tags: string[];
  publishedAt: string;
  club: { id: string; name: string; slug: string } | null;
}

// ── Functions ─────────────────────────────────────────────────────────────────

export function getMedia(params?: { type?: string; page?: number; clubId?: string }): Promise<MediaItem[]> {
  const qs = new URLSearchParams();
  if (params?.type) qs.set('type', params.type);
  if (params?.page !== undefined) qs.set('page', String(params.page));
  if (params?.clubId) qs.set('clubId', params.clubId);
  const q = qs.toString();
  return publicFetch<MediaItem[]>(`/fan/media${q ? `?${q}` : ''}`);
}

export function getMediaItem(slug: string): Promise<MediaItem> {
  return publicFetch<MediaItem>(`/fan/media/${encodeURIComponent(slug)}`);
}

/**
 * Track that the fan viewed a media item. Requires auth.
 * The server uses an idempotency key to prevent duplicate view events.
 */
export function trackView(id: string, idempotencyKey?: string): Promise<void> {
  return apiFetch<void>(`/fan/media/${encodeURIComponent(id)}/view`, {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey: idempotencyKey ?? `view-${id}-${Date.now()}` }),
  });
}

/**
 * Track that the fan completed a media item (e.g., finished a video).
 * Requires auth. The server uses an idempotency key.
 */
export function trackComplete(id: string, idempotencyKey?: string): Promise<void> {
  return apiFetch<void>(`/fan/media/${encodeURIComponent(id)}/complete`, {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey: idempotencyKey ?? `complete-${id}-${Date.now()}` }),
  });
}
