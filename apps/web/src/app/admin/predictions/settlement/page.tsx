'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  settleFixture,
  settleGameweek,
  type FixtureSettleResult,
  type GameweekSettleResult,
} from '@/lib/admin-predictions-client';

type SettleResult = FixtureSettleResult | GameweekSettleResult;

function isGameweekResult(r: SettleResult): r is GameweekSettleResult {
  return 'gameweekId' in r;
}

export default function SettlementPage() {
  const [fixtureId, setFixtureId] = useState('');
  const [gameweekId, setGameweekId] = useState('');
  const [result, setResult] = useState<SettleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<SettleResult>) {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      setResult(await fn());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Settlement — Admin</h1>
        <Link href="/admin/predictions" className="text-sm text-blue-600 underline">All prediction ops</Link>
      </div>

      <section className="border rounded p-4 mb-4">
        <h2 className="text-sm font-semibold mb-2">Settle Fixture</h2>
        <p className="text-xs text-gray-500 mb-3">
          Settle all PENDING and LOCKED predictions for one fixture. Fixture must be FINISHED with scores recorded.
          Idempotent — already SETTLED/WON/LOST predictions are skipped.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Fixture UUID"
            value={fixtureId}
            onChange={e => setFixtureId(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={() => run(() => settleFixture(fixtureId.trim()))}
            disabled={loading || !fixtureId.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Settling…' : 'Settle'}
          </button>
        </div>
      </section>

      <section className="border rounded p-4 mb-4">
        <h2 className="text-sm font-semibold mb-2">Settle Gameweek</h2>
        <p className="text-xs text-gray-500 mb-3">
          Settle all FINISHED fixtures in a gameweek. Skips fixtures without scores. Idempotent.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Gameweek UUID"
            value={gameweekId}
            onChange={e => setGameweekId(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={() => run(() => settleGameweek(gameweekId.trim()))}
            disabled={loading || !gameweekId.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Settling…' : 'Settle'}
          </button>
        </div>
      </section>

      {error && (
        <div className="border border-red-300 rounded p-3 bg-red-50 text-sm text-red-700 mb-4">{error}</div>
      )}

      {result && (
        <div className="border rounded p-4 bg-green-50">
          {isGameweekResult(result) ? (
            <>
              <p className="font-semibold text-sm mb-2">Gameweek settled: {result.gameweekName}</p>
              <div className="flex gap-4 text-sm mb-2">
                <span>Fixtures settled: <strong>{result.fixturesSettled}</strong></span>
                <span>Skipped: <strong>{result.fixturesSkipped}</strong></span>
              </div>
              <div className="flex gap-4 text-sm mb-3">
                <span>Predictions: <strong>{result.totalPredictionsSettled}</strong></span>
                <span>Challenges: <strong>{result.totalChallengesSettled}</strong></span>
              </div>
              {result.fixtures.length > 0 && (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-1">Fixture ID</th>
                      <th className="text-left pb-1">Predictions</th>
                      <th className="text-left pb-1">Challenges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.fixtures.map(f => (
                      <tr key={f.fixtureId} className="border-b last:border-0">
                        <td className="py-1 font-mono text-gray-500 text-xs">{f.fixtureId.slice(0, 8)}…</td>
                        <td className="py-1">{f.predictionsSettled}</td>
                        <td className="py-1">{f.challengesSettled}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold text-sm mb-2">Fixture settled</p>
              <p className="text-sm">Predictions settled: <strong>{result.predictionsSettled}</strong></p>
              <p className="text-sm">Challenges settled: <strong>{result.challengesSettled}</strong></p>
              {result.summary.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">Per-prediction breakdown</summary>
                  <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(result.summary, null, 2)}</pre>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
