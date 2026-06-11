'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { getGameweekLeaderboard, type GameweekLeaderboardRow } from '@/lib/fantasy-rules-client';

export default function GameweekLeaderboardPage({ params }: { params: Promise<{ gameweekId: string }> }) {
  const { gameweekId } = use(params);
  const [rows, setRows] = useState<GameweekLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGameweekLeaderboard(gameweekId)
      .then(setRows)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [gameweekId]);

  if (loading) return <main className="p-4 text-sm text-gray-400">Loading…</main>;
  if (error) return <main className="p-4"><p className="text-red-600 text-sm">{error}</p></main>;

  return (
    <main className="max-w-lg mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Gameweek Leaderboard</h1>
        <Link href="/fantasy/leaderboard" className="text-sm text-blue-600 underline">Overall</Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">No scores yet for this gameweek.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-xs text-gray-500">
              <th className="pb-2 pr-2">#</th>
              <th className="pb-2 pr-2">Team</th>
              <th className="pb-2 pr-2">Manager</th>
              <th className="pb-2 pr-2 text-right">Gross</th>
              <th className="pb-2 text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.fantasyTeamId} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 pr-2 font-bold text-gray-500">{r.rank}</td>
                <td className="py-2 pr-2 font-medium">{r.teamName}</td>
                <td className="py-2 pr-2 text-xs text-gray-400">{r.managerName}</td>
                <td className="py-2 pr-2 text-right text-gray-500">{r.grossPoints}</td>
                <td className="py-2 text-right font-bold">{r.netPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
