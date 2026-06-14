'use client';

import { use, useEffect, useState } from 'react';
import { fanGetListing, fanAcceptListing, fanWithdrawListing } from '@/lib/social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

export default function ListingDetailPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = use(params);
  const [listing, setListing] = useState<Record<string, unknown> | null>(null);
  const [acceptPts, setAcceptPts] = useState(10);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const d = await fanGetListing(getBetaToken(), listingId);
      setListing(d);
      if (d.committedPoints) setAcceptPts(Math.min(10, Number(d.committedPoints)));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [listingId]);

  async function accept() {
    setActing(true);
    setMsg(null);
    try {
      const r = await fanAcceptListing(getBetaToken(), listingId, {
        pointsToAccept: acceptPts,
        idempotencyKey: `accept-${listingId}-${Date.now()}`,
      });
      setMsg(String((r as Record<string, unknown>).safetyNote ?? 'Accepted'));
      load();
    } catch (e) {
      setMsg(String(e));
    } finally {
      setActing(false);
    }
  }

  async function withdraw() {
    setActing(true);
    try {
      await fanWithdrawListing(getBetaToken(), listingId);
      setMsg('Listing withdrawn.');
      load();
    } catch (e) {
      setMsg(String(e));
    } finally {
      setActing(false);
    }
  }

  if (loading) return <main className="p-6 text-sm text-gray-500">Loading...</main>;
  if (error) return <main className="p-6 text-red-600 text-sm">{error}</main>;
  if (!listing) return null;

  const status = String(listing['status']);

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Challenge Listing</h1>
      <p className="text-xs text-gray-500 mb-5">
        PSL One social prediction challenges use system-issued gameplay points only. Gameplay points cannot be
        purchased, transferred, withdrawn or exchanged for money. Challenge results affect platform scoring and
        leaderboard positions only.
      </p>

      <div className="border rounded-lg p-5 bg-white shadow-sm mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <strong>{status}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Supporting selection</span>
          <strong>{String(listing['supportingSelection'])}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Opposing selection</span>
          <strong>{String(listing['opposingSelection'])}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Committed points</span>
          <strong>{String(listing['committedPoints'])} pts</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Potential award</span>
          <strong>{String(listing['potentialPointsAward'])} pts</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Confidence multiplier</span>
          <strong>{String(listing['confidenceMultiplier'])}×</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Matched points</span>
          <strong>{String(listing['matchedPoints'] ?? 0)} / {String(listing['committedPoints'])}</strong>
        </div>
      </div>

      {msg && (
        <div className="mb-4 text-sm bg-blue-50 border border-blue-200 rounded p-3 text-blue-700">{msg}</div>
      )}

      {status === 'OPEN' && (
        <div className="border rounded-lg p-4 bg-white shadow-sm mb-3">
          <p className="text-sm font-medium mb-2">Accept this listing</p>
          <label className="text-xs text-gray-500 block mb-1">Points to accept: <strong>{acceptPts}</strong></label>
          <input
            type="range" min={1} max={Number(listing['committedPoints']) || 100} value={acceptPts}
            onChange={e => setAcceptPts(Number(e.target.value))}
            className="w-full mb-3"
          />
          <button
            onClick={accept}
            disabled={acting}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50"
          >
            {acting ? 'Processing...' : 'Accept Challenge'}
          </button>
        </div>
      )}

      {status === 'OPEN' && (
        <button
          onClick={withdraw}
          disabled={acting}
          className="w-full border border-red-200 text-red-600 py-2 rounded text-sm hover:bg-red-50 disabled:opacity-50"
        >
          Withdraw Listing
        </button>
      )}
    </main>
  );
}
