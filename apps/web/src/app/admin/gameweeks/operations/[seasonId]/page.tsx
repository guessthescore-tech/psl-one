'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSeasonOperationsOverview } from '@/lib/gameweek-operations-client';
import Link from 'next/link';

interface Overview {
  seasonId: string;
  seasonName: string;
  overallStatus: string;
  totalGameweeks: number;
  readyGameweeks: number;
  blockers: string[];
  warnings: string[];
  nextAction: string;
}

export default function SeasonOperationsOverviewPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getSeasonOperationsOverview(seasonId)
      .then((data) => setOverview(data as Overview))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!overview) return <div className="p-8 text-gray-500">Loading…</div>;

  const links = [
    { href: 'gameweeks', label: 'Gameweeks' },
    { href: 'readiness', label: 'Readiness' },
    { href: 'deadlines', label: 'Deadlines' },
    { href: 'fixture-assignment', label: 'Fixture Assignment' },
    { href: 'fantasy-impact', label: 'Fantasy Impact' },
    { href: 'prediction-impact', label: 'Prediction Impact' },
    { href: 'publication', label: 'Publication' },
    { href: 'activation-impact', label: 'Activation Impact' },
    { href: 'matchday-control', label: 'Matchday Control' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/gameweeks/operations" className="hover:underline">Operations</Link> / {overview.seasonName}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{overview.seasonName}</h1>
        <p className="text-sm text-gray-500 mt-1">Season operations overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Status</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{overview.overallStatus}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Gameweeks</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {overview.readyGameweeks ?? 0} / {overview.totalGameweeks ?? 0} ready
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Next Action</p>
          <p className="mt-1 text-sm font-medium text-blue-700">{overview.nextAction ?? '—'}</p>
        </div>
      </div>

      {overview.blockers?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">Blockers</p>
          <ul className="list-disc list-inside space-y-1">
            {overview.blockers.map((b, i) => (
              <li key={i} className="text-sm text-red-700">{b}</li>
            ))}
          </ul>
        </div>
      )}

      {overview.warnings?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Warnings</p>
          <ul className="list-disc list-inside space-y-1">
            {overview.warnings.map((w, i) => (
              <li key={i} className="text-sm text-yellow-700">{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Operations Areas</h2>
        <div className="grid grid-cols-3 gap-3">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={`/admin/gameweeks/operations/${seasonId}/${href}`}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 text-sm font-medium text-gray-800"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
