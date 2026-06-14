'use client';

import { useState } from 'react';
import { adminListFixtureMarkets, adminSettleMarket, adminVoidMarket } from '@/lib/admin-social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

export default function AdminSettlementsPage() {
  const [fixtureId, setFixtureId] = useState('');
  const [markets, setMarkets] = useState<Record<string, unknown>[]>([]);
  const [settledOutcome, setSettledOutcome] = useState('');
  const [voidReason, setVoidReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadMarkets() {
    if (!fixtureId) return;
    setLoading(true);
    setError(null);
    try {
      const d = await adminListFixtureMarkets(getBetaToken(), fixtureId);
      setMarkets(Array.isArray(d) ? d : []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function settle(marketId: string) {
    if (!settledOutcome) { setMsg('Enter settled outcome first.'); return; }
    try {
      await adminSettleMarket(getBetaToken(), marketId, settledOutcome);
      setMsg('Market settled. Points awarded via ledger.');
      loadMarkets();
    } catch (e) {
      setMsg(String(e));
    }
  }

  async function voidM(marketId: string) {
    if (!voidReason) { setMsg('Enter void reason first.'); return; }
    try {
      await adminVoidMarket(getBetaToken(), marketId, voidReason);
      setMsg('Market voided. Points restored via ledger.');
      loadMarkets();
    } catch (e) {
      setMsg(String(e));
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Market Settlements</h1>
      <p className="text-xs text-gray-500 mb-5">
        Settling or voiding a market triggers immutable SocialPredictionPointsEntry ledger entries.
        Points are system-issued gameplay points only — no monetary value.
      </p>

      <div className="flex gap-2 mb-5">
        <input className="border rounded px-3 py-1.5 text-sm flex-1" placeholder="Fixture ID" value={fixtureId} onChange={e => setFixtureId(e.target.value)} />
        <button className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm" onClick={loadMarkets}>Load Markets</button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Settled Outcome</label>
          <input className="border rounded px-2 py-1.5 text-sm w-full" placeholder="e.g. HOME, DRAW, AWAY" value={settledOutcome} onChange={e => setSettledOutcome(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Void Reason</label>
          <input className="border rounded px-2 py-1.5 text-sm w-full" placeholder="e.g. Match abandoned" value={voidReason} onChange={e => setVoidReason(e.target.value)} />
        </div>
      </div>

      {msg && <p className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{msg}</p>}
      {error && <p className="mb-3 text-red-600 text-sm">{error}</p>}
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}

      <div className="space-y-3">
        {markets.map(m => (
          <div key={String(m['id'])} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">{String(m['marketType'])}</span>
              <span className="text-xs font-mono bg-gray-100 rounded px-2 py-0.5">{String(m['status'])}</span>
            </div>
            {String(m['status']) === 'LOCKED' && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => settle(String(m['id']))} className="text-xs bg-blue-600 text-white rounded px-3 py-1.5">Settle</button>
                <button onClick={() => voidM(String(m['id']))} className="text-xs bg-red-600 text-white rounded px-3 py-1.5">Void</button>
              </div>
            )}
            {String(m['status']) === 'SETTLED' && (
              <p className="text-xs text-green-700 mt-1">Settled: {String(m['settledOutcome'])}</p>
            )}
            {String(m['status']) === 'VOIDED' && (
              <p className="text-xs text-gray-500 mt-1">Voided: {String(m['voidReason'])}</p>
            )}
          </div>
        ))}
        {!loading && markets.length === 0 && fixtureId && (
          <p className="text-gray-400 text-sm">No markets found.</p>
        )}
      </div>
    </main>
  );
}
