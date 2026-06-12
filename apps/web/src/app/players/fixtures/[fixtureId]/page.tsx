'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { listFixtureStats } from '@/lib/players-client';

interface FixtureStat {
  id: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  cleanSheet: boolean;
  rating: number | null;
  started: boolean;
  player: { id: string; name: string; position: string; number: number | null };
  team: { id: string; name: string; shortName: string } | null;
}

interface FixtureStatsData {
  fixture: {
    id: string; kickoffAt: string; status: string;
    homeTeam: { id: string; name: string };
    awayTeam: { id: string; name: string };
  };
  stats: FixtureStat[];
}

const POS_ORDER = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'];

export default function FixtureStatsPage() {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const [data, setData] = useState<FixtureStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listFixtureStats(fixtureId)
      .then((d) => setData(d as FixtureStatsData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  const sorted = data?.stats.slice().sort((a, b) => POS_ORDER.indexOf(a.player.position) - POS_ORDER.indexOf(b.player.position));

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/players" className="hover:text-gray-600">Players</Link>
        <span>/</span>
        <span className="text-gray-600">Fixture Stats</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">
        {data ? `${data.fixture.homeTeam.name} vs ${data.fixture.awayTeam.name}` : 'Fixture Stats'}
      </h1>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">{new Date(data.fixture.kickoffAt).toLocaleDateString()} · {data.fixture.status}</p>

          {sorted && sorted.length === 0 && (
            <p className="text-sm text-gray-400">No published stats for this fixture yet.</p>
          )}

          {sorted && sorted.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-6 gap-2 px-4 py-2 bg-gray-50 text-xs text-gray-500 font-semibold border-b border-gray-100">
                <span className="col-span-2">Player</span>
                <span className="text-center">Min</span>
                <span className="text-center">G</span>
                <span className="text-center">A</span>
                <span className="text-center">Rtg</span>
              </div>
              {sorted.map((s) => (
                <div key={s.id} className="grid grid-cols-6 gap-2 px-4 py-2 border-b border-gray-50 last:border-0">
                  <div className="col-span-2">
                    <Link href={`/players/${s.player.id}`} className="text-xs font-semibold text-blue-700 hover:underline">
                      {s.player.name}
                    </Link>
                    <p className="text-xs text-gray-400">{s.player.position.charAt(0)}{s.team ? ` · ${s.team.shortName}` : ''}</p>
                  </div>
                  <span className="text-xs text-center self-center">{s.minutesPlayed}</span>
                  <span className="text-xs text-center self-center">{s.goals}</span>
                  <span className="text-xs text-center self-center">{s.assists}</span>
                  <span className="text-xs text-center self-center">{s.rating?.toFixed(1) ?? '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
