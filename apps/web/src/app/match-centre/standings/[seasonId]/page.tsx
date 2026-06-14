'use client';

import { use, useEffect, useState } from 'react';
import { getSeasonStandings } from '@/lib/match-centre-client';

interface Standing {
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
  club: { id: string; name: string; shortName: string; logoUrl?: string };
}

export default function SeasonStandingsPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [provenance, setProvenance] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSeasonStandings(seasonId)
      .then((d: unknown) => {
        const data = d as { standings: Standing[]; dataProvenance: Record<string, unknown> };
        setStandings(data.standings ?? []);
        setProvenance(data.dataProvenance ?? null);
      })
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">PSL Standings</h1>
      {provenance && (
        <p className="text-xs text-gray-400 mb-5">
          Source: {String(provenance['sourceType'])} · Status: {String(provenance['dataStatus'])}
          {provenance['freshnessStatus'] ? ` · ${String(provenance['freshnessStatus'])}` : ''}
        </p>
      )}

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {standings.length > 0 && (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Club</th>
                <th className="px-2 py-2 text-center">P</th>
                <th className="px-2 py-2 text-center">W</th>
                <th className="px-2 py-2 text-center">D</th>
                <th className="px-2 py-2 text-center">L</th>
                <th className="px-2 py-2 text-center">GF</th>
                <th className="px-2 py-2 text-center">GA</th>
                <th className="px-2 py-2 text-center">GD</th>
                <th className="px-2 py-2 text-center font-bold">Pts</th>
                <th className="px-2 py-2 text-center">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {standings.map(s => (
                <tr key={s.club.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-bold text-gray-500">{s.position}</td>
                  <td className="px-3 py-2 font-semibold">{s.club.name}</td>
                  <td className="px-2 py-2 text-center">{s.played}</td>
                  <td className="px-2 py-2 text-center">{s.won}</td>
                  <td className="px-2 py-2 text-center">{s.drawn}</td>
                  <td className="px-2 py-2 text-center">{s.lost}</td>
                  <td className="px-2 py-2 text-center">{s.goalsFor}</td>
                  <td className="px-2 py-2 text-center">{s.goalsAgainst}</td>
                  <td className="px-2 py-2 text-center">{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</td>
                  <td className="px-2 py-2 text-center font-bold text-blue-700">{s.points}</td>
                  <td className="px-2 py-2 text-center">
                    {s.form && (
                      <span className="flex gap-0.5 justify-center">
                        {s.form.split('').map((ch, i) => (
                          <span
                            key={i}
                            className={`w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center text-white ${
                              ch === 'W' ? 'bg-green-500' : ch === 'D' ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                          >
                            {ch}
                          </span>
                        ))}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && standings.length === 0 && (
        <p className="text-gray-400 text-sm">No standings data yet for this season.</p>
      )}
    </main>
  );
}
