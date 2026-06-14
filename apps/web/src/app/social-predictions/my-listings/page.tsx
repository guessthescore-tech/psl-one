'use client';

import { useEffect, useState } from 'react';
import { fanGetMyListings, fanWithdrawListing } from '@/lib/social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

interface Listing {
  id: string;
  supportingSelection: string;
  opposingSelection: string;
  committedPoints: number;
  potentialPointsAward: number;
  status: string;
  confidenceMultiplier: number;
  fixtureMarket?: { marketType: string; fixture?: { kickoffAt: string } };
  createdAt: string;
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const d = await fanGetMyListings(getBetaToken());
      setListings(Array.isArray(d) ? d : d.listings ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function withdraw(id: string) {
    try {
      await fanWithdrawListing(getBetaToken(), id);
      setMsg('Listing withdrawn.');
      load();
    } catch (e) {
      setMsg(String(e));
    }
  }

  const statusColour: Record<string, string> = {
    OPEN: 'text-green-700 bg-green-50',
    PARTIALLY_MATCHED: 'text-yellow-700 bg-yellow-50',
    FULLY_MATCHED: 'text-blue-700 bg-blue-50',
    WITHDRAWN: 'text-gray-500 bg-gray-100',
    SETTLED: 'text-purple-700 bg-purple-50',
    EXPIRED: 'text-gray-400 bg-gray-50',
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">My Challenge Listings</h1>
      <p className="text-xs text-gray-500 mb-5">
        Gameplay points only — cannot be exchanged for money.
      </p>

      {msg && <p className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{msg}</p>}
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="space-y-3">
        {listings.map(l => (
          <div key={l.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-semibold text-sm">
                  {l.fixtureMarket?.marketType?.replace(/_/g, ' ') ?? 'Challenge'}
                </span>
                <span className="ml-2 text-xs text-gray-400">{new Date(l.createdAt).toLocaleDateString()}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColour[l.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {l.status}
              </span>
            </div>
            <div className="text-xs text-gray-600 flex gap-4 mb-2">
              <span>Supporting: <strong>{l.supportingSelection}</strong></span>
              <span>Opposing: <strong>{l.opposingSelection}</strong></span>
              <span>Multiplier: <strong>{l.confidenceMultiplier}×</strong></span>
            </div>
            <div className="text-xs text-gray-600 flex gap-4">
              <span>Committed: <strong>{l.committedPoints} pts</strong></span>
              <span>Potential award: <strong>{l.potentialPointsAward} pts</strong></span>
            </div>
            {l.status === 'OPEN' && (
              <button
                onClick={() => withdraw(l.id)}
                className="mt-3 text-xs text-red-600 border border-red-200 rounded px-3 py-1 hover:bg-red-50"
              >
                Withdraw
              </button>
            )}
            <a href={`/social-predictions/${l.id}`} className="mt-2 block text-xs text-blue-600 underline">
              View detail →
            </a>
          </div>
        ))}
        {!loading && listings.length === 0 && (
          <p className="text-gray-400 text-sm">No listings yet.</p>
        )}
      </div>
    </main>
  );
}
