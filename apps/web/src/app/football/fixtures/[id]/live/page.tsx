'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { footballClient, type LiveState } from '@/lib/football-client';

function LiveBadge({ status, minute }: { status: string; minute: number | null }) {
  if (status === 'LIVE')
    return (
      <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        LIVE{minute != null ? ` ${minute}'` : ''}
      </span>
    );
  if (status === 'HALF_TIME')
    return <span className="inline-block bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">HT</span>;
  if (status === 'FINISHED')
    return <span className="inline-block bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">FT</span>;
  return <span className="inline-block bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{status}</span>;
}

export default function FixtureLivePage() {
  const { id: fixtureId } = useParams<{ id: string }>();
  const [state, setState] = useState<LiveState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await footballClient.getFixtureLiveState(fixtureId);
      setState(d);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, [fixtureId]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 15000);
    return () => clearInterval(interval);
  }, [load]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!state) return <div className="p-6 text-gray-400 animate-pulse">Loading live state…</div>;

  const isLive = state.status === 'LIVE' || state.status === 'HALF_TIME';

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/football" className="hover:underline">Football</Link>
        {' / '}
        <Link href={`/football/match-centre/${fixtureId}`} className="hover:underline">Match Centre</Link>
        {' / '}
        <span>Live</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
        <div className="mb-3">
          <LiveBadge status={state.status} minute={state.currentMinute} />
        </div>

        <div className="flex items-center justify-center gap-8 mt-4">
          <div className="flex-1 text-right">
            <p className="text-xl font-bold text-gray-900">{state.homeTeam.name}</p>
          </div>
          <div className="text-5xl font-mono font-bold text-gray-900 min-w-[7rem] text-center">
            {state.homeScore ?? 0} – {state.awayScore ?? 0}
          </div>
          <div className="flex-1 text-left">
            <p className="text-xl font-bold text-gray-900">{state.awayTeam.name}</p>
          </div>
        </div>

        {state.period && (
          <p className="mt-3 text-sm text-gray-500 capitalize">{state.period.replace('_', ' ')}</p>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <Link
            href={`/football/match-centre/${fixtureId}`}
            className="text-sm text-psl-600 hover:underline"
          >
            Full match centre →
          </Link>
        </div>

        {isLive && (
          <p className="mt-4 text-xs text-gray-400">
            Auto-refreshes every 15s
            {lastRefresh && ` · Last updated ${lastRefresh.toLocaleTimeString()}`}
          </p>
        )}
      </div>
    </div>
  );
}
