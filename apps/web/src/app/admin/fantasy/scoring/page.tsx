'use client';

import Link from 'next/link';
import { useState } from 'react';
import { upsertMatchStat, settleFantasyPoints, processAutoSubs } from '@/lib/admin-fantasy-client';
import { adminSettleGameweek, adminRecalculateGameweek, adminRecalculateTeamGameweek } from '@/lib/fantasy-rules-client';

export default function AdminScoringPage() {
  const [fixtureId, setFixtureId] = useState('');
  const [gameweekId, setGameweekId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [fantasyTeamId, setFantasyTeamId] = useState('');
  const [stats, setStats] = useState({
    minutesPlayed: '90', goals: '0', assists: '0', ownGoals: '0',
    yellowCards: '0', redCards: '0', cleanSheet: false,
    saves: '0', penaltiesSaved: '0', penaltiesMissed: '0',
    bonusPoints: '0', tacklesWon: '0', interceptions: '0', blockedShots: '0',
    didNotPlay: false,
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setLoading(true);
    setResult(null);
    setError(null);
    try { setResult(JSON.stringify(await fn(), null, 2)); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  async function handleUpsertStat() {
    if (!fixtureId.trim() || !playerId.trim()) {
      setError('Fixture ID and Player ID are required');
      return;
    }
    await run(() => upsertMatchStat(fixtureId.trim(), {
      playerId: playerId.trim(),
      minutesPlayed: parseInt(stats.minutesPlayed) || 0,
      goals: parseInt(stats.goals) || 0,
      assists: parseInt(stats.assists) || 0,
      ownGoals: parseInt(stats.ownGoals) || 0,
      yellowCards: parseInt(stats.yellowCards) || 0,
      redCards: parseInt(stats.redCards) || 0,
      cleanSheet: stats.cleanSheet,
      saves: parseInt(stats.saves) || 0,
      penaltiesSaved: parseInt(stats.penaltiesSaved) || 0,
      penaltiesMissed: parseInt(stats.penaltiesMissed) || 0,
      bonusPoints: parseInt(stats.bonusPoints) || 0,
      tacklesWon: parseInt(stats.tacklesWon) || 0,
      interceptions: parseInt(stats.interceptions) || 0,
      blockedShots: parseInt(stats.blockedShots) || 0,
      didNotPlay: stats.didNotPlay,
    }));
  }

  const numField = (key: keyof typeof stats, label: string) => (
    <label className="flex items-center justify-between text-sm" key={key}>
      <span className="text-gray-600">{label}</span>
      <input
        type="number"
        min={0}
        className="w-16 border rounded px-2 py-1 text-sm text-right"
        value={stats[key] as string}
        onChange={e => setStats(prev => ({ ...prev, [key]: e.target.value }))}
      />
    </label>
  );

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fantasy Scoring — Admin</h1>
        <Link href="/admin" className="text-sm text-blue-600 underline">Admin home</Link>
      </div>

      {/* Gameweek scoring */}
      <section className="border rounded p-4 mb-4">
        <h2 className="font-semibold text-sm mb-2">Gameweek Fantasy Scoring</h2>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 border rounded px-3 py-2 text-sm font-mono"
            placeholder="Gameweek UUID"
            value={gameweekId}
            onChange={e => setGameweekId(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={() => run(() => adminSettleGameweek(gameweekId.trim()))}
            disabled={loading || !gameweekId.trim()}
            className="py-2 bg-blue-100 border rounded text-sm hover:bg-blue-200 disabled:opacity-50"
          >
            Settle Gameweek
          </button>
          <button
            onClick={() => run(() => adminRecalculateGameweek(gameweekId.trim()))}
            disabled={loading || !gameweekId.trim()}
            className="py-2 bg-yellow-100 border rounded text-sm hover:bg-yellow-200 disabled:opacity-50"
          >
            Recalculate Gameweek
          </button>
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2 text-sm font-mono"
            placeholder="Fantasy Team UUID"
            value={fantasyTeamId}
            onChange={e => setFantasyTeamId(e.target.value)}
          />
          <button
            onClick={() => run(() => adminRecalculateTeamGameweek(fantasyTeamId.trim(), gameweekId.trim()))}
            disabled={loading || !fantasyTeamId.trim() || !gameweekId.trim()}
            className="px-3 py-2 bg-orange-100 border rounded text-sm hover:bg-orange-200 disabled:opacity-50 whitespace-nowrap"
          >
            Recalc Team
          </button>
        </div>
      </section>

      {/* Auto subs */}
      <section className="border rounded p-4 mb-4">
        <h2 className="font-semibold text-sm mb-2">Process Auto Substitutions</h2>
        <p className="text-xs text-gray-500 mb-2">
          Auto-substitutions run <strong>automatically during settlement</strong> (Settle Gameweek).
          Use this button to apply standalone without re-settling.
        </p>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="Gameweek UUID"
            value={gameweekId}
            onChange={e => setGameweekId(e.target.value)}
          />
          <button
            onClick={() => run(() => processAutoSubs(gameweekId.trim()))}
            disabled={loading || !gameweekId.trim()}
            className="px-4 py-2 bg-purple-100 border rounded text-sm hover:bg-purple-200 disabled:opacity-50"
          >
            Process
          </button>
        </div>
        <p className="text-xs text-gray-400">
          For full admin auto-sub management, see{' '}
          <a href="/admin/fantasy/auto-subs" className="text-blue-600 underline">Auto-Subs Admin →</a>
        </p>
      </section>

      {/* Match stats */}
      <section className="border rounded p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3">Set Player Match Stats</h2>
        <div className="space-y-2 mb-3">
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Fixture UUID"
            value={fixtureId}
            onChange={e => setFixtureId(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Player UUID"
            value={playerId}
            onChange={e => setPlayerId(e.target.value)}
          />
        </div>
        <div className="space-y-2 mb-3">
          {numField('minutesPlayed', 'Minutes played')}
          {numField('goals', 'Goals')}
          {numField('assists', 'Assists')}
          {numField('ownGoals', 'Own goals')}
          {numField('yellowCards', 'Yellow cards')}
          {numField('redCards', 'Red cards')}
          {numField('saves', 'Saves')}
          {numField('penaltiesSaved', 'Penalties saved')}
          {numField('penaltiesMissed', 'Penalties missed')}
          {numField('bonusPoints', 'Bonus points')}
          {numField('tacklesWon', 'Tackles won')}
          {numField('interceptions', 'Interceptions')}
          {numField('blockedShots', 'Blocked shots')}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={stats.cleanSheet}
              onChange={e => setStats(prev => ({ ...prev, cleanSheet: e.target.checked }))}
            />
            <span>Clean sheet</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={stats.didNotPlay}
              onChange={e => setStats(prev => ({ ...prev, didNotPlay: e.target.checked }))}
            />
            <span>Did not play</span>
          </label>
        </div>
        <button
          onClick={handleUpsertStat}
          disabled={loading}
          className="w-full py-2 bg-blue-100 border rounded text-sm hover:bg-blue-200 disabled:opacity-50"
        >
          Save Stats
        </button>
      </section>

      {/* Settle fantasy points */}
      <section className="border rounded p-4 mb-4">
        <h2 className="font-semibold text-sm mb-2">Settle Fantasy Points from Stats</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="Fixture UUID"
            value={fixtureId}
            onChange={e => setFixtureId(e.target.value)}
          />
          <button
            onClick={() => run(() => settleFantasyPoints(fixtureId.trim()))}
            disabled={loading || !fixtureId.trim()}
            className="px-4 py-2 bg-green-100 border rounded text-sm hover:bg-green-200 disabled:opacity-50"
          >
            Settle
          </button>
        </div>
      </section>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {result && (
        <pre className="border rounded p-3 text-xs bg-gray-50 overflow-auto whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </main>
  );
}
