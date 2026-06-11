'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { leaderboardsClient, type LeaderboardEntry } from '@/lib/challenges-client';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function PredictionsLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    leaderboardsClient.getPredictionsLeaderboard()
      .then(data => { setEntries(data); setLoading(false); })
      .catch(() => { setError('Could not load leaderboard'); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <p className="text-white text-sm">Loading leaderboard…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-psl-navy p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/predictions" className="text-white/60 hover:text-white text-sm">Predictions</Link>
        <span className="text-white/30">/</span>
        <h1 className="text-xl font-bold text-white">Leaderboard</h1>
      </div>

      {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

      {entries.length === 0 ? (
        <p className="text-white/60 text-sm">No predictions have been settled yet.</p>
      ) : (
        <div className="max-w-lg space-y-2">
          {entries.map((entry, idx) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 rounded-lg p-4 ${idx < 3 ? 'bg-white' : 'bg-white/10'}`}
            >
              <span className="text-xl w-8 text-center">
                {MEDAL[idx] ?? <span className="text-white/60 text-sm font-mono">{entry.rank}</span>}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${idx < 3 ? 'text-psl-navy' : 'text-white'}`}>
                  {entry.displayName ?? 'Fan'}
                </p>
                <p className={`text-xs ${idx < 3 ? 'text-gray-400' : 'text-white/40'}`}>
                  {entry.predictionCount} prediction{entry.predictionCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${idx < 3 ? 'text-psl-gold' : 'text-psl-gold/80'}`}>
                  {entry.totalPoints}
                </p>
                <p className={`text-xs ${idx < 3 ? 'text-gray-400' : 'text-white/40'}`}>pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
