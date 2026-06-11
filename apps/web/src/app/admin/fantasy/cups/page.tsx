'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createCup, generateCupRound, settleCupRound } from '@/lib/admin-fantasy-client';

export default function AdminCupsPage() {
  const [cupName, setCupName] = useState('');
  const [cupSeasonId, setCupSeasonId] = useState('');
  const [cupId, setCupId] = useState('');
  const [gameweekId, setGameweekId] = useState('');
  const [roundName, setRoundName] = useState('');
  const [teamIds, setTeamIds] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setLoading(true);
    setResult(null);
    setError(null);
    try { setResult(JSON.stringify(await fn(), null, 2)); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fantasy Cups — Admin</h1>
        <Link href="/admin" className="text-sm text-blue-600 underline">Admin home</Link>
      </div>

      {/* Create cup */}
      <section className="border rounded p-4 mb-4">
        <h2 className="font-semibold text-sm mb-2">Create Cup</h2>
        <div className="space-y-2">
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Season UUID" value={cupSeasonId} onChange={e => setCupSeasonId(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Cup name" value={cupName} onChange={e => setCupName(e.target.value)} />
          <button onClick={() => run(() => createCup(cupSeasonId.trim(), cupName.trim()))} disabled={loading || !cupSeasonId.trim() || !cupName.trim()} className="w-full py-2 bg-blue-100 border rounded text-sm hover:bg-blue-200 disabled:opacity-50">
            Create
          </button>
        </div>
      </section>

      {/* Generate round */}
      <section className="border rounded p-4 mb-4">
        <h2 className="font-semibold text-sm mb-2">Generate Cup Round</h2>
        <div className="space-y-2">
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Cup UUID" value={cupId} onChange={e => setCupId(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Gameweek UUID" value={gameweekId} onChange={e => setGameweekId(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Round name (e.g. Quarter Finals)" value={roundName} onChange={e => setRoundName(e.target.value)} />
          <textarea className="w-full border rounded px-3 py-2 text-sm h-20" placeholder="Team IDs (one per line)" value={teamIds} onChange={e => setTeamIds(e.target.value)} />
          <button
            onClick={() => {
              const ids = teamIds.split('\n').map(s => s.trim()).filter(Boolean);
              run(() => generateCupRound(cupId.trim(), gameweekId.trim(), roundName.trim(), ids));
            }}
            disabled={loading || !cupId.trim() || !gameweekId.trim() || !roundName.trim()}
            className="w-full py-2 bg-yellow-100 border rounded text-sm hover:bg-yellow-200 disabled:opacity-50"
          >
            Generate Round
          </button>
        </div>
      </section>

      {/* Settle round */}
      <section className="border rounded p-4 mb-4">
        <h2 className="font-semibold text-sm mb-2">Settle Cup Round</h2>
        <div className="space-y-2">
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Cup UUID" value={cupId} onChange={e => setCupId(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Gameweek UUID" value={gameweekId} onChange={e => setGameweekId(e.target.value)} />
          <button onClick={() => run(() => settleCupRound(cupId.trim(), gameweekId.trim()))} disabled={loading || !cupId.trim() || !gameweekId.trim()} className="w-full py-2 bg-green-100 border rounded text-sm hover:bg-green-200 disabled:opacity-50">
            Settle Round
          </button>
        </div>
      </section>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {result && (
        <pre className="border rounded p-3 text-xs bg-gray-50 overflow-auto whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </main>
  );
}
