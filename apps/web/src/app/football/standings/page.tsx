'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { footballClient, type StandingGroup } from '@/lib/football-client';

function StandingTable({ group }: { group: StandingGroup }) {
  return (
    <div className="mb-6">
      <h2 className="text-psl-gold text-sm font-semibold uppercase tracking-wider mb-2">
        Group {group.groupName}
      </h2>
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] text-xs font-semibold text-gray-400 px-4 py-2 border-b border-gray-100">
          <span>Team</span>
          <span className="w-7 text-center">P</span>
          <span className="w-7 text-center">W</span>
          <span className="w-7 text-center">D</span>
          <span className="w-7 text-center">L</span>
          <span className="w-8 text-center font-bold text-psl-navy">Pts</span>
        </div>
        {group.standings.map((s, i) => (
          <div
            key={s.id}
            className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center px-4 py-3 text-sm ${
              i < group.standings.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-gray-300 w-4 text-right shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <p className="font-semibold text-psl-navy truncate">{s.team.name}</p>
                <p className="text-gray-400 text-xs">{s.goalsFor}–{s.goalsAgainst} GD {s.goalsFor - s.goalsAgainst >= 0 ? '+' : ''}{s.goalsFor - s.goalsAgainst}</p>
              </div>
            </div>
            <span className="w-7 text-center text-gray-600">{s.played}</span>
            <span className="w-7 text-center text-gray-600">{s.won}</span>
            <span className="w-7 text-center text-gray-600">{s.drawn}</span>
            <span className="w-7 text-center text-gray-600">{s.lost}</span>
            <span className="w-8 text-center font-bold text-psl-navy">{s.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StandingsPage() {
  const [groups, setGroups] = useState<StandingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    footballClient.listStandings()
      .then(setGroups)
      .catch(() => setError('Could not load standings'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <nav className="text-gray-400 text-sm mb-6">
          <Link href="/football" className="hover:text-white transition">Football</Link>
          <span className="mx-2">›</span>
          <span className="text-white">Standings</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-6">Group Standings</h1>

        {loading && <p className="text-gray-400 text-sm">Loading…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {groups.map(g => <StandingTable key={g.groupName} group={g} />)}

        {!loading && groups.length === 0 && !error && (
          <p className="text-gray-400 text-sm text-center py-8">No standings available.</p>
        )}
      </div>
    </main>
  );
}
