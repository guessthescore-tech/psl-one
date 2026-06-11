'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getGameweekHistory, type GameweekScoreSummary } from '@/lib/fantasy-rules-client';

export default function FantasyHistoryPage() {
  const [history, setHistory] = useState<GameweekScoreSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGameweekHistory()
      .then(setHistory)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const totalNet = history.reduce((s, h) => s + h.netPoints, 0);

  if (loading) return <main className="p-4 text-sm text-gray-400">Loading…</main>;
  if (error) return <main className="p-4"><p className="text-red-600 text-sm">{error}</p></main>;

  return (
    <main className="max-w-lg mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Points History</h1>
        <Link href="/fantasy" className="text-sm text-blue-600 underline">Fantasy</Link>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-gray-400">No gameweek scores yet.</p>
      ) : (
        <>
          <div className="border rounded bg-white px-4 py-2 mb-4 flex justify-between text-sm">
            <span className="text-gray-500">Season total</span>
            <span className="font-bold text-lg">{totalNet} pts</span>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500">
                <th className="pb-2 pr-2">Gameweek</th>
                <th className="pb-2 pr-2 text-right">Gross</th>
                <th className="pb-2 pr-2 text-right">Deduct</th>
                <th className="pb-2 pr-2 text-right">Net</th>
                <th className="pb-2 text-right">Rank</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 pr-2">
                    <Link
                      href={`/fantasy/history/${h.gameweekId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {h.gameweek.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-2 text-right text-gray-600">{h.grossPoints}</td>
                  <td className="py-2 pr-2 text-right text-red-500">
                    {h.transferCost > 0 ? `-${h.transferCost}` : '—'}
                  </td>
                  <td className="py-2 pr-2 text-right font-bold">{h.netPoints}</td>
                  <td className="py-2 text-right text-gray-500 text-xs">
                    {h.rank != null ? `#${h.rank}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
