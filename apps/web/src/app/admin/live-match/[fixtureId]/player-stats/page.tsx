'use client';

import { use, useEffect, useState } from 'react';
import { footballClient, type PlayerMatchStat } from '@/lib/football-client';
import adminFootballClient, { type UpsertPlayerStatPayload } from '@/lib/admin-football-client';

export default function AdminLiveMatchPlayerStatsPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [stats, setStats] = useState<PlayerMatchStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<UpsertPlayerStatPayload>>({ playerId: '', minutesPlayed: 90, goals: 0, assists: 0 });

  function load() {
    footballClient.getFixturePlayerStats(fixtureId)
      .then(setStats)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [fixtureId]);

  async function upsertStat(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.playerId) return;
    try {
      await adminFootballClient.upsertPlayerStat(fixtureId, form as UpsertPlayerStatPayload);
      setMsg('Stat saved.');
      load();
    } catch (err) {
      setMsg(`Failed: ${String(err)}`);
    }
  }

  const sorted = stats.slice().sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists));

  return (
    <main className="max-w-3xl mx-auto p-6">
      <a href={`/admin/live-match/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Fixture Overview</a>
      <h1 className="text-2xl font-bold mb-4">Player Stats</h1>

      <form onSubmit={upsertStat} className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
        <h2 className="text-sm font-semibold mb-2">Upsert Player Stat</h2>
        <div className="flex gap-2">
          <input type="text" placeholder="Player ID" value={form.playerId ?? ''} onChange={e => setForm(f => ({ ...f, playerId: e.target.value }))}
            className="border rounded px-2 py-1 text-xs flex-1" required />
          <input type="number" placeholder="Mins" value={form.minutesPlayed ?? ''} onChange={e => setForm(f => ({ ...f, minutesPlayed: Number(e.target.value) }))}
            className="border rounded px-2 py-1 text-xs w-16" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['goals', 'assists', 'yellowCards', 'redCards', 'saves'] as const).map(field => (
            <div key={field} className="flex flex-col text-xs">
              <label className="text-gray-500 mb-0.5 capitalize">{field}</label>
              <input type="number" value={(form as Record<string, number | undefined>)[field] ?? 0}
                onChange={e => setForm(f => ({ ...f, [field]: Number(e.target.value) }))}
                className="border rounded px-2 py-1 w-14" min={0} />
            </div>
          ))}
        </div>
        <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">Save Stat</button>
      </form>

      {msg && <p className={`text-xs mb-4 p-2 rounded ${msg.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</p>}

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      <div className="space-y-2">
        {sorted.map(s => (
          <div key={s.playerId} className="border rounded-lg p-3 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{s.player?.name ?? s.playerId}</div>
              <div className="text-xs text-gray-500">{s.team?.shortName} · {s.minutesPlayed}&apos;</div>
            </div>
            <div className="flex gap-3 text-xs text-center">
              {s.goals > 0 && <div><div className="font-bold">{s.goals}</div><div className="text-gray-400">G</div></div>}
              {s.assists > 0 && <div><div className="font-bold">{s.assists}</div><div className="text-gray-400">A</div></div>}
              {s.saves > 0 && <div><div className="font-bold">{s.saves}</div><div className="text-gray-400">Sv</div></div>}
              {s.yellowCards > 0 && <div><div className="font-bold text-yellow-500">{s.yellowCards}</div><div className="text-gray-400">YC</div></div>}
              {s.redCards > 0 && <div><div className="font-bold text-red-600">{s.redCards}</div><div className="text-gray-400">RC</div></div>}
              {s.cleanSheet && <div><div className="font-bold text-green-600">✓</div><div className="text-gray-400">CS</div></div>}
            </div>
          </div>
        ))}
        {!loading && sorted.length === 0 && <p className="text-gray-400 text-sm">No player stats yet.</p>}
      </div>
    </main>
  );
}
