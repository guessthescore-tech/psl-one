'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetReadiness } from '@/lib/beta-launch-client';
import Link from 'next/link';

interface ReadinessCheck {
  key: string;
  category: string;
  label: string;
  status: string;
  isBlocker: boolean;
  message: string;
  adminRoute?: string;
}

export default function AdminReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<{ checks: ReadinessCheck[]; overallStatus: string; blockerCount: number; warningCount: number; notice: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetReadiness(seasonId).then(d => setData(d as typeof data)).catch(e => setError(String(e)));
  }, [seasonId]);

  const chipColour = (s: string) =>
    s === 'PASS' ? 'bg-green-100 text-green-800' :
    s === 'WARN' ? 'bg-amber-100 text-amber-800' :
    'bg-red-100 text-red-800';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">13-Check Readiness Gate</h1>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">{data.notice}</p>

          <div className="text-sm font-medium">{data.overallStatus} — {data.blockerCount} blockers · {data.warningCount} warnings</div>

          <div className="space-y-2">
            {data.checks.map(c => (
              <div key={c.key} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{c.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono ${chipColour(c.status)}`}>{c.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{c.category}</p>
                <p className="text-xs mt-1">{c.message}</p>
                {c.adminRoute && (
                  <Link href={c.adminRoute} className="text-xs text-blue-600 hover:underline mt-1 inline-block">{c.adminRoute}</Link>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
