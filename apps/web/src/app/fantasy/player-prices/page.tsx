'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getPlayerPrices, type PlayerPriceInfo } from '@/lib/fantasy-rules-client';

export default function PlayerPricesPage() {
  const [seasonId, setSeasonId] = useState('');
  const [prices, setPrices] = useState<PlayerPriceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!seasonId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setPrices(await getPlayerPrices(seasonId.trim()));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Player Prices</h1>
        <Link href="/fantasy" className="text-sm text-blue-600 underline">Back</Link>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Season ID"
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
        />
        <button
          onClick={load}
          disabled={loading || !seasonId.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {prices.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 pr-4">Player</th>
              <th className="pb-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {prices.map(p => (
              <tr key={p.playerId} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 pr-4">{p.playerName}</td>
                <td className="py-2 text-right font-mono">{(p.currentPrice / 10).toFixed(1)}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && prices.length === 0 && seasonId && (
        <p className="text-gray-500 text-sm">No prices found for this season.</p>
      )}
    </main>
  );
}
