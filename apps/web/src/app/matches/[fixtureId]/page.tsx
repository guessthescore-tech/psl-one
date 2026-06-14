'use client';

import { use, useEffect, useState } from 'react';
import { getFixtureMatchCentre } from '@/lib/match-centre-client';

interface MatchCentre {
  fixture: { id: string; status: string; homeScore?: number; awayScore?: number; kickoffAt: string; currentMinute?: number; period?: string };
  homeTeam: { name: string; shortName: string };
  awayTeam: { name: string; shortName: string };
  venue?: { name: string };
  dataProvenance: { dataStatus: string; sourceType: string };
}

const TABS = ['lineups','timeline','stats','players','fantasy','predictions','social'] as const;

export default function MatchOverviewPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [data, setData] = useState<MatchCentre | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFixtureMatchCentre(fixtureId)
      .then(d => setData(d as MatchCentre))
      .catch(e => setError(String(e)));
  }, [fixtureId]);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <a href="/matches" className="text-xs text-blue-600 underline mb-4 inline-block">← Matches</a>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {data && (
        <>
          <div className="border rounded-lg p-5 bg-white shadow-sm mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${data.fixture.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {data.fixture.status}{data.fixture.currentMinute ? ` · ${data.fixture.currentMinute}'` : ''}
              </span>
              {data.venue && <span className="text-xs text-gray-400">{data.venue.name}</span>}
            </div>
            <div className="flex justify-between items-center text-center">
              <div className="flex-1">
                <div className="text-lg font-bold">{data.homeTeam.shortName}</div>
                <div className="text-xs text-gray-500">{data.homeTeam.name}</div>
              </div>
              <div className="text-3xl font-bold mx-4">
                {data.fixture.homeScore ?? '–'} : {data.fixture.awayScore ?? '–'}
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold">{data.awayTeam.shortName}</div>
                <div className="text-xs text-gray-500">{data.awayTeam.name}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 text-center mt-2">
              {new Date(data.fixture.kickoffAt).toLocaleString()}
            </div>
          </div>

          <div className="text-xs text-gray-400 mb-4">
            Data: {data.dataProvenance.sourceType} · {data.dataProvenance.dataStatus}
          </div>

          <nav className="flex flex-wrap gap-2">
            {TABS.map(tab => (
              <a key={tab} href={`/matches/${fixtureId}/${tab}`}
                className="text-xs border rounded px-3 py-1.5 bg-white hover:bg-gray-50 capitalize">
                {tab}
              </a>
            ))}
          </nav>
        </>
      )}

      {!data && !error && <p className="text-gray-400 text-sm">Loading…</p>}
    </main>
  );
}
