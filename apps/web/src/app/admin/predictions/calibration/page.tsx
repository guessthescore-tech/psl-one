'use client';

import { useEffect, useState } from 'react';
import { listPredictionCalibrationSeasons } from '@/lib/prediction-calibration-client';
import Link from 'next/link';

interface SeasonRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  isActive: boolean;
  hasPredictionRulesConfig: boolean;
  rulesStatus: string | null;
  totalFixtures: number;
}

export default function PredictionCalibrationPage() {
  const [seasons, setSeasons] = useState<SeasonRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPredictionCalibrationSeasons()
      .then((data) => setSeasons(data as SeasonRow[]))
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Prediction Calibration</h1>
      <p className="text-sm text-gray-500">
        Configure prediction rules and verify fixture eligibility for each season. Values are PROVISIONAL until marked ACTIVE.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-2 text-left">Season</th>
              <th className="border border-gray-200 p-2 text-left">Status</th>
              <th className="border border-gray-200 p-2 text-center">Active</th>
              <th className="border border-gray-200 p-2 text-center">Rules Config</th>
              <th className="border border-gray-200 p-2 text-center">Fixtures</th>
              <th className="border border-gray-200 p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 p-2 font-medium">{s.name}</td>
                <td className="border border-gray-200 p-2">{s.status}</td>
                <td className="border border-gray-200 p-2 text-center">
                  {s.isActive ? <span className="text-green-600 font-bold">✓</span> : '—'}
                </td>
                <td className="border border-gray-200 p-2 text-center">
                  {s.hasPredictionRulesConfig ? (
                    <span className={`text-xs px-2 py-0.5 rounded ${s.rulesStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {s.rulesStatus ?? 'PROVISIONAL'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">None</span>
                  )}
                </td>
                <td className="border border-gray-200 p-2 text-center">{s.totalFixtures}</td>
                <td className="border border-gray-200 p-2 text-center space-x-2">
                  <Link href={`/admin/predictions/calibration/${s.id}`} className="text-blue-600 hover:underline text-xs">
                    Dashboard
                  </Link>
                </td>
              </tr>
            ))}
            {seasons.length === 0 && (
              <tr>
                <td colSpan={6} className="border border-gray-200 p-4 text-center text-gray-400">
                  No seasons found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
