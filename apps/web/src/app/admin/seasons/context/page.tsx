'use client';

import { useEffect, useState } from 'react';
import { getAdminSeasonContext } from '@/lib/season-context-client';
import Link from 'next/link';

interface SeasonRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface ContextData {
  activeSeason: SeasonRow | null;
  allSeasons: SeasonRow[];
  lastSwitchAt: string | null;
  lastSwitchAction: string | null;
}

export default function SeasonContextPage() {
  const [data, setData] = useState<ContextData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminSeasonContext('dev-token')
      .then((d: unknown) => setData(d as ContextData))
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading season context…</div>;

  const statusColour = (status: string) => {
    if (status === 'ACTIVE') return 'bg-green-100 text-green-800';
    if (status === 'UPCOMING') return 'bg-blue-100 text-blue-800';
    if (status === 'COMPLETED') return 'bg-gray-100 text-gray-600';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Season Context</h1>
        <p className="text-sm text-gray-500 mt-1">
          Active season drives default fan experience — fixtures, fantasy, predictions, clubs.
        </p>
      </div>

      {data.activeSeason ? (
        <div className="border border-green-300 rounded-lg p-5 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Active Season</p>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{data.activeSeason.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(data.activeSeason.startDate).toLocaleDateString()} –{' '}
                {new Date(data.activeSeason.endDate).toLocaleDateString()}
              </p>
            </div>
            <Link
              href={`/admin/seasons/switching/${data.activeSeason.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              Manage switching →
            </Link>
          </div>
        </div>
      ) : (
        <div className="border border-yellow-300 rounded-lg p-5 bg-yellow-50">
          <p className="font-semibold text-yellow-800">No active season — fan experience is inactive</p>
        </div>
      )}

      {data.lastSwitchAt && (
        <p className="text-sm text-gray-500">
          Last switch: <strong>{data.lastSwitchAction}</strong> at{' '}
          {new Date(data.lastSwitchAt).toLocaleString()}
        </p>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">All Seasons</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 text-left">Season</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Start</th>
                <th className="px-4 py-2 text-left">End</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.allSeasons.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColour(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{new Date(s.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-gray-600">{new Date(s.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 space-x-3">
                    <Link href={`/admin/seasons/switching/${s.id}`} className="text-blue-600 hover:underline">
                      Switch
                    </Link>
                    <Link href={`/admin/seasons/${s.id}`} className="text-gray-600 hover:underline">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
        <strong>World Cup Historical Preservation:</strong> Completing or switching away from the FIFA World Cup 2026 season
        does not delete any WC fixtures, predictions, fantasy teams, or fan data. Historical data remains browsable
        by season slug.
      </div>
    </div>
  );
}
