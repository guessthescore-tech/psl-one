'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOverallLeaderboard, type LeaderboardResult } from '@/lib/leaderboards-client';

const MEDAL = ['🥇', '🥈', '🥉'];

function OverallLeaderboard() {
  const searchParams = useSearchParams();
  const seasonSlug = searchParams.get('seasonSlug') ?? undefined;
  const [result, setResult] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOverallLeaderboard(seasonSlug)
      .then(setResult)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [seasonSlug]);

  return (
    <>
      {result && (
        <p className="text-xs text-gray-400 mb-4">
          {result.seasonName ?? 'All Time'} · {result.scope} · Points-only · Non-financial
        </p>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}

      {result && !loading && (
        result.entries.length === 0 ? (
          <p className="text-gray-400 text-sm">No entries yet for this season.</p>
        ) : (
          <div className="space-y-2">
            {result.entries.map((e, i) => (
              <div
                key={e.userId}
                className={`flex items-center gap-4 rounded-lg p-4 ${i < 3 ? 'bg-psl-navy text-white' : 'bg-white border border-gray-100'}`}
              >
                <span className="text-xl w-8 text-center">{MEDAL[i] ?? <span className="text-sm font-mono text-gray-400">{e.rank}</span>}</span>
                <p className="flex-1 font-semibold truncate">{e.displayName ?? 'Fan'}</p>
                <span className={`font-bold text-lg ${i < 3 ? 'text-psl-gold' : 'text-psl-navy'}`}>{e.totalPoints}</span>
              </div>
            ))}
          </div>
        )
      )}
    </>
  );
}

export default function OverallLeaderboardPage() {
  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/leaderboards" className="text-sm text-psl-navy/60 hover:text-psl-navy">Leaderboards</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-psl-navy">Overall</h1>
      </div>
      <Suspense fallback={<p className="text-gray-400 text-sm">Loading…</p>}>
        <OverallLeaderboard />
      </Suspense>
    </main>
  );
}
