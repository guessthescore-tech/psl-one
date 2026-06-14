'use client';

import { use, useEffect, useState } from 'react';
import { fanGetMarketplace } from '@/lib/social-prediction-client';
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
  listingCount?: number;
}

export default function MarketplacePage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fanGetMarketplace(getBetaToken(), fixtureId)
      .then(d => setMarkets(Array.isArray(d) ? d : d.markets ?? []))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  const statusColour: Record<string, string> = {
    OPEN: 'text-green-700 bg-green-50',
    LOCKED: 'text-yellow-700 bg-yellow-50',
    SETTLED: 'text-blue-700 bg-blue-50',
    VOIDED: 'text-gray-500 bg-gray-100',
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Challenge Marketplace</h1>
      <p className="text-xs text-gray-400 mb-1">Fixture: {fixtureId}</p>
      <p className="text-xs text-gray-500 mb-5">
        Points-based challenges only. Points cannot be exchanged for money.
      </p>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="space-y-3">
        {markets.map(m => (
          <div key={m.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{m.marketType.replace(/_/g, ' ')}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColour[m.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {m.status}
              </span>
            </div>
            <div className="flex gap-2 text-xs text-gray-600 mb-3">
              <span className="bg-gray-100 rounded px-2 py-0.5">{m.homeSelectionLabel}</span>
              <span className="bg-gray-100 rounded px-2 py-0.5">{m.drawSelectionLabel}</span>
              <span className="bg-gray-100 rounded px-2 py-0.5">{m.awaySelectionLabel}</span>
            </div>
            <div className="text-xs text-gray-500 flex gap-4">
              <span>Opportunity: <strong>{m.baseOpportunity} pts</strong></span>
              <span>Return rate: <strong>{m.pointsReturnRate}×</strong></span>
              <span>Multipliers: <strong>{m.allowedMultipliersJson.join(', ')}</strong></span>
            </div>
            {m.status === 'OPEN' && (
              <a
                href={`/social-predictions/create/${m.id}`}
                className="mt-3 block text-center text-xs bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700"
              >
                Create Challenge Listing
              </a>
            )}
          </div>
        ))}
        {!loading && markets.length === 0 && (
          <p className="text-gray-400 text-sm">No markets available for this fixture.</p>
        )}
      </div>
    </main>
  );
}
