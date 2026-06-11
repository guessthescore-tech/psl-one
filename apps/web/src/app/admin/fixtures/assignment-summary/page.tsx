'use client';

import { useState } from 'react';
import { getAssignmentSummary, autoAssignFixtures, type AssignmentSummaryDto } from '@/lib/admin-fixtures-client';

export default function AssignmentSummaryPage() {
  const [seasonId, setSeasonId] = useState('');
  const [summary, setSummary] = useState<AssignmentSummaryDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoResult, setAutoResult] = useState<string | null>(null);

  async function handleLoad() {
    if (!seasonId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setSummary(await getAssignmentSummary(seasonId.trim()));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleAutoAssign() {
    if (!seasonId.trim()) return;
    setAutoAssigning(true);
    setAutoResult(null);
    try {
      const result = await autoAssignFixtures(seasonId.trim());
      setAutoResult(`Auto-assigned ${result.assigned} of ${result.total} fixtures (${result.skipped} skipped)`);
      setSummary(await getAssignmentSummary(seasonId.trim()));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Auto-assign failed');
    } finally {
      setAutoAssigning(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Assignment Summary</h1>
      <p className="text-sm text-gray-500 mb-6">View how fixtures are distributed across gameweeks and stages for a season.</p>

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
        <button
          onClick={handleAutoAssign}
          disabled={autoAssigning || !seasonId.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {autoAssigning ? 'Auto-assigning…' : 'Auto-Assign'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {autoResult && <p className="text-green-600 text-sm mb-4">{autoResult}</p>}

      {summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded p-4 text-center">
              <p className="text-2xl font-bold">{summary.total}</p>
              <p className="text-sm text-gray-500">Total Fixtures</p>
            </div>
            <div className="border rounded p-4 text-center bg-green-50">
              <p className="text-2xl font-bold text-green-700">{summary.assigned}</p>
              <p className="text-sm text-gray-500">Assigned</p>
            </div>
            <div className="border rounded p-4 text-center bg-orange-50">
              <p className="text-2xl font-bold text-orange-700">{summary.unassigned}</p>
              <p className="text-sm text-gray-500">Unassigned</p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">By Gameweek</h2>
            {summary.byGameweek.length === 0 ? (
              <p className="text-sm text-gray-400">No fixtures assigned to gameweeks yet.</p>
            ) : (
              <div className="space-y-1">
                {summary.byGameweek.map(g => (
                  <div key={g.gameweekId} className="flex justify-between border rounded px-3 py-2 text-sm">
                    <span className="text-gray-700">{g.gameweekName}</span>
                    <span className="font-medium">{g.fixtureCount} fixtures</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">By Stage</h2>
            {summary.byStage.length === 0 ? (
              <p className="text-sm text-gray-400">No fixtures assigned to stages yet.</p>
            ) : (
              <div className="space-y-1">
                {summary.byStage.map(s => (
                  <div key={s.stageId} className="flex justify-between border rounded px-3 py-2 text-sm">
                    <span className="text-gray-700">{s.stageName}</span>
                    <span className="font-medium">{s.fixtureCount} fixtures</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
