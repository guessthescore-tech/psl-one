'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetSecurityReadiness } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminSecurityReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetSecurityReadiness(seasonId).then(d => setData(d as Record<string, unknown>)).catch(e => setError(String(e)));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Security &amp; RBAC Readiness</h1>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {data && (
        <div className="space-y-4">
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">{String(data['notice'] ?? '')}</p>
          <div className="bg-white border rounded p-4 space-y-3">
            {(data['checks'] as Array<{ label: string; status: string; detail: string }> ?? []).map((c, i) => (
              <div key={i} className="border-b last:border-0 pb-2 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.detail}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-mono flex-shrink-0 ${c.status === 'PASS' ? 'bg-green-100 text-green-800' : c.status === 'WARN' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
