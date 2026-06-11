'use client';

import { useEffect, useState } from 'react';
import { fantasyClient, LeaderboardEntry } from '../../../lib/fantasy-client';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function FantasyLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fantasyClient
      .getLeaderboard()
      .then(setEntries)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Fantasy Leaderboard</h1>

      {loading && <div className="text-gray-500">Loading leaderboard...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && entries.length === 0 && (
        <div className="text-gray-500">No fantasy teams have scored points yet.</div>
      )}

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 rounded-xl border border-gray-100 px-4 py-3"
            >
              <div className="w-8 text-center text-lg font-bold">
                {index < 3 ? MEDALS[index] : <span className="text-gray-400 text-sm">{index + 1}</span>}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{entry.name}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{entry.totalPoints}</div>
                <div className="text-xs text-gray-400">pts</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
