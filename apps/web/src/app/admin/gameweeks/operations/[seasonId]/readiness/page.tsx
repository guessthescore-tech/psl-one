'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSeasonGameweekReadiness } from '@/lib/gameweek-operations-client';
import Link from 'next/link';

interface ReadinessData {
  seasonId: string;
  seasonName: string;
  totalFixtures: number;
  fixturesWithGameweek: number;
  fixturesWithoutGameweek: number;
  gameweeksCreated: number;
  deadlineWarnings: string[];
  lockTimingWarnings: string[];
}

export default function SeasonReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<ReadinessData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getSeasonGameweekReadiness(seasonId)
      .then((d) => setData(d as ReadinessData))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const assignmentPct = data.totalFixtures > 0
    ? Math.round((data.fixturesWithGameweek / data.totalFixtures) * 100)
    : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/gameweeks/operations" className="hover:underline">Operations</Link>{' '}
          / <Link href={`/admin/gameweeks/operations/${seasonId}`} className="hover:underline">{data.seasonName}</Link>{' '}
          / Readiness
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Season Gameweek Readiness</h1>
        <p className="text-sm text-gray-500 mt-1">{data.seasonName}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Fixtures</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{data.totalFixtures}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Assigned</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{data.fixturesWithGameweek} <span className="text-sm font-normal text-gray-500">({assignmentPct}%)</span></p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Unassigned</p>
          <p className={`mt-1 text-2xl font-bold ${data.fixturesWithoutGameweek > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {data.fixturesWithoutGameweek}
          </p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gameweeks Created</p>
        <p className="text-lg font-semibold text-gray-900">{data.gameweeksCreated}</p>
      </div>

      {data.deadlineWarnings?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Deadline Warnings</p>
          <ul className="list-disc list-inside space-y-1">
            {data.deadlineWarnings.map((w, i) => <li key={i} className="text-sm text-yellow-700">{w}</li>)}
          </ul>
        </div>
      )}

      {data.lockTimingWarnings?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-orange-800 mb-2">Lock Timing Warnings</p>
          <ul className="list-disc list-inside space-y-1">
            {data.lockTimingWarnings.map((w, i) => <li key={i} className="text-sm text-orange-700">{w}</li>)}
          </ul>
        </div>
      )}

      {data.deadlineWarnings?.length === 0 && data.lockTimingWarnings?.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          No deadline or lock timing warnings.
        </div>
      )}
    </div>
  );
}
