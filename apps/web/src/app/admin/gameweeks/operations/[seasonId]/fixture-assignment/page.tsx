'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFixtureAssignmentReadiness } from '@/lib/gameweek-operations-client';
import Link from 'next/link';

interface AssignmentData {
  seasonId: string;
  seasonName: string;
  validation: {
    totalFixtures: number;
    validFixtures: number;
    invalidFixtures: number;
    issues: string[];
  };
  conflicts: {
    total: number;
    conflicts: Array<{ fixtureId: string; description: string }>;
  };
  gameweekReadiness: {
    totalFixtures: number;
    fixturesWithGameweek: number;
    fixturesWithoutGameweek: number;
    gameweeksCreated: number;
  };
}

export default function FixtureAssignmentPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<AssignmentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getFixtureAssignmentReadiness(seasonId)
      .then((d) => setData(d as AssignmentData))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const gwr = data.gameweekReadiness ?? {};
  const val = data.validation ?? {};
  const conf = data.conflicts ?? { total: 0, conflicts: [] };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/gameweeks/operations" className="hover:underline">Operations</Link>{' '}
          / <Link href={`/admin/gameweeks/operations/${seasonId}`} className="hover:underline">{data.seasonName}</Link>{' '}
          / Fixture Assignment
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Fixture Assignment Readiness</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Stat label="Total Fixtures" value={gwr.totalFixtures ?? 0} />
        <Stat label="Assigned" value={gwr.fixturesWithGameweek ?? 0} colour="text-green-700" />
        <Stat label="Unassigned" value={gwr.fixturesWithoutGameweek ?? 0} colour={(gwr.fixturesWithoutGameweek ?? 0) > 0 ? 'text-red-600' : 'text-gray-400'} />
        <Stat label="Gameweeks" value={gwr.gameweeksCreated ?? 0} />
      </div>

      {val.invalidFixtures > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">Validation Issues ({val.invalidFixtures} fixture(s))</p>
          <ul className="list-disc list-inside space-y-1">
            {(val.issues ?? []).map((issue, i) => (
              <li key={i} className="text-sm text-red-700">{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {conf.total > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-orange-800 mb-2">Conflicts ({conf.total})</p>
          <ul className="list-disc list-inside space-y-1">
            {(conf.conflicts ?? []).map((c, i) => (
              <li key={i} className="text-sm text-orange-700">{c.description}</li>
            ))}
          </ul>
        </div>
      )}

      {val.invalidFixtures === 0 && conf.total === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          No validation issues or conflicts. All {val.totalFixtures ?? 0} fixture(s) valid.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, colour = 'text-gray-900' }: { label: string; value: number; colour?: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colour}`}>{value}</p>
    </div>
  );
}
