'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPredictionImpact } from '@/lib/gameweek-operations-client';
import Link from 'next/link';

interface PredictionImpactData {
  seasonId: string;
  seasonName: string;
  activationStatus: string;
  lockReadiness: {
    totalLocked: number;
    totalOpen: number;
    totalPublished: number;
    fixtures: unknown[];
  };
  eligibleFixtureCount: number;
  ineligibleFixtureCount: number;
  blockers: unknown[];
  warnings: unknown[];
}

export default function PredictionImpactPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<PredictionImpactData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getPredictionImpact(seasonId)
      .then((d) => setData(d as PredictionImpactData))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const statusColour = data.activationStatus === 'READY'
    ? 'bg-green-100 text-green-800'
    : data.activationStatus === 'BLOCKED'
    ? 'bg-red-100 text-red-800'
    : 'bg-yellow-100 text-yellow-800';

  const lr = data.lockReadiness ?? { totalLocked: 0, totalOpen: 0, totalPublished: 0 };
  const blockers = (data.blockers ?? []) as Array<{ message?: string }>;
  const warnings = (data.warnings ?? []) as Array<{ message?: string }>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/gameweeks/operations" className="hover:underline">Operations</Link>{' '}
          / <Link href={`/admin/gameweeks/operations/${seasonId}`} className="hover:underline">{data.seasonName}</Link>{' '}
          / Prediction Impact
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Prediction Impact</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Activation Status:</span>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColour}`}>
          {data.activationStatus}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Published</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{lr.totalPublished}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Open</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{lr.totalOpen}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Locked</p>
          <p className="mt-1 text-2xl font-bold text-orange-700">{lr.totalLocked}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Eligible</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{data.eligibleFixtureCount ?? 0}</p>
        </div>
      </div>

      {data.ineligibleFixtureCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          {data.ineligibleFixtureCount} fixture(s) ineligible for predictions.
        </div>
      )}

      {blockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">Prediction Blockers</p>
          <ul className="list-disc list-inside space-y-1">
            {blockers.map((b, i) => (
              <li key={i} className="text-sm text-red-700">{b.message ?? JSON.stringify(b)}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Prediction Warnings</p>
          <ul className="list-disc list-inside space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-yellow-700">{w.message ?? JSON.stringify(w)}</li>
            ))}
          </ul>
        </div>
      )}

      {blockers.length === 0 && warnings.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          No prediction blockers or warnings.
        </div>
      )}
    </div>
  );
}
