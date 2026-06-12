'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEngagementLeaderboards } from '@/lib/admin-engagement-client';

interface LeaderboardEntry { rank: number; userId: string; displayName: string | null; totalPoints: number }
interface LeaderboardsData {
  seasonId: string;
  seasonName: string;
  pointsOnly: boolean;
  nonFinancial: boolean;
  leaderboards: {
    fanValue: LeaderboardEntry[];
    fantasy: LeaderboardEntry[];
    predictions: LeaderboardEntry[];
    achievements: LeaderboardEntry[];
    note: string;
  };
}

function MiniTable({ title, entries, unit = 'pts', note }: { title: string; entries: LeaderboardEntry[]; unit?: string; note?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {note && <span className="text-xs text-gray-400">{note}</span>}
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-gray-400">No entries yet</p>
      ) : (
        <ol className="space-y-1.5">
          {entries.map((e, i) => (
            <li key={e.userId} className="flex items-center gap-3 text-xs">
              <span className="w-4 text-right text-gray-400 font-mono">{i + 1}</span>
              <span className="flex-1 truncate text-gray-700">{e.displayName ?? e.userId.slice(0, 8)}</span>
              <span className="font-semibold text-gray-900">{e.totalPoints} <span className="font-normal text-gray-400">{unit}</span></span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function AdminEngagementLeaderboardsPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<LeaderboardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEngagementLeaderboards(seasonId)
      .then((d) => setData(d as LeaderboardsData))
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
        <span className="text-gray-600">Leaderboard Snapshots</span>
      </div>

      <div className="flex items-center justify-between mb-4 mt-1">
        <h1 className="text-xl font-bold text-gray-900">Leaderboard Snapshots</h1>
        <Link href="/leaderboards" className="text-xs text-blue-600 underline">Fan view →</Link>
      </div>

      {data && (
        <div className="flex gap-2 mb-4 text-xs">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Points-only</span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Non-financial</span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Top 5 per type</span>
        </div>
      )}

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MiniTable title="Fan Value" entries={data.leaderboards.fanValue} unit="pts" note="non-financial" />
            <MiniTable title="Fantasy" entries={data.leaderboards.fantasy} unit="pts" note="points-only" />
            <MiniTable title="Predictions" entries={data.leaderboards.predictions} unit="pts" note="no wagering" />
            <MiniTable title="Achievements" entries={data.leaderboards.achievements} unit="badges" note="all-time" />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500">
            <p><strong>Achievements:</strong> {data.leaderboards.note}</p>
            <p className="mt-1">Season scope: Fan Value and Fantasy filter by <code className="bg-gray-100 px-1 rounded">seasonId</code>. Predictions derive from <code className="bg-gray-100 px-1 rounded">fixture.seasonId</code>. WC data accessible via <code className="bg-gray-100 px-1 rounded">?seasonSlug=fifa-world-cup-2026</code> on fan leaderboard routes.</p>
          </div>
        </div>
      )}
    </main>
  );
}
