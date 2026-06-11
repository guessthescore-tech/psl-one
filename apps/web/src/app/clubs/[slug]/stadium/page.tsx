'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getClubStadium } from '@/lib/clubs-client';

interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number | null;
}

interface StadiumData {
  teamId: string;
  name: string;
  venue: Venue | null;
  note?: string;
}

export default function ClubStadiumPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<StadiumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getClubStadium(slug)
      .then(setData)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading stadium info…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Stadium</h2>
      {data.venue ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="text-xl font-bold">{data.venue.name}</h3>
          <p className="text-gray-600">{data.venue.city}, {data.venue.country}</p>
          {data.venue.capacity && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Capacity:</span>
              <span className="font-semibold">{data.venue.capacity.toLocaleString()}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
          <p className="text-gray-500 text-sm">{data.note ?? 'No stadium information available yet.'}</p>
        </div>
      )}
    </div>
  );
}
