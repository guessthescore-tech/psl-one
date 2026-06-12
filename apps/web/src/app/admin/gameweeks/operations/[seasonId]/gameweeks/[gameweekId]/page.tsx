'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getGameweekOperationDetail } from '@/lib/gameweek-operations-client';
import Link from 'next/link';

interface GameweekDetail {
  gameweekId: string;
  name: string;
  round: number;
  status: string;
  operationalStatus: string;
  fixtureCount: number;
  publishedFixtureCount: number;
  unpublishedFixtureCount: number;
  predictionEligibleCount: number;
  transferDeadlineAt: string;
  predictionDeadlineAt: string;
  firstKickoffAt: string | null;
  lastKickoffAt: string | null;
  deadlineValid: boolean;
  readinessStatus: string;
  blockers: string[];
  warnings: string[];
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide w-48">{label}</td>
      <td className="px-4 py-2 text-sm text-gray-900">{value}</td>
    </tr>
  );
}

export default function GameweekOperationDetailPage() {
  const { seasonId, gameweekId } = useParams<{ seasonId: string; gameweekId: string }>();
  const [gw, setGw] = useState<GameweekDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId || !gameweekId) return;
    getGameweekOperationDetail(seasonId, gameweekId)
      .then((data) => setGw(data as GameweekDetail))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId, gameweekId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!gw) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/gameweeks/operations" className="hover:underline">Operations</Link>{' '}
          / <Link href={`/admin/gameweeks/operations/${seasonId}`} className="hover:underline">Season</Link>{' '}
          / <Link href={`/admin/gameweeks/operations/${seasonId}/gameweeks`} className="hover:underline">Gameweeks</Link>{' '}
          / {gw.name}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{gw.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Round {gw.round} · {gw.operationalStatus}</p>
      </div>

      {gw.blockers?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">Blockers</p>
          <ul className="list-disc list-inside space-y-1">
            {gw.blockers.map((b, i) => <li key={i} className="text-sm text-red-700">{b}</li>)}
          </ul>
        </div>
      )}

      {gw.warnings?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Warnings</p>
          <ul className="list-disc list-inside space-y-1">
            {gw.warnings.map((w, i) => <li key={i} className="text-sm text-yellow-700">{w}</li>)}
          </ul>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="min-w-full">
          <tbody>
            <Row label="Status" value={gw.status} />
            <Row label="Operational Status" value={gw.operationalStatus} />
            <Row label="Readiness Status" value={gw.readinessStatus} />
            <Row label="Deadline Valid" value={gw.deadlineValid ? 'Yes' : 'No'} />
            <Row label="Fixtures" value={`${gw.fixtureCount} total, ${gw.publishedFixtureCount} published, ${gw.unpublishedFixtureCount} unpublished`} />
            <Row label="Prediction Eligible" value={gw.predictionEligibleCount} />
            <Row label="Transfer Deadline" value={new Date(gw.transferDeadlineAt).toLocaleString()} />
            <Row label="Prediction Deadline" value={new Date(gw.predictionDeadlineAt).toLocaleString()} />
            <Row label="First Kickoff" value={gw.firstKickoffAt ? new Date(gw.firstKickoffAt).toLocaleString() : '—'} />
            <Row label="Last Kickoff" value={gw.lastKickoffAt ? new Date(gw.lastKickoffAt).toLocaleString() : '—'} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
