'use client';

import { useEffect, useState } from 'react';
import { adminListMarketConfigs, adminToggleMarketConfig } from '@/lib/admin-social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

interface MarketConfig {
  id: string;
  marketType: string;
  label: string;
  isEnabled: boolean;
  baseOpportunity: number;
  pointsReturnRate: number;
  seasonId: string;
}

export default function AdminMarketsPage() {
  const [configs, setConfigs] = useState<MarketConfig[]>([]);
  const [seasonId, setSeasonId] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!seasonId) return;
    setLoading(true);
    setError(null);
    try {
      const d = await adminListMarketConfigs(getBetaToken(), seasonId);
      setConfigs(Array.isArray(d) ? d : []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function toggle(id: string, isEnabled: boolean) {
    try {
      await adminToggleMarketConfig(getBetaToken(), id, !isEnabled);
      setMsg(`Config ${!isEnabled ? 'enabled' : 'disabled'}`);
      load();
    } catch (e) {
      setMsg(String(e));
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Market Configs</h1>
        <a href="/admin/social-predictions/markets/new" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded">
          New Config
        </a>
      </div>

      <div className="flex gap-2 mb-5">
        <input
          className="border rounded px-3 py-1.5 text-sm flex-1"
          placeholder="Season ID"
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
        />
        <button className="bg-gray-800 text-white px-4 py-1.5 rounded text-sm" onClick={load} disabled={!seasonId}>
          Load
        </button>
      </div>

      {msg && <p className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{msg}</p>}
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="space-y-3">
        {configs.map(c => (
          <div key={c.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm">{c.label}</p>
                <p className="text-xs text-gray-400 font-mono">{c.marketType}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${c.isEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {c.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex gap-4">
              <span>Opportunity: {c.baseOpportunity} pts</span>
              <span>Return rate: {c.pointsReturnRate}×</span>
            </div>
            <button
              onClick={() => toggle(c.id, c.isEnabled)}
              className="mt-2 text-xs text-gray-600 border rounded px-3 py-1 hover:bg-gray-50"
            >
              {c.isEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
        {!loading && configs.length === 0 && seasonId && (
          <p className="text-gray-400 text-sm">No market configs for this season.</p>
        )}
      </div>
    </main>
  );
}
