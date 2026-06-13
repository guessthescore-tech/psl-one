'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicMedia, recordMediaView } from '@/lib/media-client';
import { getBetaToken } from '@/lib/auth-client';

interface MediaAsset {
  id: string;
  title: string;
  slug: string;
  mediaType: string;
  description: string | null;
  contentUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  viewCount: number;
  completionCount: number;
}

export default function MediaDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    getPublicMedia(slug)
      .then((a: MediaAsset) => {
        setAsset(a);
        const token = getBetaToken();
        if (token) {
          const key = `view-${a.id}-${Date.now()}`;
          recordMediaView(token, a.id, key).then(() => setViewed(true)).catch(() => {});
        }
      })
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (!asset) return <div className="p-6 text-red-600">{error ?? 'Not found'}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/media" className="text-sm text-gray-500 hover:underline">← Media Catalogue</Link>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">{asset.mediaType}</span>
          {asset.durationSeconds != null && (
            <span className="text-xs text-gray-400">{Math.floor(asset.durationSeconds / 60)}m {asset.durationSeconds % 60}s</span>
          )}
          {viewed && <span className="text-xs text-green-600">Viewed</span>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{asset.title}</h1>
        {asset.description && <p className="text-gray-600 mt-2">{asset.description}</p>}
      </div>

      <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center text-gray-400 mb-4">
        {/* Content player placeholder — production CDN/streaming not configured */}
        <div className="text-center">
          <div className="text-2xl mb-2">{asset.mediaType === 'VIDEO' ? '▶' : '📄'}</div>
          <p className="text-sm">
            {asset.contentUrl ? 'Content available via configured CDN' : 'Content URL not set'}
          </p>
          <p className="text-xs mt-1 text-gray-300">Live streaming/CDN: RIGHTS_REQUIRED (Sprint 3)</p>
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-500">
        <span>{asset.viewCount} views</span>
        <span>{asset.completionCount} completions</span>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Media availability does not imply that PSL One owns streaming rights. Public availability requires an approved rights status.
      </p>
    </div>
  );
}
