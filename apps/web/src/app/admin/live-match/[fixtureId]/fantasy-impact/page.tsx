'use client';

import { use, useEffect, useState } from 'react';
import { footballClient, type LiveFantasyPlayerPreview } from '@/lib/football-client';

export default function AdminLiveMatchFantasyImpactPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [data, setData] = useState<{ provisional: true; fixtureId: string; players: LiveFantasyPlayerPreview[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    footballClient.getLiveFantasyPreview(fixtureId)
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  const sorted = data?.players.slice().sort((a, b) => b.estimatedPoints - a.estimatedPoints) ?? [];

  const totalPts = sorted.reduce((s, p) => s + p.estimatedPoints, 0);
  const highScorers = sorted.filter(p => p.estimatedPoints >= 8);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <a href={`/admin/live-match/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Fixture Overview</a>
      <h1 className="text-2xl font-bold mb-1">Fantasy Impact</h1>
      <p className="text-xs text-amber-600 mb-4">Provisional estimates — not finalised until full time.</p>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <div className="bg-white border rounded-xl p-3">
            <div className="text-2xl font-bold text-purple-700">{sorted.length}</div>
            <div className="text-xs text-gray-500">Players</div>
          </div>
          <div className="bg-white border rounded-xl p-3">
            <div className="text-2xl font-bold">{totalPts}</div>
            <div className="text-xs text-gray-500">Total Est. Pts</div>
          </div>
          <div className="bg-white border rounded-xl p-3">
            <div className="text-2xl font-bold text-green-600">{highScorers.length}</div>
            <div className="text-xs text-gray-500">High Scorers (8+)</div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map(p => (
          <div key={p.playerId} className="border rounded-lg p-3 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{p.playerName ?? p.playerId}</div>
              <div className="text-xs text-gray-500">{p.teamName} · {p.position}</div>
              <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                <span>{p.minutesPlayed}&apos;</span>
                {p.goals > 0 && <span className="text-green-600">{p.goals} goals</span>}
                {p.assists > 0 && <span className="text-blue-600">{p.assists} assists</span>}
                {p.cleanSheet && <span className="text-teal-600">Clean Sheet</span>}
                {p.saves > 0 && <span>{p.saves} saves</span>}
                {p.yellowCards > 0 && <span className="text-yellow-500">{p.yellowCards} YC</span>}
                {p.redCards > 0 && <span className="text-red-600">{p.redCards} RC</span>}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${p.estimatedPoints >= 8 ? 'text-green-600' : p.estimatedPoints >= 4 ? 'text-blue-600' : 'text-gray-600'}`}>
                {p.estimatedPoints}
              </div>
              <div className="text-xs text-gray-400">est. pts</div>
            </div>
          </div>
        ))}
        {!loading && !error && sorted.length === 0 && (
          <p className="text-gray-400 text-sm">No fantasy data yet — available once lineups are confirmed and match is live.</p>
        )}
      </div>
    </main>
  );
}
