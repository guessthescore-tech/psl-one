'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { gameweeksClient, Gameweek, LockState } from '../../../lib/gameweeks-client';

const STATUS_BADGE: Record<string, string> = {
  UPCOMING: 'bg-gray-100 text-gray-600',
  OPEN: 'bg-green-100 text-green-700',
  LOCKED: 'bg-amber-100 text-amber-700',
  LIVE: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-slate-100 text-slate-500',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }) + ' UTC';
}

export default function GameweekDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [gw, setGw] = useState<Gameweek | null>(null);
  const [lockState, setLockState] = useState<LockState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      gameweeksClient.getOne(id),
      gameweeksClient.getLockState(id),
    ])
      .then(([g, ls]) => { setGw(g); setLockState(ls); })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!gw || !lockState) return null;

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/gameweeks" className="text-sm text-blue-600 hover:underline">← Gameweeks</Link>
          <h1 className="text-2xl font-bold mt-1">{gw.name}</h1>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_BADGE[gw.status]}`}>
          {gw.status}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Dates</div>
          <div className="text-sm space-y-1">
            <div><span className="text-gray-500">Starts: </span>{formatDate(gw.startsAt)}</div>
            <div><span className="text-gray-500">Ends: </span>{formatDate(gw.endsAt)}</div>
          </div>
        </div>

        <div className={`rounded-xl border p-4 space-y-2 ${lockState.transferLocked ? 'border-red-200 bg-red-50' : ''}`}>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Transfer Deadline</div>
          <div className="text-sm font-medium">{formatDate(gw.transferDeadlineAt)}</div>
          {lockState.transferLocked && (
            <div className="text-xs text-red-600 font-medium">Transfers are locked</div>
          )}
        </div>

        <div className={`rounded-xl border p-4 space-y-2 ${lockState.predictionLocked ? 'border-amber-200 bg-amber-50' : ''}`}>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Prediction Deadline</div>
          <div className="text-sm font-medium">{formatDate(gw.predictionDeadlineAt)}</div>
          {lockState.predictionLocked && (
            <div className="text-xs text-amber-600 font-medium">Predictions are locked</div>
          )}
        </div>

        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Fixtures</div>
          <div className="text-2xl font-bold">{gw._count.fixtures}</div>
        </div>
      </div>

      <Link
        href={`/gameweeks/${id}/fixtures`}
        className="block rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition text-center font-medium"
      >
        View all {gw._count.fixtures} fixtures →
      </Link>
    </main>
  );
}
