'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { listPricedPlayers, updatePlayerPrice } from '@/lib/fantasy-price-calibration-client';

interface Player {
  playerId: string;
  playerName: string;
  position: string;
  teamId: string;
  teamName: string;
  registrationStatus: string;
  fantasyPrice: number | null;
  hasPrice: boolean;
  isPriceValid: boolean | null;
}

export default function PlayersPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  function load() {
    listPricedPlayers(seasonId)
      .then(data => setPlayers(Array.isArray(data) ? data : []))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [seasonId]);

  async function save(playerId: string) {
    setSaveMsg(null);
    setError(null);
    try {
      await updatePlayerPrice(seasonId, playerId, Number(newPrice));
      setSaveMsg('Price updated');
      setEditing(null);
      load();
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/fantasy-price-calibration/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Calibration Overview</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Player Prices ({players.length})</h1>
      <p className="text-sm text-gray-500 mb-6">Fantasy prices are game-value points only — no cash value.</p>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}
      {saveMsg && <p className="text-green-600 bg-green-50 rounded p-3 mb-4">{saveMsg}</p>}

      {players.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-3 py-3 font-medium">Player</th>
                <th className="px-3 py-3 font-medium">Position</th>
                <th className="px-3 py-3 font-medium">Team</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium text-right">Fantasy Price</th>
                <th className="px-3 py-3 font-medium">Valid</th>
                <th className="px-3 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {players.map(p => (
                <tr key={p.playerId} className="hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium">{p.playerName}</td>
                  <td className="px-3 py-3 text-gray-600">{p.position}</td>
                  <td className="px-3 py-3 text-gray-600">{p.teamName}</td>
                  <td className="px-3 py-3">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{p.registrationStatus}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    {editing === p.playerId ? (
                      <input
                        type="number"
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        className="w-20 border rounded px-2 py-0.5 text-sm text-right"
                        autoFocus
                      />
                    ) : (
                      <span className={p.hasPrice ? '' : 'text-gray-400 italic'}>{p.fantasyPrice ?? 'not set'}</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {p.isPriceValid === true && <span className="text-green-600 text-xs">✓</span>}
                    {p.isPriceValid === false && <span className="text-red-600 text-xs">✗ out of range</span>}
                    {p.isPriceValid === null && <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    {editing === p.playerId ? (
                      <div className="flex gap-1">
                        <button onClick={() => save(p.playerId)} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Save</button>
                        <button onClick={() => setEditing(null)} className="text-xs text-gray-600 hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditing(p.playerId); setNewPrice(String(p.fantasyPrice ?? '')); }} className="text-xs text-blue-600 hover:underline">
                        Edit
                      </button>
                    )}
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
