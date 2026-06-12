'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPredictionSettlementReadiness } from '@/lib/prediction-calibration-client';

interface SettlementRow {
  id: string;
  kickoffAt: string;
  status: string;
  match: string;
  hasResult: boolean;
  result: string | null;
  canSettle: boolean;
  gameweekName: string | null;
  totalPredictions: number;
}

export default function SettlementReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<{
    seasonName: string;
    totalPublished: number;
    readyToSettle: number;
    awaitingResult: number;
    notYetFinished: number;
    fixtures: SettlementRow[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPredictionSettlementReadiness(seasonId)
      .then((d) => setData(d as typeof data))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{data.seasonName} — Settlement Readiness</h1>

      <div className="flex gap-4 text-sm flex-wrap">
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <span className="font-medium text-green-700">{data.readyToSettle}</span> ready to settle
        </div>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <span className="font-medium text-yellow-700">{data.awaitingResult}</span> awaiting result
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
          <span className="font-medium">{data.notYetFinished}</span> not yet finished
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-2 text-left">Match</th>
              <th className="border border-gray-200 p-2 text-left">GW</th>
              <th className="border border-gray-200 p-2 text-center">Status</th>
              <th className="border border-gray-200 p-2 text-center">Result</th>
              <th className="border border-gray-200 p-2 text-center">Predictions</th>
              <th className="border border-gray-200 p-2 text-center">Can Settle</th>
            </tr>
          </thead>
          <tbody>
            {data.fixtures.map((f) => (
              <tr key={f.id} className={f.canSettle ? 'bg-green-50' : ''}>
                <td className="border border-gray-200 p-2">{f.match}</td>
                <td className="border border-gray-200 p-2 text-xs">{f.gameweekName ?? '—'}</td>
                <td className="border border-gray-200 p-2 text-center text-xs">{f.status}</td>
                <td className="border border-gray-200 p-2 text-center font-mono">{f.result ?? '—'}</td>
                <td className="border border-gray-200 p-2 text-center">{f.totalPredictions}</td>
                <td className="border border-gray-200 p-2 text-center">{f.canSettle ? <span className="text-green-600">✓</span> : '—'}</td>
              </tr>
            ))}
            {data.fixtures.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-400">No published fixtures</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
