'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { footballClient, type Team, type Player } from '@/lib/football-client';

const POSITION_ORDER = { GOALKEEPER: 1, DEFENDER: 2, MIDFIELDER: 3, FORWARD: 4 };

export default function TeamDetailPage() {
  const params = useParams();
  const slug = params['slug'] as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    Promise.all([footballClient.getTeam(slug), footballClient.getTeamPlayers(slug)])
      .then(([t, p]) => { setTeam(t); setPlayers(p); })
      .catch(() => setError('Team not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <p className="text-white text-sm">Loading…</p>
      </main>
    );
  }

  if (error || !team) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Team not found'}</p>
          <Link href="/football/teams" className="text-psl-gold underline text-sm">Back to teams</Link>
        </div>
      </main>
    );
  }

  const byPosition = players.reduce<Record<string, Player[]>>((acc, p) => {
    (acc[p.position] ??= []).push(p);
    return acc;
  }, {});

  const positionGroups = Object.entries(byPosition).sort(
    ([a], [b]) => (POSITION_ORDER[a as keyof typeof POSITION_ORDER] ?? 99) - (POSITION_ORDER[b as keyof typeof POSITION_ORDER] ?? 99),
  );

  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <nav className="text-gray-400 text-sm mb-6">
          <Link href="/football" className="hover:text-white transition">Football</Link>
          <span className="mx-2">›</span>
          <Link href="/football/teams" className="hover:text-white transition">Teams</Link>
          <span className="mx-2">›</span>
          <span className="text-white">{team.name}</span>
        </nav>

        <div className="bg-white rounded-lg px-6 py-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-psl-navy">{team.name}</h1>
              <p className="text-gray-500 text-sm">{team.country}</p>
            </div>
            <span className="bg-psl-navy text-psl-gold text-sm font-bold px-3 py-1 rounded">
              {team.shortName}
            </span>
          </div>
        </div>

        <h2 className="text-white font-semibold mb-3">Squad</h2>

        <div className="space-y-4">
          {positionGroups.map(([position, posPlayers]) => (
            <div key={position}>
              <p className="text-psl-gold text-xs font-semibold uppercase tracking-wider mb-2">{position}</p>
              <div className="space-y-1">
                {posPlayers.map(p => (
                  <div key={p.id} className="bg-white rounded px-4 py-2.5 flex items-center gap-3">
                    {p.number != null && (
                      <span className="text-psl-navy font-bold text-sm w-6 text-right">{p.number}</span>
                    )}
                    <span className="text-psl-navy text-sm font-medium">{p.name}</span>
                    <span className="text-gray-400 text-xs ml-auto">{p.nationality}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
