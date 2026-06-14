'use client';

import { use, useEffect, useState } from 'react';
import { footballClient, type LiveMatchDashboard } from '@/lib/football-client';
import adminFootballClient from '@/lib/admin-football-client';

const TABS = [
  { label: 'Readiness', href: 'readiness' },
  { label: 'Lineups', href: 'lineups' },
  { label: 'Events', href: 'events' },
  { label: 'Team Stats', href: 'team-stats' },
  { label: 'Player Stats', href: 'player-stats' },
  { label: 'Fantasy Impact', href: 'fantasy-impact' },
  { label: 'Prediction Impact', href: 'prediction-impact' },
];

export default function AdminLiveMatchDetailPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [dashboard, setDashboard] = useState<LiveMatchDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  function load() {
    footballClient.getLiveMatchDashboard(fixtureId)
      .then(setDashboard)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [fixtureId]);

  async function handleAction(action: () => Promise<unknown>, label: string) {
    setActionMsg(null);
    try {
      await action();
      setActionMsg(`${label} succeeded.`);
      load();
    } catch (e) {
      setActionMsg(`${label} failed: ${String(e)}`);
    }
  }

  const fixture = dashboard?.fixture;
  const status = fixture?.status;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <a href="/admin/live-match" className="text-xs text-blue-600 underline mb-4 inline-block">← Live Match Operations</a>
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {fixture && (
        <>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                {fixture.homeTeam.shortName} vs {fixture.awayTeam.shortName}
              </h1>
              <div className="text-sm text-gray-500 mt-1">
                {new Date(fixture.kickoffAt).toLocaleString()} · {fixture.status}
                {fixture.currentMinute ? ` ${fixture.currentMinute}'` : ''}
              </div>
              {(fixture.homeScore !== null || fixture.awayScore !== null) && (
                <div className="text-3xl font-bold mt-2">
                  {fixture.homeScore ?? 0} – {fixture.awayScore ?? 0}
                </div>
              )}
            </div>
            <div className="text-right text-xs text-gray-500">
              {dashboard.events.length} events · {dashboard.lineups.length} lineup entries · {dashboard.playerStats.length} stat rows
            </div>
          </div>

          {actionMsg && (
            <div className={`text-xs mb-4 p-2 rounded ${actionMsg.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {actionMsg}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {status === 'SCHEDULED' && (
              <button onClick={() => handleAction(() => adminFootballClient.updateLiveState(fixtureId, { status: 'LIVE', currentMinute: 1 }), 'Kick Off')}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">
                Kick Off
              </button>
            )}
            {status === 'LIVE' && (
              <button onClick={() => handleAction(() => adminFootballClient.updateLiveState(fixtureId, { status: 'HALF_TIME' }), 'Half Time')}
                className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded-lg">
                Half Time
              </button>
            )}
            {status === 'HALF_TIME' && (
              <button onClick={() => handleAction(() => adminFootballClient.updateLiveState(fixtureId, { status: 'LIVE', currentMinute: 46 }), 'Second Half')}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">
                Second Half
              </button>
            )}
            {(status === 'LIVE' || status === 'HALF_TIME') && (
              <button onClick={() => handleAction(() => adminFootballClient.finaliseFixture(fixtureId), 'Full Time')}
                className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg">
                Full Time
              </button>
            )}
            {status === 'FINISHED' && (
              <button onClick={() => handleAction(() => adminFootballClient.reopenFixture(fixtureId), 'Reopen')}
                className="text-xs bg-yellow-600 text-white px-3 py-1.5 rounded-lg">
                Reopen
              </button>
            )}
            <button onClick={() => handleAction(() => adminFootballClient.recalculateState(fixtureId), 'Recalculate')}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
              Recalculate State
            </button>
            <button onClick={() => handleAction(() => adminFootballClient.syncProvider(fixtureId), 'Sync Provider')}
              className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg">
              Sync Provider
            </button>
          </div>

          <nav className="flex flex-wrap gap-2">
            {TABS.map(t => (
              <a key={t.href} href={`/admin/live-match/${fixtureId}/${t.href}`}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                {t.label}
              </a>
            ))}
          </nav>
        </>
      )}
    </main>
  );
}
