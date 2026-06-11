'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMyLeagues, type LeagueMembership } from '@/lib/fantasy-rules-client';

function badge(type: string) {
  const map: Record<string, string> = {
    PRIVATE: 'bg-purple-100 text-purple-700',
    PUBLIC: 'bg-blue-100 text-blue-700',
    GLOBAL: 'bg-green-100 text-green-700',
  };
  return map[type] ?? 'bg-gray-100 text-gray-700';
}

export default function LeaguesPage() {
  const [memberships, setMemberships] = useState<LeagueMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyLeagues()
      .then(setMemberships)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = {
    PRIVATE: memberships.filter(m => m.league.type === 'PRIVATE'),
    PUBLIC: memberships.filter(m => m.league.type === 'PUBLIC'),
    GLOBAL: memberships.filter(m => m.league.type === 'GLOBAL'),
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Leagues</h1>
        <Link href="/fantasy" className="text-sm text-blue-600 underline">Back</Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <>
          {/* CTAs */}
          <div className="flex gap-2 mb-5">
            <Link href="/fantasy/leagues/create" className="flex-1 text-center py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
              + Create League
            </Link>
            <Link href="/fantasy/leagues/join" className="flex-1 text-center py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              Join by Code
            </Link>
          </div>

          {(['PRIVATE', 'PUBLIC', 'GLOBAL'] as const).map(type => (
            grouped[type].length > 0 && (
              <section key={type} className="mb-5">
                <h2 className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-2">{type}</h2>
                <ul className="space-y-2">
                  {grouped[type].map(m => (
                    <li key={m.id} className="border rounded p-3 flex items-center justify-between bg-white">
                      <div>
                        <p className="font-semibold text-sm">{m.league.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge(m.league.type)}`}>
                            {m.league.type}
                          </span>
                          <span className="text-xs text-gray-400">{m.league.scoringType}</span>
                          {m.role === 'OWNER' && <span className="text-xs text-amber-600">Owner</span>}
                        </div>
                      </div>
                      <Link
                        href={`/fantasy/leagues/${m.leagueId}/standings`}
                        className="text-xs text-blue-600 underline whitespace-nowrap"
                      >
                        Standings →
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          ))}

          {memberships.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">Not in any leagues yet. Create or join one above.</p>
          )}
        </>
      )}
    </main>
  );
}
