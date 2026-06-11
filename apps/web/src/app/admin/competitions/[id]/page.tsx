'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listAdminCompetitions, listAdminSeasons, type AdminCompetition, type AdminSeason } from '@/lib/admin-client';

const STATUS_BADGE: Record<string, string> = {
  UPCOMING: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  ARCHIVED: 'bg-gray-200 text-gray-500',
};

export default function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [competition, setCompetition] = useState<AdminCompetition | null>(null);
  const [seasons, setSeasons] = useState<AdminSeason[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    Promise.all([listAdminCompetitions(), listAdminSeasons(id)])
      .then(([comps, seas]) => {
        const comp = comps.find((c) => c.id === id);
        if (!comp) throw new Error('Competition not found');
        setCompetition(comp);
        setSeasons(seas);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="p-6"><p className="text-gray-500">Loading...</p></main>;
  if (error) return <main className="p-6"><p className="text-red-600">{error}</p></main>;
  if (!competition) return null;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/admin/competitions" className="text-sm text-gray-500 hover:underline">Competitions</Link>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-700">{competition.name}</span>
      </div>

      <div className="flex items-center justify-between mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{competition.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{competition.slug} · {competition.format}</p>
        </div>
        <Link
          href={`/admin/competitions/${competition.id}/seasons`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Manage Seasons
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 p-4 border rounded-lg bg-gray-50">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Team Count</p>
          <p className="font-medium">{competition.teamCount ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Points</p>
          <p className="font-medium">W{competition.pointsForWin} / D{competition.pointsForDraw} / L{competition.pointsForLoss}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Flags</p>
          <p className="text-sm text-gray-700 space-x-2">
            {competition.hasGroups && <span className="inline-block bg-gray-200 px-2 py-0.5 rounded text-xs">Groups</span>}
            {competition.hasKnockouts && <span className="inline-block bg-gray-200 px-2 py-0.5 rounded text-xs">Knockouts</span>}
            {competition.hasHomeAway && <span className="inline-block bg-gray-200 px-2 py-0.5 rounded text-xs">Home/Away</span>}
            {competition.usesNeutralVenues && <span className="inline-block bg-gray-200 px-2 py-0.5 rounded text-xs">Neutral Venues</span>}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Stages</p>
          <p className="font-medium">{competition._count.stages}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Seasons ({seasons.length})</h2>
      {seasons.length === 0 && <p className="text-gray-500">No seasons yet.</p>}
      <div className="space-y-2">
        {seasons.map((s) => (
          <Link
            key={s.id}
            href={`/admin/seasons/${s.id}`}
            className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{s.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[s.status] ?? 'bg-gray-100'}`}>
                  {s.status}
                </span>
                {s.isActive && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-600 text-white font-semibold">ACTIVE</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {s.slug} · {s._count.fixtures} fixture{s._count.fixtures !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-gray-400 text-sm">&rarr;</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
