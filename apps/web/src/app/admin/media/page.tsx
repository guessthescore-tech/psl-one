'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminListMedia } from '@/lib/admin-media-client';

interface MediaAsset {
  id: string;
  title: string;
  slug: string;
  mediaType: string;
  visibility: string;
  rightsStatus: string;
  status: string;
  durationSeconds: number | null;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminListMedia(getBetaToken())
      .then((data: { assets: MediaAsset[] }) => setAssets(data.assets ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Catalogue</h1>
          <p className="text-gray-500 mt-1">Manage PSL media assets — videos, articles, galleries</p>
        </div>
        <Link href="/admin/media/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
          + New Asset
        </Link>
      </div>

      <div className="mb-3 bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
        Media availability does not imply that PSL One owns streaming rights. Public availability requires an approved rights status.
      </div>

      {loading && <p className="text-gray-500">Loading media assets…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="grid gap-3">
        {assets.map(a => (
          <div key={a.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{a.title}</span>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">{a.mediaType}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${a.visibility === 'PUBLIC' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {a.visibility}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${a.rightsStatus === 'CLEAR' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  rights: {a.rightsStatus}
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{a.status}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{a.slug} · {a.durationSeconds != null ? `${a.durationSeconds}s` : 'no duration'}</p>
            </div>
            <Link href={`/admin/media/${a.id}`} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200">
              Manage
            </Link>
          </div>
        ))}
      </div>

      {!loading && assets.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400 mt-4">
          <p>No media assets yet</p>
          <Link href="/admin/media/new" className="mt-2 inline-block text-blue-600 text-sm hover:underline">Create first asset</Link>
        </div>
      )}
    </div>
  );
}
