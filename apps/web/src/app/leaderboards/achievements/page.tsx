'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAchievementsLeaderboard, type LeaderboardResult } from '@/lib/leaderboards-client';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function AchievementsLeaderboardPage() {
  const [result, setResult] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAchievementsLeaderboard()
      .then(setResult)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/leaderboards" className="text-sm text-psl-navy/60 hover:text-psl-navy">Leaderboards</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-psl-navy">Achievements</h1>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        All Time · Achievements unlock once and persist across seasons
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}

      {result && !loading && (
        result.entries.length === 0 ? (
          <p className="text-gray-400 text-sm">No achievements unlocked yet.</p>
        ) : (
          <div className="space-y-2">
            {result.entries.map((e, i) => (
              <div
                key={e.userId}
                className={`flex items-center gap-4 rounded-lg p-4 ${i < 3 ? 'bg-psl-navy text-white' : 'bg-white border border-gray-100'}`}
              >
                <span className="text-xl w-8 text-center">{MEDAL[i] ?? <span className="text-sm font-mono text-gray-400">{e.rank}</span>}</span>
                <p className="flex-1 font-semibold truncate">{e.displayName ?? 'Fan'}</p>
                <span className={`font-bold text-lg ${i < 3 ? 'text-psl-gold' : 'text-psl-navy'}`}>
                  {e.totalPoints} badge{e.totalPoints !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </main>
  );
}
