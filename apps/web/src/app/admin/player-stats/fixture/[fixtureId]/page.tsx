'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { listAdminStats, bulkPublishFixture } from '@/lib/admin-player-stats-client';

interface StatEntry {
  id: string;
  status: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  rating: number | null;
  player: { id: string; name: string; position: string };
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

export default function AdminFixtureStatsPage() {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const [data, setData] = useState<StatsListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  function reload() {
    setLoading(true);
    (listAdminStats({ fixtureId }) as Promise<StatsListData>)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { reload(); }, [fixtureId]);

  async function handleBulkPublish() {
    setPublishing(true);
    setError(null);
    try {
      await bulkPublishFixture(fixtureId);
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setPublishing(false);
    }
  }

  const verifiedCount = data?.stats.filter((s) => s.status === 'VERIFIED').length ?? 0;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/player-stats" className="hover:text-gray-600">Player Stats</Link>
        <span>/</span>
        <span className="text-gray-600">Fixture: {fixtureId.substring(0, 8)}…</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 mt-1">Fixture Stats</h1>
        {verifiedCount > 0 && (
          <button
            onClick={() => void handleBulkPublish()}
            disabled={publishing}
            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
          >
            {publishing ? 'Publishing…' : `Bulk Publish (${verifiedCount} verified)`}
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <>
          <p className="text-xs text-gray-400 mb-2">{data.total} entries for this fixture</p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {data.stats.length === 0 ? (
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-2">No stats yet.</p>
                <Link href="/admin/player-stats/new" className="text-xs text-blue-600 underline">+ Add stats for this fixture</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.stats.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.player.name}</p>
                      <p className="text-xs text-gray-400">{s.player.position}{s.team ? ` · ${s.team.name}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{s.goals}G {s.assists}A {s.minutesPlayed}'</span>
                      {s.rating && <span className="text-xs text-gray-500">{s.rating.toFixed(1)}★</span>}
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLOURS[s.status] ?? ''}`}>{s.status}</span>
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
