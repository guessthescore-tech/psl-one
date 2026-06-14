'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetActivationPreview } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminActivationPreviewPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetActivationPreview(seasonId).then(d => setData(d as Record<string, unknown>)).catch(e => setError(String(e)));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Activation Preview</h1>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded p-4 text-sm text-amber-800">
        This is a read-only preview. Activation has NOT been performed and will NOT be performed by viewing this page.
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          <p className="text-xs font-mono bg-gray-100 rounded p-2">{String(data['notice'] ?? '')}</p>
          <div className="bg-white border rounded divide-y">
            {Object.entries(data).filter(([k]) => k !== 'notice').map(([k, v]) => (
              <div key={k} className="p-3">
                <p className="text-xs font-medium text-gray-500 uppercase">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-sm mt-0.5 font-mono">{typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
