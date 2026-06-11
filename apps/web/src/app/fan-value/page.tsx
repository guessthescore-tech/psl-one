'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fanValueClient, type FanValueSummary } from '@/lib/fan-value-client';

const ALL_VALUE_TYPES = [
  { key: 'FANTASY_POINTS', label: 'Fantasy Points' },
  { key: 'PREDICTION_POINTS', label: 'Prediction Points' },
  { key: 'CHALLENGE_POINTS', label: 'Challenge Points' },
  { key: 'ACHIEVEMENT_POINTS', label: 'Achievement Points' },
  { key: 'LOYALTY_POINTS', label: 'Loyalty Points' },
  { key: 'REWARD_CREDITS_READY', label: 'Reward Credits Ready' },
];

export default function FanValuePage() {
  const [summary, setSummary] = useState<FanValueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fanValueClient.getSummary()
      .then(setSummary)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fan Value</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/fan-value/ledger" className="text-blue-600 underline">Ledger</Link>
          <Link href="/fan-value/by-type" className="text-blue-600 underline">By Type</Link>
          <Link href="/fan-value/by-source" className="text-blue-600 underline">By Source</Link>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && (
        <div className="border border-red-300 rounded p-3 bg-red-50 text-sm text-red-700 mb-4">{error}</div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-3">
            <div className="border rounded p-3 text-center col-span-2 sm:col-span-1">
              <p className="text-2xl font-bold">{summary.totalPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Total Fan Value</p>
            </div>
            <div className="border rounded p-3 text-center">
              <p className="text-2xl font-bold">{summary.totalEntries.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Entries</p>
            </div>
          </div>

          <section className="border rounded p-4 mb-4">
            <h2 className="text-sm font-semibold mb-3">Points by Type</h2>
            <div className="space-y-2">
              {ALL_VALUE_TYPES.map(({ key, label }) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{label}</span>
                  <span className={`font-medium ${(summary.byType[key] ?? 0) === 0 ? 'text-gray-300' : ''}`}>
                    {(summary.byType[key] ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {summary.recentEntries.length > 0 && (
            <section className="border rounded p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold">Recent Activity</h2>
                <Link href="/fan-value/ledger" className="text-xs text-blue-600 underline">View all</Link>
              </div>
              <div className="space-y-2">
                {summary.recentEntries.map(e => (
                  <div key={e.id} className="flex justify-between items-start text-sm">
                    <div>
                      <span className="text-gray-700">{e.valueType.replace(/_/g, ' ')}</span>
                      {e.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{e.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <span className={`font-medium ${e.points < 0 ? 'text-red-600' : 'text-green-700'}`}>
                        {e.points > 0 ? '+' : ''}{e.points}
                      </span>
                      <p className="text-xs text-gray-400">{new Date(e.occurredAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {summary.recentEntries.length === 0 && (
            <div className="border rounded p-4 mb-4 text-center">
              <p className="text-sm text-gray-400">No fan value earned yet.</p>
              <p className="text-xs text-gray-400 mt-1">Play Fantasy, make predictions, and complete challenges to earn points.</p>
            </div>
          )}

          <p className="text-xs text-gray-400 italic">{summary.nonFinancialDisclaimer}</p>
        </>
      )}
    </main>
  );
}
