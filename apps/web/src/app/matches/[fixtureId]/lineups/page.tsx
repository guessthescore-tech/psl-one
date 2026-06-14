'use client';

import { use, useEffect, useState } from 'react';
import { getFixtureLineups } from '@/lib/match-centre-client';

type LineupPlayer = { playerId: string; shirtNumber?: number; position?: string; status: string; player?: { name: string } };

interface LineupsData {
  homeTeam?: { name: string };
  awayTeam?: { name: string };
  lineups?: {
    home: LineupPlayer[];
    away: LineupPlayer[];
  };
}

function renderSide(label: string, players: LineupPlayer[]) {
  const starters = players.filter(p => p.status === 'STARTING');
  const subs = players.filter(p => p.status === 'SUBSTITUTE');
  return (
    <div className="flex-1">
      <h2 className="font-semibold text-sm mb-2">{label}</h2>
      <div className="space-y-1 mb-3">
        {starters.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-right text-gray-400">{p.shirtNumber ?? '–'}</span>
            <span>{p.player?.name ?? p.playerId}</span>
            <span className="text-gray-400 ml-auto">{p.position}</span>
          </div>
        ))}
      </div>
      {subs.length > 0 && (
        <>
          <div className="text-xs text-gray-400 mb-1">Subs</div>
          {subs.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-6 text-right">{p.shirtNumber ?? '–'}</span>
              <span>{p.player?.name ?? p.playerId}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function MatchLineupsPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [data, setData] = useState<LineupsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFixtureLineups(fixtureId)
      .then(d => setData(d as LineupsData))
      .catch(e => setError(String(e)));
  }, [fixtureId]);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <a href={`/matches/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Match Overview</a>
      <h1 className="text-2xl font-bold mb-4">Lineups</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!data && !error && <p className="text-gray-400 text-sm">Loading…</p>}
      {data?.lineups && (
        <div className="flex gap-6">
          {renderSide(data.homeTeam?.name ?? 'Home', data.lineups.home)}
          <div className="w-px bg-gray-200" />
          {renderSide(data.awayTeam?.name ?? 'Away', data.lineups.away)}
        </div>
      )}
      {data && !data.lineups && <p className="text-gray-400 text-sm">No lineup data yet.</p>}
    </main>
  );
}
