'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  adminListLeagues,
  adminEnsureGlobalLeagues,
  adminLockLeague,
  adminUnlockLeague,
  type League,
} from '@/lib/fantasy-rules-client';
import { generateH2HFixtures, settleH2HGameweek } from '@/lib/admin-fantasy-client';

type LeagueWithCount = League & { _count: { members: number } };

export default function AdminLeaguesPage() {
  const [leagues, setLeagues] = useState<LeagueWithCount[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [seasonId, setSeasonId] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [gameweekId, setGameweekId] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [opLoading, setOpLoading] = useState(false);
  const [opError, setOpError] = useState<string | null>(null);

  useEffect(() => {
    adminListLeagues()
      .then(setLeagues)
      .catch(e => setListError((e as Error).message))
      .finally(() => setLoadingList(false));
  }, []);

  async function run(fn: () => Promise<unknown>) {
    setOpLoading(true);
    setResult(null);
    setOpError(null);
    try { setResult(JSON.stringify(await fn(), null, 2)); }
    catch (e) { setOpError((e as Error).message); }
    finally { setOpLoading(false); }
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fantasy Leagues — Admin</h1>
        <Link href="/admin" className="text-sm text-blue-600 underline">Admin home</Link>
      </div>

      {/* League list */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-2">All Leagues</h2>
        {listError && <p className="text-red-600 text-sm">{listError}</p>}
        {loadingList ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {leagues.map(l => (
              <div key={l.id} className="border rounded px-3 py-2 text-sm flex items-center justify-between bg-white">
                <div>
                  <p className="font-medium">{l.name}</p>
                  <p className="text-xs text-gray-500">{l.type} · {l.scoringType} · {l._count.members} members</p>
                </div>
                <div className="flex gap-1 text-xs">
                  <button
                    onClick={() => run(() => adminLockLeague(l.id))}
                    className="px-2 py-1 bg-red-100 rounded hover:bg-red-200"
                  >Lock</button>
                  <button
                    onClick={() => run(() => adminUnlockLeague(l.id))}
                    className="px-2 py-1 bg-green-100 rounded hover:bg-green-200"
                  >Unlock</button>
                </div>
              </div>
            ))}
            {leagues.length === 0 && <p className="text-gray-400 text-sm">No leagues yet.</p>}
          </div>
        )}
      </section>

      {/* Operations */}
      <section className="border rounded p-4 mb-4">
        <h2 className="text-sm font-semibold mb-3">Operations</h2>

        <div className="space-y-2 mb-3">
          <input className="w-full border rounded px-3 py-2 text-sm font-mono" placeholder="Season UUID" value={seasonId} onChange={e => setSeasonId(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 text-sm font-mono" placeholder="League UUID" value={leagueId} onChange={e => setLeagueId(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 text-sm font-mono" placeholder="Gameweek UUID" value={gameweekId} onChange={e => setGameweekId(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => run(() => adminEnsureGlobalLeagues(seasonId.trim()))}
            disabled={opLoading || !seasonId.trim()}
            className="py-2 bg-blue-100 border rounded text-sm hover:bg-blue-200 disabled:opacity-50"
          >
            Ensure Global Leagues
          </button>
          <button
            onClick={() => run(() => generateH2HFixtures(leagueId.trim(), gameweekId.trim()))}
            disabled={opLoading || !leagueId.trim() || !gameweekId.trim()}
            className="py-2 bg-purple-100 border rounded text-sm hover:bg-purple-200 disabled:opacity-50"
          >
            Generate H2H Fixtures
          </button>
          <button
            onClick={() => run(() => settleH2HGameweek(leagueId.trim(), gameweekId.trim()))}
            disabled={opLoading || !leagueId.trim() || !gameweekId.trim()}
            className="py-2 bg-green-100 border rounded text-sm hover:bg-green-200 disabled:opacity-50"
          >
            Settle H2H Gameweek
          </button>
        </div>
      </section>

      {opError && <p className="text-red-600 text-sm mb-3">{opError}</p>}
      {result && (
        <pre className="border rounded p-3 text-xs bg-gray-50 overflow-auto whitespace-pre-wrap max-h-64">
          {result}
        </pre>
      )}
    </main>
  );
}
