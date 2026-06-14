'use client';

import { useEffect, useState } from 'react';
import { adminListAllListings, adminGetListing, adminVoidMatch } from '@/lib/admin-social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [filters, setFilters] = useState({ fixtureMarketId: '', status: '', fanUserId: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const p: Record<string, string> = {};
      if (filters.fixtureMarketId) p['fixtureMarketId'] = filters.fixtureMarketId;
      if (filters.status) p['status'] = filters.status;
      if (filters.fanUserId) p['fanUserId'] = filters.fanUserId;
      const d = await adminListAllListings(getBetaToken(), p as { fixtureMarketId?: string; status?: string; fanUserId?: string });
      setListings(Array.isArray(d) ? d : []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const statusColour: Record<string, string> = {
    OPEN: 'text-green-700 bg-green-50',
    PARTIALLY_MATCHED: 'text-yellow-700 bg-yellow-50',
    FULLY_MATCHED: 'text-blue-700 bg-blue-50',
    WITHDRAWN: 'text-gray-500 bg-gray-100',
    SETTLED: 'text-purple-700 bg-purple-50',
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">All Challenge Listings</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input className="border rounded px-2 py-1.5 text-sm" placeholder="Market ID" value={filters.fixtureMarketId} onChange={e => setFilters(f => ({ ...f, fixtureMarketId: e.target.value }))} />
        <select className="border rounded px-2 py-1.5 text-sm" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All statuses</option>
          {['OPEN', 'PARTIALLY_MATCHED', 'FULLY_MATCHED', 'WITHDRAWN', 'SETTLED', 'EXPIRED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input className="border rounded px-2 py-1.5 text-sm" placeholder="Fan User ID" value={filters.fanUserId} onChange={e => setFilters(f => ({ ...f, fanUserId: e.target.value }))} />
        <button className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm" onClick={load}>Filter</button>
      </div>

      {msg && <p className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{msg}</p>}
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Fan</th>
              <th className="px-3 py-2 text-left">Selection</th>
              <th className="px-3 py-2 text-right">Committed</th>
              <th className="px-3 py-2 text-right">Matched</th>
              <th className="px-3 py-2 text-center">Status</th>
              <th className="px-3 py-2 text-center">Multiplier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.map(l => (
              <tr key={String(l['id'])} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs text-gray-500">{String(l['fanUserId']).slice(0, 12)}…</td>
                <td className="px-3 py-2">{String(l['supportingSelection'])}</td>
                <td className="px-3 py-2 text-right">{String(l['committedPoints'])} pts</td>
                <td className="px-3 py-2 text-right">{String(l['matchedPoints'] ?? 0)} pts</td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColour[String(l['status'])] ?? 'bg-gray-100 text-gray-600'}`}>
                    {String(l['status'])}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">{String(l['confidenceMultiplier'])}×</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && listings.length === 0 && (
          <p className="text-gray-400 text-sm p-4">No listings found.</p>
        )}
      </div>
    </main>
  );
}
