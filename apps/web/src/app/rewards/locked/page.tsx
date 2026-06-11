'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  rewardsClient,
  FanLockedRewards,
  REWARD_CATEGORY_LABELS,
} from '../../../lib/rewards-client';

export default function LockedRewardsPage() {
  const [data, setData] = useState<FanLockedRewards | null>(null);
  const [error, setError] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    rewardsClient.getLocked().then(setData).catch(e => setError(e.message));
  }, []);

  async function handleEvaluate() {
    setEvaluating(true);
    try {
      await rewardsClient.evaluate();
      const fresh = await rewardsClient.getLocked();
      setData(fresh);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Locked Reward Opportunities</h1>
        <Link href="/rewards" className="text-sm text-blue-600 hover:underline">← Back</Link>
      </div>

      {data && (
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-6 text-xs text-amber-800">
          <p className="font-semibold mb-1">Important Notice</p>
          <p>{data.nonFinancialDisclaimer}</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {!data && !error && <p className="text-gray-500 text-sm">Loading…</p>}

      {data && (
        <>
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {evaluating ? 'Evaluating…' : 'Re-check Eligibility'}
            </button>
          </div>

          {data.lockedCount === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No locked reward opportunities — you may be eligible for everything available!
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{data.lockedCount} locked reward {data.lockedCount === 1 ? 'opportunity' : 'opportunities'}.</p>
              {data.locked.map(row => (
                <div key={row.definitionId} className="border rounded p-4 bg-white border-l-4 border-l-gray-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-700">{row.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      Locked
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{row.description}</p>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {REWARD_CATEGORY_LABELS[row.category]}
                  </span>

                  {row.unmetRequirements.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-red-600 mb-1">Requirements needed:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {row.unmetRequirements.map((r, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-red-400 mt-0.5">✗</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {row.metRequirements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-green-600 mb-1">Already met:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {row.metRequirements.map((r, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">✓</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {row.unlockHint && (
                    <p className="text-xs text-blue-600 mt-2">{row.unlockHint}</p>
                  )}
                  <p className="text-xs text-amber-600 mt-2 italic">{row.notRedeemableNote}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
