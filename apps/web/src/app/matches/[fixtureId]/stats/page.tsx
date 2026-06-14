'use client';

import { use, useEffect, useState } from 'react';
import { getFixtureStats } from '@/lib/match-centre-client';

interface MatchStats {
  homeTeam?: { name: string };
  awayTeam?: { name: string };
  stats?: {
    home?: Record<string, number | string>;
    away?: Record<string, number | string>;
  };
  dataProvenance?: { dataStatus: string };
}

const STAT_LABELS: Record<string, string> = {
  shots: 'Shots',
  shotsOnTarget: 'Shots on Target',
  possession: 'Possession %',
  corners: 'Corners',
  fouls: 'Fouls',
  yellowCards: 'Yellow Cards',
  redCards: 'Red Cards',
  offsides: 'Offsides',
  saves: 'Saves',
};

export default function MatchStatsPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [data, setData] = useState<MatchStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFixtureStats(fixtureId)
      .then(d => setData(d as MatchStats))
      .catch(e => setError(String(e)));
  }, [fixtureId]);

  const keys = data?.stats ? Object.keys(data.stats.home ?? {}) : [];

  return (
    <main className="max-w-xl mx-auto p-6">
      <a href={`/matches/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Match Overview</a>
      <h1 className="text-2xl font-bold mb-4">Match Stats</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!data && !error && <p className="text-gray-400 text-sm">Loading…</p>}
      {data?.stats && (
        <div>
          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-3">
            <span>{data.homeTeam?.name ?? 'Home'}</span>
            <span>{data.awayTeam?.name ?? 'Away'}</span>
          </div>
          <div className="space-y-3">
            {keys.map(k => (
              <div key={k}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{data.stats!.home?.[k] ?? 0}</span>
                  <span className="text-xs text-gray-500">{STAT_LABELS[k] ?? k}</span>
                  <span className="font-medium">{data.stats!.away?.[k] ?? 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {data && !data.stats && <p className="text-gray-400 text-sm">No stats available yet.</p>}
      {data?.dataProvenance && (
        <p className="mt-4 text-xs text-gray-400">Status: {data.dataProvenance.dataStatus}</p>
      )}
    </main>
  );
}
