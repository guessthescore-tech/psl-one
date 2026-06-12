'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPredictionActivationImpact } from '@/lib/prediction-calibration-client';

export default function PredictionActivationImpactPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<{
    seasonName: string;
    fixtures: { total: number; published: number; unpublished: number };
    rulesConfig: { status: string; correctScorePoints: number; correctGoalDifferencePoints: number; correctResultPoints: number } | null;
    predictions: { total: number; locked: number; settled: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPredictionActivationImpact(seasonId)
      .then((d) => setData(d as typeof data))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{data.seasonName} — Activation Impact</h1>
      <p className="text-sm text-gray-500">Summary of prediction state for this season before activation.</p>

      <div className="space-y-4">
        <section className="p-4 border rounded-lg space-y-2">
          <h2 className="font-semibold">Fixtures</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center"><div className="text-lg font-bold">{data.fixtures.total}</div><div className="text-gray-500">Total</div></div>
            <div className="text-center"><div className="text-lg font-bold text-green-600">{data.fixtures.published}</div><div className="text-gray-500">Published</div></div>
            <div className="text-center"><div className="text-lg font-bold text-yellow-600">{data.fixtures.unpublished}</div><div className="text-gray-500">Unpublished</div></div>
          </div>
        </section>

        <section className="p-4 border rounded-lg space-y-2">
          <h2 className="font-semibold">Prediction Rules</h2>
          {data.rulesConfig ? (
            <div className="text-sm space-y-1">
              <div className="flex gap-2 items-center">
                <span className={`text-xs px-2 py-0.5 rounded ${data.rulesConfig.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {data.rulesConfig.status}
                </span>
              </div>
              <p>Exact Score: <strong>{data.rulesConfig.correctScorePoints} pts</strong></p>
              <p>Goal Difference: <strong>{data.rulesConfig.correctGoalDifferencePoints} pts</strong></p>
              <p>Correct Result: <strong>{data.rulesConfig.correctResultPoints} pts</strong></p>
            </div>
          ) : (
            <p className="text-sm text-red-600">No prediction rules configured — calibrate before activation.</p>
          )}
        </section>

        <section className="p-4 border rounded-lg space-y-2">
          <h2 className="font-semibold">Predictions</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center"><div className="text-lg font-bold">{data.predictions.total}</div><div className="text-gray-500">Total</div></div>
            <div className="text-center"><div className="text-lg font-bold text-orange-600">{data.predictions.locked}</div><div className="text-gray-500">Locked</div></div>
            <div className="text-center"><div className="text-lg font-bold text-green-600">{data.predictions.settled}</div><div className="text-gray-500">Settled</div></div>
          </div>
        </section>
      </div>
    </div>
  );
}
