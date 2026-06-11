'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { achievementsClient, CATEGORY_LABELS, type AchievementItem } from '@/lib/achievements-client';

const STATUS_BADGE: Record<string, string> = {
  UNLOCKED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  LOCKED: 'bg-gray-100 text-gray-600',
  REVOKED: 'bg-red-100 text-red-800',
};

export default function AdminUserAchievementsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [data, setData] = useState<{ achievements: AchievementItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [awardSlug, setAwardSlug] = useState('');
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    achievementsClient.adminGetUserAchievements(userId)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAward = async () => {
    if (!awardSlug.trim()) return;
    setWorking(true);
    setMsg(null);
    try {
      await achievementsClient.adminAwardAchievement(userId, awardSlug.trim());
      setMsg(`Awarded: ${awardSlug}`);
      setAwardSlug('');
      load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    } finally {
      setWorking(false);
    }
  };

  const handleRevoke = async (a: AchievementItem) => {
    const reason = window.prompt(`Revoke reason for "${a.name}":`);
    if (!reason) return;
    setWorking(true);
    setMsg(null);
    try {
      await achievementsClient.adminRevokeAchievement(userId, a.definitionId, reason);
      setMsg(`Revoked: ${a.name}`);
      load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    } finally {
      setWorking(false);
    }
  };

  const handleEvaluate = async () => {
    setWorking(true);
    setMsg(null);
    try {
      const result = await achievementsClient.adminEvaluateUser(userId);
      const awarded = result.results.filter(r => r.awarded).length;
      setMsg(`Evaluated ${result.evaluated} achievements. ${awarded} newly awarded.`);
      if (awarded > 0) load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    } finally {
      setWorking(false);
    }
  };

  const unlocked = data?.achievements.filter(a => a.status === 'UNLOCKED') ?? [];
  const inProgress = data?.achievements.filter(a => a.status === 'IN_PROGRESS') ?? [];

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href="/admin/achievements" className="text-blue-600 text-sm underline">← Achievements Admin</Link>
          <h1 className="text-xl font-bold mt-1">User: {userId}</h1>
        </div>
      </div>

      {msg && <p className={`text-sm mb-3 p-2 rounded ${msg.startsWith('Failed') || msg.includes('error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</p>}

      <div className="border rounded p-3 mb-4 space-y-3">
        <h2 className="font-semibold text-sm">Admin Actions</h2>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={awardSlug}
            onChange={e => setAwardSlug(e.target.value)}
            placeholder="achievement-slug"
            className="border rounded px-2 py-1 text-sm flex-1 font-mono"
          />
          <button
            onClick={handleAward}
            disabled={working || !awardSlug.trim()}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded disabled:opacity-50"
          >
            Award
          </button>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={working}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Re-evaluate All
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {data && (
        <>
          <div className="flex gap-4 text-sm mb-3">
            <span className="text-green-700 font-medium">{unlocked.length} unlocked</span>
            <span className="text-blue-700 font-medium">{inProgress.length} in progress</span>
            <span className="text-gray-500">{data.achievements.length} total</span>
          </div>

          <div className="space-y-2">
            {data.achievements.filter(a => a.status !== 'LOCKED').map(a => (
              <div key={a.definitionId} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {a.badges[0]?.icon && <span>{a.badges[0].icon}</span>}
                    <span className="font-medium text-sm">{a.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_BADGE[a.status] ?? ''}`}>{a.status}</span>
                  </div>
                  <div className="text-xs text-gray-400">{CATEGORY_LABELS[a.category]}</div>
                  {a.unlockedAt && <div className="text-xs text-gray-400">{new Date(a.unlockedAt).toLocaleDateString()}</div>}
                  {a.status === 'IN_PROGRESS' && a.target && (
                    <div className="text-xs text-blue-600">{a.progress}/{a.target}</div>
                  )}
                </div>
                {a.status === 'UNLOCKED' && (
                  <button
                    onClick={() => handleRevoke(a)}
                    disabled={working}
                    className="text-xs text-red-600 border border-red-300 px-2 py-0.5 rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
