'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { footballClient, type Season } from '@/lib/football-client';

function SeasonsList() {
  const searchParams = useSearchParams();
  const competitionSlug = searchParams.get('competitionSlug') ?? undefined;
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    footballClient.listSeasons(competitionSlug ? { competitionSlug } : undefined)
      .then(setSeasons)
      .catch(() => setError('Could not load seasons'))
      .finally(() => setLoading(false));
  }, [competitionSlug]);

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>;
  if (error) return <p className="text-red-400 text-sm">{error}</p>;

  return (
    <div className="space-y-3">
      {seasons.map(s => (
        <div key={s.id} className="bg-white rounded-lg px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-psl-navy">{s.competition.name} — {s.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(s.startDate).toLocaleDateString('en-ZA')} – {new Date(s.endDate).toLocaleDateString('en-ZA')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {s.isActive && (
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
              {!s.isActive && s.status && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {s.status}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SeasonsPage() {
  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <nav className="text-gray-400 text-sm mb-6">
          <Link href="/football" className="hover:text-white transition">Football</Link>
          <span className="mx-2">›</span>
          <span className="text-white">Seasons</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-6">Seasons</h1>

        <Suspense fallback={<p className="text-gray-400 text-sm">Loading…</p>}>
          <SeasonsList />
        </Suspense>
      </div>
    </main>
  );
}
