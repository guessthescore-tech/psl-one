'use client';

import { use, useEffect, useState } from 'react';
import { footballClient, type MatchEvent, type MatchEventType } from '@/lib/football-client';
import adminFootballClient from '@/lib/admin-football-client';

const EVENT_TYPES: MatchEventType[] = [
  'GOAL', 'PENALTY_SCORED', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'SECOND_YELLOW',
  'SUBSTITUTION', 'KICKOFF', 'HALF_TIME', 'SECOND_HALF', 'FULL_TIME', 'VAR', 'INJURY', 'OTHER',
];

export default function AdminLiveMatchEventsPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<{ eventType: MatchEventType; minute: string; description: string; updateScore: boolean }>({
    eventType: 'GOAL', minute: '', description: '', updateScore: false,
  });

  function load() {
    footballClient.getFixtureEvents(fixtureId)
      .then(ev => setEvents(ev.slice().sort((a, b) => a.minute - b.minute)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [fixtureId]);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await adminFootballClient.addMatchEvent(fixtureId, {
        eventType: form.eventType,
        minute: Number(form.minute),
        ...(form.description ? { description: form.description } : {}),
        updateScore: form.updateScore,
      });
      setMsg('Event added.');
      load();
    } catch (err) {
      setMsg(`Failed: ${String(err)}`);
    }
  }

  async function deleteEvent(eventId: string) {
    try {
      await adminFootballClient.deleteMatchEvent(eventId);
      setMsg('Event deleted.');
      load();
    } catch (err) {
      setMsg(`Failed: ${String(err)}`);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <a href={`/admin/live-match/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Fixture Overview</a>
      <h1 className="text-2xl font-bold mb-4">Match Events</h1>

      <form onSubmit={addEvent} className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
        <h2 className="text-sm font-semibold">Add Event</h2>
        <div className="flex gap-2">
          <select value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value as MatchEventType }))}
            className="border rounded px-2 py-1 text-xs flex-1">
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" placeholder="Minute" value={form.minute} onChange={e => setForm(f => ({ ...f, minute: e.target.value }))}
            className="border rounded px-2 py-1 text-xs w-20" required />
        </div>
        <input type="text" placeholder="Description (optional)" value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="border rounded px-2 py-1 text-xs w-full" />
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={form.updateScore} onChange={e => setForm(f => ({ ...f, updateScore: e.target.checked }))} />
          Update score on goal events
        </label>
        <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">Add Event</button>
      </form>

      {msg && <p className={`text-xs mb-4 p-2 rounded ${msg.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</p>}

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      <div className="space-y-2">
        {events.map(ev => (
          <div key={ev.id} className="border rounded-lg p-3 bg-white shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold mr-2">{ev.minute}&apos;</span>
              <span className="text-sm font-medium">{ev.eventType}</span>
              {ev.player && <span className="text-xs text-gray-500 ml-2">{ev.player.name}</span>}
              {ev.description && <div className="text-xs text-gray-400 mt-0.5">{ev.description}</div>}
            </div>
            <button onClick={() => deleteEvent(ev.id)} className="text-xs text-red-600 hover:underline">Delete</button>
          </div>
        ))}
        {!loading && events.length === 0 && <p className="text-gray-400 text-sm">No events yet.</p>}
      </div>
    </main>
  );
}
