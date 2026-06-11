'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getGameweekReadiness, deriveGameweekDeadlines } from '@/lib/fantasy-calibration-client';
import Link from 'next/link';

interface GameweekItem {
  gameweekId: string;
  round: number;
  name: string;
  hasTransferDeadline: boolean;
  hasPredictionDeadline: boolean;
  fixtureCount: number;
  earliestKickoff: string | null;
}

interface GameweekReadiness {
  seasonId: string;
  gameweeks: GameweekItem[];
  totalGameweeks: number;
  gameweeksWithDeadlines: number;
  gameweeksWithFixtures: number;
}

export default function GameweeksCalibrationPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<GameweekReadiness | null>(null);
  const [deriving, setDeriving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => {
    if (!seasonId) return;
    getGameweekReadiness(seasonId)
      .then((d) => setData(d as GameweekReadiness))
      .catch((e: unknown) => setError(String(e)));
  };

  useEffect(() => { load(); }, [seasonId]);

  const handleDerive = async () => {
    setDeriving(true);
    setError(null);
    try {
      const result = await deriveGameweekDeadlines(seasonId!) as { updated: number; skipped: number };
      setSuccess(`Set deadlines for ${result.updated} gameweeks. Skipped ${result.skipped} without fixtures.`);
      load();
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setDeriving(false);
    }
  };

  if (!data && !error) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <Link href={`/admin/fantasy/calibration/${seasonId}`} className="text-sm text-blue-600 hover:underline">
          ← Calibration Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Gameweek Deadline Readiness</h1>
        <p className="text-sm text-gray-500 mt-1">
          Transfer and prediction deadlines are set 90 minutes before the earliest published fixture.
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm">{success}</div>}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{data.totalGameweeks}</p>
              <p className="text-xs text-gray-500 mt-1">Total Gameweeks</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${data.gameweeksWithFixtures === data.totalGameweeks ? 'text-green-600' : 'text-orange-500'}`}>
                {data.gameweeksWithFixtures}
              </p>
              <p className="text-xs text-gray-500 mt-1">With Fixtures</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${data.gameweeksWithDeadlines === data.totalGameweeks ? 'text-green-600' : 'text-orange-500'}`}>
                {data.gameweeksWithDeadlines}
              </p>
              <p className="text-xs text-gray-500 mt-1">With Deadlines</p>
            </div>
          </div>

          {data.gameweeksWithFixtures > 0 && (
            <button
              onClick={handleDerive}
              disabled={deriving}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {deriving ? 'Deriving…' : 'Derive Deadlines from Fixtures'}
            </button>
          )}

          {data.gameweeks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2 text-left">Round</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-center">Fixtures</th>
                    <th className="px-4 py-2 text-left">Earliest Kickoff</th>
                  </tr>
                </thead>
                <tbody>
                  {data.gameweeks.map((gw) => (
                    <tr key={gw.gameweekId} className="border-t border-gray-100">
                      <td className="px-4 py-2 font-medium text-gray-900">{gw.round}</td>
                      <td className="px-4 py-2 text-gray-700">{gw.name}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${gw.fixtureCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {gw.fixtureCount}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500 text-xs">
                        {gw.earliestKickoff ? new Date(gw.earliestKickoff).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
