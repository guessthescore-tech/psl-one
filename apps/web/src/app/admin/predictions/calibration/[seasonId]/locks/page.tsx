'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPredictionLockReadiness } from '@/lib/prediction-calibration-client';

interface FixtureLockRow {
  id: string;
  kickoffAt: string;
  status: string;
  gameweekName: string | null;
  predictionDeadlineAt: string | null;
  isLocked: boolean;
  lockReason: string;
  pendingPredictions: number;
}

export default function LockReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<{
    seasonName: string;
    totalPublished: number;
    totalLocked: number;
    totalOpen: number;
    fixtures: FixtureLockRow[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPredictionLockReadiness(seasonId)
      .then((d) => setData(d as typeof data))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{data.seasonName} — Prediction Lock Readiness</h1>
      <p className="text-sm text-gray-500">
        Predictions lock at kickoff time (or at the gameweek deadline if earlier). Fan points only — no stakes or wagers.
      </p>

      <div className="flex gap-4 text-sm">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <span className="font-medium text-blue-700">{data.totalOpen}</span> open
        </div>
        <div className="p-3 bg-orange-50 border border-orange-200 rounded">
          <span className="font-medium text-orange-700">{data.totalLocked}</span> locked
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
          <span className="font-medium">{data.totalPublished}</span> total published
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-2 text-left">Kickoff (UTC)</th>
              <th className="border border-gray-200 p-2 text-left">GW / Status</th>
              <th className="border border-gray-200 p-2 text-left">Prediction Deadline</th>
              <th className="border border-gray-200 p-2 text-center">Locked</th>
              <th className="border border-gray-200 p-2 text-left">Lock Reason</th>
              <th className="border border-gray-200 p-2 text-center">Pending</th>
            </tr>
          </thead>
          <tbody>
            {data.fixtures.map((f) => (
              <tr key={f.id} className={f.isLocked ? 'bg-gray-50 text-gray-500' : ''}>
                <td className="border border-gray-200 p-2 text-xs">{new Date(f.kickoffAt).toLocaleString()}</td>
                <td className="border border-gray-200 p-2 text-xs">{f.gameweekName ?? '—'} / {f.status}</td>
                <td className="border border-gray-200 p-2 text-xs">
                  {f.predictionDeadlineAt ? new Date(f.predictionDeadlineAt).toLocaleString() : 'Kickoff'}
                </td>
                <td className="border border-gray-200 p-2 text-center">{f.isLocked ? '🔒' : '🔓'}</td>
                <td className="border border-gray-200 p-2 text-xs">{f.lockReason}</td>
                <td className="border border-gray-200 p-2 text-center">{f.pendingPredictions}</td>
              </tr>
            ))}
            {data.fixtures.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">No published fixtures</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
