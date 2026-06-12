'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { listSeasonTopPerformers } from '@/lib/players-client';

interface PerformerEntry {
  player: { id: string; name: string; position: string; team: { id: string; name: string; shortName: string } };
  goals: number;
  assists: number;
  appearances: number;
  minutesPlayed: number;
}

interface TopPerformersData {
  season: { id: string; name: string; slug: string };
  topScorers: PerformerEntry[];
  topAssists: PerformerEntry[];
}

export default function TopPerformersPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<TopPerformersData | null>(null);
  const [tab, setTab] = useState<'scorers' | 'assists'>('scorers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSeasonTopPerformers(seasonId, 15)
      .then((d) => setData(d as TopPerformersData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [seasonId]);

  const rows = tab === 'scorers' ? data?.topScorers : data?.topAssists;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/players" className="hover:text-gray-600">Players</Link>
        <span>/</span>
        <span className="text-gray-600">Top Performers</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">
        {data ? `Top Performers — ${data.season.name}` : 'Top Performers'}
      </h1>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['scorers', 'assists'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {t === 'scorers' ? 'Top Scorers' : 'Top Assists'}
              </button>
            ))}
          </div>

          {rows && rows.length === 0 && <p className="text-sm text-gray-400">No stats published yet.</p>}

          {rows && rows.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {rows.map((p, i) => (
                <div key={p.player.id} className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/players/${p.player.id}/season/${seasonId}`} className="text-sm font-semibold text-blue-700 hover:underline">
                      {p.player.name}
                    </Link>
                    <p className="text-xs text-gray-400">{p.player.team.name} · {p.player.position}</p>
                  </div>
                  <div className="flex gap-4 text-xs text-center">
                    <div><p className="font-bold text-gray-900">{tab === 'scorers' ? p.goals : p.assists}</p><p className="text-gray-400">{tab === 'scorers' ? 'Goals' : 'Assists'}</p></div>
                    <div><p className="font-bold text-gray-900">{p.appearances}</p><p className="text-gray-400">Apps</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
