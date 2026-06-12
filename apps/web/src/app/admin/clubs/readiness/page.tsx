'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminGetClubReadiness } from '@/lib/clubs-client';
import { getBetaToken } from '@/lib/auth-client';


interface ClubSummary {
  teamId: string;
  name: string;
  slug: string;
  overallReadiness: string;
  profileReady: boolean;
  squadReady: boolean;
  shopfrontReady: boolean;
  catalogueReady: boolean;
  fixturesReady: boolean;
  venueReady: boolean;
  playerCount: number;
  productCount: number;
}

interface ReadinessData {
  totalClubs: number;
  readyCount: number;
  notStartedCount: number;
  clubs: ClubSummary[];
}

const READINESS_COLOR: Record<string, string> = {
  READY: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  NOT_STARTED: 'bg-gray-100 text-gray-600',
};

export default function AdminClubReadinessPage() {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetClubReadiness(getBetaToken())
      .then(setData)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading readiness data…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Club Readiness Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold">{data.totalClubs}</p>
          <p className="text-sm text-gray-500">Total Clubs</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{data.readyCount}</p>
          <p className="text-sm text-gray-500">Ready</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-gray-400">{data.notStartedCount}</p>
          <p className="text-sm text-gray-500">Not Started</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.clubs.map((club) => (
          <div key={club.teamId} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Link href={`/admin/clubs/${club.teamId}`} className="font-semibold hover:underline">{club.name}</Link>
                <span className={`text-xs px-2 py-0.5 rounded-full ${READINESS_COLOR[club.overallReadiness] ?? 'bg-gray-100'}`}>
                  {club.overallReadiness.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs text-gray-400">{club.playerCount} players · {club.productCount} products</span>
            </div>
            <div className="flex gap-4 text-xs">
              {[
                { label: 'Profile', ready: club.profileReady },
                { label: 'Squad', ready: club.squadReady },
                { label: 'Venue', ready: club.venueReady },
                { label: 'Shop', ready: club.shopfrontReady },
                { label: 'Catalogue', ready: club.catalogueReady },
                { label: 'Fixtures', ready: club.fixturesReady },
              ].map(({ label, ready }) => (
                <span key={label} className={ready ? 'text-green-600' : 'text-gray-300'}>
                  {ready ? '✓' : '○'} {label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
