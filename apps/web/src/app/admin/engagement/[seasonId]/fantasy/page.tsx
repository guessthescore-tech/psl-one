'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEngagementFantasy } from '@/lib/admin-engagement-client';

interface FantasyData {
  seasonId: string;
  seasonName: string;
  totalNetPoints: number;
  totalGrossPoints: number;
  gameweekScoreCount: number;
  activeFantasyTeams: number;
  fantasyLeagues: number;
  pointsOnly: boolean;
  note: string;
}

export default function AdminEngagementFantasyPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<FantasyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEngagementFantasy(seasonId)
      .then((d) => setData(d as FantasyData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/engagement" className="hover:text-gray-600">Engagement</Link>
        <span>/</span>
        <Link href={`/admin/engagement/${seasonId}`} className="hover:text-gray-600">{data?.seasonName ?? seasonId}</Link>
        <span>/</span>
        <span className="text-gray-600">Fantasy</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-2">Fantasy Football Engagement</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-4">
        <strong>Points-only.</strong> {data?.note ?? 'Fantasy is free-to-play. No paid entry, no real-money mechanics.'}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Net Points', value: data.totalNetPoints.toLocaleString(), sub: 'after chips/transfers' },
              { label: 'Total Gross Points', value: data.totalGrossPoints.toLocaleString(), sub: 'before deductions' },
              { label: 'Gameweek Scores', value: data.gameweekScoreCount.toLocaleString(), sub: 'recorded this season' },
              { label: 'Active Teams', value: data.activeFantasyTeams.toLocaleString(), sub: 'registered this season' },
              { label: 'Fantasy Leagues', value: data.fantasyLeagues.toLocaleString(), sub: 'public + private' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500">
            Season scope: <code className="bg-gray-100 px-1 rounded">FantasyGameweekScore.seasonId</code> is a required column — always fully season-scoped. No WC/PSL mixing.
          </div>

          <div className="flex gap-3">
            <Link href="/admin/fantasy" className="text-xs text-blue-600 underline">Fantasy Calibration →</Link>
            <Link href={`/admin/engagement/${seasonId}/leaderboards`} className="text-xs text-blue-600 underline">Leaderboard snapshot →</Link>
          </div>
        </div>
      )}
    </main>
  );
}
