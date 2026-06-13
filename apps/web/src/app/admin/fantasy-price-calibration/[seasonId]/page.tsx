'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { getPriceCalibrationOverview, bulkApplyDefaults, validateCalibration, publishCalibration } from '@/lib/fantasy-price-calibration-client';

interface Overview {
  seasonId: string;
  seasonName: string;
  minPrice: number;
  maxPrice: number;
  registeredPlayerCount: number;
  pricedPlayerCount: number;
  missingPriceCount: number;
  invalidPriceCount: number;
  latestBatch: { id: string; status: string; missingPriceCount: number; invalidPriceCount: number; publishedPlayerCount: number } | null;
}

export default function PriceCalibrationOverviewPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getPriceCalibrationOverview(seasonId)
      .then(setData)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [seasonId]);

  async function handle(action: () => Promise<unknown>, successMsg: string) {
    setActionLoading(true);
    setMsg(null);
    setError(null);
    try {
      await action();
      setMsg(successMsg);
      load();
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/fantasy-price-calibration" className="text-sm text-blue-600 hover:underline">← Price Calibration</Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fantasy Price Calibration</h1>
          {data && <p className="text-gray-500 mt-1">{data.seasonName} · Range: {data.minPrice}–{data.maxPrice}</p>}
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}
      {msg && <p className="text-green-600 bg-green-50 rounded p-3">{msg}</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Registered', value: data.registeredPlayerCount },
              { label: 'Priced', value: data.pricedPlayerCount },
              { label: 'Missing Prices', value: data.missingPriceCount, alert: data.missingPriceCount > 0 },
              { label: 'Invalid Prices', value: data.invalidPriceCount, alert: data.invalidPriceCount > 0 },
            ].map(s => (
              <div key={s.label} className={`border rounded-lg p-4 text-center ${s.alert ? 'border-red-200 bg-red-50' : ''}`}>
                <div className={`text-2xl font-bold ${s.alert ? 'text-red-600' : 'text-gray-900'}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap mb-6">
            <Link href={`/admin/fantasy-price-calibration/${seasonId}/players`} className="text-sm text-blue-600 hover:underline">All Players</Link>
            <span className="text-gray-300">|</span>
            <Link href={`/admin/fantasy-price-calibration/${seasonId}/missing-prices`} className="text-sm text-blue-600 hover:underline">Missing Prices</Link>
            <span className="text-gray-300">|</span>
            <Link href={`/admin/fantasy-price-calibration/${seasonId}/invalid-prices`} className="text-sm text-blue-600 hover:underline">Invalid Prices</Link>
            <span className="text-gray-300">|</span>
            <Link href={`/admin/fantasy-price-calibration/${seasonId}/readiness`} className="text-sm text-blue-600 hover:underline">Readiness</Link>
            <span className="text-gray-300">|</span>
            <Link href={`/admin/fantasy-price-calibration/${seasonId}/activation-dry-run`} className="text-sm text-blue-600 hover:underline">Dry Run</Link>
          </div>

          {data.latestBatch && (
            <div className="bg-gray-50 border rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-700">Latest Calibration Batch: <span className="font-semibold">{data.latestBatch.status}</span></p>
              <p className="text-xs text-gray-500 mt-1">
                Missing: {data.latestBatch.missingPriceCount} · Invalid: {data.latestBatch.invalidPriceCount} · Published: {data.latestBatch.publishedPlayerCount}
              </p>
            </div>
          )}

          {!actionLoading && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handle(() => bulkApplyDefaults(seasonId), 'Default prices applied to unpriced players')}
                className="bg-gray-600 text-white text-sm px-4 py-2 rounded hover:bg-gray-700"
              >
                Apply Default Prices
              </button>
              <button
                onClick={() => handle(() => validateCalibration(seasonId), 'Calibration validated')}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
              >
                Validate Calibration
              </button>
              <button
                onClick={() => handle(() => publishCalibration(seasonId), 'Calibration published')}
                className="bg-green-600 text-white text-sm px-4 py-2 rounded hover:bg-green-700"
              >
                Publish Calibration
              </button>
            </div>
          )}
          {actionLoading && <p className="text-gray-500 text-sm">Processing…</p>}
        </>
      )}
    </div>
  );
}
