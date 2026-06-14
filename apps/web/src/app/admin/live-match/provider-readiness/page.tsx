'use client';

import { useEffect, useState } from 'react';
import { adminGetCapabilityStatus } from '@/lib/admin-match-centre-client';

interface CapabilityStatus {
  provider?: string;
  connected?: boolean;
  stubMode?: boolean;
  capabilities?: Record<string, boolean>;
  lastSync?: string | null;
  dataFreshness?: string | null;
  errors?: string[];
}

export default function AdminLiveMatchProviderReadinessPage() {
  const [status, setStatus] = useState<CapabilityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    (adminGetCapabilityStatus() as Promise<CapabilityStatus>)
      .then(setStatus)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const capabilities = Object.entries(status?.capabilities ?? {});
  const available = capabilities.filter(([, v]) => v).length;
  const unavailable = capabilities.filter(([, v]) => !v).length;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <a href="/admin/live-match" className="text-xs text-blue-600 underline mb-4 inline-block">← Live Match Operations</a>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Provider Readiness</h1>
        <button onClick={load} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">Refresh</button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {status && (
        <div className="space-y-4">
          <div className="border rounded-xl p-4 bg-white">
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-400'}`} />
              <div>
                <div className="font-semibold">{status.provider ?? 'Unknown Provider'}</div>
                <div className="text-xs text-gray-500">{status.connected ? 'Connected' : 'Disconnected'}</div>
              </div>
              {status.stubMode && (
                <span className="ml-auto text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                  STUB / SANDBOX MODE
                </span>
              )}
            </div>
            {status.stubMode && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                No live sports data provider is connected. All match data must be entered manually.
                This is expected during beta.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-xl p-3 text-center bg-white">
              <div className="text-2xl font-bold text-green-600">{available}</div>
              <div className="text-xs text-gray-500">Capabilities Available</div>
            </div>
            <div className="border rounded-xl p-3 text-center bg-white">
              <div className="text-2xl font-bold text-red-500">{unavailable}</div>
              <div className="text-xs text-gray-500">Not Available</div>
            </div>
          </div>

          {capabilities.length > 0 && (
            <div className="border rounded-xl p-4 bg-white">
              <h2 className="text-sm font-semibold mb-3">Capabilities</h2>
              <div className="grid grid-cols-2 gap-2">
                {capabilities.map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className={val ? 'text-green-500' : 'text-gray-300'}>●</span>
                    <span className={val ? 'text-gray-700' : 'text-gray-400'}>
                      {key.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status.lastSync && (
            <div className="border rounded-xl p-4 bg-white">
              <h2 className="text-sm font-semibold mb-2">Last Sync</h2>
              <p className="text-xs text-gray-600">{new Date(status.lastSync).toLocaleString()}</p>
              {status.dataFreshness && <p className="text-xs text-gray-400 mt-1">Freshness: {status.dataFreshness}</p>}
            </div>
          )}

          {status.errors && status.errors.length > 0 && (
            <div className="border border-red-200 rounded-xl p-4 bg-red-50">
              <h2 className="text-sm font-semibold text-red-700 mb-2">Errors</h2>
              <ul className="space-y-1">
                {status.errors.map((e, i) => (
                  <li key={i} className="text-xs text-red-600">{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
