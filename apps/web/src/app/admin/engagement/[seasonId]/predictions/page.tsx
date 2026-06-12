'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEngagementPredictions } from '@/lib/admin-engagement-client';

interface PredictionsData {
  seasonId: string;
  seasonName: string;
  totalPredictionPoints: number;
  totalPredictions: number;
  settledPredictions: number;
  uniquePredictingFans: number;
  seasonDerivedFrom: string;
  pointsOnly: boolean;
  note: string;
}

export default function AdminEngagementPredictionsPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<PredictionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEngagementPredictions(seasonId)
      .then((d) => setData(d as PredictionsData))
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
        <span className="text-gray-600">Predictions</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-2">Guess the Score Engagement</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-4">
        <strong>Points-only.</strong> {data?.note ?? 'Guess the Score is points-only. No odds, stakes, or wagering mechanics.'}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Points Awarded', value: data.totalPredictionPoints.toLocaleString(), sub: 'from settled predictions' },
              { label: 'Total Predictions', value: data.totalPredictions.toLocaleString(), sub: 'all time this season' },
              { label: 'Settled Predictions', value: data.settledPredictions.toLocaleString(), sub: 'points locked' },
              { label: 'Unique Fans', value: data.uniquePredictingFans.toLocaleString(), sub: 'who have earned points' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500">
              <strong>Season scope derivation:</strong> <code className="bg-gray-100 px-1 rounded">{data.seasonDerivedFrom}</code> — <code className="bg-gray-100 px-1 rounded">PredictionPointsLedger</code> has no <code className="bg-gray-100 px-1 rounded">seasonId</code> column. Season is derived at query time from the linked fixture. WC and PSL predictions do not mix.
            </p>
          </div>

          {data.settledPredictions < data.totalPredictions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              {data.totalPredictions - data.settledPredictions} predictions pending settlement.
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/admin/predictions" className="text-xs text-blue-600 underline">Prediction Rules →</Link>
            <Link href={`/admin/engagement/${seasonId}/leaderboards`} className="text-xs text-blue-600 underline">Leaderboard snapshot →</Link>
          </div>
        </div>
      )}
    </main>
  );
}
