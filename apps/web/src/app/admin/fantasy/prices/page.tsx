'use client';

import Link from 'next/link';
import { useState } from 'react';
import { setPlayerPrice } from '@/lib/admin-fantasy-client';

export default function AdminPricesPage() {
  const [playerId, setPlayerId] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [price, setPrice] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const parsed = parseInt(price, 10);
      if (isNaN(parsed) || parsed < 1) throw new Error('Price must be a positive integer (e.g. 65 = £6.5m)');
      setResult(JSON.stringify(await setPlayerPrice(playerId.trim(), seasonId.trim(), parsed, reason.trim() || undefined), null, 2));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Player Prices — Admin</h1>
        <Link href="/admin" className="text-sm text-blue-600 underline">Admin home</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Player UUID"
          value={playerId}
          onChange={e => setPlayerId(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Season UUID"
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Price (integer, e.g. 65 = £6.5m)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Reason (optional)"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Set Price'}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {result && (
        <pre className="border rounded p-3 text-xs bg-gray-50 overflow-auto whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </main>
  );
}
