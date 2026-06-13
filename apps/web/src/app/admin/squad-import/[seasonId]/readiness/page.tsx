'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { getImportReadiness } from '@/lib/squad-import-client';

interface Check {
  code: string;
  severity: string;
  passed: boolean;
  message: string;
}

interface Readiness {
  seasonId: string;
  seasonName: string;
  readinessStatus: string;
  checks: Check[];
  blockerCount: number;
  warningCount: number;
}

const STATUS_COLOURS: Record<string, string> = {
  READY: 'bg-green-100 text-green-700',
  READY_WITH_WARNINGS: 'bg-yellow-100 text-yellow-700',
  BLOCKED: 'bg-red-100 text-red-700',
};

export default function SquadImportReadinessPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [data, setData] = useState<Readiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getImportReadiness(seasonId)
      .then(setData)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/squad-import/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Season Overview</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Squad Import Readiness</h1>
      {data && <p className="text-gray-500 mb-6">{data.seasonName}</p>}

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      {data && (
        <>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold mb-6 ${STATUS_COLOURS[data.readinessStatus] ?? 'bg-gray-100 text-gray-700'}`}>
            {data.readinessStatus}
            {data.blockerCount > 0 && <span>· {data.blockerCount} blocker{data.blockerCount !== 1 ? 's' : ''}</span>}
            {data.warningCount > 0 && <span>· {data.warningCount} warning{data.warningCount !== 1 ? 's' : ''}</span>}
          </div>

          <div className="space-y-3">
            {data.checks.map(c => (
              <div key={c.code} className={`border rounded-lg p-4 ${c.passed ? 'border-green-200 bg-green-50' : c.severity === 'BLOCKER' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">{c.passed ? '✓' : c.severity === 'BLOCKER' ? '✗' : '⚠'}</span>
                  <div>
                    <span className="font-medium text-sm">{c.code}</span>
                    <p className="text-sm mt-1 text-gray-700">{c.message}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded ${c.severity === 'BLOCKER' ? 'bg-red-100 text-red-700' : c.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
