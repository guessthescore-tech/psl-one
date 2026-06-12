'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getGameweekOperations, deriveGameweeks } from '@/lib/gameweek-operations-client';
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

const opStatusColour: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  READY_TO_REVIEW: 'bg-yellow-100 text-yellow-800',
  READY_TO_PUBLISH: 'bg-blue-100 text-blue-800',
  OPEN: 'bg-green-100 text-green-800',
  LOCKED: 'bg-orange-100 text-orange-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  FINALIZING: 'bg-indigo-100 text-indigo-800',
  COMPLETE: 'bg-gray-200 text-gray-600',
  NEEDS_REVIEW: 'bg-red-100 text-red-800',
  HISTORICAL: 'bg-gray-100 text-gray-500',
};

export default function GameweekOperationsListPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [gameweeks, setGameweeks] = useState<GameweekDetail[]>([]);
  const [deriving, setDeriving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function load() {
    if (!seasonId) return;
    getGameweekOperations(seasonId)
      .then((data) => setGameweeks(data as GameweekDetail[]))
      .catch((e: unknown) => setError(String(e)));
  }

  useEffect(load, [seasonId]);

  async function handleDerive() {
    setDeriving(true);
    setMsg(null);
    try {
      const result = (await deriveGameweeks(seasonId, false)) as { gameweeksCreated: number };
      setMsg(`Created ${result.gameweeksCreated ?? 0} gameweek(s).`);
      load();
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setDeriving(false);
    }
  }

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            <Link href="/admin/gameweeks/operations" className="hover:underline">Operations</Link>{' '}
            / <Link href={`/admin/gameweeks/operations/${seasonId}`} className="hover:underline">Season</Link>{' '}
            / Gameweeks
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Gameweek Operations</h1>
        </div>
        <button
          onClick={handleDerive}
          disabled={deriving}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {deriving ? 'Deriving…' : 'Derive Gameweeks'}
        </button>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">{msg}</div>}

      {gameweeks.length === 0 ? (
        <p className="text-gray-500 text-sm">No gameweeks found. Use &apos;Derive Gameweeks&apos; to create them from fixtures.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 text-left">Round</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Operational Status</th>
                <th className="px-4 py-2 text-left">Fixtures</th>
                <th className="px-4 py-2 text-left">Deadline Valid</th>
                <th className="px-4 py-2 text-left">Blockers</th>
                <th className="px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {gameweeks.map((gw) => (
                <tr key={gw.gameweekId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{gw.round}</td>
                  <td className="px-4 py-2 text-gray-700">{gw.name}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opStatusColour[gw.operationalStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                      {gw.operationalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {gw.publishedFixtureCount}/{gw.fixtureCount} published
                  </td>
                  <td className="px-4 py-2">
                    {gw.deadlineValid ? (
                      <span className="text-green-700">Yes</span>
                    ) : (
                      <span className="text-red-600">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-red-600 text-xs">
                    {gw.blockers?.length > 0 ? gw.blockers.join('; ') : '—'}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/gameweeks/operations/${seasonId}/gameweeks/${gw.gameweekId}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
