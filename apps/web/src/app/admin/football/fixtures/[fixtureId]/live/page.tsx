'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { footballClient, type LiveMatchDashboard, type MatchEvent, type FixtureStatus, type MatchEventType } from '@/lib/football-client';
import adminFootballClient, {
  type UpdateLiveStatePayload,
  type AddMatchEventPayload,
  type UpsertPlayerStatPayload,
} from '@/lib/admin-football-client';

const ALL_STATUSES: FixtureStatus[] = ['SCHEDULED', 'LIVE', 'HALF_TIME', 'FINISHED', 'POSTPONED', 'CANCELLED'];

const SCORE_EVENTS: MatchEventType[] = ['GOAL', 'PENALTY_SCORED', 'OWN_GOAL'];
const ALL_EVENT_TYPES: MatchEventType[] = [
  'KICKOFF', 'GOAL', 'PENALTY_SCORED', 'OWN_GOAL', 'PENALTY_MISS', 'PENALTY_SAVE',
  'YELLOW_CARD', 'SECOND_YELLOW', 'RED_CARD', 'SUBSTITUTION', 'INJURY',
  'HALF_TIME', 'SECOND_HALF', 'FULL_TIME', 'VAR', 'OTHER',
];

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'LIVE' ? 'bg-green-100 text-green-700' :
    status === 'HALF_TIME' ? 'bg-amber-100 text-amber-700' :
    status === 'FINISHED' ? 'bg-blue-100 text-blue-700' :
    'bg-gray-100 text-gray-600';
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{status}</span>;
}

