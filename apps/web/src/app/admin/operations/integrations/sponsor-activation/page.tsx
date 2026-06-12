'use client';

import { useEffect, useState } from 'react';
import { getSponsorActivationReadiness } from '@/lib/admin-operations-client';
import Link from 'next/link';

export default function SponsorActivationPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSponsorActivationReadiness()
      .then((d) => setData(d as Record<string, unknown>))
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/operations/integrations" className="hover:underline">Integrations</Link> / Sponsor Activation
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Sponsor Activation Readiness</h1>
      </div>

      <div className={`border rounded-lg p-4 text-center ${data.productionActivationStatus === 'PRODUCTION_DISABLED' ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'}`}>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Production Activation Status</p>
        <p className="mt-1 text-lg font-bold text-orange-700">{String(data.productionActivationStatus)}</p>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(data).map(([k, v]) => (
              <tr key={k} className="border-t border-gray-100 first:border-t-0">
                <td className="py-2.5 px-4 text-xs text-gray-500 font-medium w-1/2">{k}</td>
                <td className="py-2.5 px-4 text-xs text-gray-700">{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
