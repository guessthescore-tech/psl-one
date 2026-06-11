'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { footballClient, type Competition } from '@/lib/football-client';

const FORMAT_BADGE: Record<string, string> = {
  LEAGUE: 'bg-blue-100 text-blue-800',
  CUP: 'bg-purple-100 text-purple-800',
  TOURNAMENT: 'bg-green-100 text-green-800',
  HYBRID: 'bg-orange-100 text-orange-800',
};

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    footballClient.listCompetitions()
      .then(setCompetitions)
      .catch(() => setError('Could not load competitions'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <nav className="text-gray-400 text-sm mb-6">
          <Link href="/football" className="hover:text-white transition">Football</Link>
          <span className="mx-2">›</span>
          <span className="text-white">Competitions</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-6">Competitions</h1>

        {loading && <p className="text-gray-400 text-sm">Loading…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="space-y-3">
          {competitions.map(c => (
            <Link
              key={c.id}
              href={`/football/seasons?competitionSlug=${c.slug}`}
              className="block bg-white rounded-lg px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-psl-navy">{c.name}</p>
                    {c.format && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FORMAT_BADGE[c.format] ?? 'bg-gray-100 text-gray-700'}`}>
                        {c.format}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    {c.slug}
                    {c.teamCount ? ` · ${c.teamCount} teams` : ''}
                  </p>
                </div>
                <span className="text-gray-400 text-sm">Seasons &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
