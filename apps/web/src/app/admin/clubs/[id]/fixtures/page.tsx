'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminGetClubFixtures } from '@/lib/clubs-client';

const TOKEN = 'dev-token';

interface Fixture {
  id: string;
  homeTeam: { id: string; name: string; slug: string } | null;
  awayTeam: { id: string; name: string; slug: string } | null;
  venue: { id: string; name: string; city: string } | null;
  gameweek: { id: string; name: string; transferDeadlineAt: string } | null;
  kickoffAt: string;
  status: string;
  assignmentStatus: string | null;
}

export default function AdminClubFixturesPage() {
  const { id } = useParams<{ id: string }>();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    adminGetClubFixtures(TOKEN, id)
      .then(setFixtures)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading fixtures…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href={`/admin/clubs/${id}`} className="text-sm text-blue-600 hover:underline">← Club</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold">Fixtures ({fixtures.length})</h1>
      </div>

      {fixtures.length === 0 ? (
        <p className="text-gray-400 text-sm">No fixtures assigned to this club.</p>
      ) : (
        <div className="space-y-2">
          {fixtures.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">
                  {f.homeTeam?.name ?? 'TBD'} vs {f.awayTeam?.name ?? 'TBD'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${f.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {f.status}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-gray-400">
                <span>{new Date(f.kickoffAt).toLocaleString()}</span>
                {f.venue && <span>{f.venue.name}</span>}
                {f.gameweek && <span>{f.gameweek.name}</span>}
                {!f.gameweek && <span className="text-yellow-600">⚠ No gameweek</span>}
                {!f.venue && <span className="text-yellow-600">⚠ No venue</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
