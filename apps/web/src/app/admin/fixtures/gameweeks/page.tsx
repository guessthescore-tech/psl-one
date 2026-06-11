'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GameweekReadiness {
  seasonId: string;
  totalFixtures: number;
  fixturesWithGameweek: number;
  fixturesWithoutGameweek: number;
  gameweeksCreated: number;
  deadlineWarnings: string[];
  lockTimingWarnings: string[];
}

interface AutoResult {
  seasonId: string;
  roundsProcessed: number;
  gameweeksCreated: number;
  fixturesAssigned: number;
}

export default function GameweeksPage() {
  const [seasonId, setSeasonId] = useState('');
  const [readiness, setReadiness] = useState<GameweekReadiness | null>(null);
  const [autoResult, setAutoResult] = useState<AutoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!seasonId.trim()) return;
    setLoading(true);
    setError(null);
    setAutoResult(null);
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/gameweeks/season/${seasonId.trim()}/readiness`, { credentials: 'include' });
      if (!res.ok) { const b = await res.text(); throw new Error(`${res.status}: ${b}`); }
      const data = await res.json() as GameweekReadiness;
      setReadiness(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleAutoCreate() {
    if (!seasonId.trim()) return;
    if (!confirm('Auto-create gameweeks from fixture round data? Existing gameweeks with matching slugs will be reused.')) return;
    setAutoLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/gameweeks/season/${seasonId.trim()}/auto-create`, {
        method: 'POST', credentials: 'include',
      });
      if (!res.ok) { const b = await res.text(); throw new Error(`${res.status}: ${b}`); }
      const data = await res.json() as AutoResult;
      setAutoResult(data);
      // Refresh readiness
      const r2 = await fetch(`/api/proxy/fixtures/admin/gameweeks/season/${seasonId.trim()}/readiness`, { credentials: 'include' });
      if (r2.ok) setReadiness(await r2.json() as GameweekReadiness);
    } catch (e) {
      setError(String(e));
    } finally {
      setAutoLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/fixtures/imports" className="text-sm text-blue-600 hover:underline">
          ← Import Batches
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Gameweek Readiness</h1>
        <p className="text-gray-500 text-sm mt-1">Check gameweek assignments and auto-create from round data</p>
      </div>

      <form onSubmit={handleCheck} className="flex gap-3 mb-6">
        <input
          type="text"
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
          placeholder="Season ID"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !seasonId.trim()}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </form>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}

      {autoResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-700 font-medium">Auto-creation complete</p>
          <p className="text-green-600 text-sm">
            {autoResult.roundsProcessed} round(s) processed, {autoResult.gameweeksCreated} gameweek(s) created, {autoResult.fixturesAssigned} fixture(s) assigned.
          </p>
        </div>
      )}

      {readiness && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', value: readiness.totalFixtures },
              { label: 'With Gameweek', value: readiness.fixturesWithGameweek },
              { label: 'No Gameweek', value: readiness.fixturesWithoutGameweek },
              { label: 'Gameweeks', value: readiness.gameweeksCreated },
            ].map(s => (
              <div key={s.label} className="border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              </div>
            ))}
          </div>

          {readiness.fixturesWithoutGameweek > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-700 font-medium mb-2">
                {readiness.fixturesWithoutGameweek} fixture(s) have no gameweek
              </p>
              <p className="text-yellow-600 text-sm mb-3">
                Use auto-create to generate gameweeks from round numbers on fixtures.
              </p>
              <button
                onClick={() => void handleAutoCreate()}
                disabled={autoLoading}
                className="bg-yellow-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
              >
                {autoLoading ? 'Creating…' : 'Auto-create Gameweeks'}
              </button>
            </div>
          )}

          {readiness.deadlineWarnings.length > 0 && (
            <div className="border border-orange-200 rounded-lg p-4 mb-4 bg-orange-50">
              <p className="text-orange-700 font-medium mb-2">Deadline Warnings ({readiness.deadlineWarnings.length})</p>
              <ul className="text-xs text-orange-700 space-y-1">
                {readiness.deadlineWarnings.slice(0, 5).map((w, i) => <li key={i}>• {w}</li>)}
                {readiness.deadlineWarnings.length > 5 && <li>…and {readiness.deadlineWarnings.length - 5} more</li>}
              </ul>
            </div>
          )}

          {readiness.fixturesWithoutGameweek === 0 && readiness.deadlineWarnings.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">All fixtures have gameweeks assigned</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
