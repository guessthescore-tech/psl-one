'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fanValueClient, type AdminPlatformSummary } from '@/lib/fan-value-client';

export default function AdminFanValuePage() {
  const [summary, setSummary] = useState<AdminPlatformSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fanValueClient.adminGetSummary()
      .then(setSummary)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fan Value — Admin</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/fan-value/post-entry" className="text-blue-600 underline">Post Entry</Link>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && (
        <div className="border border-red-300 rounded p-3 bg-red-50 text-sm text-red-700 mb-4">{error}</div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="border rounded p-3 text-center">
              <p className="text-2xl font-bold">{summary.totalPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Total Points</p>
            </div>
            <div className="border rounded p-3 text-center">
              <p className="text-2xl font-bold">{summary.totalEntries.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Entries</p>
            </div>
            <div className="border rounded p-3 text-center">
              <p className="text-2xl font-bold">{summary.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Users</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
            <section className="border rounded p-4">
              <h2 className="text-sm font-semibold mb-3">By Value Type</h2>
              <div className="space-y-2">
                {Object.entries(summary.byType).map(([type, pts]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-600">{type.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{(pts as number).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="border rounded p-4">
              <h2 className="text-sm font-semibold mb-3">By Source</h2>
              <div className="space-y-2">
                {Object.entries(summary.bySource).map(([source, pts]) => (
                  <div key={source} className="flex justify-between text-sm">
                    <span className="text-gray-600">{source.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{(pts as number).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="border rounded p-4">
            <h2 className="text-sm font-semibold mb-3">Recent Entries</h2>
            {summary.recentEntries.length === 0 ? (
              <p className="text-sm text-gray-400">No entries</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="text-left py-1 pr-3">User</th>
                      <th className="text-left py-1 pr-3">Type</th>
                      <th className="text-right py-1 pr-3">Points</th>
                      <th className="text-left py-1">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentEntries.map(e => (
                      <tr key={e.id} className="border-b">
                        <td className="py-1 pr-3 font-mono text-gray-500">{e.userId.slice(0, 8)}…</td>
                        <td className="py-1 pr-3">{e.valueType.replace(/_/g, ' ')}</td>
                        <td className={`py-1 pr-3 text-right font-medium ${e.points < 0 ? 'text-red-600' : ''}`}>
                          {e.points > 0 ? '+' : ''}{e.points}
                        </td>
                        <td className="py-1 text-gray-500">{new Date(e.occurredAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* User lookup */}
          <section className="border rounded p-4 mt-4">
            <h2 className="text-sm font-semibold mb-2">User Ledger Lookup</h2>
            <UserLookup />
          </section>

          <p className="mt-4 text-xs text-gray-400 italic">{summary.nonFinancialDisclaimer}</p>
        </>
      )}
    </main>
  );
}

function UserLookup() {
  const [userId, setUserId] = useState('');

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="User UUID"
        value={userId}
        onChange={e => setUserId(e.target.value)}
        className="flex-1 border rounded px-3 py-2 text-sm"
      />
      <Link
        href={userId.trim() ? `/admin/fan-value/users/${userId.trim()}` : '#'}
        className={`px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 ${!userId.trim() ? 'pointer-events-none opacity-50' : ''}`}
      >
        View
      </Link>
    </div>
  );
}
