'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fantasyClient, FantasyTeam, SquadValidation } from '../../../lib/fantasy-client';

const POSITION_ORDER = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'] as const;
const POSITION_LABEL: Record<string, string> = {
  GOALKEEPER: 'GK', DEFENDER: 'DEF', MIDFIELDER: 'MID', FORWARD: 'FWD',
};

export default function FantasyTeamPage() {
  const router = useRouter();
  const [team, setTeam] = useState<FantasyTeam | null>(null);
  const [validation, setValidation] = useState<SquadValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fantasyClient
      .getMyTeam()
      .then(setTeam)
      .catch(e => {
        if ((e as Error).message === 'UNAUTHORIZED') { router.replace('/login'); return; }
        setError((e as Error).message);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleValidate() {
    setValidating(true);
    try {
      const v = await fantasyClient.validateMySquad();
      setValidation(v);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setValidating(false);
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading your squad...</div>;

  if (error && !team) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">My Fantasy Squad</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          {error.toLowerCase().includes('not found') ? (
            <>
              <p className="font-semibold">You do not have a fantasy team yet.</p>
              <p className="text-sm mt-1">
                <Link href="/fantasy/team/create" className="underline font-medium">Build your squad</Link> to get started.
              </p>
            </>
          ) : (
            <p>{error}</p>
          )}
        </div>
      </div>
    );
  }

  if (!team) return null;

  const starters = team.players.filter(p => p.squadRole === 'STARTER');
  const subs = team.players.filter(p => p.squadRole === 'SUBSTITUTE').sort((a, b) => (a.benchSlot ?? 99) - (b.benchSlot ?? 99));

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <div className="text-sm text-gray-500">
            {team.totalPoints} pts
            {team.formation && <span className="ml-2 text-gray-400">· {team.formation}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/fantasy/transfers"
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:border-gray-300 transition"
          >
            Transfers
          </Link>
          <button
            onClick={handleValidate}
            disabled={validating}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {validating ? 'Validating...' : 'Validate'}
          </button>
        </div>
      </div>

      {validation && (
        <div className={`rounded-xl border p-4 text-sm ${validation.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className={`font-semibold ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
            {validation.isValid ? `Squad is valid · ${validation.formation}` : 'Squad has issues'}
          </div>
          {!validation.isValid && (
            <ul className="mt-2 list-disc list-inside text-red-700 space-y-0.5">
              {validation.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Starting XI</h2>
        {POSITION_ORDER.map(pos => {
          const posPlayers = starters.filter(p => p.position === pos);
          if (posPlayers.length === 0) return null;
          return (
            <div key={pos} className="mb-3">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                {POSITION_LABEL[pos]}
              </div>
              <div className="space-y-1">
                {posPlayers.map(p => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2">
                    <span className="text-xs font-mono text-gray-400 w-8">{POSITION_LABEL[p.position]}</span>
                    <span className="flex-1 font-medium">
                      {p.player.name}
                      {p.isCaptain && <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1.5 rounded">C</span>}
                      {p.isViceCaptain && <span className="ml-1 text-xs bg-gray-100 text-gray-700 px-1.5 rounded">V</span>}
                    </span>
                    <span className="text-xs text-gray-400">{p.player.team.shortName}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Bench</h2>
        <div className="space-y-1">
          {subs.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <span className="text-xs text-gray-400 w-4">{p.position === 'GOALKEEPER' ? 'GK' : i}</span>
              <span className="text-xs font-mono text-gray-400 w-8">{POSITION_LABEL[p.position]}</span>
              <span className="flex-1 text-gray-700">{p.player.name}</span>
              <span className="text-xs text-gray-400">{p.player.team.shortName}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
