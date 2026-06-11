'use client';

import Link from 'next/link';
import { useState } from 'react';
import { recalculateDeadline, rolloverTransfers } from '@/lib/admin-fantasy-client';

export default function AdminDeadlinesPage() {
  const [gameweekId, setGameweekId] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fantasy Deadlines — Admin</h1>
        <Link href="/admin" className="text-sm text-blue-600 underline">Admin home</Link>
      </div>

      <input
        className="w-full border rounded px-3 py-2 text-sm mb-3"
        placeholder="Gameweek UUID"
        value={gameweekId}
        onChange={e => setGameweekId(e.target.value)}
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => run(() => recalculateDeadline(gameweekId.trim()))}
          disabled={loading || !gameweekId.trim()}
          className="flex-1 py-2 bg-yellow-100 border rounded text-sm hover:bg-yellow-200 disabled:opacity-50"
        >
          Recalculate Deadline
        </button>
        <button
          onClick={() => run(() => rolloverTransfers(gameweekId.trim()))}
          disabled={loading || !gameweekId.trim()}
          className="flex-1 py-2 bg-green-100 border rounded text-sm hover:bg-green-200 disabled:opacity-50"
        >
          Rollover Free Transfers
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {result && (
        <pre className="border rounded p-3 text-xs bg-gray-50 overflow-auto whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </main>
  );
}
