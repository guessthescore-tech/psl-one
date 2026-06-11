'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ValidationResult {
  seasonId: string;
  seasonName: string;
  totalFixtures: number;
  publishedFixtures: number;
  unpublishedFixtures: number;
  fixturesWithGameweek: number;
  fixturesWithoutGameweek: number;
  fixturesWithVenue: number;
  fixturesWithoutVenue: number;
  issues: { severity: string; message: string }[];
}

export default function SeasonValidationPage() {
  const [seasonId, setSeasonId] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!seasonId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/validation/season/${seasonId.trim()}`, { credentials: 'include' });
      if (!res.ok) { const b = await res.text(); throw new Error(`${res.status}: ${b}`); }
      const data = await res.json() as ValidationResult;
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  const SEVERITY_COLOURS: Record<string, string> = {
    ERROR: 'text-red-600 bg-red-50 border-red-200',
    WARNING: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    INFO: 'text-blue-700 bg-blue-50 border-blue-200',
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/fixtures/imports" className="text-sm text-blue-600 hover:underline">
          ← Import Batches
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Season Fixture Validation</h1>
        <p className="text-gray-500 text-sm mt-1">Check fixture data quality for a season</p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-3 mb-6">
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
          {loading ? 'Checking…' : 'Check'}
        </button>
      </form>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}

      {result && (
        <>
          <h2 className="font-semibold text-gray-800 mb-4">{result.seasonName}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', value: result.totalFixtures },
              { label: 'Published', value: result.publishedFixtures },
              { label: 'Unpublished', value: result.unpublishedFixtures },
              { label: 'No Gameweek', value: result.fixturesWithoutGameweek },
            ].map(s => (
              <div key={s.label} className="border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              </div>
            ))}
          </div>

          {result.issues.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              No issues found for this season.
            </div>
          ) : (
            <div className="space-y-2">
              {result.issues.map((issue, i) => (
                <div key={i} className={`border rounded-lg p-3 text-sm ${SEVERITY_COLOURS[issue.severity] ?? ''}`}>
                  <span className="font-medium">[{issue.severity}]</span> {issue.message}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
