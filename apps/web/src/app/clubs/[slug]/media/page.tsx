'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getClubMedia } from '@/lib/media-client';

interface MediaAsset {
  id: string;
  title: string;
  slug: string;
  mediaType: string;
  description: string | null;
  viewCount: number;
}

export default function ClubMediaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClubMedia(slug)
      .then((data: { assets: MediaAsset[] }) => setAssets(data.assets ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href={`/clubs/${slug}`} className="text-sm text-gray-500 hover:underline">← Club</Link>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Club Media</h1>

      <p className="text-xs text-gray-400 mb-4">
        Media availability does not imply that PSL One owns streaming rights.
      </p>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map(a => (
          <Link key={a.id} href={`/media/${a.slug}`} className="border rounded-lg p-4 hover:bg-gray-50 block">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">{a.mediaType}</span>
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">{a.title}</h2>
            {a.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>}
            <p className="text-xs text-gray-400 mt-2">{a.viewCount} views</p>
          </Link>
        ))}
      </div>

      {!loading && assets.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-400">
          <p>No media for this club yet</p>
        </div>
      )}
    </div>
  );
}
