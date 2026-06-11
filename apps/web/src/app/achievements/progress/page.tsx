'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { achievementsClient, CATEGORY_LABELS, type ProgressItem } from '@/lib/achievements-client';

export default function AchievementProgressPage() {
  const [data, setData] = useState<{ inProgress: ProgressItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    achievementsClient.getProgress()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Achievement Progress</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/achievements" className="text-blue-600 underline">All Achievements</Link>
          <Link href="/achievements/badges" className="text-blue-600 underline">Badges</Link>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {data && (
        <>
          {data.inProgress.length === 0 ? (
            <div className="border rounded p-6 text-center text-gray-400">
              <p className="text-sm">No achievements in progress.</p>
              <p className="text-xs mt-1">Start playing to unlock achievements!</p>
              <Link href="/achievements" className="text-blue-600 text-sm underline mt-2 inline-block">Browse Achievements</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.inProgress.map(item => (
                <div key={item.slug} className="border rounded p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400">{CATEGORY_LABELS[item.category]}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{item.progress}{item.target ? `/${item.target}` : ''}</div>
                      <div className="text-xs text-blue-600">{item.percent}%</div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
