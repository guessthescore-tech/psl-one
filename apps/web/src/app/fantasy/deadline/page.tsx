'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDeadline, getTransferStatus, type DeadlineInfo, type TransferStatus } from '@/lib/fantasy-rules-client';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

function Countdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Deadline passed'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  return <span>{remaining}</span>;
}

export default function DeadlinePage() {
  const [seasonId, setSeasonId] = useState('');
  const [deadline, setDeadline] = useState<DeadlineInfo | null>(null);
  const [status, setStatus] = useState<TransferStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!seasonId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const [d, s] = await Promise.allSettled([
        getDeadline(seasonId.trim()),
        getTransferStatus(),
      ]);
      if (d.status === 'fulfilled') setDeadline(d.value);
      else setError((d.reason as Error).message);
      if (s.status === 'fulfilled') setStatus(s.value);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Transfer Deadline</h1>
        <Link href="/fantasy" className="text-sm text-blue-600 underline">Back</Link>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Season ID"
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
        />
        <button
          onClick={load}
          disabled={loading || !seasonId.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {deadline && (
        <section className="border rounded p-4 mb-4">
          <h2 className="font-semibold mb-2">{deadline.gameweekName}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Transfer Deadline</p>
              <p className="font-mono">{formatDate(deadline.transferDeadlineAt)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Countdown</p>
              <p className={deadline.isLocked ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                {deadline.isLocked ? 'Locked' : <Countdown target={deadline.transferDeadlineAt} />}
              </p>
            </div>
            {deadline.firstFixtureKickoffAt && (
              <div>
                <p className="text-gray-500 text-xs">First Kickoff</p>
                <p>{formatDate(deadline.firstFixtureKickoffAt)}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {status && (
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-2">My Transfer Status</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Free Transfers</p>
              <p className="text-2xl font-bold">{status.freeTransfersAvailable}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Point Deductions</p>
              <p className="text-2xl font-bold text-red-600">-{status.totalTransferDeductions}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 text-xs">Status</p>
              <p className={status.isDeadlineLocked ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                {status.isDeadlineLocked ? 'Transfers locked' : 'Transfers open'}
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
