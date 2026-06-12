'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPlayerMatchStat } from '@/lib/players-client';

interface MatchStatDetail {
  id: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  cleanSheet: boolean;
  shotsOnTarget: number;
  shotsTotal: number;
  keyPasses: number;
  tacklesWon: number;
  interceptions: number;
  aerialDuelsWon: number;
  rating: number | null;
  started: boolean;
  cameOnMinute: number | null;
  subbedOffMinute: number | null;
  player: { id: string; name: string; position: string; number: number | null };
  fixture: {
    id: string; kickoffAt: string; homeScore: number | null; awayScore: number | null; status: string;
    homeTeam: { id: string; name: string };
    awayTeam: { id: string; name: string };
    season: { id: string; name: string; slug: string };
  };
  team: { id: string; name: string; shortName: string } | null;
}

export default function PlayerMatchStatPage() {
  const { playerId, fixtureId } = useParams<{ playerId: string; fixtureId: string }>();
  const [stat, setStat] = useState<MatchStatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlayerMatchStat(playerId, fixtureId)
      .then((d) => setStat(d as MatchStatDetail))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [playerId, fixtureId]);

  const STATS = stat ? [
    { label: 'Minutes', value: stat.minutesPlayed },
    { label: 'Goals', value: stat.goals },
    { label: 'Assists', value: stat.assists },
    { label: 'Shots (on target)', value: `${stat.shotsTotal} (${stat.shotsOnTarget})` },
    { label: 'Key Passes', value: stat.keyPasses },
    { label: 'Tackles Won', value: stat.tacklesWon },
    { label: 'Interceptions', value: stat.interceptions },
    { label: 'Aerial Duels Won', value: stat.aerialDuelsWon },
    { label: 'Yellow Cards', value: stat.yellowCards },
    { label: 'Red Cards', value: stat.redCards },
    { label: 'Saves', value: stat.saves },
    { label: 'Clean Sheet', value: stat.cleanSheet ? 'Yes' : 'No' },
  ] : [];

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/players" className="hover:text-gray-600">Players</Link>
        <span>/</span>
        <Link href={`/players/${playerId}`} className="hover:text-gray-600">{stat?.player.name ?? playerId}</Link>
        <span>/</span>
        <span className="text-gray-600">Match Stats</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">
        {stat ? `${stat.player.name} vs ${stat.fixture.homeTeam.name} / ${stat.fixture.awayTeam.name}` : 'Match Stats'}
      </h1>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {stat && !loading && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">
              {stat.fixture.homeTeam.name} {stat.fixture.homeScore ?? '?'}–{stat.fixture.awayScore ?? '?'} {stat.fixture.awayTeam.name}
              {' · '}{new Date(stat.fixture.kickoffAt).toLocaleDateString()}
              {' · '}{stat.fixture.season.name}
            </p>
            {stat.rating && <p className="text-sm font-semibold text-yellow-700 mt-1">Rating: {stat.rating.toFixed(1)}</p>}
            <p className="text-xs text-gray-400 mt-1">{stat.started ? 'Started' : `Came on ${stat.cameOnMinute}'`}{stat.subbedOffMinute ? ` · Subbed off ${stat.subbedOffMinute}'` : ''}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Performance Stats</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {STATS.map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center px-4 py-2">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <Link href={`/players/fixtures/${fixtureId}`} className="text-xs text-blue-600 underline block">
            View all player stats for this fixture →
          </Link>
        </div>
      )}
    </main>
  );
}
