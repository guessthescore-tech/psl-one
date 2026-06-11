'use client';

import { useState } from 'react';
import {
  listUnassignedFixtures,
  assignFixtureToGameweek,
  assignFixtureToStage,
  type FixtureAssignmentDto,
} from '@/lib/admin-fixtures-client';

export default function UnassignedFixturesPage() {
  const [seasonId, setSeasonId] = useState('');
  const [fixtures, setFixtures] = useState<FixtureAssignmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [gwInput, setGwInput] = useState<Record<string, string>>({});
  const [stInput, setStInput] = useState<Record<string, string>>({});

  async function handleLoad() {
    if (!seasonId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setFixtures(await listUnassignedFixtures(seasonId.trim()));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignGameweek(fixtureId: string) {
    const gameweekId = gwInput[fixtureId]?.trim();
    if (!gameweekId) return;
    setAssigning(fixtureId);
    try {
      await assignFixtureToGameweek(fixtureId, gameweekId);
      setFixtures(prev => prev.filter(f => f.id !== fixtureId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Assignment failed');
    } finally {
      setAssigning(null);
    }
  }

  async function handleAssignStage(fixtureId: string) {
    const stageId = stInput[fixtureId]?.trim();
    if (!stageId) return;
    setAssigning(fixtureId);
    try {
      await assignFixtureToStage(fixtureId, stageId);
      setFixtures(prev => prev.map(f => f.id === fixtureId ? { ...f, stageId } : f));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Stage assignment failed');
    } finally {
      setAssigning(null);
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Unassigned Fixtures</h1>
      <p className="text-sm text-gray-500 mb-6">Fixtures that have no gameweek assignment.</p>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Season ID"
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleLoad}
          disabled={loading || !seasonId.trim()}
          className="px-4 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {fixtures.length === 0 && !loading && (
        <p className="text-sm text-gray-400">
          {seasonId ? 'No unassigned fixtures found.' : 'Enter a season ID to load unassigned fixtures.'}
        </p>
      )}

      <div className="space-y-3">
        {fixtures.map(f => (
          <div key={f.id} className="border rounded p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-sm">
                  {f.homeTeam.shortName} vs {f.awayTeam.shortName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(f.kickoffAt).toLocaleString()} · round: {f.round ?? '—'} · {f.status}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">ID: {f.id}</p>
              </div>
              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                {f.assignmentStatus}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Gameweek ID"
                value={gwInput[f.id] ?? ''}
                onChange={e => setGwInput(prev => ({ ...prev, [f.id]: e.target.value }))}
                className="border rounded px-2 py-1 text-xs flex-1 min-w-0"
              />
              <button
                onClick={() => handleAssignGameweek(f.id)}
                disabled={assigning === f.id || !gwInput[f.id]?.trim()}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
              >
                Assign Gameweek
              </button>

              <input
                type="text"
                placeholder="Stage ID"
                value={stInput[f.id] ?? ''}
                onChange={e => setStInput(prev => ({ ...prev, [f.id]: e.target.value }))}
                className="border rounded px-2 py-1 text-xs flex-1 min-w-0"
              />
              <button
                onClick={() => handleAssignStage(f.id)}
                disabled={assigning === f.id || !stInput[f.id]?.trim()}
                className="px-3 py-1 border rounded text-xs hover:bg-gray-50 disabled:opacity-50"
              >
                Assign Stage
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
