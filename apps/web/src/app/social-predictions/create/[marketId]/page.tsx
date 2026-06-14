'use client';

import { use, useEffect, useState } from 'react';
import { fanGetFixtureMarket, fanCreateListing, fanGetAllocation } from '@/lib/social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

interface Market {
  id: string;
  marketType: string;
  status: string;
  baseOpportunity: number;
  pointsReturnRate: number;
  allowedMultipliersJson: number[];
  homeSelectionLabel: string;
  drawSelectionLabel: string;
  awaySelectionLabel: string;
}

export default function CreateListingPage({ params }: { params: Promise<{ marketId: string }> }) {
  const { marketId } = use(params);
  const [market, setMarket] = useState<Market | null>(null);
  const [allocation, setAllocation] = useState<{ remainingAllocation: number; totalAllocation: number } | null>(null);
  const [selection, setSelection] = useState('');
  const [commitPct, setCommitPct] = useState(20);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameweekId, setGameweekId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fanGetFixtureMarket(getBetaToken(), marketId)
      .then(d => {
        setMarket(d);
        if (d.allowedMultipliersJson?.[0]) setMultiplier(d.allowedMultipliersJson[0]);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [marketId]);

  async function loadAllocation() {
    if (!gameweekId) return;
    try {
      const a = await fanGetAllocation(getBetaToken(), gameweekId);
      setAllocation(a);
    } catch {
      setAllocation(null);
    }
  }

  async function submit() {
    if (!selection || !gameweekId) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fanCreateListing(getBetaToken(), {
        fixtureMarketId: marketId,
        gameweekId,
        supportingSelection: selection,
        pointsCommitmentPct: commitPct,
        confidenceMultiplier: multiplier,
        idempotencyKey: `${marketId}-${selection}-${Date.now()}`,
      });
      setResult(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="p-6 text-sm text-gray-500">Loading market...</main>;

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Create Challenge Listing</h1>
      <p className="text-xs text-gray-500 mb-5">
        PSL One social prediction challenges use system-issued gameplay points only. Gameplay points cannot be
        purchased, transferred, withdrawn or exchanged for money.
      </p>

      {market && (
        <div className="border rounded-lg p-4 bg-white shadow-sm mb-5">
          <p className="font-semibold text-sm mb-3">{market.marketType.replace(/_/g, ' ')}</p>

          <label className="block text-xs text-gray-500 mb-1">Your Selection (Supporting)</label>
          <div className="flex gap-2 mb-4">
            {[
              { value: 'HOME', label: market.homeSelectionLabel },
              { value: 'DRAW', label: market.drawSelectionLabel },
              { value: 'AWAY', label: market.awaySelectionLabel },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelection(opt.value)}
                className={`flex-1 py-2 text-xs rounded border ${
                  selection === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className="block text-xs text-gray-500 mb-1">Gameweek ID</label>
          <div className="flex gap-2 mb-4">
            <input
              className="border rounded px-2 py-1 text-sm flex-1"
              value={gameweekId}
              onChange={e => setGameweekId(e.target.value)}
              placeholder="gw-..."
            />
            <button className="text-xs text-blue-600 underline" onClick={loadAllocation}>Check allocation</button>
          </div>

          {allocation && (
            <p className="text-xs text-gray-500 mb-3">
              Remaining: <strong>{allocation.remainingAllocation}</strong> / {allocation.totalAllocation} pts
            </p>
          )}

          <label className="block text-xs text-gray-500 mb-1">Points Commitment: <strong>{commitPct}%</strong></label>
          <input
            type="range" min={5} max={100} step={5} value={commitPct}
            onChange={e => setCommitPct(Number(e.target.value))}
            className="w-full mb-4"
          />

          <label className="block text-xs text-gray-500 mb-1">Confidence Multiplier</label>
          <select
            className="border rounded px-2 py-1 text-sm w-full mb-4"
            value={multiplier}
            onChange={e => setMultiplier(Number(e.target.value))}
          >
            {market.allowedMultipliersJson.map(m => (
              <option key={m} value={m}>{m}×</option>
            ))}
          </select>

          <div className="bg-gray-50 rounded p-3 text-xs text-gray-600 mb-4 space-y-1">
            <p>Opportunity: <strong>{market.baseOpportunity} pts</strong></p>
            <p>Return rate: <strong>{market.pointsReturnRate}×</strong></p>
            <p>Estimated commitment: <strong>{Math.floor(market.baseOpportunity * commitPct / 100)} pts</strong></p>
            <p>Potential award: <strong>{Math.floor(market.baseOpportunity * commitPct / 100 * market.pointsReturnRate * multiplier)} pts</strong></p>
          </div>

          <button
            onClick={submit}
            disabled={submitting || !selection || !gameweekId}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Challenge Listing'}
          </button>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      {result && (
        <div className="border border-green-300 rounded-lg p-4 bg-green-50">
          <p className="text-green-700 font-semibold text-sm mb-1">Listing Created</p>
          <p className="text-xs text-gray-600">{String((result as Record<string, unknown>)['safetyNote'])}</p>
          <a href="/social-predictions/my-listings" className="mt-2 block text-xs text-blue-600 underline">
            View my listings →
          </a>
        </div>
      )}
    </main>
  );
}
