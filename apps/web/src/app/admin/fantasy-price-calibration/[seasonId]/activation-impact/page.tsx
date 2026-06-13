'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { getPriceCalibrationActivationImpact } from '@/lib/fantasy-price-calibration-client';

interface Impact {
  seasonId: string;
  seasonName: string;
  registeredPlayerCount: number;
  pricedPlayerCount: number;
  missingPriceCount: number;
  invalidPriceCount: number;
  minPrice: number;
  maxPrice: number;
  latestCalibrationStatus: string | null;
  lastPublishedAt: string | null;
  warnings: string[];
}

export default function PriceCalibrationActivationImpactPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [data, setData] = useState<Impact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPriceCalibrationActivationImpact(seasonId)
      .then(setData)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/fantasy-price-calibration/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Calibration Overview</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Activation Impact — Price Calibration</h1>
      {data && <p className="text-gray-500 mb-6">{data.seasonName} · Range {data.minPrice}–{data.maxPrice}</p>}

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Registered Players', value: data.registeredPlayerCount },
              { label: 'Priced Players', value: data.pricedPlayerCount },
              { label: 'Missing Prices', value: data.missingPriceCount, alert: data.missingPriceCount > 0 },
              { label: 'Invalid Prices', value: data.invalidPriceCount, alert: data.invalidPriceCount > 0 },
            ].map(s => (
              <div key={s.label} className={`border rounded-lg p-4 text-center ${s.alert ? 'border-red-200 bg-red-50' : ''}`}>
                <div className={`text-2xl font-bold ${s.alert ? 'text-red-600' : 'text-gray-900'}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {data.latestCalibrationStatus && (
            <p className="text-sm text-gray-600 mb-2">Latest calibration: <strong>{data.latestCalibrationStatus}</strong>{data.lastPublishedAt ? ` (published ${new Date(data.lastPublishedAt).toLocaleDateString()})` : ''}</p>
          )}

          {data.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="font-medium text-yellow-800 mb-2">Warnings</p>
              <ul className="space-y-1">
                {data.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-yellow-700">⚠ {w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <Link href={`/admin/fantasy-price-calibration/${seasonId}/activation-dry-run`} className="bg-gray-800 text-white text-sm px-4 py-2 rounded hover:bg-gray-900">
              Run Activation Dry Run
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
