'use client';

import { useEffect, useState } from 'react';
import { getOperationalSeasons } from '@/lib/gameweek-operations-client';
import Link from 'next/link';

interface SeasonRow {
  id: string;
  name: string;
  status: string;
  isActive: boolean;
  gameweekCount: number;
  publishedFixtureCount: number;
}

export default function GameweekOperationsIndexPage() {
  const [seasons, setSeasons] = useState<SeasonRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOperationalSeasons()
      .then((data) => setSeasons(data as SeasonRow[]))
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gameweek & Matchday Operations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select a season to manage its operational readiness — gameweeks, deadlines, fixture assignment, and matchday control.
        </p>
      </div>

      {seasons.length === 0 ? (
        <p className="text-gray-500 text-sm">No seasons found.</p>
      ) : (
        <div className="grid gap-3">
          {seasons.map((s) => (
            <div key={s.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white">
              <div>
                <p className="font-medium text-gray-900">
                  {s.name}
                  {s.isActive && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {s.status} · {s.gameweekCount ?? 0} gameweeks · {s.publishedFixtureCount ?? 0} published fixtures
                </p>
              </div>
              <Link
                href={`/admin/gameweeks/operations/${s.id}`}
                className="text-sm px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Operations
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
