'use client';

import { useEffect, useState } from 'react';
import { fantasyClient, PlayerPosition, PlayerSummary } from '../../../lib/fantasy-client';

const POSITIONS: { label: string; value: PlayerPosition | '' }[] = [
  { label: 'All', value: '' },
  { label: 'GK', value: 'GOALKEEPER' },
  { label: 'DEF', value: 'DEFENDER' },
  { label: 'MID', value: 'MIDFIELDER' },
  { label: 'FWD', value: 'FORWARD' },
];

const POS_BADGE: Record<string, string> = {
  GOALKEEPER: 'bg-yellow-100 text-yellow-800',
  DEFENDER: 'bg-blue-100 text-blue-800',
  MIDFIELDER: 'bg-green-100 text-green-800',
  FORWARD: 'bg-red-100 text-red-800',
};

export default function PlayerPoolPage() {
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [filtered, setFiltered] = useState<PlayerSummary[]>([]);
  const [position, setPosition] = useState<PlayerPosition | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fantasyClient
      .getPlayerPool()
      .then(p => { setPlayers(p); setFiltered(p); })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = players;
    if (position) list = list.filter(p => p.position === position);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.team.shortName.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [players, position, search]);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Player Pool</h1>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name or team..."
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-40"
        />
        <div className="flex gap-1">
          {POSITIONS.map(p => (
            <button
              key={p.value}
              onClick={() => setPosition(p.value as PlayerPosition | '')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                position === p.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-gray-500">Loading players...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="text-sm text-gray-500">{filtered.length} players</div>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4">#</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Pos</th>
                <th className="pb-2">Team</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 pr-4 text-gray-400 font-mono w-8">{p.number ?? '—'}</td>
                  <td className="py-2 pr-4 font-medium">{p.name}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${POS_BADGE[p.position]}`}>
                      {p.position.slice(0, 3)}
                    </span>
                  </td>
                  <td className="py-2 text-gray-600">{p.team.shortName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
