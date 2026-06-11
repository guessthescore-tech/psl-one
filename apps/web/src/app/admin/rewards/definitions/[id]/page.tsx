'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { rewardsClient, EligibleFansResult } from '../../../../../lib/rewards-client';

export default function EligibleFansPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<EligibleFansResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    rewardsClient.adminGetEligibleFans(id).then(setData).catch(e => setError(e.message));
  }, [id]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Eligible Fans</h1>
          {data && <p className="text-sm text-gray-500 mt-1">{data.definitionName}</p>}
          <Link href="/admin/rewards/definitions" className="text-sm text-blue-600 hover:underline">← Definitions</Link>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {!data && !error && <p className="text-gray-500 text-sm">Loading…</p>}

      {data && (
        <>
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4 text-sm text-green-700">
            {data.total} fan{data.total !== 1 ? 's' : ''} eligible for <strong>{data.definitionName}</strong>.
          </div>

          {data.total === 0 ? (
            <p className="text-gray-400 text-sm">No fans are eligible for this reward definition yet.</p>
          ) : (
            <div className="border rounded bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Email</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">User ID</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Evaluated At</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Met Requirements</th>
                  </tr>
                </thead>
                <tbody>
                  {data.fans.map(fan => (
                    <tr key={fan.userId} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{fan.email}</td>
                      <td className="px-4 py-2 font-mono text-xs text-gray-400">{fan.userId.slice(0, 8)}…</td>
                      <td className="px-4 py-2 text-xs text-gray-500">
                        {fan.evaluatedAt ? new Date(fan.evaluatedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600">
                        {fan.metRequirements.join(', ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.total > data.fans.length && (
                <div className="px-4 py-2 text-xs text-gray-400 border-t">
                  Showing {data.fans.length} of {data.total} eligible fans.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
