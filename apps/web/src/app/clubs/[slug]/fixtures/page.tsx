'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getClubFixtures } from '@/lib/clubs-client';

interface Fixture {
  id: string;
  homeTeam: { name: string; shortName: string };
  awayTeam: { name: string; shortName: string };
  kickoffAt: string;
  status: string;
  venue: { name: string; city: string } | null;
  gameweek: { name: string } | null;
}

export default function ClubFixturesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getClubFixtures(slug)
      .then(setFixtures)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading fixtures…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Upcoming Fixtures</h2>
      {fixtures.length === 0 ? (
        <p className="text-gray-400 text-sm">No upcoming fixtures.</p>
      ) : (
        <div className="space-y-3">
          {fixtures.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{f.homeTeam.shortName}</span>
                <span className="text-xs text-gray-400 px-3">vs</span>
                <span className="font-medium">{f.awayTeam.shortName}</span>
              </div>
              <div className="mt-1 flex gap-3 text-xs text-gray-400">
                <span>{new Date(f.kickoffAt).toLocaleString()}</span>
                {f.venue && <span>{f.venue.name}, {f.venue.city}</span>}
                {f.gameweek && <span>{f.gameweek.name}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
