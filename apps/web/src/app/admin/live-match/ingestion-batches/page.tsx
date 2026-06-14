'use client';

import { useEffect, useState } from 'react';
import { adminGetIngestionLog } from '@/lib/admin-match-centre-client';
import { adminIngestSandboxData } from '@/lib/admin-match-centre-client';

interface IngestionLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  sourceType: string;
  rawPayloadSize?: number;
  status: string;
  createdAt: string;
  errorMessage?: string | null;
}

export default function AdminLiveMatchIngestionBatchesPage() {
  const [log, setLog] = useState<IngestionLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ entityType: string; limit: number }>({ entityType: '', limit: 50 });
  const [sandboxJson, setSandboxJson] = useState('');
  const [ingestMsg, setIngestMsg] = useState<string | null>(null);

  function load() {
    setLoading(true);
    (adminGetIngestionLog({ ...(filter.entityType ? { entityType: filter.entityType } : {}), limit: filter.limit }) as Promise<IngestionLogEntry[]>)
      .then(setLog)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [filter]);

  async function triggerSandboxIngest(e: React.FormEvent) {
    e.preventDefault();
    setIngestMsg(null);
    try {
      const payload = JSON.parse(sandboxJson) as unknown;
      await adminIngestSandboxData(payload);
      setIngestMsg('Ingestion triggered successfully.');
      load();
    } catch (err) {
      setIngestMsg(`Failed: ${String(err)}`);
    }
  }

  const statusColor: Record<string, string> = {
    SUCCESS: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    PARTIAL: 'bg-yellow-100 text-yellow-700',
    PENDING: 'bg-blue-100 text-blue-700',
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <a href="/admin/live-match" className="text-xs text-blue-600 underline mb-4 inline-block">← Live Match Operations</a>
      <h1 className="text-2xl font-bold mb-6">Ingestion Batches</h1>

      <section className="bg-gray-50 rounded-xl p-4 mb-6">
        <h2 className="text-sm font-semibold mb-2">Sandbox Ingest (Manual)</h2>
        <p className="text-xs text-gray-500 mb-3">Paste a match data payload (JSON) to trigger sandbox ingestion. No real provider is called.</p>
        <form onSubmit={triggerSandboxIngest} className="space-y-2">
          <textarea value={sandboxJson} onChange={e => setSandboxJson(e.target.value)}
            className="w-full border rounded px-2 py-1.5 text-xs font-mono h-24" placeholder='{"fixtureId": "...", "type": "MATCH_EVENT", ...}' />
          <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">Trigger Ingest</button>
        </form>
        {ingestMsg && <p className={`text-xs mt-2 ${ingestMsg.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>{ingestMsg}</p>}
      </section>

      <div className="flex gap-3 mb-4 items-center">
        <select value={filter.entityType} onChange={e => setFilter(f => ({ ...f, entityType: e.target.value }))}
          className="border rounded px-2 py-1 text-xs">
          <option value="">All Types</option>
          <option value="FIXTURE">Fixture</option>
          <option value="LINEUP">Lineup</option>
          <option value="MATCH_EVENT">Match Event</option>
          <option value="PLAYER_RATING">Player Rating</option>
          <option value="STANDING">Standing</option>
        </select>
        <select value={filter.limit} onChange={e => setFilter(f => ({ ...f, limit: Number(e.target.value) }))}
          className="border rounded px-2 py-1 text-xs">
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <button onClick={load} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">Refresh</button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      <div className="space-y-2">
        {log.map(entry => (
          <div key={entry.id} className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold">{entry.entityType}</span>
                <span className="text-xs text-gray-400 ml-2">{entry.entityId}</span>
                <span className="text-xs text-gray-400 ml-2">· {entry.sourceType}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[entry.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {entry.status}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(entry.createdAt).toLocaleString()}
              {entry.rawPayloadSize !== undefined && <span className="ml-2">{entry.rawPayloadSize} bytes</span>}
            </div>
            {entry.errorMessage && <div className="text-xs text-red-600 mt-1">{entry.errorMessage}</div>}
          </div>
        ))}
        {!loading && log.length === 0 && <p className="text-gray-400 text-sm">No ingestion log entries found.</p>}
      </div>
    </main>
  );
}
