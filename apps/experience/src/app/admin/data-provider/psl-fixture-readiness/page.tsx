'use client';

/**
 * Admin: PSL Fixture Readiness Monitor
 *
 * READ-ONLY monitoring surface. Does not import fixtures, publish fixtures,
 * or activate PSL. The backend enforces PSL_ADMIN RBAC.
 *
 * SECURITY: Provider keys never accessed from browser. All provider inspection
 * happens server-side in the NestJS API (env var presence check only).
 */

import { useState } from 'react';
import { getToken } from '../../../../lib/auth';

type ReadinessStatus =
  | 'SOURCE_EMPTY'
  | 'PROVIDER_NOT_CONFIGURED'
  | 'PROVIDER_ERROR'
  | 'FIXTURES_AVAILABLE_DRY_RUN_REQUIRED'
  | 'READY_FOR_OWNER_IMPORT_REVIEW';

type ProviderStatus = 'OK' | 'SOURCE_EMPTY' | 'ERROR' | 'NOT_CONFIGURED' | 'SUSPENDED' | 'NOT_CHECKED';

interface PslFixtureReadinessResponse {
  competition: 'PSL';
  season: string;
  pslActive: false;
  fixturePublicationIsActivation: false;
  readinessStatus: ReadinessStatus;
  parsePsl: {
    configured: boolean;
    status: ProviderStatus;
    candidateFixtureCount: number;
    lastCheckedAt: string;
  };
  apiFootball: {
    configured: boolean;
    leagueId: 288;
    status: ProviderStatus;
    candidateFixtureCount?: number;
  };
  ownerActions: string[];
  forbiddenActions: string[];
  safety: {
    noWrites: true;
    noPublication: true;
    noPslActivation: true;
    noScheduledIngestion: true;
    noProductionIngestion: true;
    noRealMoney: true;
  };
}

const STATUS_COLOURS: Record<ReadinessStatus, string> = {
  SOURCE_EMPTY: 'bg-blue-800 text-blue-100',
  PROVIDER_NOT_CONFIGURED: 'bg-gray-700 text-gray-200',
  PROVIDER_ERROR: 'bg-red-800 text-red-100',
  FIXTURES_AVAILABLE_DRY_RUN_REQUIRED: 'bg-yellow-700 text-yellow-100',
  READY_FOR_OWNER_IMPORT_REVIEW: 'bg-emerald-700 text-emerald-100',
};

export default function PslFixtureReadinessPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PslFixtureReadinessResponse | null>(null);
  const [error, setError] = useState('');

  async function checkReadiness() {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch('/api/admin/data-provider/psl-fixture-readiness', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) throw new Error('Unauthenticated — PSL_ADMIN token required');
      if (res.status === 403) throw new Error('Forbidden — PSL_ADMIN role required');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">PSL Fixture Readiness Monitor</h1>
      <p className="text-blue-400 text-sm mb-2">
        READ-ONLY · No fixture import · No fixture publication · No PSL activation
      </p>
      <p className="text-gray-400 text-xs mb-6">
        Checks whether PSL fixtures are available from configured providers.
        Expected status: <code className="text-blue-300">SOURCE_EMPTY</code> until
        psl.co.za publishes the 2026/27 fixture schedule (~July/August 2026).
      </p>

      <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded text-sm">
        <strong className="text-yellow-300">Safety boundaries</strong>
        <ul className="mt-2 space-y-1 text-yellow-200 text-xs list-disc list-inside">
          <li>PSL remains INACTIVE — this check does not change that</li>
          <li>Fixture readiness ≠ fixture import · Fixture import ≠ fixture publication · Fixture publication ≠ PSL activation</li>
          <li>No writes, no scheduler, no production ingestion, no real-money functionality</li>
        </ul>
      </div>

      <button
        onClick={checkReadiness}
        disabled={loading}
        className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 px-5 py-2 rounded font-medium text-sm mb-6"
      >
        {loading ? 'Checking…' : 'Check Readiness'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-sm text-red-300">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded font-mono text-sm font-semibold ${STATUS_COLOURS[data.readinessStatus]}`}>
              {data.readinessStatus}
            </span>
            <span className="text-gray-400 text-sm">
              Competition: {data.competition} · Season: {data.season}
            </span>
          </div>

          {/* Provider rows */}
          <section>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Provider Status</h2>
            <div className="space-y-3">
              <ProviderRow
                name="Parse PSL (psl.co.za)"
                configured={data.parsePsl.configured}
                status={data.parsePsl.status}
                detail={`candidates: ${data.parsePsl.candidateFixtureCount} · checked: ${new Date(data.parsePsl.lastCheckedAt).toLocaleTimeString()}`}
              />
              <ProviderRow
                name={`API-Football (league ${data.apiFootball.leagueId})`}
                configured={data.apiFootball.configured}
                status={data.apiFootball.status}
                detail={data.apiFootball.candidateFixtureCount !== undefined ? `candidates: ${data.apiFootball.candidateFixtureCount}` : ''}
              />
            </div>
          </section>

          {/* Owner actions */}
          <section>
            <h2 className="text-sm font-semibold text-gray-300 mb-2">Owner Actions</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
              {data.ownerActions.map((a, i) => <li key={i}>{a}</li>)}
            </ol>
          </section>

          {/* Forbidden actions */}
          <section>
            <h2 className="text-sm font-semibold text-red-400 mb-2">Forbidden Actions</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-300">
              {data.forbiddenActions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </section>

          {/* Safety flags */}
          <section className="bg-green-900/20 border border-green-800 rounded p-4">
            <h2 className="text-sm font-semibold text-green-400 mb-2">Safety Flags (all must be true)</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(Object.entries(data.safety) as [string, boolean][]).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className={v ? 'text-green-400' : 'text-red-400'}>{v ? '✓' : '✗'}</span>
                  <span className="text-gray-300 font-mono">{k}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function ProviderRow({ name, configured, status, detail }: {
  name: string;
  configured: boolean;
  status: ProviderStatus;
  detail: string;
}) {
  const statusColour =
    status === 'OK' ? 'text-green-400' :
    status === 'SOURCE_EMPTY' ? 'text-blue-400' :
    status === 'NOT_CONFIGURED' ? 'text-gray-500' :
    status === 'NOT_CHECKED' ? 'text-gray-500' :
    'text-red-400';

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-900 rounded">
      <span className={configured ? 'text-green-500 mt-0.5' : 'text-gray-600 mt-0.5'}>●</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200">{name}</p>
        <p className={`text-xs font-mono mt-0.5 ${statusColour}`}>{status}</p>
        {detail && <p className="text-xs text-gray-500 mt-0.5">{detail}</p>}
      </div>
      <span className="text-xs text-gray-600">{configured ? 'configured' : 'not configured'}</span>
    </div>
  );
}
