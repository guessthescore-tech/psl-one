'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLeaderboardOverview, getLeaderboardSeasons, type LeaderboardOverview, type LeaderboardSeason } from '@/lib/leaderboards-client';

export default function LeaderboardsOverviewPage() {
  const [overview, setOverview] = useState<LeaderboardOverview | null>(null);
  const [seasons, setSeasons] = useState<LeaderboardSeason[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getLeaderboardOverview(), getLeaderboardSeasons()])
      .then(([ov, ss]) => { setOverview(ov); setSeasons(ss); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  function handleSeasonChange(slug: string) {
    setSelectedSlug(slug);
    setLoading(true);
    getLeaderboardOverview(slug || undefined)
      .then(setOverview)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }

  const TABS = [
    { key: 'overall', label: 'Overall', href: '/leaderboards/overall' },
    { key: 'fan-value', label: 'Fan Value', href: '/leaderboards/fan-value' },
    { key: 'fantasy', label: 'Fantasy', href: '/leaderboards/fantasy' },
    { key: 'predictions', label: 'Predictions', href: '/leaderboards/predictions' },
    { key: 'achievements', label: 'Achievements', href: '/leaderboards/achievements' },
  ];

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-psl-navy">Leaderboards</h1>
        <Link href="/" className="text-sm text-psl-navy/60 hover:text-psl-navy">Home</Link>
      </div>

      {seasons.length > 0 && (
        <div className="mb-4">
          <select
            value={selectedSlug}
            onChange={(e) => handleSeasonChange(e.target.value)}
            className="border border-gray-200 rounded px-3 py-1.5 text-sm w-full max-w-xs"
          >
            <option value="">Active Season</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`${t.href}${selectedSlug ? `?seasonSlug=${selectedSlug}` : ''}`}
            className="px-3 py-1.5 rounded-full bg-psl-navy text-white text-sm font-medium hover:bg-psl-navy/80"
          >
            {t.label}
          </Link>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}

      {overview && !loading && (
        <div className="space-y-6">
          <p className="text-xs text-gray-400">
            {overview.seasonName ? `Season: ${overview.seasonName}` : 'All Time'} · Points-only · Non-financial
          </p>

          {(['fanValue', 'fantasy', 'predictions', 'achievements'] as const).map((key) => {
            const lb = overview.leaderboards[key];
            const titles = { fanValue: 'Fan Value', fantasy: 'Fantasy', predictions: 'Predictions', achievements: 'Achievements' };
            const links = { fanValue: 'fan-value', fantasy: 'fantasy', predictions: 'predictions', achievements: 'achievements' };
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-psl-navy">{titles[key]}</h2>
                  <Link
                    href={`/leaderboards/${links[key]}${selectedSlug ? `?seasonSlug=${selectedSlug}` : ''}`}
                    className="text-xs text-psl-navy/60 hover:text-psl-navy"
                  >
                    Full list →
                  </Link>
                </div>
                {lb.entries.length === 0 ? (
                  <p className="text-gray-400 text-xs">No entries yet</p>
                ) : (
                  <ol className="space-y-1">
                    {lb.entries.slice(0, 5).map((e, i) => (
                      <li key={e.userId} className="flex items-center gap-3">
                        <span className="w-5 text-center text-xs font-mono text-gray-400">{i + 1}</span>
                        <span className="flex-1 text-sm truncate">{e.displayName ?? 'Fan'}</span>
                        <span className="text-sm font-bold text-psl-gold">{e.totalPoints}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
