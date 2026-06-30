'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { footballClient, type Fixture } from '@/lib/football-client';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: 'Scheduled', className: 'bg-gray-100 text-gray-600' },
  LIVE: { label: 'Live', className: 'bg-red-100 text-red-700 font-bold' },
  FINISHED: { label: 'FT', className: 'bg-green-100 text-green-800' },
  POSTPONED: { label: 'Postponed', className: 'bg-yellow-100 text-yellow-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-200 text-gray-500' },
};

function FixtureCard({ f }: { f: Fixture }) {
  const badge = STATUS_BADGE[f.status] ?? STATUS_BADGE['SCHEDULED']!;
  const kickoff = new Date(f.kickoffAt);

  return (
    <Link href={`/football/fixtures/${f.id}`} className="block bg-white rounded-lg px-4 py-4 hover:bg-gray-50 transition">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">
          {f.group ? `Group ${f.group.name} · ` : ''}
          {kickoff.toLocaleDateString('en-ZA')} {kickoff.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-psl-navy text-sm flex-1">{f.homeTeam.shortName}</p>
        <div className="text-center min-w-[60px]">
          {f.homeScore != null && f.awayScore != null ? (
            <span className="font-bold text-psl-navy">{f.homeScore} – {f.awayScore}</span>
          ) : (
            <span className="text-gray-300 text-sm">vs</span>
          )}
        </div>
        <p className="font-semibold text-psl-navy text-sm flex-1 text-right">{f.awayTeam.shortName}</p>
      </div>

      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-400">{f.homeTeam.name}</p>
        <p className="text-xs text-gray-400">{f.awayTeam.name}</p>
      </div>
    </Link>
  );
}

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    footballClient.getActiveSeason()
      .then((season) =>
        footballClient.listFixtures({
          seasonSlug: season.slug,
          ...(statusFilter ? { status: statusFilter } : {}),
        }),
      )
      .then(setFixtures)
      .catch(() => setError('Could not load fixtures for the active season'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const statuses = ['', 'SCHEDULED', 'LIVE', 'FINISHED'];

  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <nav className="text-gray-400 text-sm mb-6">
          <Link href="/football" className="hover:text-white transition">Football</Link>
          <span className="mx-2">›</span>
          <span className="text-white">Fixtures</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-4">Fixtures</h1>

        <div className="flex gap-2 mb-6 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                statusFilter === s
                  ? 'bg-psl-gold text-psl-navy'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-400 text-sm">Loading…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="space-y-3">
          {fixtures.map(f => <FixtureCard key={f.id} f={f} />)}
        </div>

        {!loading && fixtures.length === 0 && !error && (
          <p className="text-gray-400 text-sm text-center py-8">No fixtures found.</p>
        )}
      </div>
    </main>
  );
}
