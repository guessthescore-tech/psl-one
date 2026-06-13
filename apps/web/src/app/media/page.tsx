'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listPublicMedia } from '@/lib/media-client';

interface MediaAsset {
  id: string;
  title: string;
  slug: string;
  mediaType: string;
  description: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  viewCount: number;
}

const TYPE_ICONS: Record<string, string> = {
  VIDEO: 'VIDEO',
  ARTICLE: 'ARTICLE',
  GALLERY: 'GALLERY',
  AUDIO: 'AUDIO',
  DOCUMENT: 'DOC',
};

export default function MediaCataloguePage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPublicMedia()
      .then((data: { assets: MediaAsset[] }) => setAssets(data.assets ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">PSL Media</h1>
        <p className="text-gray-500 mt-1">Videos, articles, and galleries from the PSL</p>
        <p className="text-xs text-gray-400 mt-1">
          Media availability does not imply that PSL One owns streaming rights.
        </p>
      </div>

      {loading && <p className="text-gray-500">Loading media…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map(a => (
          <Link key={a.id} href={`/media/${a.slug}`} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow block">
            {a.thumbnailUrl && (
              <div className="bg-gray-100 h-36 flex items-center justify-center text-gray-300 text-xs">
                {/* Thumbnail placeholder — no copyrighted images */}
                <span>{TYPE_ICONS[a.mediaType] ?? a.mediaType}</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">{TYPE_ICONS[a.mediaType] ?? a.mediaType}</span>
                {a.durationSeconds != null && <span className="text-xs text-gray-400">{Math.floor(a.durationSeconds / 60)}m {a.durationSeconds % 60}s</span>}
              </div>
              <h2 className="font-semibold text-gray-900 text-sm leading-tight">{a.title}</h2>
              {a.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>}
              <p className="text-xs text-gray-400 mt-2">{a.viewCount} views</p>
            </div>
          </Link>
        ))}
      </div>

      {!loading && assets.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400">
          <p>No media available yet</p>
        </div>
      )}
    </div>
  );
}
