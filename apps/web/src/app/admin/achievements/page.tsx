'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { achievementsClient, type AdminAchievementStats } from '@/lib/achievements-client';

export default function AdminAchievementsPage() {
  const [stats, setStats] = useState<AdminAchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    achievementsClient.adminGetStats()
      .then(setStats)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Achievements Admin</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/achievements/definitions" className="text-blue-600 underline">Definitions</Link>
          <Link href="/admin/achievements/badges" className="text-blue-600 underline">Badges</Link>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.totalDefinitions}</div>
              <div className="text-xs text-blue-600">Definitions</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{stats.totalUnlocked}</div>
              <div className="text-xs text-green-600">Unlocked</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-purple-700">{stats.totalBadges}</div>
              <div className="text-xs text-purple-600">Badges Awarded</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-yellow-700">{stats.unlockRate}%</div>
              <div className="text-xs text-yellow-600">Unlock Rate</div>
            </div>
          </div>

          <h2 className="font-semibold text-sm mb-2">Recent Unlocks</h2>
          {stats.recentUnlocks.length === 0 ? (
            <p className="text-xs text-gray-400">No unlocks yet.</p>
          ) : (
            <div className="border rounded divide-y">
              {stats.recentUnlocks.map((u, i) => (
                <div key={u.definitionId + i} className="px-3 py-2 flex justify-between items-center text-sm">
                  <span className="text-gray-700">{u.name}</span>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{u.unlockedAt ? new Date(u.unlockedAt).toLocaleDateString() : '—'}</span>
                    <Link href={`/admin/achievements/users/${(u as unknown as { userId?: string }).userId ?? ''}`} className="text-blue-600 underline">User</Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border rounded p-3">
            <h2 className="font-semibold text-sm mb-3">Evaluate a User</h2>
            <EvaluateUserForm />
          </div>

          <div className="mt-4 border rounded p-3">
            <h2 className="font-semibold text-sm mb-2">Quick Links</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/achievements/definitions" className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Manage Definitions</Link>
              <Link href="/admin/achievements/badges" className="px-3 py-1 bg-purple-600 text-white rounded text-xs">Manage Badges</Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function EvaluateUserForm() {
  const [userId, setUserId] = useState('');
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleEvaluate = async () => {
    if (!userId.trim()) return;
    setWorking(true);
    setMsg(null);
    try {
      const result = await achievementsClient.adminEvaluateUser(userId.trim());
      const awarded = result.results.filter(r => r.awarded).length;
      setMsg(`Evaluated ${result.evaluated} achievements. ${awarded} newly awarded.`);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="User ID"
          className="border rounded px-2 py-1 text-sm flex-1 font-mono"
        />
        <button
          onClick={handleEvaluate}
          disabled={working || !userId.trim()}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {working ? 'Running...' : 'Evaluate'}
        </button>
      </div>
      {msg && <p className={`text-xs p-2 rounded ${msg.includes('Failed') || msg.includes('error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</p>}
    </div>
  );
}
