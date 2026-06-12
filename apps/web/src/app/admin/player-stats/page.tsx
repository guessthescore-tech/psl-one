'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { listAdminStats } from '@/lib/admin-player-stats-client';

interface StatEntry {
  id: string;
  status: string;
  source: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  player: { id: string; name: string; position: string };
  fixture: { id: string; kickoffAt: string; homeTeam: { name: string }; awayTeam: { name: string } };
  team: { id: string; name: string } | null;
}

interface StatsListData {
  stats: StatEntry[];
  total: number;
}

const STATUS_COLOURS: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  VERIFIED: 'bg-blue-100 text-blue-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  LOCKED: 'bg-gray-200 text-gray-700',
};

function AdminPlayerStatsContent() {
  const searchParams = useSearchParams();
  const seasonId = searchParams.get('seasonId') ?? undefined;
  const fixtureId = searchParams.get('fixtureId') ?? undefined;
  const status = searchParams.get('status') ?? undefined;

  const [data, setData] = useState<StatsListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAdminStats({ ...(seasonId && { seasonId }), ...(fixtureId && { fixtureId }), ...(status && { status }) })
      .then((d) => setData(d as StatsListData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [seasonId, fixtureId, status]);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Player Match Stats</h1>
        <div className="flex gap-2">
          <Link href="/admin/player-stats/new" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded">+ New Entry</Link>
          <Link href="/admin" className="text-sm text-blue-600 underline">Admin</Link>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['DRAFT', 'VERIFIED', 'PUBLISHED', 'LOCKED'].map((s) => (
          <Link
            key={s}
            href={`/admin/player-stats?status=${s}`}
            className={`text-xs px-2 py-1 rounded ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s}
          </Link>
        ))}
        {status && <Link href="/admin/player-stats" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Clear</Link>}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <>
          <p className="text-xs text-gray-400 mb-2">{data.total} entries</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {data.stats.length === 0 ? (
              <p className="text-xs text-gray-400 p-4">No stats found.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.stats.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.player.name}</p>
                      <p className="text-xs text-gray-400">
                        {s.fixture.homeTeam.name} v {s.fixture.awayTeam.name} · {new Date(s.fixture.kickoffAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{s.goals}G {s.assists}A {s.minutesPlayed}'</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLOURS[s.status] ?? 'bg-gray-100 text-gray-700'}`}>{s.status}</span>
                      <Link href={`/admin/player-stats/${s.id}`} className="text-xs text-blue-600 underline">Edit</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

export default function AdminPlayerStatsPage() {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-gray-400">Loading…</p>}>
      <AdminPlayerStatsContent />
    </Suspense>
  );
}
