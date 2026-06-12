'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPredictionFixtureEligibility } from '@/lib/prediction-calibration-client';

interface FixtureRow {
  id: string;
  isPublished: boolean;
  kickoffAt: string | null;
  status: string;
  round: string;
  homeTeam: string;
  awayTeam: string;
  gameweekName: string | null;
  existingPredictions: number;
  isEligible: boolean;
  eligibilityReasons: string[];
}

export default function FixtureEligibilityPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<{ seasonName: string; fixtures: FixtureRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPredictionFixtureEligibility(seasonId)
      .then((d) => setData(d as typeof data))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const eligible = data.fixtures.filter((f) => f.isEligible).length;
  const ineligible = data.fixtures.length - eligible;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{data.seasonName} — Fixture Eligibility</h1>
      <p className="text-sm text-gray-500">
        Fixtures eligible for predictions must be published and have a future kickoff time.
      </p>

      <div className="flex gap-4 text-sm">
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <span className="font-medium text-green-700">{eligible}</span> eligible
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <span className="font-medium text-red-700">{ineligible}</span> ineligible
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
          <span className="font-medium">{data.fixtures.length}</span> total
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-2 text-left">Match</th>
              <th className="border border-gray-200 p-2 text-left">Round / GW</th>
              <th className="border border-gray-200 p-2 text-left">Kickoff</th>
              <th className="border border-gray-200 p-2 text-center">Published</th>
              <th className="border border-gray-200 p-2 text-center">Status</th>
              <th className="border border-gray-200 p-2 text-center">Predictions</th>
              <th className="border border-gray-200 p-2 text-center">Eligible</th>
            </tr>
          </thead>
          <tbody>
            {data.fixtures.map((f) => (
              <tr key={f.id} className={f.isEligible ? '' : 'bg-red-50'}>
                <td className="border border-gray-200 p-2">{f.homeTeam} vs {f.awayTeam}</td>
                <td className="border border-gray-200 p-2 text-xs text-gray-600">{f.round}{f.gameweekName ? ` / ${f.gameweekName}` : ''}</td>
                <td className="border border-gray-200 p-2 text-xs">{f.kickoffAt ? new Date(f.kickoffAt).toLocaleString() : '—'}</td>
                <td className="border border-gray-200 p-2 text-center">{f.isPublished ? '✓' : '✗'}</td>
                <td className="border border-gray-200 p-2 text-center text-xs">{f.status}</td>
                <td className="border border-gray-200 p-2 text-center">{f.existingPredictions}</td>
                <td className="border border-gray-200 p-2 text-center">
                  {f.isEligible ? (
                    <span className="text-green-600 font-medium">✓</span>
                  ) : (
                    <span className="text-red-600 text-xs" title={f.eligibilityReasons.join('; ')}>
                      ✗ {f.eligibilityReasons[0]}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {data.fixtures.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-gray-400">No fixtures</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
