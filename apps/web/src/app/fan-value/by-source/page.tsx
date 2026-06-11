'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fanValueClient, type FanValueBySource } from '@/lib/fan-value-client';

export default function FanValueBySourcePage() {
  const [data, setData] = useState<FanValueBySource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fanValueClient.getBySource()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  const total = data?.reduce((s, row) => s + row.totalPoints, 0) ?? 0;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fan Value — By Source</h1>
        <Link href="/fan-value" className="text-sm text-blue-600 underline">Summary</Link>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && (
        <div className="border border-red-300 rounded p-3 bg-red-50 text-sm text-red-700 mb-4">{error}</div>
      )}

      {data && (
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Source Type</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Points</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Entries</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Share</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.sourceType} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{row.sourceType.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{row.totalPoints.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">{row.entryCount}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">
                    {total > 0 ? `${((row.totalPoints / total) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-400">No data</td>
                </tr>
              )}
            </tbody>
            {data.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t">
                  <td className="px-4 py-2 text-xs font-semibold">Total</td>
                  <td className="px-4 py-2 text-xs font-semibold text-right">{total.toLocaleString()}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </main>
  );
}
