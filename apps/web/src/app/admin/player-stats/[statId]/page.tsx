'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAdminStatDetail, verifyStat, publishStat, lockStat, deleteStat } from '@/lib/admin-player-stats-client';

interface StatDetail {
  id: string;
  status: string;
  source: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  goalsConceded: number;
  cleanSheet: boolean;
  started: boolean;
  cameOnMinute: number | null;
  subbedOffMinute: number | null;
  shotsOnTarget: number;
  shotsTotal: number;
  keyPasses: number;
  tacklesWon: number;
  interceptions: number;
  blockedShots: number;
  aerialDuelsWon: number;
  rating: number | null;
  notes: string | null;
  verifiedAt: string | null;
  publishedAt: string | null;
  player: { id: string; name: string; position: string; number: number | null };
  fixture: { id: string; kickoffAt: string; status: string; homeTeam: { id: string; name: string }; awayTeam: { id: string; name: string }; season: { id: string; name: string } };
  team: { id: string; name: string } | null;
  season: { id: string; name: string; slug: string };
  gameweek: { id: string; name: string; round: number } | null;
}

const STATUS_COLOURS: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  VERIFIED: 'bg-blue-100 text-blue-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  LOCKED: 'bg-gray-200 text-gray-700',
};

export default function AdminStatDetailPage() {
  const { statId } = useParams<{ statId: string }>();
  const [stat, setStat] = useState<StatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  function reload() {
    setLoading(true);
    getAdminStatDetail(statId)
      .then((d) => setStat(d as StatDetail))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { reload(); }, [statId]);

  async function doAction(action: string, fn: () => Promise<unknown>) {
    setActionLoading(action);
    setError(null);
    try {
      await fn();
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  const STATS = stat ? [
    ['Minutes', stat.minutesPlayed], ['Goals', stat.goals], ['Assists', stat.assists],
    ['Own Goals', stat.ownGoals], ['Yellow Cards', stat.yellowCards], ['Red Cards', stat.redCards],
    ['Saves', stat.saves], ['Goals Conceded', stat.goalsConceded], ['Clean Sheet', stat.cleanSheet ? 'Yes' : 'No'],
    ['Shots (on target)', `${stat.shotsTotal} (${stat.shotsOnTarget})`],
    ['Key Passes', stat.keyPasses], ['Tackles Won', stat.tacklesWon],
    ['Interceptions', stat.interceptions], ['Blocked Shots', stat.blockedShots],
    ['Aerial Duels Won', stat.aerialDuelsWon], ['Rating', stat.rating?.toFixed(1) ?? '—'],
  ] : [];

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/player-stats" className="hover:text-gray-600">Player Stats</Link>
        <span>/</span>
        <span className="text-gray-600">{stat?.player.name ?? statId}</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">Stat Entry Detail</h1>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {stat && !loading && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-gray-900">{stat.player.name}</p>
                <p className="text-xs text-gray-400">{stat.player.position} · {stat.team?.name ?? '—'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLOURS[stat.status] ?? ''}`}>{stat.status}</span>
            </div>
            <p className="text-xs text-gray-500">
              {stat.fixture.homeTeam.name} v {stat.fixture.awayTeam.name} · {new Date(stat.fixture.kickoffAt).toLocaleDateString()} · {stat.season.name}
            </p>
            {stat.gameweek && <p className="text-xs text-gray-400 mt-0.5">{stat.gameweek.name}</p>}
            <p className="text-xs text-gray-400 mt-0.5">Source: {stat.source}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-700">Stats</h2></div>
            <div className="divide-y divide-gray-50">
              {STATS.map(([label, value]) => (
                <div key={String(label)} className="flex justify-between px-4 py-2">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {stat.notes && (
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
              <p className="text-xs text-gray-500">Notes: {stat.notes}</p>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Actions</h2>
            <div className="flex flex-wrap gap-2">
              {stat.status === 'DRAFT' && (
                <button
                  onClick={() => void doAction('verify', () => verifyStat(statId))}
                  disabled={!!actionLoading}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
                >
                  {actionLoading === 'verify' ? 'Verifying…' : 'Verify'}
                </button>
              )}
              {stat.status === 'VERIFIED' && (
                <button
                  onClick={() => void doAction('publish', () => publishStat(statId))}
                  disabled={!!actionLoading}
                  className="text-xs bg-green-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
                >
                  {actionLoading === 'publish' ? 'Publishing…' : 'Publish'}
                </button>
              )}
              {stat.status === 'PUBLISHED' && (
                <button
                  onClick={() => void doAction('lock', () => lockStat(statId))}
                  disabled={!!actionLoading}
                  className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
                >
                  {actionLoading === 'lock' ? 'Locking…' : 'Lock'}
                </button>
              )}
              {(stat.status === 'DRAFT' || stat.status === 'VERIFIED') && (
                <button
                  onClick={() => void doAction('delete', () => deleteStat(statId))}
                  disabled={!!actionLoading}
                  className="text-xs bg-red-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
                >
                  {actionLoading === 'delete' ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </div>
            {stat.verifiedAt && <p className="text-xs text-gray-400 mt-2">Verified: {new Date(stat.verifiedAt).toLocaleString()}</p>}
            {stat.publishedAt && <p className="text-xs text-gray-400 mt-0.5">Published: {new Date(stat.publishedAt).toLocaleString()}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
