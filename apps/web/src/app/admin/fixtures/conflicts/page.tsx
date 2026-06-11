'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ConflictItem {
  type: string;
  severity: string;
  description: string;
  fixtureIds: string[];
}

interface ConflictReport {
  seasonId: string;
  conflicts: ConflictItem[];
  totalConflicts: number;
}

const CONFLICT_LABELS: Record<string, string> = {
  DUPLICATE_FIXTURE: 'Duplicate Fixture',
  TEAM_SCHEDULE_OVERLAP: 'Team Overlap',
  VENUE_OVERLAP: 'Venue Overlap',
};

export default function ConflictsPage() {
  const [seasonId, setSeasonId] = useState('');
  const [report, setReport] = useState<ConflictReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!seasonId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/conflicts/season/${seasonId.trim()}`, { credentials: 'include' });
      if (!res.ok) { const b = await res.text(); throw new Error(`${res.status}: ${b}`); }
      const data = await res.json() as ConflictReport;
      setReport(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/fixtures/imports" className="text-sm text-blue-600 hover:underline">
          ← Import Batches
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Fixture Conflict Detection</h1>
        <p className="text-gray-500 text-sm mt-1">Detect duplicate fixtures, team overlaps, and venue conflicts</p>
      </div>

      <form onSubmit={handleCheck} className="flex gap-3 mb-6">
        <input
          type="text"
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
          placeholder="Season ID"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !seasonId.trim()}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Scanning…' : 'Scan'}
        </button>
      </form>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}

      {report && (
        <>
          {report.totalConflicts === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-700 font-semibold text-lg">No conflicts detected</p>
              <p className="text-green-600 text-sm mt-1">All fixtures for this season are clean.</p>
            </div>
          ) : (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 font-medium">{report.totalConflicts} conflict{report.totalConflicts !== 1 ? 's' : ''} detected</p>
              </div>
              <div className="space-y-3">
                {report.conflicts.map((c, i) => (
                  <div key={i} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        {CONFLICT_LABELS[c.type] ?? c.type}
                      </span>
                      <span className="text-xs text-red-500">{c.severity}</span>
                    </div>
                    <p className="text-sm text-red-700 mb-2">{c.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {c.fixtureIds.map(id => (
                        <code key={id} className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-mono">{id}</code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
