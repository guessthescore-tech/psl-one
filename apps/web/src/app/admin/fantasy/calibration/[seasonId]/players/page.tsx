'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPlayerPriceReadiness, generateProvisionalPrices } from '@/lib/fantasy-calibration-client';
import Link from 'next/link';

interface MissingByPosition {
  GOALKEEPER: number;
  DEFENDER: number;
  MIDFIELDER: number;
  FORWARD: number;
}

interface PriceReadiness {
  seasonId: string;
  totalPlayers: number;
  pricedPlayers: number;
  unpricedPlayers: number;
  missingByPosition: MissingByPosition;
  isReady: boolean;
}

export default function PlayersCalibrationPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<PriceReadiness | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => {
    if (!seasonId) return;
    getPlayerPriceReadiness(seasonId)
      .then((d) => setData(d as PriceReadiness))
      .catch((e: unknown) => setError(String(e)));
  };

  useEffect(() => { load(); }, [seasonId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateProvisionalPrices(seasonId!) as { generated: number; skipped: number };
      setSuccess(`Generated ${result.generated} provisional prices. Skipped ${result.skipped} already-priced players.`);
      load();
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setGenerating(false);
    }
  };

  if (!data && !error) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <Link href={`/admin/fantasy/calibration/${seasonId}`} className="text-sm text-blue-600 hover:underline">
          ← Calibration Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Player Price Readiness</h1>
        <p className="text-sm text-gray-500 mt-1">
          Provisional prices: GK 5.0, DEF 5.0, MID 5.5, FWD 6.0 credits. Not official PSL valuations.
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm">{success}</div>}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{data.totalPlayers}</p>
              <p className="text-xs text-gray-500 mt-1">Total Registered</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${data.pricedPlayers === data.totalPlayers ? 'text-green-600' : 'text-orange-500'}`}>
                {data.pricedPlayers}
              </p>
              <p className="text-xs text-gray-500 mt-1">Priced</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${data.unpricedPlayers === 0 ? 'text-green-600' : 'text-orange-500'}`}>
                {data.unpricedPlayers}
              </p>
              <p className="text-xs text-gray-500 mt-1">Unpriced</p>
            </div>
          </div>

          {data.unpricedPlayers > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Missing by Position</h2>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(data.missingByPosition).map(([pos, count]) => (
                  <div key={pos} className={`border rounded p-3 text-center text-sm ${count > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                    <p className="font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{pos}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.unpricedPlayers > 0 && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? 'Generating…' : `Generate Provisional Prices for ${data.unpricedPlayers} Players`}
            </button>
          )}

          {data.isReady && (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800 font-medium">
              All registered players have prices.
            </div>
          )}
        </>
      )}
    </div>
  );
}
