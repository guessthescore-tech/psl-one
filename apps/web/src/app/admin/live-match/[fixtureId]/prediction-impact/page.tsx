'use client';

import { use, useEffect, useState } from 'react';
import { footballClient, type LiveState } from '@/lib/football-client';

export default function AdminLiveMatchPredictionImpactPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [liveState, setLiveState] = useState<LiveState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    footballClient.getFixtureLiveState(fixtureId)
      .then(setLiveState)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  const isSettled = liveState?.status === 'FINISHED';
  const isLive = liveState?.status === 'LIVE' || liveState?.status === 'HALF_TIME';

  return (
    <main className="max-w-3xl mx-auto p-6">
      <a href={`/admin/live-match/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Fixture Overview</a>
      <h1 className="text-2xl font-bold mb-4">Prediction Impact</h1>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {liveState && (
        <>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">
                {liveState.homeTeam.shortName} vs {liveState.awayTeam.shortName}
              </div>
              <div className="text-4xl font-bold my-2">
                {liveState.homeScore ?? '–'} : {liveState.awayScore ?? '–'}
              </div>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium ${
                isLive ? 'bg-red-100 text-red-700' :
                isSettled ? 'bg-gray-200 text-gray-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {liveState.status}{liveState.currentMinute ? ` ${liveState.currentMinute}'` : ''}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded-xl p-4 bg-white">
              <h2 className="text-sm font-semibold mb-2">Prediction Settlement Status</h2>
              {isSettled ? (
                <div className="text-green-700 text-sm">
                  Match finished — predictions eligible for settlement. Final: {liveState.homeScore}–{liveState.awayScore}.
                </div>
              ) : isLive ? (
                <div className="text-amber-700 text-sm">
                  Match in progress — predictions locked, awaiting full time.
                </div>
              ) : (
                <div className="text-gray-600 text-sm">
                  Match not yet started — predictions open.
                </div>
              )}
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <h2 className="text-sm font-semibold mb-2">Impact Summary</h2>
              <p className="text-xs text-gray-500 mb-3">
                Prediction impact is calculated at settlement time. Navigate to Admin &rsaquo; Gameweek Operations to trigger batch settlement.
              </p>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-semibold text-gray-700">Lock</div>
                  <div className="text-gray-400 mt-0.5">On Kick-off</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-semibold text-gray-700">Settle</div>
                  <div className="text-gray-400 mt-0.5">On Full Time</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-semibold text-gray-700">Points</div>
                  <div className="text-gray-400 mt-0.5">Awarded</div>
                </div>
              </div>
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <h2 className="text-sm font-semibold mb-2">Timeline</h2>
              <div className="space-y-1 text-xs text-gray-600">
                {liveState.startedAt && <div><span className="text-gray-400">Started:</span> {new Date(liveState.startedAt).toLocaleString()}</div>}
                {liveState.halfTimeAt && <div><span className="text-gray-400">Half Time:</span> {new Date(liveState.halfTimeAt).toLocaleString()}</div>}
                {liveState.resumedAt && <div><span className="text-gray-400">Resumed:</span> {new Date(liveState.resumedAt).toLocaleString()}</div>}
                {liveState.finishedAt && <div><span className="text-gray-400">Finished:</span> {new Date(liveState.finishedAt).toLocaleString()}</div>}
                {!liveState.startedAt && <div className="text-gray-400">Match not yet started</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