function EventRow({ event, onDelete }: { event: MatchEvent; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 py-1.5 px-2 hover:bg-gray-50 rounded text-sm">
      <span className="text-gray-400 text-xs w-10 text-right font-mono shrink-0">
        {event.minute}&apos;{event.stoppageMinute != null ? `+${event.stoppageMinute}` : ''}
      </span>
      <span className="text-gray-700 flex-1 min-w-0 truncate">
        <span className="font-medium">{event.eventType.replace(/_/g, ' ')}</span>
        {event.player && <> · {event.player.name}</>}
        {event.relatedPlayer && <> → {event.relatedPlayer.name}</>}
        {event.team && <span className="text-gray-400"> ({event.team.shortName})</span>}
      </span>
      <button onClick={() => onDelete(event.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0">
        ✕
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400';
const btnPrimary = 'w-full py-1.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-700';

export default function AdminFixtureLivePage() {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const [data, setData] = useState<LiveMatchDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);

  // Live state form
  const [lsStatus, setLsStatus] = useState('');
  const [lsMinute, setLsMinute] = useState('');
  const [lsPeriod, setLsPeriod] = useState('');

  // Score form
  const [scoreHome, setScoreHome] = useState('');
  const [scoreAway, setScoreAway] = useState('');

  // Add event form
  const [evType, setEvType] = useState<MatchEventType>('GOAL');
  const [evMinute, setEvMinute] = useState('');
  const [evStoppage, setEvStoppage] = useState('');
  const [evTeamId, setEvTeamId] = useState('');
  const [evPlayerId, setEvPlayerId] = useState('');
  const [evRelatedPlayerId, setEvRelatedPlayerId] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evProviderEventId, setEvProviderEventId] = useState('');
  const [evUpdateScore, setEvUpdateScore] = useState(false);

  // Player stat form — all spec fields
  const [statPlayerId, setStatPlayerId] = useState('');
  const [statTeamId, setStatTeamId] = useState('');
  const [statMinutes, setStatMinutes] = useState('');
  const [statGoals, setStatGoals] = useState('');
  const [statAssists, setStatAssists] = useState('');
  const [statOwnGoals, setStatOwnGoals] = useState('');
  const [statYellowCards, setStatYellowCards] = useState('');
  const [statRedCards, setStatRedCards] = useState('');
  const [statPenMissed, setStatPenMissed] = useState('');
  const [statPenSaved, setStatPenSaved] = useState('');
  const [statSaves, setStatSaves] = useState('');
  const [statGoalsConceded, setStatGoalsConceded] = useState('');
  const [statCleanSheet, setStatCleanSheet] = useState(false);
  const [statStarted, setStatStarted] = useState(false);
  const [statCameOn, setStatCameOn] = useState('');
  const [statSubbedOff, setStatSubbedOff] = useState('');
  const [statDNP, setStatDNP] = useState(false);

  // Bulk stat JSON
  const [bulkJson, setBulkJson] = useState('');
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await footballClient.getLiveMatchDashboard(fixtureId);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, [fixtureId]);

  useEffect(() => { void load(); }, [load]);

  function flash(msg: string, result?: unknown) {
    setActionMsg(msg);
    if (result !== undefined) setActionResult(JSON.stringify(result, null, 2));
    setTimeout(() => { setActionMsg(null); setActionResult(null); }, 6000);
  }

  async function handleUpdateLiveState() {
    const payload: UpdateLiveStatePayload = {};
    if (lsStatus) payload.status = lsStatus as FixtureStatus;
    if (lsMinute) payload.currentMinute = parseInt(lsMinute, 10);
    if (lsPeriod) payload.period = lsPeriod;
    try {
      const res = await adminFootballClient.updateLiveState(fixtureId, payload);
      flash('Live state updated', res);
      await load();
    } catch (e) {
      flash(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function handleUpdateScore() {
    if (!data) return;
    const h = scoreHome !== '' ? parseInt(scoreHome, 10) : (data.fixture.homeScore ?? 0);
    const a = scoreAway !== '' ? parseInt(scoreAway, 10) : (data.fixture.awayScore ?? 0);
    try {
      const res = await adminFootballClient.updateScore(fixtureId, { homeScore: h, awayScore: a });
      flash('Score updated', res);
      setScoreHome(''); setScoreAway('');
      await load();
    } catch (e) {
      flash(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function handleAddEvent() {
    if (!evMinute) return;
    const payload: AddMatchEventPayload = {
      eventType: evType,
      minute: parseInt(evMinute, 10),
      updateScore: evUpdateScore && SCORE_EVENTS.includes(evType),
    };
    if (evStoppage) payload.stoppageMinute = parseInt(evStoppage, 10);
    if (evTeamId.trim()) payload.teamId = evTeamId.trim();
    if (evPlayerId.trim()) payload.playerId = evPlayerId.trim();
    if (evRelatedPlayerId.trim()) payload.relatedPlayerId = evRelatedPlayerId.trim();
    if (evDesc.trim()) payload.description = evDesc.trim();
    if (evProviderEventId.trim()) payload.providerEventId = evProviderEventId.trim();
    try {
      const res = await adminFootballClient.addMatchEvent(fixtureId, payload);
      flash('Event added', res);
      setEvMinute(''); setEvStoppage(''); setEvTeamId(''); setEvPlayerId(''); setEvRelatedPlayerId(''); setEvDesc(''); setEvProviderEventId(''); setEvUpdateScore(false);
      await load();
    } catch (e) {
      flash(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!confirm('Delete this event?')) return;
    try {
      const res = await adminFootballClient.deleteMatchEvent(eventId);
      flash('Event deleted', res);
      await load();
    } catch (e) {
      flash(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  function buildStatPayload(): UpsertPlayerStatPayload {
    const p: UpsertPlayerStatPayload = { playerId: statPlayerId.trim() };
    if (statTeamId.trim()) p.teamId = statTeamId.trim();
    if (statMinutes !== '') p.minutesPlayed = parseInt(statMinutes, 10);
    if (statGoals !== '') p.goals = parseInt(statGoals, 10);
    if (statAssists !== '') p.assists = parseInt(statAssists, 10);
    if (statOwnGoals !== '') p.ownGoals = parseInt(statOwnGoals, 10);
    if (statYellowCards !== '') p.yellowCards = parseInt(statYellowCards, 10);
    if (statRedCards !== '') p.redCards = parseInt(statRedCards, 10);
    if (statPenMissed !== '') p.penaltiesMissed = parseInt(statPenMissed, 10);
    if (statPenSaved !== '') p.penaltiesSaved = parseInt(statPenSaved, 10);
    if (statSaves !== '') p.saves = parseInt(statSaves, 10);
    if (statGoalsConceded !== '') p.goalsConceded = parseInt(statGoalsConceded, 10);
    p.cleanSheet = statCleanSheet;
    p.started = statStarted;
    if (statCameOn !== '') p.cameOnMinute = parseInt(statCameOn, 10);
    if (statSubbedOff !== '') p.subbedOffMinute = parseInt(statSubbedOff, 10);
    p.didNotPlay = statDNP;
    return p;
  }

  function resetStatForm() {
    setStatPlayerId(''); setStatTeamId(''); setStatMinutes(''); setStatGoals('');
    setStatAssists(''); setStatOwnGoals(''); setStatYellowCards(''); setStatRedCards('');
    setStatPenMissed(''); setStatPenSaved(''); setStatSaves(''); setStatGoalsConceded('');
    setStatCleanSheet(false); setStatStarted(false); setStatCameOn(''); setStatSubbedOff(''); setStatDNP(false);
  }

  async function handleUpsertStat() {
    if (!statPlayerId.trim()) return;
    try {
      const res = await adminFootballClient.upsertPlayerStat(fixtureId, buildStatPayload());
      flash('Player stat saved', res);
      resetStatForm();
      await load();
    } catch (e) {
      flash(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function handleBulkUpsert() {
    setBulkResult(null);
    let parsed: UpsertPlayerStatPayload[];
    try {
      parsed = JSON.parse(bulkJson) as UpsertPlayerStatPayload[];
      if (!Array.isArray(parsed)) throw new Error('Must be a JSON array');
    } catch (e) {
      setBulkResult(`Parse error: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    try {
      const res = await adminFootballClient.bulkUpsertPlayerStats(fixtureId, parsed);
      setBulkResult(JSON.stringify(res, null, 2));
      setBulkJson('');
      await load();
    } catch (e) {
      setBulkResult(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function handleAction(fn: () => Promise<unknown>, msg: string) {
    try {
      const res = await fn();
      flash(msg, res);
      await load();
    } catch (e) {
      flash(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6 text-gray-400 animate-pulse">Loading…</div>;

  const { fixture, homeTeam, awayTeam, events, playerStats } = data;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/admin" className="hover:underline">Admin</Link>
        {' / '}
        <Link href="/admin/football/live" className="hover:underline">Live Management</Link>
        {' / '}
        <span className="font-mono text-xs">{fixtureId.slice(0, 8)}</span>
      </div>

      {/* Action flash */}
      {actionMsg && (
        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm">
          {actionMsg}
          {actionResult && (
            <pre className="mt-2 text-xs overflow-x-auto text-gray-700 bg-white border border-gray-200 rounded p-2 max-h-32">
              {actionResult}
            </pre>
          )}
        </div>
      )}

      {/* Score header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={fixture.status} />
          {fixture.currentMinute != null && (
            <span className="text-sm text-gray-500 font-mono">{fixture.currentMinute}&apos;</span>
          )}
          {fixture.period && (
            <span className="text-xs text-gray-400 capitalize">{fixture.period.replace(/_/g, ' ')}</span>
          )}
        </div>
        <div className="text-2xl font-bold font-mono text-gray-900">
          {homeTeam.shortName} {fixture.homeScore ?? 0} – {fixture.awayScore ?? 0} {awayTeam.shortName}
        </div>
        <Link
          href={`/football/match-centre/${fixtureId}`}
          className="text-sm text-blue-600 hover:underline"
          target="_blank"
        >
          Fan view ↗
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* === Column 1: State, Score, Controls === */}
        <div className="space-y-5">

          {/* Update live state */}
          <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <h2 className="font-semibold text-gray-800 text-sm">Live State</h2>
            <Field label="Status">
              <select value={lsStatus} onChange={e => setLsStatus(e.target.value)} className={inputCls}>
                <option value="">— unchanged —</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Current Minute">
              <input type="number" placeholder="e.g. 45" value={lsMinute} onChange={e => setLsMinute(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Period">
              <input type="text" placeholder="e.g. first_half" value={lsPeriod} onChange={e => setLsPeriod(e.target.value)} className={inputCls} />
            </Field>
            <button onClick={() => void handleUpdateLiveState()} className={btnPrimary}>Update State</button>
          </section>

          {/* Score editor */}
          <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <h2 className="font-semibold text-gray-800 text-sm">Score Editor</h2>
            <div className="grid grid-cols-2 gap-2">
              <Field label={homeTeam.shortName}>
                <input type="number" min="0" placeholder="0" value={scoreHome} onChange={e => setScoreHome(e.target.value)} className={inputCls} />
              </Field>
              <Field label={awayTeam.shortName}>
                <input type="number" min="0" placeholder="0" value={scoreAway} onChange={e => setScoreAway(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <button onClick={() => void handleUpdateScore()} className={btnPrimary}>Set Score</button>
          </section>

          {/* Fixture controls */}
          <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <h2 className="font-semibold text-gray-800 text-sm">Controls</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => void handleAction(() => adminFootballClient.recalculateState(fixtureId), 'State recalculated from events')}
                className="py-1.5 border border-gray-300 text-xs rounded hover:bg-gray-50"
              >
                Recalculate State
              </button>
              <button
                onClick={() => void handleAction(() => adminFootballClient.syncProvider(fixtureId), 'Provider sync attempted')}
                className="py-1.5 border border-gray-300 text-xs rounded hover:bg-gray-50"
              >
                Sync Provider
              </button>
              <button
                onClick={() => void handleAction(() => adminFootballClient.finaliseFixture(fixtureId), 'Fixture finalised ✓')}
                className="py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Finalise
              </button>
              <button
                onClick={() => void handleAction(() => adminFootballClient.reopenFixture(fixtureId), 'Fixture reopened')}
                className="py-1.5 bg-amber-500 text-white text-xs rounded hover:bg-amber-600"
              >
                Reopen
              </button>
            </div>
          </section>

        </div>

        {/* === Column 2: Add Event + Timeline === */}
        <div className="space-y-5">

          {/* Add match event */}
          <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <h2 className="font-semibold text-gray-800 text-sm">Add Event</h2>
            <Field label="Event Type">
              <select value={evType} onChange={e => setEvType(e.target.value as MatchEventType)} className={inputCls}>
                {ALL_EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Minute *">
                <input type="number" placeholder="e.g. 23" value={evMinute} onChange={e => setEvMinute(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Stoppage">
                <input type="number" placeholder="e.g. 3" value={evStoppage} onChange={e => setEvStoppage(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <Field label="Team ID">
              <input type="text" placeholder="UUID (optional)" value={evTeamId} onChange={e => setEvTeamId(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Player ID">
              <input type="text" placeholder="UUID (optional)" value={evPlayerId} onChange={e => setEvPlayerId(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Related Player ID">
              <input type="text" placeholder="UUID — for sub out / assist" value={evRelatedPlayerId} onChange={e => setEvRelatedPlayerId(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Description">
              <input type="text" placeholder="Optional note" value={evDesc} onChange={e => setEvDesc(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Provider Event ID">
              <input type="text" placeholder="External ID for idempotency (optional)" value={evProviderEventId} onChange={e => setEvProviderEventId(e.target.value)} className={inputCls} />
            </Field>
            {SCORE_EVENTS.includes(evType) && (
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={evUpdateScore} onChange={e => setEvUpdateScore(e.target.checked)} />
                Auto-update score
              </label>
            )}
            <button onClick={() => void handleAddEvent()} className={btnPrimary}>Add Event</button>
          </section>

          {/* Timeline */}
          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="font-semibold text-gray-800 text-sm mb-2">Timeline ({events.length})</h2>
            {events.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No events yet</p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto -mx-1">
                {events.map(e => (
                  <EventRow key={e.id} event={e} onDelete={id => void handleDeleteEvent(id)} />
                ))}
              </div>
            )}
          </section>

        </div>

        {/* === Column 3: Player Stats === */}
        <div className="space-y-5">

          {/* Full player stat form */}
          <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <h2 className="font-semibold text-gray-800 text-sm">Player Stat</h2>
            <Field label="Player ID *">
              <input type="text" placeholder="UUID" value={statPlayerId} onChange={e => setStatPlayerId(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Team ID">
              <input type="text" placeholder="UUID (optional)" value={statTeamId} onChange={e => setStatTeamId(e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                ['Mins', statMinutes, setStatMinutes],
                ['Goals', statGoals, setStatGoals],
                ['Assists', statAssists, setStatAssists],
                ['Own G', statOwnGoals, setStatOwnGoals],
                ['YCard', statYellowCards, setStatYellowCards],
                ['RCard', statRedCards, setStatRedCards],
                ['PenMis', statPenMissed, setStatPenMissed],
                ['PenSv', statPenSaved, setStatPenSaved],
                ['Saves', statSaves, setStatSaves],
                ['GConc', statGoalsConceded, setStatGoalsConceded],
                ['CameOn', statCameOn, setStatCameOn],
                ['SubOff', statSubbedOff, setStatSubbedOff],
              ].map(([label, value, setter]) => (
                <div key={label as string}>
                  <label className="block text-xs text-gray-400 mb-0.5">{label as string}</label>
                  <input
                    type="number"
                    min="0"
                    value={value as string}
                    onChange={e => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                    className="w-full border border-gray-300 rounded px-1.5 py-1 text-xs"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                <input type="checkbox" checked={statCleanSheet} onChange={e => setStatCleanSheet(e.target.checked)} /> Clean Sheet
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                <input type="checkbox" checked={statStarted} onChange={e => setStatStarted(e.target.checked)} /> Started
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                <input type="checkbox" checked={statDNP} onChange={e => setStatDNP(e.target.checked)} /> DNP
              </label>
            </div>
            <button onClick={() => void handleUpsertStat()} className={btnPrimary}>Save Stat</button>
          </section>

          {/* Bulk JSON */}
          <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <h2 className="font-semibold text-gray-800 text-sm">Bulk Stats (JSON)</h2>
            <p className="text-xs text-gray-400">Paste an array of stat objects. Each must include playerId.</p>
            <textarea
              value={bulkJson}
              onChange={e => setBulkJson(e.target.value)}
              rows={6}
              placeholder={'[\n  { "playerId": "...", "minutesPlayed": 90, "goals": 1 }\n]'}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono resize-y"
            />
            <button onClick={() => void handleBulkUpsert()} className={btnPrimary}>Submit Bulk</button>
            {bulkResult && (
              <pre className="text-xs overflow-x-auto text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 max-h-40">
                {bulkResult}
              </pre>
            )}
          </section>

          {/* Current stats */}
          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="font-semibold text-gray-800 text-sm mb-2">
              Current Stats ({playerStats.length})
            </h2>
            {playerStats.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No stats yet</p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {playerStats.map(s => (
                  <div key={s.playerId} className="text-xs text-gray-700 border-b border-gray-100 pb-1">
                    <span className="font-medium">{s.player?.name ?? s.playerId.slice(0, 8)}</span>
                    <span className="text-gray-400 ml-2">
                      {s.minutesPlayed}m · {s.goals}G · {s.assists}A · {s.saves}Sv · {s.cleanSheet ? 'CS' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
