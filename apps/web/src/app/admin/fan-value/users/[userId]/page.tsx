'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { fanValueClient, type FanValueLedgerResponse } from '@/lib/fan-value-client';

export default function AdminUserFanValuePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [data, setData] = useState<FanValueLedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voidEntryId, setVoidEntryId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidError, setVoidError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  function load(off: number) {
    setLoading(true);
    setError(null);
    fanValueClient.adminGetUserLedger(userId, { limit, offset: off })
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(0); }, [userId]);

  async function voidEntry(entry: { id: string }) {
    if (!voidReason.trim()) return;
    try {
      await fanValueClient.adminVoidEntry(entry.id, voidReason.trim());
      setVoidEntryId(null);
      setVoidReason('');
      load(offset);
    } catch (e: unknown) {
      setVoidError(e instanceof Error ? e.message : 'Failed');
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">User Fan Value Ledger</h1>
          <p className="text-xs text-gray-500 font-mono mt-1">{userId}</p>
        </div>
        <Link href="/admin/fan-value" className="text-sm text-blue-600 underline">Admin Summary</Link>
      </div>

      {error && (
        <div className="border border-red-300 rounded p-3 bg-red-50 text-sm text-red-700 mb-4">{error}</div>
      )}
      {voidError && (
        <div className="border border-red-300 rounded p-3 bg-red-50 text-sm text-red-700 mb-4">{voidError}</div>
      )}

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

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
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {data.entries.map(e => (
                  <>
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
                      <td className="px-3 py-2">
                        {e.status === 'POSTED' && (
                          <button
                            onClick={() => { setVoidEntryId(e.id); setVoidReason(''); setVoidError(null); }}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Void
                          </button>
                        )}
                      </td>
                    </tr>
                    {voidEntryId === e.id && (
                      <tr key={`${e.id}-void`} className="border-b bg-red-50">
                        <td colSpan={6} className="px-3 py-2">
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Void reason"
                              value={voidReason}
                              onChange={ev => setVoidReason(ev.target.value)}
                              className="flex-1 border rounded px-2 py-1 text-xs"
                            />
                            <button
                              onClick={() => voidEntry(e)}
                              disabled={!voidReason.trim()}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              Confirm void
                            </button>
                            <button
                              onClick={() => setVoidEntryId(null)}
                              className="px-3 py-1 border rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {data.entries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-400">No entries</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { const next = Math.max(0, offset - limit); setOffset(next); load(next); }}
              disabled={offset === 0 || loading}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => { const next = offset + limit; setOffset(next); load(next); }}
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
