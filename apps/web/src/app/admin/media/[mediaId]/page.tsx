'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminGetMedia, adminUpdateMedia, adminPublishMedia, adminArchiveMedia } from '@/lib/admin-media-client';

interface MediaAsset {
  id: string;
  title: string;
  slug: string;
  mediaType: string;
  visibility: string;
  rightsStatus: string;
  status: string;
  description: string | null;
  thumbnailUrl: string | null;
  contentUrl: string | null;
  durationSeconds: number | null;
  viewCount: number;
  completionCount: number;
  createdAt: string;
}

export default function AdminMediaDetailPage() {
  const { mediaId } = useParams<{ mediaId: string }>();
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    adminGetMedia(getBetaToken(), mediaId)
      .then(setAsset)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [mediaId]);

  async function handlePublish() {
    setActing(true);
    setError(null);
    try {
      const res = await adminPublishMedia(getBetaToken(), mediaId);
      setNotice(res.mediaRightsNotice ?? 'Published.');
      setAsset(a => a ? { ...a, status: 'PUBLISHED', visibility: 'PUBLIC' } : a);
    } catch (e: unknown) { setError(String(e)); }
    finally { setActing(false); }
  }

  async function handleArchive() {
    setActing(true);
    setError(null);
    try {
      await adminArchiveMedia(getBetaToken(), mediaId);
      setAsset(a => a ? { ...a, status: 'ARCHIVED' } : a);
    } catch (e: unknown) { setError(String(e)); }
    finally { setActing(false); }
  }

  async function handleVisibilityToggle() {
    if (!asset) return;
    setActing(true);
    setError(null);
    try {
      const updated = await adminUpdateMedia(getBetaToken(), mediaId, {
        visibility: asset.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC',
      });
      setAsset(updated);
    } catch (e: unknown) { setError(String(e)); }
    finally { setActing(false); }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (!asset) return <div className="p-6 text-red-600">{error ?? 'Asset not found'}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/media" className="text-sm text-gray-500 hover:underline">← Media Catalogue</Link>
      </div>

      <div className="border rounded-lg p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{asset.title}</h1>
            <p className="text-gray-500 text-sm font-mono">{asset.slug}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{asset.mediaType}</span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{asset.status}</span>
            <span className={`text-xs px-2 py-1 rounded ${asset.rightsStatus === 'CLEAR' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              rights: {asset.rightsStatus}
            </span>
          </div>
        </div>

        {notice && <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 text-sm mb-4">{notice}</p>}
        {error && <p className="text-red-600 bg-red-50 rounded p-3 text-sm mb-4">{error}</p>}

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><span className="text-gray-500">Visibility:</span> <strong>{asset.visibility}</strong></div>
          <div><span className="text-gray-500">Duration:</span> <strong>{asset.durationSeconds != null ? `${asset.durationSeconds}s` : '—'}</strong></div>
          <div><span className="text-gray-500">Views:</span> <strong>{asset.viewCount}</strong></div>
          <div><span className="text-gray-500">Completions:</span> <strong>{asset.completionCount}</strong></div>
        </div>

        {asset.description && <p className="text-sm text-gray-700 mb-4">{asset.description}</p>}

        <div className="flex gap-2 flex-wrap">
          {asset.status === 'DRAFT' && asset.rightsStatus === 'CLEAR' && (
            <button onClick={handlePublish} disabled={acting} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50">
              Publish
            </button>
          )}
          {asset.status === 'PUBLISHED' && (
            <button onClick={handleVisibilityToggle} disabled={acting} className="bg-gray-600 text-white text-sm px-3 py-1.5 rounded hover:bg-gray-700 disabled:opacity-50">
              {asset.visibility === 'PUBLIC' ? 'Set Private' : 'Set Public'}
            </button>
          )}
          {asset.status !== 'ARCHIVED' && (
            <button onClick={handleArchive} disabled={acting} className="bg-red-600 text-white text-sm px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-50">
              Archive
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Media availability does not imply that PSL One owns streaming rights. Public availability requires an approved rights status.
      </p>
    </div>
  );
}
