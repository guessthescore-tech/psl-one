'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  adminApplyAutoSubsForGameweek,
  adminRecalculateTeamAutoSubs,
  adminGetAutoSubsForGameweek,
} from '@/lib/fantasy-rules-client';

export default function AdminAutoSubsPage() {
  const [gameweekId, setGameweekId] = useState('');
  const [fantasyTeamId, setFantasyTeamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      setResult(JSON.stringify(await fn(), null, 2));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const inp = 'w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-400';
  const btn = (cls = '') =>
    `px-4 py-2 text-sm rounded border disabled:opacity-50 ${cls || 'bg-gray-100 hover:bg-gray-200'}`;

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Auto-Substitutions — Admin</h1>
        <Link href="/admin" className="text-sm text-blue-600 underline">Admin home</Link>
      </div>

      {/* Apply auto-subs for a whole gameweek */}
      <section className="border rounded-xl p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3">Apply Auto-Subs for Gameweek</h2>
        <p className="text-xs text-gray-500 mb-2">
          Runs auto-substitution calculation for every fantasy team in the season.
          Auto-subs run automatically during settlement — use this to run them standalone.
        </p>
        <div className="flex gap-2 mb-2">
          <input
            className={inp + ' flex-1'}
            placeholder="Gameweek UUID"
            value={gameweekId}
            onChange={e => setGameweekId(e.target.value)}
          />
          <button
            onClick={() => run(() => adminApplyAutoSubsForGameweek(gameweekId.trim()))}
            disabled={loading || !gameweekId.trim()}
            className={btn('bg-green-100 hover:bg-green-200')}
          >
            Apply
          </button>
        </div>
      </section>

      {/* View auto-subs for gameweek */}
      <section className="border rounded-xl p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3">View Auto-Subs for Gameweek</h2>
        <div className="flex gap-2 mb-2">
          <input
            className={inp + ' flex-1'}
            placeholder="Gameweek UUID"
            value={gameweekId}
            onChange={e => setGameweekId(e.target.value)}
          />
          <button
            onClick={() => run(() => adminGetAutoSubsForGameweek(gameweekId.trim()))}
            disabled={loading || !gameweekId.trim()}
            className={btn()}
          >
            View
          </button>
        </div>
      </section>

      {/* Recalculate for a specific team */}
      <section className="border rounded-xl p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3">Recalculate Team Auto-Subs</h2>
        <div className="space-y-2 mb-2">
          <input
            className={inp}
            placeholder="Fantasy Team UUID"
            value={fantasyTeamId}
            onChange={e => setFantasyTeamId(e.target.value)}
          />
          <input
            className={inp}
            placeholder="Gameweek UUID"
            value={gameweekId}
            onChange={e => setGameweekId(e.target.value)}
          />
        </div>
        <button
          onClick={() => run(() => adminRecalculateTeamAutoSubs(fantasyTeamId.trim(), gameweekId.trim()))}
          disabled={loading || !fantasyTeamId.trim() || !gameweekId.trim()}
          className={btn('bg-amber-100 hover:bg-amber-200 w-full')}
        >
          Recalculate Team
        </button>
      </section>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {result && (
        <pre className="border rounded-xl p-3 text-xs bg-gray-50 overflow-auto whitespace-pre-wrap max-h-96">
          {result}
        </pre>
      )}

      <div className="mt-4 text-xs text-gray-400">
        <Link href="/admin/fantasy/scoring" className="underline">Fantasy Scoring Admin →</Link>
      </div>
    </main>
  );
}
