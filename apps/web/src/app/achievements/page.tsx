'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { achievementsClient, CATEGORY_LABELS, type AchievementItem, type AchievementSummary } from '@/lib/achievements-client';

const STATUS_BADGE: Record<string, string> = {
  UNLOCKED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  LOCKED: 'bg-gray-100 text-gray-600',
  REVOKED: 'bg-red-100 text-red-800',
};

export default function AchievementsPage() {
  const [data, setData] = useState<{ achievements: AchievementItem[] } | null>(null);
  const [summary, setSummary] = useState<AchievementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [evaluating, setEvaluating] = useState(false);
  const [evalMsg, setEvalMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      achievementsClient.getAchievements(),
      achievementsClient.getSummary(),
    ])
      .then(([ach, sum]) => { setData(ach); setSummary(sum); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleEvaluate = async () => {
    setEvaluating(true);
    setEvalMsg(null);
    try {
      const result = await achievementsClient.evaluate();
      const awarded = result.results.filter(r => r.awarded).length;
      setEvalMsg(`Checked ${result.evaluated} achievements. ${awarded > 0 ? `${awarded} newly unlocked!` : 'None newly unlocked.'}`);
      if (awarded > 0) load();
    } catch (e: unknown) {
      setEvalMsg(e instanceof Error ? e.message : 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const filtered = data?.achievements.filter(a =>
    filterCategory === 'ALL' || a.category === filterCategory
  ) ?? [];

  const categories = data
    ? ['ALL', ...Array.from(new Set(data.achievements.map(a => a.category)))]
    : ['ALL'];

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Achievements</h1>
        <div className="flex gap-3 text-sm items-center">
          <button
            onClick={handleEvaluate}
            disabled={evaluating}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50"
          >
            {evaluating ? 'Checking...' : 'Check Progress'}
          </button>
          <Link href="/achievements/badges" className="text-blue-600 underline">Badges</Link>
          <Link href="/achievements/progress" className="text-blue-600 underline">Progress</Link>
        </div>
      </div>

      {evalMsg && <p className="text-sm mb-3 p-2 rounded bg-blue-50 text-blue-700">{evalMsg}</p>}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {summary && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{summary.unlockedCount}</div>
            <div className="text-xs text-green-600">Unlocked</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
            <div className="text-2xl font-bold text-gray-700">{summary.totalCount}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded p-3 text-center">
            <div className="text-2xl font-bold text-purple-700">{summary.badgeCount}</div>
            <div className="text-xs text-purple-600">Badges</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
            <div className="text-2xl font-bold text-yellow-700">{summary.achievementPoints}</div>
            <div className="text-xs text-yellow-600 leading-tight">Ach. Points<br/><span className="text-gray-400">(non-financial)</span></div>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="flex gap-2 flex-wrap mb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${filterCategory === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}
              >
                {cat === 'ALL' ? 'All' : CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(a => (
              <div key={a.definitionId} className={`border rounded p-3 ${a.status === 'LOCKED' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {a.badges[0]?.icon && <span className="text-lg">{a.badges[0].icon}</span>}
                      <span className="font-medium text-sm">{a.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[a.status] ?? ''}`}>
                      {a.status}
                    </span>
                    {a.fanValuePoints > 0 && (
                      <span className="text-xs text-yellow-600">+{a.fanValuePoints} pts</span>
                    )}
                  </div>
                </div>

                {a.status === 'IN_PROGRESS' && a.target && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{a.progress}/{a.target}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((a.progress / a.target) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {a.unlockedAt && (
                  <p className="text-xs text-gray-400 mt-1">Unlocked {new Date(a.unlockedAt).toLocaleDateString()}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
