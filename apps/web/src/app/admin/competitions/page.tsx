'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listAdminCompetitions, type AdminCompetition } from '@/lib/admin-client';

const FORMAT_BADGE: Record<string, string> = {
  LEAGUE: 'bg-blue-100 text-blue-800',
  CUP: 'bg-purple-100 text-purple-800',
  TOURNAMENT: 'bg-green-100 text-green-800',
  HYBRID: 'bg-orange-100 text-orange-800',
};

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<AdminCompetition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAdminCompetitions()
      .then(setCompetitions)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Competitions</h1>
        <Link
          href="/admin/competitions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          New Competition
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600 bg-red-50 p-3 rounded">{error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {competitions.length === 0 && (
            <p className="text-gray-500">No competitions yet.</p>
          )}
          {competitions.map((c) => (
            <Link
              key={c.id}
              href={`/admin/competitions/${c.id}`}
              className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{c.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FORMAT_BADGE[c.format] ?? 'bg-gray-100 text-gray-700'}`}>
                      {c.format}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {c.slug}
                    {c.teamCount ? ` · ${c.teamCount} teams` : ''}
                    {' · '}{c._count.seasons} season{c._count.seasons !== 1 ? 's' : ''}
                    {' · '}{c._count.stages} stage{c._count.stages !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-gray-400 text-sm">View &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
