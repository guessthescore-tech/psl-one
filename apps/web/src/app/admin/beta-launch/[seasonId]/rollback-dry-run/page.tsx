'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminRunRollbackDryRun } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminRollbackDryRunPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await adminRunRollbackDryRun(seasonId);
      setData(result as Record<string, unknown>);
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Rollback Dry Run</h1>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded p-4 text-sm text-amber-800">
        Rollback dry run is <strong>read-only</strong>. This analysis does not roll back anything. World Cup history is preserved regardless.
      </div>

      <button
        onClick={run}
        disabled={running}
        className="bg-orange-600 text-white text-sm px-5 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
      >
        {running ? 'Running…' : 'Run Rollback Dry Run'}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-3">
          <div className="flex gap-4 text-sm flex-wrap">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono">rollbackWillNotBePerformed: {String(data['rollbackWillNotBePerformed'])}</span>
            {data['worldCupHistoryPreserved'] !== undefined && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono">worldCupHistoryPreserved: {String(data['worldCupHistoryPreserved'])}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-mono">{String(data['notice'] ?? '')}</p>
          <div className="bg-white border rounded divide-y">
            {Object.entries(data).filter(([k]) => !['rollbackWillNotBePerformed', 'worldCupHistoryPreserved', 'notice'].includes(k)).map(([k, v]) => (
              <div key={k} className="p-3">
                <p className="text-xs font-medium text-gray-500 uppercase">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-sm mt-0.5">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
