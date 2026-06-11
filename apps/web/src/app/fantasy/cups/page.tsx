'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMyCups, type Cup } from '@/lib/fantasy-rules-client';

export default function CupsPage() {
  const [cups, setCups] = useState<Cup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyCups()
      .then(setCups)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="p-4 text-sm text-gray-500">Loading…</main>;

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Cups</h1>
        <Link href="/fantasy" className="text-sm text-blue-600 underline">Back</Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {cups.length === 0 ? (
        <p className="text-gray-500 text-sm">Not in any cups yet.</p>
      ) : (
        <div className="space-y-3">
          {cups.map(cup => (
            <div key={cup.id} className="border rounded p-4">
              <h2 className="font-semibold">{cup.name}</h2>
              <p className="text-xs text-gray-500 mb-2">{cup.rounds.length} round{cup.rounds.length !== 1 ? 's' : ''}</p>
              {cup.rounds.length > 0 && (
                <ul className="text-xs text-gray-600 space-y-1">
                  {cup.rounds.map(r => (
                    <li key={r.id}>{r.roundName}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
