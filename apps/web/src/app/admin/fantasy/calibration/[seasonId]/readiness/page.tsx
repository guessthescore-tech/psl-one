'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getReadinessDetail } from '@/lib/fantasy-calibration-client';
import Link from 'next/link';

interface Check {
  code: string;
  severity: string;
  message: string;
  detail?: string;
}

interface Readiness {
  seasonId: string;
  seasonName: string;
  status: string;
  blockers: Check[];
  warnings: Check[];
  info: Check[];
}

function CheckList({ checks, colourClass }: { checks: Check[]; colourClass: string }) {
  if (checks.length === 0) return null;
  return (
    <div className="space-y-2">
      {checks.map((c) => (
        <div key={c.code} className={`border rounded p-3 text-sm ${colourClass}`}>
          <p className="font-medium">{c.message}</p>
          {c.detail && <p className="mt-1 text-xs opacity-80">{c.detail}</p>}
          <p className="mt-1 text-xs font-mono opacity-60">{c.code}</p>
        </div>
      ))}
    </div>
  );
}

export default function ReadinessDetailPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<Readiness | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getReadinessDetail(seasonId)
      .then((d) => setData(d as Readiness))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <Link href={`/admin/fantasy/calibration/${seasonId}`} className="text-sm text-blue-600 hover:underline">
          ← {data.seasonName}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Readiness Detail</h1>
        <p className="text-sm text-gray-500 mt-1">
          Status: <strong>{data.status.replace(/_/g, ' ')}</strong>
        </p>
      </div>

      {data.blockers.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-red-700 mb-2">Blockers ({data.blockers.length})</h2>
          <CheckList checks={data.blockers} colourClass="bg-red-50 border-red-200 text-red-800" />
        </div>
      )}

      {data.warnings.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-yellow-700 mb-2">Warnings ({data.warnings.length})</h2>
          <CheckList checks={data.warnings} colourClass="bg-yellow-50 border-yellow-200 text-yellow-800" />
        </div>
      )}

      {data.info.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-600 mb-2">Info ({data.info.length})</h2>
          <CheckList checks={data.info} colourClass="bg-gray-50 border-gray-200 text-gray-700" />
        </div>
      )}

      {data.blockers.length === 0 && data.warnings.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm font-medium">
          All checks passed. Season is ready for fantasy activation.
        </div>
      )}
    </div>
  );
}
