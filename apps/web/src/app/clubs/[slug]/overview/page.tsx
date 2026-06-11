'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getClubOverview } from '@/lib/clubs-client';

interface Fixture {
  id: string;
  homeTeam: { name: string; slug: string };
  awayTeam: { name: string; slug: string };
  kickoffAt: string;
  venue?: { name: string; city: string } | null;
  gameweek?: { name: string } | null;
}

interface ClubOverview {
  id: string;
  name: string;
  slug: string;
  players: { id: string; name: string; position: string; number: number | null }[];
  contentItems: { id: string; title: string; publishedAt: string | null }[];
  nextFixture: Fixture | null;
  recentResult: Fixture | null;
}

export default function ClubOverviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<ClubOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getClubOverview(slug)
      .then(setData)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading overview…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.nextFixture && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 uppercase mb-2">Next Fixture</p>
            <p className="font-semibold">{data.nextFixture.homeTeam.name} vs {data.nextFixture.awayTeam.name}</p>
            <p className="text-sm text-gray-500">{new Date(data.nextFixture.kickoffAt).toLocaleDateString()}</p>
            {data.nextFixture.venue && <p className="text-xs text-gray-400">{data.nextFixture.venue.name}</p>}
          </div>
        )}

        {data.recentResult && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 uppercase mb-2">Recent Result</p>
            <p className="font-semibold">{data.recentResult.homeTeam.name} vs {data.recentResult.awayTeam.name}</p>
            <p className="text-sm text-gray-500">{new Date(data.recentResult.kickoffAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {data.players.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Squad Preview</h2>
            <Link href={`/clubs/${slug}/squad`} className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.players.map((p) => (
              <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-3 text-sm">
                <span className="font-medium">{p.name}</span>
                <span className="ml-2 text-xs text-gray-400">{p.position}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.contentItems.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Latest News</h2>
          <div className="space-y-2">
            {data.contentItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="font-medium text-sm">{item.title}</p>
                {item.publishedAt && (
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(item.publishedAt).toLocaleDateString()}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
