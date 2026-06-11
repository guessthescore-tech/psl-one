'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gameweeksClient, Gameweek } from '../../lib/gameweeks-client';

const STATUS_BADGE: Record<string, string> = {
  UPCOMING: 'bg-gray-100 text-gray-600',
  OPEN: 'bg-green-100 text-green-700',
  LOCKED: 'bg-amber-100 text-amber-700',
  LIVE: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-slate-100 text-slate-500',
};

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export default function GameweeksPage() {
  const [gameweeks, setGameweeks] = useState<Gameweek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gameweeksClient
      .getAll()
      .then(setGameweeks)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading gameweeks...</div>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gameweeks</h1>

      {error && <div className="text-red-600">{error}</div>}

      <div className="space-y-2">
        {gameweeks.map(gw => (
          <Link
            key={gw.id}
            href={`/gameweeks/${gw.id}`}
            className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition"
          >
            <div className="text-sm font-mono text-gray-400 w-6">{gw.round}</div>
            <div className="flex-1">
              <div className="font-semibold">{gw.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Transfer deadline: {formatDeadline(gw.transferDeadlineAt)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{gw._count.fixtures} fixtures</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[gw.status]}`}>
                {gw.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
