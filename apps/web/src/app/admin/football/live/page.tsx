'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { footballClient, type Fixture } from '@/lib/football-client';

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: 'bg-gray-100 text-gray-600',
  LIVE: 'bg-green-100 text-green-700',
  HALF_TIME: 'bg-amber-100 text-amber-700',
  FINISHED: 'bg-blue-100 text-blue-700',
  POSTPONED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function FixtureCard({ f }: { f: Fixture }) {
  const badgeClass = STATUS_BADGE[f.status] ?? 'bg-gray-100 text-gray-500';
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
            {f.status}
            {f.status === 'LIVE' && f.currentMinute != null && ` ${f.currentMinute}'`}
          </span>
          <span className="text-xs text-gray-400">{new Date(f.kickoffAt).toLocaleString()}</span>
        </div>
        <p className="text-sm font-semibold text-gray-900 truncate">
          {f.homeTeam.name} {f.homeScore ?? 0} – {f.awayScore ?? 0} {f.awayTeam.name}
        </p>
        <p className="text-xs text-gray-400">{f.season.competition.name}</p>
        <p className="text-xs text-gray-300 font-mono mt-0.5">{f.id}</p>
      </div>
      <Link
        href={`/admin/football/fixtures/${f.id}/live`}
        className="shrink-0 px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700"
      >
        Manage →
      </Link>
    </div>
  );
}

export default function AdminFootballLivePage() {
  const router = useRouter();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [filter, setFilter] = useState<string>('LIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directId, setDirectId] = useState('');

  useEffect(() => {
    setLoading(true);
    footballClient
      .listFixtures(filter && filter !== 'ALL' ? { status: filter } : undefined)
      .then(setFixtures)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [filter]);

  function handleDirectNavigate() {
    const id = directId.trim();
    if (id) router.push(`/admin/football/fixtures/${id}/live`);
  }

  const statuses = ['ALL', 'LIVE', 'HALF_TIME', 'SCHEDULED', 'FINISHED'];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/admin" className="hover:underline">Admin</Link>
        {' / '}
        <span>Football — Live Management</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-5">Live Fixture Management</h1>

      {/* Direct fixture ID jump */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Open fixture by ID
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste fixture UUID…"
            value={directId}
            onChange={e => setDirectId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDirectNavigate()}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <button
            onClick={handleDirectNavigate}
            disabled={!directId.trim()}
            className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-40"
          >
            Open →
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Paste a fixture ID to jump directly to its live admin page.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 text-sm rounded-full border ${
              filter === s
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {loading ? (
        <div className="text-gray-400 animate-pulse text-sm">Loading fixtures…</div>
      ) : fixtures.length === 0 ? (
        <div className="text-gray-400 italic text-center py-12 text-sm">
          No fixtures found for status: {filter}
        </div>
      ) : (
        <div className="space-y-3">
          {fixtures.map(f => <FixtureCard key={f.id} f={f} />)}
        </div>
      )}
    </div>
  );
}
