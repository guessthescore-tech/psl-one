'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { listInvalidPrices } from '@/lib/fantasy-price-calibration-client';

interface InvalidPrice {
  playerId: string;
  playerName: string;
  position: string;
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  violation: 'BELOW_MINIMUM' | 'ABOVE_MAXIMUM';
}

export default function InvalidPricesPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [prices, setPrices] = useState<InvalidPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listInvalidPrices(seasonId)
      .then(data => setPrices(Array.isArray(data) ? data : []))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [seasonId]);

  const first = prices[0];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/fantasy-price-calibration/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Calibration Overview</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Prices</h1>
      {first && (
        <p className="text-gray-500 mb-6">
          Allowed range: {first.minPrice}–{first.maxPrice} · {prices.length} player{prices.length !== 1 ? 's' : ''} with invalid prices
        </p>
      )}

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      {!loading && prices.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400">
          <p className="text-lg mb-2">All prices are within valid range</p>
        </div>
      )}

      {prices.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium text-right">Current Price</th>
                <th className="px-4 py-3 font-medium">Violation</th>
                <th className="px-4 py-3 font-medium">Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {prices.map(p => (
                <tr key={p.playerId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.playerName}</td>
                  <td className="px-4 py-3 text-gray-600">{p.position}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">{p.currentPrice}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      {p.violation === 'BELOW_MINIMUM' ? `Below min (${p.minPrice})` : `Above max (${p.maxPrice})`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/fantasy-price-calibration/${seasonId}/players`} className="text-blue-600 hover:underline text-xs">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
