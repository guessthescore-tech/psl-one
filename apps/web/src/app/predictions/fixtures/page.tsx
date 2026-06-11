'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { footballClient, type Fixture } from '@/lib/football-client';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function PredictionFixturesPage() {
  const router = useRouter();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    footballClient.listFixtures()
      .then(all => {
        const now = Date.now();
        setFixtures(all.filter(f => f.status === 'SCHEDULED' && new Date(f.kickoffAt).getTime() > now));
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load fixtures');
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <p className="text-white text-sm">Loading fixtures…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-psl-navy p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/predictions" className="text-white/60 hover:text-white text-sm">Predictions</Link>
        <span className="text-white/30">/</span>
        <h1 className="text-xl font-bold text-white">Upcoming Fixtures</h1>
      </div>

      {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

      {fixtures.length === 0 ? (
        <p className="text-white/60 text-sm">No upcoming fixtures available for prediction.</p>
      ) : (
        <div className="space-y-3 max-w-lg">
          {fixtures.map(f => (
            <Link
              key={f.id}
              href={`/predictions/fixtures/${f.id}`}
              className="block bg-white rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <p className="text-xs text-gray-400 mb-2">{fmtDate(f.kickoffAt)}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-psl-navy">{f.homeTeam.shortName}</span>
                <span className="text-xs text-gray-400 font-mono">vs</span>
                <span className="font-semibold text-psl-navy">{f.awayTeam.shortName}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
