'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPrivateLeague } from '@/lib/fantasy-rules-client';

export default function CreateLeaguePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const league = await createPrivateLeague({ name: name.trim(), seasonId: seasonId.trim() });
      router.push(`/fantasy/leagues/${league.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Create Private League</h1>
        <Link href="/fantasy/leagues" className="text-sm text-blue-600 underline">Back</Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">League name</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. Friday Night Ballers"
            value={name}
            onChange={e => setName(e.target.value)}
            minLength={2}
            maxLength={60}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Season ID</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm font-mono"
            placeholder="Season UUID"
            value={seasonId}
            onChange={e => setSeasonId(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim() || !seasonId.trim()}
          className="w-full py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create League'}
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-4 text-center">
        You'll receive a unique invite code to share with friends. Up to 30 private leagues allowed.
      </p>
    </main>
  );
}
