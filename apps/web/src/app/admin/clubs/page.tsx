'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminGetClubList } from '@/lib/clubs-client';

const TOKEN = 'dev-token';

interface Club {
  id: string;
  name: string;
  slug: string;
  clubProfile: { profileStatus: string } | null;
  experienceStatus: {
    profileReady: boolean;
    squadReady: boolean;
    shopfrontReady: boolean;
    fixturesReady: boolean;
  } | null;
  _count: { players: number };
}

function ReadinessDot({ ready }: { ready: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${ready ? 'bg-green-500' : 'bg-gray-300'}`} />
  );
}

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetClubList(TOKEN)
      .then(setClubs)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading clubs…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin — Clubs</h1>
        <Link href="/admin/clubs/readiness" className="text-sm text-blue-600 hover:underline">
          Readiness Dashboard →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 pr-4">Club</th>
              <th className="pb-2 pr-4">Players</th>
              <th className="pb-2 pr-4 text-center">Profile</th>
              <th className="pb-2 pr-4 text-center">Squad</th>
              <th className="pb-2 pr-4 text-center">Shop</th>
              <th className="pb-2 pr-4 text-center">Fixtures</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((club) => (
              <tr key={club.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium">{club.name}</td>
                <td className="py-3 pr-4 text-gray-600">{club._count.players}</td>
                <td className="py-3 pr-4 text-center"><ReadinessDot ready={club.experienceStatus?.profileReady ?? false} /></td>
                <td className="py-3 pr-4 text-center"><ReadinessDot ready={club.experienceStatus?.squadReady ?? false} /></td>
                <td className="py-3 pr-4 text-center"><ReadinessDot ready={club.experienceStatus?.shopfrontReady ?? false} /></td>
                <td className="py-3 pr-4 text-center"><ReadinessDot ready={club.experienceStatus?.fixturesReady ?? false} /></td>
                <td className="py-3">
                  <Link href={`/admin/clubs/${club.id}`} className="text-blue-600 hover:underline mr-3">View</Link>
                  <Link href={`/admin/clubs/${club.id}/players`} className="text-blue-600 hover:underline">Players</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
