'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listAdminCompetitions, listAdminSeasons, activateSeason, type AdminSeason } from '@/lib/admin-client';

const STATUS_BADGE: Record<string, string> = {
  UPCOMING: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  ARCHIVED: 'bg-gray-200 text-gray-500',
};

export default function SeasonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [season, setSeason] = useState<AdminSeason | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    listAdminCompetitions()
      .then(async (comps) => {
        for (const comp of comps) {
          const seasons = await listAdminSeasons(comp.id);
          const found = seasons.find((s) => s.id === id);
          if (found) return found;
        }
        throw new Error('Season not found');
      })
      .then(setSeason)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleActivate() {
    if (!season) return;
    setActivating(true);
    setActivateError(null);
    try {
      const updated = await activateSeason(season.id);
      setSeason(updated);
    } catch (e: unknown) {
      setActivateError(e instanceof Error ? e.message : 'Failed to activate');
    } finally {
      setActivating(false);
    }
  }

  if (loading) return <main className="p-6"><p className="text-gray-500">Loading...</p></main>;
  if (error) return <main className="p-6"><p className="text-red-600">{error}</p></main>;
  if (!season) return null;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Link href="/admin/competitions" className="hover:underline">Competitions</Link>
        <span>/</span>
        <Link href={`/admin/competitions/${season.competitionId}`} className="hover:underline">Competition</Link>
        <span>/</span>
        <span>{season.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{season.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[season.status] ?? 'bg-gray-100'}`}>
              {season.status}
            </span>
            {season.isActive && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-600 text-white font-semibold">ACTIVE</span>
            )}
          </div>
          <p className="text-gray-500 text-sm">{season.slug}</p>
        </div>

        {!season.isActive && (
          <button
            onClick={handleActivate}
            disabled={activating}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
          >
            {activating ? 'Activating...' : 'Activate Season'}
          </button>
        )}
      </div>

      {activateError && (
        <p className="text-red-600 bg-red-50 p-3 rounded text-sm mb-4">{activateError}</p>
      )}

      {season.isActive && (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800 mb-4">
          This is the globally active season. Fantasy, predictions, and gameweeks operate against this season.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-gray-50">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
          <p className="font-medium">{new Date(season.startDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">End Date</p>
          <p className="font-medium">{new Date(season.endDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fixtures</p>
          <p className="font-medium">{season._count.fixtures}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Source</p>
          <p className="font-medium">{season.source ?? '—'}</p>
        </div>
      </div>
    </main>
  );
}
