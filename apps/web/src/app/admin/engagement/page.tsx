'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listEngagementSeasons } from '@/lib/admin-engagement-client';

interface EngagementSeason {
  id: string;
  name: string;
  slug: string;
  status: string;
  isActive: boolean;
}

interface SeasonsResponse {
  seasons: EngagementSeason[];
  total: number;
  note: string;
}

export default function AdminEngagementPage() {
  const [data, setData] = useState<SeasonsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEngagementSeasons()
      .then((d) => setData(d as SeasonsResponse))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Engagement Metrics</h1>
        <Link href="/admin" className="text-sm text-blue-600 underline">Admin</Link>
      </div>

      {data?.note && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 mb-4">{data.note}</div>
      )}

      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-2">
          {data.seasons.map((s) => (
            <div key={s.id} className="border border-gray-200 rounded-lg p-4 bg-white flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{s.name}</p>
                <p className="text-xs text-gray-400">{s.slug} · {s.status}{s.isActive ? ' · Active' : ''}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/engagement/${s.id}`} className="text-xs text-blue-600 underline">Overview</Link>
                <Link href={`/admin/engagement/${s.id}/season-scope-audit`} className="text-xs text-blue-600 underline">Scope Audit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
