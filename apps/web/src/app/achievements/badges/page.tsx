'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { achievementsClient, RARITY_COLORS, RARITY_LABELS, CATEGORY_LABELS, type BadgeItem } from '@/lib/achievements-client';

export default function BadgesPage() {
  const [data, setData] = useState<{ badges: BadgeItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    achievementsClient.getBadges()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Badges</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/achievements" className="text-blue-600 underline">Achievements</Link>
          <Link href="/achievements/progress" className="text-blue-600 underline">Progress</Link>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {data && (
        <>
          <p className="text-sm text-gray-500 mb-4">{data.badges.length} badge{data.badges.length !== 1 ? 's' : ''} earned</p>

          {data.badges.length === 0 ? (
            <div className="border rounded p-6 text-center text-gray-400">
              <p className="text-4xl mb-2">🏅</p>
              <p className="text-sm">No badges earned yet.</p>
              <p className="text-xs mt-1">Complete achievements to earn badges.</p>
              <Link href="/achievements" className="text-blue-600 text-sm underline mt-2 inline-block">View Achievements</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.badges.map(b => (
                <div key={b.badgeId} className="border rounded p-3 flex flex-col items-center text-center">
                  <div className="text-4xl mb-1">{b.icon ?? '🏅'}</div>
                  <div className="font-medium text-sm">{b.name}</div>
                  <div className={`text-xs mt-0.5 font-medium ${RARITY_COLORS[b.rarity]}`}>
                    {RARITY_LABELS[b.rarity]}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{CATEGORY_LABELS[b.category]}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(b.awardedAt).toLocaleDateString()}
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
