'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { getAdminSeasonContext, getSwitchHistory } from '@/lib/season-context-client';
import Link from 'next/link';

interface SeasonRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface AuditRow {
  id: string;
  action: string;
  status: string;
  createdAt: string;
  performedByUserId: string | null;
}

export default function SeasonSwitchDetailPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [season, setSeason] = useState<SeasonRow | null>(null);
  const [history, setHistory] = useState<AuditRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getAdminSeasonContext('dev-token'),
      getSwitchHistory(seasonId, 'dev-token'),
    ])
      .then(([ctx, hist]) => {
        const c = ctx as { allSeasons: SeasonRow[] };
        const found = c.allSeasons.find((s) => s.id === seasonId) ?? null;
        setSeason(found);
        setHistory(hist as AuditRow[]);
      })
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!season) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/seasons/switching" className="text-blue-600 hover:underline text-sm">
          ← Back to switching
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{season.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(season.startDate).toLocaleDateString()} – {new Date(season.endDate).toLocaleDateString()} ·{' '}
          <span className="font-semibold">{season.status}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/admin/seasons/switching/${seasonId}/readiness`}
          className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
        >
          Check Readiness
        </Link>
        <Link
          href={`/admin/seasons/switching/${seasonId}/preview`}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Preview & Activate
        </Link>
      </div>

      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Activation History</h2>
          <ul className="space-y-1 text-sm text-gray-600">
            {history.map((h) => (
              <li key={h.id} className="flex justify-between">
                <span className="font-medium">{h.action}</span>
                <span className={h.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>{h.status}</span>
                <span className="text-gray-400">{new Date(h.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
