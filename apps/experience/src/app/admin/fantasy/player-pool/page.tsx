'use client';

/**
 * Admin: Fantasy Player Pool Overview
 *
 * READ-ONLY overview of the WC 2026 fantasy player pool.
 * Shows player counts by position. Links to player import tools.
 * Backend enforces PSL_ADMIN RBAC.
 *
 * PSL_INACTIVE · READ_ONLY · NO_REAL_MONEY · FANTASY_POINTS_ONLY
 */

import { useState } from 'react';
import { getToken } from '../../../../lib/auth';
import Link from 'next/link';

interface PositionBreakdown {
  position: string;
  count: number;
}

interface PlayerPoolResponse {
  totalPlayers: number;
  byPosition: PositionBreakdown[];
  byCompetition?: { code: string; count: number }[];
  lastImportedAt?: string | null;
  importSource?: string | null;
}

export default function AdminFantasyPlayerPoolPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PlayerPoolResponse | null>(null);
  const [error, setError] = useState('');

  async function loadPool() {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';
      const res = await fetch(`${apiBase}/admin/fantasy/player-pool`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) throw new Error('Unauthenticated — PSL_ADMIN token required');
      if (res.status === 403) throw new Error('Forbidden — PSL_ADMIN role required');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json() as PlayerPoolResponse);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">Fantasy Player Pool</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-800">READ-ONLY</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">PSL INACTIVE</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-800">POINTS ONLY</span>
        </div>
        <p className="text-gray-400 text-sm">
          Overview of players available in the World Cup 2026 fantasy pool.
          No real-money features. Fantasy is points-only during beta.
        </p>
      </div>

      {/* Quick stats from known data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'WC Players (seeded)', value: '96', note: 'Provisional calibration' },
          { label: 'Positions', value: '4', note: 'GK / DEF / MID / FWD' },
          { label: 'Competitions', value: 'WC 2026', note: 'PSL pool inactive' },
          { label: 'Fantasy Status', value: 'POINTS ONLY', note: 'No real money' },
        ].map(({ label, value, note }) => (
          <div key={label} className="bg-gray-900 rounded p-3 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-bold text-white">{value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{note}</p>
          </div>
        ))}
      </div>

      <button
        onClick={loadPool}
        disabled={loading}
        className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 px-5 py-2 rounded font-medium text-sm mb-6"
      >
        {loading ? 'Loading…' : 'Load Live Pool Data'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-sm text-red-300">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Total */}
          <div className="p-4 bg-gray-900 rounded border border-gray-800">
            <p className="text-3xl font-bold text-white mb-1">{data.totalPlayers.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total players in pool</p>
            {data.lastImportedAt && (
              <p className="text-xs text-gray-600 mt-1">
                Last import: {new Date(data.lastImportedAt).toLocaleString()} · Source: {data.importSource ?? 'unknown'}
              </p>
            )}
          </div>

          {/* Breakdown by position */}
          {data.byPosition.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-300 mb-3">By Position</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.byPosition.map(p => (
                  <div key={p.position} className="bg-gray-900 rounded p-3 border border-gray-800 text-center">
                    <p className="text-2xl font-bold text-white">{p.count}</p>
                    <p className="text-xs text-gray-400 mt-1">{p.position}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* By competition */}
          {data.byCompetition && data.byCompetition.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-300 mb-3">By Competition</h2>
              <div className="space-y-2">
                {data.byCompetition.map(c => (
                  <div key={c.code} className="flex items-center justify-between px-4 py-2 bg-gray-900 rounded border border-gray-800">
                    <span className="text-sm font-mono text-gray-300">{c.code}</span>
                    <span className="text-sm font-bold text-white">{c.count}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Import tools */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Player Import Tools</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p>To update the fantasy player pool:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-gray-500">
            <li>Navigate to <Link href="/admin/players" className="text-blue-400 hover:text-blue-300">Admin › Players</Link> to view current player records</li>
            <li>Use the squad import API endpoint: <code className="text-gray-300">POST /admin/squad-import/run</code> (dry-run first)</li>
            <li>Fantasy prices are calibrated separately via <code className="text-gray-300">POST /admin/fantasy/calibrate-prices</code></li>
            <li>All imports default to <code className="text-gray-300">dryRun: true</code> — confirm write explicitly</li>
          </ol>
        </div>
      </div>

      {/* Links */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            ['/admin/players', 'All Players'],
            ['/admin/data-provider/psl-fixture-readiness', 'PSL Readiness'],
            ['/admin/data-provider/world-cup-live-readiness', 'WC Provider Readiness'],
            ['/admin/readiness', 'Platform Readiness'],
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
