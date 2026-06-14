'use client';

import { use, useEffect, useRef, useState } from 'react';
import { footballClient, type LiveState } from '@/lib/football-client';

export default function MatchPredictionsPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [liveState, setLiveState] = useState<LiveState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function fetchState() {
    footballClient.getFixtureLiveState(fixtureId)
      .then(setLiveState)
      .catch(e => setError(String(e)));
  }

  useEffect(() => {
    fetchState();
    intervalRef.current = setInterval(fetchState, 15_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId]);

  const isLocked = liveState && ['LIVE', 'HALF_TIME', 'FINISHED'].includes(liveState.status);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <a href={`/matches/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Match Overview</a>
      <h1 className="text-2xl font-bold mb-4">Predictions</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!liveState && !error && <p className="text-gray-400 text-sm">Loading…</p>}

      {liveState && (
        <>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
            <div className="text-sm text-gray-500 mb-1">
              {liveState.homeTeam.shortName} vs {liveState.awayTeam.shortName}
            </div>
            <div className="text-4xl font-bold my-2">
              {liveState.homeScore ?? '–'} : {liveState.awayScore ?? '–'}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                liveState.status === 'LIVE' ? 'bg-red-100 text-red-700' :
                liveState.status === 'FINISHED' ? 'bg-gray-200 text-gray-600' :
                'bg-blue-100 text-blue-700'
              }`}>
                {liveState.status}{liveState.currentMinute ? ` ${liveState.currentMinute}'` : ''}
              </span>
            </div>
          </div>

          {isLocked ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-amber-800">Predictions Locked</p>
              <p className="text-xs text-amber-600 mt-1">
                Predictions lock when the match goes live. Results will be settled at full time.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-green-800">Predictions Open</p>
              <p className="text-xs text-green-600 mt-1">
                Submit your prediction in the marketplace before kick-off.
              </p>
              <a href="/social-predictions/marketplace" className="mt-2 inline-block text-xs text-blue-600 underline">
                Go to marketplace →
              </a>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="bg-white border rounded-lg p-3">
              <div className="font-medium text-gray-700">{liveState.homeTeam.shortName} Win</div>
              <div className="text-xs text-gray-400 mt-1">Home</div>
            </div>
            <div className="bg-white border rounded-lg p-3">
              <div className="font-medium text-gray-700">Draw</div>
              <div className="text-xs text-gray-400 mt-1">1X2</div>
            </div>
            <div className="bg-white border rounded-lg p-3">
              <div className="font-medium text-gray-700">{liveState.awayTeam.shortName} Win</div>
              <div className="text-xs text-gray-400 mt-1">Away</div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Points-based prediction. No real money involved.
          </p>
        </>
      )}
    </main>
  );
}
