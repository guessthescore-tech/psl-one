'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getClubResults } from '@/lib/clubs-client';

interface Fixture {
  id: string;
  homeTeam: { name: string; shortName: string };
  awayTeam: { name: string; shortName: string };
  kickoffAt: string;
  homeScore: number | null;
  awayScore: number | null;
  venue: { name: string; city: string } | null;
}

export default function ClubResultsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [results, setResults] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getClubResults(slug)
      .then(setResults)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading results…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Recent Results</h2>
      {results.length === 0 ? (
        <p className="text-gray-400 text-sm">No results yet.</p>
      ) : (
        <div className="space-y-3">
          {results.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{f.homeTeam.shortName}</span>
                <span className="text-sm font-bold px-3">
                  {f.homeScore !== null && f.awayScore !== null
                    ? `${f.homeScore} – ${f.awayScore}`
                    : 'FT'}
                </span>
                <span className="font-medium">{f.awayTeam.shortName}</span>
              </div>
              <div className="mt-1 flex gap-3 text-xs text-gray-400">
                <span>{new Date(f.kickoffAt).toLocaleDateString()}</span>
                {f.venue && <span>{f.venue.name}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
