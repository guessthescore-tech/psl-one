'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getClubSquad } from '@/lib/clubs-client';

interface Player {
  id: string;
  name: string;
  position: string;
  number: number | null;
  nationality: string;
  dateOfBirth: string | null;
  prices: { price: number }[];
}

interface SquadData {
  teamId: string;
  teamName: string;
  slug: string;
  grouped: Record<string, Player[]>;
}

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: 'Goalkeepers',
  DEFENDER: 'Defenders',
  MIDFIELDER: 'Midfielders',
  FORWARD: 'Forwards',
};

export default function ClubSquadPage() {
  const { slug } = useParams<{ slug: string }>();
  const [squad, setSquad] = useState<SquadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getClubSquad(slug)
      .then(setSquad)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading squad…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!squad) return null;

  const totalPlayers = Object.values(squad.grouped).flat().length;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-1">Squad</h2>
      <p className="text-sm text-gray-500 mb-4">{totalPlayers} registered players</p>

      {totalPlayers === 0 ? (
        <p className="text-gray-400 text-sm">No squad data available. Squad assignment coming soon.</p>
      ) : (
        Object.entries(POSITION_LABELS).map(([pos, label]) => {
          const players = squad.grouped[pos] ?? [];
          if (players.length === 0) return null;
          return (
            <div key={pos} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{label} ({players.length})</h3>
              <div className="space-y-1">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
                    {p.number !== null && (
                      <span className="w-8 text-center text-sm font-bold text-gray-400">{p.number}</span>
                    )}
                    <span className="font-medium text-sm flex-1">{p.name}</span>
                    <span className="text-xs text-gray-400">{p.nationality}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
