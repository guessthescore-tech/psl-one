'use client';

import { useEffect, useState } from 'react';
import { fanGetSocialLeaderboard } from '@/lib/social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

interface LeaderboardEntry {
  rank: number;
  fanUserId: string;
  displayName: string;
  pointsAwarded: number;
}

export default function SocialLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [seasonId, setSeasonId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');

  async function load() {
    if (!seasonId) return;
    setLoading(true);
    setError(null);
    try {
      const d = await fanGetSocialLeaderboard(getBetaToken(), { seasonId });
      setEntries(d.leaderboard ?? []);
      setNote(d.safetyNote ?? '');
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Social Prediction Leaderboard</h1>
      <p className="text-xs text-gray-500 mb-5">
        Rankings are based on gameplay points only. Points have no monetary value.
      </p>

      <div className="flex gap-2 mb-6">
        <input
          className="border rounded px-3 py-1.5 text-sm flex-1"
          placeholder="Season ID"
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm"
          onClick={load}
          disabled={!seasonId}
        >
          Load
        </button>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {entries.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Rank</th>
                <th className="px-4 py-2 text-left">Fan</th>
                <th className="px-4 py-2 text-right">Points Awarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map(e => (
                <tr key={e.fanUserId} className={e.rank <= 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-4 py-2 font-bold text-gray-700">#{e.rank}</td>
                  <td className="px-4 py-2">{e.displayName || e.fanUserId}</td>
                  <td className="px-4 py-2 text-right font-semibold text-green-700">{e.pointsAwarded} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && entries.length === 0 && seasonId && (
        <p className="text-gray-400 text-sm">No leaderboard data yet for this season.</p>
      )}

      {note && (
        <p className="mt-4 text-xs text-gray-400 border-t pt-3">{note}</p>
      )}
    </main>
  );
}
