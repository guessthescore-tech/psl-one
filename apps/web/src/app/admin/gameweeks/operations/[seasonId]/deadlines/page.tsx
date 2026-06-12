'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getDeadlineReadiness, deriveDeadlines } from '@/lib/gameweek-operations-client';
import Link from 'next/link';

interface DeadlineRow {
  gameweekId: string;
  name: string;
  round: number;
  transferDeadlineAt: string;
  predictionDeadlineAt: string;
  firstKickoffAt: string | null;
  deadlineValid: boolean;
  issues: string[];
}

interface DeadlineData {
  seasonId: string;
  seasonName: string;
  gameweeks: DeadlineRow[];
}

interface DeriveResult {
  updated: number;
  skipped: number;
  skippedReasons: string[];
  mode: string;
}

export default function DeadlinesPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<DeadlineData | null>(null);
  const [deriving, setDeriving] = useState(false);
  const [deriveResult, setDeriveResult] = useState<DeriveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!seasonId) return;
    getDeadlineReadiness(seasonId)
      .then((d) => setData(d as DeadlineData))
      .catch((e: unknown) => setError(String(e)));
  }

  useEffect(load, [seasonId]);

  async function handleDerive(mode: 'MISSING_ONLY' | 'OVERWRITE_DERIVED_ONLY') {
    setDeriving(true);
    setDeriveResult(null);
    try {
      const result = (await deriveDeadlines(seasonId, { mode, fantasyBufferMinutes: 90, predictionBufferMinutes: 60 })) as DeriveResult;
      setDeriveResult(result);
      load();
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setDeriving(false);
    }
  }

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const invalid = data.gameweeks?.filter((gw) => !gw.deadlineValid) ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            <Link href="/admin/gameweeks/operations" className="hover:underline">Operations</Link>{' '}
            / <Link href={`/admin/gameweeks/operations/${seasonId}`} className="hover:underline">{data.seasonName}</Link>{' '}
            / Deadlines
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Deadline Readiness</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDerive('MISSING_ONLY')}
            disabled={deriving}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Fill Missing
          </button>
          <button
            onClick={() => handleDerive('OVERWRITE_DERIVED_ONLY')}
            disabled={deriving}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {deriving ? 'Deriving…' : 'Overwrite Derived'}
          </button>
        </div>
      </div>

      {deriveResult && (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
          Updated {deriveResult.updated} deadline(s), skipped {deriveResult.skipped}.
          {deriveResult.skippedReasons?.length > 0 && (
            <span className="ml-1 text-yellow-700">{deriveResult.skippedReasons.join('; ')}</span>
          )}
        </div>
      )}

      {invalid.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">{invalid.length} gameweek(s) with invalid deadlines</p>
          <ul className="list-disc list-inside space-y-1">
            {invalid.map((gw) => (
              <li key={gw.gameweekId} className="text-sm text-red-700">
                {gw.name}: {gw.issues?.join('; ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 rounded-lg">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-2 text-left">Round</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Transfer Deadline</th>
              <th className="px-4 py-2 text-left">Prediction Deadline</th>
              <th className="px-4 py-2 text-left">First Kickoff</th>
              <th className="px-4 py-2 text-left">Valid</th>
            </tr>
          </thead>
          <tbody>
            {(data.gameweeks ?? []).map((gw) => (
              <tr key={gw.gameweekId} className={`border-t border-gray-100 ${!gw.deadlineValid ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-2 font-medium text-gray-900">{gw.round}</td>
                <td className="px-4 py-2 text-gray-700">{gw.name}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{new Date(gw.transferDeadlineAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{new Date(gw.predictionDeadlineAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-gray-600 text-xs">{gw.firstKickoffAt ? new Date(gw.firstKickoffAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-2">
                  {gw.deadlineValid ? (
                    <span className="text-green-700 font-medium">Yes</span>
                  ) : (
                    <span className="text-red-600 font-medium">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
