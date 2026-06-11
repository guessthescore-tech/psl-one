'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getClubStats } from '@/lib/clubs-client';

interface ClubStats {
  teamId: string;
  name: string;
  slug: string;
  matchesPlayed: number;
  squadSize: number;
  note: string;
}

export default function ClubStatsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getClubStats(slug)
      .then(setStats)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading stats…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Club Stats</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold">{stats.matchesPlayed}</p>
          <p className="text-sm text-gray-500 mt-1">Matches Played</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold">{stats.squadSize}</p>
          <p className="text-sm text-gray-500 mt-1">Squad Size</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">{stats.note}</p>
    </div>
  );
}
