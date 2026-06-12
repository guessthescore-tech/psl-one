'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPlayerProfile } from '@/lib/players-client';

interface PlayerProfile {
  id: string;
  name: string;
  position: string;
  number: number | null;
  nationality: string;
  dateOfBirth: string | null;
  team: { id: string; name: string; slug: string };
  playerStats: Array<{ seasonId: string; goals: number; assists: number; minutesPlayed: number; yellowCards: number; redCards: number }>;
}

export default function PlayerProfilePage() {
  const { playerId } = useParams<{ playerId: string }>();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlayerProfile(playerId)
      .then((d) => setPlayer(d as PlayerProfile))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [playerId]);

  const career = player?.playerStats.reduce(
    (acc, s) => ({ goals: acc.goals + s.goals, assists: acc.assists + s.assists, minutes: acc.minutes + s.minutesPlayed }),
    { goals: 0, assists: 0, minutes: 0 },
  );

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/players" className="hover:text-gray-600">Players</Link>
        <span>/</span>
        <span className="text-gray-600">{player?.name ?? 'Player'}</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">{player?.name ?? 'Player Profile'}</h1>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {player && !loading && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500 text-xs">Position</span><p className="font-semibold">{player.position}</p></div>
              <div><span className="text-gray-500 text-xs">Number</span><p className="font-semibold">{player.number ?? '—'}</p></div>
              <div><span className="text-gray-500 text-xs">Club</span><p className="font-semibold">{player.team.name}</p></div>
              <div><span className="text-gray-500 text-xs">Nationality</span><p className="font-semibold">{player.nationality}</p></div>
            </div>
          </div>

          {career && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Career Totals</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-2xl font-bold text-gray-900">{career.goals}</p><p className="text-xs text-gray-500">Goals</p></div>
                <div><p className="text-2xl font-bold text-gray-900">{career.assists}</p><p className="text-xs text-gray-500">Assists</p></div>
                <div><p className="text-2xl font-bold text-gray-900">{Math.round(career.minutes / 90)}</p><p className="text-xs text-gray-500">Apps (est.)</p></div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Links</h2>
            <div className="space-y-1">
              <Link href={`/clubs/${player.team.slug}`} className="text-xs text-blue-600 underline block">{player.team.name} Club Page →</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
