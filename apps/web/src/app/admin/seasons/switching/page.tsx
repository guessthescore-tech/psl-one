'use client';

import { useEffect, useState } from 'react';
import { getAdminSeasonContext, getSwitchHistory } from '@/lib/season-context-client';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';

interface SeasonRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  isActive: boolean;
}

interface AuditRow {
  id: string;
  toSeasonId: string;
  fromSeasonId: string | null;
  action: string;
  status: string;
  performedByUserId: string | null;
  createdAt: string;
}

export default function SeasonSwitchingPage() {
  const [seasons, setSeasons] = useState<SeasonRow[]>([]);
  const [history, setHistory] = useState<AuditRow[]>([]);
  const [activeSeason, setActiveSeason] = useState<SeasonRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getAdminSeasonContext(getBetaToken()),
      getSwitchHistory(undefined, getBetaToken()),
    ])
      .then(([ctx, hist]) => {
        const c = ctx as { activeSeason: SeasonRow | null; allSeasons: SeasonRow[] };
        setActiveSeason(c.activeSeason);
        setSeasons(c.allSeasons.filter((s) => !s.isActive));
        setHistory((hist as AuditRow[]).slice(0, 10));
      })
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  const actionColour = (action: string) => {
    if (action === 'ACTIVATE') return 'text-green-700';
    if (action === 'ROLLBACK') return 'text-orange-600';
    if (action === 'COMPLETE') return 'text-gray-600';
    return 'text-blue-600';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Season Switching</h1>
        <p className="text-sm text-gray-500 mt-1">
          Activate a new season as the platform default. The previous active season is marked Completed.
        </p>
      </div>

      {activeSeason && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-800">
            Currently active: <span className="font-bold">{activeSeason.name}</span>
          </p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Available Seasons</h2>
        {seasons.length === 0 ? (
          <p className="text-gray-500 text-sm">No inactive seasons available to activate.</p>
        ) : (
          <div className="grid gap-3">
            {seasons.map((s) => (
              <div key={s.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white">
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.status}</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/seasons/switching/${s.id}/readiness`}
                    className="text-sm px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Readiness
                  </Link>
                  <Link
                    href={`/admin/seasons/switching/${s.id}/preview`}
                    className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Preview & Activate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Switch History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">Action</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Season</th>
                  <th className="px-4 py-2 text-left">When</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-gray-100">
                    <td className={`px-4 py-2 font-semibold ${actionColour(h.action)}`}>{h.action}</td>
                    <td className="px-4 py-2 text-gray-600">{h.status}</td>
                    <td className="px-4 py-2 text-gray-600">{h.toSeasonId.slice(0, 8)}…</td>
                    <td className="px-4 py-2 text-gray-500">{new Date(h.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
