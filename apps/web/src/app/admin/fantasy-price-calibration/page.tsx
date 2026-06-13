'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPriceCalibrationSeasons } from '@/lib/fantasy-price-calibration-client';

interface PriceSeason {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  status: string;
  rulesConfigured: boolean;
  minPrice: number;
  maxPrice: number;
  defaultPrice: number;
  playerPriceCount: number;
  squadRegistrationCount: number;
  calibrationBatchCount: number;
}

export default function FantasyPriceCalibrationPage() {
  const [seasons, setSeasons] = useState<PriceSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPriceCalibrationSeasons()
      .then(setSeasons)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fantasy Price Calibration</h1>
        <p className="text-gray-500 mt-1">Set and validate fantasy player prices by season. Prices are game-value only — no cash value.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800">
        Fantasy prices are points-only game values. They have no cash value, market value, or monetary meaning.
      </div>

      {loading && <p className="text-gray-500">Loading seasons…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="grid gap-4">
        {seasons.map(s => (
          <div key={s.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{s.name}</span>
                {s.isActive && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">ACTIVE</span>}
                {!s.rulesConfigured && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">NO CONFIG</span>}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Price range: {s.minPrice}–{s.maxPrice} · Default: {s.defaultPrice} · {s.playerPriceCount}/{s.squadRegistrationCount} players priced · {s.calibrationBatchCount} batches
              </p>
            </div>
            <Link href={`/admin/fantasy-price-calibration/${s.id}`} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
              Calibrate
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
