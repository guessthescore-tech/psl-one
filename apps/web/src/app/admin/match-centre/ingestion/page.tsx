'use client';

import { useEffect, useState } from 'react';
import { adminGetIngestionLog, adminGetCapabilityStatus } from '@/lib/admin-match-centre-client';

interface LogEntry {
  id: string;
  entityType: string;
  entityId: string;
  sourceType: string;
  dataStatus: string;
  operatorUserId?: string;
  notes?: string;
  ingestedAt: string;
}

export default function AdminIngestionPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [capability, setCapability] = useState<Record<string, unknown> | null>(null);
  const [entityType, setEntityType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadLogs() {
    setLoading(true);
    try {
      const d = await adminGetIngestionLog({ ...(entityType ? { entityType } : {}), limit: 50 }) as LogEntry[];
      setLogs(Array.isArray(d) ? d : []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    adminGetCapabilityStatus().then(d => setCapability(d as Record<string, unknown>)).catch(() => null);
    loadLogs();
  }, []);

  const srcColour: Record<string, string> = {
    MANUAL: 'text-gray-600 bg-gray-100',
    SEEDED: 'text-blue-600 bg-blue-50',
    SANDBOX_PROVIDER: 'text-yellow-700 bg-yellow-50',
    OFFICIAL_PROVIDER: 'text-green-700 bg-green-50',
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Data Ingestion Log</h1>

      {capability && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {(['richUI', 'sandboxIngestion', 'productionIngestion', 'officialProviderFeed'] as const).map(k => (
            <span key={k} className={`text-xs px-2 py-0.5 rounded font-medium ${
              String(capability[k]) === 'ENABLED' ? 'bg-green-50 text-green-700' :
              String(capability[k]) === 'DISABLED' ? 'bg-red-50 text-red-500' :
              'bg-yellow-50 text-yellow-700'
            }`}>
              {k}: {String(capability[k])}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-5">
        <select className="border rounded px-2 py-1.5 text-sm" value={entityType} onChange={e => setEntityType(e.target.value)}>
          <option value="">All types</option>
          {['LINEUP', 'MATCH_EVENT', 'PLAYER_RATING', 'STANDING', 'TEAM_FORM'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm" onClick={loadLogs}>Filter</button>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Entity Type</th>
              <th className="px-3 py-2 text-left">Entity ID</th>
              <th className="px-3 py-2 text-left">Source</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Ingested At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs">{l.entityType}</td>
                <td className="px-3 py-2 text-xs text-gray-500 truncate max-w-[140px]">{l.entityId}</td>
                <td className="px-3 py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${srcColour[l.sourceType] ?? 'bg-gray-100 text-gray-500'}`}>
                    {l.sourceType}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">{l.dataStatus}</td>
                <td className="px-3 py-2 text-xs text-gray-400">{new Date(l.ingestedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && logs.length === 0 && (
          <p className="text-gray-400 text-sm p-4">No ingestion logs.</p>
        )}
      </div>
    </main>
  );
}
