'use client';

import { use, useEffect, useState } from 'react';
import { footballClient, type PlayerMatchStat } from '@/lib/football-client';

interface TeamStats {
  teamId: string;
  teamName: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  minutesPlayed: number;
}

function aggregateTeamStats(stats: PlayerMatchStat[]): TeamStats[] {
  const map = new Map<string, TeamStats>();
  for (const s of stats) {
    const tid = s.teamId ?? 'unknown';
    const existing = map.get(tid);
    if (!existing) {
      map.set(tid, {
        teamId: tid,
        teamName: s.team?.shortName ?? tid,
        goals: s.goals,
        assists: s.assists,
        yellowCards: s.yellowCards,
        redCards: s.redCards,
        saves: s.saves,
        minutesPlayed: s.minutesPlayed,
      });
    } else {
      existing.goals += s.goals;
      existing.assists += s.assists;
      existing.yellowCards += s.yellowCards;
      existing.redCards += s.redCards;
      existing.saves += s.saves;
      existing.minutesPlayed += s.minutesPlayed;
    }
  }
  return Array.from(map.values());
}

export default function AdminLiveMatchTeamStatsPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [stats, setStats] = useState<PlayerMatchStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    footballClient.getFixturePlayerStats(fixtureId)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [fixtureId]);

  const teamStats = aggregateTeamStats(stats);

  const rows: { label: string; key: keyof TeamStats }[] = [
    { label: 'Goals', key: 'goals' },
    { label: 'Assists', key: 'assists' },
    { label: 'Yellow Cards', key: 'yellowCards' },
    { label: 'Red Cards', key: 'redCards' },
    { label: 'Saves', key: 'saves' },
  ];

  return (
    <main className="max-w-3xl mx-auto p-6">
      <a href={`/admin/live-match/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Fixture Overview</a>
      <h1 className="text-2xl font-bold mb-6">Team Stats</h1>
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {!loading && teamStats.length === 0 && <p className="text-gray-400 text-sm">No stats recorded yet.</p>}
      {teamStats.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Stat</th>
                {teamStats.map(t => (
                  <th key={t.teamId} className="text-center px-4 py-2 text-xs text-gray-700 font-semibold">{t.teamName}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(r => (
                <tr key={r.key}>
                  <td className="px-4 py-2 text-xs text-gray-600">{r.label}</td>
                  {teamStats.map(t => (
                    <td key={t.teamId} className="text-center px-4 py-2 font-semibold">
                      {t[r.key] as number}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
