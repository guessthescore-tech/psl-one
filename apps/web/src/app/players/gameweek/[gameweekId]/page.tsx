'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { listGameweekStats } from '@/lib/players-client';

interface GWStat {
  id: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  rating: number | null;
  player: { id: string; name: string; position: string; number: number | null };
  fixture: { id: string; kickoffAt: string; homeTeam: { id: string; name: string }; awayTeam: { id: string; name: string } };
  team: { id: string; name: string; shortName: string } | null;
}

interface GameweekStatsData {
  gameweek: { id: string; name: string; round: number; season: { id: string; name: string } };
  stats: GWStat[];
}

export default function GameweekStatsPage() {
  const { gameweekId } = useParams<{ gameweekId: string }>();
  const [data, setData] = useState<GameweekStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listGameweekStats(gameweekId)
      .then((d) => setData(d as GameweekStatsData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [gameweekId]);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/players" className="hover:text-gray-600">Players</Link>
        <span>/</span>
        <span className="text-gray-600">Gameweek Stats</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">
        {data ? `${data.gameweek.name} — Player Stats` : 'Gameweek Stats'}
      </h1>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">{data.gameweek.season.name} · Round {data.gameweek.round}</p>

          {data.stats.length === 0 && <p className="text-sm text-gray-400">No published stats for this gameweek.</p>}

          {data.stats.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 gap-1 px-4 py-2 bg-gray-50 text-xs text-gray-500 font-semibold border-b border-gray-100">
                <span className="col-span-2">Player</span>
                <span className="text-center">Fixture</span>
                <span className="text-center">Min</span>
                <span className="text-center">G</span>
                <span className="text-center">A</span>
                <span className="text-center">Rtg</span>
              </div>
              {data.stats.map((s) => (
                <div key={s.id} className="grid grid-cols-7 gap-1 px-4 py-2 border-b border-gray-50 last:border-0">
                  <div className="col-span-2">
                    <Link href={`/players/${s.player.id}`} className="text-xs font-semibold text-blue-700 hover:underline truncate block">
                      {s.player.name}
                    </Link>
                    <p className="text-xs text-gray-400">{s.team?.shortName ?? ''}</p>
                  </div>
                  <span className="text-xs text-center self-center text-gray-500 truncate">
                    {s.fixture.homeTeam.name.substring(0, 3)} v {s.fixture.awayTeam.name.substring(0, 3)}
                  </span>
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
