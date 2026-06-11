'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getActivationImpact } from '@/lib/fantasy-calibration-client';
import Link from 'next/link';

interface ActivationImpact {
  seasonId: string;
  seasonName: string;
  fantasyTeamsAffected: number;
  predictionCountAffected: number;
  rulesConfigured: boolean;
  playerPricesSet: number;
  gameweeksConfigured: number;
  warnings: string[];
}

export default function ActivationImpactPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<ActivationImpact | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getActivationImpact(seasonId)
      .then((d) => setData(d as ActivationImpact))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-400">Loading…</div>;

  const items = [
    { label: 'Fantasy Rules Configured', value: data.rulesConfigured ? 'Yes' : 'No', ok: data.rulesConfigured },
    { label: 'Player Prices Set', value: String(data.playerPricesSet), ok: data.playerPricesSet > 0 },
    { label: 'Gameweeks with Fixtures', value: String(data.gameweeksConfigured), ok: data.gameweeksConfigured > 0 },
    { label: 'Existing Fantasy Teams', value: String(data.fantasyTeamsAffected), ok: true },
    { label: 'Existing Predictions', value: String(data.predictionCountAffected), ok: true },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <Link href={`/admin/fantasy/calibration/${seasonId}`} className="text-sm text-blue-600 hover:underline">
          ← Calibration Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Activation Impact</h1>
        <p className="text-sm text-gray-500 mt-1">
          Summary of platform state if <strong>{data.seasonName}</strong> is activated as the primary season.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <tbody>
            {items.map((item) => (
              <tr key={item.label} className="border-t border-gray-100 first:border-0">
                <td className="px-4 py-3 text-gray-600">{item.label}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${item.ok ? 'text-gray-900' : 'text-orange-600'}`}>
                    {item.value}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.warnings.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-yellow-700 mb-2">Warnings</h2>
          <div className="space-y-2">
            {data.warnings.map((w, i) => (
              <div key={i} className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                {w}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.warnings.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800 font-medium">
          No activation warnings. Season is ready for activation.
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
        To activate this season, go to{' '}
        <Link href="/admin/seasons/switching" className="underline font-medium">
          Season Switching
        </Link>{' '}
        and use the Activate workflow with <code className="bg-blue-100 px-1 rounded">acknowledgeWarnings: true</code>.
      </div>
    </div>
  );
}
