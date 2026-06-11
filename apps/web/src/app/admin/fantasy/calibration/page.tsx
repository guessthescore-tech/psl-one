'use client';

import { useEffect, useState } from 'react';
import { getCalibrationSeasons } from '@/lib/fantasy-calibration-client';
import Link from 'next/link';

interface SeasonRow {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  hasRulesConfig: boolean;
  playerPriceCount: number;
  gameweekCount: number;
}

export default function FantasyCalibrationPage() {
  const [seasons, setSeasons] = useState<SeasonRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCalibrationSeasons()
      .then((data) => setSeasons(data as SeasonRow[]))
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fantasy Calibration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure fantasy rules, player pricing, and gameweek deadlines per season. All provisional values are clearly marked.
        </p>
      </div>

      {seasons.length === 0 ? (
        <p className="text-gray-500 text-sm">No seasons found.</p>
      ) : (
        <div className="grid gap-3">
          {seasons.map((s) => (
            <div key={s.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    {s.isActive && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span className={s.hasRulesConfig ? 'text-green-600' : 'text-orange-500'}>
                      Rules: {s.hasRulesConfig ? 'Configured' : 'Missing'}
                    </span>
                    <span className={s.playerPriceCount > 0 ? 'text-green-600' : 'text-orange-500'}>
                      Prices: {s.playerPriceCount}
                    </span>
                    <span className={s.gameweekCount > 0 ? 'text-green-600' : 'text-orange-500'}>
                      Gameweeks: {s.gameweekCount}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/fantasy/calibration/${s.id}`}
                  className="text-sm px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Calibrate
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
