'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetFrontendReadiness } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminFrontendReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetFrontendReadiness(seasonId).then(d => setData(d as Record<string, unknown>)).catch(e => setError(String(e)));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Frontend Beta Readiness</h1>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {data && (
        <div className="space-y-4">
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">{String(data['notice'] ?? '')}</p>
          <div className="bg-white border rounded p-4">
            <p className="text-sm font-medium mb-2">Domain Coverage</p>
            {(data['domains'] as Array<{ domain: string; adminPages: string[]; fanPages: string[]; status: string }> ?? []).map(d => (
              <div key={d.domain} className="border-b last:border-0 py-2">
                <p className="font-medium text-sm">{d.domain} <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${d.status === 'READY' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{d.status}</span></p>
                <p className="text-xs text-gray-500 mt-1">{d.adminPages.length} admin · {d.fanPages.length} fan pages</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
