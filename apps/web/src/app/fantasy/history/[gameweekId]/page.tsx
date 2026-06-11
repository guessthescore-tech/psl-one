'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { getGameweekHistoryDetail, getAutoSubs, type GameweekScoreDetail, type AutoSubResult } from '@/lib/fantasy-rules-client';

export default function GameweekHistoryDetailPage({ params }: { params: Promise<{ gameweekId: string }> }) {
  const { gameweekId } = use(params);
  const [score, setScore] = useState<GameweekScoreDetail | null>(null);
  const [autoSubs, setAutoSubs] = useState<AutoSubResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getGameweekHistoryDetail(gameweekId),
      getAutoSubs(gameweekId).catch(() => null),
    ])
      .then(([s, a]) => { setScore(s); setAutoSubs(a); })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [gameweekId]);

  if (loading) return <main className="p-4 text-sm text-gray-400">Loading…</main>;
  if (error) return <main className="p-4"><p className="text-red-600 text-sm">{error}</p></main>;
  if (!score) return null;

  const starters = score.playerScores.filter(p => p.isStarter);
  const bench = score.playerScores.filter(p => p.isBench);

  return (
    <main className="max-w-lg mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{score.gameweek.name}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gameweek score breakdown</p>
        </div>
        <Link href="/fantasy/history" className="text-sm text-blue-600 underline">History</Link>
      </div>

      {/* Score summary */}
      <div className="border rounded bg-white divide-y mb-4">
        <div className="flex justify-between px-4 py-2 text-sm">
          <span className="text-gray-500">Gross points</span>
          <span className="font-medium">{score.grossPoints}</span>
        </div>
        {score.transferCost > 0 && (
          <div className="flex justify-between px-4 py-2 text-sm">
            <span className="text-gray-500">Transfer deductions</span>
            <span className="text-red-500 font-medium">−{score.transferCost}</span>
          </div>
        )}
        {score.captainPoints > 0 && (
          <div className="flex justify-between px-4 py-2 text-sm">
            <span className="text-gray-500">Captain bonus</span>
            <span className="text-green-600 font-medium">+{score.captainPoints}</span>
          </div>
        )}
        {score.benchPoints > 0 && (
          <div className="flex justify-between px-4 py-2 text-sm">
            <span className="text-gray-500">Bench points{score.chipPoints > 0 ? ' (Bench Boost)' : ''}</span>
            <span className="text-gray-600">{score.benchPoints}</span>
          </div>
        )}
        <div className="flex justify-between px-4 py-2 text-sm font-bold border-t bg-gray-50">
          <span>Net points</span>
          <span className="text-lg">{score.netPoints}</span>
        </div>
        {score.rank != null && (
          <div className="flex justify-between px-4 py-2 text-sm">
            <span className="text-gray-500">Rank</span>
            <span>#{score.rank}</span>
          </div>
        )}
      </div>

      {/* Starting XI */}
      <h2 className="text-sm font-semibold mb-2">Starting XI</h2>
      <table className="w-full text-sm border-collapse mb-4">
        <thead>
          <tr className="border-b text-xs text-gray-500">
            <th className="pb-1 text-left">Player</th>
            <th className="pb-1 text-center">Pos</th>
            <th className="pb-1 text-right">Base</th>
            <th className="pb-1 text-right">×</th>
            <th className="pb-1 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {starters.map(p => (
            <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-1.5 pr-2">
                <span className="font-medium">{p.player.name}</span>
                {p.isCaptain && <span className="ml-1 text-xs text-purple-600 font-bold">(C)</span>}
                {p.isViceCaptain && p.reason === 'vc_stepped_up' && (
                  <span className="ml-1 text-xs text-orange-500 font-bold">(VC→C)</span>
                )}
                {p.isViceCaptain && p.reason !== 'vc_stepped_up' && (
                  <span className="ml-1 text-xs text-gray-400">(VC)</span>
                )}
              </td>
              <td className="py-1.5 pr-2 text-center text-xs text-gray-500">{p.player.position[0]}</td>
              <td className="py-1.5 pr-2 text-right text-gray-500">{p.basePoints}</td>
              <td className="py-1.5 pr-2 text-right text-xs text-gray-400">
                {p.multiplier > 1 ? `×${p.multiplier}` : ''}
              </td>
              <td className="py-1.5 text-right font-bold">{p.multipliedPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bench */}
      {bench.length > 0 && (
        <>
          <h2 className="text-sm font-semibold mb-2 text-gray-500">
            Bench {score.chipPoints > 0 ? '(Bench Boost active)' : ''}
          </h2>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {bench.map(p => (
                <tr key={p.id} className={`border-b last:border-0 ${p.countedInTotal ? 'bg-green-50' : ''}`}>
                  <td className="py-1.5 pr-2">
                    <span className={p.countedInTotal ? 'font-medium' : 'text-gray-400'}>{p.player.name}</span>
                  </td>
                  <td className="py-1.5 pr-2 text-center text-xs text-gray-500">{p.player.position[0]}</td>
                  <td className="py-1.5 text-right text-gray-500">{p.basePoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Auto-substitutions */}
      {autoSubs && autoSubs.substitutions.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Auto-Substitutions</h2>
            {autoSubs.formationBefore !== autoSubs.formationAfter && (
              <span className="text-xs text-gray-400 font-mono">
                {autoSubs.formationBefore} → {autoSubs.formationAfter}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {autoSubs.substitutions.map((sub, i) => (
              <div key={i} className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg border ${
                sub.status === 'APPLIED' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex items-center gap-2">
                  {sub.status === 'APPLIED' ? (
                    <>
                      <span className="text-red-500 line-through text-xs">{sub.outPlayerName}</span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className="text-green-700 font-medium text-xs">{sub.inPlayerName}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">{sub.outPlayerName} — {sub.reason.replace(/_/g, ' ')}</span>
                  )}
                </div>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  sub.status === 'APPLIED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {sub.status === 'APPLIED' ? 'In' : 'Skip'}
                </span>
              </div>
            ))}
          </div>
          <Link href={`/fantasy/gameweeks/${gameweekId}/auto-subs`} className="text-xs text-blue-600 underline mt-1 inline-block">
            Full auto-sub detail →
          </Link>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <Link
          href={`/fantasy/leaderboard/gameweek/${gameweekId}`}
          className="text-sm text-blue-600 underline"
        >
          Gameweek leaderboard →
        </Link>
        <Link
          href={`/fantasy/gameweeks/${gameweekId}/final-xi`}
          className="text-sm text-blue-600 underline"
        >
          Final XI →
        </Link>
      </div>
    </main>
  );
}
