'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFantasyImpact } from '@/lib/gameweek-operations-client';
import Link from 'next/link';

interface FantasyImpactData {
  seasonId: string;
  seasonName: string;
  calibrationStatus: string;
  gameweekReadiness: {
    totalFixtures: number;
    fixturesWithGameweek: number;
    gameweeksCreated: number;
    deadlineWarnings: string[];
  };
  activationImpact: unknown;
  blockers: unknown[];
  warnings: unknown[];
}

export default function FantasyImpactPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<FantasyImpactData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getFantasyImpact(seasonId)
      .then((d) => setData(d as FantasyImpactData))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const statusColour = data.calibrationStatus === 'READY'
    ? 'bg-green-100 text-green-800'
    : data.calibrationStatus === 'BLOCKED'
    ? 'bg-red-100 text-red-800'
    : 'bg-yellow-100 text-yellow-800';

  const gwr = data.gameweekReadiness ?? {};
  const blockers = (data.blockers ?? []) as Array<{ code?: string; message?: string; label?: string }>;
  const warnings = (data.warnings ?? []) as Array<{ code?: string; message?: string; label?: string }>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/gameweeks/operations" className="hover:underline">Operations</Link>{' '}
          / <Link href={`/admin/gameweeks/operations/${seasonId}`} className="hover:underline">{data.seasonName}</Link>{' '}
          / Fantasy Impact
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Fantasy Impact</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Calibration Status:</span>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColour}`}>
          {data.calibrationStatus}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Gameweeks</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{gwr.gameweeksCreated ?? 0}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Fixtures Assigned</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{gwr.fixturesWithGameweek ?? 0}/{gwr.totalFixtures ?? 0}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Deadline Warnings</p>
          <p className={`mt-1 text-2xl font-bold ${(gwr.deadlineWarnings?.length ?? 0) > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
            {gwr.deadlineWarnings?.length ?? 0}
          </p>
        </div>
      </div>

      {blockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">Fantasy Blockers</p>
          <ul className="list-disc list-inside space-y-1">
            {blockers.map((b, i) => (
              <li key={i} className="text-sm text-red-700">{b.message ?? b.label ?? JSON.stringify(b)}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Fantasy Warnings</p>
          <ul className="list-disc list-inside space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-yellow-700">{w.message ?? w.label ?? JSON.stringify(w)}</li>
            ))}
          </ul>
        </div>
      )}

      {blockers.length === 0 && warnings.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          No fantasy blockers or warnings.
        </div>
      )}
    </div>
  );
}
