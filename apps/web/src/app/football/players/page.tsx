'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { footballClient, type Player } from '@/lib/football-client';

const POSITION_LABEL: Record<string, string> = {
  GOALKEEPER: 'GK',
  DEFENDER: 'DEF',
  MIDFIELDER: 'MID',
  FORWARD: 'FWD',
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    footballClient.getActiveSeason()
      .then((season) => footballClient.listPlayers({ seasonSlug: season.slug }))
      .then(setPlayers)
      .catch(() => setError('Could not load players for the active season'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <nav className="text-gray-400 text-sm mb-6">
          <Link href="/football" className="hover:text-white transition">Football</Link>
          <span className="mx-2">›</span>
          <span className="text-white">Players</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-6">Players</h1>

        {loading && <p className="text-gray-400 text-sm">Loading…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="space-y-1">
          {players.map(p => (
            <div key={p.id} className="bg-white rounded px-4 py-3 flex items-center gap-3">
              <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded w-10 text-center">
                {POSITION_LABEL[p.position] ?? p.position}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-psl-navy font-medium text-sm truncate">{p.name}</p>
                {p.team && (
                  <p className="text-gray-400 text-xs">{p.team.name}</p>
                )}
              </div>
              {p.number != null && (
                <span className="text-gray-300 text-sm">#{p.number}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
