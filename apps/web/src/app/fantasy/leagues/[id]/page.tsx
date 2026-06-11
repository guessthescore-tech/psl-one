'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { getLeague, type League } from '@/lib/fantasy-rules-client';

export default function LeagueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [league, setLeague] = useState<(League & { members: { id: string; fantasyTeam: { id: string; name: string } }[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeague(id)
      .then(l => setLeague(l as never))
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="p-4 text-sm text-gray-400">Loading…</main>;
  if (error) return <main className="p-4"><p className="text-red-600 text-sm">{error}</p></main>;
  if (!league) return null;

  return (
    <main className="max-w-lg mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{league.name}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {league.type} · {league.scoringType}
          </p>
        </div>
        <Link href="/fantasy/leagues" className="text-sm text-blue-600 underline">My Leagues</Link>
      </div>

      {/* Info */}
      <div className="border rounded bg-white divide-y mb-4">
        <div className="flex justify-between px-4 py-2 text-sm">
          <span className="text-gray-500">Members</span>
          <span className="font-medium">{(league.members as { id: string }[]).length}</span>
        </div>
        {league.inviteCode && (
          <div className="flex justify-between px-4 py-2 text-sm">
            <span className="text-gray-500">Invite code</span>
            <span className="font-mono font-bold tracking-widest text-purple-700">{league.inviteCode}</span>
          </div>
        )}
        <div className="flex justify-between px-4 py-2 text-sm">
          <span className="text-gray-500">Joinable</span>
          <span>{league.isJoinable ? 'Yes' : 'Closed'}</span>
        </div>
        <div className="flex justify-between px-4 py-2 text-sm">
          <span className="text-gray-500">Scoring</span>
          <span>{league.scoringType === 'CLASSIC' ? 'Classic' : 'Head-to-Head'}</span>
        </div>
      </div>

      <Link
        href={`/fantasy/leagues/${id}/standings`}
        className="block w-full text-center py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        View Standings
      </Link>
    </main>
  );
}
