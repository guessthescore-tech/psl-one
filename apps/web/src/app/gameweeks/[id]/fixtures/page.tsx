'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { gameweeksClient, GameweekWithFixtures, GameweekFixture } from '../../../../lib/gameweeks-client';

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: 'bg-gray-100 text-gray-600',
  LIVE: 'bg-green-100 text-green-700',
  HALF_TIME: 'bg-amber-100 text-amber-700',
  FINISHED: 'bg-slate-100 text-slate-500',
  POSTPONED: 'bg-red-100 text-red-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC';
}

function FixtureRow({ fixture }: { fixture: GameweekFixture }) {
  const hasScore = fixture.homeScore !== null && fixture.awayScore !== null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3">
      <div className="flex-1 text-sm">
        <div className="font-medium">
          {fixture.homeTeam.shortName} v {fixture.awayTeam.shortName}
        </div>
        <div className="text-xs text-gray-400">{formatKickoff(fixture.kickoffAt)}</div>
        {fixture.venue && (
          <div className="text-xs text-gray-400">{fixture.venue.name}, {fixture.venue.city}</div>
        )}
      </div>
      <div className="text-right">
        {hasScore ? (
          <div className="font-mono font-bold text-lg">
            {fixture.homeScore} – {fixture.awayScore}
          </div>
        ) : (
          <div className="text-xs text-gray-400">TBD</div>
        )}
        <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_BADGE[fixture.status] ?? 'bg-gray-100 text-gray-500'}`}>
          {fixture.status}
        </span>
      </div>
    </div>
  );
}

export default function GameweekFixturesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<GameweekWithFixtures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gameweeksClient
      .getFixtures(id)
      .then(setData)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-gray-500">Loading fixtures...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <div>
        <Link href={`/gameweeks/${id}`} className="text-sm text-blue-600 hover:underline">← {data.name}</Link>
        <h1 className="text-2xl font-bold mt-1">Fixtures</h1>
        <div className="text-sm text-gray-500">{data.fixtures.length} matches</div>
      </div>

      <div className="space-y-2">
        {data.fixtures.map(f => (
          <FixtureRow key={f.id} fixture={f} />
        ))}
      </div>
    </main>
  );
}
