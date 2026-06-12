'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPlayerSeasonStats } from '@/lib/players-client';

interface SeasonStatEntry {
  id: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  cleanSheet: boolean;
  rating: number | null;
  fixture: {
    id: string;
    kickoffAt: string;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
    homeTeam: { id: string; name: string; shortName: string };
    awayTeam: { id: string; name: string; shortName: string };
  };
}

interface PlayerSeasonData {
  player: { id: string; name: string; position: string; number: number | null; team: { name: string; slug: string } };
  seasonId: string;
  totals: { appearances: number; goals: number; assists: number; minutesPlayed: number; yellowCards: number; redCards: number; cleanSheets: number };
  matches: SeasonStatEntry[];
}

export default function PlayerSeasonStatsPage() {
  const { playerId, seasonId } = useParams<{ playerId: string; seasonId: string }>();
  const [data, setData] = useState<PlayerSeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlayerSeasonStats(playerId, seasonId)
      .then((d) => setData(d as PlayerSeasonData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [playerId, seasonId]);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/players" className="hover:text-gray-600">Players</Link>
        <span>/</span>
        <Link href={`/players/${playerId}`} className="hover:text-gray-600">{data?.player.name ?? playerId}</Link>
        <span>/</span>
        <span className="text-gray-600">Season Stats</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">
        {data ? `${data.player.name} — Season Stats` : 'Player Season Stats'}
      </h1>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Apps', value: data.totals.appearances },
              { label: 'Goals', value: data.totals.goals },
              { label: 'Assists', value: data.totals.assists },
              { label: 'Minutes', value: data.totals.minutesPlayed },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Match-by-Match</h2>
            </div>
            {data.matches.length === 0 ? (
              <p className="text-xs text-gray-400 p-4">No published stats yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.matches.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {m.fixture.homeTeam.shortName} {m.fixture.homeScore ?? '?'}–{m.fixture.awayScore ?? '?'} {m.fixture.awayTeam.shortName}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(m.fixture.kickoffAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-600">
                      {m.goals > 0 && <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded">{m.goals}G</span>}
                      {m.assists > 0 && <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{m.assists}A</span>}
                      {m.rating && <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">{m.rating.toFixed(1)}</span>}
                      <span>{m.minutesPlayed}&apos;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
