'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { getLeague, getLeagueStandings, getH2HStandings, type League, type ClassicStandingsRow, type H2HStandingsRow } from '@/lib/fantasy-rules-client';

type AnyStandings = ClassicStandingsRow[] | H2HStandingsRow[];

function isH2H(rows: AnyStandings): rows is H2HStandingsRow[] {
  return rows.length > 0 && 'h2hPoints' in rows[0]!;
}

export default function LeagueStandingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [league, setLeague] = useState<League | null>(null);
  const [standings, setStandings] = useState<AnyStandings>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const l = await getLeague(id);
        setLeague(l);
        const s = l.scoringType === 'HEAD_TO_HEAD'
          ? await getH2HStandings(id)
          : await getLeagueStandings(id);
        setStandings(s);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  if (loading) return <main className="p-4 text-sm text-gray-400">Loading…</main>;
  if (error) return <main className="p-4"><p className="text-red-600 text-sm">{error}</p></main>;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{league?.name}</h1>
          <p className="text-xs text-gray-500">{league?.type} · {league?.scoringType}</p>
        </div>
        <Link href={`/fantasy/leagues/${id}`} className="text-sm text-blue-600 underline">Details</Link>
      </div>

      {standings.length === 0 ? (
        <p className="text-gray-400 text-sm">No standings yet.</p>
      ) : isH2H(standings) ? (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-xs text-gray-500">
              <th className="pb-2 pr-2">#</th>
              <th className="pb-2 pr-2">Team</th>
              <th className="pb-2 pr-2 text-center">P</th>
              <th className="pb-2 pr-2 text-center">W</th>
              <th className="pb-2 pr-2 text-center">D</th>
              <th className="pb-2 pr-2 text-center">L</th>
              <th className="pb-2 text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(row => (
              <tr key={row.fantasyTeamId} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 pr-2 font-bold">{row.rank}</td>
                <td className="py-2 pr-2">{row.teamName}</td>
                <td className="py-2 pr-2 text-center">{row.played}</td>
                <td className="py-2 pr-2 text-center">{row.won}</td>
                <td className="py-2 pr-2 text-center">{row.drawn}</td>
                <td className="py-2 pr-2 text-center">{row.lost}</td>
                <td className="py-2 text-right font-bold">{row.h2hPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-xs text-gray-500">
              <th className="pb-2 pr-2">#</th>
              <th className="pb-2 pr-2">Team</th>
              <th className="pb-2 pr-2">Manager</th>
              <th className="pb-2 pr-2 text-right">Pts</th>
              <th className="pb-2 text-right">Transfers</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(row => (
              <tr key={row.fantasyTeamId} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 pr-2 font-bold">{row.rank}</td>
                <td className="py-2 pr-2">{row.teamName}</td>
                <td className="py-2 pr-2 text-gray-500 text-xs">{row.managerName}</td>
                <td className="py-2 pr-2 text-right font-bold">{row.totalPoints}</td>
                <td className="py-2 text-right text-gray-500">{row.transferCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
