'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSeasonStatsReadiness } from '@/lib/admin-player-stats-client';

interface ReadinessData {
  season: { id: string; name: string; slug: string; status: string };
  readiness: string;
  counts: { total: number; draft: number; verified: number; published: number; locked: number };
  finishedFixtures: number;
  coveragePercent: number;
}

const READINESS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  NO_DATA: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', label: 'No Data' },
  PROVISIONAL: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', label: 'Provisional' },
  PARTIAL: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', label: 'Partial' },
  VERIFIED: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-800', label: 'Verified' },
  PUBLISHED: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', label: 'Published' },
};

export default function SeasonStatsReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSeasonStatsReadiness(seasonId)
      .then((d) => setData(d as ReadinessData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [seasonId]);

  const style = data ? (READINESS_STYLE[data.readiness] ?? READINESS_STYLE['NO_DATA']!) : null;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/player-stats" className="hover:text-gray-600">Player Stats</Link>
        <span>/</span>
        <span className="text-gray-600">Season Readiness</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">Player Stats Season Readiness</h1>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && style && (
        <div className="space-y-4">
          <div className={`border rounded-lg p-4 ${style.bg}`}>
            <p className={`font-bold text-lg ${style.text}`}>{style.label}</p>
            <p className={`text-xs mt-1 ${style.text}`}>{data.season.name} · {data.season.status}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Entries', value: data.counts.total },
              { label: 'Finished Fixtures', value: data.finishedFixtures },
              { label: 'Coverage', value: `${data.coveragePercent}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-700">Status Breakdown</h2></div>
            {Object.entries(data.counts).map(([key, count]) => (
              <div key={key} className="flex justify-between px-4 py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500 uppercase">{key}</span>
                <span className="text-sm font-semibold text-gray-800">{count}</span>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Actions</h2>
            <div className="flex gap-2 flex-wrap">
              <Link href={`/admin/player-stats?seasonId=${seasonId}&status=DRAFT`} className="text-xs text-blue-600 underline">View Draft Entries →</Link>
              <Link href="/admin/player-stats/new" className="text-xs text-blue-600 underline">+ New Entry →</Link>
              <Link href="/admin/seasons" className="text-xs text-blue-600 underline">Season Switching →</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
