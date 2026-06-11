'use client';

import Link from 'next/link';
import { useState } from 'react';
import { autoAssignFixtures, getAssignmentSummary, type AssignmentSummaryDto } from '@/lib/admin-fixtures-client';

export default function AssignmentsPage() {
  const [seasonId, setSeasonId] = useState('');
  const [summary, setSummary] = useState<AssignmentSummaryDto | null>(null);
  const [autoResult, setAutoResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAutoAssign() {
    if (!seasonId.trim()) return;
    setLoading(true);
    setError(null);
    setAutoResult(null);
    try {
      const result = await autoAssignFixtures(seasonId.trim());
      setAutoResult(`Assigned ${result.assigned} of ${result.total} fixtures (${result.skipped} skipped)`);
      setSummary(await getAssignmentSummary(seasonId.trim()));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Fixture Assignments</h1>
      <p className="text-sm text-gray-500 mb-6">Manage how fixtures are assigned to gameweeks and stages.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/fixtures/unassigned"
          className="border rounded p-4 hover:bg-gray-50"
        >
          <p className="font-semibold text-sm">Unassigned Fixtures</p>
          <p className="text-xs text-gray-500 mt-1">View and manually assign fixtures that have no gameweek.</p>
        </Link>
        <Link
          href="/admin/fixtures/assignment-summary"
          className="border rounded p-4 hover:bg-gray-50"
        >
          <p className="font-semibold text-sm">Assignment Summary</p>
          <p className="text-xs text-gray-500 mt-1">See counts by gameweek and stage for a season.</p>
        </Link>
        <div className="border rounded p-4 bg-gray-50">
          <p className="font-semibold text-sm">Auto-Assign</p>
          <p className="text-xs text-gray-500 mt-1">Automatically assign all fixtures for a season by round/date.</p>
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="text-sm font-semibold mb-3">Quick Auto-Assign</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Season ID"
            value={seasonId}
            onChange={e => { setSeasonId(e.target.value); setSummary(null); setAutoResult(null); }}
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={handleAutoAssign}
            disabled={loading || !seasonId.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running…' : 'Auto-Assign'}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {autoResult && <p className="text-green-600 text-sm">{autoResult}</p>}

        {summary && (
          <div className="mt-4 space-y-2">
            <div className="flex gap-4 text-sm">
              <span>Total: <strong>{summary.total}</strong></span>
              <span className="text-green-700">Assigned: <strong>{summary.assigned}</strong></span>
              <span className="text-orange-700">Unassigned: <strong>{summary.unassigned}</strong></span>
            </div>
            <div className="space-y-1">
              {summary.byGameweek.map(g => (
                <div key={g.gameweekId} className="flex justify-between text-xs text-gray-600 border-b pb-1">
                  <span>{g.gameweekName}</span>
                  <span>{g.fixtureCount} fixtures</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
