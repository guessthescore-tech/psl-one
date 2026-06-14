'use client';

import { use, useEffect, useState } from 'react';
import { footballClient, type LiveFantasyPlayerPreview } from '@/lib/football-client';

export default function MatchFantasyPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [data, setData] = useState<{ provisional: true; fixtureId: string; players: LiveFantasyPlayerPreview[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    footballClient.getLiveFantasyPreview(fixtureId)
      .then(setData)
      .catch(e => setError(String(e)));
  }, [fixtureId]);

  const sorted = data?.players.slice().sort((a, b) => b.estimatedPoints - a.estimatedPoints) ?? [];

  return (
    <main className="max-w-2xl mx-auto p-6">
      <a href={`/matches/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Match Overview</a>
      <h1 className="text-2xl font-bold mb-1">Fantasy Preview</h1>
      <p className="text-xs text-amber-600 mb-4">Provisional — points update live and are not finalised until full time.</p>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!data && !error && <p className="text-gray-400 text-sm">Loading…</p>}
      <div className="space-y-2">
        {sorted.map(p => (
          <div key={p.playerId} className="border rounded-lg p-3 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{p.playerName ?? p.playerId}</div>
              <div className="text-xs text-gray-500">{p.teamName} · {p.position}</div>
              <div className="text-xs text-gray-400 mt-1">
                {p.goals > 0 && <span className="mr-2">{p.goals}G</span>}
                {p.assists > 0 && <span className="mr-2">{p.assists}A</span>}
                {p.saves > 0 && <span className="mr-2">{p.saves} saves</span>}
                {p.cleanSheet && <span className="mr-2 text-green-600">CS</span>}
                {p.yellowCards > 0 && <span className="mr-2 text-yellow-500">{p.yellowCards}YC</span>}
                {p.redCards > 0 && <span className="mr-2 text-red-600">{p.redCards}RC</span>}
                <span className="text-gray-400">{p.minutesPlayed}&apos;</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-700">{p.estimatedPoints}</div>
              <div className="text-xs text-gray-400">est. pts</div>
            </div>
          </div>
        ))}
        {data && sorted.length === 0 && <p className="text-gray-400 text-sm">No fantasy data yet — available once lineups are confirmed.</p>}
      </div>
    </main>
  );
}
