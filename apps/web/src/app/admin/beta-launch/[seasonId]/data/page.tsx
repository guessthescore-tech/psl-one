'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetDataReadiness } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminDataReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetDataReadiness(seasonId).then(d => setData(d as Record<string, unknown>)).catch(e => setError(String(e)));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Data Readiness</h1>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {data && (
        <div className="space-y-4">
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">{String(data['notice'] ?? '')}</p>
          <div className="bg-white border rounded p-4 space-y-3">
            {Object.entries(data).filter(([k]) => k !== 'notice').map(([k, v]) => (
              <div key={k} className="border-b last:border-0 pb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-sm mt-0.5">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
