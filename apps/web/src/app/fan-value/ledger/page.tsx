'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fanValueClient, type FanValueLedgerResponse, type FanValueType, type FanValueSourceType } from '@/lib/fan-value-client';

const VALUE_TYPES: FanValueType[] = [
  'FANTASY_POINTS', 'PREDICTION_POINTS', 'CHALLENGE_POINTS',
  'ACHIEVEMENT_POINTS', 'LOYALTY_POINTS', 'REWARD_CREDITS_READY',
];

export default function FanValueLedgerPage() {
  const [data, setData] = useState<FanValueLedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [valueType, setValueType] = useState<FanValueType | ''>('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  function load(vt: FanValueType | '', off: number) {
    setLoading(true);
    setError(null);
    fanValueClient
      .getLedger({ ...(vt ? { valueType: vt } : {}), limit, offset: off })
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(valueType, offset);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilter() {
    setOffset(0);
    load(valueType, 0);
  }

  function prev() {
    const next = Math.max(0, offset - limit);
    setOffset(next);
    load(valueType, next);
  }

  function next() {
    const nextOff = offset + limit;
    setOffset(nextOff);
    load(valueType, nextOff);
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fan Value Ledger</h1>
        <Link href="/fan-value" className="text-sm text-blue-600 underline">Summary</Link>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          value={valueType}
          onChange={e => setValueType(e.target.value as FanValueType | '')}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All types</option>
          {VALUE_TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button
          onClick={applyFilter}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Filter
        </button>
      </div>

      {error && (
        <div className="border border-red-300 rounded p-3 bg-red-50 text-sm text-red-700 mb-4">{error}</div>
      )}

      {data && (
        <>
          <p className="text-xs text-gray-500 mb-2">{data.total} entries</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Date</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Type</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Source</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">Points</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map(e => (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs text-gray-500">{new Date(e.occurredAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-xs">{e.valueType.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{e.sourceType.replace(/_/g, ' ')}</td>
                    <td className={`px-3 py-2 text-xs text-right font-medium ${e.points < 0 ? 'text-red-600' : 'text-green-700'}`}>
                      {e.points > 0 ? '+' : ''}{e.points}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${e.status === 'VOIDED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.entries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-400">No entries</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={prev}
              disabled={offset === 0 || loading}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={next}
              disabled={offset + limit >= data.total || loading}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
