'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEngagementAchievements } from '@/lib/admin-engagement-client';

interface FanValueFromAchievements { points: number; count: number; note: string }
interface AchievementsData {
  seasonId: string;
  scope: string;
  note: string;
  totalUnlocked: number;
  activeDefinitions: number;
  fanValueAwardedThisSeason: FanValueFromAchievements;
}

export default function AdminEngagementAchievementsPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEngagementAchievements(seasonId)
      .then((d) => setData(d as AchievementsData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/engagement" className="hover:text-gray-600">Engagement</Link>
        <span>/</span>
        <Link href={`/admin/engagement/${seasonId}`} className="hover:text-gray-600">{seasonId}</Link>
        <span>/</span>
        <span className="text-gray-600">Achievements</span>
      </div>

      <div className="flex items-center gap-3 mt-1 mb-2">
        <h1 className="text-xl font-bold text-gray-900">Achievements & Badges</h1>
        {data && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
            Scope: {data.scope}
          </span>
        )}
      </div>

      {data?.note && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-800 mb-4">
          {data.note}
        </div>
      )}

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">{data.totalUnlocked.toLocaleString()}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">Total Unlocked</p>
              <p className="text-xs text-gray-400">all fans, all time</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">{data.activeDefinitions}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">Active Definitions</p>
              <p className="text-xs text-gray-400">badges that can be earned</p>
            </div>
          </div>

          {/* Fan value via achievements this season */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Fan Value via Achievements (this season)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xl font-bold text-gray-900">{data.fanValueAwardedThisSeason.points.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Points awarded</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{data.fanValueAwardedThisSeason.count}</p>
                <p className="text-xs text-gray-400">Trigger events</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{data.fanValueAwardedThisSeason.note}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500">
            Achievements have no <code className="bg-gray-100 px-1 rounded">seasonId</code> — they are intentionally global. Once unlocked, they persist across seasons. The fan value <em>triggered by</em> achievements is season-scoped via <code className="bg-gray-100 px-1 rounded">FanValueLedger.seasonId</code>.
          </div>

          <div className="flex gap-3">
            <Link href="/admin/achievements" className="text-xs text-blue-600 underline">Manage Achievements →</Link>
            <Link href={`/admin/engagement/${seasonId}/leaderboards`} className="text-xs text-blue-600 underline">Leaderboard snapshot →</Link>
          </div>
        </div>
      )}
    </main>
  );
}
