'use client';

import { use, useEffect, useState } from 'react';
import {
  adminListFixtureMarkets,
  adminGenerateFixtureMarkets,
  adminOpenMarket,
  adminLockMarket,
  adminSettleMarket,
  adminVoidMarket,
} from '@/lib/admin-social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

export default function MarketConfigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
    try {
      const d = await adminListFixtureMarkets(getBetaToken(), fixtureId);
      setMarkets(Array.isArray(d) ? d : []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    if (!fixtureId) return;
    try {
      await adminGenerateFixtureMarkets(getBetaToken(), fixtureId, { marketConfigId: id });
      setMsg('Markets generated.');
      loadMarkets();
    } catch (e) {
      setMsg(String(e));
    }
  }

  async function action(marketId: string, act: string) {
    try {
      if (act === 'open') await adminOpenMarket(getBetaToken(), marketId);
      else if (act === 'lock') await adminLockMarket(getBetaToken(), marketId);
      else if (act === 'settle') await adminSettleMarket(getBetaToken(), marketId, settledOutcome);
      else if (act === 'void') await adminVoidMarket(getBetaToken(), marketId, voidReason);
      setMsg(`Market ${act} successful.`);
      loadMarkets();
    } catch (e) {
      setMsg(String(e));
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Fixture Markets</h1>
      <p className="text-xs text-gray-400 mb-5">Config ID: {id}</p>

      <div className="flex gap-2 mb-3">
        <input
          className="border rounded px-3 py-1.5 text-sm flex-1"
          placeholder="Fixture ID"
          value={fixtureId}
          onChange={e => setFixtureId(e.target.value)}
        />
        <button className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm" onClick={loadMarkets}>Load</button>
        <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm" onClick={generate}>Generate</button>
      </div>

      {msg && <p className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{msg}</p>}
      {error && <p className="mb-3 text-red-600 text-sm">{error}</p>}
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}

      <div className="space-y-3">
        {markets.map(m => (
          <div key={String(m['id'])} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-sm">{String(m['marketType'])}</span>
              <span className="text-xs font-mono bg-gray-100 rounded px-2 py-0.5">{String(m['status'])}</span>
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              {String(m['status']) === 'CREATED' && (
                <button onClick={() => action(String(m['id']), 'open')} className="text-xs bg-green-600 text-white rounded px-2 py-1">Open</button>
              )}
              {String(m['status']) === 'OPEN' && (
                <button onClick={() => action(String(m['id']), 'lock')} className="text-xs bg-yellow-600 text-white rounded px-2 py-1">Lock</button>
              )}
              {String(m['status']) === 'LOCKED' && (
                <>
                  <input className="text-xs border rounded px-2 py-1 w-24" placeholder="Outcome" value={settledOutcome} onChange={e => setSettledOutcome(e.target.value)} />
                  <button onClick={() => action(String(m['id']), 'settle')} className="text-xs bg-blue-600 text-white rounded px-2 py-1">Settle</button>
                  <input className="text-xs border rounded px-2 py-1 w-28" placeholder="Void reason" value={voidReason} onChange={e => setVoidReason(e.target.value)} />
                  <button onClick={() => action(String(m['id']), 'void')} className="text-xs bg-red-600 text-white rounded px-2 py-1">Void</button>
                </>
              )}
            </div>
          </div>
        ))}
        {!loading && markets.length === 0 && fixtureId && (
          <p className="text-gray-400 text-sm">No markets for this fixture.</p>
        )}
      </div>
    </main>
  );
}
