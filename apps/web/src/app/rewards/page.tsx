'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  rewardsClient,
  FanReadinessOverview,
  REWARD_STATUS_LABELS,
  REWARD_STATUS_COLORS,
  REWARD_CATEGORY_LABELS,
} from '../../lib/rewards-client';

export default function RewardsPage() {
  const [overview, setOverview] = useState<FanReadinessOverview | null>(null);
  const [error, setError] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    rewardsClient.getOverview().then(setOverview).catch(e => setError(e.message));
  }, []);

  async function handleEvaluate() {
    setEvaluating(true);
    try {
      await rewardsClient.evaluate();
      const fresh = await rewardsClient.getOverview();
      setOverview(fresh);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Reward Readiness</h1>
      <p className="text-sm text-gray-500 mb-4">
        See which future reward opportunities you may be eligible for based on your Fan Value points,
        achievements, and platform activity.
      </p>

      {overview && (
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-6 text-xs text-amber-800 space-y-1">
          <p className="font-semibold">Important Notice</p>
          <p>{overview.notYetRedeemableNote}</p>
          <p>{overview.nonFinancialDisclaimer}</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {!overview && !error && <p className="text-gray-500 text-sm">Loading…</p>}

      {overview && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{overview.eligibleCount}</div>
              <div className="text-xs text-green-600 mt-1">Eligible</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{overview.ineligibleCount}</div>
              <div className="text-xs text-red-500 mt-1">Not Yet Eligible</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-gray-500">{overview.pendingCount}</div>
              <div className="text-xs text-gray-400 mt-1">Not Evaluated</div>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {evaluating ? 'Evaluating…' : 'Evaluate My Eligibility'}
            </button>
            <Link href="/rewards/eligible" className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
              View Eligible
            </Link>
            <Link href="/rewards/locked" className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
              View Locked
            </Link>
          </div>

          {overview.rows.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No reward opportunities evaluated yet. Click &quot;Evaluate My Eligibility&quot; to check your status.
            </p>
          ) : (
            <div className="space-y-3">
              {overview.rows.map(row => (
                <div key={row.definitionId} className="border rounded p-4 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{row.name}</span>
                    <span className={`text-xs font-semibold ${REWARD_STATUS_COLORS[row.status]}`}>
                      {REWARD_STATUS_LABELS[row.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{row.description}</p>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {REWARD_CATEGORY_LABELS[row.category]}
                  </span>
                  {row.status !== 'ELIGIBLE' && row.unlockHint && (
                    <p className="text-xs text-blue-600 mt-2">{row.unlockHint}</p>
                  )}
                  {row.notRedeemableNote && (
                    <p className="text-xs text-amber-600 mt-1 italic">{row.notRedeemableNote}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
