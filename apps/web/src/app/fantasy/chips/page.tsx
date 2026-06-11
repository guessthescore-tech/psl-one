'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getChips, activateChip, cancelChip, type Chip } from '@/lib/fantasy-rules-client';

const CHIP_LABELS: Record<string, string> = {
  BENCH_BOOST: 'Bench Boost',
  FREE_HIT: 'Free Hit',
  TRIPLE_CAPTAIN: 'Triple Captain',
  WILDCARD: 'Wildcard',
};

const CHIP_DESCRIPTIONS: Record<string, string> = {
  BENCH_BOOST: 'All 15 players score points this gameweek.',
  FREE_HIT: 'Make unlimited free transfers for one gameweek.',
  TRIPLE_CAPTAIN: 'Your captain scores 3x points this gameweek.',
  WILDCARD: 'Make unlimited free transfers permanently.',
};

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  ACTIVE: 'bg-blue-100 text-blue-800',
  USED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-yellow-100 text-yellow-800',
  EXPIRED: 'bg-red-100 text-red-600',
};

export default function ChipsPage() {
  const [chips, setChips] = useState<Chip[]>([]);
  const [gameweekId, setGameweekId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    getChips()
      .then(setChips)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  async function handleActivate(chipId: string) {
    if (!gameweekId.trim()) { setActionError('Enter a gameweek ID first'); return; }
    setActionError(null);
    try {
      const updated = await activateChip(chipId, gameweekId.trim());
      setChips(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (e) {
      setActionError((e as Error).message);
    }
  }

  async function handleCancel(chipId: string) {
    setActionError(null);
    try {
      const updated = await cancelChip(chipId);
      setChips(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (e) {
      setActionError((e as Error).message);
    }
  }

  if (loading) return <main className="p-4 text-sm text-gray-500">Loading chips…</main>;

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Chips</h1>
        <Link href="/fantasy" className="text-sm text-blue-600 underline">Back</Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {actionError && <p className="text-red-600 text-sm mb-3">{actionError}</p>}

      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">Gameweek ID (for activation)</label>
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Enter gameweek UUID"
          value={gameweekId}
          onChange={e => setGameweekId(e.target.value)}
        />
      </div>

      {chips.length === 0 && (
        <p className="text-gray-500 text-sm">No chips available. Create a fantasy team first.</p>
      )}

      <div className="space-y-3">
        {chips.map(chip => (
          <div key={chip.id} className="border rounded p-4">
            <div className="flex items-start justify-between mb-1">
              <h2 className="font-semibold">{CHIP_LABELS[chip.type] ?? chip.type}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[chip.status] ?? ''}`}>
                {chip.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{CHIP_DESCRIPTIONS[chip.type]}</p>
            {chip.activatedAt && (
              <p className="text-xs text-gray-500 mb-2">
                Activated: {new Date(chip.activatedAt).toLocaleString()}
                {chip.gameweekId && ` (GW: ${chip.gameweekId.slice(0, 8)}…)`}
              </p>
            )}
            <div className="flex gap-2">
              {chip.status === 'AVAILABLE' && (
                <button
                  onClick={() => handleActivate(chip.id)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Activate
                </button>
              )}
              {chip.status === 'ACTIVE' && (
                <button
                  onClick={() => handleCancel(chip.id)}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
