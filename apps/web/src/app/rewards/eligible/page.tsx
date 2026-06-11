'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  rewardsClient,
  FanEligibleRewards,
  REWARD_CATEGORY_LABELS,
} from '../../../lib/rewards-client';

export default function EligibleRewardsPage() {
  const [data, setData] = useState<FanEligibleRewards | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    rewardsClient.getEligible().then(setData).catch(e => setError(e.message));
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Eligible Reward Opportunities</h1>
        <Link href="/rewards" className="text-sm text-blue-600 hover:underline">← Back</Link>
      </div>

      {data && (
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-6 text-xs text-amber-800 space-y-1">
          <p className="font-semibold">Important Notice</p>
          <p>{data.notYetRedeemableNote}</p>
          <p>{data.nonFinancialDisclaimer}</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {!data && !error && <p className="text-gray-500 text-sm">Loading…</p>}

      {data && data.eligibleCount === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No eligible reward opportunities yet.</p>
          <p className="text-sm mb-4">Earn Fan Value points, complete achievements, and engage with the platform to unlock reward opportunities.</p>
          <Link href="/rewards" className="text-blue-600 text-sm hover:underline">View all reward opportunities</Link>
        </div>
      )}

      {data && data.rewards.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">You are eligible for {data.eligibleCount} reward {data.eligibleCount === 1 ? 'opportunity' : 'opportunities'}.</p>
          {data.rewards.map(row => (
            <div key={row.definitionId} className="border rounded p-4 bg-white border-l-4 border-l-green-500">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{row.name}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Eligible
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{row.description}</p>
              {row.sponsorName && (
                <p className="text-xs text-purple-600 mb-1">Sponsor: {row.sponsorName}</p>
              )}
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                {REWARD_CATEGORY_LABELS[row.category]}
              </span>
              {row.metRequirements.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-green-700 mb-1">Requirements met:</p>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {row.metRequirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-500 mt-0.5">✓</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-amber-600 mt-3 italic">{row.notRedeemableNote}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
