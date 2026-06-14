'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminRunDryRun } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminDryRunPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await adminRunDryRun(seasonId);
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
        <h1 className="text-2xl font-bold">Activation Dry Run</h1>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded p-4 text-sm text-amber-800">
        Dry run is <strong>read-only</strong>. Running this analysis does not activate the season, change any records, or trigger any events.
      </div>

      <button
        onClick={run}
        disabled={running}
        className="bg-blue-600 text-white text-sm px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {running ? 'Running…' : 'Run Dry Run Analysis'}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-3">
          <div className="flex gap-4 text-sm">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono">dryRunOnly: {String(data['dryRunOnly'])}</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono">activationWillNotBePerformed: {String(data['activationWillNotBePerformed'])}</span>
          </div>
          <p className="text-xs text-gray-500 font-mono">{String(data['notice'] ?? '')}</p>
          <div className="bg-white border rounded divide-y">
            {Object.entries(data).filter(([k]) => !['dryRunOnly', 'activationWillNotBePerformed', 'notice'].includes(k)).map(([k, v]) => (
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
