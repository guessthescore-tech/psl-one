'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetWarnings } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminWarningsPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<{ warnings: unknown[]; count: number; notice: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetWarnings(seasonId).then(d => setData(d as typeof data)).catch(e => setError(String(e)));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Readiness Warnings</h1>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">{data.notice}</p>

          {data.count === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm">No warnings</div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-amber-700">{data.count} warning{data.count !== 1 ? 's' : ''} — review before inviting beta cohort</p>
              {(data.warnings as Array<{ key: string; label: string; message: string; adminRoute?: string }>).map(w => (
                <div key={w.key} className="border border-amber-200 rounded p-3 bg-amber-50">
                  <p className="font-medium text-sm text-amber-800">{w.label}</p>
                  <p className="text-xs text-amber-700 mt-1">{w.message}</p>
                  {w.adminRoute && (
                    <Link href={w.adminRoute} className="text-xs text-blue-600 hover:underline mt-1 inline-block">{w.adminRoute}</Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
