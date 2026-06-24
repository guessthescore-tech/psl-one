'use client';

/**
 * Admin: GTS Prediction Fixture Markets
 *
 * READ-ONLY view of open and closed Guess-the-Score prediction markets.
 * Backend enforces PSL_ADMIN RBAC.
 *
 * PSL_INACTIVE · READ_ONLY · GTS_POINTS_ONLY · NO_REAL_MONEY
 */

import { useState } from 'react';
import { getToken } from '../../../../lib/auth';
import Link from 'next/link';

type MarketStatus = 'OPEN' | 'LOCKED' | 'SETTLED' | 'VOID';

interface GtsMarket {
  id: string;
  fixtureId: string;
  kickoffAt: string;
  status: MarketStatus;
  predictionCount: number;
  homeTeam?: { name: string } | null;
  awayTeam?: { name: string } | null;
}

interface GtsFixturesResponse {
  open: GtsMarket[];
  locked: GtsMarket[];
  settled: GtsMarket[];
  void: GtsMarket[];
  totals: {
    open: number;
    locked: number;
    settled: number;
    void: number;
    totalPredictions: number;
  };
}

const STATUS_BADGE: Record<MarketStatus, string> = {
  OPEN: 'bg-emerald-500/20 text-emerald-400',
  LOCKED: 'bg-yellow-500/20 text-yellow-400',
  SETTLED: 'bg-gray-600/40 text-gray-300',
  VOID: 'bg-red-500/20 text-red-400',
};

export default function AdminGtsFixturesPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GtsFixturesResponse | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<MarketStatus>('OPEN');

  async function loadMarkets() {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';
      const res = await fetch(`${apiBase}/admin/predictions/gts-fixtures`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) throw new Error('Unauthenticated — PSL_ADMIN token required');
      if (res.status === 403) throw new Error('Forbidden — PSL_ADMIN role required');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json() as GtsFixturesResponse);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const currentMarkets = data
    ? activeTab === 'OPEN' ? data.open
    : activeTab === 'LOCKED' ? data.locked
    : activeTab === 'SETTLED' ? data.settled
    : data.void
    : [];

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">GTS Prediction Markets</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-800">READ-ONLY</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">PSL INACTIVE</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-800">POINTS ONLY</span>
        </div>
        <p className="text-gray-400 text-sm">
          View open, locked, and settled Guess the Score prediction markets.
          All markets are points-based — no real-money prizes.
        </p>
      </div>

      {/* Safety notice */}
      <div className="mb-6 p-3 bg-amber-900/20 border border-amber-800 rounded text-xs text-amber-300">
        <strong>Points only:</strong> GTS prediction markets award points — no real money.
        PSL is INACTIVE. All WC 2026 beta markets are non-financial.
      </div>

      <button
        onClick={loadMarkets}
        disabled={loading}
        className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 px-5 py-2 rounded font-medium text-sm mb-6"
      >
        {loading ? 'Loading…' : 'Load Markets'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-sm text-red-300">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { label: 'Open', count: data.totals.open, badge: 'bg-emerald-900/40 border-emerald-800 text-emerald-300' },
              { label: 'Locked', count: data.totals.locked, badge: 'bg-yellow-900/40 border-yellow-800 text-yellow-300' },
              { label: 'Settled', count: data.totals.settled, badge: 'bg-gray-800 border-gray-700 text-gray-300' },
              { label: 'Void', count: data.totals.void, badge: 'bg-red-900/40 border-red-800 text-red-300' },
            ] as const).map(({ label, count, badge }) => (
              <div key={label} className={`rounded p-3 border ${badge} text-center`}>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs mt-1">{label} Markets</p>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-500">
            Total predictions submitted: <span className="text-gray-300 font-mono">{data.totals.totalPredictions.toLocaleString()}</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-800">
            {(['OPEN', 'LOCKED', 'SETTLED', 'VOID'] as MarketStatus[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-400 text-blue-300'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Market list */}
          {currentMarkets.length > 0 ? (
            <div className="space-y-2">
              {currentMarkets.map(m => (
                <div key={m.id} className="flex items-center gap-4 p-3 bg-gray-900 rounded border border-gray-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {m.homeTeam?.name ?? 'TBD'} vs {m.awayTeam?.name ?? 'TBD'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(m.kickoffAt).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {' · '}
                      {m.predictionCount} prediction{m.predictionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[m.status]}`}>
                      {m.status}
                    </span>
                    <Link
                      href={`/admin/fixtures?fixtureId=${m.fixtureId}`}
                      className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                    >
                      Fixture →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 text-sm">
              No {activeTab.toLowerCase()} markets.
            </div>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <div className="text-center py-12 text-gray-600 text-sm">
          Click &quot;Load Markets&quot; to view GTS prediction market status.
        </div>
      )}

      {/* Links */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            ['/admin/challenges', 'Challenges'],
            ['/admin/fixtures', 'Fixtures'],
            ['/admin/leaderboards', 'Leaderboards'],
            ['/admin/rules/guess-the-score', 'GTS Rules'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="px-3 py-1 rounded bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700 transition-colors">
              {label} →
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
