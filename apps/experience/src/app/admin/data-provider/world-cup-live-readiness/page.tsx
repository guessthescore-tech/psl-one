'use client';

/**
 * Admin: World Cup 2026 Live Provider Readiness Monitor
 *
 * READ-ONLY monitoring surface for WC2026 live provider status and DB seed health.
 * Does not import fixtures, publish fixtures, or activate PSL.
 * The backend enforces PSL_ADMIN RBAC on all routes.
 *
 * SECURITY: Provider keys are never exposed in responses.
 * All provider inspection happens server-side (env var presence check only).
 *
 * POINTS-ONLY CONTEXT:
 * - WC fantasy is points-based only — no cash value
 * - GTS prediction markets are points-based only — no wagering
 * - No real-money wallet linked to WC features
 */

import { useState } from 'react';
import { getToken } from '../../../../lib/auth';

type ProviderStatus = 'CONFIGURED' | 'NOT_CONFIGURED' | 'WIDGET_READY' | 'CONNECTED' | 'ERROR';

interface WcLiveReadinessResponse {
  competition: 'WC2026';
  worldCupActive: true;
  activeProviders: {
    footballDataOrg: { configured: boolean; envVar: string; status: ProviderStatus };
    sportRadar: { configured: boolean; envVar: string; status: ProviderStatus };
    scoreBat: { configured: boolean; envVar: string; status: ProviderStatus };
  };
  primaryProvider: string;
  fallbackChain: string[];
  importReadiness: {
    dryRunEligible: boolean;
    writeImportAllowedByEnvFlag: boolean;
    writeImportRequiresFlags: string[];
  };
  ownerActions: string[];
  forbiddenActions: string[];
  safety: {
    noRealMoney: true;
    noPslActivation: true;
    worldCupBetaContext: true;
    noScheduledIngestion: true;
    noProductionIngestion: true;
  };
}

interface PlayerPoolStatusResponse {
  competition: 'WC2026';
  season: { id: string; name: string; isActive: boolean } | null;
  playerPool: {
    totalPlayers: number;
    teamCount: number;
    byPosition: Record<string, number>;
    playersWithPrice: number;
    priceSeeded: boolean;
    priceNote: string;
  };
  safety: { noRealMoney: true; noPslActivation: true; pointsOnlyContext: true; noWrites: true };
}

interface FixtureStatusResponse {
  competition: 'WC2026';
  season: { id: string; name: string; isActive: boolean } | null;
  fixtures: { total: number; published: number; byRound: Record<string, number> };
  predictionMarkets: { total: number; open: number; locked: number; settled: number; note?: string };
  safety: { noRealMoney: true; noPslActivation: true; pointsOnlyContext: true; noWrites: true };
}

