'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  lockGameweek,
  settleGameweek,
  lockFixture,
  voidFixture,
  settleFixture,
  getFixtureLockState,
  type GameweekLockResult,
  type GameweekSettleResult,
  type FixtureLockResult,
  type FixtureVoidResult,
  type FixtureSettleResult,
  type FixtureLockState,
} from '@/lib/admin-predictions-client';

type AnyResult = GameweekLockResult | GameweekSettleResult | FixtureLockResult | FixtureVoidResult | FixtureSettleResult | FixtureLockState;

export default function AdminPredictionsPage() {
  const [fixtureId, setFixtureId] = useState('');
  const [gameweekId, setGameweekId] = useState('');
  const [force, setForce] = useState(false);
  const [result, setResult] = useState<AnyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<AnyResult>) {
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
        <h1 className="text-xl font-bold">Prediction Engine — Admin</h1>
        <Link href="/admin/predictions/settlement" className="text-sm text-blue-600 underline">Settlement view</Link>
      </div>

      {/* Fixture operations */}
      <section className="border rounded p-4 mb-4">
        <h2 className="text-sm font-semibold mb-3">Fixture Operations</h2>
        <input
          type="text"
          placeholder="Fixture UUID"
          value={fixtureId}
          onChange={e => setFixtureId(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm mb-3"
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            onClick={() => run(() => getFixtureLockState(fixtureId.trim()))}
            disabled={loading || !fixtureId.trim()}
            className="px-3 py-2 bg-gray-100 border rounded text-xs hover:bg-gray-200 disabled:opacity-50"
          >
            Lock State
          </button>
          <button
            onClick={() => run(() => lockFixture(fixtureId.trim()))}
            disabled={loading || !fixtureId.trim()}
            className="px-3 py-2 bg-yellow-100 border rounded text-xs hover:bg-yellow-200 disabled:opacity-50"
          >
            Lock Fixture
          </button>
          <button
            onClick={() => run(() => settleFixture(fixtureId.trim()))}
            disabled={loading || !fixtureId.trim()}
            className="px-3 py-2 bg-green-100 border rounded text-xs hover:bg-green-200 disabled:opacity-50"
          >
            Settle Fixture
          </button>
          <button
            onClick={() => run(() => voidFixture(fixtureId.trim()))}
            disabled={loading || !fixtureId.trim()}
            className="px-3 py-2 bg-red-100 border rounded text-xs hover:bg-red-200 disabled:opacity-50"
          >
            Void Fixture
          </button>
        </div>
      </section>

      {/* Gameweek operations */}
      <section className="border rounded p-4 mb-4">
        <h2 className="text-sm font-semibold mb-3">Gameweek Operations</h2>
        <input
          type="text"
          placeholder="Gameweek UUID"
          value={gameweekId}
          onChange={e => setGameweekId(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm mb-3"
        />
        <div className="flex items-center gap-2 mb-3">
          <input
            id="force-lock"
            type="checkbox"
            checked={force}
            onChange={e => setForce(e.target.checked)}
            className="accent-blue-600"
          />
          <label htmlFor="force-lock" className="text-xs text-gray-700">Force lock (ignore deadline)</label>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            onClick={() => run(() => lockGameweek(gameweekId.trim(), force))}
            disabled={loading || !gameweekId.trim()}
            className="px-3 py-2 bg-yellow-100 border rounded text-xs hover:bg-yellow-200 disabled:opacity-50"
          >
            Lock Gameweek
          </button>
          <button
            onClick={() => run(() => settleGameweek(gameweekId.trim()))}
            disabled={loading || !gameweekId.trim()}
            className="px-3 py-2 bg-green-100 border rounded text-xs hover:bg-green-200 disabled:opacity-50"
          >
            Settle Gameweek
          </button>
        </div>
      </section>

      {/* Result / error */}
      {error && (
        <div className="border border-red-300 rounded p-3 bg-red-50 text-sm text-red-700 mb-4">{error}</div>
      )}
      {result && (
        <div className="border rounded p-3 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 mb-2">Result</p>
          <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
