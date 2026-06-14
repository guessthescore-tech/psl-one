'use client';

import { useEffect, useState } from 'react';
import { footballClient, type Fixture } from '@/lib/football-client';

const STATUS_CLASSES: Record<string, string> = {
  LIVE: 'bg-red-100 text-red-700',
  HALF_TIME: 'bg-orange-100 text-orange-700',
  FINISHED: 'bg-gray-100 text-gray-600',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  POSTPONED: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-50 text-red-400',
};

export default function AdminLiveMatchIndexPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'LIVE' | 'ALL'>('LIVE');

  useEffect(() => {
    footballClient.listFixtures(filter === 'LIVE' ? { status: 'LIVE' } : undefined)
      .then(setFixtures)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Match Operations</h1>
          <p className="text-xs text-gray-500 mt-1">Monitor and manage live match data ingestion</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/live-match/provider-readiness" className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">Provider Readiness</a>
          <a href="/admin/live-match/ingestion-batches" className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">Ingestion Batches</a>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter('LIVE')} className={`px-3 py-1 text-xs rounded-full ${filter === 'LIVE' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
          Live Now
        </button>
        <button onClick={() => setFilter('ALL')} className={`px-3 py-1 text-xs rounded-full ${filter === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
          All Fixtures
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {!loading && fixtures.length === 0 && (
        <p className="text-gray-400 text-sm">{filter === 'LIVE' ? 'No live matches at the moment.' : 'No fixtures found.'}</p>
      )}

      <div className="space-y-3">
        {fixtures.map(f => (
          <div key={f.id} className="border rounded-xl p-4 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="font-semibold">
                {f.homeTeam.shortName} vs {f.awayTeam.shortName}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {new Date(f.kickoffAt).toLocaleString()} · {f.season.name}
              </div>
              {(f.homeScore !== null || f.awayScore !== null) && (
                <div className="text-lg font-bold mt-1">{f.homeScore ?? 0} – {f.awayScore ?? 0}</div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[f.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {f.status}{f.currentMinute ? ` ${f.currentMinute}'` : ''}
              </span>
              <a href={`/admin/live-match/${f.id}`} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg">
                Manage →
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
