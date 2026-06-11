'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getClubs } from '@/lib/clubs-client';

interface Club {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  logoUrl: string | null;
  clubProfile: { primaryColor: string | null; city: string | null } | null;
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClubs('psl-premiership-upcoming')
      .then(setClubs)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading clubs…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-1">PSL Premiership Clubs</h1>
      <p className="text-sm text-gray-500 mb-6">16 clubs competing in the upcoming PSL season</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {clubs.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.slug}`}
            className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2"
              style={{ backgroundColor: club.clubProfile?.primaryColor ?? '#1e3a5f' }}
            >
              {club.shortName.slice(0, 2)}
            </div>
            <span className="text-sm font-medium text-center">{club.name}</span>
            {club.clubProfile?.city && (
              <span className="text-xs text-gray-400 mt-0.5">{club.clubProfile.city}</span>
            )}
          </Link>
        ))}
      </div>

      {clubs.length === 0 && (
        <p className="text-gray-400 text-center py-12">No clubs found for this season.</p>
      )}
    </div>
  );
}