async function fetchJson<T>(url: string, token: string | null): Promise<T> {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 401) throw new Error('Unauthenticated — PSL_ADMIN token required');
  if (res.status === 403) throw new Error('Forbidden — PSL_ADMIN role required');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export default function WorldCupLiveReadinessPage() {
  const [loadingReadiness, setLoadingReadiness] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingFixtures, setLoadingFixtures] = useState(false);
  const [readiness, setReadiness] = useState<WcLiveReadinessResponse | null>(null);
  const [playerPool, setPlayerPool] = useState<PlayerPoolStatusResponse | null>(null);
  const [fixtureStatus, setFixtureStatus] = useState<FixtureStatusResponse | null>(null);
  const [error, setError] = useState('');

  const token = getToken();

  async function checkReadiness() {
    setLoadingReadiness(true);
    setError('');
    try {
      setReadiness(await fetchJson<WcLiveReadinessResponse>('/api/admin/data-provider/world-cup-live-readiness', token));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoadingReadiness(false);
    }
  }

  async function checkPlayerPool() {
    setLoadingPlayers(true);
    setError('');
    try {
      setPlayerPool(await fetchJson<PlayerPoolStatusResponse>('/api/admin/data-provider/world-cup/player-pool-status', token));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoadingPlayers(false);
    }
  }

  async function checkFixtures() {
    setLoadingFixtures(true);
    setError('');
    try {
      setFixtureStatus(await fetchJson<FixtureStatusResponse>('/api/admin/data-provider/world-cup/fixture-status', token));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoadingFixtures(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">World Cup 2026 — Live Provider Readiness</h1>
      <p className="text-blue-400 text-sm mb-2">
        READ-ONLY · PSL_ADMIN only · No imports · No PSL activation · Points-only context
      </p>
      <p className="text-gray-400 text-xs mb-6">
        Monitor WC2026 provider configuration, seed health, and prediction market readiness.
        All WC fantasy and GTS data is points-based — no cash value, no wagering.
      </p>

      {/* Safety banner */}
      <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded text-sm">
        <strong className="text-yellow-300">Safety boundaries</strong>
        <ul className="mt-2 space-y-1 text-yellow-200 text-xs list-disc list-inside">
          <li>PSL remains INACTIVE — this check does not change that</li>
          <li>WC2026 fantasy = points only · No real-money wallet · No cash value</li>
          <li>GTS prediction markets = points only · No wagering · No odds · No stakes</li>
          <li>No writes, no scheduler, no production ingestion from this page</li>
        </ul>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={checkReadiness}
          disabled={loadingReadiness}
          className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium"
        >
          {loadingReadiness ? 'Checking…' : 'Check Provider Readiness'}
        </button>
        <button
          onClick={checkPlayerPool}
          disabled={loadingPlayers}
          className="bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium"
        >
          {loadingPlayers ? 'Loading…' : 'Check Player Pool Status'}
        </button>
        <button
          onClick={checkFixtures}
          disabled={loadingFixtures}
          className="bg-violet-700 hover:bg-violet-600 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium"
        >
          {loadingFixtures ? 'Loading…' : 'Check Fixture Status'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Provider Readiness Panel */}
        {readiness && (
          <section className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-blue-300">Provider Readiness</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {Object.entries(readiness.activeProviders).map(([key, p]) => (
                <div key={key} className="bg-gray-800 p-3 rounded">
                  <p className="text-xs font-mono text-gray-400 mb-1">{key}</p>
                  <p className={`text-sm font-semibold ${p.configured ? 'text-green-400' : 'text-gray-500'}`}>
                    {p.status}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{p.envVar}</p>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Primary provider: <span className="text-white font-mono">{readiness.primaryProvider}</span></p>
              <p>Dry-run eligible: <span className={readiness.importReadiness.dryRunEligible ? 'text-green-400' : 'text-gray-500'}>{String(readiness.importReadiness.dryRunEligible)}</span></p>
              <p>Write import allowed: <span className={readiness.importReadiness.writeImportAllowedByEnvFlag ? 'text-green-400' : 'text-gray-500'}>{String(readiness.importReadiness.writeImportAllowedByEnvFlag)}</span></p>
            </div>
          </section>
        )}

        {/* Player Pool Panel */}
        {playerPool && (
          <section className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-indigo-300">Player Pool Status</h2>
            {playerPool.season && (
              <p className="text-xs text-gray-400 mb-3">
                Season: <span className="text-white">{playerPool.season.name}</span>
                {' · '}Active: <span className={playerPool.season.isActive ? 'text-green-400' : 'text-gray-500'}>{String(playerPool.season.isActive)}</span>
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Stat label="Teams" value={playerPool.playerPool.teamCount} />
              <Stat label="Total Players" value={playerPool.playerPool.totalPlayers} />
              <Stat label="With Price" value={playerPool.playerPool.playersWithPrice} />
              <Stat label="Price Seeded" value={playerPool.playerPool.priceSeeded ? 'Yes' : 'No'} highlight={playerPool.playerPool.priceSeeded} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              {Object.entries(playerPool.playerPool.byPosition).map(([pos, count]) => (
                <div key={pos} className="bg-gray-800 p-2 rounded text-center">
                  <p className="text-xs text-gray-400">{pos}</p>
                  <p className="text-lg font-bold text-white">{count}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-yellow-600">{playerPool.playerPool.priceNote}</p>
          </section>
        )}

        {/* Fixture Status Panel */}
        {fixtureStatus && (
          <section className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-violet-300">Fixture & Market Status</h2>
            {fixtureStatus.season && (
              <p className="text-xs text-gray-400 mb-3">
                Season: <span className="text-white">{fixtureStatus.season.name}</span>
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Stat label="Total Fixtures" value={fixtureStatus.fixtures.total} />
              <Stat label="Published" value={fixtureStatus.fixtures.published} />
              <Stat label="Total Markets" value={fixtureStatus.predictionMarkets.total} />
              <Stat label="Open Markets" value={fixtureStatus.predictionMarkets.open} />
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2 font-semibold">Fixtures by Round</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {Object.entries(fixtureStatus.fixtures.byRound).map(([round, count]) => (
                  <div key={round} className="bg-gray-800 p-2 rounded text-center">
                    <p className="text-xs text-gray-400 truncate">{round}</p>
                    <p className="text-sm font-bold text-white">{count}</p>
                  </div>
                ))}
              </div>
            </div>
            {fixtureStatus.predictionMarkets.note && (
              <p className="text-xs text-yellow-600">{fixtureStatus.predictionMarkets.note}</p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="bg-gray-800 p-3 rounded text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-xl font-bold ${highlight === false ? 'text-red-400' : highlight === true ? 'text-green-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
