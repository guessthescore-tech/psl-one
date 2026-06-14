'use client';

import { use, useEffect, useState } from 'react';
import { footballClient, type FixtureLineup } from '@/lib/football-client';
import adminFootballClient, { type AddMatchEventPayload } from '@/lib/admin-football-client';

export default function AdminLiveMatchLineupsPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [lineups, setLineups] = useState<FixtureLineup[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  function load() {
    footballClient.getFixtureLineups(fixtureId)
      .then(setLineups)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [fixtureId]);

  async function fireLineupConfirmed() {
    try {
      const payload: AddMatchEventPayload = { eventType: 'OTHER', minute: 0, description: 'Lineup confirmed' };
      await adminFootballClient.addMatchEvent(fixtureId, payload);
      setMsg('Lineup-confirmed event fired.');
    } catch (e) {
      setMsg(`Failed: ${String(e)}`);
    }
  }

  const home = lineups.filter(l => l.team.id === lineups[0]?.team.id);
  const away = lineups.filter(l => l.team.id !== lineups[0]?.team.id);

  function renderSide(label: string, players: FixtureLineup[]) {
    const starters = players.filter(p => p.status === 'STARTING');
    const subs = players.filter(p => p.status === 'SUBSTITUTE');
    return (
      <div className="flex-1">
        <h2 className="font-semibold text-sm mb-2">{label}</h2>
        <div className="space-y-1 mb-3">
          {starters.map(p => (
            <div key={p.playerId} className="flex items-center gap-2 text-xs">
              <span className="w-6 text-right text-gray-400">{p.shirtNumber ?? '–'}</span>
              <span>{p.player.name}</span>
              <span className="text-gray-400 ml-auto">{p.position ?? p.player.position}</span>
            </div>
          ))}
        </div>
        {subs.length > 0 && (
          <>
            <div className="text-xs text-gray-400 mb-1">Subs</div>
            {subs.map(p => (
              <div key={p.playerId} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-6 text-right">{p.shirtNumber ?? '–'}</span>
                <span>{p.player.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <a href={`/admin/live-match/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Fixture Overview</a>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Lineups</h1>
        <button onClick={fireLineupConfirmed} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">
          Fire Lineup Confirmed
        </button>
      </div>
      {msg && <p className={`text-xs mb-4 p-2 rounded ${msg.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</p>}
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {!loading && lineups.length === 0 && <p className="text-gray-400 text-sm">No lineup data submitted yet.</p>}
      {lineups.length > 0 && (
        <div className="flex gap-6 bg-white border rounded-xl p-4">
          {renderSide(home[0]?.team.shortName ?? 'Home', home)}
          <div className="w-px bg-gray-100" />
          {renderSide(away[0]?.team.shortName ?? 'Away', away)}
        </div>
      )}
    </main>
  );
}
