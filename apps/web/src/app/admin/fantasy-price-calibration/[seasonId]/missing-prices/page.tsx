'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { listMissingPrices, bulkApplyDefaults } from '@/lib/fantasy-price-calibration-client';

interface MissingPlayer {
  playerId: string;
  playerName: string;
  position: string;
  teamId: string;
  registrationStatus: string;
}

export default function MissingPricesPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [players, setPlayers] = useState<MissingPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listMissingPrices(seasonId)
      .then(data => setPlayers(Array.isArray(data) ? data : []))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [seasonId]);

  async function applyDefaults() {
    setBulkLoading(true);
    setMsg(null);
    setError(null);
    try {
      const result = await bulkApplyDefaults(seasonId);
      setMsg(`Applied ${result.applied} default prices, skipped ${result.skipped} already-priced players`);
      load();
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/fantasy-price-calibration/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Calibration Overview</Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Missing Prices</h1>
          <p className="text-gray-500 mt-1">{players.length} player{players.length !== 1 ? 's' : ''} without a fantasy price</p>
        </div>
        <button
          onClick={applyDefaults}
          disabled={bulkLoading}
          className="bg-gray-700 text-white text-sm px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {bulkLoading ? 'Applying…' : 'Apply Default Prices'}
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}
      {msg && <p className="text-green-600 bg-green-50 rounded p-3 mb-4">{msg}</p>}

      {!loading && players.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400">
          <p className="text-lg mb-2">All players have prices set</p>
        </div>
      )}

      {players.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Registration Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {players.map(p => (
                <tr key={p.playerId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.playerName}</td>
                  <td className="px-4 py-3 text-gray-600">{p.position}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{p.registrationStatus}</span></td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/fantasy-price-calibration/${seasonId}/players`} className="text-blue-600 hover:underline text-xs">
                      Set Price
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
