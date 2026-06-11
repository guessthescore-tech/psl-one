'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { getFinalXi, type FinalXiResult } from '@/lib/fantasy-rules-client';

const POS_ABBR: Record<string, string> = {
  GOALKEEPER: 'GK',
  DEFENDER: 'DEF',
  MIDFIELDER: 'MID',
  FORWARD: 'FWD',
};

const REASON_LABEL: Record<string, string> = {
  starter: 'Starter',
  auto_sub_in: 'Sub in',
  auto_sub_out: 'Sub out',
  did_not_play: 'DNP',
  bench_boost: 'Bench Boost',
  bench_not_counted: 'Bench',
};

export default function FinalXiPage({ params }: { params: Promise<{ gameweekId: string }> }) {
  const { gameweekId } = use(params);
  const [data, setData] = useState<FinalXiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFinalXi(gameweekId)
      .then(setData)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [gameweekId]);

  if (loading) return <main className="p-4 text-sm text-gray-400">Loading…</main>;
  if (error) return <main className="p-4"><p className="text-red-600 text-sm">{error}</p></main>;
  if (!data) return null;

  const counted = data.players.filter(p => p.countedInTotal);
  const notCounted = data.players.filter(p => !p.countedInTotal);

  return (
    <main className="max-w-lg mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Final XI</h1>
          <p className="text-xs text-gray-500">Formation: <span className="font-mono font-semibold">{data.formation}</span></p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs">
          <Link href={`/fantasy/gameweeks/${gameweekId}/score`} className="text-blue-600 underline">Score</Link>
          <Link href={`/fantasy/gameweeks/${gameweekId}/auto-subs`} className="text-blue-600 underline">Auto-subs</Link>
        </div>
      </div>

      {/* Counted players */}
      <h2 className="text-sm font-semibold mb-2 text-green-700">Counted XI ({counted.length})</h2>
      <table className="w-full text-sm border-collapse mb-5">
        <thead>
          <tr className="border-b text-xs text-gray-500">
            <th className="pb-1 text-left">Player</th>
            <th className="pb-1 text-center">Pos</th>
            <th className="pb-1 text-center">Played</th>
            <th className="pb-1 text-right">Role</th>
          </tr>
        </thead>
        <tbody>
          {counted.map(p => (
            <tr key={p.playerId} className={`border-b last:border-0 ${p.reason === 'auto_sub_in' ? 'bg-green-50' : ''}`}>
              <td className="py-1.5 pr-2 font-medium">{p.playerName}</td>
              <td className="py-1.5 pr-2 text-center text-xs text-gray-500">{POS_ABBR[p.position] ?? p.position}</td>
              <td className="py-1.5 pr-2 text-center">
                {p.played
                  ? <span className="text-green-600 text-xs">Yes</span>
                  : <span className="text-red-400 text-xs">No</span>}
              </td>
              <td className="py-1.5 text-right text-xs text-gray-500">{REASON_LABEL[p.reason] ?? p.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Not counted */}
      {notCounted.length > 0 && (
        <>
          <h2 className="text-sm font-semibold mb-2 text-gray-400">Not Counted ({notCounted.length})</h2>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {notCounted.map(p => (
                <tr key={p.playerId} className="border-b last:border-0 opacity-50">
                  <td className="py-1.5 pr-2 text-gray-500">{p.playerName}</td>
                  <td className="py-1.5 pr-2 text-center text-xs text-gray-400">{POS_ABBR[p.position] ?? p.position}</td>
                  <td className="py-1.5 pr-2 text-center">
                    {p.played
                      ? <span className="text-green-600 text-xs">Yes</span>
                      : <span className="text-red-400 text-xs">No</span>}
                  </td>
                  <td className="py-1.5 text-right text-xs text-gray-400">{REASON_LABEL[p.reason] ?? p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
