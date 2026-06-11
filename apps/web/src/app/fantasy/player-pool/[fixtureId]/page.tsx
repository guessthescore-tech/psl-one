'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { fantasyClient, FixturePlayerPool } from '../../../../lib/fantasy-client';

const POS_BADGE: Record<string, string> = {
  GOALKEEPER: 'bg-yellow-100 text-yellow-800',
  DEFENDER: 'bg-blue-100 text-blue-800',
  MIDFIELDER: 'bg-green-100 text-green-800',
  FORWARD: 'bg-red-100 text-red-800',
};

export default function FixturePlayerPoolPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [pool, setPool] = useState<FixturePlayerPool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fantasyClient
      .getPlayerPoolForFixture(fixtureId)
      .then(setPool)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Fixture Player Pool</h1>

      {loading && <div className="text-gray-500">Loading lineup...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {pool && (
        <>
          <div className={`text-xs font-semibold px-2 py-1 rounded inline-block ${
            pool.source === 'CONFIRMED_LINEUP'
              ? 'bg-green-100 text-green-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {pool.source === 'CONFIRMED_LINEUP' ? 'Confirmed Lineup' : 'Provisional (full squad)'}
          </div>

          <div className="text-sm text-gray-500">{pool.players.length} players</div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Pos</th>
                  <th className="pb-2 pr-4">Team</th>
                  {pool.source === 'CONFIRMED_LINEUP' && <th className="pb-2">Status</th>}
                </tr>
              </thead>
              <tbody>
                {pool.players.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium">{p.name}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${POS_BADGE[p.position]}`}>
                        {p.position.slice(0, 3)}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{p.team.shortName}</td>
                    {pool.source === 'CONFIRMED_LINEUP' && (
                      <td className="py-2 text-gray-500 text-xs">{p.lineupStatus}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
