'use client';

import { use, useEffect, useState } from 'react';
import { getFixturePlayerRatings } from '@/lib/match-centre-client';

interface PlayerRating {
  playerId: string;
  rating: number;
  ratingSource?: string;
  dataStatus?: string;
  player?: { name: string; position?: string };
  team?: { shortName: string };
}

export default function MatchPlayersPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [ratings, setRatings] = useState<PlayerRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFixturePlayerRatings(fixtureId)
      .then((d: unknown) => {
        const r = d as { ratings?: PlayerRating[] } | PlayerRating[];
        setRatings(Array.isArray(r) ? r : r.ratings ?? []);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <a href={`/matches/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Match Overview</a>
      <h1 className="text-2xl font-bold mb-4">Player Ratings</h1>
      <p className="text-xs text-gray-400 mb-4">Ratings are provisional until marked OFFICIAL. Source and status shown per rating.</p>
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="space-y-2">
        {ratings.map(r => (
          <div key={r.playerId} className="border rounded-lg p-3 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{r.player?.name ?? r.playerId}</div>
              <div className="text-xs text-gray-500">{r.team?.shortName} · {r.player?.position ?? 'N/A'}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">{r.rating.toFixed(1)}</div>
              <div className="text-xs text-gray-400">{r.dataStatus ?? 'PROVISIONAL'}</div>
            </div>
          </div>
        ))}
        {!loading && ratings.length === 0 && <p className="text-gray-400 text-sm">No player ratings yet.</p>}
      </div>
    </main>
  );
}
